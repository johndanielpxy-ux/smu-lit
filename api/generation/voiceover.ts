import { errorResponse, jsonResponse, readProtectedJson } from "../_lib/http";
import {
  synthesizeSpeechWithOpenAI,
  type NarrationVoice,
  type VoiceoverRequest,
} from "../_lib/openaiSpeechProvider";
import { OpenAIProviderError } from "../_lib/openaiProvider";

type Synthesize = (input: VoiceoverRequest) => Promise<Uint8Array>;

function validateVoiceoverRequest(value: unknown): VoiceoverRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Voiceover request must be an object.");
  const input = value as Record<string, unknown>;
  const keys = ["narration", "approvalFingerprint", "voice"];
  const unexpected = Object.keys(input).filter((key) => !keys.includes(key));
  if (unexpected.length) throw new Error(`Unexpected field: ${unexpected[0]}.`);
  if (typeof input.narration !== "string" || !input.narration.trim() || input.narration.length > 4_096) {
    throw new Error("Narration must contain between 1 and 4096 characters.");
  }
  if (typeof input.approvalFingerprint !== "string" || !/^msc-[a-f0-9]{8}$/.test(input.approvalFingerprint)) {
    throw new Error("A valid approval fingerprint is required.");
  }
  if (input.voice !== "marin" && input.voice !== "cedar") {
    throw new Error("Voice must be the built-in marin or cedar voice.");
  }
  return {
    narration: input.narration,
    approvalFingerprint: input.approvalFingerprint,
    voice: input.voice as NarrationVoice,
  };
}

export function createVoiceoverHandler(options: {
  studioToken?: string;
  synthesize: Synthesize;
}) {
  return async function voiceoverHandler(request: Request) {
    let input: VoiceoverRequest;
    try {
      input = validateVoiceoverRequest(await readProtectedJson(request, { secret: options.studioToken }));
    } catch (error) {
      if (error instanceof Error && !("status" in error)) {
        return jsonResponse(422, { error: { code: "INVALID_VOICEOVER_REQUEST", message: error.message } });
      }
      return errorResponse(error);
    }

    try {
      const bytes = await options.synthesize(input);
      return new Response(Uint8Array.from(bytes).buffer, {
        status: 200,
        headers: {
          "cache-control": "no-store",
          "content-type": "audio/mpeg",
          "x-content-type-options": "nosniff",
          "x-lawflo-approval-fingerprint": input.approvalFingerprint,
        },
      });
    } catch (error) {
      if (error instanceof OpenAIProviderError) {
        const status = error.code === "PROVIDER_RATE_LIMITED" ? 429 : error.code === "PROVIDER_TIMEOUT" ? 504 : 503;
        return jsonResponse(status, { error: { code: error.code, message: "Narration could not be generated safely." } });
      }
      return errorResponse(error);
    }
  };
}

export default createVoiceoverHandler({
  studioToken: process.env.LAWFLO_STUDIO_TOKEN,
  synthesize: (input) => synthesizeSpeechWithOpenAI(input, { apiKey: process.env.OPENAI_API_KEY }),
});
