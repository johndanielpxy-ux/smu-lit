import { describe, expect, it, vi } from "vitest";
import { OpenAIProviderError } from "../_lib/openaiProvider";
import { createVoiceoverHandler } from "./voiceover";

const token = "protected-studio-token";

function request(body: unknown, suppliedToken = token) {
  return new Request("https://lawflo.example/api/generation/voiceover", {
    method: "POST",
    headers: { authorization: `Bearer ${suppliedToken}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = {
  narration: "Maya opens the source agreement before relying on the AI review.",
  approvalFingerprint: "msc-1234abcd",
  voice: "marin",
};

describe("voiceover handler", () => {
  it("forwards exact approved narration and returns labelled MP3 bytes", async () => {
    const synthesize = vi.fn(async () => new Uint8Array([73, 68, 51, 3]));
    const response = await createVoiceoverHandler({ studioToken: token, synthesize })(request(valid));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-lawflo-approval-fingerprint")).toBe(valid.approvalFingerprint);
    expect(synthesize).toHaveBeenCalledWith(valid);
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([73, 68, 51, 3]);
  });

  it.each([
    [{ ...valid, narration: "" }, /narration/i],
    [{ ...valid, narration: "x".repeat(4_097) }, /narration/i],
    [{ ...valid, approvalFingerprint: "" }, /fingerprint/i],
    [{ ...valid, voice: "custom-cloned-voice" }, /voice/i],
    [{ ...valid, extra: "field" }, /unexpected/i],
  ])("rejects invalid input before provider spend", async (body, expected) => {
    const synthesize = vi.fn(async () => new Uint8Array());
    const response = await createVoiceoverHandler({ studioToken: token, synthesize })(request(body));
    expect(response.status).toBe(422);
    expect(synthesize).not.toHaveBeenCalled();
    expect(await response.text()).toMatch(expected);
  });

  it("uses the shared protection gate", async () => {
    const response = await createVoiceoverHandler({ studioToken: token, synthesize: async () => new Uint8Array() })(request(valid, "wrong"));
    expect(response.status).toBe(401);
  });

  it("normalises provider failure without leaking details", async () => {
    const response = await createVoiceoverHandler({
      studioToken: token,
      synthesize: async () => { throw new OpenAIProviderError("PROVIDER_UNAVAILABLE", "provider secret"); },
    })(request(valid));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("provider secret");
  });
});
