import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { createEpisodeTimeline } from "./timeline";

const bundle = compileApprovedTrainingModule(
  approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
  contractTrainingContent,
);

describe("createEpisodeTimeline", () => {
  it("creates a six-chapter, 90–120 second legal AI story", () => {
    const timeline = createEpisodeTimeline(bundle);
    expect(timeline.map((cue) => cue.title)).toEqual([
      "The renewal bottleneck",
      "AI extracts the matter",
      "Compare, don't assume",
      "The human catches the miss",
      "Apply the playbook",
      "Escalate with a reason",
    ]);
    expect(timeline.reduce((sum, cue) => sum + cue.durationSeconds, 0)).toBeGreaterThanOrEqual(90);
    expect(timeline.reduce((sum, cue) => sum + cue.durationSeconds, 0)).toBeLessThanOrEqual(120);
    expect(timeline.every((cue) => cue.sourceRefIds.length > 0)).toBe(true);
  });

  it("teaches that low value cannot override a material redline", () => {
    const checkpoint = createEpisodeTimeline(bundle).find((cue) => cue.checkpoint);
    expect(checkpoint?.narration).toContain("SGD 42,000");
    expect(checkpoint?.checkpoint?.safeChoiceId).toBe("escalate-material-redline");
    expect(checkpoint?.sourceRefIds).toContain("material-redline-rule");
  });
});
