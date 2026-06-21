/**
 * DOM cell-text extraction that survives markdown rendering.
 *
 * Obsidian renders markdown emphasis inside table cells, so a formula like
 * `=a*b` (a single `*`) is fine, but `=a*b+c*d` (two `*`) becomes
 * `a<em>b+c</em>d` and the asterisks vanish from textContent. That breaks
 * multiplication. This walker reconstructs the source text, turning emphasis
 * elements back into their markdown markers.
 *
 * It works on a minimal node shape so it can be unit-tested without a real DOM,
 * and real DOM nodes satisfy the interface directly.
 */

export interface MinimalNode {
    nodeType: number;
    nodeName: string;
    textContent: string | null;
    childNodes: ArrayLike<MinimalNode>;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

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
