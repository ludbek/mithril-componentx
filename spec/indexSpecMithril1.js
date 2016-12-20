import {factory, base, validateComponent, isMithril1, merge} from "../src/index.js";
import chai from "chai";
import {mocks} from "mock-browser";

let expect = chai.expect;

let noop = function () {};

describe("merge", () => {
	it("merges source with destination", () => {
		let destination = {
			a: 1,
			b: {
				c: 1,
				d: 1
			}
		};
		let source = {
			a: 0,
			b: {
				e: 0
			},
			f: 0
		};

		let expected = {
			a: 0,
			b: {
				c: 1,
				d: 1,
				e: 0
			},
			f: 0
		};

		expect(merge(destination, source)).to.eql(expected);
	});
});




describe("validateComponent", () => {
	it("complains if component lacks view", () => {
		expect(validateComponent.bind(base, {})).to.throw(Error);
	});

	it("won't complain if component has view", () => {
		expect(validateComponent.bind(base, {view () {}})).not.to.throw(Error);
	});
});


// describe("isMithril1", () => {
// 	it("returns true for mithril version 1.x.x", () => {
// 		let m = {
// 			version: "1.0.0"
// 		};
// 		expect(isMithril1(m)).to.equal(true);
// 	});
//
// 	it("returns false for mithril version 0.x.x", () => {
// 		let m = {
// 			version: "0.2.0"
// 		};
// 		expect(isMithril1(m)).to.equal(false);
// 	});
// });


