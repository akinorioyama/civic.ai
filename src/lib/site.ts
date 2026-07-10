import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import siteData from "../../_data/site.json";
import pathsData from "../../_data/paths.json";
import glossaryData from "../../_data/glossary.json";
import comicsData from "../../_data/comics.json";
import openclawBootstrapData from "../../_data/openclaw_bootstrap.js";

export type Lang = "en-gb" | "zh-tw" | "zh-Hant";
export type Lang2 = "en" | "zh";

export const site = siteData;
export const paths = pathsData;
export const glossary = glossaryData;
export const comics = comicsData;
export const openclawBootstrap = openclawBootstrapData;

export function lang2(lang: string | undefined): Lang2 {
    return String(lang || "").split("-")[0] === "zh" ? "zh" : "en";
}

export function normalizeUrl(path: string): string {
    if (!path) return "";
    if (path === "/") return "/";
    if (path.startsWith("#")) return path;
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;

    // Split on hash first
    const hashParts = path.split("#", 2);
    const pathAndQuery = hashParts[0] || "";
    const hash = hashParts[1];
    // Split on query
    const queryParts = pathAndQuery.split("?", 2);
    const pathPart = queryParts[0] || "";
    const query = queryParts[1];

    let normalizedPath = pathPart;
    if (!normalizedPath.endsWith("/")) {
        const last = normalizedPath.split("/").pop() || "";
        if (!last.includes(".")) {
            normalizedPath = `${normalizedPath}/`;
        }
    }

    const queryStr = query !== undefined ? `?${query}` : "";
    const hashStr = hash !== undefined ? `#${hash}` : "";
    return `${normalizedPath}${queryStr}${hashStr}`;
}

export function normalizeAltUrl(path: string | undefined): string | undefined {
    return path ? normalizeUrl(path) : undefined;
}

export function readingTime(html: string, lang: string | undefined): number {
    const text = String(html || "").replace(/<[^>]+>/g, " ");
    if (lang2(lang) === "zh") {
        const chars = (text.match(/[㐀-鿿]/g) || []).length;
        return Math.max(1, Math.ceil(chars / 360));
    }
    const words = (text.trim().match(/\S+/g) || []).length;
    return Math.max(1, Math.ceil(words / 220));
}

export function assetVersion(path: string): string {
    try {
        return createHash("sha1")
            .update(readFileSync(path))
            .digest("hex")
            .slice(0, 8);
    } catch {
        return "";
    }
}

export function cssVersion(): string {
    return assetVersion("styles.css");
}

export function formatDateDisplay(
    date: unknown,
    lang: string | undefined
): string {
    if (!date) return "";
    const d = new Date(date as string | number | Date);
    if (lang2(lang) === "zh")
        return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatDateIso(date: unknown): string {
    if (!date) return "";
    return new Date(date as string | number | Date).toISOString();
}
