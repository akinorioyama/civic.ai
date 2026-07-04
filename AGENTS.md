## Build & Development

**Package manager:** Bun
**Static site generator:** Astro 7

```bash
bun install          # install dependencies
bun run dev          # local Astro dev server at http://127.0.0.1:4321
bun run check        # astro check + tsgo --noEmit
bun test             # focused Bun tests
bun run build        # production build → ./dist/
bun run check-links  # validate built internal links in ./dist/
```

Verify significant changes with the relevant focused test plus `bun run build`; before completion run the full validation chain in README/CI.

## Architecture

**Build pipeline:** root Markdown/HTML sources + `_data/*` → custom `markdown-it` renderer and Astro layouts/components/routes → static HTML in `dist/`.

**Content files** remain top-level Markdown with YAML front matter. Do not move canonical content into `src/content/`; `scripts/review-set.mjs`, `scripts/check-tw-typography.mjs`, and lint-staged rely on root `*.md`/`tw-*.md` files.

**Astro source** lives in `src/`:

- `src/lib/legacyMarkdown.ts` — markdown-it, footnotes, anchors, and the CJK emphasis patch formerly in Eleventy
- `src/lib/pages.ts` — typed root-content loader and URL derivation
- `src/lib/shortcodes.ts` — explicit replacements for former Liquid/Nunjucks include shortcodes
- `src/components/` — shared head, navigation, footer, client scripts, Polis report, colophon
- `src/layouts/` — `DefaultShell.astro`, `Default.astro`, `Chapter.astro`, `Conference.astro`
- `src/pages/` — Astro routes and machine endpoints (`robots.txt`, `llms.txt`, `sitemap.xml`, `.well-known/openclaw/SKILL.md`)

**Site data:** `_data/site.json` (title, description, URL, languages), plus `_data/paths.json`, `_data/comics.json`, `_data/glossary.json`, `_data/openclaw_bootstrap.js`, and Polis data/UI loaders.

**Static assets:** source assets live in `img/`, `fonts/`, `audio/`, `styles.css`, `CNAME`, `.nojekyll`, and favicons. `scripts/sync-public.mjs` regenerates `public/` before dev/build; Astro copies `public/` to `dist/`.

**Config:** `astro.config.mjs` — custom-domain root site, static output, directory URLs, `dist/` output.

**Deployment:** GitHub Actions (`.github/workflows/static.yml`) auto-deploys `dist/` to GitHub Pages on push to main.

## Conventions

- Front matter: YAML, four-space indent, `snake_case` keys, double-quoted strings with spaces
- CSS: all styles in `styles.css`, mobile-first, use existing custom properties
- Commits: short imperative style (e.g. `add manifesto link`, `ch7: fix anchor ids`)
- Never edit `dist/` or generated `public/`; they are build artifacts
- Optimize images before committing; reuse existing typography tokens in CSS
- When adding/editing content, maintain parity between British English and Traditional Mandarin variants. `bun run en`/`bun run tw` cat the paired page sets to the clipboard and warn on stderr about any page missing its twin — see `scripts/review-set.md`.
- Em dashes: English files use `—` (spaced single); Mandarin `tw-*.md` files use `——` (double, no spaces)
