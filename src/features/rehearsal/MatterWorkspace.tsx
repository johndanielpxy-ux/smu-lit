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
  const showAiWorkspace = state.task !== "intake";
  const showRouting = ["apply_playbook", "choose_route", "inspect_audit", "complete"].includes(state.task) || Boolean(state.repairTask);
  useEffect(() => saveRehearsal(scope, state), [scope, state]);
  useEffect(() => { onEvent(mode === "solo" ? "solo_replay_started" : "rehearsal_started", { scenarioId: scenario.id }, { idempotencyKey: `${bundle.manifest.bundleId}:${scenario.id}:started` }); }, [bundle.manifest.bundleId, mode, onEvent, scenario.id]);
  useEffect(() => { if (state.task === "complete" && !completed.current) { completed.current = true; onEvent("rehearsal_completed", { scenarioId: scenario.id, mode }); onComplete(); } }, [mode, onComplete, onEvent, scenario.id, state.task]);

  const run = () => { dispatch({ type: "RUN_AI_REVIEW" }); onEvent("ai_analysis_opened", { analysisId: bundle.aiAnalysis.id }); };
  const submitFinding = (finding: AiFinding, value: string | number | boolean) => {
    const accepted = value === finding.verifiedValue;
    dispatch({ type: "SUBMIT_FINDING_VALUE", findingId: finding.id, value });
    if (accepted) onEvent("ai_finding_resolved", { findingId: finding.id, resolution: value === finding.proposedValue ? "confirmed" : "corrected" });
    return accepted;
  };
  const openClause = (clauseId: string) => { setSelectedClauseId(clauseId); dispatch({ type: "OPEN_CLAUSE", clauseId }); onEvent("source_opened", { clauseId }); };
  const openRule = (ruleId: string) => { dispatch({ type: "OPEN_RULE", ruleId }); onEvent("playbook_rule_opened", { ruleId }); };
  const selectRoute = (route: Route) => { dispatch({ type: "SELECT_ROUTE", route }); onEvent("route_selected", { route }); };
  const repairCopy: Partial<Record<NonNullable<typeof state.repairTask>, string>> = { verify_findings: "Verify the material AI findings against the agreement.", compare_clauses: "Open the changed clause and compare both versions.", apply_playbook: "Open the matched playbook rule before relying on it.", choose_route: "Choose the route produced by the verified facts." };
  const repairSourceId = state.repairTask === "choose_route" || state.repairTask === "apply_playbook" ? "material-redline-rule" : "ai-verification-policy";
  const stepIndex = state.task === "intake" ? 1 : state.task === "run_ai_review" ? 2 : ["verify_findings", "compare_clauses"].includes(state.task) ? 3 : ["apply_playbook", "choose_route"].includes(state.task) ? 4 : 5;

  return <main id="main-content" className="matter">
    <div className="matter__mobile" role="note"><strong>Desktop rehearsal</strong><span>Open LAWFLO on a screen at least 900px wide to use the simulated legal workspace.</span></div>
    <header className="matter__top"><div><span className="matter__eyebrow">{mode === "solo" ? "Solo replay" : "Guided rehearsal"}</span><h1>{scenario.contractName}</h1></div><div className="matter__session"><strong>SAFE SANDBOX</strong><span>Step {stepIndex} of 5</span><i aria-hidden="true"><b style={{ width: `${stepIndex * 20}%` }} /></i></div></header>
    <div className="matter__desktop">
      <div className="matter__simulation">
        <section className="matter__app" aria-label="Simulated legal AI workspace">
          <header className="matter__appbar"><div><span>Northstar / Sales renewal</span><strong>Contract Review AI</strong></div><span>MATTER 26—0417</span></header>
          <div className={`matter__grid ${showAiWorkspace ? "matter__grid--active" : "matter__grid--focused"}`}>
            <ContractPane scenario={scenario} selectedClause={scenario.clauses.find((item) => item.id === selectedClauseId)} onOpenClause={openClause} />
            {showAiWorkspace ? <div className="matter__right"><AiReviewPanel findings={scenario.aiFindings} resolutions={state.findingResolutions} reviewRun={reviewRun} onRun={run} onOpen={(finding) => { setSelectedFinding(finding); dispatch({ type: "OPEN_FINDING", findingId: finding.id }); }} />{reviewRun ? <VerificationPanel finding={selectedFinding} clauseOpened={selectedFinding ? state.openedClauseIds.includes(selectedFinding.sourceClauseId) : false} resolution={selectedFinding ? state.findingResolutions[selectedFinding.id] : undefined} onOpenClause={openClause} onSubmit={submitFinding} /> : null}</div> : null}
          </div>
          {showRouting ? <RoutingPanel rules={bundle.useCase.playbookRules} state={state} onOpenRule={openRule} onSelect={selectRoute} onRationale={(rationale) => dispatch({ type: "SET_ROUTE_RATIONALE", rationale })} onSubmit={() => dispatch({ type: "SUBMIT_ROUTE" })} /> : null}
        </section>
        <div className="matter__guide"><WorkflowRail state={state} onHint={() => dispatch({ type: "USE_HINT" })} /><footer className="matter__coach" aria-live="polite">
        {state.repairTask ? <div role="status"><strong>Focused repair</strong><span>{repairCopy[state.repairTask]}</span><button type="button" aria-label={repairSourceId === "material-redline-rule" ? "Open controlling playbook source" : "Open AI verification policy source"} onClick={() => onEvent("source_opened", { sourceRefId: repairSourceId })}>Open source</button><button type="button" onClick={() => { dispatch({ type: "COMPLETE_REPAIR" }); onEvent("repair_completed", { task: state.repairTask! }); }}>Check repair</button></div> : state.task === "intake" ? <button className="matter__primary" type="button" onClick={() => dispatch({ type: "OPEN_INPUT" })}>Open Northstar matter</button> : state.task === "inspect_audit" ? <button className="matter__primary" type="button" onClick={() => dispatch({ type: "OPEN_AUDIT" })}>Inspect audit trail</button> : state.task === "complete" ? <div className="matter__complete"><strong>Rehearsal complete</strong><span>You verified the AI miss and routed with an auditable legal reason.</span></div> : <span>Current objective: {state.task.replaceAll("_", " ")}</span>}
        </footer></div>
      </div>
    </div>
  </main>;
}
