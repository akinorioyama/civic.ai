# Civic AI — Readability Initiative (Design Spec)

- **Date:** 2026-06-13
- **Status:** Approved (design); pending council review + final user sign-off
- **Owner:** Audrey Tang
- **Repo:** `civic.ai` (Eleventy v3 + Bun static site; EN `*.md`/zh-TW `tw-*.md` pairs)
- **Strategy chosen:** Shared readability layer, phased (Strategy ①), **on a
  refactored layout foundation** (extract the duplicated chrome of `default.html`
  / `chapter.html` into shared `_includes/` partials first — see §7 Phase 0.5).

## 1. Summary

Make every page of the Civic AI site followable by every audience of the book —
**without the site diverging from the book-of-record**. We build a small set of
reusable, additive, bilingual components once, then apply them to the core
book-lineage pages first and the essays/talks second. Body prose stays
book-faithful; plain-language lives in added layers ("light intros").

## 2. Goals & non-goals

**Goals**

1. A newcomer grasps any page's gist in ~30 seconds (summary card).
2. Any reader knows what to read next for their role (reading-paths) and can
   navigate a long page (on-this-page contents).
3. Jargon is decodable in place and in one reference page (glossary).
4. The GitHub repo is navigable for visitors and contributors (incl. a
   non-duplicated, maintainable layout layer).
5. Everything ships EN + zh-TW together; no-JS degrades gracefully.

**Non-goals (YAGNI)** — see §9.

## 3. Audiences & success criteria

Audiences: newcomer/general reader · policy & governance · builders & engineers ·
civic & community practitioners — atop the existing bilingual (EN/zh-TW) and
AI-agent (OpenClaw `claw`) audiences already served.

Success criteria (verifiable):

- Every Phase-1 page has a rendered "In short" summary + reading time, EN + TW.
- Long pages (≥6 `h2/h3`) show an on-this-page contents list; every heading has a
  stable, CJK-safe `id` (works with the existing hash-jump deep-link script).
- `/glossary/` and `/tw/glossary/` exist and render from one data source.
- The index carries an ordered reading-path per audience, EN + TW in sync.
- After the layout refactor, built output for unchanged pages is identical except
  the intended additions (e.g. chapters regain copy-buttons).
- `bun run build` is clean; `bun run check-links` passes; no parity gaps.

## 4. Constraints (hard)

- **Body prose is the book version-of-record** — never edit book sentences for
  plainness. Plain-language is additive only (§6).
- **EN/zh-TW parity** is mandatory for every change.
- **Em-dash conventions:** `—` (spaced single) in EN; `——` (double, no spaces) in
  `tw-*` files.
- **zh-TW locked glossary** must be reused verbatim (e.g. 仁工智慧, 地神/Kami,
  以程序對齊 = alignment-by-process, 資料 not 數據, 決策軌跡 = decision trace,
  反競爭性 = anti-rival, 智慧體 = AI agent).
- **Commit hook:** `lint-staged` runs `prettier` + `bun run pangu-format.mjs` on
  staged files; all new files must survive that pass.
- **Vanilla only:** match the existing inline-script style (copy-buttons,
  hash-jump, AVIF swap). No JS framework, no build-time SPA.
- **Never edit `docs/`** — it is the generated output.

## 5. The shared layer (build once)

All components are additive, bilingual, and no-JS-safe (JS pieces are progressive
enhancement). All new client-side scripts live in the shared
`_includes/scripts.html` introduced by the Phase 0.5 layout refactor (§7), so they
exist in one place for both layouts. Reuse existing CSS custom properties
(`--warm`, `--gold`, `--border`, `--muted`, etc.) and add dark-mode + print
variants to match the existing stylesheet.

### 5.1 "In short" summary card _(primary plain-language layer)_

- **Input:** optional front-matter `summary:` — a string, or a YAML list of ≤3
  short bullets. Plain-language, newcomer-facing.
- **Render:** inside `<main>`, **before** `{{ content }}`, via a new
  `_includes/in-short.html` — added at the top of `<main>` in **both** layouts
  (they are standalone templates; see §7 Phase 0.5). One identical include line
  each.
- **Contents:** label ("In short"/「重點摘要」 by `lang2`), the summary, and the
  reading-time (§5.4).
- **CSS:** `.in-short` card (warm bg, gold left-border, like `.callout`).
- **No-JS:** fully server-rendered.

### 5.2 On-this-page contents (auto TOC) + heading IDs

