import type { EpisodeOverlay } from "./episodeMedia";

export function InstructionalOverlay({ overlay }: { overlay: EpisodeOverlay }) {
  return <aside className={`instructional-overlay instructional-overlay--${overlay.kind}`} aria-label="Instructional evidence">
    <span>{overlay.eyebrow}</span>
    <h2>{overlay.title}</h2>
    {overlay.kind === "extraction" ? <>
      <dl>{overlay.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
      <p className="instructional-overlay__warning"><small>AI finding</small>{overlay.finding}</p>
    </> : null}
    {overlay.kind === "comparison" ? <div className="instructional-overlay__comparison">
      <article><small>Approved template</small><p>{overlay.standardClause}</p></article>
      <article><small>Submitted agreement · changed</small><p>{overlay.submittedClause}</p></article>
    </div> : null}
    {overlay.kind === "decision" ? <div className="instructional-overlay__decision"><p>{overlay.rule}</p><strong>{overlay.conclusion}</strong></div> : null}
    {overlay.kind === "route" ? <div className="instructional-overlay__route"><small>Selected route</small><strong>{overlay.route}</strong><p>{overlay.reason}</p><ul>{overlay.evidence.map((item) => <li key={item}>✓ {item}</li>)}</ul></div> : null}
  </aside>;
}
