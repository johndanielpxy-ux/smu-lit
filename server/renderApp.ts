import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

type ApiHandler = (request: Request) => Promise<Response>;

interface RenderAppOptions {
  distDir: string;
  moduleHandler: ApiHandler;
  voiceoverHandler: ApiHandler;
  videoHandler: ApiHandler;
}

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function notFound(): Response {
  return Response.json(
    { error: { code: "NOT_FOUND", message: "API route not found." } },
    { status: 404, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } },
  );
}

function safeAssetPath(distDir: string, pathname: string): string | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  if (decoded.includes("\0")) return undefined;
  const root = resolve(distDir);
  const candidate = resolve(root, decoded.replace(/^\/+/, ""));
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : undefined;
}

async function staticResponse(path: string, method: string): Promise<Response | undefined> {
  try {
    const bytes = await readFile(path);
    const body = method === "HEAD" ? null : Uint8Array.from(bytes);
    return new Response(body, {
      status: 200,
      headers: {
        "cache-control": extname(path) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
        "content-type": contentTypes[extname(path).toLowerCase()] ?? "application/octet-stream",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" || (error as NodeJS.ErrnoException).code === "EISDIR") {
      return undefined;
    }
    throw error;
  }
}

export function createRenderApp(options: RenderAppOptions): ApiHandler {
  return async (request) => {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/generation/module") return options.moduleHandler(request);
    if (pathname === "/api/generation/voiceover") return options.voiceoverHandler(request);
    if (pathname === "/api/generation/video" || pathname.startsWith("/api/generation/video/")) {
      return options.videoHandler(request);
    }
    if (pathname.startsWith("/api/")) return notFound();
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed.", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    const assetPath = safeAssetPath(options.distDir, pathname);
    const asset = assetPath ? await staticResponse(assetPath, request.method) : undefined;
    if (asset) return asset;

    const shell = await staticResponse(resolve(options.distDir, "index.html"), request.method);
    return shell ?? new Response("LAWFLO build unavailable.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" },
    });
  };
}
