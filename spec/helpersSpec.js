import {insertUserClass,
        getClass,
        validateComponent,
        getAttrs,
        getVnode,
        isAttr} from "../src/helpers.js";
import chai from "chai";

let expect = chai.expect;

let noop = function () {};


describe("insertUserClass", () => {
    it("returns user supplied class if class list is empty", () => {
        let classList = [];
        expect(insertUserClass(classList, "aclass")).to.eql(['aclass']);
    });

    it("prepends user supplied class if class list has single class", () => {
        let classList = ["bclass"];
        expect(insertUserClass(classList, "aclass")).to.eql(['aclass', 'bclass']);
    });

    it("inserts user supplied class before final class", () => {
        let classList = ["aclass", "cclass"];
        expect(insertUserClass(classList, "bclass")).to.eql(['aclass', 'bclass', "cclass"]);
    });
});

describe("getClass", () => {
    it("converts class list into a string", () => {
        expect(getClass(["aclass", "bclass"])).to.equal("aclass bclass");
    });

    it("removes invalid class names", () => {
        expect(getClass(["aclass", null, "", undefined])).to.equal("aclass");
    });

    it("includes user supplied class", () => {
        expect(getClass(["aclass", "cclass"], "bclass")).to.equal("aclass bclass cclass");
    });
});

describe("validateComponent", () => {
    it("complains if component lacks view", () => {
        expect(validateComponent.bind(validateComponent, {})).to.throw(Error);
    });

    it("won't complain if component has view", () => {
        expect(validateComponent.bind(validateComponent, {view () {}})).not.to.throw(Error);
    });
});

describe("getAttrs", () => {
    let component;
    beforeEach(() => {
        component = {
            getDefaultAttrs () {
                return {one: 1};
            },
            getClassList () {
                return [];
            }
        };
    });

    it("merges user supplied attributes with default attributes.", () => {
        expect(getAttrs({two: 2}, component)).to.eql({one: 1, two: 2, dom: {className: ""}});
    });

    it("attaches class name to DOM attributes", () => {
        let got = getAttrs({dom: {className: "aclass"}}, component);
        let expected = {one: 1, dom: {className: "aclass"}};
        expect(got).to.eql(expected);
    });
});

describe("isAttr", () => {
  it("returns false if it has .tag attribute", () => {
    expect(isAttr({tag: 'atag'})).to.equal(false);
  });

  it("returns false if it has .view attribute", () => {
    expect(isAttr({view: noop})).to.equal(false);
  });

  it("returns false if it is an array", () => {
    expect(isAttr([])).to.equal(false);
  });

  it("returns true if it is an object without .tag and .view attributes", () => {
    expect(isAttr({})).to.equal(true);
  });
});

describe("getVnode", () => {
  let component;

  beforeEach(() => {
    component = {
      getDefaultAttrs () {
        return {};
      },
      getClassList () {
        return [];
      }
    };
  });

  it("attaches given attribute merged with default attributes to vnode.attrs", () => {
    let attrs = {one: 1};
    let children = ["child"];
    let got = getVnode(attrs, children, component);
    expect(got.attrs).to.eql({one: 1, dom: {className: ""}});
  });

  it("attaches default attribute to vnode.attrs if no attribute was passed", () => {
    let children = ["child"];
    let got = getVnode([], children, component);
    expect(got.attrs).to.eql({dom: {className: ""}});
  });

  it("attaches given children to vnode.children", () => {
    let children = ["child"];
    let got = getVnode({}, children, component);
    expect(got.children).to.eql(children);
  });

  it("identifies the child node even if attribute is absent", () => {
    let got = getVnode(1, [2], component);
    expect(got.children).to.eql([1,2]);
  });

  it("returns object with attributes, children and state", () => {
    let got = getVnode({}, [], component);
    expect(got.attrs).to.eql({dom: {className: ""}});
    expect(got.children).to.eql([]);
    expect(got.state).to.eql(component);
  });
});
