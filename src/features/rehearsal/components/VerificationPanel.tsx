import { useEffect, useState } from "react";
import type { AiFinding } from "../../../domain/mattershift";
import type { FindingResolution } from "../rehearsalReducer";

function parseValue(raw: string, sample: AiFinding["verifiedValue"]): string | number | boolean {
  if (typeof sample === "boolean") {
    const normalised = raw.trim().toLowerCase();
    if (normalised === "true") return true;
    if (normalised === "false") return false;
    return raw.trim();
  }
  if (typeof sample === "number") return Number(raw.replaceAll(",", ""));
  return raw.trim();
}

export function VerificationPanel({ finding, clauseOpened, resolution, onOpenClause, onSubmit }: { finding?: AiFinding; clauseOpened: boolean; resolution?: FindingResolution; onOpenClause: (clauseId: string) => void; onSubmit: (finding: AiFinding, value: string | number | boolean) => boolean }) {
  const [draft, setDraft] = useState("");
  const [rejected, setRejected] = useState(false);
  useEffect(() => { setDraft(""); setRejected(false); }, [finding?.id]);
  if (!finding) return <div className="matter__verification"><strong>Verification desk</strong><p>Open an AI finding to inspect its contract anchor.</p></div>;
  if (resolution) return <div className="matter__verification"><span className="matter__eyebrow">Source checked</span><h3>{finding.label}</h3><p>You recorded <strong>{String(resolution.value)}</strong> from the agreement.</p></div>;
  return <div className="matter__verification"><span className="matter__eyebrow">Contract anchor</span><h3>{finding.label}</h3><p>AI proposed <strong>{String(finding.proposedValue)}</strong>. Treat it as a draft until you compare the supporting clause.</p>
    {!clauseOpened ? <button type="button" onClick={() => onOpenClause(finding.sourceClauseId)}>Open supporting clause</button> : <form onSubmit={(event) => { event.preventDefault(); const accepted = onSubmit(finding, parseValue(draft, finding.verifiedValue)); setRejected(!accepted); }}>
      <label htmlFor={`verified-${finding.id}`}>Verified value for {finding.label}</label>
      <input id={`verified-${finding.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={typeof finding.verifiedValue === "boolean" ? "Enter true or false" : "Enter the value from the agreement"} required />
      <button type="submit">Submit verified value for {finding.label}</button>
      {rejected && <p className="matter__warning" role="alert">That value does not resolve the source conflict. Compare the clause again; the answer remains hidden.</p>}
    </form>}
  </div>;
}
