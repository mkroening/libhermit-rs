mod vga_buffer {
	use core::ptr::NonNull;

	#[repr(C)]
	pub struct VgaChar {
		character: u8,
		attribute: u8,
	}

	impl VgaChar {
		pub const fn new(character: u8) -> Self {
			let light_grey = 0x07;
			Self {
				character,
				attribute: light_grey,
			}
		}

		pub const fn empty() -> Self {
			Self {
				character: 0,
				attribute: 0,
			}
		}
	}

	#[repr(transparent)]
	pub struct VgaRow {
		row: [VgaChar; Self::WIDTH],
	}

	impl VgaRow {
		pub const WIDTH: usize = 80;

		pub const fn empty() -> Self {
			const CHAR: VgaChar = VgaChar::empty();
			Self{ row: [CHAR; Self::WIDTH] }
		}
	}

	#[derive(Debug)]
	pub struct VgaBuffer {
		buffer: NonNull<[VgaRow; VgaBuffer::HEIGHT]>,
	}

	unsafe impl Send for VgaBuffer {}
	unsafe impl Sync for VgaBuffer {}

	impl VgaBuffer {
		pub const WIDTH: usize = 80;
		pub const HEIGHT: usize = 25;

		pub unsafe fn new(buffer: NonNull<[VgaRow; Self::HEIGHT]>) -> Self {
			Self { buffer }
		}

		fn row_ptr(&self, i: usize) -> NonNull<VgaRow> {
			unsafe { NonNull::new(&mut (*self.buffer.as_ptr())[i]).unwrap() }
		}

		pub fn read_row(&mut self, i: usize) -> VgaRow {
			unsafe { self.row_ptr(i).as_ptr().read_volatile() }
		}

		pub fn write_row(&mut self, i: usize, row: VgaRow) {
			unsafe {
				self.row_ptr(i).as_ptr().write_volatile(row);
			}
		}

		fn ptr(&self, row: usize, column: usize) -> NonNull<VgaChar> {
			unsafe { NonNull::new(&mut (*self.row_ptr(row).as_ptr()).row[column]).unwrap() }
		}

		pub fn write(&mut self, row: usize, column: usize, vga_char: VgaChar) {
			unsafe {
				self.ptr(row, column).as_ptr().write_volatile(vga_char);
			}
		}

		pub fn read(&mut self, row: usize, column: usize) -> VgaChar {
			unsafe { self.ptr(row, column).as_ptr().read_volatile() }
		}
	}
}

use core::ptr::{NonNull, self};

use hermit_sync::{InterruptOnceCell, InterruptSpinMutex, CallOnce};
use x86_64::instructions::port::Port;

use self::vga_buffer::{VgaBuffer, VgaChar, VgaRow};
use crate::arch::x86_64::mm::paging::{BasePageSize, PageTableEntryFlags, PageTableEntryFlagsExt};
use crate::arch::x86_64::mm::{paging, PhysAddr, VirtAddr};

static VGA_SCREEN: InterruptOnceCell<InterruptSpinMutex<VgaScreen>> = InterruptOnceCell::new();

#[derive(Debug)]
struct VgaScreen {
	buffer: VgaBuffer,
	column: usize,
	row: usize,
}

impl VgaScreen {
	fn new() -> Self {
		static CREATED: CallOnce = CallOnce::new();
		CREATED.call_once().unwrap();

		const VGA_BUFFER_ADDRESS: usize = 0xB8000;
		let ptr = ptr::from_exposed_addr_mut(VGA_BUFFER_ADDRESS);

		// Identity map the VGA buffer. We only need the first page.
		let mut flags = PageTableEntryFlags::empty();
		flags.device().writable().execute_disable();
		paging::map::<BasePageSize>(
			VirtAddr(VGA_BUFFER_ADDRESS.try_into().unwrap()),
			PhysAddr(VGA_BUFFER_ADDRESS.try_into().unwrap()),
			1,
			flags,
		);

		// Disable the cursor.
		unsafe {
			const CRT_CONTROLLER_ADDRESS_PORT: u16 = 0x3D4;
			const CRT_CONTROLLER_DATA_PORT: u16 = 0x3D5;
			const CURSOR_START_REGISTER: u8 = 0x0A;
			const CURSOR_DISABLE: u8 = 0x20;

			Port::new(CRT_CONTROLLER_ADDRESS_PORT).write(CURSOR_START_REGISTER);
			Port::new(CRT_CONTROLLER_DATA_PORT).write(CURSOR_DISABLE);
		}

		Self {
			buffer: unsafe { VgaBuffer::new(NonNull::new(ptr).unwrap()) },
			column: 0,
			row: VgaBuffer::HEIGHT,
		}
	}

	fn write_byte(&mut self, byte: u8) {
		// Move to the next row if we have a newline character or hit the end of a column.
		if byte == b'\n' || self.column == VgaBuffer::WIDTH {
			self.column = 0;
			self.row += 1;
		}

		// Check if we have hit the end of the screen rows.
		if self.row == VgaBuffer::HEIGHT {
			// Shift all rows up by one line, removing the oldest visible screen row.
			for r in 0..VgaBuffer::HEIGHT  - 1 {
				let row = self.buffer.read_row(r + 1);
				self.buffer.write_row(r, row);
			}

			// Clear the last screen row and write to it next time.
			self.buffer.write_row(VgaBuffer::HEIGHT - 1, VgaRow::empty());
			self.row = VgaBuffer::HEIGHT - 1;
		}

		if byte != b'\n' {
			// Put our character into the VGA screen buffer and advance the column counter.
			self.buffer.write(
				self.row,
				self.column,
				VgaChar::new(byte),
			);
			self.column += 1;
		}
	}
}

pub fn init() {
	VGA_SCREEN
		.set(InterruptSpinMutex::new(VgaScreen::new()))
		.unwrap();
}

pub fn write_byte(byte: u8) {
	if let Some(vga_screen) = VGA_SCREEN.get() {
		vga_screen.lock().write_byte(byte);
	}
}
