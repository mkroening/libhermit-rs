use core::arch::asm;

use hermit_entry::RawBootInfo;

use crate::{
	kernel::{pre_init, scheduler::TaskStacks},
	KERNEL_STACK_SIZE,
};

#[no_mangle]
#[naked]
pub extern "C" fn _start(_boot_info: *const RawBootInfo, cpu_id: u32) -> ! {
	// boot_info is in the `rdi` register

	// validate signature
	const _F: unsafe fn(*const RawBootInfo) -> ! = pre_init;

	unsafe {
		asm!(
			// use core::sync::atomic::{AtomicU32, Ordering};
			//
			// pub static CPU_ONLINE: AtomicU32 = AtomicU32::new(0);
			//
			// while CPU_ONLINE.load(Ordering::Acquire) != this {
			//     core::hint::spin_loop();
			// }
			"mov rax, qword ptr [rip + {cpu_online}@GOTPCREL]",
			"2:",
			"mov ecx, dword ptr [rax]",
			"cmp ecx, esi",
			"je 3f",
			"pause",
			"jmp 2b",
			"3:",
			// initialize stack pointer
			"mov rsp, [rdi + {current_stack_address_offset}]",
			"add rsp, {stack_top_offset}",
			"mov rbp, rsp",
			"call {pre_init}",
			cpu_online = sym super::CPU_ONLINE,
			current_stack_address_offset = const RawBootInfo::current_stack_address_offset(),
			stack_top_offset = const KERNEL_STACK_SIZE - TaskStacks::MARKER_SIZE,
			pre_init = sym pre_init,
			options(noreturn)
		)
	}
}
