export type EpisodeOverlay =
  | { kind: "extraction"; eyebrow: string; title: string; facts: Array<{ label: string; value: string }>; finding: string }
  | { kind: "comparison"; eyebrow: string; title: string; standardClause: string; submittedClause: string }
  | { kind: "decision"; eyebrow: string; title: string; rule: string; conclusion: string }
  | { kind: "route"; eyebrow: string; title: string; route: string; reason: string; evidence: string[] };

export interface EpisodeOverlayBeat { atSeconds: number; overlay: EpisodeOverlay; }

export interface EpisodeMediaSegment {
  id: string;
  videoSrc: string;
  audioSrc: string;
  title: string;
  durationSeconds: number;
  narration: string;
  caption: string;
  sourceRefIds: string[];
  overlayBeats: EpisodeOverlayBeat[];
}

export interface EpisodeMediaManifest {
  label: "Prepared instructional episode";
  segments: readonly EpisodeMediaSegment[];
  checkpointAfterSegment: number;
}

export const preparedEpisodeMedia: EpisodeMediaManifest = {
  label: "Prepared instructional episode",
  checkpointAfterSegment: 1,
  segments: [
    {
      id: "ai-review", videoSrc: "/media/demo/lawflo-v2-01-ai-review.mp4", audioSrc: "/media/demo/lawflo-v2-01-ai-review.mp3", title: "AI reviews the renewal", durationSeconds: 15,
      narration: "A sales renewal arrives at forty-two thousand Singapore dollars. The authorised AI extracts the key facts and reports no material redline. Maya treats that result as a draft, never a decision.",
      caption: "The AI extracts the matter—but its finding remains a draft.", sourceRefIds: ["authorised-ai-policy", "ai-verification-policy"],
      overlayBeats: [{ atSeconds: 10, overlay: { kind: "extraction", eyebrow: "AI DRAFT · VERIFY BEFORE USE", title: "Renewal facts extracted", facts: [{ label: "Contract value", value: "SGD 42,000" }, { label: "Template", value: "Sales Renewal 2026.2" }, { label: "Governing law", value: "Singapore" }], finding: "No material redline detected" } }],
    },
    {
      id: "verify-evidence", videoSrc: "/media/demo/lawflo-v2-02-verify-evidence.mp4", audioSrc: "/media/demo/lawflo-v2-02-verify-evidence.mp3", title: "Maya verifies the evidence", durationSeconds: 15,
      narration: "Maya opens the source clauses. The approved template caps liability at twelve months of fees. The submitted agreement replaces that safeguard with unlimited liability, including indirect losses.",
      caption: "Approved: capped liability. Submitted: unlimited liability.", sourceRefIds: ["approved-template-2026-2", "material-redline-rule"],
      overlayBeats: [{ atSeconds: 10, overlay: { kind: "comparison", eyebrow: "SOURCE CHECK", title: "The AI missed a material change", standardClause: "Liability is capped at 12 months of fees.", submittedClause: "Liability is unlimited, including indirect losses." } }],
    },
    {
      id: "learner-decision", videoSrc: "/media/demo/lawflo-v2-03-learner-decision.mp4", audioSrc: "/media/demo/lawflo-v2-03-learner-decision.mp3", title: "Apply the legal playbook", durationSeconds: 15,
      narration: "The contract value is low, but the template has materially changed. The playbook says the shortcut applies only when standard terms are untouched. Maya corrects the AI finding.",
      caption: "A material redline overrides the low-value shortcut.", sourceRefIds: ["renewal-routing-playbook", "material-redline-rule"],
      overlayBeats: [{ atSeconds: 10, overlay: { kind: "decision", eyebrow: "PLAYBOOK APPLIED", title: "Low value is not enough", rule: "Under SGD 50K + no material redline → business approval", conclusion: "Material redline found → shortcut blocked" } }],
    },
    {
      id: "safe-route", videoSrc: "/media/demo/lawflo-v2-04-safe-route.mp4", audioSrc: "/media/demo/lawflo-v2-04-safe-route.mp3", title: "Route with an audit trail", durationSeconds: 15,
      narration: "Maya routes the renewal to legal review and attaches the changed clause and controlling playbook rule. The model proposed; the responsible human verified; LAWFLO preserved the reason.",
      caption: "Legal review—with the clause, rule and reason attached.", sourceRefIds: ["material-redline-rule", "human-responsibility"],
      overlayBeats: [{ atSeconds: 10, overlay: { kind: "route", eyebrow: "HUMAN-VERIFIED ROUTE", title: "Escalated with evidence", route: "Legal review", reason: "Unlimited liability is a material standard-term change", evidence: ["Submitted liability clause", "Material-redline playbook rule"] } }],
    },
  ],
};
