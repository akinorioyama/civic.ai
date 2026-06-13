# Readability Initiative — Plan 1: Foundation (Phase 0 + 0.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the repo's onboarding docs and refactor the two ~90%-duplicated page layouts into shared `_includes/` partials — producing byte-identical site output except the one intended fix (chapter pages regain the copy-button script) — so later readability components can be added in one place.

**Architecture:** Eleventy v3 renders Markdown via Liquid into `docs/`. `_layouts/default.html` and `_layouts/chapter.html` are standalone full-page templates with heavy duplication. We extract the shared `<head>`, header chrome (logos + lang-toggle, site-nav), and body-end enhancement scripts into `_includes/` partials, parameterised for the few genuine per-layout differences. The header's variable middle (manifesto button vs date/author) stays per-layout.

**Tech Stack:** Eleventy v3, LiquidJS, Bun, `html-minifier` (collapses whitespace at build — so include-induced whitespace never shows in output).

---

## Verification model (read first — there is NO unit-test suite)

This repo has no automated test runner (per `AGENTS.md`). The TDD red/green rhythm maps onto **build + output-diff + grep**:

- **Red** = state the expected post-condition and confirm it does not hold yet.
- **Green** = make the change; confirm the post-condition holds.
- The refactor's safety net is a **byte-diff of the built `docs/` against a baseline snapshot**. Because `html-minifier` collapses whitespace, only _semantic_ HTML changes appear in the diff.

Shared commands used throughout:

```bash
bun run build                                   # regenerate docs/
diff -r /tmp/civic-docs-baseline docs           # compare against the Task 3 baseline
bun run check-links                             # link integrity
```

**Commits:** local only — the owner (Audrey) pushes. Use the repo's short imperative style (e.g. `refactor: extract shared page-head partial`). End every commit message with:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

`docs/` is git-ignored, so building never dirties the tree. `specs/`, `README.md`, `AGENTS.md` are in `.eleventyignore`, so editing them does not affect the build.

---

## File structure

- `_includes/page-head.html` — **new.** Entire `<head>` inner content shared by both layouts; parameterised by `og_type` and `preload_font` (assigned by the caller before the include).
- `_includes/site-logos.html` — **new.** The two logo links + the language toggle.
- `_includes/site-nav.html` — **new.** The `<nav class="site-nav">` block.
- `_includes/scripts.html` — **new.** The body-end enhancement scripts (hash-jump + AVIF swap + copy-buttons).
- `_layouts/default.html` — **modify.** Replace the duplicated blocks with includes.
- `_layouts/chapter.html` — **modify.** Replace the duplicated blocks with includes (gains the copy-button script).
- `AGENTS.md` — **modify.** Dev-server port fix.
- `README.md` — **modify.** Repository map + tightened contributing notes.

---

## Task 1: Fix dev-server port in AGENTS.md

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: Confirm the wrong value is present (red)**

Run: `grep -n '4000' AGENTS.md`
Expected: one hit — `bun run dev … http://127.0.0.1:4000`. (`eleventy --serve` actually defaults to `:8080`, which `README.md` already states.)

- [ ] **Step 2: Fix it**

Edit `AGENTS.md`, change:

```
bun run dev          # local dev server with live reload at http://127.0.0.1:4000
```

to:

```
bun run dev          # local dev server with live reload at http://127.0.0.1:8080
```

- [ ] **Step 3: Verify (green)**

Run: `grep -n '4000' AGENTS.md` → Expected: no hits.
Run: `grep -n '8080' AGENTS.md` → Expected: one hit.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs: correct dev-server port to 8080 in AGENTS.md"
```

---

## Task 2: Add a repository map to README.md

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Confirm there is no repo map yet (red)**

Run: `grep -n 'Repository map' README.md`
Expected: no hits.

- [ ] **Step 2: Insert the repository map**

In `README.md`, immediately **before** the `## Contributing` line, insert this section verbatim:

