import { expect, test, vi } from "vite-plus/test";
import type { ComicsOverlayFrame } from "../src/lib/site";

// `expandShortcodes` unconditionally invokes every `render*` helper in this
// module on every call (each placeholder is substituted via
// `String#replaceAll(needle, renderFn(...))`, so the replacement value is
// computed eagerly regardless of whether the needle is present in the
// body). That means a handful of branches inside those renderers — the
// `shapePolys` fallback defaults, an italic overlay frame, an overlay layer
// with zero frames, a filtered-out empty-text frame, and an optional
// OpenClaw guide section/field — are only reachable with fixture data the
// real `_data/*.json` content never happens to contain. `../src/lib/site`
// is mocked here with a minimal, self-consistent fixture that deliberately
// exercises those paths; every other test in this file benefits from the
// same fixture without needing to care about its shape.
const siteFixture = vi.hoisted(() => {
    const shapedFrame: ComicsOverlayFrame = {
        text: "Shaped text",
        top: "10%",
        left: "10%",
        width: "50%",
        height: "20%",
        fontSize: 2.5,
        align: "center",
        color: "#000",
        bg: "transparent",
        italic: false,
        angle: "0deg",
        fontFamily: "sans-serif",
        pad: 1,
        shapeOn: true,
        // `undefined` entries exercise the `sL[k] ?? 0` / `sR[k] ?? 100`
        // fallbacks in `shapePolys`; the defined entries exercise the
        // "value present" side of the same `??` expressions.
        sL: [0, undefined as unknown as number, 20, 30, 40],
        sR: [100, undefined as unknown as number, 80, 70, 60],
        sD: [10, 30, 50, 70],
    };
    const italicRectFrame: ComicsOverlayFrame = {
        text: "Italic rect text",
        top: "35%",
        left: "10%",
        width: "80%",
        height: "10%",
        fontSize: 2,
        align: "left",
        color: "#000",
        bg: "transparent",
        italic: true,
        angle: "0deg",
        fontFamily: "sans-serif",
        pad: 1,
    };
    const multiLineFitsFrame: ComicsOverlayFrame = {
        // Two short meaningful lines that each individually fit within the
        // box width — exercises the "true" side of the `noSoftWrap`
        // ternary's `meaningfulLines.length > 1 && eachSegmentFitsOneLine`
        // condition.
        text: "ab\ncd",
        top: "40%",
        left: "10%",
        width: "80%",
        height: "10%",
        fontSize: 1,
        align: "left",
        color: "#000",
        bg: "transparent",
        italic: false,
        angle: "0deg",
        fontFamily: "sans-serif",
        pad: 1,
    };
    const multiLineOverflowFrame: ComicsOverlayFrame = {
        // Two meaningful lines, but each is wider than the box —
        // exercises the "false" side of `eachSegmentFitsOneLine` while
        // `meaningfulLines.length > 1` stays true.
        text: "a long overflowing line\nanother long overflowing line",
        top: "45%",
        left: "10%",
        width: "5%",
        height: "10%",
        fontSize: 5,
        align: "left",
        color: "#000",
        bg: "transparent",
        italic: false,
        angle: "0deg",
        fontFamily: "sans-serif",
        pad: 1,
    };
    const emptyTextFrame: ComicsOverlayFrame = {
        text: "   ",
        top: "0%",
        left: "0%",
        width: "10%",
        height: "5%",
        fontSize: 1,
        align: "center",
        color: "#000",
        bg: "transparent",
        italic: false,
        angle: "0deg",
        fontFamily: "sans-serif",
        pad: 1,
    };

    return {
        lang2: (lang: string | undefined) =>
            String(lang || "").split("-")[0] === "zh" ? "zh" : "en",
        paths: [
            {
                label_en: "EN Path",
                label_tw: "TW 路徑",
                steps: [
                    {
                        url: "/a/",
                        url_tw: "/tw/a/",
                        label_en: "Step A",
                        label_tw: "步驟甲",
                    },
                ],
            },
        ],
        comics: {
            source_repo: "https://example.com/comics-repo",
            overview: {
                en: {
                    src: "/img/o.jpg",
                    alt: "Overview EN",
                    width: 100,
                    height: 100,
                },
                tw: {
                    src: "/img/o-tw.jpg",
                    alt: "Overview TW",
                    width: 100,
                    height: 100,
                },
            },
            packs: [
                {
                    num: 1,
                    slug: "pack-1",
                    title: { en: "Pack One", tw: "第一包" },
                    pages: [
                        {
                            // Has overlay frames — including one filtered out
                            // for being blank-after-trim, plus a shaped and
                            // an italic frame.
                            id: "a",
                            type: { en: "Problem", tw: "問題" },
                            alt: { en: "Alt A EN", tw: "Alt A TW" },
                        },
                        {
                            // No matching key in `comicsJaOverlays` below, so
                            // `renderOverlayLayer` resolves to an empty frame
                            // list and short-circuits to "".
                            id: "b",
                            type: { en: "Solution", tw: "解方" },
                            alt: { en: "Alt B EN", tw: "Alt B TW" },
                        },
                    ],
                },
            ],
        },
        comicsJaOverlays: {
            "pack1-a": [
                emptyTextFrame,
                shapedFrame,
                italicRectFrame,
                multiLineFitsFrame,
                multiLineOverflowFrame,
            ],
            "overview-small": [italicRectFrame],
        },
        glossary: [
            {
                // Missing `id` exercises the `value ?? ""` fallback inside
                // the shared `escapeHtml`/`escapeAttr` helper.
                id: undefined,
                term_en: "Term EN",
                term_tw: "詞彙",
                def_en: "Definition EN",
                def_tw: "定義",
            },
        ],
        openclawBootstrap: {
            skill: { name: "civic-ai-bootstrap", description: "Bootstrap." },
            urls: {
                rawSkill: "/.well-known/openclaw/SKILL.md",
                guide: { en: "/openclaw/", tw: "/tw/openclaw/" },
                llms: "/llms.txt",
            },
            readingOrder: [
                {
                    title: { en: "Manifesto", tw: "計畫宣言" },
                    url: { en: "/manifesto/", tw: "/tw/manifesto/" },
                    why: { en: "Why EN", tw: "Why TW" },
                },
            ],
            guides: {
                en: {
                    rawSkillNote: "Raw skill note EN.",
                    whenToUseHeading: "When to use this",
                    // Missing text exercises the `if (body)` false branch of
                    // `renderOpenClawGuideMarkdown`'s local `section` helper.
                    whenToUseText: undefined,
                    firstMoveHeading: "First move",
                    firstMoveIntro: "First move intro EN.",
                    firstMoveOutro: "First move outro EN.",
                    identityHeading: "Identity defaults",
                    identityIntro: "Identity intro EN.",
                    identityItems: [
                        { label: "Nature", text: "Nature text EN." },
                    ],
                    conversationHeading: "Bootstrap conversation",
                    conversationIntro: "Conversation intro EN.",
                    conversationItems: ["Question one EN?"],
                    commitmentsHeading: "Operating commitments",
                    commitmentsIntro: "Commitments intro EN.",
                    commitments: [
                        {
                            label: "Attentiveness",
                            text: "Attentiveness text EN.",
                        },
                    ],
                    antiPatternsHeading: "Anti-patterns",
                    antiPatternsIntro: "Anti-patterns intro EN.",
                    antiPatterns: ["Anti-pattern one EN."],
                    mappingHeading: "OpenClaw mapping",
                    mappingIntro: "Mapping intro EN.",
                    mapping: [
                        { file: "BOOTSTRAP.md", text: "Mapping text EN." },
                    ],
                    // Missing `memoryHeading` exercises the false branch of
                    // the `if (guide.memoryHeading)` guard.
                    memoryHeading: undefined,
                    memoryIntro: undefined,
                    closing: "Closing EN.",
                },
                tw: {
                    rawSkillNote: "Raw skill note TW.",
                    whenToUseHeading: "何時使用",
                    whenToUseText: "何時使用說明。",
                    firstMoveHeading: "第一步",
                    firstMoveIntro: "第一步說明。",
                    firstMoveOutro: "第一步結語。",
                    identityHeading: "身份預設",
                    identityIntro: "身份預設說明。",
                    identityItems: [{ label: "本質", text: "本質說明。" }],
                    conversationHeading: "啟動對話",
                    conversationIntro: "對話說明。",
                    conversationItems: ["問題一？"],
                    commitmentsHeading: "運作承諾",
                    commitmentsIntro: "承諾說明。",
                    commitments: [{ label: "覺察力", text: "覺察力說明。" }],
                    antiPatternsHeading: "反模式",
                    antiPatternsIntro: "反模式說明。",
                    antiPatterns: ["反模式一。"],
                    mappingHeading: "OpenClaw 對應",
                    mappingIntro: "對應說明。",
                    mapping: [{ file: "BOOTSTRAP.md", text: "對應文字。" }],
                    memoryHeading: "記憶",
                    memoryIntro: "記憶說明。",
                    closing: "結語。",
                },
            },
        },
    };
});

