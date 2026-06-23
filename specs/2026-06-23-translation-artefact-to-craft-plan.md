# Translation Update (工藝 -> 工藝) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all occurrences of "工藝" with "工藝" in Traditional Chinese source and metadata files, then rebuild the site.

**Architecture:** A Python search-and-replace script will run across all markdown/JSON files (excluding `docs/`, `.git/`, and `node_modules/`), followed by a standard Eleventy site build to regenerate the `docs/` output.

**Tech Stack:** Python, Bun, Eleventy

## Global Constraints

- Never edit the `docs/` output directory — it is generated
- Commits: short imperative style (e.g. `ch7: fix anchor ids`)

---

### Task 1: Perform Global Replacement and Run Build

**Files:**

- Modify:
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

**Interfaces:**

- Consumes: Existing files containing the string "工藝".
- Produces: Files updated with the string "工藝".

- [ ] **Step 1: Write and run Python find-and-replace script**

Execute the following Python snippet via the `eval` tool to perform the replacements:

```python
import os

target = "工藝"
replacement = "工藝"
skip_dirs = {"node_modules", "docs", ".git"}
skip_exts = {".png", ".jpg", ".jpeg", ".gif", ".avif", ".webp", ".mp3", ".pdf", ".zip", ".tar", ".gz", ".db", ".sqlite", ".sqlite3"}

modified_files = []

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in skip_exts:
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            if target in content:
                new_content = content.replace(target, replacement)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                modified_files.append(filepath)
        except Exception as e:
            print(f"Error on {filepath}: {e}")

print("Modified files:", modified_files)
```

- [ ] **Step 2: Run verification search**

Execute the search script in Python again to ensure no occurrences of "工藝" remain in source content:

```python
# (Check if target is in any of the files, print any remaining lines)
```

- [ ] **Step 3: Build the project and check for errors**

Run: `bun run build`
Expected output: Eleventy successfully builds pages to `./docs/` without errors.

- [ ] **Step 4: Verify the built outputs contain the updated terminology**

Check git diff on the generated files inside `docs/` to confirm that the changes propagated correctly from source to generated output:
Run: `git diff docs/`
Expected output: In diff of generated html files under `docs/`, `工藝` is changed to `工藝`.

- [ ] **Step 5: Commit changes**

Run:

```bash
git add .
git commit -m "translate: update 工藝 to 工藝 in source files and rebuild"
```
