pub mod core_local;
mod devicetree;
pub mod interrupts;
#[cfg(all(feature = "tcp", not(feature = "pci")))]
pub mod mmio;
pub mod pci;
pub mod processor;
mod sbi;
pub mod scheduler;
pub mod serial;
mod start;
pub mod switch;
pub mod systemtime;

use alloc::boxed::Box;
use alloc::vec::Vec;
use core::sync::atomic::{AtomicPtr, AtomicU32, Ordering, AtomicU64};
use core::{fmt, intrinsics, mem, ptr};

use hermit_entry::boot_info::{BootInfo, PlatformInfo, RawBootInfo};
use riscv::register::{fcsr, sstatus};

use crate::arch::riscv64::kernel::core_local::*;
pub use crate::arch::riscv64::kernel::devicetree::init_drivers;
use crate::arch::riscv64::kernel::processor::lsb;
use crate::arch::riscv64::kernel::serial::SerialPort;
pub use crate::arch::riscv64::kernel::systemtime::get_boot_time;
use crate::arch::riscv64::mm::{paging, physicalmem, PhysAddr, VirtAddr};
use crate::config::*;
use crate::env;
use crate::scheduler::CoreId;

const SERIAL_PORT_BAUDRATE: u32 = 115200;

static mut COM1: SerialPort = SerialPort::new(0x9000000);

// Used to store information about available harts. The index of the hart in the vector
// represents its CpuId and does not need to match its hart_id
pub static mut HARTS_AVAILABLE: Vec<usize> = Vec::new();

/// Kernel header to announce machine features
static mut BOOT_INFO: Option<BootInfo> = None;
static mut RAW_BOOT_INFO: *const RawBootInfo = ptr::null_mut();
static CURRENT_CORE_LOCAL: AtomicPtr<CoreLocal> = AtomicPtr::new(ptr::null_mut());
static CPU_ONLINE: AtomicU32 = AtomicU32::new(0);
static CURRENT_BOOT_ID: AtomicU32 = AtomicU32::new(0);
static HART_MASK: AtomicU64 = AtomicU64::new(0);
static CURRENT_STACK_ADDRESS: AtomicU64 = AtomicU64::new(0);

// FUNCTIONS

pub fn is_uhyve_with_pci() -> bool {
	false
}

pub fn get_ram_address() -> PhysAddr {
	unsafe {
		PhysAddr(
			BOOT_INFO
				.as_ref()
				.unwrap()
				.hardware_info
				.phys_addr_range
				.start,
		)
	}
}

pub fn get_image_size() -> usize {
	unsafe {
		(BOOT_INFO
			.as_ref()
			.unwrap()
			.load_info
			.kernel_image_addr_range
			.end - BOOT_INFO
			.as_ref()
			.unwrap()
			.load_info
			.kernel_image_addr_range
			.start) as usize
	}
}

pub fn get_limit() -> usize {
	unsafe {
		(BOOT_INFO
			.as_ref()
			.unwrap()
			.hardware_info
			.phys_addr_range
			.end - BOOT_INFO
			.as_ref()
			.unwrap()
			.hardware_info
			.phys_addr_range
			.start) as usize
	}
}

#[cfg(feature = "smp")]
pub fn get_possible_cpus() -> u32 {
	CPU_ONLINE.load(Ordering::Relaxed)
}

#[cfg(feature = "smp")]
pub fn get_processor_count() -> u32 {
	CPU_ONLINE.load(Ordering::Relaxed)
}

#[cfg(not(feature = "smp"))]
pub fn get_processor_count() -> u32 {
	1
}

pub fn get_base_address() -> VirtAddr {
	unsafe {
		VirtAddr(
			BOOT_INFO
				.as_ref()
				.unwrap()
				.load_info
				.kernel_image_addr_range
				.start,
		)
	}
}

pub fn get_tls_start() -> VirtAddr {
	unsafe {
		VirtAddr(
			BOOT_INFO
				.as_ref()
				.unwrap()
				.load_info
				.tls_info
				.unwrap()
				.start,
		)
	}
}

pub fn get_tls_filesz() -> usize {
	unsafe {
		BOOT_INFO
			.as_ref()
			.unwrap()
			.load_info
			.tls_info
			.unwrap()
			.filesz as usize
	}
}

pub fn get_tls_memsz() -> usize {
	unsafe {
		BOOT_INFO
			.as_ref()
			.unwrap()
			.load_info
			.tls_info
			.unwrap()
			.memsz as usize
	}
}

pub fn get_tls_align() -> usize {
	unsafe {
		BOOT_INFO
			.as_ref()
			.unwrap()
			.load_info
			.tls_info
			.unwrap()
			.align as usize
	}
}

/// Whether HermitCore is running under the "uhyve" hypervisor.
pub fn is_uhyve() -> bool {
	false
	// TODO
	// unsafe { core::ptr::read_volatile(&(*BOOT_INFO).uhyve) != 0 }
}

pub fn get_cmdsize() -> usize {
	unsafe {
		match BOOT_INFO.as_ref().unwrap().platform_info {
			PlatformInfo::Riscv64 { command_line, .. } => {
				command_line.map(|s| s.len()).unwrap_or(0)
			}
			PlatformInfo::Uhyve { .. } => todo!(),
			PlatformInfo::LinuxBootParams { .. } => todo!(),
		}
	}
}

pub fn get_cmdline() -> VirtAddr {
	unsafe {
		match BOOT_INFO.as_ref().unwrap().platform_info {
			PlatformInfo::Riscv64 { command_line, .. } => VirtAddr(
				command_line
					.map(|s| s.as_ptr())
					.unwrap_or(core::ptr::null()) as u64,
			),
			PlatformInfo::Uhyve { .. } => todo!(),
			PlatformInfo::LinuxBootParams { .. } => todo!(),
		}
	}
}

