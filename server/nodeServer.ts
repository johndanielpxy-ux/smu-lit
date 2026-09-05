import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

type WebHandler = (request: Request) => Promise<Response>;

function requestHeaders(message: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(message.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
    else if (value !== undefined) headers.set(name, value);
  }
  return headers;
}

function toWebRequest(message: IncomingMessage): Request {
  const method = message.method ?? "GET";
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: requestHeaders(message),
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = Readable.toWeb(message) as ReadableStream<Uint8Array>;
    init.duplex = "half";
  }
  return new Request(new URL(message.url ?? "/", "http://lawflo.render.internal"), init);
}

async function writeWebResponse(response: Response, target: ServerResponse): Promise<void> {
  target.statusCode = response.status;
  response.headers.forEach((value, name) => target.setHeader(name, value));
  const body = Buffer.from(await response.arrayBuffer());
  target.end(body);
}

export function createNodeServer(handler: WebHandler): Server {
  return createServer((request, response) => {
    void handler(toWebRequest(request))
      .then((result) => writeWebResponse(result, response))
      .catch(() => {
        if (response.headersSent) {
          response.destroy();
          return;
        }
        response.statusCode = 500;
        response.setHeader("cache-control", "no-store");
        response.setHeader("content-type", "text/plain; charset=utf-8");
        response.end("LAWFLO server error.");
      });
  });
}
