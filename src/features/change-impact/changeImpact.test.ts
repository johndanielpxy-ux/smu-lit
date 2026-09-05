import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { assessChangeImpact } from "./changeImpact";

const approved = approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z");
const bundle = compileApprovedTrainingModule(approved, contractTrainingContent);
describe("assessChangeImpact", () => {
  it("invalidates every learner artefact when the material-redline rule changes", () => {
    const changed = structuredClone(approved);
    changed.playbookRules[0].priority = 101;
    changed.sourceVersion = "2026.3";
    const result = assessChangeImpact(approved, changed, bundle);
    expect(result.approvalStillCurrent).toBe(false);
    expect(result.affectedRuleIds).toContain("material-redline-review");
    expect(result.affectedArtifactIds).toEqual(expect.arrayContaining(Object.values(bundle.manifest.artifactIds)));
    expect(result.reasons.join(" ")).toMatch(/reapproval.*regenerat/i);
  });
});
