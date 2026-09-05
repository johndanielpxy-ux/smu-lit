import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { getApprovedSoloReplayScenario } from "./soloReplay";

const bundle = compileApprovedTrainingModule(approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"), contractTrainingContent);
describe("getApprovedSoloReplayScenario", () => {
  it("returns an isolated approved SGD 36,000 data-processing variation", () => {
    const scenario = getApprovedSoloReplayScenario(bundle);
    expect(scenario).toMatchObject({ mode: "solo_replay", contractValue: 36_000, expectedRoute: "legal_review" });
    expect(scenario.clauses.some((clause) => clause.id === "solo-data-processing")).toBe(true);
    scenario.contractValue = 1;
    expect(bundle.moduleContent.soloReplayScenario?.contractValue).toBe(36_000);
  });

  it("rejects content changed after module approval", () => {
    const stale = structuredClone(bundle);
    stale.moduleContent.soloReplayScenario!.contractValue = 99;
    expect(() => getApprovedSoloReplayScenario(stale)).toThrow(/approved fingerprint/i);
  });
});
