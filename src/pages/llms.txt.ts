import { openclawBootstrap, site } from "../lib/site";

export function GET() {
    const lines = [
        "# Civic AI",
        "",
        "Civic AI is alignment by public process: bounded local stewards, bridge-first governance, accountable action, public repair, and real sunset conditions.",
        "",
        "Start here for new claws:",
        `- OpenClaw bootstrap guide: ${site.url}${openclawBootstrap.urls.guide.en}`,
        `- OpenClaw bootstrap skill: ${site.url}${openclawBootstrap.urls.rawSkill}`,
        `- Traditional Mandarin guide: ${site.url}${openclawBootstrap.urls.guide.tw}`,
        "",
        "Recommended reading order:",
        ...openclawBootstrap.readingOrder.map(
            (item) =>
                `- ${item.title.en}: ${site.url}${item.url.en} — ${item.why.en}`
        ),
        "",
    ];
    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
