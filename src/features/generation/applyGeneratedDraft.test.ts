import { describe, expect, it } from "vitest";
import { demoUseCase } from "../../demo/demoUseCase";
import type { GeneratedModuleDraft } from "../../domain/generation";
import { loadSyntheticDemoPack } from "../studio/demoPack";
import { applyGeneratedDraft } from "./applyGeneratedDraft";

describe("applyGeneratedDraft", () => {
  it("adds the exact uploaded documents as governed sources and clears approval", () => {
    const pack = loadSyntheticDemoPack();
    const draft: GeneratedModuleDraft = {
      schemaVersion: "1.0",
      title: "Generated episode",
      learningObjectives: ["Verify the AI output."],
      chapters: ["intake", "review", "route"].map((id) => ({
        id,
        title: id,
        narration: `${id} narration`,
        sourceRefIds: [id === "route" ? "playbook" : "workflow"],
        shots: [{ id: `${id}-1`, prompt: "A grounded shot" }],
      })),
      checkpoint: {
        question: "Where should the matter go?",
        options: [{ id: "legal", label: "Legal review" }],
        correctOptionId: "legal",
        explanation: "The playbook controls.",
        sourceRefIds: ["playbook"],
      },
    };

    const result = applyGeneratedDraft(
      { ...structuredClone(demoUseCase), approvalStatus: "human_approved", approvedBy: "Reviewer" },
      draft,
      pack,
    );

    expect(result.generatedModuleDraft).toEqual(draft);
    expect(result.approvalStatus).toBe("draft");
    expect(result.approvedBy).toBeUndefined();
    expect(result.approvalRecord).toBeUndefined();
    expect(result.sources.filter((source) => ["workflow", "playbook", "template", "contract"].includes(source.id)))
      .toEqual([
        expect.objectContaining({ id: "workflow", title: pack.filenames.workflow, version: result.sourceVersion }),
        expect.objectContaining({ id: "playbook", title: pack.filenames.playbook, version: result.sourceVersion }),
        expect.objectContaining({ id: "template", title: pack.filenames.template, version: result.sourceVersion }),
        expect.objectContaining({ id: "contract", title: pack.filenames.contract, version: result.sourceVersion }),
      ]);
    expect(result.sources.find((source) => source.id === "workflow")?.excerpt).toContain("LAWFLO-DEMO");
    expect(result.sources.some((source) => source.id === "renewal-routing-playbook")).toBe(true);
  });
});
