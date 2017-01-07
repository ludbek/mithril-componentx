import {Component, merge} from "../src/index.js";
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

	it("works with empty destination", () => {
		let destination = {};
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
				e: 0
			},
			f: 0
		};

		expect(merge(destination, source)).to.eql(expected);
	});
});


describe("Component", () => {
	describe("localizeSelector", () => {});

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
div[data-component=Component] {
  xxx: xxx;
  yyy: yyy;
}
div[data-component=Component] .class {
  xxx: xxx;
  yyy: yyy;
}
div.class[data-component=Component], p[data-component=Component], #aId[data-component=Component] {
  xxx: xxx rgb(1, 2, 3);
}
div.class[data-component=Component] {
  xxx: xxx;
}
div#id[data-component=Component] {
  xxx: xxx;
}
.class[data-component=Component] {
  xxx: xxx;
}
#id[data-component=Component] {
  xxx: xxx;
}
@media xxx {
  div[data-component=Component] {
    xxx: xxx;
  }
  .class[data-component=Component] {
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
			let aComponent = new Component();
			let got = aComponent.genStyle(inputStyle);
			expect(got).to.eql(expectedStyle);
		});

	});

	describe("attachStyle", () => {
		before(() => {
			global.document = new mocks.MockBrowser().getDocument();
		});

		it("attaches given style to head", () => {
			let aComponent = new Component();
			aComponent.attachStyle("hello there");
			let style = document.getElementById("Component-style");

			expect(style).to.exist;
			expect(style.textContent).to.equal("hello there");
		});

		after(() => {
			delete global.document;
		});
	});

	describe("insertUserClass", () => {
		let aComponent = new Component();

		it("returns user supplied class if class list is empty", () => {
			let classList = [];
			expect(aComponent.insertUserClass(classList, "aclass")).to.eql(['aclass']);
		});

		it("prepends user supplied class if class list has single class", () => {
			let classList = ["bclass"];
			expect(aComponent.insertUserClass(classList, "aclass")).to.eql(['aclass', 'bclass']);
		});

		it("inserts user supplied class before final class", () => {
			let classList = ["aclass", "cclass"];
			expect(aComponent.insertUserClass(classList, "bclass")).to.eql(['aclass', 'bclass', "cclass"]);
		});
	});

	describe("getClass", () => {
		let aComponent = new Component();

		it("converts class list into a string", () => {
			expect(aComponent.getClass(["aclass", "bclass"])).to.equal("aclass bclass");
		});

		it("removes invalid class names", () => {
			expect(aComponent.getClass(["aclass", null, "", undefined, false])).to.equal("aclass");
		});

		it("includes user supplied class", () => {
			expect(aComponent.getClass(["aclass", "cclass"], "bclass")).to.equal("aclass bclass cclass");
		});
	});

	describe("getAttrs", () => {
		let component;
		beforeEach(() => {
			class XComponent extends Component {
				getDefaultAttrs () {
					return {cha: 1};
				}

				getClassList () {
					return [];
				}

				view () {}
			}

			component = new XComponent();
		});

		it("merges user supplied attributes with default attributes.", () => {
			let got = component.getAttrs({attrs: {nye: 2}});
			let expected = {
				cha: 1,
				nye: 2,
				rootAttrs: {
					"data-component": "XComponent"
				}
			};
			expect(got).to.eql(expected);
		});

		it("attaches class to root element attributes", () => {
			let got = component.getAttrs({attrs: {class: "aclass"}});
			let expected = {
				class: "aclass",
				cha: 1,
				rootAttrs: {
					class: "aclass",
					"data-component": "XComponent"
				}
			};
			expect(got).to.eql(expected);
		});

		it("attaches 'id' to root element attributes", () => {
			let got = component.getAttrs({attrs: {id: "aId"}});
			let expected = {
				id: "aId",
				cha: 1,
				rootAttrs: {
					id: "aId",
					"data-component": "XComponent"
				}
			};
			expect(got).to.eql(expected);
		});

		it("attaches component name to root element attributes.", () => {
			let got = component.getAttrs({attrs: {}});
			expect(got.rootAttrs).to.eql({"data-component": "XComponent"});
		});
	});


	describe("isRootAttrs", () => {
		let aComponent;

		beforeEach(() => {
			aComponent = new Component();
		});

		it("returns false for lifecyle methods", () => {
			expect(aComponent.isRootAttr("oninit")).to.equal(false);
			expect(aComponent.isRootAttr("oncreate")).to.equal(false);
			expect(aComponent.isRootAttr("onbeforeupdate")).to.equal(false);
			expect(aComponent.isRootAttr("onupdate")).to.equal(false);
			expect(aComponent.isRootAttr("onbeforeremove")).to.equal(false);
			expect(aComponent.isRootAttr("onremove")).to.equal(false);
		});

		it("returns true for 'key'.", () => {
			expect(aComponent.isRootAttr("key")).to.equal(true);
		});

		it("returns true for 'id'.", () => {
			expect(aComponent.isRootAttr("id")).to.equal(true);
		});

		it("returns true for 'style'.", () => {
			expect(aComponent.isRootAttr("style")).to.equal(true);
		});

		it("returns true for 'on*'.", () => {
			expect(aComponent.isRootAttr("onclick")).to.equal(true);
		});

		it("returns true for 'data-*'.", () => {
			expect(aComponent.isRootAttr("data-key")).to.equal(true);
		});

		it("returns true for 'config'.", () => {
			expect(aComponent.isRootAttr("data-key")).to.equal(true);
		});

		it("returns false for rest.", () => {
			expect(aComponent.isRootAttr("xon")).to.equal(false);
			expect(aComponent.isRootAttr("keydata-1")).to.equal(false);
		});
	});

	describe(".oninit", () => {
		let vnode, component;

		beforeEach(() => {
			global.document = new mocks.MockBrowser().getDocument();

			vnode = {
				attrs: {
					nye: 2
				}
			};

			class XComponent extends Component {
				validateAttrs (attrs) {
					if (attrs.cha !== 1) throw Error("'Cha' should be 1.");
				}

				getDefaultAttrs (vnode) {
					return {
						cha: 1
					};
				}

				getStyle (vnode) {
					return {
						"div": {
							"background-color": "#fff"
						}
					};
				}
			};

			component = new XComponent();
		});

		it("adds default attributes", () => {
			component.oninit(vnode);
			let expected = {
				cha: 1,
				nye: 2,
				rootAttrs: {
					"data-component": "XComponent"
				}
			};
			expect(vnode.attrs).to.eql(expected);
		});

		it("validates attributes", () => {
			vnode.attrs.cha = 2;

			expect(component.oninit.bind(component, vnode)).to.throw(Error);
		});

		it("attaches style to head if component's getStyle returns non null value.", () => {
			component.oninit(vnode);

			let style = document.getElementById("XComponent-style");
			expect(style).to.exist;
		});


		it("won't attach the style for a component if it already attached.", () => {
			component.oninit(vnode);
			component.oninit(vnode);

			let style = document.querySelectorAll("#XComponent-style");
			expect(style.length).to.equal(1);
		});
    });

	describe("onbeforeupdate", () => {
		let vnode, component;

		beforeEach(() => {
			vnode = {
				attrs: {
					nye: 2
				}
			};

			class XComponent extends Component {
				validateAttrs (attrs) {
					if (attrs.cha !== 1) throw Error("'Cha' should be 1.");
				}

				getDefaultAttrs (vnode) {
					return {
						cha: 1
					};
				}

				getStyle (vnode) {
					return {
						"div": {
							"background-color": "#fff"
						}
					};
				}
			};

			component = new XComponent();
		});

		it("adds default attributes", () => {
			component.onbeforeupdate(vnode);
			let expected = {
				cha: 1,
				nye: 2,
				rootAttrs: {
					"data-component": "XComponent"
				}
			};
			expect(vnode.attrs).to.eql(expected);
		});

		it("validates attributes", () => {
			vnode.attrs.cha = 2;

			expect(component.onbeforeupdate.bind(component, vnode)).to.throw(Error);
		});
	});
});
