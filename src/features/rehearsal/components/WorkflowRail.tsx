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
  verify_findings: ["Open one AI finding, then compare its supporting clause before entering your own value.", "Check the liability clause closely: low contract value does not neutralise a material wording change."],
  compare_clauses: ["Compare the approved standard with the submitted wording side by side.", "Focus on whether the liability cap remains in the submitted version."],
  apply_playbook: ["Open the highest-priority rule that matches the verified facts.", "A material standard-term change outranks the low-value shortcut."],
  choose_route: ["Choose a route and explain which verified fact and rule support it.", "Name the changed clause and the playbook rule in your rationale."],
  inspect_audit: ["Open the audit trail to inspect the actions LAWFLO actually observed.", "Check that source openings, corrections and the route are present."],
  complete: ["This rehearsal is complete.", "Use the workflow guide at the point of work."],
};

export function WorkflowRail({ state, onHint }: { state: RehearsalState; onHint: () => void }) {
  return <aside className="matter__rail"><span className="matter__eyebrow">Guided matter</span><h2>Review path</h2>
    <ol>{tasks.map((task, index) => <li key={task.label} className={task.ids.includes(state.repairTask ?? state.task) ? "is-current" : ""}><span>{index + 1}</span>{task.label}</li>)}</ol>
    {state.mode === "guided" && <button type="button" onClick={onHint}>Show a focused hint</button>}
    {(state.hintCounts[state.repairTask ?? state.task] ?? 0) > 0 && <section className="matter__hint" role="status" aria-label="Focused guidance"><strong>Focused guidance</strong><p>{hints[state.repairTask ?? state.task][Math.min((state.hintCounts[state.repairTask ?? state.task] ?? 1) - 1, 1)]}</p></section>}
  </aside>;
}
