import type { RehearsalState, RehearsalTask } from "../rehearsalReducer";

const tasks: Array<{ ids: RehearsalTask[]; label: string }> = [
  { ids: ["intake"], label: "Open matter" },
  { ids: ["run_ai_review"], label: "Run legal AI" },
  { ids: ["verify_findings", "compare_clauses"], label: "Verify the exception" },
  { ids: ["apply_playbook", "choose_route"], label: "Apply rule & route" },
  { ids: ["inspect_audit", "complete"], label: "Review audit" },
];
const hints: Record<RehearsalTask, [string, string]> = {
  intake: ["Open the Northstar matter to inspect the submitted agreement.", "Start with the intake record before relying on any AI output."],
  run_ai_review: ["Run the authorised AI review to create a draft set of findings.", "The review is a starting point, not a legal conclusion."],
  verify_findings: ["Open the AI finding, then compare its supporting clause before recording what the agreement shows.", "Check the liability clause closely: low contract value does not neutralise a material wording change."],
  compare_clauses: ["Compare the approved standard with the submitted wording side by side.", "Focus on whether the liability cap remains in the submitted version."],
  apply_playbook: ["Open the highest-priority rule that matches the verified facts.", "A material standard-term change outranks the low-value shortcut."],
  choose_route: ["Choose the route supported by the verified fact and controlling rule.", "The removed liability cap makes legal review the safe route."],
  inspect_audit: ["Open the audit trail to inspect the actions LAWFLO actually observed.", "Check that source openings, corrections and the route are present."],
  complete: ["This rehearsal is complete.", "Use the workflow guide at the point of work."],
};

const coachCopy: Record<RehearsalTask, { action: string; reason: string }> = {
  intake: { action: "Open the renewal matter.", reason: "Start with the source record, not an AI conclusion." },
  run_ai_review: { action: "Run the authorised legal AI review.", reason: "AI creates a draft analysis for you to verify." },
  verify_findings: { action: "Inspect the material-redline finding.", reason: "A plausible AI output can still miss a changed clause." },
  compare_clauses: { action: "Compare the submitted wording with the standard.", reason: "The contract—not the model—controls the verified fact." },
  apply_playbook: { action: "Open the controlling material-redline rule.", reason: "Firm policy turns verified facts into a safe route." },
  choose_route: { action: "Choose the route supported by the rule.", reason: "The decision must remain explainable and reviewable." },
  inspect_audit: { action: "Inspect the recorded decision trail.", reason: "Safe adoption requires evidence of how the route was reached." },
  complete: { action: "Rehearsal complete.", reason: "You corrected the AI miss and applied the firm workflow safely." },
};

export function WorkflowRail({ state, onHint }: { state: RehearsalState; onHint: () => void }) {
  const activeTask = state.repairTask ?? state.task;
  return <aside className="matter__rail" aria-label="Workflow coach"><span className="matter__eyebrow">Workflow coach</span><h2>{coachCopy[activeTask].action}</h2>
    <div className="matter__coach-copy"><span>Why this matters</span><p>{coachCopy[activeTask].reason}</p></div>
    <ol>{tasks.map((task, index) => <li key={task.label} className={task.ids.includes(state.repairTask ?? state.task) ? "is-current" : ""}><span>{index + 1}</span>{task.label}</li>)}</ol>
    {state.mode === "guided" && <button className="matter__hint-button" type="button" onClick={onHint}>Show a focused hint</button>}
    {(state.hintCounts[state.repairTask ?? state.task] ?? 0) > 0 && <section className="matter__hint" role="status" aria-label="Focused guidance"><strong>Focused guidance</strong><p>{hints[state.repairTask ?? state.task][Math.min((state.hintCounts[state.repairTask ?? state.task] ?? 1) - 1, 1)]}</p></section>}
  </aside>;
}
