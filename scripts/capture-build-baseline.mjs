#!/usr/bin/env node
import {
    existsSync,
    readdirSync,
    readFileSync,
    writeFileSync,
    mkdirSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const buildDir = resolve(process.env.BASELINE_DIR || "docs");
const outFile = resolve(
    process.env.BASELINE_OUT || "tests/fixtures/eleventy-build-baseline.json"
);

if (!existsSync(buildDir)) {
    throw new Error(`Build directory does not exist: ${buildDir}`);
}

function walk(dir, files = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (entry.isFile()) files.push(full);
    }
    return files;
}

function posixRelative(file) {
    return relative(buildDir, file).split(sep).join("/");
}

function attr(html, regex) {
    const match = html.match(regex);
    return match ? decodeHtml(match[1]) : "";
}

function decodeHtml(value) {
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function snapshotHtml(file) {
    const html = readFileSync(file, "utf8");
    const alternates = Array.from(
        html.matchAll(
            /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']([^"']+)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
        ),
        (match) => ({
            hreflang: decodeHtml(match[1]),
            href: decodeHtml(match[2]),
        })
    ).sort((a, b) => (a.hreflang + a.href).localeCompare(b.hreflang + b.href));

    return {
        path: posixRelative(file),
        lang: attr(html, /<html\b[^>]*\blang=["']([^"']*)["']/i),
        title: attr(html, /<title>([\s\S]*?)<\/title>/i).trim(),
        description: attr(
            html,
            /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/i
        ),
        canonical: attr(
            html,
            /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']*)["'])[^>]*>/i
        ),
        alternates,
        ids: Array.from(
            new Set(
                Array.from(html.matchAll(/\bid=["']([^"']+)["']/g), (match) =>
                    decodeHtml(match[1])
                )
            )
        ).sort(),
    };
}

const files = walk(buildDir);
const html = files
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !posixRelative(file).startsWith("_astro/"))
    .map(snapshotHtml)
    .sort((a, b) => a.path.localeCompare(b.path));

const requiredFiles = files
    .map(posixRelative)
    .filter((path) => !path.endsWith(".html"))
    .filter((path) => !path.startsWith("_astro/"))
    .sort();

const baseline = { html, requiredFiles };
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(baseline, null, 2)}\n`);
console.log(
    `Captured ${html.length} HTML snapshots and ${requiredFiles.length} required files to ${outFile}`
);
