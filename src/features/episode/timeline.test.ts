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
  it("uses the exact approved generated draft instead of the deterministic fallback", () => {
    const generatedUseCase = structuredClone(demoUseCase);
    generatedUseCase.generatedModuleDraft = {
      schemaVersion: "1.0",
      title: "Generated redline episode",
      learningObjectives: ["Verify the AI finding."],
      chapters: ["intake", "review", "route"].map((id, index) => ({
        id,
        title: `Generated ${id}`,
        narration: `Exact ${id} narration`,
        sourceRefIds: [index === 2 ? "playbook" : "workflow"],
        shots: [1, 2, 3].map((shot) => ({ id: `${id}-${shot}`, prompt: `Shot ${shot}` })),
      })),
      checkpoint: {
        question: "Where should the renewal go?",
        options: [{ id: "business", label: "Business approval" }, { id: "legal", label: "Legal review" }],
        correctOptionId: "legal",
        explanation: "The material redline controls.",
        sourceRefIds: ["playbook"],
      },
    };
    const generatedBundle = compileApprovedTrainingModule(
      approveUseCase(generatedUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
      contractTrainingContent,
    );
    const timeline = createEpisodeTimeline(generatedBundle);
    expect(generatedBundle.episode.title).toBe("Generated redline episode");
    expect(timeline.map((cue) => cue.narration)).toEqual([
      "Exact intake narration",
      "Exact review narration",
      "Exact route narration",
    ]);
    expect(timeline[2].checkpoint).toMatchObject({
      prompt: "Where should the renewal go?",
      safeChoiceId: "legal",
      sourceRefIds: ["playbook"],
    });
  });

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
