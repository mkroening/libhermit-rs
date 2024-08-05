use alloc::boxed::Box;
use alloc::vec::Vec;
use core::future;
use core::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use core::task::Poll;

use async_trait::async_trait;
use endian_num::{le16, le32, le64};
use virtio::vsock::{Hdr, Op, Type};

#[cfg(not(feature = "pci"))]
use crate::arch::kernel::mmio as hardware;
#[cfg(feature = "pci")]
use crate::drivers::pci as hardware;
use crate::executor::vsock::{VsockState, VSOCK_MAP};
use crate::fd::{block_on, Endpoint, IoCtl, ListenEndpoint, ObjectInterface};
use crate::io::{self, Error};

#[derive(Debug)]
pub(crate) struct VsockListenEndpoint {
	pub port: u32,
	pub cid: Option<u32>,
}

impl VsockListenEndpoint {
	pub const fn new(port: u32, cid: Option<u32>) -> Self {
		Self { port, cid }
	}
}

#[derive(Debug)]
pub(crate) struct VsockEndpoint {
	pub port: u32,
	pub cid: u32,
}

impl VsockEndpoint {
	pub const fn new(port: u32, cid: u32) -> Self {
		Self { port, cid }
	}
}

#[derive(Debug)]
pub struct Socket {
	port: AtomicU32,
	cid: AtomicU32,
	nonblocking: AtomicBool,
}

impl Socket {
	pub fn new() -> Self {
		Self {
			port: AtomicU32::new(0),
			cid: AtomicU32::new(u32::MAX),
			nonblocking: AtomicBool::new(false),
		}
	}
}

#[async_trait]
impl ObjectInterface for Socket {
	fn bind(&self, endpoint: ListenEndpoint) -> io::Result<()> {
		match endpoint {
			ListenEndpoint::Vsock(ep) => {
				self.port.store(ep.port, Ordering::Release);
				if let Some(cid) = ep.cid {
					self.cid.store(cid, Ordering::Release);
				} else {
					self.cid.store(u32::MAX, Ordering::Release);
				}
				VSOCK_MAP.lock().bind(ep.port)
			}
			#[cfg(any(feature = "tcp", feature = "udp"))]
			_ => Err(io::Error::EINVAL),
		}
	}

	fn is_nonblocking(&self) -> bool {
		self.nonblocking.load(Ordering::Acquire)
	}

	fn listen(&self, _backlog: i32) -> io::Result<()> {
		Ok(())
	}

	fn accept(&self) -> io::Result<Endpoint> {
		let port = self.port.load(Ordering::Acquire);
		let cid = self.cid.load(Ordering::Acquire);

		let endpoint = block_on(
			async {
				future::poll_fn(|cx| {
					let mut guard = VSOCK_MAP.lock();
					let raw = guard.get_mut_socket(port).ok_or(Error::EINVAL)?;

					match raw.state {
						VsockState::Listen => {
							raw.waker.register(cx.waker());
							Poll::Pending
						}
						VsockState::ReceiveRequest => {
							let result = {
								const HEADER_SIZE: usize = core::mem::size_of::<Hdr>();
								let mut driver_guard = hardware::get_vsock_driver().unwrap().lock();
								let local_cid = driver_guard.get_cid();

								driver_guard.send_packet(HEADER_SIZE, |buffer| {
									let response =
										unsafe { &mut *(buffer.as_mut_ptr() as *mut Hdr) };

									response.src_cid = le64::from_ne(local_cid);
									response.dst_cid = le64::from_ne(raw.remote_cid as u64);
									response.src_port = le32::from_ne(port);
									response.dst_port = le32::from_ne(raw.remote_port);
									response.len = le32::from_ne(0);
									response.type_ = le16::from_ne(Type::Stream.into());
									if local_cid != cid.into() && cid != u32::MAX {
										response.op = le16::from_ne(Op::Rst.into())
									} else {
										response.op = le16::from_ne(Op::Response.into());
									}
									response.flags = le32::from_ne(0);
									response.buf_alloc = le32::from_ne(
										crate::executor::vsock::RAW_SOCKET_BUFFER_SIZE as u32,
									);
									response.fwd_cnt = le32::from_ne(0);
								});

								raw.state = VsockState::Connected;

								Ok(VsockEndpoint::new(raw.remote_port, raw.remote_cid))
							};

							Poll::Ready(result)
						}
						_ => Poll::Ready(Err(Error::EBADF)),
					}
				})
				.await
			},
			None,
		)?;

		Ok(Endpoint::Vsock(endpoint))
	}

