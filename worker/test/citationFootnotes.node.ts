import assert from "node:assert/strict";
import test from "node:test";
import { citationFootnotes } from "../src/citationFootnotes";

async function streamToString(stream: ReadableStream<string>): Promise<string> {
    const reader = stream.getReader();
    let out = "";
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        out += value;
    }
    return out;
}

test("citationFootnotes rewrites [n] to caret", async () => {
    const input = new ReadableStream<string>({
        start(c) {
            c.enqueue("Answer [1] and [2].");
            c.close();
        },
    });
    const footnotes = [
        "[Relationships first](https://civic.ai/1/)",
        "[Accountability](https://civic.ai/2/)",
    ];
    const out = await streamToString(
        input.pipeThrough(citationFootnotes(footnotes))
    );
    assert.match(out, /\[\^1\]/);
    assert.match(out, /\[\^2\]: \[Accountability\]/);
});

test("citationFootnotes appends all source defs", async () => {
    const input = new ReadableStream<string>({
        start(c) {
            c.enqueue("No numeric cite.");
            c.close();
        },
    });
    const footnotes = ["[A](https://civic.ai/a)"];
    const out = await streamToString(
        input.pipeThrough(citationFootnotes(footnotes))
    );
    assert.match(out, /\[\^1\]: \[A\]\(https:\/\/civic\.ai\/a\)/);
});
