import { resolve } from "node:path";
import moduleHandler from "../api/generation/module";
import voiceoverHandler from "../api/generation/voiceover";
import { createNodeServer } from "./nodeServer";
import { createRenderApp } from "./renderApp";
import { createRunwayClient, renderRunwayVideo } from "./runwayClient";
import { createVideoGenerationHandler, createVideoGenerationService } from "./videoGeneration";

const port = Number.parseInt(process.env.PORT ?? "10000", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const videoService = createVideoGenerationService({
  render: (input) => renderRunwayVideo(createRunwayClient(), input),
});

const videoHandler = createVideoGenerationHandler({
  studioToken: process.env.LAWFLO_STUDIO_TOKEN,
  service: videoService,
});

const server = createNodeServer(createRenderApp({
  distDir: resolve(process.cwd(), "dist"),
  moduleHandler,
  voiceoverHandler,
  videoHandler,
}));

server.listen(port, "0.0.0.0", () => {
  console.log(`LAWFLO listening on port ${port}.`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
