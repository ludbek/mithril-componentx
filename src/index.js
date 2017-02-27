import o from "mithril";

const LIFECYCLE_METHODS = [
	"oninit",
	"oncreate",
	"onbeforeupdate",
	"onupdate",
	"onbeforeremove",
	"onremove"
];

const assign = Object.assign;

const isObject = (data) => {
	return data != null && typeof data === 'object' && isArray(data) === false;
};

const isArray = Array.isArray;

const pickBy = (obj, checker) => {
	return Object.keys(obj).reduce((desiredObj, key) => {
		let value = obj[key];

		if (checker(key)) {
			desiredObj[key] = value;
		}

		return desiredObj;
	}, {});
};

export const merge = (destination, source) => {
	Object.keys(source).forEach((key) => {
		if (isObject(source[key])) {
			destination[key] = merge(isObject(destination[key]) && destination[key] || {}, source[key]);
		}
		else {
			destination[key] = source[key];
		}
	});

	return destination;
};

export class Component {
	getComponentName () {
		return this.constructor.displayName || this.constructor.name;
	}

	constructor () {
		this.mixins = this.mixins || [];
		this.mixins.reduce((acc, mixin) => {
			assign(acc, mixin);
			return acc;
		}, this);
	}
	/*
	 * Generates stylesheet based upon data returned by getStyle()
	 * */
	genStyle (jsStyle) {
		let componentName = this.getComponentName();
		let genSingleLevel = (js, indent = 1) => {
			let leftPad = new Array(indent).join(" ");
			let css = "";

			for (let key in js) {
				if (js.hasOwnProperty(key)) {
					if (typeof js[key] === "object") {
						css += leftPad + this.localizeSelector(key, componentName) + " {\n";

						css += genSingleLevel(js[key], indent + 2);

						css += leftPad + "}\n";
					}
					else {
						// convert camelcase to snake case
						let normalizedKey = key.replace(/([A-Z])/g, `-$1`).toLowerCase();
						css += leftPad + normalizedKey + ": " + js[key] + ";\n";
					}
				}
			}

			return css;
		}


		return "\n" + genSingleLevel(jsStyle);
	}

	/*
	 * Attaches component name to the key.
	 * This increases specificity.
	 * */
	localizeSelector (key, componentName) {
        if (key.indexOf(":") !== -1) {
			let frags = key.split(":");
			frags[0] = this.localizeSelector(frags[0], componentName);
			return frags.join(":");
        }

        if (key.indexOf(",") !== -1) {
            return key.split(",").map((frag) => {
                return this.localizeSelector(frag.trim(), componentName);
            }).join(", ");
        }

		return key
			.replace(/^([^@,%\s]*?)$/, `$1[data-com=${componentName}]`)
			.replace(/^([^@]*?)\s+(.*?)$/, `$1[data-com=${componentName}] $2`)
			// reverse for keyframe keys
			.replace(/^(from\[.*?)$/, `from`)
			.replace(/^(to\[.*?)$/, `to`);
	}

	/*
	 * Returns json which will be used by genStyles() to generate stylesheet for this component.
	 * */
    getStyle (vnode) {}

	/*
	 * Attach styles to the head
	 * */
	attachStyle (style) {
		let componentName = this.getComponentName();
		let node = document.createElement("style");
		node.id = componentName + "-style";

		if (node.styleSheet) {
			node.styleSheet.cssText = style;
		} else {
			node.appendChild(document.createTextNode(style));
		}

		document.getElementsByTagName('head')[0].appendChild(node);
	}

	/*
	 * Returns true for attirbutes which are selected for root dom of the component.
	 * */
	isRootAttr (key) {
		if (LIFECYCLE_METHODS.indexOf(key) !== -1) return false;

		try {
			return /^(key|id|style|on.*|data-.*|config)$/.test(key)? true: false;
		}
		catch (err) {
			if (err instanceof TypeError) {
				return false;
			}
		}
	}

	insertUserClass (classList, userClass) {
	  if (classList.length == 0) {
		return [userClass];
	  }
	  else if (classList.length == 1) {
		classList.unshift(userClass);
		return classList;
	  }
	  else {
		classList.splice(1,0, userClass);
		return classList;
	  }
	}

	getClass (classList, userClass) {
		return this.insertUserClass(classList, userClass)
			.filter((aClass) => {
				return [null, undefined, "", false].indexOf(aClass) === -1;
			})
			.join(" ");
	}

	getAttrs (vnode) {
		let defaultAttrs = this.getDefaultAttrs(vnode) || {};
		let newAttrs = assign(defaultAttrs, vnode.attrs);

		newAttrs.rootAttrs = [
			defaultAttrs.rootAttrs || {},
			newAttrs.rootAttrs || {},
			{"data-com": this.getComponentName()},
			pickBy(newAttrs, this.isRootAttr)
		].reduce(merge, {})

		let newClassName = this.getClass(
				this.getClassList(
					{attrs: newAttrs, children: vnode.children, state: vnode.state}),
				newAttrs.class);
		if (newClassName) {
			newAttrs.rootAttrs.class = newClassName;
		}

		return newAttrs;
	}

    getDefaultAttrs (vnode) {
        return {};
    }

    getClassList (vnode) {
        return [];
    }

    validateAttrs (attrs) {}

	cacheVnode (vnode) {
		this.vnode = vnode;
	}

	redraw () {
		o.render(this.vnode.dom, this.isolatedView(this.vnode));
	}

	oninit (vnode) {
		vnode.attrs = vnode.attrs || {};
		vnode.attrs = this.getAttrs(vnode);
		this.validateAttrs(vnode.attrs);

		this.cacheVnode(vnode);

		let style = this.getStyle(vnode);
		let cName = this.getComponentName();

		if (!style || style && document.getElementById(cName + "-style")) return;

		this.attachStyle(this.genStyle(style, cName), cName);
	}

	oncreate (vnode) {
		this.isolatedView && this.redraw();
	}

	onupdate (vnode) {
		this.isolatedView && this.redraw();
	}

	onbeforeupdate (vnode) {
		vnode.attrs = vnode.attrs || {};
		vnode.attrs = this.getAttrs(vnode);
		this.validateAttrs(vnode.attrs);
		this.cacheVnode(vnode);
	}
};
