import { createHash } from "node:crypto";

export const CONTENT_MAX = 1800;
const CHUNK_OVERLAP = 120;
const SITE_BASE = "https://civic.ai";

function contentChunks(s, max = CONTENT_MAX) {
    const text = String(s).trim();
    if (!text) return [];
    if (text.length <= max) return [text];

    const chunks = [];
    const paragraphs = text
        .split(/\n\s*\n/g)
        .map((p) => p.trim())
        .filter(Boolean);
    let current = "";
    for (const paragraph of paragraphs) {
        if (paragraph.length > max) {
            if (current) {
                chunks.push(current);
                current = "";
            }
            const step = Math.max(1, max - CHUNK_OVERLAP);
            for (let start = 0; start < paragraph.length; start += step) {
                chunks.push(paragraph.slice(start, start + max));
                if (start + max >= paragraph.length) break;
            }
            continue;
        }
        const next = current ? `${current}\n\n${paragraph}` : paragraph;
        if (next.length > max) {
            if (current) chunks.push(current);
            current = paragraph;
        } else {
            current = next;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

/** Vectorize vector id max 64 bytes; logical ids include full URLs. */
function vectorId(logicalId) {
    return createHash("sha256").update(logicalId).digest("hex");
}

/**
 * @param {Record<string, Array<{ title: string; url: string; subsections?: Array<{ heading?: string | null; anchor?: string | null; content?: string }> }>>} indexByLang
 */
export function chunkRecords(indexByLang) {
    const records = [];
    for (const [lang, pages] of Object.entries(indexByLang)) {
        for (const page of pages) {
            const baseUrl = page.url.startsWith("http")
                ? page.url.replace(/#.*$/, "")
                : `${SITE_BASE}${page.url}`;
            const pageTitle = page.title;
            for (const sub of page.subsections || []) {
                const anchor = sub.anchor ? `#${sub.anchor}` : "";
                const heading = sub.heading || pageTitle;
                const logicalBase = `${lang}:${baseUrl}${anchor}:${sub.anchor || "intro"}`;
                const chunks = contentChunks(sub.content || "");
                const replacesId =
                    chunks.length === 1 ? "" : vectorId(logicalBase);
                for (let i = 0; i < chunks.length; i++) {
                    const content = chunks[i];
                    const chunkSuffix = chunks.length === 1 ? "" : `:${i + 1}`;
                    const logicalId = `${logicalBase}${chunkSuffix}`;
                    records.push({
                        id: vectorId(logicalId),
                        logicalId,
                        lang,
                        url: `${baseUrl}${anchor}`,
                        heading,
                        pageTitle,
                        content,
                        embedText: `${heading}\n${content}`,
                        replacesId,
                    });
                }
            }
        }
    }
    return records;
}
