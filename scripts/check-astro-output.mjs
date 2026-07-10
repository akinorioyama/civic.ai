import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const BUILD_DIR = resolve(process.env.BUILD_DIR || "dist");
const checks = [];

function built(path) {
    const full = join(BUILD_DIR, path);
    if (!existsSync(full)) throw new Error(`${full} does not exist`);
    return readFileSync(full, "utf8");
}

function expect(path, needle) {
    checks.push(`${path}: ${needle}`);
    const html = built(path);
    if (!html.includes(needle)) throw new Error(`${path} missing ${needle}`);
}

expect("tw/1/index.html", "<em>先搭橋，再決策。</em>");
expect("tw/1/index.html", "<strong>關係優先。</strong>");
checks.push("index.html: Policy & governance");
const home = built("index.html");
if (
    !home.includes("Policy &amp; governance") &&
    !home.includes("Policy & governance")
)
    throw new Error("index.html missing Policy & governance");
expect("tw/index.html", "政策與治理");
expect("comics/index.html", 'id="pack-1-1"');
expect("glossary/index.html", 'id="civic-ai"');
expect("glossary/index.html", "Civic AI");
expect("tw/glossary/index.html", 'id="civic-ai"');
expect("tw/glossary/index.html", "仁工智慧");
const doomDebatesLink =
    '<a href="https://www.youtube.com/watch?v=bvcmiirT8ME">Doom Debates</a>';
for (const [path, paragraph] of [
    [
        "doom-debate/index.html",
        `<p>Originally recorded for ${doomDebatesLink} with Liron Shapira.</p>`,
    ],
    [
        "tw/doom-debate/index.html",
        `<p>原始錄音收錄於 ${doomDebatesLink}，對談者為 Liron Shapira。</p>`,
    ],
]) {
    const doomDebate = built(path);
    expect(path, paragraph);
    checks.push(`${path}: no escaped description HTML`);
    if (doomDebate.includes("&lt;a href=") || doomDebate.includes("&amp;lt;a"))
        throw new Error(`${path} contains escaped description HTML`);
}
const skill = built(".well-known/openclaw/SKILL.md");
if (!/^[\x00-\x7F]*$/.test(skill))
    throw new Error("OpenClaw skill is not ASCII-only");
if (!built("CNAME").includes("civic.ai"))
    throw new Error("CNAME missing civic.ai");
if (!existsSync(join(BUILD_DIR, ".nojekyll")))
    throw new Error(".nojekyll missing");
console.log(`astro output checks passed (${checks.length + 3} assertions)`);
