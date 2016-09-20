import assign from "lodash/assign";
import clone from "lodash/clone";
import isObject from "lodash/isObject";
import isFunction from "lodash/isFunction";
import classNames from "classnames";
import isArray from "lodash/isArray";
import merge from "lodash/merge";
import pickBy from "lodash/pickBy";
import reduce from "lodash/reduce";



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
	getInlineStyles () {},
    getStyles () {},
	/*
	 * Returns true for attirbutes which are selected for root dom of the component.
	 * */
	isRootAttr (value, key) {
		// TODO: if mithril 1.x.x component lifecycle return false
		return /^(id|style|on.*|data-.*|config)$/.test(key)? true: false;
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
		return classNames(this.insertUserClass(classList, userClass));
	},

	getAttrs (attrs, component) {
		let defaultAttrs = component.getDefaultAttrs(attrs);
		let newAttrs = {};

		if (!isMithril1()) {
			if(this.isAttr(attrs)) {
				newAttrs = merge(clone(defaultAttrs), attrs);
			}
			else {
				newAttrs = defaultAttrs;
			}
		}
		else {
			newAttrs = merge(clone(defaultAttrs), attrs);
		}


		newAttrs.rootAttrs = merge(newAttrs.rootAttrs, pickBy(newAttrs, this.isRootAttr));

		let newClassName = this.getClass(component.getClassList(newAttrs), newAttrs.class);
		if (newClassName) {
			newAttrs.rootAttrs.className = newClassName;
		}

		return newAttrs;
	},

	getVnode (attrs, children, component) {
	  let newAttrs = this.getAttrs(attrs, component);

	  if (this.isAttr(attrs)) {
		return {attrs: newAttrs, children, state : component};
	  }

	  children.unshift(attrs);

	  return {attrs: newAttrs, children, state: component};
	},

    getDefaultAttrs () {
        return {};
    },

    getClassList (attrs) {
        return [];
    },

    validateAttrs (attrs) {}
};

export const factory = (struct) => {
	let mixins = struct.mixins || [];
	let sources = [base, struct.base || {}].concat(mixins);
	sources.push(struct);
    let component = reduce(sources, assign, {});

    validateComponent(component);

    let originalView = component.view.originalView || component.view;

	// for mithril 0.2.x
	if (!isMithril1()) {
		let ctrlReturn = {};
		if (component.onremove) {
			ctrlReturn.onunload = component.onremove.bind(component);
		}

		component.controller = function (attrs, ...children) {
			let vnode = component.getVnode(attrs, children, component);
			if (component.oninit) {
				component.oninit(vnode);
			}
			return ctrlReturn;
		};

		component.view = function (ctrl, attrs, ...children) {
			let vnode = this.getVnode(attrs, children, component);

			this.validateAttrs(vnode.attrs);

			return originalView.call(this, vnode);
		};
	}
	// for mithril 1.x.x
	else {
		component.view = function (vnode) {
			vnode.attrs = this.getAttrs(vnode.attrs, component);
			this.validateAttrs(vnode.attrs);

			return originalView.call(this, vnode);
		};
	}

	component.view.originalView = originalView;

    return component;
};
