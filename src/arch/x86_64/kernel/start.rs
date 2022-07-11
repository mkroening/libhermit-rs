use core::arch::asm;

use hermit_entry::RawBootInfo;

use crate::{
	kernel::{pre_init, scheduler::TaskStacks},
	KERNEL_STACK_SIZE,
};

#[no_mangle]
#[naked]
pub extern "C" fn _start(_boot_info: *const RawBootInfo) -> ! {
	// boot_info is in the `rdi` register

	// validate signature
	const _F: unsafe fn(*const RawBootInfo) -> ! = pre_init;

	unsafe {
		asm!(
			// while MAY_ENTER.compare_exchange(true, false, Ordering::Acquire, Ordering::Relaxed).is_err() {
		    //   hint::spin_loop();
	        // }
			"xor ecx, ecx",
			"mov al, 1",
			"lock cmpxchg byte ptr [rip + {may_enter}], cl",
			"je 3f",
			"xor ecx, ecx",
			"2:",
			"pause",
			"mov al, 1",
			"lock cmpxchg byte ptr [rip + {may_enter}], cl",
			"jne 2b",
			"3:",
			// initialize stack pointer
			"mov rsp, [rdi + {current_stack_address_offset}]",
			"add rsp, {stack_top_offset}",
			"mov rbp, rsp",
			"call {pre_init}",
			may_enter = sym super::MAY_ENTER,
			current_stack_address_offset = const RawBootInfo::current_stack_address_offset(),
			stack_top_offset = const KERNEL_STACK_SIZE - TaskStacks::MARKER_SIZE,
			pre_init = sym pre_init,
			options(noreturn)
		)
	}
}
