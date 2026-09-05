import { describe, expect, it } from "vitest";
import { validateUseCase } from "../domain/mattershift";
import { demoUseCase } from "./demoUseCase";

describe("demoUseCase", () => {
  it("is a valid contract-review legal AI workflow", () => {
    expect(validateUseCase(demoUseCase)).toEqual({ valid: true, errors: [] });
    expect(demoUseCase.id).toBe("ai-assisted-sales-renewal-review");
    expect(demoUseCase.aiOperations.map((operation) => operation.task)).toEqual([
      "extract",
      "compare",
      "classify",
    ]);
  });

  it("uses only synthetic identities and begins in draft", () => {
    expect(demoUseCase.contributorName).toBe("Maya Tan");
    expect(demoUseCase.approvalStatus).toBe("draft");
    expect(demoUseCase.consentConfirmed).toBe(true);
  });

  it("binds guided and solo scenarios into the approval material", () => {
    expect(demoUseCase.scenarioRefs).toEqual([
      expect.objectContaining({ mode: "guided", scenarioVersion: "1.0" }),
      expect.objectContaining({ mode: "solo_replay", scenarioVersion: "1.0" }),
    ]);
    expect(
      demoUseCase.scenarioRefs.every((scenario) =>
        /^scenario-[0-9a-f]{8}$/.test(scenario.contentFingerprint),
      ),
    ).toBe(true);
  });
});
