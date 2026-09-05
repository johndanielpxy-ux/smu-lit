import type { PlaybookRule, Route } from "../../../domain/mattershift";
import type { RehearsalState } from "../rehearsalReducer";

const labels: Record<Route, string> = { business_approval: "Business approval", signature: "Signature", legal_review: "Legal review" };
export function RoutingPanel({ rules, state, onOpenRule, onSelect, onRationale, onSubmit }: { rules: PlaybookRule[]; state: RehearsalState; onOpenRule: (id: string) => void; onSelect: (route: Route) => void; onRationale: (rationale: string) => void; onSubmit: () => void }) {
  return <section className="matter__routing"><div><span className="matter__eyebrow">Current playbook</span><h2>Rules & route</h2></div>
    <div className="matter__rules">{rules.map((rule) => <button key={rule.id} type="button" onClick={() => onOpenRule(rule.id)} aria-label={`Open ${rule.label}`}><span>{rule.label}</span><small>Priority {rule.priority}</small></button>)}</div>
    <div className="matter__routes">{(["business_approval", "legal_review"] as Route[]).map((route) => <button key={route} type="button" className={state.selectedRoute === route ? "is-selected" : ""} aria-label={`Choose ${labels[route]}`} onClick={() => onSelect(route)}>{labels[route]}</button>)}</div>
    <label className="matter__rationale">Explain your route<textarea value={state.routeRationale ?? ""} onChange={(event) => onRationale(event.target.value)} placeholder="State the verified fact and controlling playbook rule" /></label>
    <button className="matter__primary" type="button" disabled={!state.selectedRoute || (state.routeRationale ?? "").trim().length < 24} onClick={onSubmit}>Submit route</button>
  </section>;
}
