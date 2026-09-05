import { describe, expect, it } from "vitest";
import { synthesizeSpeechWithOpenAI, type SpeechClient } from "./openaiSpeechProvider";

describe("synthesizeSpeechWithOpenAI", () => {
  it("uses the approved text, built-in voice, and MP3 response format", async () => {
    let captured: Record<string, unknown> | undefined;
    const client: SpeechClient = {
      audio: { speech: { create: async (params) => {
        captured = params;
        return new Response(new Uint8Array([1, 2, 3]));
      } } },
    };
    await expect(synthesizeSpeechWithOpenAI({ narration: "Exact approved words.", approvalFingerprint: "msc-abcd1234", voice: "cedar" }, { apiKey: "key", client })).resolves.toEqual(new Uint8Array([1, 2, 3]));
    expect(captured).toEqual({
      model: "gpt-4o-mini-tts",
      voice: "cedar",
      input: "Exact approved words.",
      instructions: "Natural, calm professional narration. Do not add, remove, or paraphrase any words.",
      response_format: "mp3",
    });
  });

  it("fails closed without configuration or audio bytes", async () => {
    await expect(synthesizeSpeechWithOpenAI({ narration: "Text", approvalFingerprint: "msc-abcd1234", voice: "marin" }, { apiKey: "" })).rejects.toMatchObject({ code: "GENERATION_NOT_CONFIGURED" });
    const client: SpeechClient = { audio: { speech: { create: async () => new Response(new Uint8Array()) } } };
    await expect(synthesizeSpeechWithOpenAI({ narration: "Text", approvalFingerprint: "msc-abcd1234", voice: "marin" }, { apiKey: "key", client })).rejects.toMatchObject({ code: "PROVIDER_REFUSAL" });
  });
});
