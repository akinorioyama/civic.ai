import { defineConfig } from "astro/config";
import { availableParallelism } from "node:os";

const staticRouteConcurrency = availableParallelism();

export default defineConfig({
    site: "https://civic.ai",
    output: "static",
    trailingSlash: "always",
    build: { format: "directory", concurrency: staticRouteConcurrency },
    outDir: "dist",
});
