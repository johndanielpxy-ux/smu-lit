import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedUseCase } from "./bundleCompiler";

describe("compileApprovedUseCase", () => {
  it("derives all three learning artefacts from one approved use case", () => {
    const approved = approveUseCase(
      demoUseCase,
      "Jordan Lee",
      "2026-09-05T04:00:00.000Z",
    );

    const bundle = compileApprovedUseCase(approved);

    expect(bundle.manifest).toMatchObject({
      schemaVersion: "1.0",
      useCaseId: approved.id,
      sourceVersion: approved.sourceVersion,
      approvedBy: "Jordan Lee",
    });
    expect(bundle.manifest.bundleId).toMatch(/^lawflo-.+-msc-[0-9a-f]{8}$/);
    expect(bundle.episode.beats).toHaveLength(approved.steps.length);
    expect(bundle.episode.beats[0]).toMatchObject({
      workflowStepId: approved.steps[0].id,
      sourceRefIds: approved.steps[0].sourceRefIds,
    });
    expect(bundle.rehearsal.decisions).toHaveLength(
      approved.guardrails.length * 2,
    );
    expect(bundle.activationCard.steps).toHaveLength(approved.steps.length);
    expect(bundle.activationCard.safetyChecklist).toContain(
      approved.guardrails[0].safeAlternative,
    );
  });

  it("is deterministic for identical approved content", () => {
    const approved = approveUseCase(
      demoUseCase,
      "Jordan Lee",
      "2026-09-05T04:00:00.000Z",
    );

    expect(compileApprovedUseCase(structuredClone(approved))).toEqual(
      compileApprovedUseCase(structuredClone(approved)),
    );
  });

  it("rejects draft and stale approved content", () => {
    expect(() => compileApprovedUseCase(demoUseCase)).toThrow("current human approval");

    const stale = approveUseCase(demoUseCase, "Jordan Lee");
    stale.steps[0].instruction = "A changed instruction after approval.";
    expect(() => compileApprovedUseCase(stale)).toThrow("current human approval");
  });

  it("rejects duplicate identifiers before approval", () => {
    const duplicate = structuredClone(demoUseCase);
    duplicate.steps.push({ ...duplicate.steps[0] });

    expect(() => approveUseCase(duplicate, "Jordan Lee")).toThrow(
      "Duplicate workflow step id",
    );
  });

  it("rejects source references that cannot be resolved", () => {
    const broken = structuredClone(demoUseCase);
    broken.steps[0].sourceRefIds = ["missing-source"];

    expect(() => approveUseCase(broken, "Jordan Lee")).toThrow("missing source");
  });
});
