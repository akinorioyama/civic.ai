#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const buildDir = resolve(root, process.env.BUILD_DIR || "dist");

function fail(message) {
    console.error(`Search output check failed: ${message}`);
    process.exitCode = 1;
}

function expectBuiltFile(relativePath) {
    const path = join(buildDir, relativePath);
    if (!existsSync(path)) {
        fail(`missing ${relativePath}`);
    }
}

function readBuilt(relativePath) {
    const path = join(buildDir, relativePath);
    if (!existsSync(path)) {
        fail(`missing ${relativePath}`);
        return "";
    }
    return readFileSync(path, "utf8");
}

function expectIncludes(relativePath, text, description = text) {
    const body = readBuilt(relativePath);
    if (!body.includes(text)) {
        fail(`${relativePath} lacks ${description}`);
    }
    return body;
}

function expectNotIncludes(relativePath, text, description = text) {
    const body = readBuilt(relativePath);
    if (body.includes(text)) {
        fail(`${relativePath} unexpectedly contains ${description}`);
    }
    return body;
}

expectBuiltFile("pagefind/pagefind-ui.js");
expectBuiltFile("pagefind/pagefind-ui.css");

expectIncludes("index.html", 'id="search-overlay"');
expectIncludes("index.html", 'id="search-container"');
expectIncludes("index.html", 'id="civic-ask-answer"');
expectIncludes("index.html", "data-pagefind-body");
expectIncludes("index.html", 'data-pagefind-filter="lang:en"');
expectIncludes("index.html", "/pagefind/pagefind-ui.js");
expectIncludes("index.html", "/assets/js/civic-search.js");
expectIncludes("index.html", "/assets/js/civic-ask.js");

expectIncludes("tw/index.html", 'id="search-overlay"');
expectIncludes("tw/index.html", 'data-pagefind-filter="lang:zh"');
expectIncludes("tw/index.html", "/assets/vendor/fuse.min.js");
expectNotIncludes(
    "tw/conference/sensemaking/index.html",
    "data-pagefind-body",
    "Pagefind body on excluded synthetic Polis page"
);
expectNotIncludes(
    "tw/sensemaker/index.html",
    "data-pagefind-body",
    "Pagefind body on raw HTML report page"
);

const indexPath = "tw/search-index.json";
const indexJson = readBuilt(indexPath);
try {
    const entries = JSON.parse(indexJson);
    if (!Array.isArray(entries) || entries.length === 0) {
        fail(`${indexPath} is empty or not an array`);
    }
    for (const entry of entries) {
        if (
            !entry ||
            typeof entry.url !== "string" ||
            !entry.url.startsWith("/tw/")
        ) {
            fail(`${indexPath} contains a non-/tw/ entry`);
            break;
        }
        if (
            !Array.isArray(entry.subsections) ||
            entry.subsections.length === 0
        ) {
            fail(`${indexPath} entry ${entry.url} has no subsections`);
            break;
        }
    }
    if (!entries.some((entry) => entry.url === "/tw/1/")) {
        fail(`${indexPath} lacks /tw/1/`);
    }
} catch (error) {
    fail(
        `${indexPath} is invalid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Search output OK");
