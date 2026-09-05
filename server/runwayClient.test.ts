import { describe, expect, it, vi } from "vitest";
import { RunwayVideoError, renderRunwayVideo, validateRunwayVideoInput } from "./runwayClient";

const validInput = {
  shots: [
    { duration: 5, prompt: "A legal engineer receives a routine sales renewal in a calm modern office." },
    { duration: 5, prompt: "The reviewer compares a redlined clause against the approved legal playbook." },
    { duration: 5, prompt: "A material liability change is routed to legal review with a clear audit trail." },
  ],
};

describe("Runway video client", () => {
  it("pins a quiet 720p custom multi-shot render and returns the first output", async () => {
    const waitForTaskOutput = vi.fn(async () => ({
      id: "provider-task",
      status: "SUCCEEDED" as const,
      output: ["https://provider.example/expiring-video.mp4"],
      cost: { credits: 195 },
      createdAt: "2026-09-06T00:00:00Z",
    }));
    const multiShotVideo = vi.fn(() => ({ waitForTaskOutput }));

    const result = await renderRunwayVideo({ recipes: { multiShotVideo } }, validInput);

    expect(multiShotVideo).toHaveBeenCalledWith({
      version: "2026-06",
      mode: "custom",
      duration: 15,
      ratio: "1280:720",
      audio: false,
      shots: validInput.shots,
    });
    expect(waitForTaskOutput).toHaveBeenCalledOnce();
    expect(result).toEqual({
      providerTaskId: "provider-task",
      outputUrl: "https://provider.example/expiring-video.mp4",
    });
  });

  it.each([
    [{ shots: validInput.shots.slice(0, 2) }, "shot count"],
    [{ shots: validInput.shots.map((shot, index) => ({ ...shot, duration: index === 0 ? 4 : 5 })) }, "duration"],
    [{ shots: validInput.shots.map((shot, index) => ({ ...shot, prompt: index === 0 ? "no" : shot.prompt })) }, "prompt"],
  ])("rejects invalid input before spending provider credits (%s)", (input, _label) => {
    expect(() => validateRunwayVideoInput(input)).toThrow(RunwayVideoError);
  });

  it("normalises a completed task without an output URL", async () => {
    const client = {
      recipes: {
        multiShotVideo: vi.fn(() => ({
          waitForTaskOutput: vi.fn(async () => ({ id: "provider-task", output: [] })),
        })),
      },
    };

    await expect(renderRunwayVideo(client, validInput)).rejects.toMatchObject({ code: "PROVIDER_OUTPUT_MISSING" });
  });
});
