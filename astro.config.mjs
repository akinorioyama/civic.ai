import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://civic.ai",
    output: "static",
    trailingSlash: "always",
    build: { format: "directory" },
    outDir: "dist",
});
