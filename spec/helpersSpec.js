import {insertUserClass,
        getClass,
        validateComponent,
        getAttrs,
        getVnode,
		isRootAttr,
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
                return {cha: 1};
            },
            getClassList () {
                return [];
            }
        };
    });

    it("merges user supplied attributes with default attributes.", () => {
        expect(getAttrs({nye: 2}, component)).to.eql({cha: 1, nye: 2, rootAttrs: {}});
    });

    it("attaches class to root element attributes", () => {
        let got = getAttrs({class: "aclass"}, component);
        let expected = {class: "aclass", cha: 1, rootAttrs: {className: "aclass"}};
        expect(got).to.eql(expected);
    });

	it("attaches 'id' to root element attributes", () => {
        let got = getAttrs({id: "aId"}, component);
        let expected = {id: "aId", cha: 1, rootAttrs: {id: "aId"}};
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
          return {nye: 2};
      },
      getClassList () {
        return [];
      }
    };
  });

	it("attaches given attribute merged with default attributes to vnode.attrs", () => {
		let attrs = {cha: 1};
		let children = ["child"];
		let got = getVnode(attrs, children, component);
		expect(got.attrs).to.eql({cha: 1, nye: 2, rootAttrs: {}});
	});

	it("attaches default attribute to vnode.attrs if no attribute was passed", () => {
		let children = ["child"];
		let got = getVnode([], children, component);
		expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
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
		expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
		expect(got.children).to.eql([]);
		expect(got.state).to.eql(component);
	});
});


describe("isRootAttrs", () => {
	it("returns true for 'id'.", () => {
		expect(isRootAttr(null, "id")).to.equal(true);
	});

	it("returns true for 'style'.", () => {
		expect(isRootAttr(null, "style")).to.equal(true);
	});

	it("returns true for 'on*'.", () => {
		expect(isRootAttr(null, "onclick")).to.equal(true);
	});

	it("returns true for 'data-*'.", () => {
		expect(isRootAttr(null, "data-key")).to.equal(true);
	});

	it("returns false for rest.", () => {
		expect(isRootAttr(null, "xon")).to.equal(false);
		expect(isRootAttr(null, "keydata-1")).to.equal(false);
	});
});
