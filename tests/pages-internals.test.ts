import { expect, test, vi } from "vite-plus/test";
import {
    clearPageCacheForTests,
    deriveUrl,
    getDynamicPagePaths,
    getPageByUrl,
    isRootContentFile,
    loadPages,
    normalizeUrlFields,
    readRawHtmlDocument,
} from "../src/lib/pages";

test("isRootContentFile excludes repo docs, legacy Eleventy templates, and non-content files", () => {
    expect(isRootContentFile("README.md")).toBe(false);
    expect(isRootContentFile("AGENTS.md")).toBe(false);
    expect(isRootContentFile("CLAUDE.md")).toBe(false);
    expect(isRootContentFile("DESIGN.md")).toBe(false);
    // Legacy Eleventy `.njk` templates the migration retired but this
    // filter still defends against, should any reappear.
    expect(isRootContentFile("robots.njk")).toBe(false);
    expect(isRootContentFile("tw-polis-care-deliberation.njk")).toBe(false);
    expect(isRootContentFile("manifesto.md")).toBe(true);
    expect(isRootContentFile("sensemaker.html")).toBe(true);
    expect(isRootContentFile("tw-sensemaker.html")).toBe(true);
    expect(isRootContentFile("styles.css")).toBe(false);
});

test("deriveUrl prefers an explicit permalink over name-derived routing", () => {
    expect(deriveUrl("whatever.md", { permalink: "/custom" })).toBe("/custom/");
});

test("deriveUrl special-cases the English and Mandarin home pages", () => {
    expect(deriveUrl("index.md", {})).toBe("/");
    expect(deriveUrl("tw-index.md", {})).toBe("/tw/");
});

test("deriveUrl strips the tw- prefix into a /tw/ route for other Mandarin pages", () => {
    expect(deriveUrl("tw-manifesto.md", {})).toBe("/tw/manifesto/");
});

test("deriveUrl routes other English pages by file stem", () => {
    expect(deriveUrl("manifesto.md", {})).toBe("/manifesto/");
});

test("normalizeUrlFields rewrites url on well-formed items and skips the rest", () => {
    const items = [
        { url: "/1" },
        { name: "no url field" },
        null,
        "not an object",
        42,
        { url: 7 },
    ];
    normalizeUrlFields(items);
    expect(items[0]).toEqual({ url: "/1/" });
    expect(items[1]).toEqual({ name: "no url field" });
    expect(items[5]).toEqual({ url: 7 });
});

test("normalizeUrlFields is a no-op for non-array input", () => {
    expect(() => normalizeUrlFields(undefined)).not.toThrow();
    expect(() => normalizeUrlFields({ url: "/1" })).not.toThrow();
});

test("getPageByUrl throws for a URL with no matching page", () => {
    expect(() => getPageByUrl("/does-not-exist/")).toThrow(
        "No page found for URL: /does-not-exist/"
    );
});

test("getDynamicPagePaths excludes the explicit home/sensemaking routes and raw HTML documents", () => {
    const paths = getDynamicPagePaths();
    const slugs = paths.map((entry) => entry.params.slug);

    expect(slugs).not.toContain("");
    expect(slugs).not.toContain("conference/sensemaking");
    expect(slugs).not.toContain("tw/conference/sensemaking");
    expect(paths.every((entry) => !entry.props.page.isRawHtmlDocument)).toBe(
        true
    );
    expect(slugs).toContain("1");
    expect(
        paths.find((entry) => entry.params.slug === "1")?.props.page.url
    ).toBe("/1/");
});

test("readRawHtmlDocument returns the raw body for a known raw HTML source", () => {
    const raw = readRawHtmlDocument("sensemaker.html");
    expect(raw.length).toBeGreaterThan(0);
    expect(raw).toBe(getPageByUrl("/sensemaker/").rawBody);
});

test("readRawHtmlDocument throws for a loaded page that is not flagged raw HTML", () => {
    // Only the English "sensemaker.html" source is flagged
    // `isRawHtmlDocument`; its Mandarin twin is loaded as a normal
    // shortcode-expanded page (see src/lib/pages.ts's `loadPage`), so
    // asking for it as a raw document must throw.
    expect(() => readRawHtmlDocument("tw-sensemaker.html")).toThrow(
        "Raw HTML document not found: tw-sensemaker.html"
    );
});

test("clearPageCacheForTests forces the next load to rebuild the page list", () => {
    const before = loadPages();
    clearPageCacheForTests();
    const after = loadPages();

    expect(after).not.toBe(before);
    expect(after.map((page) => page.url)).toEqual(
        before.map((page) => page.url)
    );
});

test("throws at import time when the resolved project root does not exist", async () => {
    vi.resetModules();
    vi.doMock("node:fs", async (importOriginal) => {
        const actual = await importOriginal<typeof import("node:fs")>();
        return { ...actual, existsSync: () => false };
    });

    await expect(import("../src/lib/pages")).rejects.toThrow(
        /Project root does not exist/
    );

    vi.doUnmock("node:fs");
    vi.resetModules();
});
