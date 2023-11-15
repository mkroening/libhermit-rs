(function() {var type_impls = {
"spin":[["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Lazy%3CT,+F,+R%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#63-80\">source</a><a href=\"#impl-Lazy%3CT,+F,+R%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T, F, R&gt; <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, F, R&gt;</h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.new\" class=\"method\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#66-71\">source</a><h4 class=\"code-header\">pub const fn <a href=\"spin/lazy/struct.Lazy.html#tymethod.new\" class=\"fn\">new</a>(f: F) -&gt; Self</h4></section></summary><div class=\"docblock\"><p>Creates a new lazy value with the given initializing\nfunction.</p>\n</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.as_mut_ptr\" class=\"method\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#77-79\">source</a><h4 class=\"code-header\">pub fn <a href=\"spin/lazy/struct.Lazy.html#tymethod.as_mut_ptr\" class=\"fn\">as_mut_ptr</a>(&amp;self) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.pointer.html\">*mut T</a></h4></section></summary><div class=\"docblock\"><p>Retrieves a mutable pointer to the inner data.</p>\n<p>This is especially useful when interfacing with low level code or FFI where the caller\nexplicitly knows that it has exclusive access to the inner data. Note that reading from\nthis pointer is UB until initialized or directly written to.</p>\n</div></details></div></details>",0,"spin::Lazy"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Lazy%3CT,+F,+R%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#82-103\">source</a><a href=\"#impl-Lazy%3CT,+F,+R%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T, F: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/ops/function/trait.FnOnce.html\" title=\"trait core::ops::function::FnOnce\">FnOnce</a>() -&gt; T, R: <a class=\"trait\" href=\"spin/relax/trait.RelaxStrategy.html\" title=\"trait spin::relax::RelaxStrategy\">RelaxStrategy</a>&gt; <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, F, R&gt;</h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.force\" class=\"method\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#97-102\">source</a><h4 class=\"code-header\">pub fn <a href=\"spin/lazy/struct.Lazy.html#tymethod.force\" class=\"fn\">force</a>(this: <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;Self</a>) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a></h4></section></summary><div class=\"docblock\"><p>Forces the evaluation of this lazy value and\nreturns a reference to result. This is equivalent\nto the <code>Deref</code> impl, but is explicit.</p>\n<h5 id=\"examples\"><a href=\"#examples\">Examples</a></h5>\n<div class=\"example-wrap\"><pre class=\"rust rust-example-rendered\"><code><span class=\"kw\">use </span>spin::Lazy;\n\n<span class=\"kw\">let </span>lazy = Lazy::new(|| <span class=\"number\">92</span>);\n\n<span class=\"macro\">assert_eq!</span>(Lazy::force(<span class=\"kw-2\">&amp;</span>lazy), <span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>);\n<span class=\"macro\">assert_eq!</span>(<span class=\"kw-2\">&amp;*</span>lazy, <span class=\"kw-2\">&amp;</span><span class=\"number\">92</span>);</code></pre></div>\n</div></details></div></details>",0,"spin::Lazy"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Debug-for-Lazy%3CT,+F,+R%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#46-53\">source</a><a href=\"#impl-Debug-for-Lazy%3CT,+F,+R%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>, F, R&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, F, R&gt;</h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.fmt\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#47-52\">source</a><a href=\"#method.fmt\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html#tymethod.fmt\" class=\"fn\">fmt</a>(&amp;self, f: &amp;mut <a class=\"struct\" href=\"https://doc.rust-lang.org/nightly/core/fmt/struct.Formatter.html\" title=\"struct core::fmt::Formatter\">Formatter</a>&lt;'_&gt;) -&gt; <a class=\"type\" href=\"https://doc.rust-lang.org/nightly/core/fmt/type.Result.html\" title=\"type core::fmt::Result\">Result</a></h4></section></summary><div class='docblock'>Formats the value using the given formatter. <a href=\"https://doc.rust-lang.org/nightly/core/fmt/trait.Debug.html#tymethod.fmt\">Read more</a></div></details></div></details>","Debug","spin::Lazy"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Default-for-Lazy%3CT,+fn()+-%3E+T,+R%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#113-118\">source</a><a href=\"#impl-Default-for-Lazy%3CT,+fn()+-%3E+T,+R%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html\" title=\"trait core::default::Default\">Default</a>, R&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html\" title=\"trait core::default::Default\">Default</a> for <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.fn.html\">fn</a>() -&gt; T, R&gt;</h3></section></summary><div class=\"impl-items\"><details class=\"toggle method-toggle\" open><summary><section id=\"method.default\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#115-117\">source</a><a href=\"#method.default\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/default/trait.Default.html#tymethod.default\" class=\"fn\">default</a>() -&gt; Self</h4></section></summary><div class=\"docblock\"><p>Creates a new lazy value using <code>Default</code> as the initializing function.</p>\n</div></details></div></details>","Default","spin::Lazy"],["<details class=\"toggle implementors-toggle\" open><summary><section id=\"impl-Deref-for-Lazy%3CT,+F,+R%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#105-111\">source</a><a href=\"#impl-Deref-for-Lazy%3CT,+F,+R%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T, F: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/ops/function/trait.FnOnce.html\" title=\"trait core::ops::function::FnOnce\">FnOnce</a>() -&gt; T, R: <a class=\"trait\" href=\"spin/relax/trait.RelaxStrategy.html\" title=\"trait spin::relax::RelaxStrategy\">RelaxStrategy</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/ops/deref/trait.Deref.html\" title=\"trait core::ops::deref::Deref\">Deref</a> for <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, F, R&gt;</h3></section></summary><div class=\"impl-items\"><details class=\"toggle\" open><summary><section id=\"associatedtype.Target\" class=\"associatedtype trait-impl\"><a href=\"#associatedtype.Target\" class=\"anchor\">§</a><h4 class=\"code-header\">type <a href=\"https://doc.rust-lang.org/nightly/core/ops/deref/trait.Deref.html#associatedtype.Target\" class=\"associatedtype\">Target</a> = T</h4></section></summary><div class='docblock'>The resulting type after dereferencing.</div></details><details class=\"toggle method-toggle\" open><summary><section id=\"method.deref\" class=\"method trait-impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#108-110\">source</a><a href=\"#method.deref\" class=\"anchor\">§</a><h4 class=\"code-header\">fn <a href=\"https://doc.rust-lang.org/nightly/core/ops/deref/trait.Deref.html#tymethod.deref\" class=\"fn\">deref</a>(&amp;self) -&gt; <a class=\"primitive\" href=\"https://doc.rust-lang.org/nightly/core/primitive.reference.html\">&amp;T</a></h4></section></summary><div class='docblock'>Dereferences the value.</div></details></div></details>","Deref","spin::Lazy"],["<section id=\"impl-Sync-for-Lazy%3CT,+F%3E\" class=\"impl\"><a class=\"src rightside\" href=\"src/spin/lazy.rs.html#60\">source</a><a href=\"#impl-Sync-for-Lazy%3CT,+F%3E\" class=\"anchor\">§</a><h3 class=\"code-header\">impl&lt;T, F: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/marker/trait.Send.html\" title=\"trait core::marker::Send\">Send</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/marker/trait.Sync.html\" title=\"trait core::marker::Sync\">Sync</a> for <a class=\"struct\" href=\"spin/lazy/struct.Lazy.html\" title=\"struct spin::lazy::Lazy\">Lazy</a>&lt;T, F&gt;<span class=\"where fmt-newline\">where\n    <a class=\"struct\" href=\"spin/once/struct.Once.html\" title=\"struct spin::once::Once\">Once</a>&lt;T&gt;: <a class=\"trait\" href=\"https://doc.rust-lang.org/nightly/core/marker/trait.Sync.html\" title=\"trait core::marker::Sync\">Sync</a>,</span></h3></section>","Sync","spin::Lazy"]]
};if (window.register_type_impls) {window.register_type_impls(type_impls);} else {window.pending_type_impls = type_impls;}})()