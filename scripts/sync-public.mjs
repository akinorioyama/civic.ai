#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const PASSTHROUGH = [
    "img",
    "fonts",
    "audio",
    "styles.css",
    "CNAME",
    ".nojekyll",
    "favicon.ico",
    "favicon.svg",
];

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "public");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const source of PASSTHROUGH) {
    const from = join(root, source);
    if (!existsSync(from))
        throw new Error(`Missing passthrough asset: ${source}`);
    cpSync(from, join(outDir, basename(source)), { recursive: true });
}

console.log(`Synced ${PASSTHROUGH.length} passthrough assets to public/`);
