import { describe, expect, it } from "vitest";
import { validateUseCase } from "../../domain/mattershift";
import { compileUseCase, type CompilerInput } from "./compiler";

const input: CompilerInput = {
  contributorName: "Aisha Lim",
  contributorRole: "Legal Engineer",
  targetRole: "Corporate associates",
  practiceGroup: "Corporate and Commercial",
  workTrigger: "A client-team meeting ends",
  problem: "Follow-up work is fragmented",
  expectedOutcome: "A verified client-team update",
  consentConfirmed: true,
  sourceText: "Synthetic Responsible AI Policy v1.0",
};

describe("compileUseCase", () => {
  it("returns a valid deterministic use case using submitted context", async () => {
    const result = await compileUseCase(input);

    expect(validateUseCase(result).valid).toBe(true);
    expect(result.contributorName).toBe("Aisha Lim");
    expect(result.contributorRole).toBe("Legal Engineer");
    expect(result.targetRole).toBe("Corporate associates");
    expect(result.practiceGroup).toBe("Corporate and Commercial");
    expect(result.approvalStatus).toBe("draft");
  });

  it("rejects compilation without consent", async () => {
    await expect(
      compileUseCase({ ...input, consentConfirmed: false }),
    ).rejects.toThrow("consent");
  });

  it("rejects empty required fields", async () => {
    await expect(
      compileUseCase({ ...input, contributorName: "" }),
    ).rejects.toThrow("contributorName");
  });
});
