#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import htmlmin from "html-minifier";

const root = resolve(process.env.BUILD_DIR || "dist");
const options = {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true,
};

function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && entry.name.endsWith(".html")) {
            writeFileSync(
                full,
                htmlmin.minify(readFileSync(full, "utf8"), options)
            );
        }
    }
}

walk(root);
console.log(`Minified HTML in ${root}`);
