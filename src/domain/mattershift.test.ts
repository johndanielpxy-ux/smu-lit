import { describe, expect, it } from "vitest";
import {
  validateUseCase,
  type UseCase,
} from "./mattershift";

function makeValidUseCase(): UseCase {
  return {
    id: "meeting-to-update",
    title: "From meeting to verified update",
    contributorName: "Maya Tan",
    contributorRole: "Legal Innovation Counsel",
    consentConfirmed: true,
    targetRole: "Associate",
    practiceGroup: "Disputes",
    workTrigger: "A client-team meeting ends",
    problem: "Follow-up is slow and inconsistent",
    approvedTools: ["Microsoft Teams", "Microsoft Copilot"],
    steps: [
      {
        id: "step-1",
        title: "Open the transcript",
        tool: "Microsoft Teams",
        instruction: "Open the transcript in the authorised environment.",
        sourceRefIds: ["source-authorised-systems"],
        riskLevel: "medium",
        humanReviewRequired: false,
      },
    ],
    guardrails: [
      {
        id: "guardrail-confidentiality",
        rule: "Use only firm-authorised systems.",
        prohibitedAction: "Paste a confidential transcript into public AI.",
        safeAlternative: "Use the authorised system with minimum data.",
        sourceRefIds: ["source-authorised-systems"],
      },
    ],
    expectedOutcome: "A reviewed update",
    outcomeMetric: "Minutes saved per update",
    sources: [
      {
        id: "source-authorised-systems",
        title: "Synthetic Responsible AI Policy",
        version: "1.0",
        excerpt: "Client information may be processed only in approved systems.",
      },
    ],
    sourceVersion: "1.0",
    approvalStatus: "draft",
  };
}

describe("validateUseCase", () => {
  it("accepts a complete draft use case", () => {
    expect(validateUseCase(makeValidUseCase())).toEqual({
      valid: true,
      errors: [],
    });
  });

  it.each([
    ["consent", (value: UseCase) => ({ ...value, consentConfirmed: false })],
    ["workflow step", (value: UseCase) => ({ ...value, steps: [] })],
    ["guardrail", (value: UseCase) => ({ ...value, guardrails: [] })],
  ])("rejects a use case missing %s", (_label, mutate) => {
    const result = validateUseCase(mutate(makeValidUseCase()));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects steps without source references", () => {
    const value = makeValidUseCase();
    value.steps[0].sourceRefIds = [];
    expect(validateUseCase(value).valid).toBe(false);
  });

  it("rejects references to a source that does not exist", () => {
    const value = makeValidUseCase();
    value.steps[0].sourceRefIds = ["missing-source"];
    expect(validateUseCase(value).valid).toBe(false);
  });

  it("requires an approver for approved or published content", () => {
    const value = makeValidUseCase();
    value.approvalStatus = "human_approved";
    expect(validateUseCase(value).valid).toBe(false);

    value.approvedBy = "Jordan Lee";
    expect(validateUseCase(value).valid).toBe(true);
  });
});
