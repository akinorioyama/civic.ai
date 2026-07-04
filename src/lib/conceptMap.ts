// conceptMap.ts — the Day Wheel: renders /map/ and /tw/map/ from one data
// file (_data/concept_map.json). Emits a build-time sundial (SVG strokes,
// HTML labels) plus the station manifest. Zero client JS; every string is
// real HTML text. Geometry is computed here so it can be unit-tested.

import conceptMapData from "../../_data/concept_map.json";
import { lang2 } from "./site";

interface Bilingual {
    en: string;
    tw: string;
}

interface MeasureRef {
    anchor: string;
    name: Bilingual;
}

interface PackNode {
    num: number;
    slug: string;
    hue: string;
    inkLight?: string;
    inkDark?: string;
    phase: Bilingual;
    chip: Bilingual;
    title: Bilingual;
    measure: MeasureRef;
}

interface Handoff {
    from: number;
    to: number;
    kind: "cycle" | "chord" | "field" | "membrane";
    cargo: Bilingual;
    night?: boolean;
    dashed?: boolean;
    both?: boolean;
    edge?: "top" | "bottom";
}

interface ConceptMapData {
    aria: Bilingual;
    cycleLabel: Bilingual;
    fieldLabel: Bilingual;
    measureLabel: Bilingual;
    handsLabel: Bilingual;
    loopLabel: Bilingual;
    membrane: PackNode;
    packs: PackNode[];
    handoffs: Handoff[];
    guard: Bilingual;
    legend: Bilingual;
    legendUrl: Bilingual;
}

export const conceptMap = conceptMapData as unknown as ConceptMapData;

// ─── geometry ───

export const DIAL = {
    size: 620,
    c: 310,
    rim: 300,
    day: 236,
    chip: 196,
    /** math-convention degrees: 0 = east, 90 = north (screen top) */
    anchors: { 1: 180, 2: 135, 3: 90, 4: 45, 5: 0 } as Record<number, number>,
    /** half-width of each pack's arc segment, degrees */
    halfSeg: 19,
};

export function anchorOf(num: number): number {
    const angle = DIAL.anchors[num];
    if (angle === undefined)
        throw new Error(`concept map: no dial anchor for pack ${num}`);
    return angle;
}

