import { expect, test } from "bun:test";
import { renderMarkdown } from "../src/lib/legacyMarkdown";

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
