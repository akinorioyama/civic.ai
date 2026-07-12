import { describe, expect, test } from "vite-plus/test";
import {
    DIAL,
    anchorOf,
    arcPath,
    arrowAt,
    badge,
    byNum,
    chipPos,
    conceptMap,
    cycleHand,
    escapeHtml,
    numeral,
    packVars,
    polar,
    renderConceptMap,
} from "../src/lib/conceptMap";

describe("dial geometry", () => {
    test("polar hits the cardinal points", () => {
        const top = polar(310, 310, 300, 90);
        expect(top.x).toBeCloseTo(310, 6);
        expect(top.y).toBeCloseTo(10, 6);
        const west = polar(310, 310, 300, 180);
        expect(west.x).toBeCloseTo(10, 6);
        expect(west.y).toBeCloseTo(310, 6);
        const bottom = polar(310, 310, 300, 270);
        expect(bottom.y).toBeCloseTo(610, 6);
    });

    test("arcPath sweeps clockwise with sane flags", () => {
        const seg = arcPath(310, 310, 236, 199, 161);
        expect(seg).toMatch(/^M [\d.]+ [\d.]+ A 236 236 0 0 1 [\d.]+ [\d.]+$/);
        expect(seg).not.toContain("NaN");
        const long = arcPath(310, 310, 236, 270, 45);
        expect(long).toContain("A 236 236 0 1 1");
    });

    test("arrowheads point along the clockwise tangent", () => {
        // at the top of the circle, clockwise travel is +x: the tip must sit
        // to the right of the anchor point
        const pts = arrowAt(310, 310, 236, 90)
            .split(" ")
            .map((pair) => pair.split(",").map(Number));
        const xs = pts.map((p) => p[0] ?? Number.NaN);
        expect(xs.length).toBe(3);
        expect(xs[0]!).toBeGreaterThan(xs[1]!);
        expect(xs[0]!).toBeGreaterThan(xs[2]!);
    });
    test("chips stay inside the dial box", () => {
        for (const deg of Object.values(DIAL.anchors)) {
            const pos = chipPos(deg);
            const left = parseFloat(pos.left);
            const top = parseFloat(pos.top);
            expect(left).toBeGreaterThan(0);
            expect(left).toBeLessThan(100);
            expect(top).toBeGreaterThan(0);
            expect(top).toBeLessThan(100);
        }
    });
});

describe("anchorOf", () => {
    test("resolves a known pack anchor", () => {
        expect(anchorOf(1)).toBe(DIAL.anchors[1]);
    });

    test("throws for a pack with no dial anchor", () => {
        expect(() => anchorOf(9999)).toThrow(
            "concept map: no dial anchor for pack 9999"
        );
    });
});

describe("render helper edge cases", () => {
    test("escapeHtml treats null/undefined as an empty string", () => {
        expect(escapeHtml(undefined)).toBe("");
        expect(escapeHtml(null)).toBe("");
        expect(escapeHtml('<a href="x">&y</a>')).toBe(
            "&lt;a href=&quot;x&quot;&gt;&amp;y&lt;/a&gt;"
        );
    });

    test("packVars falls back to the base hue when ink overrides are absent", () => {
        const pack = {
            ...conceptMap.packs[0]!,
            inkLight: undefined,
            inkDark: undefined,
        };
        expect(packVars(pack)).toBe(
            `--hue:${pack.hue};--ink-l:${pack.hue};--ink-d:${pack.hue}`
        );
    });

    test("byNum resolves the membrane for pack 6 and throws for an unknown pack", () => {
        expect(byNum(6)).toBe(conceptMap.membrane);
        expect(() => byNum(9999)).toThrow("concept map: unknown pack 9999");
    });

    test("badge and numeral fall back past the enclosed-numeral glyph set", () => {
        const pack = { ...conceptMap.packs[0]!, num: 7 };
        expect(numeral(7, true)).toBe("7");
        expect(numeral(7, false)).toBe("7");
        expect(badge(pack, false, "en")).toContain(">7</span>");
    });

    test("cycleHand throws for a pack with no cycle handoff", () => {
        expect(() => cycleHand(9999)).toThrow(
            "concept map: missing cycle handoff 9999"
        );
    });
});

