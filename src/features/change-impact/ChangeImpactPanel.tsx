import { useState } from "react";
import type { ChangeImpactResult } from "./changeImpact";

export function ChangeImpactPanel({ result }: { result: ChangeImpactResult }) {
  const [open, setOpen] = useState(false);
  return <section className="change-impact"><button type="button" className="text-button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Simulate a playbook update</button>{open && <div role="status"><strong>{result.approvalStillCurrent ? "Approval remains current" : "Publication paused"}</strong>{result.reasons.map((reason) => <p key={reason}>{reason}</p>)}<small>{result.affectedArtifactIds.length} learning artefacts affected</small></div>}</section>;
}
