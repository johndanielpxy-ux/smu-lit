import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoMediaPlans } from "../server/demoMediaPlan";
import { createRunwayClient, renderRunwayNarration, renderRunwayVideo } from "../server/runwayClient";
import { downloadGeneratedMedia } from "../server/videoGeneration";

const outputDirectory = path.resolve(process.cwd(), "public/media/demo");

async function existsWithContent(filename: string) {
  try {
    return (await stat(filename)).size > 0;
  } catch {
    return false;
  }
}

async function main() {
  const client = createRunwayClient();
  await mkdir(outputDirectory, { recursive: true });

  for (const plan of demoMediaPlans) {
    const videoDestination = path.join(outputDirectory, plan.filename);
    if (await existsWithContent(videoDestination)) {
      process.stdout.write(`Skipping existing ${plan.filename}\n`);
    } else {
      process.stdout.write(`Generating video: ${plan.label}…\n`);
      const result = await renderRunwayVideo(client, { shots: plan.shots });
      const media = await downloadGeneratedMedia(result.outputUrl, "video");
      const partial = path.join(outputDirectory, `.${plan.filename}.${result.providerTaskId}.partial`);
      await writeFile(partial, media.bytes);
      await rename(partial, videoDestination);
      process.stdout.write(`Saved ${plan.filename}\n`);
    }

    const audioDestination = path.join(outputDirectory, plan.audioFilename);
    if (await existsWithContent(audioDestination)) {
      process.stdout.write(`Skipping existing ${plan.audioFilename}\n`);
    } else {
      process.stdout.write(`Generating narration: ${plan.label}…\n`);
      const result = await renderRunwayNarration(client, { narration: plan.narration });
      const media = await downloadGeneratedMedia(result.outputUrl, "audio");
      const partial = path.join(outputDirectory, `.${plan.audioFilename}.${result.providerTaskId}.partial`);
      await writeFile(partial, media.bytes);
      await rename(partial, audioDestination);
      process.stdout.write(`Saved ${plan.audioFilename}\n`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown media-generation error.";
  process.stderr.write(`Demo media generation stopped: ${message}\n`);
  process.exitCode = 1;
});
