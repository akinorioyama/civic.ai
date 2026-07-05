import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const source = readFileSync("assets/js/civic-search.js", "utf8");

describe("civic-search.js static contract", () => {
    test("normalizes Civic AI page languages", () => {
        expect(source).toMatch(/function normalizePageLang/);
        expect(source).toMatch(/startsWith\((["'])zh\1\)/);
        expect(source).toContain("/tw/search-index.json");
    });

    test("guards Pagefind and exposes CivicSearch", () => {
        expect(source).toMatch(/typeof PagefindUI === (["'])undefined\1/);
        expect(source).toContain("window.CivicSearch");
    });

    test("preserves IME Enter guard for CJK composition", () => {
        expect(source).toContain("keyCode === 229");
    });

    test("runs ask-first then keyword search without Plurality globals", () => {
        expect(source).toContain("civic-search-after-ask");
        expect(source).not.toContain("PluralitySearch");
        expect(source).not.toContain("PluralityBookAsk");
    });
});
