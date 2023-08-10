use core::arch::asm;
use core::mem;
use core::sync::atomic::Ordering;

use hermit_entry::boot_info::{RawBootInfo, PlatformInfo};

#[cfg(not(feature = "smp"))]
use crate::arch::riscv64::kernel::processor;
use crate::arch::riscv64::kernel::{BootInfo, BOOT_INFO, CURRENT_STACK_ADDRESS};
use crate::KERNEL_STACK_SIZE;

use super::{CPU_ONLINE, CURRENT_BOOT_ID, HART_MASK, RAW_BOOT_INFO};

//static mut BOOT_STACK: [u8; KERNEL_STACK_SIZE] = [0; KERNEL_STACK_SIZE];

/// Entrypoint - Initalize Stack pointer and Exception Table
#[no_mangle]
#[naked]
pub unsafe extern "C" fn _start() -> ! {
	asm!(
		"bnez sp, 2f",
		"3: auipc   a0, %pcrel_hi({ptr})",
		"ld      a0, %pcrel_lo(3b)(a0)",
		"ld      sp, 0(a0)",
		// "ld sp, ({current_stack_address_offset})(a1)",
		"2: li t0, {top_offset}",
		"add sp, sp, t0",
		//"mv a0, a1",
		"j {pre_init}", //call or j?
		//boot_stack = sym BOOT_STACK,
		// current_stack_address_offset = const mem::offset_of!(BootInfo, current_stack_address),
		top_offset = const KERNEL_STACK_SIZE - 16, /*Previous version subtracted 0x10 from End, so I'm doing this too. Not sure why though */
		pre_init = sym pre_init,
		ptr = sym CURRENT_STACK_ADDRESS,
		options(noreturn),
	)
}

#[inline(never)]
#[no_mangle]
unsafe fn pre_init(hart_id: usize, boot_info: &'static mut RawBootInfo) -> ! {
	RAW_BOOT_INFO = boot_info;
	BOOT_INFO = Some(BootInfo::from(*boot_info));

	// info!("Welcome to hermit kernel.");

	CURRENT_BOOT_ID.store(hart_id as u32, Ordering::Relaxed);

	if CPU_ONLINE.load(Ordering::Acquire) == 0 {
		unsafe {
			let hart_mask = match BOOT_INFO.as_ref().unwrap().platform_info {
				PlatformInfo::Riscv64 { hart_mask, .. } => hart_mask,
				PlatformInfo::Uhyve { .. } => todo!(),
				PlatformInfo::LinuxBootParams { .. } => todo!(),
			};
			HART_MASK.store(hart_mask, Ordering::Relaxed);
		}
		crate::boot_processor_main()
	} else {
		#[cfg(not(feature = "smp"))]
		{
			error!("SMP support deactivated");
			loop {
				processor::halt();
			}
		}
		#[cfg(feature = "smp")]
		crate::application_processor_main();
	}
}
