use alloc::vec::Vec;
use core::arch::asm;
use core::cell::RefMut;

use crate::arch::riscv64::kernel::BOOT_INFO;
use crate::executor::task::AsyncTask;
use crate::scheduler::{CoreId, PerCoreScheduler};

#[no_mangle]
pub static mut CORE_LOCAL: CoreLocal = CoreLocal::new(0);

#[derive(Debug)]
pub struct CoreLocal {
	/// ID of the current Core.
	core_id: CoreLocalVariable,
	/// Scheduler of the current Core.
	scheduler: CoreLocalVariable,
	/// start address of the kernel stack
	pub kernel_stack: CoreLocalVariable,
}

impl CoreLocal {
	pub const fn new(core_id: CoreId) -> Self {
		Self {
			core_id: CoreLocalVariable::new(core_id as usize),
			scheduler: CoreLocalVariable::new(0),
			kernel_stack: CoreLocalVariable::new(0),
		}
	}
}

#[derive(Debug)]
#[repr(C)]
pub struct CoreLocalVariable {
	data: usize,
}

pub trait CoreLocalVariableMethods {
	unsafe fn get(&self) -> usize;
	unsafe fn set(&mut self, value: usize);
}

impl CoreLocalVariable {
	const fn new(value: usize) -> Self {
		Self { data: value }
	}

	#[inline]
	unsafe fn offset(&self) -> usize {
		let base = &CORE_LOCAL as *const _ as usize;
		let field = self as *const _ as usize;
		field - base
	}
}

// Treat all per-core variables as 64-bit variables by default. This is true for u64, usize, pointers.
// Implement the CoreLocalVariableMethods trait functions using 64-bit memory moves.
// The functions are implemented as default functions, which can be overriden in specialized implementations of the trait.
impl CoreLocalVariableMethods for CoreLocalVariable {
	#[inline]
	#[cfg(feature = "smp")]
	default unsafe fn get(&self) -> usize {
		let mut value: usize;
		let mut offset = self.offset();
		asm!(
			"add {offset}, {offset}, gp",
			"ld {value}, 0({offset})",
			value = out(reg) value,
			offset = inout(reg) offset, // This has to be "inout" to work with the "release" profile?
		);
		value
	}

	#[inline]
	#[cfg(not(feature = "smp"))]
	default unsafe fn get(&self) -> usize {
		self.data
	}

	#[inline]
	#[cfg(feature = "smp")]
	default unsafe fn set(&mut self, value: usize) {
		let mut offset = self.offset();
		asm!(
			"add {offset}, {offset}, gp",
			"sd {value}, 0({offset})",
			value = in(reg) value,
			offset = inout(reg) offset, // This has to be "inout" to work with the "release" profile?
		);
	}

	#[inline]
	#[cfg(not(feature = "smp"))]
	default unsafe fn set(&mut self, value: usize) {
		self.data = value;
	}
}

#[inline]
pub fn core_id() -> CoreId {
	unsafe { CORE_LOCAL.core_id.get() as u32 }
}

#[inline]
pub fn core_scheduler() -> &'static mut PerCoreScheduler {
	unsafe { &mut *(CORE_LOCAL.scheduler.get() as *mut PerCoreScheduler) }
}

#[inline]
pub fn set_core_scheduler(scheduler: *mut PerCoreScheduler) {
	unsafe {
		CORE_LOCAL.scheduler.set(scheduler as usize);
	}
}

#[inline(always)]
pub fn get_kernel_stack() -> u64 {
	unsafe { CORE_LOCAL.kernel_stack.get() as u64 }
}

#[inline]
pub fn set_kernel_stack(addr: u64) {
	unsafe { CORE_LOCAL.kernel_stack.set(addr as usize) }
}

pub(crate) fn async_tasks() -> Vec<AsyncTask> {
	#[cfg(feature = "tcp")]
	error!("CoreLocal::async_tasks: TODO");
	vec![]
}

pub fn init() {
	unsafe {
		// Store the address to the CoreLocal structure allocated for this core in gp.
		let mut address = core::ptr::read_volatile(&(*BOOT_INFO).current_percore_address);
		if address == 0 {
			address = &CORE_LOCAL as *const _ as u64;
		}

		asm!(
			"mv gp, {address}",
			address = in(reg) address,
		);

		//println!("core local address: {:x}, {:x?}", address, *(address as *const CoreLocal));
	}
}