vi.mock("../src/lib/site", () => siteFixture);

import { asciifySkill, expandShortcodes } from "../src/lib/shortcodes";

test("expandShortcodes throws when unresolved {% ... %} template syntax remains", () => {
    expect(() =>
        expandShortcodes(
            { sourcePath: "src/pages/broken.md", data: {} },
            "Body with {% legacy_tag %} left over."
        )
    ).toThrow(/Unhandled legacy template syntax in src\/pages\/broken\.md/);
});

test("expandShortcodes throws when unresolved {{ ... }} template syntax remains", () => {
    expect(() =>
        expandShortcodes(
            { sourcePath: "src/pages/other.md", data: {} },
            "Body with {{ legacy_var }} left over."
        )
    ).toThrow(/Unhandled legacy template syntax in src\/pages\/other\.md/);
});

test("expandShortcodes returns the expanded body when no legacy syntax remains", () => {
    const result = expandShortcodes(
        { sourcePath: "src/pages/clean.md", data: {} },
        "Plain body with no legacy shortcodes."
    );
    expect(result).toBe("Plain body with no legacy shortcodes.");
});

test("expandShortcodes exercises the zh-lang branch of all site shortcodes", () => {
    const result = expandShortcodes(
        { sourcePath: "src/pages/tw-index.md", data: { lang: "zh-tw" } },
        "Body with no legacy shortcodes 這是中文內容。"
    );
    expect(result).toBe("Body with no legacy shortcodes 這是中文內容。");
});

