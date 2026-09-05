import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { createRehearsalState, type DecisionTraceEntry } from "../rehearsal/rehearsalReducer";
import { deriveLearningReview } from "./coachingEngine";

const bundle = compileApprovedTrainingModule(approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"), contractTrainingContent);
const trace = (action: string, task: DecisionTraceEntry["task"], sequence: number): DecisionTraceEntry => ({ id: `trace-${sequence}`, action, task, occurredAtSequence: sequence, sourceRefIds: ["material-redline-rule"], safe: true });

describe("deriveLearningReview", () => {
  it("marks first-attempt observed work as completed independently", () => {
    const state = { ...createRehearsalState("guided"), task: "complete" as const, trace: [trace("finding_corrected", "verify_findings", 1), trace("clause_opened", "compare_clauses", 2), trace("rule_opened", "apply_playbook", 3), trace("route_accepted", "choose_route", 4), trace("audit_opened", "inspect_audit", 5)], sequence: 5 };
    const result = deriveLearningReview(state, bundle.coaching);
    expect(result.dimensions.ai_output_verification.state).toBe("completed_independently");
    expect(result.rehearsalComplete).toBe(true);
  });

  it("returns a source-linked repair for an unopened material clause", () => {
    const state = { ...createRehearsalState("guided"), trace: [trace("finding_corrected", "verify_findings", 1)], sequence: 1 };
    const result = deriveLearningReview(state, bundle.coaching);
    expect(result.dimensions.clause_comparison).toMatchObject({ state: "revisit_step", repairTask: "compare_clauses", sourceRefIds: ["approved-template-2026-2", "material-redline-rule"] });
  });

  it("recognises successful work completed after guidance", () => {
    const state = { ...createRehearsalState("guided"), trace: [trace("hint_used", "verify_findings", 1), trace("finding_corrected", "verify_findings", 2)], sequence: 2, hintCounts: { verify_findings: 1 } };
    expect(deriveLearningReview(state, bundle.coaching).dimensions.ai_output_verification.state).toBe("completed_with_guidance");
  });
});
