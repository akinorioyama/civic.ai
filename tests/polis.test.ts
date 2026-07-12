import { expect, test, vi } from "vite-plus/test";

// `_data/polis_care_deliberation.js`'s default export performs real network
// fetches against raw.githubusercontent.com. `src/lib/polis.ts` only awaits
// and forwards its result, so the loader is mocked here to keep this test
// deterministic and offline rather than exercising the real fetch.
vi.mock("../_data/polis_care_deliberation.js", () => ({
    default: async () => ({ ok: true, mocked: true }),
}));

import { getPolisCareDeliberation, polisCareUi } from "../src/lib/polis";

test("re-exports the Polis care UI copy for both languages", () => {
    expect(polisCareUi).toHaveProperty("en");
    expect(polisCareUi).toHaveProperty("tw");
});

test("awaits and forwards the Polis care deliberation loader's result", async () => {
    await expect(getPolisCareDeliberation()).resolves.toEqual({
        ok: true,
        mocked: true,
    });
});
