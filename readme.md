# Introduction

A component factory for [Mithril](https://github.com/lhorie/mithril.js).

# Feature

- Components compatible with [Mithril v1.x](https://github.com/lhorie/mithril.js/tree/rewrite).
- Validates attributes passed to a component.
- Extendable component.
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
			content: m(grid, {class: "stackable"}, /*list of stuff*/)
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
	onint (vnode) {
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

# Vnode
A component's view gets `vnode`.
It has three properties:

1. `attrs` - the attributes passed through hyperscript i.e. `m`
2. `children` - the child elements passed through hyperscript
3. `state` - the component itself

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

# Extending a component
Specify a base for new component.  New properties overrides base properties.
However the base component is available at new component's `base` property.

In example below `itemsPage` extends `page`.

```javascript
let itemsPage = component({
	base: page,
	getDefaultAttrs (attrs) {
		return {
			heading: m("h1", "List of awesome stuff."),
			content: m(grid, {class: "stackable"}, /*list of stuff*/)
		};
	}
});
```
## Access base properties and methods

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
