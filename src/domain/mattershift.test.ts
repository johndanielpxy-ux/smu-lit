import { describe, expect, it } from "vitest";
import {
  validateUseCase,
  type PlaybookRule,
  type UseCase,
} from "./mattershift";

function makeValidUseCase(): UseCase {
  return {
    id: "sales-renewal-review",
    title: "Route a sales renewal safely",
    contributorName: "Maya Tan",
    contributorRole: "Legal Innovation Counsel",
    consentConfirmed: true,
    targetRole: "Commercial lawyers and contract managers",
    practiceGroup: "Commercial",
    workTrigger: "A salesperson submits a renewal for approval",
    problem: "Routine renewals queue for legal review even when risk is low.",
    approvedTools: ["Firm-authorised legal AI", "Contract workflow"],
    steps: [
      {
        id: "verify-ai-findings",
        title: "Verify the AI findings",
        tool: "Firm-authorised legal AI",
        instruction: "Compare every material AI finding with the agreement.",
        sourceRefIds: ["source-playbook"],
        riskLevel: "high",
        humanReviewRequired: true,
      },
    ],
    aiOperations: [
      {
        id: "compare-clauses",
        task: "compare",
        tool: "Firm-authorised legal AI",
        description: "Compare submitted clauses with the approved template.",
        verificationInstruction: "Open each material clause before routing.",
        sourceRefIds: ["source-playbook"],
      },
    ],
    playbookRules: [
      {
        id: "material-redline-review",
        label: "Escalate a material redline",
        field: "materialRedline",
        operator: "eq",
        value: true,
        route: "legal_review",
        priority: 100,
        explanation: "Legal reviews every material standard-term change.",
        sourceRefIds: ["source-playbook"],
      },
    ],
    scenarioRefs: [
      {
        scenarioId: "guided-renewal",
        mode: "guided",
        scenarioVersion: "1.0",
        contentFingerprint: "scenario-12345678",
      },
    ],
    guardrails: [
      {
        id: "human-verification",
        rule: "A human must verify material AI findings.",
        prohibitedAction: "Route from the AI recommendation alone.",
        safeAlternative: "Verify the contract and apply the playbook.",
        sourceRefIds: ["source-playbook"],
      },
    ],
    expectedOutcome: "A source-linked route decision",
    outcomeMetric: "Observed completion of the governed workflow",
    sources: [
      {
        id: "source-playbook",
        title: "Synthetic Contract Review Playbook",
        version: "1.0",
        excerpt: "Material deviations require legal review.",
      },
    ],
    sourceVersion: "1.0",
    approvalStatus: "draft",
  };
}

describe("validateUseCase", () => {
  it("accepts a source-linked legal AI workflow", () => {
    expect(validateUseCase(makeValidUseCase())).toEqual({ valid: true, errors: [] });
  });

  it.each([
    ["consent", (value: UseCase) => ({ ...value, consentConfirmed: false })],
    ["workflow step", (value: UseCase) => ({ ...value, steps: [] })],
    ["guardrail", (value: UseCase) => ({ ...value, guardrails: [] })],
    ["legal AI operation", (value: UseCase) => ({ ...value, aiOperations: [] })],
  ])("rejects a use case missing %s", (_label, mutate) => {
    expect(validateUseCase(mutate(makeValidUseCase())).valid).toBe(false);
  });

  it("rejects an AI operation without a human verification instruction", () => {
    const value = makeValidUseCase();
    value.aiOperations[0].verificationInstruction = "";

    expect(validateUseCase(value).errors).toContain(
      "Legal AI operation compare-clauses requires a human verification instruction.",
    );
  });

  it("rejects duplicate IDs and unresolved source references", () => {
    const value = makeValidUseCase();
    value.aiOperations.push({ ...value.aiOperations[0] });
    value.playbookRules[0].sourceRefIds = ["missing-source"];

    const result = validateUseCase(value);

    expect(result.errors).toContain("Duplicate legal AI operation id: compare-clauses.");
    expect(result.errors).toContain(
      "Playbook rule material-redline-review references missing source missing-source.",
    );
  });

  it("requires a legal-review rule and exactly one guided scenario", () => {
    const value = makeValidUseCase();
    value.playbookRules[0] = { ...value.playbookRules[0], route: "business_approval" };
    value.scenarioRefs[0].mode = "solo_replay";

    const result = validateUseCase(value);

    expect(result.errors).toContain("At least one legal-review playbook rule is required.");
    expect(result.errors).toContain("Exactly one guided training scenario is required.");
  });

  it("requires a named approver for approved or published content", () => {
    const value = makeValidUseCase();
    value.approvalStatus = "human_approved";
    expect(validateUseCase(value).valid).toBe(false);

    value.approvedBy = "Jordan Lee";
    expect(validateUseCase(value).valid).toBe(true);
  });
});

const invalidRule = {
  id: "invalid-threshold",
  label: "Invalid threshold",
  field: "contractValue",
  operator: "lt",
  value: true,
  route: "legal_review",
  priority: 1,
  explanation: "Invalid",
  sourceRefIds: ["source-playbook"],
};
// @ts-expect-error Boolean values are invalid for numeric threshold rules.
const _invalidRuleContract: PlaybookRule = invalidRule;