```markdown
## Repository map

| Path                         | What it is                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `*.md` (top level)           | Page content, British English. One file per page.                                                |
| `tw-*.md`                    | Traditional Mandarin counterpart of each English page (keep in parity).                          |
| `_layouts/`                  | Page templates: `default.html` (home-style) and `chapter.html` (book pages, with prev/next nav). |
| `_includes/`                 | Shared template partials pulled into the layouts.                                                |
| `_data/`                     | Global data (site config, comics, OpenClaw bootstrap, Polis report).                             |
| `img/`, `fonts/`, `audio/`   | Static assets, passthrough-copied to the build.                                                  |
| `styles.css`                 | All site styles (mobile-first; uses CSS custom properties).                                      |
| `eleventy.config.js`         | Build config: passthrough rules, Markdown tweaks, filters.                                       |
| `.github/doc_sync_config.py` | Single source of truth for Google-Doc sync scope.                                                |
| `specs/`                     | Internal design & implementation docs (not published; see `.eleventyignore`).                    |
| `docs/`                      | **Generated** build output — never edit by hand.                                                 |
```

- [ ] **Step 3: Tighten the contributing note**

In `README.md`, replace the line:

```markdown
When editing content, maintain parity between English (`*.md`) and Traditional Mandarin (`tw-*.md`) variants.
```

with:

```markdown
When editing content, maintain parity between English (`*.md`) and Traditional Mandarin (`tw-*.md`) variants. English files use a spaced single em dash (`—`); `tw-*` files use a double em dash (`——`, no spaces). Reuse the project's locked Traditional Mandarin terminology rather than coining new translations.
```

- [ ] **Step 4: Verify (green)**

Run: `grep -n 'Repository map' README.md` → Expected: one hit.
Run: `bun run build` → Expected: completes with no error (README is in `.eleventyignore`, so it is not built; this just confirms nothing broke).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add repository map and parity/glossary notes to README"
```

---

## Task 3: Snapshot the build baseline (refactor safety net)

**Files:** none (creates a temp snapshot outside the repo)

- [ ] **Step 1: Build the current site**

Run: `bun run build`
Expected: `[11ty] … Wrote NN files …` with no error.

- [ ] **Step 2: Snapshot `docs/` to a baseline**

```bash
rm -rf /tmp/civic-docs-baseline && cp -R docs /tmp/civic-docs-baseline
```

- [ ] **Step 3: Confirm the baseline is clean**

Run: `diff -r /tmp/civic-docs-baseline docs`
Expected: no output (identical — sanity check that the diff harness works).

> No commit — this is a working snapshot, not a repo change.

---

## Task 4: Extract `_includes/page-head.html`

**Files:**

- Create: `_includes/page-head.html`
- Modify: `_layouts/default.html` (lines 5–127, the `<head>` inner content)
- Modify: `_layouts/chapter.html` (lines 5–93, the `<head>` inner content)

- [ ] **Step 1: Create the shared head partial**

Copy the current `<head>` **inner** content of `_layouts/default.html` (everything between `<head>` on line 4 and `</head>` on line 128 — it is the superset, as it includes the `{% if openclaw_discovery %}` block) verbatim into a new file `_includes/page-head.html`, then make exactly these two edits to the copy:

1. **Delete** the literal `{% assign og_type = 'website' %}` (the caller will assign it).
2. **Replace** the font-preload href value so the line reads:

```html
<link
    rel="preload"
    as="font"
    type="font/woff2"
    href="{{ preload_font | relative_url }}"
    crossorigin
/>
```

(The `{% if openclaw_discovery %}` block stays; it is gated, so pages that do not set the flag render nothing extra.)

- [ ] **Step 2: Point default.html at the partial**

In `_layouts/default.html`, replace the entire `<head>…</head>` (lines 4–128) with:

```html
<head>
    {% assign og_type = 'website' %} {% assign preload_font =
    '/fonts/outfit-latin.woff2' %} {% include "page-head.html" %}
