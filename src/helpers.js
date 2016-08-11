import classNames from "classnames";
import isObject from "lodash/isObject";
import isArray from "lodash/isArray";
import merge from "lodash/merge";
import clone from "lodash/clone";
import pickBy from "lodash/pickBy";


let insertUserClass = (classList, userClass) => {
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
};

let getClass = (classList, userClass) => {
  return classNames(insertUserClass(classList, userClass));
};

let validateComponent = (comp) => {
  if (!comp.view) throw Error("View is required.");
};

let isAttr = (attrs) => {
  return !isArray(attrs) && isObject(attrs) && !(attrs.view || attrs.tag) && !attrs.length
	? true
	: false;
};

let isRootAttr = (value, key) => {
	return /^(id|style|on.*|data-.*)$/.test(key)? true: false;
};

let getAttrs = (attrs, component) => {
	let defaultAttrs = component.getDefaultAttrs(attrs);
	let newAttrs = {};

	if(isAttr(attrs)) {
		newAttrs = merge(clone(defaultAttrs), attrs);
	}
	else {
		newAttrs = defaultAttrs;
	}

	newAttrs.rootAttrs = merge(newAttrs.rootAttrs, pickBy(newAttrs, isRootAttr));

	let newClassName = getClass(component.getClassList(newAttrs), newAttrs.class);
	if (newClassName) {
		newAttrs.rootAttrs.className = newClassName;
	}

	return newAttrs;
};

let getVnode = (attrs, children, component) => {
  let newAttrs = getAttrs(attrs, component);

  if (isAttr(attrs)) {
	return {attrs: newAttrs, children, state : component};
  }

  children.unshift(attrs);

  return {attrs: newAttrs, children, state: component};
};

export {insertUserClass, getClass, validateComponent, getAttrs, getVnode, isAttr, isRootAttr};
