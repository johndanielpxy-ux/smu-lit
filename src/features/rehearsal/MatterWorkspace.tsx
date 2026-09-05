import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AiFinding, Route } from "../../domain/mattershift";
import type { MatterShiftEventReporter } from "../../domain/integration";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import type { JourneyScope } from "../journey/journeyReducer";
import { AiReviewPanel } from "./components/AiReviewPanel";
import { ContractPane } from "./components/ContractPane";
import { RoutingPanel } from "./components/RoutingPanel";
import { VerificationPanel } from "./components/VerificationPanel";
import { WorkflowRail } from "./components/WorkflowRail";
import { createRehearsalState, rehearsalReducer, type RehearsalAction } from "./rehearsalReducer";
import { loadRehearsal, saveRehearsal } from "./rehearsalStorage";
import "./rehearsal.css";

export interface MatterWorkspaceProps { bundle: CompiledLawfloBundle; mode: "guided" | "solo"; onEvent: MatterShiftEventReporter; onComplete: () => void; }
function scopeOf(bundle: CompiledLawfloBundle, mode: "guided" | "solo"): JourneyScope {
  const scenario = mode === "solo" ? bundle.moduleContent.soloReplayScenario : bundle.rehearsal.scenario;
  if (!scenario) throw new Error("No approved solo replay is available.");
  return { bundleId: bundle.manifest.bundleId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint };
}

export function MatterWorkspace({ bundle, mode, onEvent, onComplete }: MatterWorkspaceProps) {
  const scope = useMemo(() => scopeOf(bundle, mode), [bundle, mode]);
  const scenario = mode === "solo" ? bundle.moduleContent.soloReplayScenario! : bundle.rehearsal.scenario;
  const [state, dispatch] = useReducer((current: ReturnType<typeof createRehearsalState>, action: RehearsalAction) => rehearsalReducer(current, action, bundle), mode, (currentMode) => loadRehearsal(scope) ?? createRehearsalState(currentMode));
  const [selectedFinding, setSelectedFinding] = useState<AiFinding>();
  const [selectedClauseId, setSelectedClauseId] = useState<string>();
  const completed = useRef(false);
  const reviewRun = state.trace.some((entry) => entry.action === "ai_review_run");
  useEffect(() => saveRehearsal(scope, state), [scope, state]);
  useEffect(() => { onEvent(mode === "solo" ? "solo_replay_started" : "rehearsal_started", { scenarioId: scenario.id }, { idempotencyKey: `${bundle.manifest.bundleId}:${scenario.id}:started` }); }, [bundle.manifest.bundleId, mode, onEvent, scenario.id]);
  useEffect(() => { if (state.task === "complete" && !completed.current) { completed.current = true; onEvent("rehearsal_completed", { scenarioId: scenario.id, mode }); onComplete(); } }, [mode, onComplete, onEvent, scenario.id, state.task]);

  const run = () => { dispatch({ type: "RUN_AI_REVIEW" }); onEvent("ai_analysis_opened", { analysisId: bundle.aiAnalysis.id }); };
  const resolve = (finding: AiFinding, correct: boolean) => { dispatch({ type: correct ? "CORRECT_FINDING" : "CONFIRM_FINDING", findingId: finding.id }); onEvent("ai_finding_resolved", { findingId: finding.id, resolution: correct ? "corrected" : "confirmed" }); };
  const openRule = (ruleId: string) => { dispatch({ type: "OPEN_RULE", ruleId }); onEvent("playbook_rule_opened", { ruleId }); };
  const selectRoute = (route: Route) => { dispatch({ type: "SELECT_ROUTE", route }); onEvent("route_selected", { route }); };
  const repairCopy: Partial<Record<NonNullable<typeof state.repairTask>, string>> = { verify_findings: "Verify the material AI findings against the agreement.", compare_clauses: "Open the changed clause and compare both versions.", apply_playbook: "Open the matched playbook rule before relying on it.", choose_route: "Choose the route produced by the verified facts." };

  return <main className="matter">
    <div className="matter__mobile" role="note"><strong>Desktop rehearsal</strong><span>Open LAWFLO on a screen at least 900px wide to use the simulated legal workspace.</span></div>
    <header className="matter__top"><div><span className="matter__eyebrow">LAWFLO · {mode === "solo" ? "Solo replay" : "Guided rehearsal"}</span><h1>{scenario.contractName}</h1></div><div className="matter__matter-id">MATTER 26—0417 <span>Local simulation</span></div></header>
    <div className="matter__desktop">
      <div className="matter__grid">
        <WorkflowRail state={state} onHint={() => dispatch({ type: "USE_HINT" })} />
        <ContractPane scenario={scenario} selectedClause={scenario.clauses.find((item) => item.id === selectedClauseId)} onOpenClause={(clauseId) => { setSelectedClauseId(clauseId); dispatch({ type: "OPEN_CLAUSE", clauseId }); onEvent("source_opened", { clauseId }); }} />
        <div className="matter__right"><AiReviewPanel findings={scenario.aiFindings} resolutions={state.findingResolutions} reviewRun={reviewRun} onRun={run} onOpen={(finding) => { setSelectedFinding(finding); dispatch({ type: "OPEN_FINDING", findingId: finding.id }); }} onResolve={resolve} /><VerificationPanel finding={selectedFinding} /></div>
      </div>
      <RoutingPanel rules={bundle.useCase.playbookRules} state={state} onOpenRule={openRule} onSelect={selectRoute} onSubmit={() => dispatch({ type: "SUBMIT_ROUTE" })} />
      <footer className="matter__coach" aria-live="polite">
        {state.repairTask ? <div role="status"><strong>Focused repair</strong><span>{repairCopy[state.repairTask]}</span><button type="button" aria-label="Open AI verification policy source" onClick={() => onEvent("source_opened", { sourceRefId: "ai-verification-policy" })}>Open source</button>{state.repairTask !== "verify_findings" && <button type="button" onClick={() => { dispatch({ type: "COMPLETE_REPAIR" }); onEvent("repair_completed", { task: state.repairTask! }); }}>Continue repair</button>}</div> : state.task === "intake" ? <button className="matter__primary" type="button" onClick={() => dispatch({ type: "OPEN_INPUT" })}>Open Northstar matter</button> : state.task === "inspect_audit" ? <button className="matter__primary" type="button" onClick={() => dispatch({ type: "OPEN_AUDIT" })}>Inspect audit trail</button> : state.task === "complete" ? <div className="matter__complete"><strong>Rehearsal complete</strong><span>You verified the AI miss and routed with an auditable legal reason.</span></div> : <span>Current objective: {state.task.replaceAll("_", " ")}</span>}
      </footer>
    </div>
  </main>;
}
