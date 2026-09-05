import { trainingScenarioFingerprint } from "../domain/approval";
import type { UseCase } from "../domain/mattershift";
import { contractTrainingContent } from "./contractScenarios";

const guidedScenario = contractTrainingContent.guidedScenario;
const soloReplayScenario = contractTrainingContent.soloReplayScenario!;

export const demoUseCase: UseCase = {
  id: "ai-assisted-sales-renewal-review",
  title: "AI-Assisted Contract Review: Route a Sales Renewal",
  contributorName: "Maya Tan",
  contributorRole: "Legal Innovation Counsel",
  consentConfirmed: true,
  targetRole: "Commercial lawyers, legal operations and contract managers",
  practiceGroup: "Commercial Contracts",
  workTrigger:
    "A salesperson submits a routine sales renewal for review and approval.",
  problem:
    "Routine renewals create a legal bottleneck, while an unchecked AI summary can miss a material change and send an unsafe agreement down a low-risk route.",
  approvedTools: [
    "Contract workflow",
    "Firm-authorised legal AI",
    "Approved clause playbook",
    "E-signature platform",
  ],
  steps: [
    {
      id: "capture-request",
      title: "Capture the renewal request",
      tool: "Contract workflow",
      instruction:
        "Confirm the contract type, value, template version, counterparty and submitted agreement before analysis.",
      sourceRefIds: ["renewal-routing-playbook", "approved-template-2026-2"],
      riskLevel: "medium",
      humanReviewRequired: true,
    },
    {
      id: "run-ai-review",
      title: "Run the approved AI review",
      tool: "Firm-authorised legal AI",
      instruction:
        "Extract key terms and compare the submitted clauses with the approved template inside the authorised system.",
      sourceRefIds: ["authorised-ai-policy", "approved-template-2026-2"],
      riskLevel: "medium",
      humanReviewRequired: true,
    },
    {
      id: "verify-findings",
      title: "Verify every material AI finding",
      tool: "Firm-authorised legal AI",
      instruction:
        "Open the underlying agreement and confirm or correct each material finding before relying on the proposed route.",
      sourceRefIds: ["ai-verification-policy", "human-responsibility"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "compare-standard-terms",
      title: "Compare changed standard terms",
      tool: "Approved clause playbook",
      instruction:
        "Compare highlighted submitted text with the approved template and identify material legal deviations.",
      sourceRefIds: ["approved-template-2026-2", "material-redline-rule"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "apply-routing-playbook",
      title: "Apply the legal routing playbook",
      tool: "Contract workflow",
      instruction:
        "Apply the current playbook to verified facts; a material standard-term change overrides the low-value shortcut.",
      sourceRefIds: ["renewal-routing-playbook", "material-redline-rule"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
    {
      id: "route-with-reason",
      title: "Route with an auditable reason",
      tool: "Contract workflow",
      instruction:
        "Send low-risk renewals to business approval and escalate material changes to legal with the source-linked reason.",
      sourceRefIds: ["renewal-routing-playbook", "human-responsibility"],
      riskLevel: "high",
      humanReviewRequired: true,
    },
  ],
  aiOperations: [
    {
      id: "extract-commercial-terms",
      task: "extract",
      tool: "Firm-authorised legal AI",
      description: "Extract contract value, term, template version and governing law.",
      verificationInstruction:
        "Compare each extracted term with the submitted agreement before confirming it.",
      sourceRefIds: ["authorised-ai-policy", "ai-verification-policy"],
    },
    {
      id: "compare-contract-clauses",
      task: "compare",
      tool: "Firm-authorised legal AI",
      description: "Compare submitted clauses with approved standard terms.",
      verificationInstruction:
        "Open every clause flagged or omitted as material and compare both versions directly.",
      sourceRefIds: ["approved-template-2026-2", "ai-verification-policy"],
    },
    {
      id: "classify-routing-risk",
      task: "classify",
      tool: "Firm-authorised legal AI",
      description: "Propose a route from the extracted and compared terms.",
      verificationInstruction:
        "Treat the proposed route as unverified until a human applies the current playbook.",
      sourceRefIds: ["renewal-routing-playbook", "human-responsibility"],
    },
  ],
  playbookRules: [
    {
      id: "material-redline-review",
      label: "Material standard-term changes require legal review",
      field: "materialRedline",
      operator: "eq",
      value: true,
      route: "legal_review",
      priority: 100,
      explanation:
        "A material change to an approved standard term requires legal review regardless of contract value.",
      sourceRefIds: ["material-redline-rule"],
    },
    {
      id: "personal-data-review",
      label: "Changed personal-data terms require legal review",
      field: "personalData",
      operator: "eq",
      value: true,
      route: "legal_review",
      priority: 90,
      explanation:
        "A renewal containing changed personal-data processing terms requires legal review.",
      sourceRefIds: ["material-redline-rule"],
    },
    {
      id: "foreign-law-review",
      label: "Non-Singapore governing law requires legal review",
      field: "governingLaw",
      operator: "neq",
      value: "Singapore",
      route: "legal_review",
      priority: 80,
      explanation: "A change from the approved governing law requires legal review.",
      sourceRefIds: ["renewal-routing-playbook"],
    },
    {
      id: "low-value-business-approval",
      label: "Low-value unchanged renewal may proceed to business approval",
      field: "contractValue",
      operator: "lt",
      value: 50_000,
      route: "business_approval",
      priority: 20,
      explanation:
        "A renewal under SGD 50,000 may use the low-risk route only when no higher-priority legal-review rule matches.",
      sourceRefIds: ["renewal-routing-playbook"],
    },
    {
      id: "known-value-signature",
      label: "A verified contract value is required before signature",
      field: "contractValue",
      operator: "present",
      route: "signature",
      priority: 1,
      explanation: "A contract cannot proceed without a verified value.",
      sourceRefIds: ["renewal-routing-playbook"],
    },
  ],
  scenarioRefs: [guidedScenario, soloReplayScenario].map((scenario) => ({
    scenarioId: scenario.id,
    mode: scenario.mode,
    scenarioVersion: scenario.contractVersion,
    contentFingerprint: trainingScenarioFingerprint(scenario),
  })),
  guardrails: [
    {
      id: "never-route-from-ai-alone",
      rule:
        "AI findings and routes are drafts until a human verifies the agreement and applies the current playbook.",
      prohibitedAction:
        "Accept the AI's low-risk recommendation without opening the material clauses.",
      safeAlternative:
        "Verify every material finding, compare changed clauses and escalate uncertainty to legal review.",
      sourceRefIds: ["ai-verification-policy", "human-responsibility"],
    },
  ],
  expectedOutcome:
    "A verified, source-linked route decision that escalates material deviations and sends genuinely low-risk renewals forward without unnecessary legal handling.",
  outcomeMetric: "Observed completion of every governed verification and routing step",
  sources: [
    {
      id: "renewal-routing-playbook",
      title: "Meridian & Rowe Synthetic Sales Renewal Playbook",
      version: "2026.2",
      excerpt:
        "Renewals below SGD 50,000 may proceed without legal review only when the approved template is unchanged and all material facts have been verified.",
    },
    {
      id: "material-redline-rule",
      title: "Meridian & Rowe Synthetic Sales Renewal Playbook",
      version: "2026.2",
      excerpt:
        "Any material change to liability, data processing, governing law or another standard legal term must be escalated to legal review regardless of value.",
    },
    {
      id: "approved-template-2026-2",
      title: "Meridian & Rowe Synthetic Sales Renewal Template",
      version: "2026.2",
      excerpt:
        "The approved template caps aggregate liability at fees paid in the preceding twelve months and applies Singapore law.",
    },
    {
      id: "authorised-ai-policy",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.1",
      excerpt:
        "Contract content may be processed only in the firm's authorised legal AI environment for the defined review task.",
    },
    {
      id: "ai-verification-policy",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.1",
      excerpt:
        "AI extraction, comparison and classification outputs are drafts. Open the underlying material and verify every material finding before reliance.",
    },
    {
      id: "human-responsibility",
      title: "Meridian & Rowe Synthetic Responsible AI Policy",
      version: "1.1",
      excerpt:
        "The responsible human decision-maker remains accountable for applying the current playbook and escalating uncertainty.",
    },
  ],
  sourceVersion: "2026.2",
  approvalStatus: "draft",
};
