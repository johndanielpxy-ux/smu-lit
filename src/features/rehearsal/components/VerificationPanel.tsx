import type { AiFinding } from "../../../domain/mattershift";
import type { FindingResolution } from "../rehearsalReducer";

export function VerificationPanel({ finding, clauseOpened, resolution, onOpenClause, onSubmit }: { finding?: AiFinding; clauseOpened: boolean; resolution?: FindingResolution; onOpenClause: (clauseId: string) => void; onSubmit: (finding: AiFinding, value: string | number | boolean) => boolean }) {
  if (!finding) return <div className="matter__verification"><strong>Verification desk</strong><p>Open an AI finding to inspect its contract anchor.</p></div>;
  if (resolution) return <div className="matter__verification"><span className="matter__eyebrow">Source checked</span><h3>{finding.label}</h3><p>You recorded <strong>{String(resolution.value)}</strong> from the agreement.</p></div>;
  return <div className="matter__verification"><span className="matter__eyebrow">Contract anchor</span><h3>{finding.label}</h3><p>AI proposed <strong>{String(finding.proposedValue)}</strong>. Treat it as a draft until you compare the supporting clause.</p>
    {!clauseOpened ? <button type="button" onClick={() => onOpenClause(finding.sourceClauseId)}>Open supporting clause</button> : typeof finding.verifiedValue === "boolean" ? <div className="matter__verification-choices" aria-label={`Record verified finding for ${finding.label}`}><span>What does the agreement show?</span><button type="button" onClick={() => onSubmit(finding, false)}>No material redline</button><button type="button" className="is-risk" onClick={() => onSubmit(finding, true)}>Material redline detected</button></div> : <button type="button" onClick={() => onSubmit(finding, finding.verifiedValue)}>Confirm value from agreement: {String(finding.verifiedValue)}</button>}
  </div>;
}
