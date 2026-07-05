const SUPPORTED: Record<string, true> = {
    en: true,
    zh: true,
};

/** Explicit ?lang= from civic-search.js; default en. */
export function resolveQueryLang(param: string | undefined): string {
    const raw = param?.trim().toLowerCase();
    if (!raw) return "en";
    if (raw === "zh" || raw === "zh-tw" || raw === "zh-hant") return "zh";
    if (raw in SUPPORTED) return raw;
    return "en";
}
