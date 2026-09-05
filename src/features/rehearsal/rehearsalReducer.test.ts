import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { createRehearsalState, rehearsalReducer } from "./rehearsalReducer";

const bundle = compileApprovedTrainingModule(approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"), contractTrainingContent);
const reduce = (state: ReturnType<typeof createRehearsalState>, action: Parameters<typeof rehearsalReducer>[1]) => rehearsalReducer(state, action, bundle);

describe("rehearsalReducer", () => {
  it("observes an unsafe early routing attempt and enters focused repair", () => {
    let state = createRehearsalState("guided");
    state = reduce(state, { type: "OPEN_INPUT" });
    state = reduce(state, { type: "RUN_AI_REVIEW" });
    state = reduce(state, { type: "SELECT_ROUTE", route: "business_approval" });
    state = reduce(state, { type: "SUBMIT_ROUTE" });
    expect(state.repairTask).toBe("verify_findings");
    expect(state.task).not.toBe("complete");
    expect(state.trace.at(-1)).toMatchObject({ action: "route_rejected", safe: false });
  });

  it("cannot complete with an uncorrected material AI miss", () => {
    let state = createRehearsalState("guided");
    state = reduce(state, { type: "OPEN_INPUT" });
    state = reduce(state, { type: "RUN_AI_REVIEW" });
    for (const finding of bundle.rehearsal.scenario.aiFindings) state = reduce(state, { type: "CONFIRM_FINDING", findingId: finding.id });
    state = reduce(state, { type: "OPEN_CLAUSE", clauseId: "liability" });
    state = reduce(state, { type: "OPEN_RULE", ruleId: "material-redline-review" });
    state = reduce(state, { type: "SELECT_ROUTE", route: "business_approval" });
    state = reduce(state, { type: "SUBMIT_ROUTE" });
    expect(state.repairTask).toBe("verify_findings");
    expect(state.routeDecision?.route).toBe("business_approval");
  });

  it("completes only after correcting the finding and opening the clause and matched rule", () => {
    let state = createRehearsalState("guided");
    state = reduce(state, { type: "OPEN_INPUT" });
    state = reduce(state, { type: "RUN_AI_REVIEW" });
    for (const finding of bundle.rehearsal.scenario.aiFindings) {
      state = reduce(state, finding.id === "guided-material-redline" ? { type: "CORRECT_FINDING", findingId: finding.id } : { type: "CONFIRM_FINDING", findingId: finding.id });
    }
    state = reduce(state, { type: "SELECT_ROUTE", route: "legal_review" });
    state = reduce(state, { type: "SUBMIT_ROUTE" });
    expect(state.repairTask).toBe("compare_clauses");
    state = reduce(state, { type: "OPEN_CLAUSE", clauseId: "liability" });
    state = reduce(state, { type: "OPEN_RULE", ruleId: "material-redline-review" });
    state = reduce(state, { type: "COMPLETE_REPAIR" });
    state = reduce(state, { type: "SUBMIT_ROUTE" });
    expect(state.task).toBe("inspect_audit");
    state = reduce(state, { type: "OPEN_AUDIT" });
    expect(state.task).toBe("complete");
  });

  it("applies the same safety invariant in solo mode", () => {
    const state = rehearsalReducer(createRehearsalState("solo"), { type: "SELECT_ROUTE", route: "business_approval" }, bundle);
    expect(rehearsalReducer(state, { type: "SUBMIT_ROUTE" }, bundle).task).not.toBe("complete");
  });
});
