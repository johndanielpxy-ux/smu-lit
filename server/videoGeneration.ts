import { randomUUID } from "node:crypto";
import { errorResponse, jsonResponse, readProtectedJson } from "../api/_lib/http";
import { secretsMatch } from "../api/_lib/security";
import { RunwayVideoError, validateRunwayVideoInput, type RunwayVideoInput } from "./runwayClient";

export type VideoGenerationInput = RunwayVideoInput;

interface RenderResult {
  providerTaskId: string;
  outputUrl: string;
}

interface MediaArtifact {
  bytes: Uint8Array;
  contentType: string;
}

interface PublicJobStatus {
  status: "running" | "succeeded" | "failed";
  mediaId?: string;
  error?: string;
}

interface InternalJob extends PublicJobStatus {
  media?: MediaArtifact;
}

export interface VideoGenerationService {
  create(input: unknown): { taskId: string };
  status(taskId: string): PublicJobStatus | undefined;
  media(taskId: string): MediaArtifact | undefined;
}

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export async function downloadGeneratedMedia(
  url: string,
  expected: "video" | "audio",
  fetcher: typeof fetch = fetch,
): Promise<MediaArtifact> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("Generated media URL must use HTTPS.");

  const response = await fetcher(parsed, { redirect: "follow" });
  if (!response.ok) throw new Error("Generated media download failed.");
  const declaredBytes = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > MAX_VIDEO_BYTES) {
    throw new Error("Generated media exceeded the storage limit.");
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_VIDEO_BYTES) {
    throw new Error("Generated media had an invalid size.");
  }
  const received = response.headers.get("content-type")?.split(";", 1)[0];
  const contentType = expected === "video"
    ? received === "video/mp4" ? "video/mp4" : "application/octet-stream"
    : received === "audio/mpeg" ? "audio/mpeg" : "application/octet-stream";
  return {
    bytes,
    contentType,
  };
}

export function downloadGeneratedVideo(url: string): Promise<MediaArtifact> {
  return downloadGeneratedMedia(url, "video");
}

export function createVideoGenerationService(options: {
  render: (input: VideoGenerationInput) => Promise<RenderResult>;
  download?: (url: string) => Promise<MediaArtifact>;
  createId?: () => string;
}): VideoGenerationService {
  const jobs = new Map<string, InternalJob>();
  const download = options.download ?? downloadGeneratedVideo;
  const createId = options.createId ?? randomUUID;

  return {
    create(value) {
      const input = validateRunwayVideoInput(value);
      const taskId = createId();
      jobs.set(taskId, { status: "running" });

      void Promise.resolve()
        .then(() => options.render(input))
        .then((result) => download(result.outputUrl))
        .then((media) => jobs.set(taskId, { status: "succeeded", mediaId: taskId, media }))
        .catch(() => jobs.set(taskId, {
          status: "failed",
          error: "The cinematic render could not be completed.",
        }));

      return { taskId };
    },
    status(taskId) {
      const job = jobs.get(taskId);
      if (!job) return undefined;
      const { status, mediaId, error } = job;
      return {
        status,
        ...(mediaId ? { mediaId } : {}),
        ...(error ? { error } : {}),
      };
    },
    media(taskId) {
      return jobs.get(taskId)?.media;
    },
  };
}

function authorised(request: Request, studioToken?: string) {
  if (!studioToken) return { ok: false, status: 503, code: "GENERATION_NOT_CONFIGURED", message: "Generation is not configured for this deployment." };
  const authorization = request.headers.get("authorization") ?? "";
  const received = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!received || !secretsMatch(received, studioToken)) {
    return { ok: false, status: 401, code: "PRODUCTION_ACCESS_REQUIRED", message: "Production access is required." };
  }
  return { ok: true };
}

function routeId(pathname: string, suffix = "") {
  const expression = new RegExp(`^/api/generation/video/([^/]+)${suffix}$`);
  return pathname.match(expression)?.[1];
}

export function createVideoGenerationHandler(options: {
  studioToken?: string;
  service: VideoGenerationService;
}) {
  return async function videoGenerationHandler(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/generation/video") {
      try {
        const body = await readProtectedJson(request, { secret: options.studioToken, maxBytes: 16 * 1024 });
        const created = options.service.create(body);
        return jsonResponse(202, created);
      } catch (error) {
        if (error instanceof RunwayVideoError) {
          return jsonResponse(422, { error: { code: error.code, message: "The video request did not pass validation." } });
        }
        return errorResponse(error);
      }
    }

    const mediaId = routeId(pathname, "/media");
    if (mediaId) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return jsonResponse(405, { error: { code: "METHOD_NOT_ALLOWED", message: "This endpoint accepts GET requests only." } });
      }
      const media = options.service.media(mediaId);
      if (!media) return jsonResponse(404, { error: { code: "VIDEO_NOT_FOUND", message: "Generated video not found." } });
      return new Response(request.method === "HEAD" ? null : Uint8Array.from(media.bytes), {
        headers: {
          "cache-control": "private, max-age=3600",
          "content-type": media.contentType,
          "x-content-type-options": "nosniff",
        },
      });
    }

    const taskId = routeId(pathname);
    if (taskId) {
      const access = authorised(request, options.studioToken);
      if (!access.ok) return jsonResponse(access.status!, { error: { code: access.code, message: access.message } });
      if (request.method !== "GET") {
        return jsonResponse(405, { error: { code: "METHOD_NOT_ALLOWED", message: "This endpoint accepts GET requests only." } });
      }
      const status = options.service.status(taskId);
      if (!status) return jsonResponse(404, { error: { code: "VIDEO_JOB_NOT_FOUND", message: "Video job not found." } });
      return jsonResponse(200, status);
    }

    return jsonResponse(404, { error: { code: "NOT_FOUND", message: "API route not found." } });
  };
}
