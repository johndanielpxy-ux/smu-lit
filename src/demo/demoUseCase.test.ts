import { describe, expect, it } from "vitest";
import { validateUseCase } from "../domain/mattershift";
import { demoUseCase } from "./demoUseCase";

describe("demoUseCase", () => {
  it("is a valid source-linked use case", () => {
    expect(validateUseCase(demoUseCase)).toEqual({ valid: true, errors: [] });
  });

  it("uses only synthetic identities and begins in draft", () => {
    expect(demoUseCase.contributorName).toBe("Maya Tan");
    expect(demoUseCase.approvalStatus).toBe("draft");
    expect(demoUseCase.consentConfirmed).toBe(true);
  });

  it("contains the complete six-step cross-tool workflow", () => {
    expect(demoUseCase.steps).toHaveLength(6);
    expect(demoUseCase.approvedTools).toContain("Firm-authorised legal AI");
    expect(demoUseCase.steps.every((step) => step.sourceRefIds.length > 0)).toBe(
      true,
    );
  });
});
