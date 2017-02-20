# Introduction

A component factory for [Mithril](https://github.com/lhorie/mithril.js).

# Feature

- class based component
- attribute validation
- default attributes
- mixins
- localized css
- powerful class name generator for component's root dom
- transparent communicatin with componnent's root dom from hyperscript

# Requirement
- Mithril 1.x.x

For Mithril 0.2.x please use version 0.5.x

# Installation
## NPM
`npm install mithril-componentx`

## Bower
`bower install mithril-componentx`

# Compatibility
`mithril-componentx` works with all the modern browsers. For old ones please use shim like [this](https://github.com/es-shims/es5-shim).

# Quick overview
```javascript
import Component from "mithril-componentx";

class Grid extends Component {
	getClassList (vnode) {
		return [
			"ui",
			"grid"
			];
	}

	view ({attrs, children, state}) {
		return m("div", attrs.rootAttrs, vnode.children);
	}
}

let grid = new Grid();

class Page extends Component {
	validateAttrs (attrs) {
		if (!attrs.heading) throw Error("Heading is required.");
		if (!attrs.content) throw Error("Content is required.");
	}

	view (vnode) {
		return m("div", vnode.attrs.heading, vnode.attrs.content);
	}
}

let page = new Page();

class ItemsPage extends Page {
	getDefaultAttrs (attrs) {
		return {
			heading: m("h1", "List of awesome stuff."),
			content: m(grid, /*list of stuff*/)
		};
	}
}

let itemsPage = new ItemsPage();

m.render(document.body, itemsPage);

```

# Create a component

```javascript
import Component from "mithril-componentx";

class Page extends Component {
	oninit (vnode) {
		// do some initialization
	}

	onremove (vnode) {
		// do some clean up
	}

	validateAttrs (attrs) {
		if (!attrs.heading) throw Error("Heading is required.");
		if (!attrs.content) throw Error("Content is required.");
	}

	view (vnode) {
		return m("div", vnode.attrs.heading, vnode.attrs.content);
	}
}
```
# Using a component
```javascript
let page = new Page();

// throws exception "Heading is required."
m(page)

m(page, {
	heading: m("h1", "A heading"),
	content: m("p", "A content")
})
```

# Extending a component
Specify a base for new component. New properties overrides base properties.
However the base component is available at new component's `base` property.

```javascript
class Button extends Component {
	getClassList (vnode) {
		return [
			"ui",
			"button"
			];
	}

	submit (e) {
		/* submit form */
	}

	view (vnode) {
		return m(attrs.root, attrs.rootAttrs, {onclick: this.submit}, "Submit")
	}
}


class PrimaryButton extends Button {
	getClassList (vnode) {
		let classList = super.getClassList(vnode);
		classList.unshift("primary");
		return classList;
	}
}
```

# Validate attributes
Every time a component is mounted or updated, its `validateAttrs` method is called.
One should check attributes and raise exception as per required.

In the example below rendering `page` without `heading` or `content` will throw error.
```javascript
import Component from "mithril-componentx";

class Page extends Component {
	validateAttrs (attrs) {
		if (!attrs.heading) throw Error("Heading is required.");
		if (!attrs.content) throw Error("Content is required.");
	}

	view (vnode) {
		return m("div", vnode.attrs.heading, vnode.attrs.content);
	}
}

let page = new Page();

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
class RedButton extends Component {
	getDefaultAttrs (vnode) {
		return {color: "red"};
	}

	getClassList (vnode) {
		return ["ui", attrs.color, "button"]
	}

	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, vnode.children);
	}
}

let redButton = new RedButton();

// change color to blue
m(redButton, {color: "blue"}, "Blue button");
```


# Mixins
Components can be composed out of mixins.
Mixins are plain javascript objects not a class.
Attach mixins at component's prototype chain because mixins are applied while instanciating an object.

```javascript
let buttonValidator : {
	validateAttrs (attrs) {
		if (!attrs.label) throw Error("Please pass a label for the button.");
	}
}

let roundedCorners: {
	getDefaultAttrs (vnode) {
		return {
			style: {
				"border-radius": "5px"
		   }
		}
	}
}

let sharpCorners: {
	getDefaultAttrs (vnode) {
		return {
			style: {
				"border-radius": "0px"
		   }
		}
	}
}


class Button1 extends Component {
	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, vnode.attrs.label);
	}
}

Button1.prototype.mixins = [buttonValidator, roundedCorners];


class Button2 extends Component {
	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, vnode.attrs.label);
	}
}

Button2.prototype.mixins = [buttonValidator, sharpCorners];
```

# Localized styling
The main problem with css is they reside in separate files and they are static.
One solution to this problem is inline styles. The components created with this
component factory already support styling component's root dom. But still inline
styling suffers from following problem:

- does not support pseudo classes
- does not support media query
- styles applied at parent element does not affect its child elements

`mithril-componentx` supports localized styling. Components can define `getStyle()` method which
returns JSON. Thus returned JSON is converted to proper CSS and attached
to head just before component is mounted to the DOM. The style is attached only once per component type.

```javascript
class Dialog extends Component {
	name: "dialog", // name is required for localizing style, else will throw error.
	getStyle (vnode) {
		// The JSON is one to one mapping of CSS as we will see later.
		// If a property is in 'camelCase', it will be converted to 'snake-case'.
		// The selector must start with root dom, in this example its ".tble",
		// check the root dom at the view.
		return {
			".tbl": {
				"display": "table",
				"height": "100%"
			},
			".tbl .tbl-cl": {
				"display": "table-cell",
				"vertical-align": "middle",
				"textAlign": "center" // 'textAlign' be converted to 'text-align'
			}
		};
	}

	view (vnode) {
		// rootAttrs has attribute which helps localize the style
		// in this case its [data-component=Dialog]
		return m(".tbl", vnode.attrs.rootAttrs,
			m(".tbl-cl", vnode.children));
	}
}
```

The style in above example is attached to head in following format.
```css
<style id="Dialog-style">
// data-component is the attribute of root dom
[data-component=Dialog].tbl {
  display: table;
  height: 100%;
}
[data-component=Dialog].tbl .tbl-cl {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
</style>
```

# Passing attributes to root of a component
Attributes like `id, style, on* (event handlers), data-* and class` are made availabe at
`vnode.attrs.rootAttrs`.

```javascript
class Button extends Component {
	view (vnode) {
		let rootAttrs = vnode.attrs.rootAttrs;
		return m("button", rootAttrs, vnode.children);
	}
}

let button = new Button();

m(button, {id: "aButton", onclick: acallback, "data-item": 1, style: {color: "red"}}, "Like");
// vnode.attrs.rootAttrs = {id: "aButton", onclick: acallback, "data-item": 1, style: {color: "red"}}
```

Override `isRootAttr` method to change the default behaviour.

```javascript
class Button extends Component {
	isRootAttr (key) {
		return /^(onclick|style)$/.test(key)? true: false;
	}

	view (vnode) {
		let rootAttrs = vnode.attrs.rootAttrs;
		return m("button", rootAttrs, vnode.children);
	}
}

let button = new Button();

m(button, {id: "aButton", onclick: acallback, "data-item": 1, style: {color: "red"}}, "Like");
// vnode.attrs.rootAttrs = {onclick: acallback,style: {color: "red"}}
```

# Class name for component's root
Class name for component's root is generated from `getClassList()` and is made available at
`vnode.attrs.rootAttrs.className`.
Falsy values like `null`, `undefined`, `fals` and `''` are excluded while generating class string.
User supplied class is merged with component's class list.

```javascript
class Button extends Component {
	getClassList (vnode) {
		return [
			"ui",
			attrs.loading && "loading",
			attrs.disabled && "disabled",
			"button"
		];
	}

	view (vnode) {
		return m("button", vnode.attrs.rootAttrs, children);
	}
}

let button = new Button();

m(button, {disabled: true, class: "blue"}, "Click");
// <button class="ui disabled blue button"></button>
```

# Isolated component
Isolated components can be individually redrawn without diffing entire Mithril app.
Any component which implements `isolatedView()` method can be individually redrawn using `redraw()` method.

The dom returned by `isolatedView()` is rendered at the root dom return by `view()`.
The isolated components do redraw in response to global app redraw.
To completly isolate it from app return `false` from `onbeforeupdate`.

View example below live [here](http://jsbin.com/bexezeh/edit?js,console,output).
```javascript
class Clock extends Component {
  oninit (vnode) {
    super.oninit(vnode);
    this.timer = setInterval(() => {
      this.time = new Date() + "";
      this.redraw();
    }, 1000);
  }
  onremove (vnode) {
    clearInterval(this.timer);
  }
  isolatedView (vnode) {
    console.log("@ clock isolated view");
    return m("span", this.time);
  }
  view (vnode) {
    console.log("@ clock root element");
    return m("h1");
  }
}

var clock = new Clock();

class App extends Component { 
  view (vnode) {
    console.log("@ app");
    return m("div", m(clock));
  }
}

var app = new App();

m.mount(document.body, app);
```