</head>
```

- [ ] **Step 3: Point chapter.html at the partial**

In `_layouts/chapter.html`, replace the entire `<head>…</head>` (lines 4–94) with:

```html
<head>
    {% assign og_type = 'article' %} {% assign preload_font =
    '/fonts/cormorant-normal-latin.woff2' %} {% include "page-head.html" %}
</head>
```

- [ ] **Step 4: Build and diff (green = identical)**

```bash
bun run build
diff -r /tmp/civic-docs-baseline docs
```

Expected: **no output.** The shared head must produce byte-identical output for every page. If anything differs, fix the partial (most likely the og_type assign placement or the preload href) and re-run until the diff is empty.

- [ ] **Step 5: Refresh the baseline and commit**

```bash
rm -rf /tmp/civic-docs-baseline && cp -R docs /tmp/civic-docs-baseline
git add _includes/page-head.html _layouts/default.html _layouts/chapter.html
git commit -m "refactor: extract shared page-head partial"
```

---

## Task 5: Extract `_includes/site-nav.html`

**Files:**

- Create: `_includes/site-nav.html`
- Modify: `_layouts/default.html` (the `<nav class="site-nav">…</nav>` block)
- Modify: `_layouts/chapter.html` (the `<nav class="site-nav">…</nav>` block)

- [ ] **Step 1: Create the nav partial**

Create `_includes/site-nav.html` with exactly:

```html
<nav
    class="site-nav"
    aria-label="{% if lang2 == 'en' %}Site sections{% else %}網站導覽{% endif %}"
>
    {% if lang2 == 'en' %}
    <a href="{{ '/' | relative_url }}">Home</a>
    <a href="{{ '/manifesto/' | relative_url }}">Manifesto</a>
    <a href="{{ '/#the-6-pack' | relative_url }}">The 6-Pack</a>
    <a href="{{ '/faq/' | relative_url }}">FAQ</a>
    <a href="{{ '/conference/' | relative_url }}">Conference</a>
    {% else %}
    <a href="{{ '/tw/' | relative_url }}">首頁</a>
    <a href="{{ '/tw/manifesto/' | relative_url }}">計畫宣言</a>
    <a href="{{ '/tw/#the-6-pack' | relative_url }}">關懷六力</a>
    <a href="{{ '/tw/faq/' | relative_url }}">常見問題</a>
    <a href="{{ '/tw/conference/' | relative_url }}">研討會</a>
    {% endif %}
</nav>
```

- [ ] **Step 2: Replace the nav in both layouts**

In `_layouts/default.html` and `_layouts/chapter.html`, replace the whole `<nav class="site-nav" …>…</nav>` block (still inside `<header>`) with:

```html
{% include "site-nav.html" %}
```

- [ ] **Step 3: Build and diff (green = identical)**

```bash
bun run build
diff -r /tmp/civic-docs-baseline docs
```

Expected: **no output.**

- [ ] **Step 4: Refresh baseline and commit**

```bash
rm -rf /tmp/civic-docs-baseline && cp -R docs /tmp/civic-docs-baseline
git add _includes/site-nav.html _layouts/default.html _layouts/chapter.html
git commit -m "refactor: extract shared site-nav partial"
```

---

## Task 6: Extract `_includes/site-logos.html`

**Files:**

- Create: `_includes/site-logos.html`
- Modify: `_layouts/default.html` (logos + lang-toggle block, top of `<header>`)
- Modify: `_layouts/chapter.html` (logos + lang-toggle block, top of `<header>`)

- [ ] **Step 1: Create the logos partial**

Create `_includes/site-logos.html` with exactly:

```html
{% if lang2 == 'en' %}
<a href="{{ '/' | relative_url }}" title="Home">
    <img
        class="oxford-logo"
        width="100"
        height="100"
        src="{{ '/img/oxford-logo.svg' | relative_url }}"
        alt="University of Oxford Logo"
    />
</a>
<a href="{{ '/' | relative_url }}" title="Civic AI Home">
    <img
        class="oxford-logo"
        width="246"
        height="100"
        src="{{ '/img/afp-logo.svg' | relative_url }}"
        alt="Accelerator Fellowship Programme Logo"
    />
