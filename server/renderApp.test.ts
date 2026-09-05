import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRenderApp } from "./renderApp";

let distDir: string;

beforeEach(async () => {
  distDir = await mkdtemp(join(tmpdir(), "lawflo-render-"));
  await writeFile(join(distDir, "index.html"), "<!doctype html><title>LAWFLO</title><main>App shell</main>");
  await writeFile(join(distDir, "app.js"), "globalThis.LAWFLO = true;");
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(distDir, { recursive: true, force: true });
});

function app() {
  return createRenderApp({
    distDir,
    moduleHandler: async () => Response.json({ route: "module" }, { status: 201 }),
    voiceoverHandler: async () => new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "audio/mpeg", "x-lawflo-test": "voiceover" },
    }),
    videoHandler: async (request) => Response.json({ route: "video", path: new URL(request.url).pathname }),
  });
}

describe("Render application adapter", () => {
  it("serves the built application and static assets with safe content types", async () => {
    const handle = app();
    const page = await handle(new Request("https://lawflo.example/"));
    const asset = await handle(new Request("https://lawflo.example/app.js"));

    expect(page.status).toBe(200);
    expect(page.headers.get("content-type")).toContain("text/html");
    expect(await page.text()).toContain("App shell");
    expect(asset.headers.get("content-type")).toContain("text/javascript");
    expect(await asset.text()).toBe("globalThis.LAWFLO = true;");
  });

  it("uses the app shell for client-side routes without exposing files outside dist", async () => {
    const handle = app();
    const clientRoute = await handle(new Request("https://lawflo.example/episode/one"));
    const traversal = await handle(new Request("https://lawflo.example/%2e%2e/package.json"));

    expect(clientRoute.status).toBe(200);
    expect(await clientRoute.text()).toContain("App shell");
    expect(traversal.status).toBe(200);
    expect(await traversal.text()).toContain("App shell");
    expect(await (await handle(new Request("https://lawflo.example/%2e%2e/package.json"))).text()).not.toContain('"name": "lawflo"');
  });

  it("forwards only the supported generation routes and preserves handler responses", async () => {
    const handle = app();
    const moduleResponse = await handle(new Request("https://lawflo.example/api/generation/module", { method: "POST" }));
    const voiceResponse = await handle(new Request("https://lawflo.example/api/generation/voiceover", { method: "POST" }));
    const videoCreateResponse = await handle(new Request("https://lawflo.example/api/generation/video", { method: "POST" }));
    const videoStatusResponse = await handle(new Request("https://lawflo.example/api/generation/video/job-123"));
    const videoMediaResponse = await handle(new Request("https://lawflo.example/api/generation/video/job-123/media"));
    const unknownResponse = await handle(new Request("https://lawflo.example/api/generation/unknown", { method: "POST" }));

    expect(moduleResponse.status).toBe(201);
    expect(await moduleResponse.json()).toEqual({ route: "module" });
    expect(voiceResponse.headers.get("x-lawflo-test")).toBe("voiceover");
    expect([...new Uint8Array(await voiceResponse.arrayBuffer())]).toEqual([1, 2, 3]);
    await expect(videoCreateResponse.json()).resolves.toEqual({ route: "video", path: "/api/generation/video" });
    await expect(videoStatusResponse.json()).resolves.toEqual({ route: "video", path: "/api/generation/video/job-123" });
    await expect(videoMediaResponse.json()).resolves.toEqual({ route: "video", path: "/api/generation/video/job-123/media" });
    expect(unknownResponse.status).toBe(404);
    expect(await unknownResponse.json()).toEqual({ error: { code: "NOT_FOUND", message: "API route not found." } });
  });

  it("returns a stable unavailable response when the built app is absent", async () => {
    const handle = createRenderApp({
      distDir: join(distDir, "missing"),
      moduleHandler: async () => new Response(),
      voiceoverHandler: async () => new Response(),
      videoHandler: async () => new Response(),
    });

    const response = await handle(new Request("https://lawflo.example/"));
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("LAWFLO build unavailable.");
  });
});
