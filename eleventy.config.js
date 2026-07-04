import htmlmin from "html-minifier";
import footnote from "markdown-it-footnote";
import anchor from "markdown-it-anchor";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export default function (eleventyConfig) {
    // Fix markdown-it CJK emphasis: CommonMark's flanking rules break when
    // CJK punctuation (。？：) precedes closing ** without a trailing space.
    // We patch scanDelims so any delimiter adjacent to a CJK character can
    // open or close emphasis, matching how CJK text actually works.
    eleventyConfig.amendLibrary("md", (mdLib) => {
        mdLib.use(footnote);
        const cjkSlugify = (s) => {
            const out = String(s)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\p{L}\p{N}_-]/gu, "");
            return out || "section";
        };
        mdLib.use(anchor, { slugify: cjkSlugify, permalink: false });
        const CJK =
            /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF]/;
        const State = mdLib.inline.State;
        const orig = State.prototype.scanDelims;
        State.prototype.scanDelims = function (start, canSplitWord) {
            const result = orig.call(this, start, canSplitWord);
            const marker = this.src.charCodeAt(start);
            let pos = start;
            while (pos < this.posMax && this.src.charCodeAt(pos) === marker)
                pos++;
            const lastChar = start > 0 ? this.src[start - 1] : " ";
            const nextChar = pos < this.posMax ? this.src[pos] : " ";
            if (!result.can_close && CJK.test(lastChar))
                result.can_close = true;
            if (!result.can_open && CJK.test(nextChar)) result.can_open = true;
            return result;
        };
    });

    // Passthrough copy for static assets
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("audio");
    eleventyConfig.addPassthroughCopy("fonts");
    eleventyConfig.addPassthroughCopy("styles.css");
    eleventyConfig.addPassthroughCopy("CNAME");

    eleventyConfig.addPassthroughCopy("favicon.ico");
    eleventyConfig.addPassthroughCopy("favicon.svg");
    eleventyConfig.addPassthroughCopy(".nojekyll");

    // Minify HTML
    eleventyConfig.addTransform("htmlmin", function (content) {
        if ((this.page.outputPath || "").endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }
        return content;
    });

    // Asciify the machine-readable OpenClaw SKILL.md so a raw .md never shows
    // mojibake to agents. Scoped to this one file; HTML guides keep typography.
    eleventyConfig.addTransform("asciifySkill", function (content) {
        const out = this.page && this.page.outputPath;
        if (!out || !out.endsWith("/.well-known/openclaw/SKILL.md"))
            return content;
        return content
            .replace(/—/g, "--")
            .replace(/[–‑]/g, "-")
            .replace(/[''′]/g, "'")
            .replace(/[""″]/g, '"')
            .replace(/…/g, "...")
            .replace(/→/g, "->")
            .replace(/[    ]/g, " ")
            .replace(/[^\x00-\x7F]/g, "");
    });

    // Filter for relative_url compatibility with Jekyll
    eleventyConfig.addFilter("relative_url", function (url) {
        if (typeof url !== "string" || !url.length) {
            return "";
        }
        return url;
    });

    // Date filter
    eleventyConfig.addFilter("date", function (date, format) {
        // Date filter supporting Jekyll-style format strings
        if (!date) return "";
        if (typeof format !== "string") {
            return new Date(date).toLocaleDateString("en-US");
        }

        const d = new Date(date);
        // Very basic mapping for the formats used in the templates
        // "%B %-d, %Y" -> Month Day, Year
        // "%Y 年 %-m 月 %-d 日" -> Year 年 Month 月 Day 日

        if (format.includes("%B")) {
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
        if (format.includes("年")) {
            return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
        }
        return d.toDateString();
    });

    eleventyConfig.addFilter("readingTime", function (content, lang) {
        const text = String(content || "").replace(/<[^>]+>/g, " ");
        const lang2 = String(lang || "").split("-")[0];
        if (lang2 === "zh") {
            const chars = (text.match(/[㐀-鿿]/g) || []).length;
            return Math.max(1, Math.ceil(chars / 360));
        }
        const words = (text.trim().match(/\S+/g) || []).length;
        return Math.max(1, Math.ceil(words / 220));
    });

    // Cache-busting token for styles.css — a short content hash so the URL
    // only changes when the CSS actually changes, forcing clients past any
    // stale cached copy after a deploy.
    eleventyConfig.addGlobalData("cssVersion", () => {
        try {
            return createHash("sha1")
                .update(readFileSync("styles.css"))
                .digest("hex")
                .slice(0, 8);
        } catch (e) {
            return "";
        }
    });

    eleventyConfig.ignores.add("AGENTS.md");
    eleventyConfig.ignores.add("CLAUDE.md");
    eleventyConfig.ignores.add("README.md");

    return {
        dir: {
            input: ".",
            output: "docs",
            layouts: "_layouts",
        },
        templateFormats: ["html", "md", "liquid", "njk"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
    };
}
