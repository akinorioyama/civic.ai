import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import footnote from "markdown-it-footnote";

const CJK =
    /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF]/;
let cjkPatchInstalled = false;

export function cjkSlugify(value: unknown): string {
    const out = String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}_-]/gu, "");
    return out || "section";
}

function installCjkDelimiterPatch(md: MarkdownIt) {
    if (cjkPatchInstalled) return;
    const State = md.inline.State;
    const original = State.prototype.scanDelims;
    State.prototype.scanDelims = function (
        start: number,
        canSplitWord: boolean
    ) {
        const result = original.call(this, start, canSplitWord);
        const marker = this.src.charCodeAt(start);
        let pos = start;
        while (pos < this.posMax && this.src.charCodeAt(pos) === marker) pos++;
        const lastChar = start > 0 ? (this.src[start - 1] ?? " ") : " ";
        const nextChar = pos < this.posMax ? (this.src[pos] ?? " ") : " ";
        if (!result.can_close && CJK.test(lastChar)) result.can_close = true;
        if (!result.can_open && CJK.test(nextChar)) result.can_open = true;
        return result;
    };
    cjkPatchInstalled = true;
}

export function createMarkdownRenderer(): MarkdownIt {
    const md = new MarkdownIt({
        html: true,
        linkify: false,
        typographer: false,
    });
    md.use(footnote);
    md.use(anchor, { slugify: cjkSlugify, permalink: false });
    installCjkDelimiterPatch(md);
    return md;
}

export function renderMarkdown(body: string): string {
    return createMarkdownRenderer().render(body);
}
