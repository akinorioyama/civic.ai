import { defineConfig } from "vite-plus";
import {
    createAstroBuildBridge,
    createAstroDevProxy,
} from "./src/lib/vitePlusAdapter";

export default defineConfig({
    lint: {
        jsPlugins: [
            { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
        ],
        ignorePatterns: ["worker/**"],
        rules: {
            "vite-plus/prefer-vite-plus-imports": "error",
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
        options: { typeAware: true, typeCheck: true, denyWarnings: true },
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
    resolve: {
        alias: { "bun:test": "vitest" },
    },
    server: {
        host: "127.0.0.1",
        port: 4321,
    },
    plugins: [createAstroBuildBridge(), createAstroDevProxy()],
});
