import {
    DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS,
    DEFAULT_NEMOTRON_ULTRA_BASETEN_MODEL,
    openAiChatCompletionsEventStreamToText,
    resolveAudreyAiGateway,
    streamViaDirectBasetenChatCompletions,
    streamViaGatewayChatCompletions,
    type AudreyGatewayEnv,
} from "@au/cf-ai-gateway";
import { citationFootnotes } from "./citationFootnotes";
import { stubSiteAnswer, textStream } from "./stubAnswer";
import {
    retrieveSiteChunks,
    SITE_EMBEDDING_MODEL,
    type SiteChunk,
    type VectorizeBinding,
} from "./vectorize";

type AiBinding = {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

const LANG_INSTRUCTION: Record<string, string> = {
    en: "Answer in English. Cite excerpts with markdown footnote references [^1], [^2] (caret form only; do not paste URLs).",
    zh: "請用繁體中文作答。以 [^1]、[^2] 標註引註（僅用此格式，勿貼網址）。",
};

function chunkFootnoteLabel(c: SiteChunk): string {
    return c.metadata.heading || c.metadata.pageTitle || "Section";
}

function footnoteDefsFromChunks(chunks: SiteChunk[]): string {
    return chunks
        .map(
            (c, i) =>
                `[^${i + 1}]: [${chunkFootnoteLabel(c)}](${c.metadata.url})`
        )
        .join("\n");
}

function buildMessages(
    question: string,
    chunks: SiteChunk[],
    lang: string
): Array<{ role: string; content: string }> {
    const cite = chunks
        .map((c, i) => {
            const label =
                c.metadata.heading || c.metadata.pageTitle || "Section";
            return `[${i + 1}] ${label}\nURL: ${c.metadata.url}\n${c.metadata.content}`;
        })
        .join("\n\n");
    const instruction = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en;
    return [
        {
            role: "system",
            content:
                "You are a helpful assistant for the Civic AI 6-Pack of Care site. Answer only from the excerpts. Be concise. If excerpts are insufficient, say so briefly.",
        },
        {
            role: "user",
            content: `${instruction}\n\nQuestion: ${question}\n\nExcerpts:\n${cite}`,
        },
    ];
}

function retrievalStubMarkdown(
    question: string,
    lang: string,
    chunks: SiteChunk[]
): string {
    const lines = [
        `*(No AI gateway configured; showing retrieved excerpts — lang=${lang})*`,
        "",
        `**${question.trim()}**`,
        "",
    ];
    chunks.forEach((c, i) => {
        const label = chunkFootnoteLabel(c);
        lines.push(`[^${i + 1}] **${label}**`);
        lines.push("");
        lines.push(
            c.metadata.content.slice(0, 400) +
                (c.metadata.content.length > 400 ? "…" : "")
        );
        lines.push("");
    });
    if (chunks.length > 0) {
        lines.push("");
        lines.push(footnoteDefsFromChunks(chunks));
    }
    return lines.join("\n");
}

export async function streamSiteAnswer(
    env:
        | (AudreyGatewayEnv & {
              AI?: AiBinding;
              SITE_VECTORIZE?: VectorizeBinding;
              SITE_EMBEDDING_MODEL?: string;
              BASETEN_MODEL?: string;
          })
        | undefined,
    question: string,
    lang: string
): Promise<Response> {
    const bindings = env ?? {};
    const ai = bindings.AI;
    const vectorize = bindings.SITE_VECTORIZE;
    const embeddingModel =
        bindings.SITE_EMBEDDING_MODEL?.trim() || SITE_EMBEDDING_MODEL;
    let chunks: SiteChunk[] = [];
    if (ai && vectorize) {
        chunks = await retrieveSiteChunks(ai, vectorize, question, lang, {
            embeddingModel,
        });
    }
    const gateway = resolveAudreyAiGateway(bindings);
    if (!gateway || gateway.kind !== "chat") {
        const body =
            chunks.length > 0
                ? retrievalStubMarkdown(question, lang, chunks)
                : stubSiteAnswer(question, lang);
        return new Response(textStream(body), {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    }

    if (chunks.length === 0) {
        const body = stubSiteAnswer(question, lang);
        return new Response(textStream(body), {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    }

    if (!ai) {
        const body = retrievalStubMarkdown(question, lang, chunks);
        return new Response(textStream(body), {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    }

    const basetenKey = bindings.BASETEN_API_KEY?.trim();
    const gatewayConfig = gateway.config;
    const messages = buildMessages(question, chunks, lang);
    const basetenModel =
        bindings.BASETEN_MODEL?.trim() || DEFAULT_NEMOTRON_ULTRA_BASETEN_MODEL;

    async function nemotronByteStream(): Promise<ReadableStream<Uint8Array>> {
        if (basetenKey && !gatewayConfig.gatewayAuthToken) {
            return streamViaDirectBasetenChatCompletions(
                basetenKey,
                basetenModel,
                messages,
                DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
            );
        }
        if (gatewayConfig.gatewayAuthToken) {
            return streamViaGatewayChatCompletions(
                gatewayConfig,
                messages,
                DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
            );
        }
        if (basetenKey) {
            return streamViaDirectBasetenChatCompletions(
                basetenKey,
                basetenModel,
                messages,
                DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
            );
        }
        return streamViaGatewayChatCompletions(
            gatewayConfig,
            messages,
            DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
        );
    }

    try {
        const byteStream = await nemotronByteStream();
        const footnotes = chunks.map((c) => {
            const label =
                c.metadata.heading || c.metadata.pageTitle || "Section";
            return `[${label}](${c.metadata.url})`;
        });
        const textStreamOut = byteStream
            .pipeThrough(openAiChatCompletionsEventStreamToText())
            .pipeThrough(citationFootnotes(footnotes))
            .pipeThrough(new TextEncoderStream());

        return new Response(textStreamOut, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (e) {
        console.error("nemotron stream failed", e);
        if (basetenKey) {
            try {
                const byteStream = await streamViaDirectBasetenChatCompletions(
                    basetenKey,
                    basetenModel,
                    messages,
                    DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
                );
                const footnotes = chunks.map((c) => {
                    const label =
                        c.metadata.heading || c.metadata.pageTitle || "Section";
                    return `[${label}](${c.metadata.url})`;
                });
                const textStreamOut = byteStream
                    .pipeThrough(openAiChatCompletionsEventStreamToText())
                    .pipeThrough(citationFootnotes(footnotes))
                    .pipeThrough(new TextEncoderStream());
                return new Response(textStreamOut, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                        "Cache-Control": "no-store",
                        "X-Accel-Buffering": "no",
                    },
                });
            } catch (e2) {
                console.error("direct baseten fallback failed", e2);
            }
        }
        const body =
            chunks.length > 0
                ? retrievalStubMarkdown(question, lang, chunks)
                : stubSiteAnswer(question, lang);
        return new Response(textStream(body), {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    }
}
