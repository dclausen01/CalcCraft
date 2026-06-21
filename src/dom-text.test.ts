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

// Obsidian's inline-math wrapper: <span class="math"> ... <annotation>j</annotation> ... </span>
const math = (latex: string): MinimalNode => ({
    nodeType: 1,
    nodeName: "SPAN",
    className: "math math-inline is-loaded",
    textContent: null,
    childNodes: [
        el("MJX-CONTAINER", [
            el("MJX-ASSISTIVE-MML", [
                el("MATH", [
                    el("SEMANTICS", [
                        el("MI", [text(latex)]),
                        {
                            nodeType: 1,
                            nodeName: "ANNOTATION",
                            textContent: latex,
                            childNodes: [text(latex)]
                        }
                    ])
                ])
            ])
        ])
    ]
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

    it("rebuilds $ anchors that Obsidian rendered as inline math", () => {
        // =VLOOKUP(g2,[$j$2:$k$6],2,true) renders $j$ and $k$ as math spans.
        const cell = el("TD", [
            text("=VLOOKUP(g2,["),
            math("j"),
            text("2:"),
            math("k"),
            text("6],2,true)")
        ]);
        expect(extractCellText(cell)).toBe("=VLOOKUP(g2,[$j$2:$k$6],2,true)");
    });

    it("falls back to the math text content when no annotation is present", () => {
        // Some renderers expose only assistive MathML (no <annotation>).
        const mathNoAnnotation: MinimalNode = {
            nodeType: 1,
            nodeName: "SPAN",
            className: "math math-inline",
            textContent: null,
            childNodes: [el("MJX-CONTAINER", [el("MI", [text("a")])])]
        };
        const cell = el("TD", [text("=sum(["), mathNoAnnotation, text("2:b4])")]);
        expect(extractCellText(cell)).toBe("=sum([$a$2:b4])");
    });
});
