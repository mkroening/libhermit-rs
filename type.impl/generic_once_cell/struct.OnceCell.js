(function() {var type_impls = {
"hermit_sync":[["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#137\">source</a><a href=\"#impl-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.new\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#139\">source</a><h4 class=\"code-header\">pub const fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.new\" class=\"fn\">new</a>() -&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;</h4></section></summary><div class=\"docblock\"><p>Creates a new empty cell.</p>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.with_value\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#144\">source</a><h4 class=\"code-header\">pub const fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.with_value\" class=\"fn\">with_value</a>(value: T) -&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;</h4></section></summary><div class=\"docblock\"><p>Creates a new initialized cell.</p>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.get\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#152\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.get\" class=\"fn\">get</a>(&amp;self) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/option/enum.Option.html\" title=\"enum core::option::Option\">Option</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a>&gt;</h4></section></summary><div class=\"docblock\"><p>Gets the reference to the underlying value.</p>\n<p>Returns <code>None</code> if the cell is empty, or being initialized. This\nmethod never blocks.</p>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.get_mut\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#178\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.get_mut\" class=\"fn\">get_mut</a>(&amp;mut self) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/option/enum.Option.html\" title=\"enum core::option::Option\">Option</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;mut T</a>&gt;</h4></section></summary><div class=\"docblock\"><p>Gets the mutable reference to the underlying value.</p>\n<p>Returns <code>None</code> if the cell is empty.</p>\n<p>This method is allowed to violate the invariant of writing to a <code>OnceCell</code>\nat most once because it requires <code>&amp;mut</code> access to <code>self</code>. As with all\ninterior mutability, <code>&amp;mut</code> access permits arbitrary modification:</p>\n\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span><span class=\"kw-2\">mut </span>cell: OnceCell&lt;RawMutex, u32&gt; = OnceCell::new();\ncell.set(<span class=\"number\">92</span>).unwrap();\ncell = OnceCell::new();</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.get_unchecked\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#190\">source</a><h4 class=\"code-header\">pub unsafe fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.get_unchecked\" class=\"fn\">get_unchecked</a>(&amp;self) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a></h4></section></summary><div class=\"docblock\"><p>Get the reference to the underlying value, without checking if the\ncell is initialized.</p>\n<h5 id=\"safety\"><a href=\"#safety\">Safety</a></h5>\n<p>Caller must ensure that the cell is in initialized state, and that\nthe contents are acquired by (synchronized to) this thread.</p>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.set\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#219\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.set\" class=\"fn\">set</a>(&amp;self, value: T) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/result/enum.Result.html\" title=\"enum core::result::Result\">Result</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.unit.html\">()</a>, T&gt;</h4></section></summary><div class=\"docblock\"><p>Sets the contents of this cell to <code>value</code>.</p>\n<p>Returns <code>Ok(())</code> if the cell was empty and <code>Err(value)</code> if it was\nfull.</p>\n<h5 id=\"example\"><a href=\"#example\">Example</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">static </span>CELL: OnceCell&lt;RawMutex, i32&gt; = OnceCell::new();\n\n<span class=\"kw\">fn </span>main() {\n    <span class=\"macro\">assert!</span>(CELL.get().is_none());\n\n    std::thread::spawn(|| {\n        <span class=\"macro\">assert_eq!</span>(CELL.set(<span class=\"number\">92</span>), <span class=\"prelude-val\">Ok</span>(()));\n    }).join().unwrap();\n\n    <span class=\"macro\">assert_eq!</span>(CELL.set(<span class=\"number\">62</span>), <span class=\"prelude-val\">Err</span>(<span class=\"number\">62</span>));\n    <span class=\"macro\">assert_eq!</span>(CELL.get(), <span class=\"prelude-val\">Some</span>(<span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>));\n}</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.try_insert\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#242\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.try_insert\" class=\"fn\">try_insert</a>(&amp;self, value: T) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/result/enum.Result.html\" title=\"enum core::result::Result\">Result</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a>, (<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a>, T)&gt;</h4></section></summary><div class=\"docblock\"><p>Like <a href=\"generic_once_cell/struct.OnceCell.html#method.set\" title=\"method generic_once_cell::OnceCell::set\"><code>set</code></a>, but also returns a reference to the final cell value.</p>\n<h5 id=\"example-1\"><a href=\"#example-1\">Example</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span>cell = OnceCell::&lt;RawMutex, <span class=\"kw\">_</span>&gt;::new();\n<span class=\"macro\">assert!</span>(cell.get().is_none());\n\n<span class=\"macro\">assert_eq!</span>(cell.try_insert(<span class=\"number\">92</span>), <span class=\"prelude-val\">Ok</span>(<span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>));\n<span class=\"macro\">assert_eq!</span>(cell.try_insert(<span class=\"number\">62</span>), <span class=\"prelude-val\">Err</span>((<span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>, <span class=\"number\">62</span>)));\n\n<span class=\"macro\">assert!</span>(cell.get().is_some());</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.get_or_init\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#278-280\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.get_or_init\" class=\"fn\">get_or_init</a>&lt;F&gt;(&amp;self, f: F) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a><span class=\"where fmt-newline\">where\n    F: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/ops/function/trait.FnOnce.html\" title=\"trait core::ops::function::FnOnce\">FnOnce</a>() -&gt; T,</span></h4></section></summary><div class=\"docblock\"><p>Gets the contents of the cell, initializing it with <code>f</code> if the cell\nwas empty.</p>\n<p>Many threads may call <code>get_or_init</code> concurrently with different\ninitializing functions, but it is guaranteed that only one function\nwill be executed.</p>\n<h5 id=\"panics\"><a href=\"#panics\">Panics</a></h5>\n<p>If <code>f</code> panics, the panic is propagated to the caller, and the cell\nremains uninitialized.</p>\n<p>It is an error to reentrantly initialize the cell from <code>f</code>. The\nexact outcome is unspecified. Current implementation deadlocks, but\nthis may be changed to a panic in the future.</p>\n<h5 id=\"example-2\"><a href=\"#example-2\">Example</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span>cell = OnceCell::&lt;RawMutex, <span class=\"kw\">_</span>&gt;::new();\n<span class=\"kw\">let </span>value = cell.get_or_init(|| <span class=\"number\">92</span>);\n<span class=\"macro\">assert_eq!</span>(value, <span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>);\n<span class=\"kw\">let </span>value = cell.get_or_init(|| <span class=\"macro\">unreachable!</span>());\n<span class=\"macro\">assert_eq!</span>(value, <span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>);</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.get_or_try_init\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#316-318\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.get_or_try_init\" class=\"fn\">get_or_try_init</a>&lt;F, E&gt;(&amp;self, f: F) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/result/enum.Result.html\" title=\"enum core::result::Result\">Result</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a>, E&gt;<span class=\"where fmt-newline\">where\n    F: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/ops/function/trait.FnOnce.html\" title=\"trait core::ops::function::FnOnce\">FnOnce</a>() -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/result/enum.Result.html\" title=\"enum core::result::Result\">Result</a>&lt;T, E&gt;,</span></h4></section></summary><div class=\"docblock\"><p>Gets the contents of the cell, initializing it with <code>f</code> if\nthe cell was empty. If the cell was empty and <code>f</code> failed, an\nerror is returned.</p>\n<h5 id=\"panics-1\"><a href=\"#panics-1\">Panics</a></h5>\n<p>If <code>f</code> panics, the panic is propagated to the caller, and\nthe cell remains uninitialized.</p>\n<p>It is an error to reentrantly initialize the cell from <code>f</code>.\nThe exact outcome is unspecified. Current implementation\ndeadlocks, but this may be changed to a panic in the future.</p>\n<h5 id=\"example-3\"><a href=\"#example-3\">Example</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span>cell = OnceCell::&lt;RawMutex, <span class=\"kw\">_</span>&gt;::new();\n<span class=\"macro\">assert_eq!</span>(cell.get_or_try_init(|| <span class=\"prelude-val\">Err</span>(())), <span class=\"prelude-val\">Err</span>(()));\n<span class=\"macro\">assert!</span>(cell.get().is_none());\n<span class=\"kw\">let </span>value = cell.get_or_try_init(|| -&gt; <span class=\"prelude-ty\">Result</span>&lt;i32, ()&gt; {\n    <span class=\"prelude-val\">Ok</span>(<span class=\"number\">92</span>)\n});\n<span class=\"macro\">assert_eq!</span>(value, <span class=\"prelude-val\">Ok</span>(<span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>));\n<span class=\"macro\">assert_eq!</span>(cell.get(), <span class=\"prelude-val\">Some</span>(<span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>))</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.take\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#363\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.take\" class=\"fn\">take</a>(&amp;mut self) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/option/enum.Option.html\" title=\"enum core::option::Option\">Option</a>&lt;T&gt;</h4></section></summary><div class=\"docblock\"><p>Takes the value out of this <code>OnceCell</code>, moving it back to an uninitialized state.</p>\n<p>Has no effect and returns <code>None</code> if the <code>OnceCell</code> hasn’t been initialized.</p>\n<h5 id=\"examples\"><a href=\"#examples\">Examples</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span><span class=\"kw-2\">mut </span>cell: OnceCell&lt;RawMutex, String&gt; = OnceCell::new();\n<span class=\"macro\">assert_eq!</span>(cell.take(), <span class=\"prelude-val\">None</span>);\n\n<span class=\"kw\">let </span><span class=\"kw-2\">mut </span>cell = OnceCell::&lt;RawMutex, <span class=\"kw\">_</span>&gt;::new();\ncell.set(<span class=\"string\">&quot;hello&quot;</span>.to_string()).unwrap();\n<span class=\"macro\">assert_eq!</span>(cell.take(), <span class=\"prelude-val\">Some</span>(<span class=\"string\">&quot;hello&quot;</span>.to_string()));\n<span class=\"macro\">assert_eq!</span>(cell.get(), <span class=\"prelude-val\">None</span>);</code></pre></div>\n<p>This method is allowed to violate the invariant of writing to a <code>OnceCell</code>\nat most once because it requires <code>&amp;mut</code> access to <code>self</code>. As with all\ninterior mutability, <code>&amp;mut</code> access permits arbitrary modification:</p>\n\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span><span class=\"kw-2\">mut </span>cell: OnceCell&lt;RawMutex, u32&gt; = OnceCell::new();\ncell.set(<span class=\"number\">92</span>).unwrap();\ncell = OnceCell::new();</code></pre></div>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.into_inner\" class=\"method\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#384\">source</a><h4 class=\"code-header\">pub fn <a href=\"generic_once_cell/struct.OnceCell.html#tymethod.into_inner\" class=\"fn\">into_inner</a>(self) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/option/enum.Option.html\" title=\"enum core::option::Option\">Option</a>&lt;T&gt;</h4></section></summary><div class=\"docblock\"><p>Consumes the <code>OnceCell</code>, returning the wrapped value. Returns\n<code>None</code> if the cell was empty.</p>\n<h5 id=\"examples-1\"><a href=\"#examples-1\">Examples</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>generic_once_cell::OnceCell;\n\n<span class=\"kw\">let </span>cell: OnceCell&lt;RawMutex, String&gt; = OnceCell::new();\n<span class=\"macro\">assert_eq!</span>(cell.into_inner(), <span class=\"prelude-val\">None</span>);\n\n<span class=\"kw\">let </span>cell = OnceCell::&lt;RawMutex, <span class=\"kw\">_</span>&gt;::new();\ncell.set(<span class=\"string\">&quot;hello&quot;</span>.to_string()).unwrap();\n<span class=\"macro\">assert_eq!</span>(cell.into_inner(), <span class=\"prelude-val\">Some</span>(<span class=\"string\">&quot;hello&quot;</span>.to_string()));</code></pre></div>\n</div></details></div></details>",0,"hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Default-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#92\">source</a><a href=\"#impl-Default-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html\" title=\"trait core::default::Default\">Default</a> for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.default\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#93\">source</a><a href=\"#method.default\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html#tymethod.default\" class=\"fn\">default</a>() -&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;</h4></section></summary><div class='docblock'>Returns the “default value” for a type. <a href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html#tymethod.default\">Read more</a></div></details></div></details>","Default","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<section id=\"impl-Eq-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#135\">source</a><a href=\"#impl-Eq-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.Eq.html\" title=\"trait core::cmp::Eq\">Eq</a> for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,\n    T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.Eq.html\" title=\"trait core::cmp::Eq\">Eq</a>,</span></h3></section>","Eq","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-From%3CT%3E-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#123\">source</a><a href=\"#impl-From%3CT%3E-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/convert/trait.From.html\" title=\"trait core::convert::From\">From</a>&lt;T&gt; for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.from\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#124\">source</a><a href=\"#method.from\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/convert/trait.From.html#tymethod.from\" class=\"fn\">from</a>(value: T) -&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;</h4></section></summary><div class='docblock'>Converts to this type from the input type.</div></details></div></details>","From<T>","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Debug-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#98\">source</a><a href=\"#impl-Debug-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,\n    T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.fmt\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#99\">source</a><a href=\"#method.fmt\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html#tymethod.fmt\" class=\"fn\">fmt</a>(&amp;self, f: &amp;mut <a class=\"struct\" href=\"https://doc.rust-lang.org/nightly/core/fmt/struct.Formatter.html\" title=\"struct core::fmt::Formatter\">Formatter</a>&lt;'_&gt;) -&gt; <a class=\"enum\" href=\"https://doc.rust-lang.org/nightly/core/result/enum.Result.html\" title=\"enum core::result::Result\">Result</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.unit.html\">()</a>, <a class=\"struct\" href=\"https://doc.rust-lang.org/nightly/core/fmt/struct.Error.html\" title=\"struct core::fmt::Error\">Error</a>&gt;</h4></section></summary><div class='docblock'>Formats the value using the given formatter. <a href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html#tymethod.fmt\">Read more</a></div></details></div></details>","Debug","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-PartialEq-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#129\">source</a><a href=\"#impl-PartialEq-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.PartialEq.html\" title=\"trait core::cmp::PartialEq\">PartialEq</a> for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,\n    T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.PartialEq.html\" title=\"trait core::cmp::PartialEq\">PartialEq</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.eq\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#130\">source</a><a href=\"#method.eq\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.PartialEq.html#tymethod.eq\" class=\"fn\">eq</a>(&amp;self, other: &amp;<a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.bool.html\">bool</a></h4></section></summary><div class='docblock'>This method tests for <code>self</code> and <code>other</code> values to be equal, and is used\nby <code>==</code>.</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.ne\" class=\"method trait-impl\"><span class=\"rightside\"><span class=\"since\" title=\"Stable since Rust version 1.0.0\">1.0.0</span> · <a class=\"src\" href=\"https://doc.rust-lang.org/nightly/src/core/cmp.rs.html#239\">source</a></span><a href=\"#method.ne\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/cmp/trait.PartialEq.html#method.ne\" class=\"fn\">ne</a>(&amp;self, other: <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;Rhs</a>) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.bool.html\">bool</a></h4></section></summary><div class='docblock'>This method tests for <code>!=</code>. The default implementation is almost always\nsufficient, and should not be overridden without very good reason.</div></details></div></details>","PartialEq","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Clone-for-OnceCell%3CR,+T%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#107\">source</a><a href=\"#impl-Clone-for-OnceCell%3CR,+T%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;R, T&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html\" title=\"trait core::clone::Clone\">Clone</a> for <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;<span class=\"where fmt-newline\">where\n    R: <a class=\"trait\" href=\"lock_api/mutex/trait.RawMutex.html\" title=\"trait lock_api::mutex::RawMutex\">RawMutex</a>,\n    T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html\" title=\"trait core::clone::Clone\">Clone</a>,</span></h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.clone\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#108\">source</a><a href=\"#method.clone\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html#tymethod.clone\" class=\"fn\">clone</a>(&amp;self) -&gt; <a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;</h4></section></summary><div class='docblock'>Returns a copy of the value. <a href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html#tymethod.clone\">Read more</a></div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.clone_from\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/generic_once_cell/lib.rs.html#115\">source</a><a href=\"#method.clone_from\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html#method.clone_from\" class=\"fn\">clone_from</a>(&amp;mut self, source: &amp;<a class=\"struct\" href=\"generic_once_cell/struct.OnceCell.html\" title=\"struct generic_once_cell::OnceCell\">OnceCell</a>&lt;R, T&gt;)</h4></section></summary><div class='docblock'>Performs copy-assignment from <code>source</code>. <a href=\"https://doc.rust-lang.org/nightly/core/clone/trait.Clone.html#method.clone_from\">Read more</a></div></details></div></details>","Clone","hermit_sync::OnceCell","hermit_sync::InterruptOnceCell"]]
};if (window.register_type_impls) {window.register_type_impls(type_impls);} else {window.pending_type_impls = type_impls;}})()