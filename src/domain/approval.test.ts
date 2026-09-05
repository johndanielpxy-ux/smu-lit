import { describe, expect, it } from "vitest";
import { demoUseCase } from "../demo/demoUseCase";
import {
  approveUseCase,
  invalidateApprovalIfChanged,
  isApprovalCurrent,
} from "./approval";

describe("approval lifecycle", () => {
  it("records a current human approval against the exact material content", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z");

    expect(approved.approvalStatus).toBe("human_approved");
    expect(approved.approvedBy).toBe("Jordan Lee");
    expect(approved.approvalRecord).toMatchObject({
      approvedBy: "Jordan Lee",
      approvedAt: "2026-09-05T04:00:00.000Z",
      sourceVersion: demoUseCase.sourceVersion,
    });
    expect(approved.approvalRecord?.contentFingerprint).toMatch(/^msc-[0-9a-f]{8}$/);
    expect(isApprovalCurrent(approved)).toBe(true);
  });

  it("invalidates approval after a material instruction changes", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee");
    const edited = structuredClone(approved);
    edited.steps[0].instruction = "Use a different instruction.";

    const invalidated = invalidateApprovalIfChanged(approved, edited);

    expect(invalidated.approvalStatus).toBe("draft");
    expect(invalidated.approvedBy).toBeUndefined();
    expect(invalidated.approvalRecord).toBeUndefined();
    expect(isApprovalCurrent(invalidated)).toBe(false);
  });

  it("invalidates approval when the governing source version changes", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee");
    const edited = structuredClone(approved);
    edited.sourceVersion = "2.0";

    expect(invalidateApprovalIfChanged(approved, edited).approvalStatus).toBe("draft");
  });

  it("invalidates approval when approved scenario content changes", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee");
    const edited = structuredClone(approved);
    edited.scenarioRefs[0].contentFingerprint = "scenario-deadbeef";

    expect(invalidateApprovalIfChanged(approved, edited).approvalStatus).toBe(
      "draft",
    );
  });

  it("preserves approval when only a cloned object is supplied", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee");

    expect(invalidateApprovalIfChanged(approved, structuredClone(approved))).toEqual(approved);
  });

  it("preserves authoritative approval metadata when content is unchanged", () => {
    const approved = approveUseCase(demoUseCase, "Jordan Lee");
    const candidate = structuredClone(approved);
    candidate.approvedBy = "Replacement Reviewer";
    candidate.approvalRecord!.approvedBy = "Replacement Reviewer";

    const preserved = invalidateApprovalIfChanged(approved, candidate);

    expect(preserved.approvedBy).toBe("Jordan Lee");
    expect(preserved.approvalRecord).toEqual(approved.approvalRecord);
  });

  it("rejects blank approver names", () => {
    expect(() => approveUseCase(demoUseCase, "  ")).toThrow("approver");
  });
});
