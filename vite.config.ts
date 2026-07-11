import { defineConfig } from "vite-plus";

export default defineConfig({
    lint: {
        jsPlugins: [
            { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
        ],
        rules: { "vite-plus/prefer-vite-plus-imports": "error" },
        options: { typeAware: true, typeCheck: true },
    },
    staged: {
        "**/*": "vp fmt",
        "**/*.md": [
            "bun run pangu-format.mjs",
            "bun scripts/check-tw-typography.mjs",
        ],
        "_data/glossary.json": "bun scripts/check-tw-typography.mjs",
    },
    fmt: {
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        trailingComma: "es5",
        printWidth: 80,
        sortPackageJson: false,
    },
});
