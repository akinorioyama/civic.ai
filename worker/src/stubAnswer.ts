/** Shown when Vectorize returns no chunks (gateway may still be configured). */
export function stubSiteAnswer(question: string, lang: string): string {
    const q = question.trim();
    const lead =
        lang === "zh"
            ? `我在仁工智慧網站索引中找不到符合這個問題的段落（lang=${lang}）。`
            : `I could not find passages in the Civic AI site index that match your question (lang=${lang}).`;
    return [
        lead,
        "",
        lang === "zh" ? `您的問題：**${q}**` : `You asked: **${q}**`,
        "",
        lang === "zh"
            ? "請嘗試較長的詞組，或使用下方的關鍵字搜尋。"
            : "Try a longer phrase or use the keyword search below.",
    ].join("\n");
}

export function textStream(body: string): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(body));
            controller.close();
        },
    });
}
