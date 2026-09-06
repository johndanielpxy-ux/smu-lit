import type { PlaybookRule, Route } from "../../../domain/mattershift";
import type { RehearsalState } from "../rehearsalReducer";

const labels: Record<Route, string> = { business_approval: "Business approval", signature: "Signature", legal_review: "Legal review" };
export function RoutingPanel({ rules, state, onOpenRule, onSelect, onRationale, onSubmit }: { rules: PlaybookRule[]; state: RehearsalState; onOpenRule: (id: string) => void; onSelect: (route: Route) => void; onRationale: (rationale: string) => void; onSubmit: () => void }) {
  const canChooseRoute = state.task === "choose_route" || state.task === "inspect_audit" || state.repairTask === "choose_route";
  return <section className="matter__routing"><div><span className="matter__eyebrow">Current playbook</span><h2>Rules & route</h2></div>
    <div className="matter__rules">{rules.map((rule) => <button key={rule.id} type="button" onClick={() => onOpenRule(rule.id)} aria-label={`Open ${rule.label}`}><span>{rule.label}</span><small>Priority {rule.priority}</small></button>)}</div>
    {canChooseRoute ? <><div className="matter__routes">{(["business_approval", "legal_review"] as Route[]).map((route) => <button key={route} type="button" className={state.selectedRoute === route ? "is-selected" : ""} aria-label={`Choose ${labels[route]}`} onClick={() => { onSelect(route); onRationale(route === "legal_review" ? "The liability cap was removed, so the material-redline rule requires legal review." : "The low contract value appears to permit business approval under the shortcut rule."); }}>{labels[route]}</button>)}</div>{state.selectedRoute ? <div className="matter__route-summary"><span>Decision reason</span><p>{state.routeRationale}</p><button className="matter__primary" type="button" aria-label={`Confirm ${labels[state.selectedRoute]} route`} onClick={onSubmit}>Confirm route</button></div> : <p className="matter__route-prompt">Choose the route produced by the verified contract and rule.</p>}</> : <p className="matter__route-prompt">Open the controlling rule before choosing a route.</p>}
  </section>;
}
