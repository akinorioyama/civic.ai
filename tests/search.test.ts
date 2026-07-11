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

test("keeps bilingual Doom brief content reachable at stable anchors", () => {
    for (const {
        lang,
        url,
        briefHeading,
        briefAnchor,
        briefContent,
        takeawaysHeading,
        takeawaysAnchor,
        takeawaysContent,
    } of [
        {
            lang: "en" as const,
            url: "/doom-debate/",
            briefHeading: "In brief",
            briefAnchor: "in-brief",
            briefContent: "This debate places the 6-Pack",
            takeawaysHeading: "Key takeaways",
            takeawaysAnchor: "key-takeaways",
            takeawaysContent:
                "Civic resilience depends on participatory institutions",
        },
        {
            lang: "zh" as const,
            url: "/tw/doom-debate/",
            briefHeading: "摘要",
            briefAnchor: "摘要",
            briefContent: "這場辯論把關懷六力放進超級智慧風險的討論中",
            takeawaysHeading: "重點",
            takeawaysAnchor: "重點",
            takeawaysContent: "公民韌性不只仰賴實驗室端的安全技術",
        },
    ]) {
        const entry = getSearchEntries(lang).find((item) => item.url === url);

        expect(entry?.subsections).toContainEqual(
            expect.objectContaining({
                heading: briefHeading,
                anchor: briefAnchor,
                content: expect.stringContaining(briefContent),
            })
        );
        expect(entry?.subsections).toContainEqual(
            expect.objectContaining({
                heading: takeawaysHeading,
                anchor: takeawaysAnchor,
                content: expect.stringContaining(takeawaysContent),
            })
        );
    }
});

test("normalizes structured Doom takeaways for search excerpts", () => {
    for (const [lang, url, term] of [
        ["en", "/doom-debate/", "P(Doom)"],
        ["zh", "/tw/doom-debate/", "P（末日）"],
    ] as const) {
        const entry = getSearchEntries(lang).find((item) => item.url === url);
        const takeaways = entry?.subsections.find(
            (section) =>
                section.anchor === (lang === "zh" ? "重點" : "key-takeaways")
        );

        expect(takeaways?.content).toContain(term);
        expect(takeaways?.content).not.toContain("`");
        expect(takeaways?.content).not.toContain("**");
    }
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
