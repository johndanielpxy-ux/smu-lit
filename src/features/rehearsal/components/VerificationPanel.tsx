import type { AiFinding } from "../../../domain/mattershift";

export function VerificationPanel({ finding }: { finding?: AiFinding }) {
  if (!finding) return <div className="matter__verification"><strong>Verification desk</strong><p>Open an AI finding to inspect its contract anchor.</p></div>;
  return <div className="matter__verification"><span className="matter__eyebrow">Contract anchor</span><h3>{finding.label}</h3><p>AI proposed <strong>{String(finding.proposedValue)}</strong>. Verified agreement value: <strong>{String(finding.verifiedValue)}</strong>.</p>{finding.proposedValue !== finding.verifiedValue && <p className="matter__warning">These values conflict. Correct the draft before routing.</p>}</div>;
}
