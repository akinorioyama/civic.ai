@AGENTS.md

## Testing

`vp test` is the entry for the root test suite (`tests/**/*.test.{ts,js}`, 100% statement/branch/function/line coverage gate; see `vite.config.ts`'s `test` block). Import from `vite-plus/test`, never `bun:test` or `vitest` directly:

```ts#index.test.ts
import { test, expect } from "vite-plus/test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

The `worker/` package is a separate Bun package with its own lockfile and keeps `bun test` (`vp run worker:test`).

## The Bun boundary

`vp` runs under Vite+'s own managed Node.js runtime (pinned via `package.json#devEngines.runtime`), not Bun — Bun stays pinned as the package manager (`devEngines.packageManager`) and as the runtime for the utility scripts (`pangu-format.mjs`, `scripts/*.mjs`) and `worker/` package noted above. Never wrap a `vp` lifecycle command in `bun --bun`/`bunx --bun`: it silently forces `vp test`'s Vitest coverage-v8 provider onto Bun, which does not implement the `node:inspector` API coverage collection needs, and the run fails outright.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