test("asciifySkill converts smart punctuation to ASCII and strips remaining non-ASCII", () => {
    const input =
        "Hello\u2014world " + // em dash -> --
        "range\u2013end non\u2011breaking " + // en dash / non-breaking hyphen -> -
        "\u2018single\u2019 \u2032prime\u2032 " + // curly single quotes / prime -> '
        "\u201Cdouble\u201D \u2033dprime\u2033 " + // curly double quotes / double-prime -> "
        "wait\u2026 " + // ellipsis -> ...
        "go\u2192here " + // arrow -> ->
        "caf\u00e9 \u4e16\u754c " + // accented / CJK -> stripped entirely
        "plain ascii text";

    const result = asciifySkill(input);

    expect(result).toBe(
        "Hello--world " +
            "range-end non-breaking " +
            "'single' 'prime' " +
            '"double" "dprime" ' +
            "wait... " +
            "go->here " +
            "caf  " +
            "plain ascii text"
    );
    // No character outside the printable ASCII range should survive.
    // oxlint-disable-next-line no-control-regex -- intentional full-ASCII range check (mirrors asciifySkill's own guard)
    expect(/[^\x00-\x7F]/.test(result)).toBe(false);
});

test("asciifySkill passes plain ASCII text through unchanged", () => {
    const input = "Just a plain ASCII sentence, with punctuation!";
    expect(asciifySkill(input)).toBe(input);
});
