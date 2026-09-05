import type { AiFinding } from "../../../domain/mattershift";
import type { FindingResolution } from "../rehearsalReducer";

export function AiReviewPanel({ findings, resolutions, reviewRun, onRun, onOpen }: { findings: AiFinding[]; resolutions: Record<string, FindingResolution>; reviewRun: boolean; onRun: () => void; onOpen: (finding: AiFinding) => void }) {
  return <section className="matter__ai"><header><span className="matter__eyebrow">Authorised legal AI</span><h2>Review draft</h2><span className="matter__unverified">Unverified output</span></header>
    {!reviewRun ? <button className="matter__primary" type="button" onClick={onRun}>Run AI review</button> : <div className="matter__findings">{findings.map((finding) => { const resolution = resolutions[finding.id]; return <article key={finding.id}><button type="button" className="matter__finding-head" aria-label={`Open ${finding.label}`} onClick={() => onOpen(finding)}><span>{finding.label}</span><strong>{String(finding.proposedValue)}</strong></button>{resolution ? <small className={resolution.status === "corrected" ? "is-corrected" : ""}>{resolution.status}</small> : <small>Needs source check</small>}</article>; })}</div>}
  </section>;
}
