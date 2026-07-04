#!/usr/bin/env node
// check-tw-typography.mjs — lint Traditional Chinese typography.
//
// Rule: the double em-dash （——） must never sit directly against 一,
// in either order（——一 / 一——）— the strokes fuse into an unreadable
// dash run. Remediate by switching to a colon（：）, rephrasing
// (e.g. 某次), or dropping the numeral/classifier（一張病床 → 病床）.
//
// Usage:
//   node scripts/check-tw-typography.mjs           # scan tw-*.md + glossary zh strings
//   node scripts/check-tw-typography.mjs file.md … # scan given files (lint-staged compatible)
//
// Exits 1 listing file:line:col for every violation.

import { readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const PATTERN = /——一|一——/g;
const offenders = [];

function scanText(label, text) {
    const lines = text.split("\n");
    lines.forEach((line, i) => {
        for (const m of line.matchAll(PATTERN)) {
            const from = Math.max(0, m.index - 12);
            offenders.push(
                `${label}:${i + 1}:${m.index + 1} …${line.slice(from, m.index + m[0].length + 12)}…`
            );
        }
    });
}

function scanGlossary(path) {
    const entries = JSON.parse(readFileSync(path, "utf8"));
    for (const entry of entries) {
        for (const key of ["term_tw", "def_tw"]) {
            const value = entry[key] ?? "";
            for (const m of value.matchAll(PATTERN)) {
                const from = Math.max(0, m.index - 12);
                offenders.push(
                    `_data/glossary.json#${entry.id}.${key} …${value.slice(from, m.index + m[0].length + 12)}…`
                );
            }
        }
    }
}

const fileArgs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const targets =
    fileArgs.length > 0
        ? fileArgs.map((f) => resolve(f))
        : readdirSync(ROOT)
              .filter((f) => f.startsWith("tw-") && f.endsWith(".md"))
              .map((f) => join(ROOT, f))
              .concat(
                  join(ROOT, "_data/glossary.json"),
                  join(ROOT, "concept-map-tw.d2")
              );

for (const file of targets) {
    const name = basename(file);
    if (name === "glossary.json") {
        scanGlossary(file);
    } else if (
        (name.startsWith("tw-") && name.endsWith(".md")) ||
        name.endsWith("-tw.d2")
    ) {
        scanText(name, readFileSync(file, "utf8"));
    }
    // other files (from lint-staged fan-out) are not zh targets — skip
}

if (offenders.length > 0) {
    console.error(
        `tw-typography: ${offenders.length} dash-numeral collision(s)（——一 / 一——）— use ：, rephrase, or drop the numeral:`
    );
    for (const o of offenders) console.error(`  ${o}`);
    process.exit(1);
}
console.log("tw-typography OK（no ——一 / 一—— collisions）");
