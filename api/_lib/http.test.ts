import { describe, expect, it } from "vitest";
import { errorResponse, jsonResponse, readProtectedJson } from "./http";

const secret = "studio-secret-value";

function request(options: {
  method?: string;
  token?: string;
  contentType?: string;
  body?: string;
  contentLength?: string;
} = {}) {
  const headers = new Headers();
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);
  if (options.contentType !== null) headers.set("content-type", options.contentType ?? "application/json");
  if (options.contentLength) headers.set("content-length", options.contentLength);
  return new Request("https://lawflo.example/api/generation/module", {
    method: options.method ?? "POST",
    headers,
    body: (options.method ?? "POST") === "GET" ? undefined : (options.body ?? '{"source":"approved"}'),
  });
}

describe("readProtectedJson", () => {
  it("returns parsed JSON for an authenticated POST", async () => {
    await expect(readProtectedJson(request({ token: secret }), { secret })).resolves.toEqual({ source: "approved" });
  });

  it("rejects non-POST requests before reading a body", async () => {
    await expect(readProtectedJson(request({ method: "GET", token: secret }), { secret })).rejects.toMatchObject({ status: 405, code: "METHOD_NOT_ALLOWED" });
  });

  it.each([
    ["a missing token", undefined],
    ["an incorrect token", "wrong-secret"],
  ])("rejects %s", async (_label, token) => {
    await expect(readProtectedJson(request({ token }), { secret })).rejects.toMatchObject({ status: 401, code: "PRODUCTION_ACCESS_REQUIRED" });
  });

  it("fails closed when the server secret is absent", async () => {
    await expect(readProtectedJson(request({ token: secret }), { secret: undefined })).rejects.toMatchObject({ status: 503, code: "GENERATION_NOT_CONFIGURED" });
  });

  it("rejects unsupported content types", async () => {
    await expect(readProtectedJson(request({ token: secret, contentType: "text/plain" }), { secret })).rejects.toMatchObject({ status: 415, code: "JSON_REQUIRED" });
  });

  it("rejects a declared body larger than the configured limit", async () => {
    await expect(readProtectedJson(request({ token: secret, contentLength: "9" }), { secret, maxBytes: 8 })).rejects.toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });
  });

  it("rejects an undeclared body that exceeds the configured limit", async () => {
    await expect(readProtectedJson(request({ token: secret, body: '{"long":"value"}' }), { secret, maxBytes: 8 })).rejects.toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });
  });

  it("rejects malformed JSON", async () => {
    await expect(readProtectedJson(request({ token: secret, body: "not-json" }), { secret })).rejects.toMatchObject({ status: 400, code: "INVALID_JSON" });
  });
});

describe("HTTP responses", () => {
  it("marks JSON responses as private and non-sniffable", async () => {
    const response = jsonResponse(202, { status: "queued" });
    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    await expect(response.json()).resolves.toEqual({ status: "queued" });
  });

  it("normalises unexpected failures without leaking their message", async () => {
    const response = errorResponse(new Error("source text and provider secret"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: { code: "GENERATION_FAILED", message: "Generation could not be completed safely." } });
  });
});
