export type ApprovalStatus =
  | "draft"
  | "source_checked"
  | "human_approved"
  | "published";

export type RiskLevel = "low" | "medium" | "high";
export type LegalAiTask = "extract" | "compare" | "classify";
export type Route = "business_approval" | "signature" | "legal_review";
export type ScenarioMode = "guided" | "solo_replay";

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

export interface LegalAiOperation {
  id: string;
  task: LegalAiTask;
  tool: string;
  description: string;
  verificationInstruction: string;
  sourceRefIds: string[];
}

export interface PlaybookFacts {
  contractValue: number;
  templateVersion: string;
  materialRedline: boolean;
  personalData: boolean;
  governingLaw: string;
}

interface PlaybookRuleBase {
  id: string;
  label: string;
  route: Route;
  priority: number;
  explanation: string;
  sourceRefIds: string[];
}

export type EqualityPlaybookRule = {
  [K in keyof PlaybookFacts]: PlaybookRuleBase & {
    field: K;
    operator: "eq" | "neq";
    value: PlaybookFacts[K];
  };
}[keyof PlaybookFacts];

export type PlaybookRule =
  | EqualityPlaybookRule
  | (PlaybookRuleBase & {
      field: "contractValue";
      operator: "lt";
      value: number;
    })
  | (PlaybookRuleBase & {
      field: keyof PlaybookFacts;
      operator: "present";
      value?: never;
    });

export interface TrainingScenarioRef {
  scenarioId: string;
  mode: ScenarioMode;
  scenarioVersion: string;
  contentFingerprint: string;
}

export interface Guardrail {
  id: string;
  rule: string;
  prohibitedAction: string;
  safeAlternative: string;
  sourceRefIds: string[];
}

export interface ContractClause {
  id: string;
  heading: string;
  standardText: string;
  submittedText: string;
  materiallyChanged: boolean;
  sourceRefIds: string[];
}

export interface AiFinding {
  id: string;
  label: string;
  field: keyof PlaybookFacts;
  proposedValue: string | number | boolean;
  verifiedValue: string | number | boolean;
  sourceClauseId: string;
  sourceRefIds: string[];
  material: boolean;
}

export interface ContractScenario {
  id: string;
  mode: ScenarioMode;
  useCaseId: string;
  contractVersion: string;
  contractName: string;
  counterparty: string;
  contractValue: number;
  templateVersion: string;
  clauses: ContractClause[];
  aiFindings: AiFinding[];
  expectedRoute: Route;
}

export interface TrainingModuleContent {
  guidedScenario: ContractScenario;
  soloReplayScenario?: ContractScenario;
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
  aiOperations: LegalAiOperation[];
  playbookRules: PlaybookRule[];
  scenarioRefs: TrainingScenarioRef[];
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
  | "demo_pack_loaded"
  | "human_approved"
  | "use_case_compiled"
  | "module_published"
  | "source_opened"
  | "episode_started"
  | "checkpoint_answered"
  | "rehearsal_started"
  | "ai_analysis_opened"
  | "ai_finding_resolved"
  | "playbook_rule_opened"
  | "route_selected"
  | "repair_completed"
  | "rehearsal_completed"
  | "workflow_guide_opened"
  | "solo_replay_started";

export interface EventScope {
  useCaseId: string;
  sourceVersion: string;
  contractVersion?: string;
  approvalFingerprint?: string;
  bundleId?: string;
}

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

function validateUniqueIds(
  values: Array<{ id: string }>,
  description: string,
  errors: string[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) {
      errors.push(`Duplicate ${description} id: ${value.id}.`);
    }
    seen.add(value.id);
  }
}

function validateSourceReferences(
  owner: string,
  sourceRefIds: string[],
  sourceIds: Set<string>,
  errors: string[],
): void {
  if (sourceRefIds.length === 0) {
    errors.push(`${owner} has no source reference.`);
  }
  for (const sourceRefId of sourceRefIds) {
    if (!sourceIds.has(sourceRefId)) {
      errors.push(`${owner} references missing source ${sourceRefId}.`);
    }
  }
}

export function validateUseCase(useCase: UseCase): ValidationResult {
  const errors: string[] = [];
  const sourceIds = new Set(useCase.sources.map((source) => source.id));

  if (!useCase.consentConfirmed) errors.push("Contributor consent must be confirmed.");
  if (useCase.steps.length === 0) errors.push("At least one workflow step is required.");
  if (useCase.guardrails.length === 0) errors.push("At least one guardrail is required.");
  if (useCase.aiOperations.length === 0) {
    errors.push("At least one legal AI operation is required.");
  }
  if (!useCase.playbookRules.some((rule) => rule.route === "legal_review")) {
    errors.push("At least one legal-review playbook rule is required.");
  }

  const guidedScenarios = useCase.scenarioRefs.filter(
    (scenario) => scenario.mode === "guided",
  );
  const soloScenarios = useCase.scenarioRefs.filter(
    (scenario) => scenario.mode === "solo_replay",
  );
  if (guidedScenarios.length !== 1) {
    errors.push("Exactly one guided training scenario is required.");
  }
  if (soloScenarios.length > 1) {
    errors.push("At most one solo-replay training scenario is allowed.");
  }

  validateUniqueIds(useCase.sources, "source", errors);
  validateUniqueIds(useCase.steps, "workflow step", errors);
  validateUniqueIds(useCase.guardrails, "guardrail", errors);
  validateUniqueIds(useCase.aiOperations, "legal AI operation", errors);
  validateUniqueIds(useCase.playbookRules, "playbook rule", errors);
  validateUniqueIds(
    useCase.scenarioRefs.map((scenario) => ({ id: scenario.scenarioId })),
    "training scenario",
    errors,
  );

  for (const step of useCase.steps) {
    validateSourceReferences(
      `Workflow step ${step.id}`,
      step.sourceRefIds,
      sourceIds,
      errors,
    );
  }
  for (const guardrail of useCase.guardrails) {
    validateSourceReferences(
      `Guardrail ${guardrail.id}`,
      guardrail.sourceRefIds,
      sourceIds,
      errors,
    );
  }
  for (const operation of useCase.aiOperations) {
    validateSourceReferences(
      `Legal AI operation ${operation.id}`,
      operation.sourceRefIds,
      sourceIds,
      errors,
    );
    if (!operation.verificationInstruction.trim()) {
      errors.push(
        `Legal AI operation ${operation.id} requires a human verification instruction.`,
      );
    }
  }
  for (const rule of useCase.playbookRules) {
    validateSourceReferences(
      `Playbook rule ${rule.id}`,
      rule.sourceRefIds,
      sourceIds,
      errors,
    );
  }
  for (const scenario of useCase.scenarioRefs) {
    if (!scenario.scenarioVersion.trim() || !scenario.contentFingerprint.trim()) {
      errors.push(`Training scenario ${scenario.scenarioId} requires versioned content.`);
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