- **Heading IDs (build):** add `markdown-it-anchor` in `eleventy.config.js`
  `amendLibrary("md", …)` with a **CJK-safe slugify** (lowercase, trim, spaces→`-`,
  keep CJK + alphanumerics; let the plugin de-dupe collisions with `-1`…).
  Benefit beyond the TOC: stable section deep-links + better SEO; hardens the
  existing hash-jump script.
- **TOC (runtime JS, in the shared scripts partial):** builds
  `<nav class="page-toc">` from `main h2, main h3` when there are **≥6** such
  headings, unless front-matter `toc: false`. Sticky aside on desktop;
  `<details>` collapsed on mobile. Labels localised by `lang`.
- **No-JS:** no TOC, but headings + IDs still work (graceful).

### 5.3 Glossary + first-use glossing

- **Data:** `_data/glossary.json` — list of
  `{ term, aliases?: [...], en: "…", tw: "…", link?: "…" }`. Curated; reuses the
  locked glossary.
- **Reference page:** `glossary.md` → `/glossary/` and `tw-glossary.md` →
  `/tw/glossary/`, rendered by looping the data in Liquid. (Nav link optional —
  decide during build.)
- **First-use glossing (runtime JS, shared scripts partial):** decorate the
  **first occurrence** of each glossary term in `<main>` body with a
  dotted-underline tooltip. Source markdown is **untouched** (decoration is
  client-side, so the body-faithful rule holds). Matching is conservative: terms
  strictly from `glossary.json`; skip headings, links, code, and the summary card;
  EN uses word boundaries; CJK matches exact strings. Per-page opt-out
  `gloss: false`.
- **No-JS:** plain text (acceptable).
- **Risk:** this is the highest-risk piece (false hits / clutter). Default to a
  tight curated term list; the council stress-tests false-hit behaviour before
  Phase 2. If noisy, fall back to a `key_terms:` front-matter list surfaced in the
  In-short card instead of inline decoration.

### 5.4 Reading time

- **Build:** `eleventyConfig.addFilter("readingTime", (content, lang) => …)` —
  strip tags, then EN by words (~220 wpm), zh-TW by CJK characters (~360 cpm);
  round up to whole minutes. Called in `in-short.html` as
  `{{ content | readingTime: lang }}`.

### 5.5 Audience reading-paths

- **Data:** `_data/paths.json` — per audience
  `{ id, label_en, label_tw, blurb_en, blurb_tw, steps: [{ url, label_en, label_tw }] }`.
  Audiences: newcomer, policy & governance, builders & engineers, civic &
  community practice.
- **Render:** `_includes/reading-paths.html` on `index.md`/`tw-index.md`,
  extending (not breaking) the existing "Already know what you're after?" block.
  EN/TW stay in sync because both read the same data.

## 6. Plain-language policy ("light intros")

- Book body prose stays untouched.
- Plain-language lives in: (a) the `summary:` card — always; (b) **optional** short
  intro / section lead-in paragraphs **only** where a page opens too abruptly for a
  newcomer — used sparingly, clearly the site's on-ramp, never a rewrite of book
  sentences.
- Voice guardrails: preserve Audrey's voice + locked terms; no dumbing-down; keep
  the care-ethic register. `kami` audits voice; `Grok` checks newcomer payoff.

## 7. Phasing

Each phase: **build → adversarial council review → fix → ship (EN + TW)**.

- **Phase 0 — repo quick wins** (parallel, trivial, low risk)
    - Fix dev-server port: `AGENTS.md` says `:4000`; `eleventy --serve` defaults to
      `:8080` (README is correct). Correct `AGENTS.md`.
    - Add a content map + clearer "start here" to `README.md`; tidy contributing
      notes (parity rule, glossary rule).

- **Phase 0.5 — layout refactor (foundation)**
    - `default.html` and `chapter.html` are standalone, ~90%-duplicated templates
      that have drifted (the copy-button script exists only in `default.html`, so
      `chapter.html` pages — manifesto, FAQ, Packs 1–6, inside-the-kami, measures,
      care-ai — currently have **no** copy-buttons).
    - Extract the shared chrome into `_includes/` partials used by both layouts:
        - `page-head.html` — the `<head>` block, parameterised for the two
          differences (`og_type` = website/article; preload font = Outfit vs Cormorant).
        - `site-header.html` — the header (logos, lang-toggle, `site-nav`); already
          identical between the two.
        - `scripts.html` — the body-end enhancement scripts (hash-jump, AVIF swap,
          copy-buttons) **plus** the new TOC + glossing scripts; included by both.
    - Net effect: chapters regain copy-buttons; all future chrome/script changes are
      single-edit; new readability scripts have one home.
    - **Verification:** build before/after and diff `docs/` — output must be
      identical for every page except the intended copy-button addition on chapter
      pages. This phase ships before Phase 1 components land.

