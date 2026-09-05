import type { UseCase } from "../domain/mattershift";

export const demoUseCase: UseCase = {
  id: "meeting-to-verified-update",
  title: "From meeting to verified client-team update",
  contributorName: "Maya Tan",
  contributorRole: "Legal Innovation Counsel",
  consentConfirmed: true,
  targetRole: "Associates and senior associates",
  practiceGroup: "Disputes",
  workTrigger:
    "A client-team meeting ends with new facts, research questions and assigned actions.",
  problem:
    "Lawyers manually reconstruct minutes, responsibilities and research questions across several tools, delaying follow-up and increasing the risk of unverified AI output or confidential information entering the workflow.",
  approvedTools: [
    "Microsoft Teams",
    "Microsoft Copilot",
    "Firm-authorised legal AI",
    "Microsoft Outlook",
  ],
  steps: [
    {
      id: "open-transcript",
      title: "Open the authorised transcript",
      tool: "Microsoft Teams",
      instruction:
        "Open the meeting transcript inside the firm's authorised Microsoft environment.",
      sourceRefIds: [
        "authorised-systems",
        "confidentiality-minimisation",
      ],
      riskLevel: "medium",
      humanReviewRequired: false,
    },
    {
      id: "draft-minutes",
      title: "Draft minutes and actions",
      tool: "Microsoft Copilot",
      instruction:
        "Ask Copilot for draft minutes, assigned actions and unresolved questions from the meeting.",
      sourceRefIds: ["authorised-systems", "purpose-limitation"],
      riskLevel: "medium",
      humanReviewRequired: true,
    },
    {
      id: "verify-minutes",
      title: "Verify the meeting record",
      tool: "Microsoft Teams",
      instruction:
        "Compare the draft with the transcript and correct names, commitments and deadlines.",
      sourceRefIds: ["verification", "human-responsibility"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "bounded-legal-request",
      title: "Ask one bounded legal question",
      tool: "Firm-authorised legal AI",
      instruction:
        "Convert one unresolved issue into a sanitised, bounded request using only the minimum necessary information.",
      sourceRefIds: [
        "confidentiality-minimisation",
        "purpose-limitation",
      ],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "verify-sources",
      title: "Open and verify every material source",
      tool: "Firm-authorised legal AI",
      instruction:
        "Open each material cited source and revise or remove unsupported propositions.",
      sourceRefIds: ["verification"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "send-reviewed-update",
      title: "Send the reviewed update",
      tool: "Microsoft Outlook",
      instruction:
        "A responsible lawyer reviews and approves the final update before it is shared.",
      sourceRefIds: ["human-responsibility"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
  ],
  guardrails: [
    {
      id: "no-confidential-data-in-public-ai",
      rule:
        "Client-related information may be processed only in approved systems, using the minimum information required.",
      prohibitedAction:
        "Paste the complete confidential transcript into a free public AI service.",
      safeAlternative:
        "Use the firm-authorised system, remove unnecessary identifying information, ask one bounded question, verify the sources and obtain human approval before sharing the result.",
      sourceRefIds: [
        "authorised-systems",
        "confidentiality-minimisation",
        "purpose-limitation",
      ],
    },
  ],
  expectedOutcome:
    "A reviewed meeting summary, verified research note and approved update, prepared without transferring confidential information to unapproved tools or removing human responsibility.",
  outcomeMetric: "Elapsed time from meeting end to approved update",
  sources: [
    {
      id: "authorised-systems",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.0",
      excerpt:
        "Client-related information may be processed only in systems approved by the firm for that information category.",
    },
    {
      id: "confidentiality-minimisation",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.0",
      excerpt:
        "Do not place confidential, privileged or personal information into public AI services. Use the minimum information required and anonymise or redact where appropriate.",
    },
    {
      id: "purpose-limitation",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.0",
      excerpt:
        "Use AI only for a defined work task. Do not upload an entire matter file when a bounded question or extract is sufficient.",
    },
    {
      id: "verification",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.0",
      excerpt:
        "A lawyer must check material factual and legal propositions against reliable, openable sources before relying on or sharing the output.",
    },
    {
      id: "human-responsibility",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.0",
      excerpt:
        "AI output is a draft. A responsible lawyer must review and approve the final work product before it is sent, filed or used for advice.",
    },
  ],
  sourceVersion: "1.0",
  approvalStatus: "draft",
};