describe("base", () => {
	describe("genStyle", () => {
		let inputStyle, expectedStyle;

		beforeEach(() => {
			inputStyle = {
				div: {
					xxx: "xxx",
					yyy: "yyy"
				},
				"div .class": {
					xxx: "xxx",
					yyy: "yyy"
				},
				"div.class, p,#aId": {
					xxx: "xxx rgb(1, 2, 3)"
				},
				"div.class": {
					xxx: "xxx"
				},
				"div#id": {
					xxx: "xxx"
				},
				".class": {
					xxx: "xxx"
				},
				"#id": {
					xxx: "xxx"
				},
				"@media xxx": {
					div: {
						xxx: "xxx"
					},
					".class": {
						xxx: "xxx"
					}
				},
				"@keyframe xxx": {
					"0%": {
						xxx: "xxx"
					},
					from: {
						xxx: "xxx"
					},
					to: {
						xxx: "xxx"
					}
				}
			};

			expectedStyle = `
div[data-component=aComponent] {
  xxx: xxx;
  yyy: yyy;
}
div[data-component=aComponent] .class {
  xxx: xxx;
  yyy: yyy;
}
div.class[data-component=aComponent], p[data-component=aComponent], #aId[data-component=aComponent] {
  xxx: xxx rgb(1, 2, 3);
}
div.class[data-component=aComponent] {
  xxx: xxx;
}
div#id[data-component=aComponent] {
  xxx: xxx;
}
.class[data-component=aComponent] {
  xxx: xxx;
}
#id[data-component=aComponent] {
  xxx: xxx;
}
@media xxx {
  div[data-component=aComponent] {
    xxx: xxx;
  }
  .class[data-component=aComponent] {
    xxx: xxx;
  }
}
@keyframe xxx {
  0% {
    xxx: xxx;
  }
  from {
    xxx: xxx;
  }
  to {
    xxx: xxx;
  }
}
`;

		});

		it("adds component to style to increase specificity", () => {
			let got = base.genStyle(inputStyle, "aComponent");
			expect(got).to.eql(expectedStyle);
		});

	});

	describe("localizeStyle", () => {
	});

	describe("attachStyle", () => {
		before(() => {
			global.document = new mocks.MockBrowser().getDocument();
		});

		it("attaches given style to head", () => {
			base.attachStyle("hello there", "aComponent");
			let style = document.getElementById("aComponent-style");

			expect(style).to.exist;
			expect(style.textContent).to.equal("hello there");
		});

		after(() => {
			delete global.document;
		});
	});

	describe("insertUserClass", () => {
		it("returns user supplied class if class list is empty", () => {
			let classList = [];
			expect(base.insertUserClass(classList, "aclass")).to.eql(['aclass']);
		});

		it("prepends user supplied class if class list has single class", () => {
			let classList = ["bclass"];
			expect(base.insertUserClass(classList, "aclass")).to.eql(['aclass', 'bclass']);
		});

		it("inserts user supplied class before final class", () => {
			let classList = ["aclass", "cclass"];
			expect(base.insertUserClass(classList, "bclass")).to.eql(['aclass', 'bclass', "cclass"]);
		});
	});

	describe("getClass", () => {
		it("converts class list into a string", () => {
			expect(base.getClass(["aclass", "bclass"])).to.equal("aclass bclass");
		});

		it("removes invalid class names", () => {
			expect(base.getClass(["aclass", null, "", undefined])).to.equal("aclass");
		});

		it("includes user supplied class", () => {
			expect(base.getClass(["aclass", "cclass"], "bclass")).to.equal("aclass bclass cclass");
		});
	});

	describe("getAttrs", () => {
		let component;
		beforeEach(() => {
			component = factory({
				getDefaultAttrs () {
					return {cha: 1};
				},
				getClassList () {
					return [];
				},
				view () {}
			});
		});

		it("merges user supplied attributes with default attributes.", () => {
			let got = component.getAttrs({nye: 2});
			let expected = {cha: 1, nye: 2, rootAttrs: {}};
			expect(got).to.eql(expected);
		});

		it("attaches class to root element attributes.", () => {
			let got = component.getAttrs({class: "aclass"});
			let expected = {class: "aclass", cha: 1, rootAttrs: {class: "aclass"}};
			expect(got).to.eql(expected);
		});

		it("attaches 'id' to root element attributes.", () => {
			let got = component.getAttrs({id: "aId"});
			let expected = {id: "aId", cha: 1, rootAttrs: {id: "aId"}};
			expect(got).to.eql(expected);
		});

		it("attaches component name to root element attributes.", () => {
			let component = factory({
				name: "greenBottle",
				view: function () {}});

			let got = component.getAttrs({}, component);
			expect(got.rootAttrs).to.eql({"data-component": "greenBottle"});
		});

		it("overrides component's name with attrs[data-component].", () => {
			let aComponent = factory({
				name: "aComponent",
				view () {}
			});

			let got = aComponent.getAttrs({"data-component": "bComponent"});
			expect(got.rootAttrs["data-component"]).to.equal("bComponent");
		});
	});

	describe("isAttr", () => {
	  it("returns false if it has .tag attribute", () => {
		expect(base.isAttr({tag: 'atag'})).to.equal(false);
	  });

	  it("returns false if it has .view attribute", () => {
		expect(base.isAttr({view: noop})).to.equal(false);
	  });

	  it("returns false if it is an array", () => {
		expect(base.isAttr([])).to.equal(false);
	  });

	  it("returns true if it is an object without .tag and .view attributes", () => {
		expect(base.isAttr({})).to.equal(true);
	  });
	});

	describe("getVnode", () => {
	  let component;

	  beforeEach(() => {
		component = factory({
		  getDefaultAttrs () {
			  return {nye: 2};
		  },
		  getClassList () {
			return [];
		  },
		  view () {}
		});
	  });

		it("attaches given attribute merged with default attributes to vnode.attrs", () => {
			let attrs = {cha: 1};
			let children = ["child"];
			let got = component.getVnode(attrs, children);
			expect(got.attrs).to.eql({cha: 1, nye: 2, rootAttrs: {}});
		});

		it("attaches default attribute to vnode.attrs if no attribute was passed", () => {
			let children = ["child"];
			let got = component.getVnode([], children);
			expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
		});

		it("attaches given children to vnode.children", () => {
			let children = ["child"];
			let got = component.getVnode({}, children);
			expect(got.children).to.eql(children);
		});

		it("identifies the child node even if attribute is absent", () => {
			let got = component.getVnode(1, [2]);
			expect(got.children).to.eql([1,2]);
		});

		it("returns object with attributes, children and state", () => {
			let got = component.getVnode({}, []);
			expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
			expect(got.children).to.eql([]);
			expect(got.state).to.eql(component);
		});
	});


	describe("isRootAttrs", () => {
		it("returns true for 'id'.", () => {
			expect(base.isRootAttr("id")).to.equal(true);
		});

		it("returns true for 'style'.", () => {
			expect(base.isRootAttr("style")).to.equal(true);
		});

		it("returns true for 'on*'.", () => {
			expect(base.isRootAttr("onclick")).to.equal(true);
		});

		it("returns true for 'data-*'.", () => {
			expect(base.isRootAttr("data-key")).to.equal(true);
		});

		it("returns true for 'config'.", () => {
			expect(base.isRootAttr("data-key")).to.equal(true);
		});

		it("returns false for rest.", () => {
			expect(base.isRootAttr("xon")).to.equal(false);
			expect(base.isRootAttr("keydata-1")).to.equal(false);
		});
	});

	describe("is", () => {
		it("returns true if component is of given type.", () => {
			let fruit = factory({
				name: "fruit",
				view () {}
			});

			let apple = factory({
				name: "apple",
				base: fruit,
			});

			expect(apple.is("apple")).to.equal(true);
			expect(apple.is("fruit")).to.equal(true);
			expect(apple.is("banana")).to.equal(false);
		});
	});
});

