import type { ContractScenario, PlaybookFacts, Route } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import { evaluateRoute, type RouteDecision } from "../compiler/routeEngine";

export type RehearsalTask = "intake" | "run_ai_review" | "verify_findings" | "compare_clauses" | "apply_playbook" | "choose_route" | "inspect_audit" | "complete";
export type LearningState = "completed_independently" | "completed_with_guidance" | "revisit_step";
export interface DecisionTraceEntry { id: string; action: string; task: RehearsalTask; occurredAtSequence: number; sourceRefIds: string[]; safe: boolean; }
export interface FindingResolution { status: "confirmed" | "corrected"; value: string | number | boolean; }
export interface RehearsalState {
  mode: "guided" | "solo";
  task: RehearsalTask;
  findingResolutions: Record<string, FindingResolution>;
  openedClauseIds: string[];
  openedRuleIds: string[];
  selectedRoute?: Route;
  routeRationale: string;
  routeDecision?: RouteDecision;
  repairTask?: RehearsalTask;
  hintCounts: Partial<Record<RehearsalTask, number>>;
  trace: DecisionTraceEntry[];
  sequence: number;
  attempts: number;
}
export type RehearsalAction =
  | { type: "OPEN_INPUT" }
  | { type: "RUN_AI_REVIEW" }
  | { type: "OPEN_FINDING"; findingId: string }
  | { type: "SUBMIT_FINDING_VALUE"; findingId: string; value: string | number | boolean }
  | { type: "OPEN_CLAUSE"; clauseId: string }
  | { type: "OPEN_RULE"; ruleId: string }
  | { type: "SELECT_ROUTE"; route: Route }
  | { type: "SET_ROUTE_RATIONALE"; rationale: string }
  | { type: "SUBMIT_ROUTE" }
  | { type: "USE_HINT"; task?: RehearsalTask }
  | { type: "COMPLETE_REPAIR" }
  | { type: "OPEN_AUDIT" }
  | { type: "RESET" };

export function createRehearsalState(mode: "guided" | "solo"): RehearsalState {
  return { mode, task: "intake", findingResolutions: {}, openedClauseIds: [], openedRuleIds: [], routeRationale: "", hintCounts: {}, trace: [], sequence: 0, attempts: 0 };
}
function scenarioFor(bundle: CompiledLawfloBundle, mode: RehearsalState["mode"]): ContractScenario {
  if (mode === "solo") {
    if (!bundle.moduleContent.soloReplayScenario) throw new Error("No approved solo replay is available.");
    return bundle.moduleContent.soloReplayScenario;
  }
  return bundle.rehearsal.scenario;
}
function append(state: RehearsalState, action: string, task: RehearsalTask, sourceRefIds: string[], safe: boolean): RehearsalState {
  const sequence = state.sequence + 1;
  return { ...state, sequence, trace: [...state.trace, { id: `trace-${sequence}`, action, task, occurredAtSequence: sequence, sourceRefIds: [...sourceRefIds], safe }] };
}
function sameValue(left: unknown, right: unknown): boolean { return left === right; }
function focusFindings(scenario: ContractScenario) {
  return scenario.aiFindings.filter((finding) => !sameValue(finding.proposedValue, finding.verifiedValue));
}
function incompleteRepair(state: RehearsalState, scenario: ContractScenario, bundle: CompiledLawfloBundle): RehearsalTask | undefined {
  const incorrect = focusFindings(scenario).some((finding) => !state.findingResolutions[finding.id] || !sameValue(state.findingResolutions[finding.id].value, finding.verifiedValue));
  if (incorrect) return "verify_findings";
  const changed = scenario.clauses.filter((clause) => clause.materiallyChanged);
  if (changed.some((clause) => !state.openedClauseIds.includes(clause.id))) return "compare_clauses";
  const expectedDecision = buildDecision(state, scenario, bundle);
  if (expectedDecision.matchedRuleIds.some((id) => !state.openedRuleIds.includes(id))) return "apply_playbook";
  if (state.selectedRoute !== expectedDecision.route) return "choose_route";
  if ((state.routeRationale ?? "").trim().length < 24) return "choose_route";
  return undefined;
}
function buildDecision(state: RehearsalState, scenario: ContractScenario, bundle: CompiledLawfloBundle): RouteDecision {
  const verifiedFacts: Partial<PlaybookFacts> = {};
  for (const finding of scenario.aiFindings) {
    const resolution = state.findingResolutions[finding.id];
    if (resolution) Object.assign(verifiedFacts, { [finding.field]: resolution.value });
  }
  return evaluateRoute({ useCase: bundle.useCase, verifiedFacts, unresolvedMaterialFindingIds: focusFindings(scenario).filter((finding) => !state.findingResolutions[finding.id]).map((finding) => finding.id) });
}