describe("renderConceptMap", () => {
    const en = renderConceptMap("en-gb");
    const tw = renderConceptMap("zh-Hant");

    test("emits a single markdown-safe line", () => {
        expect(en).not.toContain("\n");
        expect(tw).not.toContain("\n");
    });

    test("every handoff cargo appears in both languages", () => {
        for (const handoff of conceptMap.handoffs) {
            expect(en).toContain(handoff.cargo.en);
            expect(tw).toContain(handoff.cargo.tw);
        }
    });

    test("every pack links to its chapter and measure", () => {
        for (const pack of conceptMap.packs) {
            expect(en).toContain(
                `href="/${pack.slug}/" target="_blank" rel="noopener"`
            );
            expect(tw).toContain(
                `href="/tw/${pack.slug}/" target="_blank" rel="noopener"`
            );
            expect(en).toContain(`href="/measures/#${pack.measure.anchor}"`);
            expect(tw).toContain(`href="/tw/measures/#${pack.measure.anchor}"`);
            expect(en).not.toContain(
                `href="/measures/#${pack.measure.anchor}" target="_blank"`
            );
            expect(tw).not.toContain(
                `href="/tw/measures/#${pack.measure.anchor}" target="_blank"`
            );
        }
        expect(en).toContain('href="/6/" target="_blank" rel="noopener"');
        expect(tw).toContain('href="/tw/6/" target="_blank" rel="noopener"');
        expect(en).toContain('href="/measures/#exit-readiness"');
        expect(en).toContain(`href="${conceptMap.legendUrl.en}"`);
        expect(tw).toContain(`href="${conceptMap.legendUrl.tw}"`);
        expect(en).toContain('href="#st-p1"');
        expect(en).not.toContain('href="#st-p1" target="_blank"');
    });

    test("uses the comic-derived pack palette", () => {
        expect(conceptMap.packs.map((pack) => pack.hue)).toEqual([
            "#eb573a",
            "#f09344",
            "#f9dd55",
            "#7cc967",
            "#6197f8",
        ]);
        expect(conceptMap.membrane.hue).toBe("#a753f6");
    });
    test("languages never leak across", () => {
        expect(en).not.toContain("/tw/");
        expect(tw).not.toContain("Pack 1");
        expect(tw).toContain("罕見共識指數");
        expect(tw).toContain("五");
    });

    test("view-transition opt-in ships inline, exactly once", () => {
        const marker = "<style>@view-transition{navigation:auto}</style>";
        expect(en.split(marker).length).toBe(2);
        expect(tw.split(marker).length).toBe(2);
    });

    test("dial separates the four-part care loop from the Pack 5 field", () => {
        for (const [html, fieldLabel] of [
            [en, conceptMap.fieldLabel.en],
            [tw, conceptMap.fieldLabel.tw],
        ] as const) {
            expect(html.match(/class="cmap-station"/g)?.length).toBe(5);
            expect(html.match(/class="cmap-arc cmap-arc-/g)?.length).toBe(4);
            expect(html).not.toContain("cmap-arc-5");
            expect(
                html.match(/class="cmap-chip cmap-chip--cycle/g)?.length
            ).toBe(4);
            expect(html).toContain('class="cmap-field-chip cmap-chip-5"');
            expect(html).not.toContain('class="cmap-field-label" style=');
            const fieldChip = html.match(
                /<a class="cmap-field-chip cmap-chip-5"[\s\S]*?<\/a>/
            )?.[0];
            expect(fieldChip).not.toContain("cmap-field-label");
            expect(fieldChip).not.toContain(fieldLabel);
            expect(fieldChip).not.toContain("cmap-chip-num");
            expect(html).toContain('<figcaption class="cmap-field-dock">');
            expect(html).not.toContain("cmap-caption");
            expect(html).not.toContain("cmap-cap");
            expect(html).not.toContain('class="cmap-phase"');
            expect(html).toMatch(/class="cmap-field-note">[^<]+<\/p>/);
            expect(html).toContain(fieldLabel);
            expect(html).toContain('class="cmap-badge-glyph"');
            expect(html).toContain("①");
            expect(html).not.toContain(
                'aria-label="Pack 1 · Attentiveness">1</a>'
            );
            expect(html.match(/cmap-chord /g)?.length).toBe(2);
            expect(html.match(/cmap-frame-chip"/g)?.length).toBe(4);
            expect(html).toContain("cmap-hand--night");
            expect(html).toContain('href="#st-p1"');
        }
    });

    test("screen readers get the handoff verb", () => {
        expect(en).toContain('aria-label="hands to Pack 3 · Competence"');
        expect(tw).toContain('aria-label="交給三 · 勝任力"');
    });
});
