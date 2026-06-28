# Civic AI — 6-Pack of Care

Source for **[civic.ai](https://civic.ai/)** — the bilingual (British English/Traditional Mandarin) static site for the **6-Pack of Care**, a Civic AI governance framework by [Audrey Tang](https://afp.oxford-aiethics.ox.ac.uk/people/ambassador-audrey-tang) and [Caroline Green](https://www.oxford-aiethics.ox.ac.uk/caroline-emmer-de-albuquerque-green) at the [Oxford Institute for Ethics in AI](https://www.oxford-aiethics.ox.ac.uk/).

<p align="center">
  <a href="https://civic.ai/comics/"><img src="img/overview-small.jpg" alt="The 6-Pack of Care, illustrated by Nicky Case" width="420"></a>
</p>

Civic AI is artificial intelligence that answers to the people it affects: many small, bounded local stewards — each a **Kami** — that a community can own, inspect, correct, and switch off, instead of one system built to govern everyone. The 6-Pack of Care is the governance framework — six plain-language tests for AI a community can actually trust.

- **The idea** → start with the [Manifesto](https://civic.ai/manifesto/); the six packs run [1](https://civic.ai/1/) · [2](https://civic.ai/2/) · [3](https://civic.ai/3/) · [4](https://civic.ai/4/) · [5](https://civic.ai/5/) · [6](https://civic.ai/6/), with [Measures](https://civic.ai/measures/) and the [FAQ](https://civic.ai/faq/). The full site — illustrations, audio, case studies — is **[civic.ai](https://civic.ai/)**.
- **Working in the codebase** → build, architecture, and conventions live in [AGENTS.md](AGENTS.md).
- **This README** → how the repository is laid out, and how to run and contribute to it.

## Quickstart

Requires [Bun](https://bun.sh/).

```bash
bun install     # install dependencies
bun run dev     # dev server with live reload → http://127.0.0.1:8080
bun run build   # production build → docs/
```

## Scripts

| Command                   | What it does                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `bun run dev`             | Eleventy dev server with live reload at `http://127.0.0.1:8080`.                                         |
| `bun run build`           | Production build of the static site → `docs/`.                                                           |
| `bun run lint`            | Check formatting: `prettier --check` + `pangu-format --check` (CJK spacing).                             |
| `bun run format`          | Auto-fix formatting: `prettier --write` + `pangu-format`.                                                |
| `bun run check-links`     | After a build, validate internal links and anchors across `docs/`.                                       |
| `bun run en`/`bun run tw` | Copy the canonical English/Mandarin page set to the clipboard for translation review (macOS `pbcopy`).   |
| `bun run import-comics`   | Re-import and optimise Nicky Case's comic pages into `img/` (maintenance helper, not part of the build). |

A husky **pre-commit hook** runs `prettier` + `pangu-format` on staged Markdown, and regenerates `package-lock.json` whenever `package.json` changes.

## Repository layout

| Path                                       | What it is                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `*.md` (root)                              | One Markdown file per page, British English. Front-matter `permalink` sets the URL.                                |
| `tw-*.md`                                  | Traditional Mandarin twin of each English page (served under `/tw/…`); kept in parity.                             |
| `_layouts/`                                | Page templates (`default`, `chapter`, `conference`) — see [AGENTS.md](AGENTS.md).                                  |
| `_includes/`                               | Shared template partials.                                                                                          |
| `_data/`                                   | Global data: `site.json`, `paths.json` (reading paths), `comics.json`, glossary, Polis report, OpenClaw bootstrap. |
| `img/`, `fonts/`, `audio/`                 | Static assets, passthrough-copied into the build.                                                                  |
| `styles.css`                               | All site styles (mobile-first; CSS custom properties).                                                             |
| `eleventy.config.js`                       | Eleventy build config: passthrough rules, Markdown tweaks, filters.                                                |
| `.well-known/openclaw/`, `openclaw.md.njk` | Machine-readable bootstrap for AI agents ("claws") — see [civic.ai/openclaw](https://civic.ai/openclaw/).          |
| `*.mjs`, `*.py`, `scripts/`                | Content and build helper scripts (see [Scripts](#scripts)).                                                        |
| `specs/`                                   | Internal design & implementation notes (unpublished; in `.eleventyignore`).                                        |
| `docs/`                                    | **Generated** build output — never edit by hand (gitignored).                                                      |

## Authoring content

- Each page is a single Markdown file with YAML front matter. `permalink` sets the URL — e.g. `1.md` → `/1/`, `manifesto.md` → `/manifesto/`.
- Every English page `foo.md` has a Traditional Mandarin twin `tw-foo.md` served at `/tw/foo/`. The two link to each other through the `alt_lang_url` front-matter key — **keep them in parity** when you change either.
- Front-matter keys in use: `layout`, `title`, `meta_description`, `summary`, `lang`, `permalink`, `alt_lang_url`.
- Formatting rules (em dashes, four-space YAML, locked Mandarin terminology) are enforced by `bun run lint` and the pre-commit hook; details in [AGENTS.md](AGENTS.md).

## Contributing

Pull requests are welcome. By contributing, you agree to release your work under the [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) public-domain dedication ([`LICENSE`](LICENSE)).

Keep English (`*.md`) and Traditional Mandarin (`tw-*.md`) variants in parity, and reuse the project's locked Mandarin terminology rather than coining new translations.

Part of the [Accelerator Fellowship Programme](https://afp.oxford-aiethics.ox.ac.uk/), [Oxford Institute for Ethics in AI](https://www.oxford-aiethics.ox.ac.uk/).
