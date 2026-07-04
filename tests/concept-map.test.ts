import { describe, expect, test } from "bun:test";
import {
    DIAL,
    arcPath,
    arrowAt,
    chipPos,
    conceptMap,
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
            expect(en).toContain(`href="/${pack.slug}/"`);
            expect(tw).toContain(`href="/tw/${pack.slug}/"`);
            expect(en).toContain(`href="/measures/#${pack.measure.anchor}"`);
            expect(tw).toContain(`href="/tw/measures/#${pack.measure.anchor}"`);
        }
        expect(en).toContain('href="/6/"');
        expect(tw).toContain('href="/tw/6/"');
        expect(en).toContain('href="/measures/#exit-readiness"');
        expect(en).toContain(`href="${conceptMap.legendUrl.en}"`);
        expect(tw).toContain(`href="${conceptMap.legendUrl.tw}"`);
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

    test("dial and walk structure is complete", () => {
        for (const html of [en, tw]) {
            expect(html.match(/class="cmap-station"/g)?.length).toBe(5);
            expect(html.match(/class="cmap-chip /g)?.length).toBe(5);
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
