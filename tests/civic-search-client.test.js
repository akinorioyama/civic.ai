import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const source = readFileSync("assets/js/civic-search.js", "utf8");
const headerTools = readFileSync("src/components/HeaderTools.astro", "utf8");
const styles = readFileSync("styles.css", "utf8");

describe("civic-search.js static contract", () => {
    test("normalizes Civic AI page languages", () => {
        expect(source).toMatch(/function normalizePageLang/);
        expect(source).toMatch(/startsWith\((["'])zh\1\)/);
        expect(source).toContain("/tw/search-index.json");
    });

    test("uses the English Fuse index in development", () => {
        expect(source).toMatch(
            /pageLang === "en"\s*\?\s*"\/search-index\.json"/
        );
        expect(source).toContain('"/tw/search-index.json"');
    });

    test("uses Civic AI search copy, not book copy", () => {
        expect(source).toContain("Search Civic AI…");
        expect(source).not.toContain("Search the book");
    });

    test("orders theme before search so search is the rightmost header tool", () => {
        const themeIndex = headerTools.indexOf("data-theme-toggle");
        const searchIndex = headerTools.indexOf("data-search-toggle");
        expect(themeIndex).toBeGreaterThan(-1);
        expect(searchIndex).toBeGreaterThan(-1);
        expect(themeIndex).toBeLessThan(searchIndex);
    });

    test("keeps ask submit inline and readable inside Pagefind overlay", () => {
        expect(styles).toContain(
            ".search-overlay .pagefind-ui .civic-search__row"
        );
        expect(styles).toMatch(
            /\.search-overlay \.pagefind-ui \.civic-search__row\s*\{[^}]*display:\s*flex;/s
        );
        expect(styles).toMatch(
            /\.search-overlay \.pagefind-ui \.civic-search__submit\s*\{[^}]*display:\s*inline-grid;/s
        );
        expect(styles).toMatch(
            /\.search-overlay \.pagefind-ui\s*\{[^}]*--pagefind-ui-text:\s*var\(--text\);/s
        );
    });

    test("styles the development Fuse search shell", () => {
        expect(styles).toMatch(
            /\.pagefind-ui--fuse\s*\{[^}]*font-family:\s*var\(--sans\);/s
        );
        expect(styles).toMatch(
            /\.pagefind-ui--fuse \.pagefind-ui__search-input\s*\{[^}]*width:\s*100%;/s
        );
        expect(styles).toMatch(
            /\.pagefind-ui--fuse \.pagefind-ui__results\s*\{[^}]*list-style:\s*none;/s
        );
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
