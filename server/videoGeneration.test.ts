import { describe, expect, it, vi } from "vitest";
import {
  createVideoGenerationHandler,
  createVideoGenerationService,
  type VideoGenerationInput,
} from "./videoGeneration";

const token = "studio-token";
const input: VideoGenerationInput = {
  shots: [
    { duration: 5, prompt: "A legal engineer receives a low-risk sales renewal for careful review." },
    { duration: 5, prompt: "The reviewer checks redlines against a firm-approved legal playbook." },
    { duration: 5, prompt: "The workflow routes a material change to a lawyer and logs the reason." },
  ],
};

function authorisedRequest(url: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
  });
}

describe("video generation service", () => {
  it("returns immediately, progresses to success, and stores provider media inside LAWFLO", async () => {
    let finishRender!: (value: { providerTaskId: string; outputUrl: string }) => void;
    const render = vi.fn(() => new Promise<{ providerTaskId: string; outputUrl: string }>((resolve) => {
      finishRender = resolve;
    }));
    const download = vi.fn(async () => ({ bytes: new Uint8Array([1, 2, 3]), contentType: "video/mp4" }));
    const service = createVideoGenerationService({ render, download, createId: () => "job-123" });

    expect(service.create(input)).toEqual({ taskId: "job-123" });
    expect(service.status("job-123")).toEqual({ status: "running" });

    await vi.waitFor(() => expect(render).toHaveBeenCalledOnce());
    finishRender({ providerTaskId: "provider-secret-id", outputUrl: "https://provider.example/expires.mp4" });
    await vi.waitFor(() => expect(service.status("job-123")).toEqual({ status: "succeeded", mediaId: "job-123" }));

    expect(download).toHaveBeenCalledWith("https://provider.example/expires.mp4");
    expect(service.media("job-123")).toEqual({ bytes: new Uint8Array([1, 2, 3]), contentType: "video/mp4" });
    expect(JSON.stringify(service.status("job-123"))).not.toContain("provider");
  });

  it("keeps provider failures and URLs out of the public job status", async () => {
    const service = createVideoGenerationService({
      render: async () => { throw new Error("secret provider response https://provider.example/private"); },
      download: async () => ({ bytes: new Uint8Array(), contentType: "video/mp4" }),
      createId: () => "failed-job",
    });

    service.create(input);
    await vi.waitFor(() => expect(service.status("failed-job")).toEqual({
      status: "failed",
      error: "The cinematic render could not be completed.",
    }));
  });
});

describe("video generation HTTP handler", () => {
  it("creates, polls, and serves a generated MP4 without exposing its upstream URL", async () => {
    const service = createVideoGenerationService({
      render: async () => ({ providerTaskId: "provider-task", outputUrl: "https://provider.example/expires.mp4" }),
      download: async () => ({ bytes: new Uint8Array([9, 8, 7]), contentType: "video/mp4" }),
      createId: () => "video-job",
    });
    const handler = createVideoGenerationHandler({ studioToken: token, service });

    const createResponse = await handler(authorisedRequest("https://lawflo.example/api/generation/video", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }));
    expect(createResponse.status).toBe(202);
    expect(await createResponse.json()).toEqual({ taskId: "video-job" });

    await vi.waitFor(() => expect(service.status("video-job")?.status).toBe("succeeded"));
    const statusResponse = await handler(authorisedRequest("https://lawflo.example/api/generation/video/video-job"));
    expect(await statusResponse.json()).toEqual({ status: "succeeded", mediaId: "video-job" });

    const mediaResponse = await handler(new Request("https://lawflo.example/api/generation/video/video-job/media"));
    expect(mediaResponse.status).toBe(200);
    expect(mediaResponse.headers.get("content-type")).toBe("video/mp4");
    expect([...new Uint8Array(await mediaResponse.arrayBuffer())]).toEqual([9, 8, 7]);
  });

  it("requires the studio token to create or inspect jobs and rejects malformed inputs", async () => {
    const render = vi.fn(async () => ({ providerTaskId: "provider-task", outputUrl: "https://provider.example/video.mp4" }));
    const service = createVideoGenerationService({
      render,
      download: async () => ({ bytes: new Uint8Array(), contentType: "video/mp4" }),
    });
    const handler = createVideoGenerationHandler({ studioToken: token, service });

    const unauthorised = await handler(new Request("https://lawflo.example/api/generation/video", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }));
    expect(unauthorised.status).toBe(401);

    const invalid = await handler(authorisedRequest("https://lawflo.example/api/generation/video", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shots: input.shots.slice(0, 2) }),
    }));
    expect(invalid.status).toBe(422);
    expect(render).not.toHaveBeenCalled();

    const hiddenStatus = await handler(new Request("https://lawflo.example/api/generation/video/video-job"));
    expect(hiddenStatus.status).toBe(401);
  });
});
