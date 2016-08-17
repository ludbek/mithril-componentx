# Introduction

A component factory for [Mithril](https://github.com/lhorie/mithril.js).

# Feature

- Components compatible with [Mithril v1.x](https://github.com/lhorie/mithril.js/tree/rewrite).
- Validates attributes passed to a component.
- Extendable components.
- Supports default attributes.
- Powerful class name generator for component's root.
- Passes essential attributes directly to component's root.

# Installation
## NPM
`npm install mithril-componentx`

## Bower
`bower install mithril-componentx`

# Quick overview
```javascript
import component from "mithril-componentx";

let grid = component({
	getClassList (attrs) {
		return [
			"ui",
			"grid"
			];
	},
	view (vnode) {
		let attrs = vnode.attrs;
		return m("div", attrs.rootAttrs, vnode.children);
	}
});

let page = component({
	validateAttrs (attrs) {
		if (!attrs.heading) throw Error("Heading is required.");
		if (!attrs.content) throw Error("Content is required.");
	},
	view (vnode) {
		return m("div",
			vnode.attrs.heading,
			vnode.attrs.content);
	}
});

let itemsPage = component({
	base: page,
	getDefaultAttrs (attrs) {
		return {
			heading: m("h1", "List of awesome stuff."),
			content: m(grid, /*list of stuff*/)
		};
	}
});

```

# Create a component
The component signature is similar to [`Mithril 1.x`](https://github.com/lhorie/mithril.js/blob/rewrite/docs/components.md).
Except for the component's lifecycle methods.
`mithril-componentx` supports only two lifecycle methods.
1. `oninit`- called when component is initialized.
2. `onremove` - called when component is detached.

```javascript
import component from "mithril-componentx";

let page = component({
	oninit (vnode) {
		// do some initialization
	},
	onremove () {
		// do some clean up
	},
	validateAttrs (attrs) {
		if (!attrs.heading) throw Error("Heading is required.");
		if (!attrs.content) throw Error("Content is required.");
	},
	view (vnode) {
		return m("div",
			vnode.attrs.heading,
			vnode.attrs.content);
	}
});
```
# Using a component
```javascript
// throws exception "Heading is required."
m(page)

// returns valid Mithril 2.x component
m(page, {
	heading: m("h1", "A heading"),
	content: m("p", "A content")
})
```

# Vnode
A component's view gets `vnode`.
It has three properties:

1. `attrs` - the attributes passed through hyperscript i.e. `m`
2. `children` - the child elements passed through hyperscript
3. `state` - the component itself

The component properties and methods can be accessed through 
`vnode.state` and `this` at view.

```javascript
var button = component({
	submit (e) {
		/* do someting */
	},
	view (vnode) {
		//return m("button", {onclick: this.submit}) or
		return m("button", {onclick: vnode.state.submit});
	}

});
```

# Extending a component
Specify a base for new component. New properties overrides base properties.
However the base component is available at new component's `base` property.

```javascript
let button = component({
	getClassList (attrs) {
		return [
			"ui",
			"button"
			];
	},
	submit (e) {
		/* submit form */
	},
	view (vnode) {
		return m(attrs.root, attrs.rootAttrs, {onclick: this.submit}, "Submit")
	}
});


let primaryButton = component({
	base: button,
	getClassList (attrs) {
		// access base method
		let classList = this.base.getClassList.bind(this, attrs);
		classList.shift("primary");
		return classList;
	}
});
```

# Validate attributes
Every time a component is rendered, its `validateAttrs` method is called.
One should check attributes and raise exception as per required.

In the example above rendering `page` without `heading` or `content` will throw error.
```javascript
// throws exception "Heading is required."
m(page)

// won't throw error
m(page, {
	heading: m("h1", "A heading"),
	content: m("p", "A content")
})
```

# Default attributes
Components can have default attributes which are merged with attributes passed by user.
User passed attributes override default attributes.

```javascript
let redButton = component({
	getDefaultAttrs (attrs) {
		return {color: "red"};
	},
	getClassList (attrs) {
		return ["ui", attrs.color, "button"]
	},
	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, vnode.children);
	}
});


// change color to blue
m(redButton, {color: "blue"}, "Blue button")
```

# Passing attributes to root of a component
Attributes like `id, style, on* (event handlers), data-* and class` are made availabe at
`vnode.attrs.rootAttrs`.

```javascript
let button = component({
	view (vnode) {
		let rootAttrs = vnode.attrs.rootAttrs;
		return m("button", rootAttrs, vnode.children);
	}
});

m(button, {id: "aButton", onclick: acallback, "data-item": 1, style: {color: "red"}}, "Like");
// vnode.attrs.rootAttrs = {id: "aButton", onclick: acallback, "data-item": 1, style: {color: "red"}}
```

# Class name for component's root
Class name for component's root is generated from `getClassList()` and is made available at
`vnode.attrs.rootAttrs.className`. Class name is generated using excellent [classnames](https://github.com/JedWatson/classnames);
User supplied class is merged with component's class list.

```javascript
let button = component({
	getClassList (attrs) {
		return [
			"ui",
			{loading: attrs.loading},
			{disabled: attrs.disabled},
			"button"
		];
	},
	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, children);
	}
});


m(button, {disabled: true, color: "blue"}, "Click");
// <button class="ui disabled blue button"></button>
```
