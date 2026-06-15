## Build & Development

**Package manager:** Bun
**Static site generator:** Eleventy (11ty) v3

```bash
bun install          # install dependencies
bun run dev          # local dev server with live reload at http://127.0.0.1:8080
bun run build        # production build → ./docs/
```

There is no automated test suite. Verify changes by building successfully and checking the dev server.

## Architecture

**Build pipeline:** Markdown → Liquid templates → 11ty → static HTML in `docs/`

**Content files** are top-level Markdown with YAML front matter.

**Layouts** in `_layouts/`:

- `default.html` — main template (header with logos, language toggle, footer)
- `chapter.html` — extends default, adds prev/next chapter navigation

**Site data:** `_data/site.json` (title, description, URL, languages)

**Static assets** (passthrough-copied by 11ty): `img/`, `fonts/`, `audio/`, `styles.css`

**Config:** `eleventy.config.js` — passthrough copy rules, `relative_url` filter (Jekyll compat), date filter, output to `docs/`

**Deployment:** GitHub Actions (`.github/workflows/static.yml`) auto-deploys to GitHub Pages on push to main.

## Conventions

- Front matter: YAML, four-space indent, `snake_case` keys, double-quoted strings with spaces
- CSS: all styles in `styles.css`, mobile-first, use existing custom properties
- Commits: short imperative style (e.g. `add manifesto link`, `ch7: fix anchor ids`)
- Never edit the `docs/` output directory — it is generated
- Optimize images before committing; reuse existing typography tokens in CSS
- When adding/editing content, maintain parity between British English and Traditional Mandarin variants
- Em dashes: English files use `—` (spaced single); Mandarin `tw-*.md` files use `——` (double, no spaces)
