//! Implementation of the HermitCore Allocator for dynamically allocating heap memory
//! in the kernel.

use core::alloc::{GlobalAlloc, Layout};

use align_address::Align;
use hermit_sync::RawInterruptTicketMutex;
use talc::{Span, Talc, Talck};

use crate::HW_DESTRUCTIVE_INTERFERENCE_SIZE;

/// The global system allocator for Hermit.
pub struct LockedAllocator(Talck<RawInterruptTicketMutex>);

impl LockedAllocator {
	/// Creates an empty allocator. All allocate calls will return `None`.
	pub const fn empty() -> LockedAllocator {
		LockedAllocator(Talc::new().spin_lock())
	}

	#[inline]
	fn align_layout(layout: Layout) -> Layout {
		let size = layout.size().align_up(HW_DESTRUCTIVE_INTERFERENCE_SIZE);
		let align = layout.align().max(HW_DESTRUCTIVE_INTERFERENCE_SIZE);
		Layout::from_size_align(size, align).unwrap()
	}

	/// Initializes the heap allocator.
	///
	/// # Safety
	///
	/// The memory starting from `heap_bottom` with a size of `heap_size`
	/// must be valid and ready to be managed and allocated from.
	pub unsafe fn init(&mut self, heap_bottom: *mut u8, heap_size: usize) {
		unsafe {
			self.0
				.talc()
				.init(Span::from_ptr_size(heap_bottom, heap_size));
		}
	}

	pub unsafe fn extend(&mut self, heap_bottom: *mut u8, heap_size: usize) {
		unsafe {
			self.0
				.talc()
				.extend(Span::from_ptr_size(heap_bottom, heap_size));
		}
	}
}

/// To avoid false sharing, the global memory allocator align
/// all requests to a cache line.
unsafe impl GlobalAlloc for LockedAllocator {
	unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
		let layout = Self::align_layout(layout);
		unsafe { self.0.alloc(layout) }
	}

	unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
		let layout = Self::align_layout(layout);
		unsafe { self.0.dealloc(ptr, layout) }
	}
}

#[cfg(all(test, not(target_os = "none")))]
mod tests {
	use core::mem;

	use super::*;

	#[test]
	fn empty() {
		let mut allocator = GlobalAllocator::empty();
		let layout = Layout::from_size_align(1, 1).unwrap();
		// we have 4 kbyte static memory
		assert!(allocator.allocate(layout.clone()).is_ok());

		let layout = Layout::from_size_align(0x1000, mem::align_of::<usize>());
		let addr = allocator.allocate(layout.unwrap());
		assert!(addr.is_err());
	}
}
