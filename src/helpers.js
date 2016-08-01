import classNames from "classnames";
import isObject from "lodash/isObject";
import isArray from "lodash/isArray";
import merge from "lodash/merge";

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

let getAttrs = (attrs, component) => {
  let defaultAttrs = component.getDefaultAttrs();
  let newAttrs = {};

  if(isAttr(attrs)) {
    newAttrs = merge(defaultAttrs, attrs);
  }
  else {
    newAttrs = defaultAttrs;
  }

  if (!newAttrs.dom) {
    newAttrs.dom = {};
  }

  newAttrs.dom.className = getClass(component.getClassList(newAttrs), newAttrs.dom.className);
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

export {insertUserClass, getClass, validateComponent, getAttrs, getVnode, isAttr};
