import { secretsMatch } from "./security";

const DEFAULT_MAX_BYTES = 100 * 1024;

type ErrorCode =
  | "GENERATION_NOT_CONFIGURED"
  | "INVALID_JSON"
  | "JSON_REQUIRED"
  | "METHOD_NOT_ALLOWED"
  | "PAYLOAD_TOO_LARGE"
  | "PRODUCTION_ACCESS_REQUIRED";

const publicMessages: Record<ErrorCode, string> = {
  GENERATION_NOT_CONFIGURED: "Generation is not configured for this deployment.",
  INVALID_JSON: "The request body must contain valid JSON.",
  JSON_REQUIRED: "The request must use application/json.",
  METHOD_NOT_ALLOWED: "This endpoint accepts POST requests only.",
  PAYLOAD_TOO_LARGE: "The generation request is too large.",
  PRODUCTION_ACCESS_REQUIRED: "Production access is required.",
};

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
  ) {
    super(publicMessages[code]);
    this.name = "HttpError";
  }
}

export function jsonResponse(status: number, body: unknown) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return jsonResponse(error.status, {
      error: { code: error.code, message: error.message },
    });
  }

  return jsonResponse(500, {
    error: {
      code: "GENERATION_FAILED",
      message: "Generation could not be completed safely.",
    },
  });
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export async function readProtectedJson(
  request: Request,
  options: { secret?: string; maxBytes?: number },
) {
  if (request.method !== "POST") throw new HttpError(405, "METHOD_NOT_ALLOWED");
  if (!options.secret) throw new HttpError(503, "GENERATION_NOT_CONFIGURED");

  const receivedToken = bearerToken(request);
  if (!receivedToken || !secretsMatch(receivedToken, options.secret)) {
    throw new HttpError(401, "PRODUCTION_ACCESS_REQUIRED");
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") throw new HttpError(415, "JSON_REQUIRED");

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const declaredBytes = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE");
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > maxBytes) throw new HttpError(413, "PAYLOAD_TOO_LARGE");

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
}
