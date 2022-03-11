//! Determining and providing information about the environment (unikernel
//! vs. multi-kernel, hypervisor, etc.) as well as central parsing of the
//! command-line parameters.

use alloc::{boxed::Box, string::String, vec::Vec};
use core::{slice, str};

use once_cell::race::OnceBox;

pub use crate::arch::kernel::{
	get_base_address, get_cmdline, get_cmdsize, get_image_size, get_ram_address, get_tls_align,
	get_tls_filesz, get_tls_memsz, get_tls_start, is_single_kernel, is_uhyve,
};

pub fn init() {
	let cli = parse_command_line();

	// Uhyve or baremetal implies unikernel mode and no communication with "proxy".
	// Else we are running side-by-side to Linux, which implies communication with "proxy".
	let is_proxy = !is_uhyve() && !is_single_kernel();

	ENV.set(Box::new(Env { cli, is_proxy })).unwrap();
}

#[derive(Debug)]
struct Env {
	cli: Cli,
	is_proxy: bool,
}

#[derive(Default, Debug)]
struct Cli {
	cpu_freq: Option<u16>,
	env: Vec<String>,
	path: Option<String>,
	args: Vec<String>,
}

static ENV: OnceBox<Env> = OnceBox::new();

// Returns the command line string.
fn get_cmdline_str() -> Option<&'static str> {
	let cmdsize = get_cmdsize();
	let cmdline = get_cmdline().as_ptr::<u8>();
	if cmdline.is_null() {
		None
	} else {
		// SAFETY: cmdline and cmdsize are valid forever.
		let slice = unsafe { slice::from_raw_parts(cmdline, cmdsize) };
		Some(str::from_utf8(slice).unwrap())
	}
}

fn parse_command_line() -> Cli {
	panic!("FOO");

	let mut cli = Cli::default();

	// TODO: Replace with let-else once stable.
	let cmdline_str = get_cmdline_str();
	if cmdline_str.is_none() {
		return cli;
	}
	let cmdline_str = cmdline_str.unwrap();

	let words = shell_words::split(cmdline_str).unwrap();
	debug!("cli_words = {words:?}");

	let mut words = words.into_iter();
	let expect_arg = |arg: Option<String>, name: &str| {
		arg.unwrap_or_else(|| {
			panic!("The argument '{name}' requires a value but none was supplied")
		})
	};
	while let Some(word) = words.next() {
		match word.as_str() {
			"-freq" => {
				let freq = expect_arg(words.next(), word.as_str());
				cli.cpu_freq = Some(freq.parse().unwrap());
			}
			"-ip" => {
				let ip = expect_arg(words.next(), word.as_str());
				cli.env.push(format!("HERMIT_IP={ip}"));
			}
			"-mask" => {
				let mask = expect_arg(words.next(), word.as_str());
				cli.env.push(format!("HERMIT_MASK={mask}"));
			}
			"-gateway" => {
				let gateway = expect_arg(words.next(), word.as_str());
				cli.env.push(format!("HERMIT_GATEWAY={gateway}"));
			}
			"--" => cli.args.extend(&mut words),
			_ if cli.path.is_none() => cli.path = Some(word),
			word => panic!(
				"Found argument '{word}' which wasn't expected, or isn't valid in this context
			
 		If you tried to supply `{word}` as a value rather than a flag, use `-- {word}`"
			),
		};
	}

	cli
}

/// CPU Frequency in MHz if given through the -freq command-line parameter.
pub fn get_command_line_cpu_frequency() -> Option<u16> {
	ENV.get().unwrap().cli.cpu_freq
}

pub fn get_command_line_envv() -> &'static [String] {
	ENV.get().unwrap().cli.env.as_slice()
}

/// Returns the cmdline argument passed in after "--"
pub fn get_command_line_argv() -> &'static [String] {
	ENV.get().unwrap().cli.args.as_slice()
}

/// Whether HermitCore shall communicate with the "proxy" application over a network interface.
pub fn is_proxy() -> bool {
	ENV.get().unwrap().is_proxy
}
