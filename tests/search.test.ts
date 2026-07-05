import { expect, test } from "bun:test";
import {
    getSearchEntries,
    getSearchSuggestions,
    splitRenderedHtmlByHeadings,
} from "../src/lib/search";

test("builds English search entries from rendered civic pages", () => {
    const entries = getSearchEntries("en");
    const packOne = entries.find((entry) => entry.url === "/1/");

    expect(packOne).toBeDefined();
    expect(
        packOne?.subsections.some((section) =>
            section.content.includes("Relationships first")
        )
    ).toBe(true);
    expect(entries.some((entry) => entry.url === "/openclaw/")).toBe(false);
    expect(
        entries.some((entry) => entry.url === "/conference/sensemaking/")
    ).toBe(false);
});

test("builds Mandarin search entries only for /tw/ URLs", () => {
    const entries = getSearchEntries("zh");
    const packOne = entries.find((entry) => entry.url === "/tw/1/");

    expect(packOne).toBeDefined();
    expect(
        packOne?.subsections.some((section) =>
            section.content.includes("關係優先")
        )
    ).toBe(true);
    expect(entries.every((entry) => entry.url.startsWith("/tw/"))).toBe(true);
    expect(entries.some((entry) => entry.url === "/tw/openclaw/")).toBe(false);
    expect(
        entries.some((entry) => entry.url === "/tw/conference/sensemaking/")
    ).toBe(false);
});

test("collects localized search suggestions from titles and glossary terms", () => {
    expect(getSearchSuggestions("en")).toContain("Civic AI");
    expect(getSearchSuggestions("zh")).toContain("仁工智慧");
});

test("splits rendered HTML by headings and strips unsafe chrome", () => {
    const sections = splitRenderedHtmlByHeadings(
        '<h2 id="x">Head</h2><script>bad()</script><p>Visible &amp; safe</p>'
    );

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe("Head");
    expect(sections[0]?.anchor).toBe("x");
    expect(sections[0]?.content).toBe("Visible & safe");
    expect(sections[0]?.content).not.toContain("bad()");
});