export function polar(
    cx: number,
    cy: number,
    r: number,
    deg: number
): { x: number; y: number } {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

const fmt = (n: number): string =>
    (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");

/** Arc from a0 to a1 (math degrees, a0 > a1), travelling clockwise on
 *  screen (through decreasing angles). */
export function arcPath(
    cx: number,
    cy: number,
    r: number,
    a0: number,
    a1: number
): string {
    const s = polar(cx, cy, r, a0);
    const e = polar(cx, cy, r, a1);
    const large = a0 - a1 > 180 ? 1 : 0;
    return `M ${fmt(s.x)} ${fmt(s.y)} A ${r} ${r} 0 ${large} 1 ${fmt(e.x)} ${fmt(e.y)}`;
}

/** Small triangular arrowhead at (r, deg), pointing clockwise along the
 *  circle's tangent. */
export function arrowAt(
    cx: number,
    cy: number,
    r: number,
    deg: number,
    size = 9
): string {
    const p = polar(cx, cy, r, deg);
    // clockwise (screen) tangent unit vector at deg
    const rad = (deg * Math.PI) / 180;
    const tx = Math.sin(rad);
    const ty = Math.cos(rad);
    // normal (outward)
    const nx = Math.cos(rad);
    const ny = -Math.sin(rad);
    const tip = { x: p.x + tx * size, y: p.y + ty * size };
    const a = {
        x: p.x - tx * size * 0.6 + nx * size * 0.6,
        y: p.y - ty * size * 0.6 + ny * size * 0.6,
    };
    const b = {
        x: p.x - tx * size * 0.6 - nx * size * 0.6,
        y: p.y - ty * size * 0.6 - ny * size * 0.6,
    };
    return `${fmt(tip.x)},${fmt(tip.y)} ${fmt(a.x)},${fmt(a.y)} ${fmt(b.x)},${fmt(b.y)}`;
}

export function chipPos(
    deg: number,
    r = DIAL.chip
): { left: string; top: string } {
    const p = polar(DIAL.c, DIAL.c, r, deg);
    return {
        left: `${fmt((p.x / DIAL.size) * 100)}%`,
        top: `${fmt((p.y / DIAL.size) * 100)}%`,
    };
}

// ─── render helpers ───

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

type Key = "en" | "tw";

function packUrl(pack: PackNode, zh: boolean): string {
    return zh ? `/tw/${pack.slug}/` : `/${pack.slug}/`;
}

function measureUrl(measure: MeasureRef, zh: boolean): string {
    return zh
        ? `/tw/measures/#${measure.anchor}`
        : `/measures/#${measure.anchor}`;
}

function packVars(pack: PackNode): string {
    const ink = pack.inkLight || pack.hue;
    const inkDark = pack.inkDark || pack.hue;
    return `--hue:${pack.hue};--ink-l:${ink};--ink-d:${inkDark}`;
}

function byNum(num: number): PackNode {
    if (num === 6) return conceptMap.membrane;
    const pack = conceptMap.packs.find((p) => p.num === num);
    if (!pack) throw new Error(`concept map: unknown pack ${num}`);
    return pack;
}

function badge(
    target: PackNode,
    zh: boolean,
    key: Key,
    label?: string
): string {
    const aria = label
        ? ` aria-label="${escapeHtml(`${label}${zh ? "" : " "}${target.title[key]}`)}"`
        : ` aria-label="${escapeHtml(target.title[key])}"`;
    return `<a class="cmap-badge" href="${packUrl(target, zh)}" style="${packVars(target)}"${aria}>${numeral(target.num, zh)}</a>`;
}

const TW_NUMERALS = ["一", "二", "三", "四", "五", "六"];

function numeral(num: number, zh: boolean): string {
    return zh ? TW_NUMERALS[num - 1] || String(num) : String(num);
}

// ─── the dial ───

function renderDial(key: Key, zh: boolean): string {
    const { c, rim, day, size, halfSeg } = DIAL;
    const parts: string[] = [];
    parts.push(
        `<svg class="cmap-dial-svg" viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false">`
    );
    parts.push(
        `<circle class="cmap-rim" cx="${c}" cy="${c}" r="${rim}" pathLength="100"/>`
    );
    const h0 = polar(c, c, rim - 12, 180);
    const h1 = polar(c, c, rim - 12, 0);
    parts.push(
        `<line class="cmap-horizon" x1="${fmt(h0.x)}" y1="${fmt(h0.y)}" x2="${fmt(h1.x)}" y2="${fmt(h1.y)}"/>`
    );
    // Night return: from dusk's end (-19°), clockwise under the bottom, to
    // dawn's edge (199°). arcPath sweeps clockwise for a0 > a1, but
    // 341→199 numerically prefers the short way over the top, so join two
    // sub-arcs through the true bottom (270°) instead.
    const nightA = arcPath(c, c, day, -halfSeg, -90);
    const nightB = arcPath(c, c, day, 270, anchorOf(1) + halfSeg);
    parts.push(
        `<path class="cmap-night" d="${nightA} ${nightB.replace(/^M [\d.]+ [\d.]+ /, "")}" pathLength="100"/>`
    );
    parts.push(
        `<polygon class="cmap-night-arrow" points="${arrowAt(c, c, day, anchorOf(1) + halfSeg + 3)}"/>`
    );
    // day arcs, one per pack, plus cycle arrowheads in the gaps
    for (const pack of conceptMap.packs) {
        const a = anchorOf(pack.num);
        parts.push(
            `<path class="cmap-arc cmap-arc-${pack.num}" d="${arcPath(c, c, day, a + halfSeg, a - halfSeg)}" stroke="${pack.hue}" pathLength="100"/>`
        );
    }
    for (const gap of [157.5, 112.5, 67.5, 22.5]) {
        parts.push(
            `<polygon class="cmap-cycle-arrow" points="${arrowAt(c, c, day, gap)}"/>`
        );
    }
    // chords, hidden until asked
    for (const h of conceptMap.handoffs.filter((x) => x.kind === "chord")) {
        const s = polar(c, c, day - 16, anchorOf(h.from));
        const e = polar(c, c, day - 16, anchorOf(h.to));
        parts.push(
            `<line class="cmap-chord cmap-chord-${h.from}-${h.to}${h.dashed ? " cmap-chord--dashed" : ""}" x1="${fmt(s.x)}" y1="${fmt(s.y)}" x2="${fmt(e.x)}" y2="${fmt(e.y)}"/>`
        );
    }
    parts.push(`</svg>`);
    // label chips: real links, always-horizontal HTML
    for (const pack of conceptMap.packs) {
        const pos = chipPos(anchorOf(pack.num));
        parts.push(
            `<a class="cmap-chip cmap-chip-${pack.num}" href="${packUrl(pack, zh)}" style="left:${pos.left};top:${pos.top};${packVars(pack)}"><span class="cmap-chip-num">${numeral(pack.num, zh)}</span><span class="cmap-chip-name">${escapeHtml(pack.chip[key])}</span></a>`
        );
    }
    // the field lives under the horizon — the space between deployments
    const nightPos = chipPos(270, 128);
    parts.push(
        `<span class="cmap-nightlabel" style="left:${nightPos.left};top:${nightPos.top}">${escapeHtml(conceptMap.fieldLabel[key])}</span>`
    );
    const caps = conceptMap.packs
        .map(
            (p) =>
                `<span class="cmap-cap cmap-cap-${p.num}">${escapeHtml(p.phase[key])} · ${escapeHtml(p.title[key])}</span>`
        )
        .join("");
    return `<figure class="cmap-dial"><div class="cmap-dial-frame">${parts.join("")}</div><figcaption class="cmap-caption"><span class="cmap-cap cmap-cap-idle">${escapeHtml(conceptMap.membrane.title[key])}</span>${caps}</figcaption></figure>`;
}

// ─── stations ───

function sendsFor(pack: PackNode): Handoff[] {
    return conceptMap.handoffs.filter(
        (h) => h.from === pack.num && (h.kind === "chord" || h.kind === "field")
    );
}

function renderSends(pack: PackNode, key: Key, zh: boolean): string {
    const sends = sendsFor(pack);
    if (!sends.length) return "";
    const rows = sends
        .map(
            (h) =>
                `<li class="cmap-send${h.dashed ? " cmap-send--dashed" : ""}">${badge(byNum(h.to), zh, key, conceptMap.handsLabel[key])}<span class="cmap-cargo">${escapeHtml(h.cargo[key])}</span></li>`
        )
        .join("");
    return `<ul class="cmap-sends">${rows}</ul>`;
}

function renderStation(pack: PackNode, key: Key, zh: boolean): string {
    return `<article class="cmap-station" id="st-p${pack.num}" style="${packVars(pack)}" data-pack="${pack.num}"><p class="cmap-phase">${escapeHtml(pack.phase[key])}</p><h3 class="cmap-station-title"><a href="${packUrl(pack, zh)}">${escapeHtml(pack.title[key])}</a></h3><p class="cmap-measure"><a href="${measureUrl(pack.measure, zh)}"><span class="cmap-measure-tag">${escapeHtml(conceptMap.measureLabel[key])}</span>${escapeHtml(pack.measure.name[key])}</a></p>${renderSends(pack, key, zh)}</article>`;
}

function cycleHand(from: number): Handoff {
    const hand = conceptMap.handoffs.find(
        (h) => h.kind === "cycle" && h.from === from
    );
    if (!hand) throw new Error(`concept map: missing cycle handoff ${from}`);
    return hand;
}

function renderWalk(key: Key, zh: boolean): string {
    const parts: string[] = [];
    parts.push(
        `<h2 class="cmap-zone">${escapeHtml(conceptMap.cycleLabel[key])}</h2>`
    );
    for (const num of [1, 2, 3]) {
        const pack = byNum(num);
        const hand = cycleHand(num);
        parts.push(renderStation(pack, key, zh));
        parts.push(
            `<p class="cmap-hand"><span class="cmap-hand-glyph" aria-hidden="true">↓</span><span class="cmap-cargo">${escapeHtml(hand.cargo[key])}</span></p>`
        );
    }
    parts.push(renderStation(byNum(4), key, zh));
    const night = cycleHand(4);
    parts.push(
        `<p class="cmap-hand cmap-hand--night"><span class="cmap-hand-glyph" aria-hidden="true">⟲</span><span class="cmap-cargo">${escapeHtml(night.cargo[key])}</span><a class="cmap-loop" href="#st-p1">${escapeHtml(conceptMap.loopLabel[key])}</a></p>`
    );
    parts.push(
        `<h2 class="cmap-zone">${escapeHtml(conceptMap.fieldLabel[key])}</h2>`
    );
    parts.push(renderStation(byNum(5), key, zh));
    return parts.join("");
}

// ─── the membrane frame ───

function renderFrameChip(h: Handoff, key: Key, zh: boolean): string {
    const inward = h.from === 6;
    const other = byNum(inward ? h.to : h.from);
    const glyph = h.both ? "⟷" : inward ? "⟶" : "⟶";
    const lead = inward
        ? `<span class="cmap-frame-glyph" aria-hidden="true">${glyph}</span>${badge(other, zh, key)}`
        : `${badge(other, zh, key)}<span class="cmap-frame-glyph" aria-hidden="true">${glyph}</span>`;
    return `<li class="cmap-frame-chip">${lead}<span class="cmap-cargo">${escapeHtml(h.cargo[key])}</span></li>`;
}

export function renderConceptMap(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const key: Key = zh ? "tw" : "en";
    const membrane = conceptMap.membrane;
    const top = conceptMap.handoffs.filter(
        (h) => h.kind === "membrane" && h.edge === "top"
    );
    const bottom = conceptMap.handoffs.filter(
        (h) => h.kind === "membrane" && h.edge === "bottom"
    );
    const topChips = top.map((h) => renderFrameChip(h, key, zh)).join("");
    const bottomChips = bottom.map((h) => renderFrameChip(h, key, zh)).join("");
    const exit = `<li class="cmap-frame-chip cmap-frame-chip--measure"><a href="${measureUrl(membrane.measure, zh)}"><span class="cmap-measure-tag">${escapeHtml(conceptMap.measureLabel[key])}</span>${escapeHtml(membrane.measure.name[key])}</a></li>`;
    return (
        `<div class="cmap" role="group" aria-label="${escapeHtml(conceptMap.aria[key])}">` +
        `<style>@view-transition{navigation:auto}</style>` +
        `<section class="cmap-frame" aria-labelledby="cmap-frame-title">` +
        `<a class="cmap-frame-title" id="cmap-frame-title" href="${packUrl(membrane, zh)}" style="${packVars(membrane)}">${escapeHtml(membrane.title[key])}</a>` +
        `<ul class="cmap-frame-chips cmap-frame-chips--top">${topChips}</ul>` +
        `<div class="cmap-body">${renderDial(key, zh)}<div class="cmap-walk">${renderWalk(key, zh)}</div></div>` +
        `<p class="cmap-guard">${escapeHtml(conceptMap.guard[key])}</p>` +
        `<ul class="cmap-frame-chips cmap-frame-chips--bottom">${bottomChips}${exit}</ul>` +
        `</section>` +
        `<p class="cmap-legend"><a href="${escapeHtml(conceptMap.legendUrl[key])}">${escapeHtml(conceptMap.legend[key])}</a></p>` +
        `</div>`
    );
}
