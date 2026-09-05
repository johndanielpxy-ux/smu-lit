export type ApprovalStatus =
  | "draft"
  | "source_checked"
  | "human_approved"
  | "published";

export type RiskLevel = "low" | "medium" | "high";

export interface ApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  contentFingerprint: string;
  sourceVersion: string;
}

export interface SourceRef {
  id: string;
  title: string;
  version: string;
  excerpt: string;
  url?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  tool: string;
  instruction: string;
  sourceRefIds: string[];
  riskLevel: RiskLevel;
  humanReviewRequired: boolean;
}

export interface Guardrail {
  id: string;
  rule: string;
  prohibitedAction: string;
  safeAlternative: string;
  sourceRefIds: string[];
}

export interface UseCase {
  id: string;
  title: string;
  contributorName: string;
  contributorRole: string;
  consentConfirmed: boolean;
  targetRole: string;
  practiceGroup: string;
  workTrigger: string;
  problem: string;
  approvedTools: string[];
  steps: WorkflowStep[];
  guardrails: Guardrail[];
  expectedOutcome: string;
  outcomeMetric: string;
  sources: SourceRef[];
  sourceVersion: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvalRecord?: ApprovalRecord;
}

export type MatterShiftEventType =
  | "use_case_compiled"
  | "source_opened"
  | "human_approved"
  | "episode_started"
  | "checkpoint_answered"
  | "rehearsal_passed"
  | "activation_opened";

export interface MatterShiftEvent {
  id: string;
  useCaseId: string;
  type: MatterShiftEventType;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUseCase(useCase: UseCase): ValidationResult {
  const errors: string[] = [];
  const sourceIds = new Set(useCase.sources.map((source) => source.id));

  if (!useCase.consentConfirmed) {
    errors.push("Contributor consent must be confirmed.");
  }

  if (useCase.steps.length === 0) {
    errors.push("At least one workflow step is required.");
  }

  if (useCase.guardrails.length === 0) {
    errors.push("At least one guardrail is required.");
  }

  for (const step of useCase.steps) {
    if (step.sourceRefIds.length === 0) {
      errors.push(`Workflow step ${step.id} has no source reference.`);
    }

    for (const sourceRefId of step.sourceRefIds) {
      if (!sourceIds.has(sourceRefId)) {
        errors.push(
          `Workflow step ${step.id} references missing source ${sourceRefId}.`,
        );
      }
    }
  }

  for (const guardrail of useCase.guardrails) {
    if (guardrail.sourceRefIds.length === 0) {
      errors.push(`Guardrail ${guardrail.id} has no source reference.`);
    }

    for (const sourceRefId of guardrail.sourceRefIds) {
      if (!sourceIds.has(sourceRefId)) {
        errors.push(
          `Guardrail ${guardrail.id} references missing source ${sourceRefId}.`,
        );
      }
    }
  }

  if (
    (useCase.approvalStatus === "human_approved" ||
      useCase.approvalStatus === "published") &&
    !useCase.approvedBy?.trim()
  ) {
    errors.push("Approved or published content requires a named approver.");
  }

  return { valid: errors.length === 0, errors };
}
