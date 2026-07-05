import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const source = readFileSync("assets/js/civic-ask.js", "utf8");

describe("civic-ask.js static contract", () => {
    test("defines sanitizer and CivicAsk global", () => {
        expect(source).toMatch(/function isSafeHttpUrl/);
        expect(source).toMatch(/function sanitizeHtml/);
        expect(source).toMatch(/function hideAsk/);
        expect(source).toMatch(/window\.CivicAsk/);
    });

    test("uses civic production hosts and explicit local override", () => {
        expect(source).toContain("civic-ai-ask.audreyt.workers.dev");
        expect(source).toContain("civic.ai");
        expect(source).toContain("www.civic.ai");
        expect(source).toContain("explicitAskBaseOverride");
        expect(source).toContain("ask_base");
    });

    test("allows known local preview origins to probe capacity", () => {
        expect(source).toContain("4321");
        expect(source).toContain("8080");
        expect(source).toMatch(/var localDev = isLocalDevAskHost\(\)/);
        expect(source).toMatch(/localDev \|\|/);
        expect(source).toMatch(/askAvailable\s*=\s*false/);
    });

    test("matches Worker scalar-count limit for supplementary characters", () => {
        expect(source).toContain("Array.from(q).length > 100");
        expect(source).not.toContain("q.length > 100");
    });

    test("preserves IME Enter guard for CJK composition", () => {
        expect(source).toContain("keyCode === 229");
    });
});