</a>
{% else %}
<a href="{{ '/tw' | relative_url }}" title="首頁">
    <img
        class="oxford-logo"
        width="100"
        height="100"
        src="{{ '/img/oxford-logo.svg' | relative_url }}"
        alt="牛津大學校徽"
    />
</a>
<a href="{{ '/tw' | relative_url }}" title="關懷六力首頁">
    <img
        class="oxford-logo"
        width="246"
        height="100"
        src="{{ '/img/afp-logo.svg' | relative_url }}"
        alt="加速哲人徽章"
    />
</a>
{% endif %}
<div style="position: absolute; top: 20px; right: 20px">
    {% if lang2 == 'en' %}
    <a
        href="{{ alt_lang_url | default: '/tw/' | relative_url }}"
        class="lang-toggle"
        >華文</a
    >
    {% else %}
    <a
        href="{{ alt_lang_url | default: '/' | relative_url }}"
        class="lang-toggle"
        >English</a
    >
    {% endif %}
</div>
```

> Note: this uses `alt_lang_url | default: …` (from `default.html`). `chapter.html` currently omits the `default` filter, but every chapter page sets `alt_lang_url`, so the fallback never fires and output is identical — the Step 3 diff confirms this.

- [ ] **Step 2: Replace the logos block in both layouts**

In `_layouts/default.html`, replace lines from the first `{% if lang2 == 'en' %}` after `<header>` through the closing `</div>` of the `lang-toggle` wrapper (the block ending just before `<h1>`) with:

```html
{% include "site-logos.html" %}
```

Do the same in `_layouts/chapter.html` (same block: the logos `{% if lang2 %}…{% endif %}` plus the `lang-toggle` `<div>…</div>`, ending just before `<h1>`).

- [ ] **Step 3: Build and diff (green = identical)**

```bash
bun run build
diff -r /tmp/civic-docs-baseline docs
```

Expected: **no output.** (If a diff appears on lang-toggle hrefs, a page is missing `alt_lang_url` — restore parity in that page's front matter rather than changing the partial.)

- [ ] **Step 4: Refresh baseline and commit**

```bash
rm -rf /tmp/civic-docs-baseline && cp -R docs /tmp/civic-docs-baseline
git add _includes/site-logos.html _layouts/default.html _layouts/chapter.html
git commit -m "refactor: extract shared site-logos partial"
```

---

## Task 7: Extract `_includes/scripts.html` (chapters regain copy-buttons)

**Files:**

- Create: `_includes/scripts.html`
- Modify: `_layouts/default.html` (the two trailing `<script>` blocks before `</body>`)
- Modify: `_layouts/chapter.html` (the one trailing `<script>` block before `</body>`)

- [ ] **Step 1: Confirm chapters currently lack copy-buttons (red)**

```bash
grep -c "copy-btn" docs/faq/index.html docs/index.html
```

Expected: `docs/faq/index.html:0` (a chapter-layout page — no copy-button script) and `docs/index.html:1` (a default-layout page — has it). This drift is what we fix.

- [ ] **Step 2: Create the scripts partial**

Into a new file `_includes/scripts.html`, copy **verbatim** the two trailing `<script>` blocks currently at the end of `_layouts/default.html`'s `<body>` — i.e. both of these, in order:

1. the `jumpToHash()` + AVIF-swap script (begins `// userMoved guard is registered in <head>…`, currently default.html lines 312–348), and
2. the copy-button script (begins `// Turn each code block into a terminal copy-box…`, currently default.html lines 349–390).

The file is exactly those two `<script>…</script>` blocks, nothing else.

- [ ] **Step 3: Replace the trailing scripts in default.html**

In `_layouts/default.html`, delete both trailing `<script>` blocks (lines 312–390, between the JSON-LD `</script>` and `</body>`) and replace with:

```html
{% include "scripts.html" %}
```

- [ ] **Step 4: Replace the trailing script in chapter.html**

In `_layouts/chapter.html`, delete the single trailing `<script>` block (the `jumpToHash`/AVIF script, lines 336–372, between the JSON-LD `</script>` and `</body>`) and replace with:

