import assign from "lodash/assign";
import clone from "lodash/clone";
import isObject from "lodash/isObject";
import isFunction from "lodash/isFunction";
import classNames from "classnames";
import {getVnode, getAttrs, validateComponent} from "./helpers.js";

let base = {
    getDefaultAttrs () {
        return {
            dom: {
                tagName: "div"
            }
        };
    },
    getClassList (attrs) {
        return [];
    },
    validateAttrs (attrs) {}
};

export default (struct) => {
    let component = assign(clone(struct.base || base), struct);
    validateComponent(component);

    let originalView = component.view;

    let ctrlReturn = {};
    if (component.onremove) {
        ctrlReturn.onunload = component.onremove.bind(component);
    }

    component.controller = function (attrs, ...children) {
        let vnode = getVnode(attrs, children, component);
        if (component.oninit) {
            component.oninit(vnode);
        }
        return ctrlReturn;
    };

    // view is already wrapped by component factory
    // happens when base is produced by component factory and its view is not overridden
    if (component.view.wrapped) return component;

    component.view = function (ctrl, attrs, ...children) {
        let vnode = getVnode(attrs, children, component);

        this.validateAttrs(vnode.attrs);

        return originalView.call(component, vnode);
    };

    component.view.wrapped = true;

    return component;
};
