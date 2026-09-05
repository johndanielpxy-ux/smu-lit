import { describe, expect, it } from "vitest";
import { trainingScenarioFingerprint } from "../domain/approval";
import { contractTrainingContent } from "./contractScenarios";

describe("contractTrainingContent", () => {
  it("contains a deliberately inaccurate material AI finding for guided repair", () => {
    const scenario = contractTrainingContent.guidedScenario;
    const finding = scenario.aiFindings.find(
      (candidate) => candidate.field === "materialRedline",
    );

    expect(scenario.contractValue).toBe(42_000);
    expect(finding).toMatchObject({
      proposedValue: false,
      verifiedValue: true,
      material: true,
    });
    expect(scenario.expectedRoute).toBe("legal_review");
  });

  it("contains a separately fingerprinted approved solo variation", () => {
    const guided = contractTrainingContent.guidedScenario;
    const solo = contractTrainingContent.soloReplayScenario;

    expect(solo).toMatchObject({
      mode: "solo_replay",
      contractValue: 36_000,
      expectedRoute: "legal_review",
    });
    expect(trainingScenarioFingerprint(solo!)).not.toBe(
      trainingScenarioFingerprint(guided),
    );
  });

  it("changes its fingerprint when finding content changes without a version bump", () => {
    const changed = structuredClone(contractTrainingContent.guidedScenario);
    changed.aiFindings[0].proposedValue = 99_999;

    expect(trainingScenarioFingerprint(changed)).not.toBe(
      trainingScenarioFingerprint(contractTrainingContent.guidedScenario),
    );
  });
});
