import type { CoachingDimension } from "../compiler/bundleCompiler";
import type { RehearsalTask } from "../rehearsal/rehearsalReducer";
import type { LearningReviewResult } from "./coachingEngine";
import "./coaching.css";

const labels: Record<CoachingDimension, string> = { ai_output_verification: "AI-output verification", clause_comparison: "Clause comparison", playbook_application: "Playbook application", risk_reasoning: "Risk reasoning", human_responsibility: "Human responsibility", audit_completeness: "Audit trail" };
const stateLabels = { completed_independently: "Handled independently", completed_with_guidance: "Repaired with guidance", revisit_step: "Revisit this step" } as const;
export function LearningReview({ result, onRepair, onOpenGuide, onOpenSource }: { result: LearningReviewResult; onRepair: (task: RehearsalTask) => void; onOpenGuide: () => void; onOpenSource: (sourceId: string) => void }) {
  const entries = Object.entries(result.dimensions) as Array<[CoachingDimension, LearningReviewResult["dimensions"][CoachingDimension]]>;
  const handled = entries.filter(([, item]) => item.state === "completed_independently");
  const repaired = entries.filter(([, item]) => item.state !== "completed_independently");
  return <main id="main-content" className="review-sheet"><header><span>LAWFLO · Learning review</span><h1>Your review, translated into practice</h1><p>This is a constructive record of what you did and where the workflow supported you.</p></header>
    <section><h2>What you handled</h2><div className="review-sheet__grid">{handled.map(([dimension, item]) => <article key={dimension}><small>{stateLabels[item.state]}</small><h3>{labels[dimension]}</h3><p>{item.explanation}</p></article>)}</div></section>
    <section><h2>What we repaired</h2><div className="review-sheet__grid">{repaired.map(([dimension, item]) => <article key={dimension} className={item.state === "revisit_step" ? "needs-revisit" : ""}><small>{stateLabels[item.state]}</small><h3>{labels[dimension]}</h3><p>{item.explanation}</p><div>{item.sourceRefIds.map((sourceId) => <button key={sourceId} type="button" aria-label={`Open ${sourceId} source`} onClick={() => onOpenSource(sourceId)}>{sourceId.replaceAll("-", " ")}</button>)}</div>{item.repairTask && <button className="review-sheet__repair" type="button" aria-label={`Repair ${labels[dimension]}`} onClick={() => onRepair(item.repairTask!)}>Revisit in the matter</button>}</article>)}</div></section>
    <section className="review-sheet__keep"><div><h2>Keep beside you</h2><p>AI output stays a draft until you verify the source material and apply the current playbook.</p></div><button type="button" onClick={onOpenGuide}>Open workflow guide</button></section>
  </main>;
}