pub fn get_dtb_ptr() -> *const u8 {
	unsafe {
		match BOOT_INFO.as_ref().unwrap().platform_info {
			PlatformInfo::Riscv64 { dtb_ptr, .. } => dtb_ptr as *const u8,
			PlatformInfo::Uhyve { .. } => todo!(),
			PlatformInfo::LinuxBootParams { .. } => todo!(),
		}
	}
}

pub fn get_hart_mask() -> u64 {
	HART_MASK.load(Ordering::Relaxed)
}

pub fn get_timebase_freq() -> u64 {
	unsafe {
		match BOOT_INFO.as_ref().unwrap().platform_info {
			PlatformInfo::Riscv64 { timebase_freq, .. } => timebase_freq,
			PlatformInfo::Uhyve { .. } => todo!(),
			PlatformInfo::LinuxBootParams { .. } => todo!(),
		}
	}
}

pub fn get_current_boot_id() -> u32 {
	CURRENT_BOOT_ID.load(Ordering::Relaxed)
}

/// Earliest initialization function called by the Boot Processor.
pub fn message_output_init() {
	core_local::init();

	// We can only initialize the serial port here, because VGA requires processor
	// configuration first.
	unsafe {
		COM1.init(SERIAL_PORT_BAUDRATE);
	}
}

pub fn output_message_byte(byte: u8) {
	// Output messages to the serial port and VGA screen in unikernel mode.
	unsafe {
		COM1.write_byte(byte);
	}
}

pub fn output_message_buf(buf: &[u8]) {
	for byte in buf {
		output_message_byte(*byte);
	}
}

/// Real Boot Processor initialization as soon as we have put the first Welcome message on the screen.
pub fn boot_processor_init() {
	devicetree::init();
	crate::mm::init();
	crate::mm::print_information();
	env::init();
	interrupts::install();

	finish_processor_init();
	interrupts::enable();
}

/// Boots all available Application Processors on bare-metal or QEMU.
/// Called after the Boot Processor has been fully initialized along with its scheduler.
pub fn boot_application_processors() {
	// Nothing to do here yet.
}

extern "C" {
	fn _start(hart_id: usize, boot_info: &'static mut BootInfo) -> !;
}

/// Application Processor initialization
pub fn application_processor_init() {
	core_local::init();
	paging::init_application_processor();
	interrupts::install();
	finish_processor_init();
	interrupts::enable();
}

fn finish_processor_init() {
	unsafe {
		sstatus::set_fs(sstatus::FS::Initial);
	}
	trace!("SSTATUS FS: {:?}", sstatus::read().fs());
	trace!("FCSR: {:x?}", fcsr::read());

	let current_hart_id = get_current_boot_id() as usize;

	unsafe {
		// Add hart to HARTS_AVAILABLE, the hart id is stored in current_boot_id
		HARTS_AVAILABLE.push(current_hart_id);
		info!(
			"Initialized CPU with hart_id {}",
			HARTS_AVAILABLE[core_local::core_id() as usize]
		);
	}

	crate::scheduler::add_current_core();

	// Remove current hart from the hart_mask
	let new_hart_mask = get_hart_mask() & (u64::MAX - (1 << current_hart_id));
	HART_MASK.store(new_hart_mask, Ordering::Relaxed);

	let next_hart_index = lsb(new_hart_mask);

	if let Some(next_hart_id) = next_hart_index {
		// The current processor already needs to prepare the processor variables for a possible next processor.
		init_next_processor_variables(core_id() + 1);

		info!(
			"Starting CPU {} with hart_id {}",
			core_id() + 1,
			next_hart_id
		);

		unsafe {
			// TODO: Old: Changing cpu_online will cause uhyve to start the next processor
			CPU_ONLINE.fetch_add(1, Ordering::Release);

			//When running bare-metal/QEMU we use the firmware to start the next hart
			if !is_uhyve() {
				let ret = sbi::sbi_hart_start(
					next_hart_id as usize,
					_start as *const () as usize,
					RAW_BOOT_INFO as usize,
				);
				debug!("sbi_hart_start: {:?}", ret);
			}
		}
	} else {
		info!("All processors are initialized");
		CPU_ONLINE.fetch_add(1, Ordering::Release);
	}
}

pub fn print_statistics() {}

/// Initialize the required start.rs variables for the next CPU to be booted.
pub fn init_next_processor_variables(core_id: CoreId) {
	// Allocate stack and CoreLocal structure for the CPU and pass the addresses.
	// Keep the stack executable to possibly support dynamically generated code on the stack (see https://security.stackexchange.com/a/47825).
	let stack = physicalmem::allocate(KERNEL_STACK_SIZE)
		.expect("Failed to allocate boot stack for new core");
	let boxed_core_local = Box::new(CoreLocal::new(core_id));
	//let boxed_irq = Box::new(IrqStatistics::new());
	//let boxed_irq_raw = Box::into_raw(boxed_irq);

	unsafe {
		//IRQ_COUNTERS.insert(core_id, &(*boxed_irq_raw));
		//boxed_core_local.irq_statistics = CoreLocalVariable::new(boxed_irq_raw);

		CURRENT_STACK_ADDRESS.store(stack.as_u64(), Ordering::Relaxed);
		let current_core_local = Box::into_raw(boxed_core_local);
		CURRENT_CORE_LOCAL.store(current_core_local, Ordering::Relaxed);

		info!(
			"Initialize per core data at {current_core_local:p} (size {} bytes)",
			mem::size_of::<CoreLocal>()
		);
	}
}
