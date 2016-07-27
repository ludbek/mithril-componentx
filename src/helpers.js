import classNames from "classnames";
import isObject from "lodash/isObject";
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

let getAttrs = (attrs, component) => {
  let defaultAttrs = component.getDefaultAttrs();
  let newAttrs = {};

  if(isObject(attrs) && !(attrs.view || attrs.tag)) {
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
  attrs = getAttrs(attrs, component);

  if (attrs) {
      return {attrs, children, state : component};
  }

  children.unshift(attrs);
  return {attrs, children, state: component};
};

export {insertUserClass, getClass, validateComponent, getAttrs, getVnode};
