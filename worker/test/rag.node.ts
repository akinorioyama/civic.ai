import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import test from "node:test";
import { streamSiteAnswer } from "../src/rag";
import { retrieveSiteChunks } from "../src/vectorize";

test("streamSiteAnswer without bindings returns stub stream", async () => {
    const res = await streamSiteAnswer({}, "hello", "en");
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /hello/);
    assert.match(text, /Civic AI site index/);
});

test("rag keeps the Nemotron Ultra gateway path wired", () => {
    const source = readFileSync(
        new URL("../src/rag.ts", import.meta.url),
        "utf8"
    );
    const wrangler = readFileSync(
        new URL("../wrangler.toml", import.meta.url),
        "utf8"
    );
    assert.match(source, /resolveAudreyAiGateway/);
    assert.match(source, /DEFAULT_NEMOTRON_ULTRA_BASETEN_MODEL/);
    assert.match(source, /streamViaGatewayChatCompletions/);
    assert.match(source, /streamViaDirectBasetenChatCompletions/);
    assert.match(wrangler, /AUDREY_MODEL = "nemotron-ultra"/);
});

test("configured Nemotron streams even when Vectorize has no chunks", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; body: string }> = [];
    globalThis.fetch = (async (url, init) => {
        calls.push({ url: String(url), body: String(init?.body ?? "") });
        return new Response(
            'data: {"choices":[{"delta":{"content":"nemotron ok"}}]}\n\n',
            {
                status: 200,
                headers: { "Content-Type": "text/event-stream" },
            }
        );
    }) as typeof fetch;
    try {
        const res = await streamSiteAnswer(
            {
                AUDREY_MODEL: "nemotron-ultra",
                BASETEN_API_KEY: "test-baseten-key",
            },
            "hello",
            "en"
        );
        const text = await res.text();
        assert.equal(text, "nemotron ok");
        assert.equal(calls.length, 1);
        assert.match(calls[0].url, /baseten/);
        assert.match(calls[0].body, /NVIDIA-Nemotron-3-Ultra/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("retrieveSiteChunks keeps sibling chunks with distinct metadata ids", async () => {
    const ai = {
        run: async () => ({ data: [[0.1, 0.2, 0.3]] }),
    };
    const vectorize = {
        query: async () => ({
            matches: [
                {
                    score: 0.9,
                    metadata: {
                        id: "hash-1",
                        lang: "en",
                        url: "https://civic.ai/1/#x",
                        heading: "Shared",
                        pageTitle: "Page",
                        content: "first chunk needle",
                    },
                },
                {
                    score: 0.88,
                    metadata: {
                        id: "hash-2",
                        lang: "en",
                        url: "https://civic.ai/1/#x",
                        heading: "Shared",
                        pageTitle: "Page",
                        content: "second chunk needle",
                    },
                },
            ],
        }),
    };

    const chunks = await retrieveSiteChunks(ai, vectorize, "needle", "en", {
        minScore: 0,
    });

    assert.deepEqual(
        chunks.map((chunk) => chunk.id),
        ["hash-1", "hash-2"]
    );
});
