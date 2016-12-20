import classNames from "classnames";

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

export const validateComponent = (comp) => {
	if (!comp.view) throw Error("View is required.");
};


export const isMithril1 = () => {
	// for browser
	try {
		if (/^1\.\d\.\d$/.test(m.version)) return true;
		return false;
	}
	// node
	catch (err){
		try {
			require("mithril");
			return false;
		}
		catch (err)  {
			return true;
		}
	}
};

export const base = {
	/*
	 * Generates stylesheet based upon data returned by getStyle()
	 * */
	genStyle (jsStyle, componentName) {
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
	},

	/*
	 * Attaches component name to the key.
	 * This increases specificity.
	 * */
	localizeSelector (key, componentName) {
        if (key.indexOf(",") !== -1) {
            return key.split(",").map((frag) => {
                return this.localizeSelector(frag.trim(), componentName);
            }).join(", ");
        }

		return key
			.replace(/^([^@,%]*?)$/, `$1[data-component=${componentName}]`)
			// reverse for keyframe keys
			.replace(/^(from\[.*?)$/, `from`)
			.replace(/^(to\[.*?)$/, `to`);
	},

	/*
	 * Returns json which will be used by genStyles() to generate stylesheet for this component.
	 * */
    getStyle (vnode) {},

	/*
	 * Attach styles to the head
	 * */
	attachStyle (style, componentName) {
		let node = document.createElement("style");
		node.id = componentName + "-style";

		if (node.styleSheet) {
			node.styleSheet.cssText = style;
		} else {
			node.appendChild(document.createTextNode(style));
		}

		document.getElementsByTagName('head')[0].appendChild(node);
	},

	/*
	 * Returns true for attirbutes which are selected for root dom of the component.
	 * */
	isRootAttr (key) {
		// TODO: if mithril 1.x.x component lifecycle return false
		try {
			return /^(key|id|style|on.*|data-.*|config)$/.test(key)? true: false;
		}
		catch (err) {
			if (err instanceof TypeError) {
				return false;
			}
		}
	},

	/*
	 * Returns true if the first argument to the component is an attribute.
	 * */
	isAttr (attrs) {
	  return !isArray(attrs) && isObject(attrs) && !(attrs.view || attrs.tag) && !attrs.length
		? true
		: false;
	},
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
	},
	getClass (classList, userClass) {
		// attach component name to the classlist
		return classNames(this.insertUserClass(classList, userClass));
	},

	getAttrs (attrs = {}) {
		let defaultAttrs = this.getDefaultAttrs(attrs);
		let newAttrs = {};

		if (!isMithril1()) {
			if(this.isAttr(attrs)) {
				newAttrs = [defaultAttrs, attrs].reduce(merge, {});
			}
			else {
				newAttrs = defaultAttrs;
			}
		}
		else {
			newAttrs = [defaultAttrs, attrs].reduce(merge, {});
		}

		newAttrs.rootAttrs = newAttrs.rootAttrs || {};

		if (this.name) {
			newAttrs.rootAttrs["data-component"] = this.name;
		}

		newAttrs.rootAttrs = merge(newAttrs.rootAttrs, pickBy(newAttrs, this.isRootAttr));

		let newClassName = this.getClass(this.getClassList(newAttrs), newAttrs.class);
		if (newClassName) {
			newAttrs.rootAttrs.class = newClassName;
		}

		return newAttrs;
	},

	getVnode (attrs, children) {
	  let newAttrs = this.getAttrs(attrs);

	  if (this.isAttr(attrs)) {
		return {attrs: newAttrs, children, state : this};
	  }

	  children.unshift(attrs);

	  return {attrs: newAttrs, children, state: this};
	},

    getDefaultAttrs () {
        return {};
    },

    getClassList (attrs) {
        return [];
    },

    validateAttrs (attrs) {},

	is(type) {
		if (this.name === type) {
			return true;
		}
		else if (this.base) {
			return this.base.is(type);
		}

		return false;
	}
};

export const factory = (struct) => {
	let mixins = struct.mixins || [];
	let sources = [base, struct.base || {}].concat(mixins);
	sources.push(struct);
    let component = sources.reduce(assign, {});

    validateComponent(component);

	let originalOninit = component.oninit;
	component.oninit = function (vnode) {
		if (originalOninit) {
			originalOninit.call(this, vnode);
		}

		let style = component.getStyle(vnode);
		let cName = component.name;

		if (style && !cName) {
			throw Error("Cannot style this component without a name. Please name this component.");
		}

		if (!style || style && document.getElementById(cName + "-style")) return;

		component.attachStyle(component.genStyle(style, cName), cName);
	};

    let originalView = component.view.originalView || component.view;

	// for mithril 0.2.x
	if (!isMithril1()) {
		component.controller = function (attrs, ...children) {
			let ctrl = merge({}, component);

			if (component.onremove) {
				ctrl.onunload = component.onremove.bind(ctrl);
			}

			ctrl.oninit && ctrl.oninit(ctrl.getVnode(attrs, children));

			return ctrl;
		};

		component.view = function (ctrl, attrs, ...children) {
			let vnode = ctrl.getVnode(attrs, children);

			ctrl.validateAttrs(vnode.attrs);

			return originalView.call(ctrl, vnode);
		};
	}
	// for mithril 1.x.x
	else {
		component.view = function (vnode) {
			vnode.attrs = this.getAttrs(vnode.attrs);
			this.validateAttrs(vnode.attrs);

			return originalView.call(this, vnode);
		};
	}

	component.view.originalView = originalView;

    return component;
};
