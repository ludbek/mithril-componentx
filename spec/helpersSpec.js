import {insertUserClass, getClass, validateComponent, getAttrs, getVnode} from "../src/helpers.js";
import chai from "chai";

let expect = chai.expect;

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
