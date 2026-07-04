import type { PageRecord } from "./pages";
import { comics, glossary, lang2, openclawBootstrap, paths } from "./site";

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(value: unknown): string {
    return escapeHtml(value);
}

export function expandShortcodes(
    page: Pick<PageRecord, "sourcePath" | "data">,
    body: string
): string {
    let expanded = body
        .replaceAll(
            "<!-- astro:reading-paths -->",
            renderReadingPaths(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:comics-gallery -->",
            renderComicsGallery(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:glossary-list -->",
            renderGlossaryList(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:openclaw-raw-skill-note en -->",
            renderOpenClawRawSkillNote("en")
        )
        .replaceAll(
            "<!-- astro:openclaw-raw-skill-note tw -->",
            renderOpenClawRawSkillNote("tw")
        );
    expanded = expanded.replaceAll(
        "<!-- astro:openclaw-guide en -->",
        renderOpenClawGuideMarkdown("en")
    );
    expanded = expanded.replaceAll(
        "<!-- astro:openclaw-guide tw -->",
        renderOpenClawGuideMarkdown("tw")
    );
    if (/\{%|\{\{/.test(expanded))
        throw new Error(
            `Unhandled legacy template syntax in ${page.sourcePath}`
        );
    return expanded;
}

export function renderReadingPaths(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const groups = paths
        .map((path) => {
            const title = zh ? path.label_tw : path.label_en;
            const steps = path.steps
                .map((step) => {
                    const href = zh ? step.url_tw : step.url;
                    const label = zh ? step.label_tw : step.label_en;
                    return `<li><a href="${escapeAttr(href)}">${escapeHtml(label)}</a></li>`;
                })
                .join("");
            return `<div class="reading-path"><h3 class="reading-path__title">${escapeHtml(title)}</h3><ol class="reading-path__steps">${steps}</ol></div>`;
        })
        .join("");
    return `<nav class="reading-paths" aria-label="${zh ? "依讀者類型的閱讀路徑" : "Reading paths by audience"}">${groups}</nav>`;
}

export function renderComicsGallery(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const key = zh ? "tw" : "en";
    const base = zh ? "/tw/" : "/";
    const overview = comics.overview[key];
    const caption = zh
        ? `<p class="figure-caption"><strong>概覽圖。</strong>六力一覽，由 Nicky Case 繪製。</p>`
        : `<p class="figure-caption"><strong>Overview.</strong> All six packs at a glance, illustrated by Nicky Case.</p>`;
    const pages = comics.packs
        .flatMap((pack) =>
            pack.pages.map((page) => {
                const img = zh
                    ? `/img/pack${pack.num}-${page.id}-tw.jpg`
                    : `/img/pack${pack.num}-${page.id}.jpg`;
                return `<a href="${base}${pack.slug}/" class="comics-page-link" id="pack-${pack.num}-${page.id}"><noscript><img src="${escapeAttr(img)}" alt="${escapeAttr(page.alt[key])}" width="1437" height="1999" loading="lazy" decoding="async" /></noscript><span class="comics-page-label"><span class="comics-page-pack">${escapeHtml(pack.title[key])}</span><span class="comics-page-type">${escapeHtml(page.type[key])}</span></span></a>`;
            })
        )
        .join("");
    const credit = zh
        ? `插圖由 <a href="https://ncase.me">Nicky Case</a> 繪製（CC0）。<a href="${escapeAttr(comics.source_repo)}">原始檔案</a>見 GitHub。`
        : `Illustrated by <a href="https://ncase.me">Nicky Case</a> (CC0). <a href="${escapeAttr(comics.source_repo)}">Source files</a> on GitHub.`;
    return `<div class="comics-gallery"><section class="comics-overview"><a href="${base}#the-6-pack" class="comics-overview-link"><noscript><img src="${escapeAttr(overview.src)}" alt="${escapeAttr(overview.alt)}" class="overview-image" width="${overview.width}" height="${overview.height}" loading="lazy" decoding="async" /></noscript></a>${caption}</section><div class="comics-grid">${pages}</div><p class="comics-credit">${credit}</p></div>`;
}

export function renderGlossaryList(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const entries = glossary
        .map((entry) => {
            const term = zh ? entry.term_tw : entry.term_en;
            const definition = zh ? entry.def_tw : entry.def_en;
            return `<dt id="${escapeAttr(entry.id)}">${escapeHtml(term)}</dt><dd>${definition}</dd>`;
        })
        .join("");
    return `<dl class="glossary-list">${entries}</dl>`;
}

export function renderOpenClawRawSkillNote(which: "en" | "tw"): string {
    return openclawBootstrap.guides[which].rawSkillNote;
}

export function renderOpenClawGuideMarkdown(which: "en" | "tw"): string {
    const guide = openclawBootstrap.guides[which];
    const separator = which === "tw" ? "：" : ".";
    const lines: string[] = [];
    const section = (heading: string, body?: string) => {
        lines.push(`## ${heading}`, "");
        if (body) lines.push(body, "");
    };
    section(guide.whenToUseHeading, guide.whenToUseText);
    section(guide.firstMoveHeading, guide.firstMoveIntro);
    openclawBootstrap.readingOrder.forEach((item, index) => {
        lines.push(
            `${index + 1}. [${item.title[which]}](${item.url[which]}) — ${item.why[which]}`,
            ""
        );
    });
    lines.push("", guide.firstMoveOutro, "");
    section(guide.identityHeading, guide.identityIntro);
    guide.identityItems.forEach((item) =>
        lines.push(`- **${item.label}${separator}** ${item.text}`, "")
    );
    lines.push("");
    section(guide.conversationHeading, guide.conversationIntro);
    guide.conversationItems.forEach((item) => lines.push(`- ${item}`, ""));
    section(guide.commitmentsHeading, guide.commitmentsIntro);
    guide.commitments.forEach((item) =>
        lines.push(`- **${item.label}${separator}** ${item.text}`, "")
    );
    section(guide.antiPatternsHeading, guide.antiPatternsIntro);
    guide.antiPatterns.forEach((item) => lines.push(`- ${item}`, ""));
    section(guide.mappingHeading, guide.mappingIntro);
    guide.mapping.forEach((item) =>
        lines.push(`- **\`${item.file}\`** — ${item.text}`, "")
    );
    if (guide.memoryHeading) section(guide.memoryHeading, guide.memoryIntro);
    lines.push(guide.closing);
    return lines.join("\n");
}

export function asciifySkill(content: string): string {
    return content
        .replace(/—/g, "--")
        .replace(/[–‑]/g, "-")
        .replace(/['‘’′]/g, "'")
        .replace(/[“”″]/g, '"')
        .replace(/…/g, "...")
        .replace(/→/g, "->")
        .replace(/[    ]/g, " ")
        .replace(/[^\x00-\x7F]/g, "");
}
