import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "./bundleCompiler";

const approved = approveUseCase(
  demoUseCase,
  "Jordan Lee",
  "2026-09-05T04:00:00.000Z",
);

describe("compileApprovedTrainingModule", () => {
  it("derives every learning artefact from one approved module", () => {
    const bundle = compileApprovedTrainingModule(approved, contractTrainingContent);

    expect(bundle.manifest).toMatchObject({
      schemaVersion: "2.0",
      useCaseId: approved.id,
      sourceVersion: approved.sourceVersion,
      approvedBy: "Jordan Lee",
      scenarioRefs: approved.scenarioRefs,
    });
    expect(Object.keys(bundle.manifest.artifactIds)).toEqual([
      "episode",
      "aiAnalysis",
      "rehearsal",
      "coaching",
      "workflowGuide",
    ]);
    expect(bundle.aiAnalysis.proposedRoute).toBe("business_approval");
    expect(bundle.aiAnalysis.findings).toContainEqual(
      expect.objectContaining({
        id: "guided-material-redline",
        status: "unverified",
        aiGenerated: true,
        proposedValue: false,
      }),
    );
    expect(bundle.rehearsal.requiredClauseIds).toContain("liability");
    expect(bundle.workflowGuide.legalAiSteps).toHaveLength(approved.steps.length);
  });

  it("is deterministic for identical approved content", () => {
    expect(
      compileApprovedTrainingModule(
        structuredClone(approved),
        structuredClone(contractTrainingContent),
      ),
    ).toEqual(compileApprovedTrainingModule(approved, contractTrainingContent));
  });

  it("rejects stale approval", () => {
    const stale = structuredClone(approved);
    stale.steps[0].instruction = "Changed after approval";

    expect(() =>
      compileApprovedTrainingModule(stale, contractTrainingContent),
    ).toThrow("current human approval");
  });

  it("rejects changed scenario content even when its version is unchanged", () => {
    const changed = structuredClone(contractTrainingContent);
    changed.guidedScenario.aiFindings[0].proposedValue = 99_999;

    expect(() => compileApprovedTrainingModule(approved, changed)).toThrow(
      "does not match the approved scenario set",
    );
  });

  it("rejects an unresolved clause or source reference", () => {
    const changed = structuredClone(contractTrainingContent);
    changed.guidedScenario.aiFindings[0].sourceClauseId = "missing-clause";

    expect(() => compileApprovedTrainingModule(approved, changed)).toThrow(
      "missing clause",
    );
  });
});
