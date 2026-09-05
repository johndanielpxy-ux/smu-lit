import type { UseCase } from "../../domain/mattershift";
import type { EpisodeScene } from "./types";

export function generateStoryboard(useCase: UseCase): EpisodeScene[] {
  return [
    {
      id: "chapter-1-the-old-way",
      chapterNumber: 1,
      chapterTitle: "The Old Way",
      durationSeconds: 12,
      headline: "The Post-Meeting Scramble",
      subheadline: "Manual reconstruction, unverified AI shortcuts, and confidentiality leaks.",
      narration:
        "After every client-team meeting, lawyers spend 45 minutes manually turning chaotic notes into minutes, assigned tasks, and research queries. Under deadline pressure, the temptation to paste sensitive transcripts into unauthorized tools creates silent compliance vulnerabilities.",
      caption:
        "After every client-team meeting, lawyers spend 45 minutes reconstructing notes and research. Pressure leads to risky AI shortcuts.",
      visualType: "old_way",
      sourceRefIds: ["authorised-systems"],
      toolsInvolved: ["Microsoft Teams", "Public AI (Risk)"],
    },
    {
      id: "chapter-2-the-discovery",
      chapterNumber: 2,
      chapterTitle: "The Discovery",
      durationSeconds: 12,
      headline: "A Tested, Governed Blueprint",
      subheadline: `${useCase.contributorName} (${useCase.contributorRole}) validated the cross-tool standard.`,
      narration:
        `${useCase.contributorName} mapped the firm's approved Microsoft 365 and legal AI environment into a compliant, single-chain workflow. Instead of guessing, lawyers now follow a 6-step verified path linked directly to firm policy.`,
      caption:
        `${useCase.contributorName} established a verified 6-step blueprint linking Microsoft 365 and legal AI directly to firm policy.`,
      visualType: "discovery",
      sourceRefIds: ["authorised-systems", "purpose-limitation"],
      toolsInvolved: useCase.approvedTools,
    },
    {
      id: "chapter-3-approved-workflow",
      chapterNumber: 3,
      chapterTitle: "The Approved Workflow",
      durationSeconds: 14,
      headline: "Drafting & Verifying in Governed Tools",
      subheadline: "Teams transcript → Copilot structured draft → Human verification.",
      narration:
        "Within the secure Microsoft boundary, Copilot extracts draft minutes and action items from the meeting transcript. Before taking any next step, the associate cross-checks commitments and names directly against the meeting record.",
      caption:
        "Copilot drafts minutes inside Microsoft Teams. The lawyer immediately verifies commitments against the record.",
      visualType: "workflow_step",
      sourceRefIds: ["authorised-systems", "verification"],
      toolsInvolved: ["Microsoft Teams", "Microsoft Copilot"],
    },
    {
      id: "chapter-4-risk-moment",
      chapterNumber: 4,
      chapterTitle: "The Risk Moment",
      durationSeconds: 16,
      headline: "Confidentiality Checkpoint",
      subheadline: "A complex research question emerges. How do you feed it into legal AI?",
      narration:
        "A critical legal issue needs follow-up. The learner must now choose: paste the entire unredacted transcript into an external tool for fast answers, or sanitize the facts into a bounded query in the firm-approved AI assistant?",
      caption:
        "Checkpoint: A novel legal question arises. Choose how to handle client facts before querying AI.",
      visualType: "risk_checkpoint",
      sourceRefIds: ["confidentiality-minimisation", "purpose-limitation", "authorised-systems"],
      toolsInvolved: ["Firm-authorised legal AI"],
      checkpoint: {
        question: "How should you submit this research question to the AI assistant?",
        subtitle: "One decision preserves professional privilege; the other creates a reportable breach.",
        options: [
          {
            id: "unsafe-full-transcript",
            label: "Paste the full meeting transcript into a public chatbot for speed",
            safe: false,
            explanation:
              "Prohibited: Pasting unredacted client transcripts into unapproved or public AI exposes privileged client facts and violates confidentiality rules.",
            sourceRefId: "confidentiality-minimisation",
          },
          {
            id: "safe-bounded-query",
            label: "Sanitize into a bounded legal question in the firm-authorised legal AI",
            safe: true,
            explanation:
              "Approved: Using the minimum necessary facts inside the firm-authorised AI protects client confidentiality while delivering high-quality research.",
            sourceRefId: "confidentiality-minimisation",
          },
        ],
      },
    },
    {
      id: "chapter-5-payoff",
      chapterNumber: 5,
      chapterTitle: "Judgment & Payoff",
      durationSeconds: 14,
      headline: "Verified Source Citations & Human Review",
      subheadline: "Source verification → Outlook distribution. 8 minutes total.",
      narration:
        "The legal AI delivers statutory insights. The lawyer opens and verifies each primary source reference, confirms citations, and dispatches the final approved client update via Outlook. Full compliance, zero data leakage, and 80% time saved.",
      caption:
        "The lawyer inspects primary citations, approves the update, and dispatches via Outlook in under 8 minutes.",
      visualType: "payoff",
      sourceRefIds: ["verification", "human-responsibility"],
      toolsInvolved: ["Firm-authorised legal AI", "Microsoft Outlook"],
    },
  ];
}