```html
{% include "scripts.html" %}
```

- [ ] **Step 5: Build and diff (green = only chapters gain copy-buttons)**

```bash
bun run build
diff -r /tmp/civic-docs-baseline docs
```

Expected: diffs appear **only** on chapter-layout pages (manifesto, faq, 1–6, inside-the-kami, measures, care-ai, plus their `tw/` and other chapter pages), each gaining the copy-button `<script>`. No `default`-layout page (e.g. `docs/index.html`, `docs/kami/index.html`) should differ. Spot-check:

```bash
grep -c "copy-btn" docs/faq/index.html docs/index.html
```

Expected now: both `1`.

- [ ] **Step 6: Verify links and commit**

```bash
bun run check-links
```

Expected: passes (no broken links).

```bash
git add _includes/scripts.html _layouts/default.html _layouts/chapter.html
git commit -m "refactor: share enhancement scripts; add copy-buttons to chapter pages"
```

---

## Task 8: Council review of the foundation

**Files:** none (review only; fixes, if any, get their own commit)

- [ ] **Step 1: Assemble the review artifact**

```bash
bun run build
diff -r /tmp/civic-docs-baseline docs > /tmp/civic-refactor-final.diff || true
git log --oneline -8
```

The artifacts are: this plan, the four new `_includes/` partials, the two slimmed layouts, and `/tmp/civic-refactor-final.diff` (should show only the intended copy-button additions vs the original baseline — note the baseline was refreshed per task, so regenerate a full diff against a pristine `git stash`-free build if a full delta is wanted).

- [ ] **Step 2: Run the council (per spec §10)**

Dispatch the adversarial reviewers on the refactor:

- **Codex** — correctness: output-diff is empty except copy-button additions; EN/TW parity intact; no broken includes; lint-staged (`prettier` + `pangu-format`) survived on every committed file.
- **Grok** — contrarian: is the partial split coherent, or did it create needless indirection?
- **ag** — structural: are the partials well-bounded (one responsibility each)?
- **kami** — voice/care: n/a for chrome, but confirm no user-facing copy changed.

- [ ] **Step 3: Apply fixes (if any) and commit**

If the council finds issues, fix them, re-run `bun run build` + `diff -r`, and commit with a descriptive message. Iterate until Codex returns a clean approve.

- [ ] **Step 4: Done**

Foundation complete. Hand off to **Plan 2 (Phase 1 components)**, which will be written against the now-existing partials.

---

## Self-Review (author checklist — completed)

**1. Spec coverage (against §7 Phase 0 + 0.5):**

- Phase 0 port fix → Task 1. ✔
- Phase 0 README map/contributing → Task 2. ✔
- Phase 0.5 `page-head.html` → Task 4. ✔
- Phase 0.5 `site-header.html` (split into `site-logos.html` + `site-nav.html` for lower risk; the variable h1/middle stays per-layout by design) → Tasks 5–6. ✔
- Phase 0.5 `scripts.html` + copy-button drift fix → Task 7. ✔
- Phase 0.5 output-diff verification gate → Tasks 3–7. ✔
- Council review (spec §10) → Task 8. ✔
- Out of scope here (Phase 1 components, Phase 2) → deferred to Plan 2 by the scope split. ✔

**2. Placeholder scan:** No TBD/TODO; every file change shows exact content or an exact verbatim-move + surgical edit, validated by the build+diff gate. ✔

**3. Type/name consistency:** Partial filenames (`page-head.html`, `site-logos.html`, `site-nav.html`, `scripts.html`) and the caller variables (`og_type`, `preload_font`) are used identically across Tasks 4–7. ✔

**Note on `site-header.html`:** the spec named one header partial; this plan splits it into `site-logos.html` + `site-nav.html` and leaves the genuinely-divergent h1/manifesto-button/date-author middle in each layout. This lowers refactor risk (no conditional-heavy mega-partial) while still removing the bulk of duplication. Flagged for the Task 8 council review.