	fn ioctl(&self, cmd: IoCtl, value: bool) -> io::Result<()> {
		if cmd == IoCtl::NonBlocking {
			if value {
				trace!("set vsock device to nonblocking mode");
				self.nonblocking.store(true, Ordering::Release);
			} else {
				trace!("set vsock device to blocking mode");
				self.nonblocking.store(false, Ordering::Release);
			}

			Ok(())
		} else {
			Err(io::Error::EINVAL)
		}
	}

	// TODO: Remove allow once fixed:
	// https://github.com/rust-lang/rust-clippy/issues/11380
	#[allow(clippy::needless_pass_by_ref_mut)]
	async fn async_read(&self, buffer: &mut [u8]) -> io::Result<usize> {
		let port = self.port.load(Ordering::Acquire);
		future::poll_fn(|cx| {
			let mut guard = VSOCK_MAP.lock();
			let raw = guard.get_mut_socket(port).ok_or(Error::EINVAL)?;

			match raw.state {
				VsockState::Connected => {
					let len = core::cmp::min(buffer.len(), raw.buffer.len());

					if len == 0 {
						raw.waker.register(cx.waker());
						Poll::Pending
					} else {
						let tmp: Vec<_> = raw.buffer.drain(..len).collect();
						buffer[..len].copy_from_slice(tmp.as_slice());

						Poll::Ready(Ok(len))
					}
				}
				_ => Poll::Ready(Err(Error::EIO)),
			}
		})
		.await
	}

	async fn async_write(&self, buffer: &[u8]) -> io::Result<usize> {
		let port = self.port.load(Ordering::Acquire);
		let guard = VSOCK_MAP.lock();
		let raw = guard.get_socket(port).ok_or(Error::EINVAL)?;

		match raw.state {
			VsockState::Connected => {
				const HEADER_SIZE: usize = core::mem::size_of::<Hdr>();
				let mut driver_guard = hardware::get_vsock_driver().unwrap().lock();
				let local_cid = driver_guard.get_cid();

				driver_guard.send_packet(HEADER_SIZE + buffer.len(), |virtio_buffer| {
					let response = unsafe { &mut *(virtio_buffer.as_mut_ptr() as *mut Hdr) };

					response.src_cid = le64::from_ne(local_cid);
					response.dst_cid = le64::from_ne(raw.remote_cid as u64);
					response.src_port = le32::from_ne(port);
					response.dst_port = le32::from_ne(raw.remote_port);
					response.len = le32::from_ne(buffer.len().try_into().unwrap());
					response.type_ = le16::from_ne(Type::Stream.into());
					response.op = le16::from_ne(Op::Rw.into());
					response.flags = le32::from_ne(0);
					response.buf_alloc =
						le32::from_ne(crate::executor::vsock::RAW_SOCKET_BUFFER_SIZE as u32);
					response.fwd_cnt = le32::from_ne(0);

					virtio_buffer[HEADER_SIZE..].copy_from_slice(buffer);
				});

				Ok(buffer.len())
			}
			_ => Err(Error::EIO),
		}
	}
}

impl Clone for Socket {
	fn clone(&self) -> Self {
		Self {
			port: AtomicU32::new(self.port.load(Ordering::Acquire)),
			cid: AtomicU32::new(self.cid.load(Ordering::Acquire)),
			nonblocking: AtomicBool::new(self.nonblocking.load(Ordering::Acquire)),
		}
	}
}
