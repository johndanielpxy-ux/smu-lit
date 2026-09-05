import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createNodeServer } from "./nodeServer";

let server: Server | undefined;

afterEach(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
  server = undefined;
});

describe("Node HTTP bridge", () => {
  it("preserves request bodies and response status, headers and bytes", async () => {
    server = createNodeServer(async (request) => {
      const body = await request.text();
      return new Response(Uint8Array.from([body.length, 7]), {
        status: 202,
        headers: { "content-type": "application/octet-stream", "x-lawflo-bridge": request.headers.get("x-client") ?? "missing" },
      });
    });
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP port.");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/generation/module?mode=test`, {
      method: "POST",
      headers: { "content-type": "text/plain", "x-client": "render-test" },
      body: "lawflo",
    });

    expect(response.status).toBe(202);
    expect(response.headers.get("x-lawflo-bridge")).toBe("render-test");
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([6, 7]);
  });
});
