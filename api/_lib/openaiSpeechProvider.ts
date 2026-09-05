import OpenAI from "openai";
import {
  normaliseProviderError,
  OpenAIProviderError,
} from "./openaiProvider";

export type NarrationVoice = "marin" | "cedar";

export interface VoiceoverRequest {
  narration: string;
  approvalFingerprint: string;
  voice: NarrationVoice;
}

export interface SpeechClient {
  audio: {
    speech: {
      create(
        params: Record<string, unknown>,
        options?: { signal?: AbortSignal },
      ): Promise<Response>;
    };
  };
}

export async function synthesizeSpeechWithOpenAI(
  input: VoiceoverRequest,
  options: { apiKey?: string; client?: SpeechClient; signal?: AbortSignal },
) {
  if (!options.apiKey) throw new OpenAIProviderError("GENERATION_NOT_CONFIGURED");
  const client = options.client ?? (new OpenAI({ apiKey: options.apiKey }) as unknown as SpeechClient);
  try {
    const response = await client.audio.speech.create(
      {
        model: "gpt-4o-mini-tts",
        voice: input.voice,
        input: input.narration,
        instructions: "Natural, calm professional narration. Do not add, remove, or paraphrase any words.",
        response_format: "mp3",
      },
      { signal: options.signal ?? AbortSignal.timeout(30_000) },
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.byteLength) throw new OpenAIProviderError("PROVIDER_REFUSAL");
    return bytes;
  } catch (error) {
    if (error instanceof OpenAIProviderError) throw error;
    throw normaliseProviderError(error);
  }
}
