import type { AiFinding, ContractScenario } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import type { DecisionTraceEntry, RehearsalState, RehearsalTask } from "./rehearsalReducer";

export function currentObjective(state: RehearsalState): RehearsalTask { return state.repairTask ?? state.task; }
export function unresolvedMaterialFindings(state: RehearsalState, scenario: ContractScenario): AiFinding[] { return scenario.aiFindings.filter((finding) => finding.material && !state.findingResolutions[finding.id]); }
export function canCompleteRoute(state: RehearsalState, bundle: CompiledLawfloBundle): boolean {
  const decision = state.routeDecision;
  const expectedRoute = state.mode === "solo"
    ? bundle.moduleContent.soloReplayScenario?.expectedRoute
    : bundle.rehearsal.scenario.expectedRoute;
  return state.task === "inspect_audit" && decision !== undefined && decision.route === state.selectedRoute && decision.route === expectedRoute;
}
export function auditEntries(state: RehearsalState): DecisionTraceEntry[] { return state.trace.map((entry) => ({ ...entry, sourceRefIds: [...entry.sourceRefIds] })); }
