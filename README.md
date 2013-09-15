grid-layout
===========

A library for generating network layouts using a grid-based algorithm.
-----------

Instructions:
<ul>
<li>Create an array of <i>Node</i> objects. Each <i>Node</i> should at least have the <i>connections</i> (array of <i>Connection</i> objects) attribute defined. Each <i>Connection</i> should at least have the <i>targetNode<.i> attribute defined, which refers to a <i>Node</i> object.</li>
<li>Create an instance of <i>GridLayout</i>, providing an array of nodes as the only argument for the constructor.</li>
<li>Call the <i>generate3DLayout</i> method of a <i>GridLayout</i> instance. The method takes no arguments and returns the array of <i>Node</i> objects with <i>position</i> attribute. The <i>position</i> attribute is an object with the fields: <i>x</i>, <i>y</i>, <i>z</i>. The original array of <i>Node</i> objects will be modified.</li>
</ul>

Example:
<pre><code>var nodes = [{},{},{},{}];
nodes[0].connections = [{targetNode:nodes[1]}];
nodes[1].connections = [{targetNode:nodes[0]}];
nodes[2].connections = [];
nodes[3].connections = [];
var gridLayout = new GridLayout(nodes);
console.log(gridLayout.generate3DLayout());   //log results</code></pre>
