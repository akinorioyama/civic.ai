import { expect, test } from "bun:test";
import { getPageByUrl, getSitemapPages } from "../src/lib/pages";

test("loads canonical root pages", () => {
    expect(getPageByUrl("/").sourceName).toBe("index.md");
    expect(getPageByUrl("/tw/").sourceName).toBe("tw-index.md");
});

test("renders CJK-sensitive markdown through root loader", () => {
    expect(getPageByUrl("/1/").html).toContain(
        "<strong>Relationships first.</strong>"
    );
    expect(getPageByUrl("/tw/1/").html).toContain(
        "<strong>關係優先。</strong>"
    );
});

test("keeps book-aligned source material tableless", () => {
    const insideTheKami = getPageByUrl("/inside-the-kami/").html;
    expect(insideTheKami).not.toContain('class="compare-table"');
    expect(insideTheKami).not.toContain("<th>Research result</th>");
    expect(insideTheKami).toContain(
        "Separate truth-tracking from speech imitation"
    );
    expect(insideTheKami).toContain(
        "Decision traces can distinguish verified claims from reported claims"
    );

    const kamiSetup = getPageByUrl("/kami/").html;
    expect(kamiSetup).not.toContain("<th>RAM</th>");
    expect(kamiSetup).toContain("For machines with 16 GB RAM or more:");
    expect(kamiSetup).toContain("gemma4:12b-it-qat");

    const twKamiSetup = getPageByUrl("/tw/kami/").html;
    expect(twKamiSetup).not.toContain("<th>記憶體</th>");
    expect(twKamiSetup).toContain("記憶體達 16 GB 或以上：");

    const measures = getPageByUrl("/measures/").html;
    expect(measures).not.toContain("<th>Pack</th>");
    expect(measures).not.toContain("<th>Headline public measure</th>");
    expect(measures).toContain('id="uncommon-ground-index"');
    expect(measures).toContain("Uncommon-ground index");
});

test("expands generated glossary pages", () => {
    expect(getPageByUrl("/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/glossary/").html).toContain("Civic AI");
    expect(getPageByUrl("/tw/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/tw/glossary/").html).toContain("仁工智慧");
});

test("excludes OpenClaw human guide from sitemap", () => {
    expect(getPageByUrl("/openclaw/").includeInSitemap).toBe(false);
    expect(getSitemapPages().some((page) => page.url === "/openclaw/")).toBe(
        false
    );
    expect(getSitemapPages().some((page) => page.url === "/1/")).toBe(true);
});
