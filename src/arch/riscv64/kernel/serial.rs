// TODO: sifive UART
use crate::arch::riscv64::kernel::sbi;

pub struct SerialPort {}

impl SerialPort {
	pub const fn new(port_address: u32) -> Self {
		Self {}
	}

	pub fn write_byte(&self, byte: u8) {
		sbi::console_putchar(byte as usize);
	}

	pub fn init(&self, _baudrate: u32) {
		// We don't do anything here (yet).
	}
}
