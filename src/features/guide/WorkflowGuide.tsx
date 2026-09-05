import { useEffect, useRef } from "react";
import type { MatterShiftEventReporter } from "../../domain/integration";
import type { CoachingDimension, CompiledLawfloBundle } from "../compiler/bundleCompiler";
import type { LearningReviewResult } from "../coaching/coachingEngine";
import "./guide.css";

const dimensionLabels: Record<CoachingDimension, string> = { ai_output_verification: "Verify the AI draft", clause_comparison: "Compare changed clauses", playbook_application: "Apply the current playbook", risk_reasoning: "Explain the risk route", human_responsibility: "Make the human decision", audit_completeness: "Preserve the audit trail" };
export function WorkflowGuide({ bundle, review, onEvent, onStartSoloReplay }: { bundle: CompiledLawfloBundle; review: LearningReviewResult; onEvent: MatterShiftEventReporter; onStartSoloReplay: () => void }) {
  const opened = useRef(false);
  useEffect(() => { if (!opened.current) { opened.current = true; onEvent("workflow_guide_opened", { guideId: bundle.workflowGuide.id }, { idempotencyKey: `${bundle.workflowGuide.id}:opened` }); } }, [bundle.workflowGuide.id, onEvent]);
  const watch = (Object.entries(review.dimensions) as Array<[CoachingDimension, LearningReviewResult["dimensions"][CoachingDimension]]>).filter(([, item]) => item.state === "completed_with_guidance");
  return <main className="workflow-guide"><header><span>LAWFLO · Personal workflow guide</span><h1>{bundle.workflowGuide.title}</h1><p>{bundle.workflowGuide.workTrigger}</p><div><strong>Approved by {bundle.manifest.approvedBy}</strong><small>Source set {bundle.manifest.sourceVersion}</small></div></header>
    <section className="workflow-guide__watch"><span>Personal reinforcement</span><h2>Watch carefully</h2>{watch.length ? <ol>{watch.map(([dimension, item]) => <li key={dimension}><strong>{dimensionLabels[dimension]}</strong><p>{item.explanation}</p></li>)}</ol> : <p>No guided repair was observed in this rehearsal. Keep the core verification sequence beside you.</p>}</section>
    <section><span>At your desk</span><h2>The legal AI sequence</h2><ol className="workflow-guide__steps">{bundle.workflowGuide.legalAiSteps.map((step, index) => <li key={step.workflowStepId}><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{step.title}</h3><p>{step.instruction}</p><small>{step.tool}</small></div></li>)}</ol></section>
    <div className="workflow-guide__columns"><section><span>Before relying</span><h2>Verification checks</h2><ul>{bundle.workflowGuide.verificationChecks.map((check) => <li key={check}>{check}</li>)}</ul></section><section><span>When to stop</span><h2>Escalation conditions</h2><ul>{bundle.workflowGuide.escalationConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul></section></div>
    <section><span>Current authority</span><h2>Source desk</h2><div className="workflow-guide__sources">{bundle.useCase.sources.map((source) => <article key={source.id}><small>Version {source.version}</small><h3>{source.title}</h3><p>{source.excerpt}</p><button type="button" onClick={() => onEvent("source_opened", { sourceRefId: source.id })}>Open source note</button></article>)}</div></section>
    {bundle.moduleContent.soloReplayScenario && <section className="workflow-guide__solo"><div><span>Optional solo replay</span><h2>One more matter, less guidance</h2><p>Try the approved SGD 36,000 Marigold renewal. This time the change sits inside data processing.</p></div><button type="button" onClick={onStartSoloReplay}>Try the Marigold matter</button></section>}
  </main>;
}
