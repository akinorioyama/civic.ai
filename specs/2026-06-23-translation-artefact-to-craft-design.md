# Design Spec: Terminology Update (工藝 -> 工藝)

This spec outlines the global terminology replacement of "工藝" (product/artefact) to "工藝" (craft/artefact) across the Traditional Chinese translation files in the repository.

## Context & Requirements

- **Goal**: Change all instances of the term "工藝" to "工藝" inside Traditional Chinese translation files.
- **Acronym Expansion**: Specifically, the acronym for **Kami** contains "Artefact 工藝", which should be updated to "Artefact 工藝".
- **Affected Files**:
    - `tw-1.md`
    - `tw-2.md`
    - `tw-6.md`
    - `tw-care-ai.md`
    - `tw-doom-debate.md`
    - `tw-gentle-bridge.md`
    - `tw-index.md`
    - `tw-inside-the-kami.md`
    - `tw-kami.md`
    - `tw-manifesto.md`
    - `tw-outrage-to-overlap.md`
    - `tw-podcast.md`
    - `tw-software-freedom-as-civic-care.md`
    - `_data/glossary.json`

## Non-Goals

- Do not modify generated files in `docs/`.
- Do not modify English files (e.g. `1.md`, `2.md`, etc.).

## Proposed Approach

A Python script will be used to perform the find-and-replace operation across all target files, ensuring that no occurrences are missed and avoiding manual editing errors.

## Verification

- Run a `git diff` to verify the modified lines.
- Build the project using `bun run build` to confirm everything still compiles and builds without error.
