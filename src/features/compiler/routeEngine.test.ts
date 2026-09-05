import { describe, expect, it } from "vitest";
import { demoUseCase } from "../../demo/demoUseCase";
import { evaluateRoute } from "./routeEngine";

const lowRiskFacts = {
  contractValue: 42_000,
  templateVersion: "2026.2",
  materialRedline: false,
  personalData: false,
  governingLaw: "Singapore",
} as const;

describe("evaluateRoute", () => {
  it("escalates a low-value renewal with a material redline", () => {
    const result = evaluateRoute({
      useCase: demoUseCase,
      verifiedFacts: { ...lowRiskFacts, materialRedline: true },
      unresolvedMaterialFindingIds: [],
    });

    expect(result.route).toBe("legal_review");
    expect(result.matchedRuleIds).toContain("material-redline-review");
    expect(result.sourceRefIds).toContain("material-redline-rule");
  });

  it("requires verification before returning a low-risk route", () => {
    const result = evaluateRoute({
      useCase: demoUseCase,
      verifiedFacts: lowRiskFacts,
      unresolvedMaterialFindingIds: ["guided-material-redline"],
    });

    expect(result.route).toBe("legal_review");
    expect(result.reasonCode).toBe("UNVERIFIED_MATERIAL_AI_FINDING");
  });

  it("fails closed when a material fact is missing", () => {
    const { governingLaw: _governingLaw, ...incompleteFacts } = lowRiskFacts;

    expect(
      evaluateRoute({
        useCase: demoUseCase,
        verifiedFacts: incompleteFacts,
        unresolvedMaterialFindingIds: [],
      }),
    ).toMatchObject({ route: "legal_review", reasonCode: "AMBIGUOUS_FACTS" });
  });

  it("returns the highest-priority matching playbook route", () => {
    const result = evaluateRoute({
      useCase: demoUseCase,
      verifiedFacts: lowRiskFacts,
      unresolvedMaterialFindingIds: [],
    });

    expect(result).toMatchObject({
      route: "business_approval",
      reasonCode: "PLAYBOOK_MATCH",
      matchedRuleIds: ["low-value-business-approval"],
    });
  });
});
