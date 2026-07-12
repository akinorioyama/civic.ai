import { expect, test } from "vite-plus/test";
import { cjkSlugify, renderMarkdown } from "../src/lib/legacyMarkdown";

test("renders emphasis closed after CJK punctuation", () => {
    const html = renderMarkdown("經驗法則：_先搭橋，再決策。_ 若屬緊急損害。");
    expect(html).toContain("<em>先搭橋，再決策。</em>");
});

test("renders bold labels followed by CJK full stop", () => {
    const html = renderMarkdown("- **關係優先。** 關係是關懷的基本單位。");
    expect(html).toContain("<strong>關係優先。</strong>");
});

test("uses existing CJK heading slug policy", () => {
    const html = renderMarkdown("## 關懷六力？\n");
    expect(html).toContain('id="關懷六力"');
});

test("cjkSlugify falls back to a placeholder when nothing slug-worthy remains", () => {
    expect(cjkSlugify("!!!")).toBe("section");
});

test("scanDelims patch handles delimiters at the very start and end of a line", () => {
    // The opening `*` is at src position 0 (no `lastChar`) and the closing
    // `*` reaches `posMax` while scanning its run (no `nextChar`) — both
    // exercise the CJK-adjacency patch's out-of-bounds fallbacks.
    const html = renderMarkdown("*hi*");
    expect(html).toContain("<em>hi</em>");
});
