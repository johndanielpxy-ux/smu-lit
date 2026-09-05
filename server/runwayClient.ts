import RunwayML from "@runwayml/sdk";

export interface RunwayVideoShot {
  duration: number;
  prompt: string;
}

export interface RunwayVideoInput {
  shots: RunwayVideoShot[];
}

interface RunwayTask {
  waitForTaskOutput(): Promise<{ id: string; output: string[] }>;
}

export interface RunwayRecipeClient {
  recipes: {
    multiShotVideo(input: {
      version: "2026-06";
      mode: "custom";
      duration: 15;
      ratio: "1280:720";
      audio: false;
      shots: RunwayVideoShot[];
    }): RunwayTask;
  };
}

export type RunwayVideoErrorCode =
  | "GENERATION_NOT_CONFIGURED"
  | "INVALID_VIDEO_REQUEST"
  | "PROVIDER_OUTPUT_MISSING";

export class RunwayVideoError extends Error {
  constructor(readonly code: RunwayVideoErrorCode, message: string) {
    super(message);
    this.name = "RunwayVideoError";
  }
}

export function validateRunwayVideoInput(value: unknown): RunwayVideoInput {
  if (!value || typeof value !== "object" || !Array.isArray((value as { shots?: unknown }).shots)) {
    throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "A shot list is required.");
  }

  const shots = (value as { shots: unknown[] }).shots;
  if (shots.length < 3 || shots.length > 5) {
    throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "A video requires three to five shots.");
  }

  const validated = shots.map((shot) => {
    if (!shot || typeof shot !== "object") {
      throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "Each shot must include a prompt and duration.");
    }
    const { duration, prompt } = shot as { duration?: unknown; prompt?: unknown };
    if (!Number.isInteger(duration) || (duration as number) < 1) {
      throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "Shot durations must be positive whole seconds.");
    }
    if (typeof prompt !== "string" || prompt.trim().length < 3 || prompt.trim().length > 512) {
      throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "Shot prompts must contain between 3 and 512 characters.");
    }
    return { duration: duration as number, prompt: prompt.trim() };
  });

  if (validated.reduce((total, shot) => total + shot.duration, 0) !== 15) {
    throw new RunwayVideoError("INVALID_VIDEO_REQUEST", "Shot durations must total 15 seconds.");
  }

  return { shots: validated };
}

export async function renderRunwayVideo(client: RunwayRecipeClient, value: unknown) {
  const input = validateRunwayVideoInput(value);
  const output = await client.recipes.multiShotVideo({
    version: "2026-06",
    mode: "custom",
    duration: 15,
    ratio: "1280:720",
    audio: false,
    shots: input.shots,
  }).waitForTaskOutput();

  const outputUrl = output.output[0];
  if (!outputUrl) {
    throw new RunwayVideoError("PROVIDER_OUTPUT_MISSING", "The completed render did not contain a video.");
  }
  return { providerTaskId: output.id, outputUrl };
}

export function createRunwayClient(apiKey = process.env.RUNWAYML_API_SECRET): RunwayRecipeClient {
  if (!apiKey) {
    throw new RunwayVideoError("GENERATION_NOT_CONFIGURED", "Runway video generation is not configured.");
  }
  return new RunwayML({ apiKey }) as RunwayRecipeClient;
}
