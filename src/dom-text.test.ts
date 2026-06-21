import { describe, it, expect } from "vitest";
import { extractCellText, MinimalNode } from "./dom-text";

// Tiny fake-DOM builders (real DOM nodes satisfy MinimalNode directly).
const text = (s: string): MinimalNode => ({
    nodeType: 3,
    nodeName: "#text",
    textContent: s,
    childNodes: []
});
const el = (name: string, children: MinimalNode[]): MinimalNode => ({
    nodeType: 1,
    nodeName: name,
    textContent: null,
    childNodes: children
});

describe("extractCellText", () => {
    it("returns plain text unchanged", () => {
        expect(extractCellText(el("TD", [text("=a1+b1")]))).toBe("=a1+b1");
    });

    it("restores asterisks the renderer turned into <em>", () => {
        // markdown =round(c2*40%+f2*60%,1) renders as c2<em>40%+f2</em>60% ...
        const cell = el("TD", [
            text("=round(c2"),
            el("EM", [text("40%+f2")]),
            text("60%,1)")
        ]);
        expect(extractCellText(cell)).toBe("=round(c2*40%+f2*60%,1)");
    });

    it("restores ** for <strong>", () => {
        const cell = el("TD", [text("a"), el("STRONG", [text("b")]), text("c")]);
        expect(extractCellText(cell)).toBe("a**b**c");
    });

    it("keeps a literal leftover asterisk (odd count)", () => {
        // a1*b1*c1*d1 -> a1<em>b1</em>c1*d1
        const cell = el("TD", [
            text("=a1"),
            el("EM", [text("b1")]),
            text("c1*d1")
        ]);
        expect(extractCellText(cell)).toBe("=a1*b1*c1*d1");
    });

    it("unwraps non-emphasis elements (spans) keeping their text", () => {
        const cell = el("TD", [el("SPAN", [text("=a1")]), el("SPAN", [text("*b1")])]);
        expect(extractCellText(cell)).toBe("=a1*b1");
    });
});
