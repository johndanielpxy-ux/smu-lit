import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoMediaPlans } from "../server/demoMediaPlan";
import { createRunwayClient, renderRunwayVideo } from "../server/runwayClient";
import { downloadGeneratedVideo } from "../server/videoGeneration";

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
    const destination = path.join(outputDirectory, plan.filename);
    if (await existsWithContent(destination)) {
      process.stdout.write(`Skipping existing ${plan.filename}\n`);
      continue;
    }

    process.stdout.write(`Generating ${plan.label}…\n`);
    const result = await renderRunwayVideo(client, { shots: plan.shots });
    const media = await downloadGeneratedVideo(result.outputUrl);
    const partial = path.join(outputDirectory, `.${plan.filename}.${result.providerTaskId}.partial`);
    await writeFile(partial, media.bytes);
    await rename(partial, destination);
    process.stdout.write(`Saved ${plan.filename}\n`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown media-generation error.";
  process.stderr.write(`Demo media generation stopped: ${message}\n`);
  process.exitCode = 1;
});
