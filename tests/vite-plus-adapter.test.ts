import { expect, test } from "bun:test";
import type { ConfigEnv, Plugin } from "vite";
import viteConfig from "../vite.config";
import {
    createAstroBuildBridge,
    createAstroDevProxy,
    isAstroDevCommand,
} from "../src/lib/vitePlusAdapter";

async function resolvePluginConfig(
    plugin: Plugin,
    environment: ConfigEnv
): Promise<unknown> {
    if (typeof plugin.config !== "function") {
        throw new Error("Expected a Vite config hook");
    }
    return Reflect.apply(plugin.config, undefined, [{}, environment]);
}

test("only real development activates the Astro dev bridge", () => {
    expect(isAstroDevCommand({ command: "serve", mode: "development" })).toBe(
        true
    );
    expect(isAstroDevCommand({ command: "serve", mode: "test" })).toBe(false);
    expect(
        isAstroDevCommand({
            command: "serve",
            mode: "production",
            isPreview: true,
        })
    ).toBe(false);
    expect(isAstroDevCommand({ command: "build", mode: "production" })).toBe(
        false
    );
});

test("direct vp dev uses the site port for local Worker probing", () => {
    expect(viteConfig.server).toMatchObject({
        host: "127.0.0.1",
        port: 4321,
    });
});

test("Astro dev proxy preserves HTTP and WebSocket forwarding", async () => {
    const plugin = createAstroDevProxy({
        startAstro: async () => ({
            address: { port: 8787 },
            stop: async () => {},
        }),
        syncPublic: async () => {},
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "serve",
        mode: "development",
        isPreview: false,
    } as ConfigEnv)) as {
        server: {
            hmr: boolean;
            proxy: Record<string, { target: string; ws: boolean }>;
        };
    };

    expect(config.server.hmr).toBe(false);
    expect(config.server.proxy["/"]).toMatchObject({
        target: "http://127.0.0.1:8787",
        ws: true,
    });
});

test("Astro build bridge handles every Vite environment after Astro builds", async () => {
    const calls: string[] = [];
    const plugin = createAstroBuildBridge({
        buildAstro: async () => {
            calls.push("astro");
        },
        runPostBuild: async () => {
            calls.push("post-build");
        },
        syncPublic: async () => {
            calls.push("sync");
        },
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "build",
        mode: "production",
        isPreview: false,
    } as ConfigEnv)) as {
        builder: {
            buildApp(builder: {
                environments: Record<string, { isBuilt: boolean }>;
            }): Promise<void>;
        };
    };
    const environments = {
        client: { isBuilt: false },
        prerender: { isBuilt: false },
    };

    await config.builder.buildApp({ environments });

    expect(calls).toEqual(["sync", "astro", "post-build"]);
    expect(
        Object.values(environments).every((environment) => environment.isBuilt)
    ).toBe(true);
});

test("Astro build bridge is inactive for non-build Vite commands", async () => {
    const plugin = createAstroBuildBridge({
        buildAstro: async () => {},
        runPostBuild: async () => {},
    });

    expect(
        await resolvePluginConfig(plugin, {
            command: "serve",
            mode: "development",
            isPreview: false,
        } as ConfigEnv)
    ).toBeUndefined();
});
