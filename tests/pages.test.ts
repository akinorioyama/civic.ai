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

test("renders table-shaped source material as tables", () => {
    const insideTheKami = getPageByUrl("/inside-the-kami/").html;
    expect(insideTheKami).toContain('class="compare-table"');
    expect(insideTheKami).toContain("<th>Research result</th>");
    expect(insideTheKami).toContain(
        "<td>Each Kami should have a narrow mandate</td>"
    );

    const kamiSetup = getPageByUrl("/kami/").html;
    expect(kamiSetup).toContain("<th>RAM</th>");
    expect(kamiSetup).toContain("<td><code>gemma4:12b-it-qat</code></td>");

    const measures = getPageByUrl("/measures/").html;
    expect(measures).toContain("<th>Pack</th>");
    expect(measures).toContain("<th>Headline public measure</th>");
    expect(measures).toContain(
        'id="uncommon-ground-index">Uncommon-ground index</span>'
    );
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
