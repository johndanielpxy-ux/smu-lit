import type { RehearsalState, RehearsalTask } from "../rehearsalReducer";

const tasks: Array<{ id: RehearsalTask; label: string }> = [
  { id: "intake", label: "Open matter" }, { id: "run_ai_review", label: "Run AI review" },
  { id: "verify_findings", label: "Verify findings" }, { id: "compare_clauses", label: "Compare clauses" },
  { id: "apply_playbook", label: "Apply playbook" }, { id: "choose_route", label: "Choose route" },
  { id: "inspect_audit", label: "Inspect audit" },
];

export function WorkflowRail({ state, onHint }: { state: RehearsalState; onHint: () => void }) {
  return <aside className="matter__rail"><span className="matter__eyebrow">Guided matter</span><h2>Review path</h2>
    <ol>{tasks.map((task, index) => <li key={task.id} className={state.task === task.id || state.repairTask === task.id ? "is-current" : ""}><span>{index + 1}</span>{task.label}</li>)}</ol>
    {state.mode === "guided" && <button type="button" onClick={onHint}>Show a focused hint</button>}
  </aside>;
}
