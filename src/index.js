import assign from "lodash/assign";
import clone from "lodash/clone";
import isObject from "lodash/isObject";
import isFunction from "lodash/isFunction";
import classNames from "classnames";
import isArray from "lodash/isArray";
import merge from "lodash/merge";
import pickBy from "lodash/pickBy";



export const validateComponent = (comp) => {
	if (!comp.view) throw Error("View is required.");
};

export const base = {
	getInlineStyles () {},
    getStyles () {},
	/*
	 * Returns true for attirbutes which are selected for root dom of the component.
	 * */
	isRootAttr (value, key) {
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
	isMithril1 (version) {
		if (/^1\.\d\.\d$/.test(version)) return true;
		return false;
	},

	getAttrs (attrs, component) {
		let defaultAttrs = component.getDefaultAttrs(attrs);
		let newAttrs = {};

		if(this.isAttr(attrs)) {
			newAttrs = merge(clone(defaultAttrs), attrs);
		}
		else {
			newAttrs = defaultAttrs;
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
    let component = assign(clone(struct.base || base), struct);
    validateComponent(component);

    let originalView = component.view.originalView || component.view;

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
        let vnode = component.getVnode(attrs, children, component);

        this.validateAttrs(vnode.attrs);

        return originalView.call(this, vnode);
    };

	component.view.originalView = originalView;

    return component;
};
