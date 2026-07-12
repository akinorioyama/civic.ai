import { describe, expect, test } from "vite-plus/test";

import {
    chunkRecords,
    CONTENT_MAX,
} from "../scripts/lib/vectorize-records.mjs";

describe("Vectorize site records", () => {
    test("emits Civic AI metadata and absolute URLs for both languages", () => {
        const records = chunkRecords({
            en: [
                {
                    title: "Pack 1",
                    url: "/1/",
                    subsections: [
                        {
                            heading: "Relationships first",
                            anchor: "relationships-first",
                            content: "Care starts with existing relationships.",
                        },
                    ],
                },
            ],
            zh: [
                {
                    title: "第一包",
                    url: "/tw/1/",
                    subsections: [
                        {
                            heading: "關係優先",
                            anchor: "relationships-first",
                            content: "照護從既有關係開始。",
                        },
                    ],
                },
            ],
        });

        expect(records).toHaveLength(2);
        expect(records[0]).toMatchObject({
            lang: "en",
            url: "https://civic.ai/1/#relationships-first",
            heading: "Relationships first",
            pageTitle: "Pack 1",
            content: "Care starts with existing relationships.",
            embedText:
                "Relationships first\nCare starts with existing relationships.",
        });
        expect(records[1]).toMatchObject({
            lang: "zh",
            url: "https://civic.ai/tw/1/#relationships-first",
            heading: "關係優先",
            pageTitle: "第一包",
        });
        expect(
            records.every((record) => /^[a-f0-9]{64}$/.test(record.id))
        ).toBe(true);
    });

    test("splits long subsection content without exceeding Vectorize metadata size", () => {
        const longParagraph = "x".repeat(CONTENT_MAX + 200);
        const records = chunkRecords({
            en: [
                {
                    title: "Long page",
                    url: "/long/",
                    subsections: [
                        {
                            heading: null,
                            anchor: null,
                            content: longParagraph,
                        },
                    ],
                },
            ],
        });

        expect(records.length).toBeGreaterThan(1);
        expect(
            records.every((record) => record.content.length <= CONTENT_MAX)
        ).toBe(true);
        expect(new Set(records.map((record) => record.id)).size).toBe(
            records.length
        );
        expect(
            records.every(
                (record) =>
                    record.replacesId &&
                    /^[a-f0-9]{64}$/.test(record.replacesId)
            )
        ).toBe(true);
        expect(
            records.every((record) => record.url === "https://civic.ai/long/")
        ).toBe(true);
    });

    test("accumulates multiple short paragraphs and flushes on overflow", () => {
        const p1 = "A".repeat(100);
        const p2 = "B".repeat(100);
        const p3 = "C".repeat(1700);
        const content = `${p1}\n\n${p2}\n\n${p3}`;
        const records = chunkRecords({
            en: [
                {
                    title: "Accumulation page",
                    url: "/accum/",
                    subsections: [
                        {
                            heading: "Accumulated",
                            anchor: "accumulated",
                            content,
                        },
                    ],
                },
            ],
        });

        expect(records.length).toBeGreaterThan(1);
        expect(records[0].content).toBe(`${p1}\n\n${p2}`);
        expect(records[1].content).toBe(p3);
        expect(
            records.every((record) => record.content.length <= CONTENT_MAX)
        ).toBe(true);
    });

    test("flushes pending short content before chunking an oversized paragraph", () => {
        const short = "Short lead-in paragraph.";
        const long = "D".repeat(CONTENT_MAX + 200);
        const content = `${short}\n\n${long}`;
        const records = chunkRecords({
            en: [
                {
                    title: "Mixed page",
                    url: "/mixed/",
                    subsections: [
                        {
                            heading: "Mixed",
                            anchor: "mixed",
                            content,
                        },
                    ],
                },
            ],
        });

        expect(records.length).toBeGreaterThan(2);
        expect(records[0].content).toBe(short);
        expect(
            records.every((record) => record.content.length <= CONTENT_MAX)
        ).toBe(true);
    });

    test("handles absolute page URLs, missing subsections, and empty subsection content", () => {
        const records = chunkRecords({
            en: [
                {
                    title: "External mirror",
                    url: "https://example.com/path#frag",
                    subsections: [
                        {
                            heading: "Mirror heading",
                            anchor: "mirror",
                            content: "Mirror content body.",
                        },
                    ],
                },
                {
                    title: "No subsections page",
                    url: "/no-subs/",
                },
                {
                    title: "Empty subsection page",
                    url: "/empty/",
                    subsections: [
                        {
                            heading: "Empty",
                            anchor: "empty",
                        },
                    ],
                },
            ],
        });

        expect(records).toHaveLength(1);
        expect(records[0]).toMatchObject({
            url: "https://example.com/path#mirror",
            heading: "Mirror heading",
            pageTitle: "External mirror",
        });
    });
});
