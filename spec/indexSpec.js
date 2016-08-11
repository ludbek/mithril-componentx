import component from "../src/index.js";
import chai from "chai";

let expect = chai.expect;

describe("component", () => {
    it("validates component", () => {
        expect(component.bind(component, {})).to.throw(Error);

        let struct = {
            view () {
            }
        };
        expect(component.bind(component, struct)).not.to.throw(Error);
    });

    it("returns valid mithril component", () => {
        let struct = {
            view () {
            }
        };

        let aComponent = component(struct);

        expect(aComponent.view).to.exist;
        expect(aComponent.controller).to.exist;
    });

    it("merges new component with base component", () => {
        let struct = {
            base: {one: 1},
            view () {}
        };

        let newComponent = component(struct);
        expect(newComponent.one).to.equal(1);
        expect(newComponent.view).to.exist;
    });

    it("overrides base's property with new component's property", () => {
        let struct = {
            base: {one: 1},
            one: 2,
            view () {}
        };

        let newComponent = component(struct);
        expect(newComponent.one).to.equal(2);
    });

    it("does not wrap already wrapped view.", () => {
        let aStruct = {
            view (vnode) {
                return "a component's view";
            }
        };
        let aComponent = component(aStruct);
        let bStruct = {
            base: aComponent
        };
        let bComponent = component(bStruct);
        expect(bComponent.view()).to.equal(aStruct.view());
    });

    describe("aComponent", () => {
        describe(".view", () => {
            let struct, check, checkThis;

            beforeEach(() => {
                struct = {
                    one: 1,
                    view (vnode) {
                        check = vnode;
                        checkThis = this;
                    }
                };
            });

            it("calls original view with vnode", () => {
                let aComponent = component(struct);
                aComponent.view("ctrl", {}, "child1", "child2");

                expect(check).to.exist;
            });

            it("passes vnode to original view", () => {
                let aComponent = component(struct);
				aComponent.view("ctrl", {attr1: 1}, "child1", "child2");

				expect(check.attrs).to.eql({attr1: 1, dom: {}});
                expect(check.children).to.eql(["child1", "child2"]);
                expect(check.state).to.equal(aComponent);
            });

            it("binds component to original view's 'this'", () => {
                let aComponent = component(struct);
                aComponent.view("ctrl", {}, "child1", "child2");

                expect(checkThis).to.equal(aComponent);
            });

            it("throws error if attributes validation fails", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.one !== 1) throw Error("One should be 1.");
                };

                let aComponent = component(struct);
                expect(aComponent.view.bind(aComponent,
                                            "ctrl",
                                            {one: 2}, "child1", "child2")).to.throw(Error);
            });

            it("does not throw if attributes validation passes", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.cha !== 1) throw Error("Cha should be 1.");
                };

                let aComponent = component(struct);
                expect(aComponent.view.bind(aComponent,
                                            "ctrl",
                                            {cha: 1}, "child1", "child2")).not.to.throw(Error);
            });

            it("'s vnode attributes is combination of default and user passed attributes", () => {
                struct.getDefaultAttrs = function () {
                    return {attr1: 1};
                };

                let aComponent = component(struct);
                aComponent.view("ctrl", {attr2: 2});
                expect(check.attrs).to.eql({attr1: 1, attr2: 2, dom: {}});
            });

            it("'s vnode.attr.dom.className is constructed out of class list", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "bclass"];
                };

                let aComponent = component(struct);
                aComponent.view("ctrl", {attr2: 2});
                expect(check.attrs.dom.className).to.equal("aclass bclass");
            });

            it("'s vnode.attr.dom.className includes user supplied class", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "cclass"];
                };

                let aComponent = component(struct);
                aComponent.view("ctrl", {class: "bclass"});
                expect(check.attrs.dom.className).to.equal("aclass bclass cclass");
            });

        });

        describe(".controller", () => {
            let struct, check, checkThis;

            beforeEach(() => {
                struct = {
                    cha: 1,
                    onremove () {
                        return this.cha;
                    },
                    oninit (vnode) {
                        check = vnode;
                        checkThis = this;
                    },
                    view () {}
                };
            });

            it("calls oninit if exists", () => {
                let aComponent = component(struct);
                let returnObj = new aComponent.controller();
                expect(check).to.exist;
            });

            it("passes vnode to oninit", () => {
                let aComponent = component(struct);
                let returnObj = new aComponent.controller({attr1: 1}, "child1", "child2");

                expect(check.attrs).to.eql({attr1: 1, dom: {}});
                expect(check.children).to.eql(["child1", "child2"]);
                expect(check.state).to.equal(aComponent);
            });

            it("binds oninit to component", () => {
                let aComponent = component(struct);
                let returnObj = new aComponent.controller("attr", "child1", "child2");
                expect(checkThis).to.equal(aComponent);
            });

            it("returns object with onunload if onremove exists", () => {
                let aComponent = component(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload).to.exist;
            });

            it("binds component to onunload method.", () => {
                let aComponent = component(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload()).to.equal(1);
            });

            it("returns object without onunload if onremove does not exist", () => {
                delete struct.onremove;
                let aComponent = component(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload).not.to.exist;
            });
        });
    });
});