describe("factory", () => {
	let vdom;

	beforeEach(() => {
		global.document = new mocks.MockBrowser().getDocument();

		vdom = {
			attrs: {}
		};
	});

	afterEach(() => {
		delete global.document;
	});

    it("validates component", () => {
        expect(factory.bind(factory, {})).to.throw(Error);

        let struct = {
            view () {
            }
        };
        expect(factory.bind(factory, struct)).not.to.throw(Error);
    });

    it("returns valid mithril component", () => {
        let struct = {
            view () {
            }
        };

        let aComponent = factory(struct);

        expect(aComponent.view).to.exist;
    });

    it("merges new component with base component", () => {
        let struct = {
            base: {one: 1},
            view () {}
        };

        let newComponent = factory(struct);
        expect(newComponent.one).to.equal(1);
        expect(newComponent.view).to.exist;
    });

    it("overrides base's property with new component's property", () => {
        let struct = {
            base: {one: 1},
            one: 2,
            view () {}
        };

        let newComponent = factory(struct);
        expect(newComponent.one).to.equal(2);
    });

    it("does not wrap already wrapped view.", () => {
        let aStruct = {
            view (vnode) {
                return "a component's view";
            }
        };
        let aComponent = factory(aStruct);
        let bStruct = {
            base: aComponent
        };
        let bComponent = factory(bStruct);
        expect(bComponent.view(vdom)).to.equal(aStruct.view());
    });


	it("supports mixins", () => {
		let struct = {
			base: {zero: 0},
			mixins: [{one: 1}, {two: 2}],
			view (vnode) {}
		};

        let aComponent = factory(struct);
		expect(aComponent.zero).to.equal(0);
		expect(aComponent.one).to.equal(1);
		expect(aComponent.two).to.equal(2);
	});

    describe("aComponent", () => {
        describe(".view", () => {
            let vdom, struct, check, checkThis;

            beforeEach(() => {
				vdom = {
					children: ["child1", "child2"],
					attrs: {}
				};

                struct = {
                    one: 1,
                    view (vnode) {
                        check = vnode;
                        checkThis = this;
                    }
                };
            });

            it("calls original view with vnode", () => {
				var aComponent = factory(struct);
				aComponent.view(vdom);

				expect(check).to.exist;
            });

            it("passes vnode to original view", () => {
                let aComponent = factory(struct);
				vdom.attrs = {attr1: 1};
				vdom.state = aComponent;
				aComponent.view(vdom);

				expect(check.attrs).to.eql({attr1: 1, rootAttrs: {}});
                expect(check.children).to.eql(["child1", "child2"]);
                expect(check.state).to.equal(aComponent);
            });

            it("binds component to original view's 'this'", () => {
                let aComponent = factory(struct);
                aComponent.view(vdom);

                expect(checkThis).to.equal(aComponent);
            });

            it("throws error if attributes validation fails", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.one !== 1) throw Error("One should be 1.");
                };

                let aComponent = factory(struct);
				vdom.attrs = {one: 2};
                expect(aComponent.view.bind(aComponent, vdom)).to.throw(Error);
            });

            it("does not throw if attributes validation passes", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.cha !== 1) throw Error("Cha should be 1.");
                };

                let aComponent = factory(struct);
				vdom.attrs = {cha: 1};
                expect(aComponent.view.bind(aComponent, vdom)).not.to.throw(Error);
            });

            it("'s vnode attributes is combination of default and user passed attributes", () => {
                struct.getDefaultAttrs = function () {
                    return {attr1: 1};
                };

                let aComponent = factory(struct);
				vdom.attrs = {attr2: 2};
                aComponent.view(vdom);
                expect(check.attrs).to.eql({attr1: 1, attr2: 2, rootAttrs: {}});
            });

            it("'s vnode.attr.rootAttrs.class is constructed out of class list", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "bclass"];
                };

                let aComponent = factory(struct);
                aComponent.view(vdom);
                expect(check.attrs.rootAttrs.class).to.equal("aclass bclass");
            });

            it("'s vnode.attr.rootAttrs.class includes user supplied class", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "cclass"];
                };

                let aComponent = factory(struct);
				vdom.attrs.class = "bclass";
                aComponent.view(vdom);
                expect(check.attrs.rootAttrs.class).to.equal("aclass bclass cclass");
            });

        });

		describe(".oninit", () => {
			let struct, component;

			beforeEach(() => {
				struct = {
					name: "aComponent",
					getStyle (vnode) {
						return {
							"div": {
								"background-color": "#fff"
							}
						};
					},
					view () {}
				};

				component = factory(struct);
			});


			it("attaches style to head if component's getStyle returns non null value.", () => {
				component.oninit();

				let style = document.getElementById("aComponent-style");
				expect(style).to.exist;
			});


			it("won't attach the style for a component if it already attached.", () => {
				component.oninit();

				let style = document.querySelectorAll("#aComponent-style");
				expect(style.length).to.equal(1);
			});

			it("complains if component has style but not name.", () => {
				component.getStyle = function () {
					return {};
				}
				component.name = undefined;

				expect(component.oninit.bind(component)).to.throw(Error);
			});
		});
    });
});