export function rehearsalReducer(state: RehearsalState, action: RehearsalAction, bundle: CompiledLawfloBundle): RehearsalState {
  const scenario = scenarioFor(bundle, state.mode);
  switch (action.type) {
    case "OPEN_INPUT": return append({ ...state, task: "run_ai_review" }, "input_opened", "intake", scenario.clauses.flatMap((item) => item.sourceRefIds), true);
    case "RUN_AI_REVIEW": return append({ ...state, task: "verify_findings" }, "ai_review_run", "run_ai_review", bundle.aiAnalysis.sourceRefIds, true);
    case "OPEN_FINDING": {
      const finding = scenario.aiFindings.find((item) => item.id === action.findingId); if (!finding) return state;
      return append(state, "finding_opened", "verify_findings", finding.sourceRefIds, true);
    }
    case "SUBMIT_FINDING_VALUE": {
      const finding = scenario.aiFindings.find((item) => item.id === action.findingId); if (!finding) return state;
      if (!state.openedClauseIds.includes(finding.sourceClauseId)) {
        return append(state, "finding_value_blocked", "verify_findings", finding.sourceRefIds, false);
      }
      if (!sameValue(action.value, finding.verifiedValue)) {
        return append({ ...state, attempts: state.attempts + 1 }, "finding_value_rejected", "verify_findings", finding.sourceRefIds, false);
      }
      const corrected = !sameValue(finding.proposedValue, finding.verifiedValue);
      const findingResolutions = { ...state.findingResolutions, [finding.id]: { status: corrected ? "corrected" as const : "confirmed" as const, value: action.value } };
      const allResolved = focusFindings(scenario).every((item) => Boolean(findingResolutions[item.id]));
      const comparisonAlreadyOpened = state.openedClauseIds.includes(finding.sourceClauseId);
      const nextTask = allResolved ? (comparisonAlreadyOpened ? "apply_playbook" : "compare_clauses") : "verify_findings";
      return append({ ...state, findingResolutions, task: nextTask }, corrected ? "finding_corrected" : "finding_confirmed", "verify_findings", finding.sourceRefIds, true);
    }
    case "OPEN_CLAUSE": {
      const clause = scenario.clauses.find((item) => item.id === action.clauseId); if (!clause) return state;
      const nextTask = state.task === "compare_clauses" ? "apply_playbook" : state.task;
      return append({ ...state, openedClauseIds: [...new Set([...state.openedClauseIds, clause.id])], task: nextTask }, "clause_opened", state.task === "verify_findings" ? "verify_findings" : "compare_clauses", clause.sourceRefIds, true);
    }
    case "OPEN_RULE": {
      const rule = bundle.useCase.playbookRules.find((item) => item.id === action.ruleId); if (!rule) return state;
      return append({ ...state, openedRuleIds: [...new Set([...state.openedRuleIds, rule.id])], task: "choose_route" }, "rule_opened", "apply_playbook", rule.sourceRefIds, true);
    }
    case "SELECT_ROUTE": return append({ ...state, selectedRoute: action.route, task: "choose_route" }, "route_selected", "choose_route", ["renewal-routing-playbook"], true);
    case "SET_ROUTE_RATIONALE": return { ...state, routeRationale: action.rationale };
    case "SUBMIT_ROUTE": {
      const routeDecision = buildDecision(state, scenario, bundle);
      const repairTask = incompleteRepair(state, scenario, bundle);
      if (repairTask) return append({ ...state, routeDecision, repairTask, task: repairTask, attempts: state.attempts + 1 }, "route_rejected", "choose_route", routeDecision.sourceRefIds, false);
      return append({ ...state, routeDecision, repairTask: undefined, task: "inspect_audit", attempts: state.attempts + 1 }, "route_accepted", "choose_route", routeDecision.sourceRefIds, true);
    }
    case "USE_HINT": {
      const task = action.task ?? state.task;
      return append({ ...state, hintCounts: { ...state.hintCounts, [task]: (state.hintCounts[task] ?? 0) + 1 } }, "hint_used", task, ["ai-verification-policy"], true);
    }
    case "COMPLETE_REPAIR": {
      if (!state.repairTask) return state;
      const remaining = incompleteRepair(state, scenario, bundle);
      return append({ ...state, repairTask: remaining, task: remaining ?? "choose_route" }, remaining ? "repair_continues" : "repair_completed", state.repairTask, ["human-responsibility"], !remaining);
    }
    case "OPEN_AUDIT":
      if (state.task !== "inspect_audit") return state;
      return append({ ...state, task: "complete" }, "audit_opened", "inspect_audit", state.routeDecision?.sourceRefIds ?? [], true);
    case "RESET": return createRehearsalState(state.mode);
  }
}