- **Phase 1 — core book pages** (13 pairs; build the shared layer + apply all
  components; this is the **template** the council audits)
    - `index`, `manifesto`, `faq`, `1`–`6`, `kami`, `inside-the-kami`, `measures`,
      `care-ai` (+ each `tw-` pair). Layouts used: `index` + `kami` = `default`;
      the rest = `chapter`.

- **Phase 2 — essays/talks** (summary + reading-time + glossary; TOC where long)
    - `ai-alignment-cannot-be-top-down`, `ciudadania-digital`,
      `software-freedom-as-civic-care`, `outrage-to-overlap`,
      `democracy-needs-civic-ai`, `virtuous-ai`, `safer-sovereignty`,
      `plurality-being`, `gentle-bridge`, `compassion-and-ai`,
      `self-actualisation-and-care`, `humanism-after-optimization`, `ai-with-us`,
      `ai-crisis-diplomacy`, `plurality-ucsc`, plus the podcast/dialogue/debate
      pages (+ `tw-` pairs).
    - Bespoke pages (`polis-report`, `comics`, `conference`) get at most a cheap
      summary; no rework of their custom layouts.

## 8. Files touched (anticipated)

- **New:** `_includes/page-head.html`, `_includes/site-header.html`,
  `_includes/scripts.html` (Phase 0.5); `_includes/in-short.html`,
  `_includes/reading-paths.html`, `_data/glossary.json`, `_data/paths.json`,
  `glossary.md`, `tw-glossary.md` (Phases 1).
- **Edit:** `_layouts/default.html` + `_layouts/chapter.html` (use the new
  partials; add the in-short include), `eleventy.config.js` (anchor plugin +
  slugify + `readingTime` filter), `package.json` (add `markdown-it-anchor`),
  `styles.css` (`.in-short`, `.page-toc`, `.gloss`/tooltip, `.reading-paths`,
  `.reading-time` + dark/print/responsive), per-page front-matter (`summary:`,
  occasional `toc:`/`gloss:`), `README.md`, `AGENTS.md`.

## 9. Out of scope (YAGNI)

No book-body rewrite; no reader's-edition fork; no content-filtering
audience-picker; no "explain simply" toggles; no progress bars; no
hover-cards-everywhere (Strategy ③ extras); no JS framework; no rework of the
bespoke polis/comics/conference page layouts.

## 10. Council review plan

Artifacts = this spec + the Phase-1 template page (the first fully-built page) +
the Phase-0.5 before/after `docs/` diff.

- **Codex** — adversarial/correctness: build, EN/TW parity, dead/duplicate
  anchors, glossing false-hits, hook survival, refactor output-diff.
- **Grok** — contrarian: is this over-built? does it actually help a newcomer?
- **ag** — structural: IA, reading-path coherence, heading hierarchy.
- **kami** — care-ethic + voice: do summaries/intros preserve register?

Iterate until Codex returns a clean approve (prep-review style).

## 11. Verification

- `bun run build` clean; `bun run check-links` passes.
- Phase 0.5: before/after `docs/` diff is empty except intended changes.
- `bun run dev` (`http://127.0.0.1:8080`) spot-checks on a long page (faq),
  a pack, the index, and one TW pair.
- EN/TW parity check on every changed pair.
- No-JS pass: summary, headings/IDs, glossary page still work; TOC/tooltips absent
  but nothing breaks.
- Dark-mode + print rendering of new components.

## 12. Risks & open questions

- **Layout refactor blast radius** — touches every page's render; mitigated by the
  before/after `docs/` byte-diff gate and council review.
- **Glossing false-hits** (EN partial-word, CJK substring) — biggest content risk;
  mitigated by curated list + conservative matching + council review + the
  `key_terms:` fallback.
- **CJK slugify** duplicate-heading collisions — rely on the anchor plugin's
  de-dupe suffixing; verify on TW pages.
- **TOC is JS-only** — accepted graceful degradation.
- **Reading-paths** must not regress the current index block or break parity.
- **/glossary/nav placement** — add to header nav or leave discoverable? Decide
  during Phase 1.
- **Reading-time accuracy** for mixed EN/CJK pages — approximate; acceptable.
