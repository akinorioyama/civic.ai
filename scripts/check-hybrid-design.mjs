import { readFileSync, existsSync } from "node:fs";

const checks = [];

function readBuilt(path) {
    if (!existsSync(path)) {
        throw new Error(`${path} does not exist; run bun run build first`);
    }
    return readFileSync(path, "utf8");
}

function expectIncludes(name, html, needle) {
    checks.push(`${name}: includes ${needle}`);
    if (!html.includes(needle)) {
        throw new Error(`${name} is missing ${needle}`);
    }
}

function expectExcludes(name, html, needle) {
    checks.push(`${name}: excludes ${needle}`);
    if (html.includes(needle)) {
        throw new Error(`${name} unexpectedly contains ${needle}`);
    }
}

const home = readBuilt("docs/index.html");
const zhHome = readBuilt("docs/tw/index.html");
const manifesto = readBuilt("docs/manifesto/index.html");
const pack = readBuilt("docs/1/index.html");
const conference = readBuilt("docs/conference/index.html");
const config = readFileSync("eleventy.config.js", "utf8");
const styles = readFileSync("styles.css", "utf8");

for (const [name, html] of [
    ["home", home],
    ["zh home", zhHome],
]) {
    expectIncludes(name, html, "site-header--home");
    expectIncludes(name, html, "img/oxford-logo.svg");
    expectIncludes(name, html, "img/afp-logo.svg");
    expectExcludes(name, html, "partner-colophon");
    expectIncludes(name, html, "data-theme-toggle");
    expectIncludes(name, html, "favicon.svg");
    expectIncludes(name, html, "favicon.ico");
    expectExcludes(name, html, "overview-frame lqip");
}

for (const [name, html] of [
    ["manifesto", manifesto],
    ["pack", pack],
    ["conference", conference],
]) {
    expectIncludes(name, html, "site-header--interior");
    expectIncludes(name, html, "civic.ai");
    expectIncludes(name, html, "site-header__frame-rule");
    expectIncludes(name, html, "partner-colophon");
    expectIncludes(name, html, "img/oxford-logo-light.svg");
    expectIncludes(name, html, "img/afp-logo-light.svg");
    expectExcludes(name, html, 'class="oxford-logo"');
    expectExcludes(name, html, "ring-of-six");
    expectIncludes(name, html, "favicon.svg");
    expectIncludes(name, html, "favicon.ico");
    expectIncludes(name, html, "site-mark");
    expectIncludes(name, html, "nav-label-short");
}

expectIncludes("theme preflight", home, "dataset.theme = theme");
expectIncludes("theme script", home, "data-theme-toggle");
expectIncludes("theme css", styles, ':root[data-theme="dark"]');
expectIncludes("theme css", styles, 'html[data-theme="dark"] .polis-dot-plot');
expectExcludes("theme css", styles, "@media (prefers-color-scheme: dark)");
expectExcludes("theme css", styles, "ring-of-six");
expectIncludes("mobile css", styles, ".site-wordmark__secondary");
expectIncludes("mobile css", styles, ".nav-label-short");
expectIncludes("print css", styles, "header > .site-header__title-block");
expectIncludes("print css", styles, "display: block !important");
expectIncludes("favicon config", config, 'addPassthroughCopy("favicon.svg")');
readBuilt("docs/favicon.svg");
readBuilt("docs/favicon.ico");

console.log(`hybrid design checks passed (${checks.length} assertions)`);
