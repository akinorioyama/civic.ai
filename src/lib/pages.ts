import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "./legacyMarkdown";
import { expandShortcodes } from "./shortcodes";
import { normalizeUrl } from "./site";

export type LayoutName = "default" | "chapter" | "conference";

export interface ActionLink {
    url: string;
    text: string;
    arrow?: "left" | "right";
}

export interface PageFrontmatter {
    layout?: LayoutName | false;
    title?: string;
    subtitle?: string;
    description?: string;
    meta_description?: string;
    summary?: string;
    lang?: "en-gb" | "zh-tw" | "zh-Hant";
    permalink?: string;
    alt_lang_url?: string;
    exclude_from_sitemap?: boolean;
    page_class?: string;
    author?: string;
    date?: string | Date;
    audio?: string;
    og_image?: string;
    og_description?: string;
    thumbnail?: string | { src: string; w?: number; h?: number };
    openclaw_discovery?: boolean;
    manifesto_link?: string;
    manifesto_text?: string;
    prev_action?: ActionLink;
    next_action?: ActionLink;
    nav_prev?: ActionLink;
    nav_next?: ActionLink;
    header_title?: string;
    date_line?: string;
    hosts?: unknown[];
    goals?: unknown[];
    agenda_title?: string;
    agenda?: unknown[];
    packs_title?: string;
    packs_intro?: string;
    packs_link_text?: string;
    packs_link_url?: string;
    packs_period?: string;
    packs?: unknown[];
    overview_image?: { src: string; alt: string; w: number; h: number };
    ui_locale?: "en" | "tw";
}

export interface PageRecord {
    sourcePath: string;
    sourceName: string;
    url: string;
    slug: string;
    data: PageFrontmatter;
    rawBody: string;
    html: string;
    includeInSitemap: boolean;
    isRawHtmlDocument: boolean;
}

const root = process.cwd();
let pageCache: PageRecord[] | undefined;

function isRootContentFile(name: string): boolean {
    if (["README.md", "AGENTS.md", "CLAUDE.md", "DESIGN.md"].includes(name))
        return false;
    if (
        [
            "robots.njk",
            "sitemap.xml.njk",
            "llms.txt.njk",
            "polis-care-deliberation.njk",
            "tw-polis-care-deliberation.njk",
        ].includes(name)
    )
        return false;
    if (name.endsWith(".md")) return true;
    return name === "sensemaker.html" || name === "tw-sensemaker.html";
}

function deriveUrl(name: string, data: PageFrontmatter): string {
    if (data.permalink) return normalizeUrl(data.permalink);
    if (name === "index.md") return "/";
    if (name === "tw-index.md") return "/tw/";
    const withoutExt = name.slice(0, -extname(name).length);
    if (withoutExt.startsWith("tw-"))
        return normalizeUrl(`/tw/${withoutExt.slice(3)}`);
    return normalizeUrl(`/${withoutExt}`);
}

function slugFromUrl(url: string): string {
    return url.replace(/^\//, "").replace(/\/$/, "");
}

function loadPage(sourceName: string): PageRecord {
    const sourcePath = join(root, sourceName);
    const parsed = matter(readFileSync(sourcePath, "utf8"));
    const data = parsed.data as PageFrontmatter;
    const url = deriveUrl(sourceName, data);
    const isRawHtmlDocument = sourceName === "sensemaker.html";
    const rawBody = parsed.content;
    const expanded = expandShortcodes({ sourcePath, data }, rawBody);
    const html = isRawHtmlDocument
        ? rawBody
        : sourceName.endsWith(".html")
          ? expanded
          : renderMarkdown(expanded);
    const includeInSitemap =
        !data.exclude_from_sitemap && data.layout !== false;
    return {
        sourcePath,
        sourceName,
        url,
        slug: slugFromUrl(url),
        data,
        rawBody,
        html,
        includeInSitemap,
        isRawHtmlDocument,
    };
}

export function loadPages(): PageRecord[] {
    if (pageCache) return pageCache;
    pageCache = readdirSync(root)
        .filter(isRootContentFile)
        .map(loadPage)
        .sort((a, b) => a.url.localeCompare(b.url));
    return pageCache;
}

export function getPageByUrl(url: string): PageRecord {
    const normalized = normalizeUrl(url);
    const page = loadPages().find((candidate) => candidate.url === normalized);
    if (!page) throw new Error(`No page found for URL: ${url}`);
    return page;
}

export function getDynamicPagePaths(): Array<{
    params: { slug: string };
    props: { page: PageRecord };
}> {
    const explicit = new Set([
        "/",
        "/tw/",
        "/conference/sensemaking/",
        "/tw/conference/sensemaking/",
    ]);
    return loadPages()
        .filter((page) => !explicit.has(page.url))
        .filter((page) => !page.isRawHtmlDocument)
        .map((page) => ({ params: { slug: page.slug }, props: { page } }));
}

export function getSitemapPages(): PageRecord[] {
    return loadPages().filter((page) => page.includeInSitemap);
}

export function readRawHtmlDocument(
    sourceName: "sensemaker.html" | "tw-sensemaker.html"
): string {
    const page = loadPages().find(
        (candidate) => candidate.sourceName === sourceName
    );
    if (!page || !page.isRawHtmlDocument)
        throw new Error(`Raw HTML document not found: ${sourceName}`);
    return page.rawBody;
}

export function clearPageCacheForTests(): void {
    pageCache = undefined;
}

if (!existsSync(root)) throw new Error(`Project root does not exist: ${root}`);
