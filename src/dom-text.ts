/**
 * DOM cell-text extraction that survives markdown rendering.
 *
 * Obsidian renders markdown inside table cells, which mangles two things our
 * formulas rely on:
 *   1. Emphasis: `=a*b+c*d` (two `*`) becomes `a<em>b+c</em>d` and the asterisks
 *      vanish, breaking multiplication.
 *   2. Math: `$` reference anchors (`[$j$2:$k$6]`) are parsed as LaTeX inline
 *      math (`$j$`, `$k$`) and rendered as math spans, so the `$` and the text
 *      between them are lost.
 *
 * This walker reconstructs the source text: it turns emphasis elements back into
 * their markdown markers and rebuilds `$...$` around rendered math spans.
 *
 * It works on a minimal node shape so it can be unit-tested without a real DOM,
 * and real DOM nodes satisfy the interface directly.
 */

export interface MinimalNode {
    nodeType: number;
    nodeName: string;
    textContent: string | null;
    childNodes: ArrayLike<MinimalNode>;
    className?: unknown;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

// Obsidian wraps inline math in <span class="math math-inline">.
function isMathWrapper(node: MinimalNode): boolean {
    return (
        node.nodeName.toLowerCase() === "span" &&
        typeof node.className === "string" &&
        /\bmath\b/.test(node.className)
    );
}

// MathJax/KaTeX keep the original TeX in an <annotation encoding="application/x-tex">.
function findLatexAnnotation(node: MinimalNode): string | null {
    if (node.nodeName && node.nodeName.toLowerCase() === "annotation") {
        return node.textContent || "";
    }
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const found = findLatexAnnotation(children[i]);
        if (found !== null) return found;
    }
    return null;
}

export function extractCellText(node: MinimalNode): string {
    if (node.nodeType === TEXT_NODE) {
        return node.textContent || "";
    }

    let out = "";
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === TEXT_NODE) {
            out += child.textContent || "";
        } else if (child.nodeType === ELEMENT_NODE) {
            if (isMathWrapper(child)) {
                // Rebuild the $...$ that Obsidian turned into a math span. Prefer
                // the TeX annotation; fall back to the (assistive) text content.
                const latex = findLatexAnnotation(child);
                out += "$" + (latex !== null ? latex : extractCellText(child)) + "$";
                continue;
            }
            const tag = child.nodeName.toLowerCase();
            const inner = extractCellText(child);
            if (tag === "em" || tag === "i") {
                out += "*" + inner + "*";
            } else if (tag === "strong" || tag === "b") {
                out += "**" + inner + "**";
            } else if (tag === "del" || tag === "s") {
                out += "~~" + inner + "~~";
            } else {
                // spans, code wrappers, etc.: keep their text only
                out += inner;
            }
        }
    }
    return out;
}
