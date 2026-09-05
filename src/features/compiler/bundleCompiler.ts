import {
  isApprovalCurrent,
  useCaseMaterialFingerprint,
} from "../../domain/approval";
import {
  validateUseCase,
  type RiskLevel,
  type UseCase,
} from "../../domain/mattershift";

export interface CompilationManifest {
  schemaVersion: "1.0";
  bundleId: string;
  useCaseId: string;
  sourceVersion: string;
  approvalFingerprint: string;
  approvedBy: string;
  artifactIds: {
    episode: string;
    rehearsal: string;
    activationCard: string;
  };
}

export interface EpisodeBeat {
  id: string;
  workflowStepId: string;
  title: string;
  tool: string;
  instruction: string;
  sourceRefIds: string[];
  riskLevel: RiskLevel;
  humanReviewRequired: boolean;
}

export interface CompiledEpisode {
  id: string;
  title: string;
  premise: string;
  beats: EpisodeBeat[];
}

export interface RehearsalDecision {
  id: string;
  guardrailId: string;
  label: string;
  safe: boolean;
  consequence: string;
  sourceRefIds: string[];
}

export interface CompiledRehearsal {
  id: string;
  title: string;
  trigger: string;
  decisions: RehearsalDecision[];
}

export interface ActivationStep {
  workflowStepId: string;
  title: string;
  tool: string;
  instruction: string;
  sourceRefIds: string[];
}

export interface ActivationCard {
  id: string;
  title: string;
  workTrigger: string;
  approvedTools: string[];
  steps: ActivationStep[];
  safetyChecklist: string[];
  expectedOutcome: string;
  outcomeMetric: string;
}

export interface CompiledMatterShiftBundle {
  manifest: CompilationManifest;
  useCase: UseCase;
  episode: CompiledEpisode;
  rehearsal: CompiledRehearsal;
  activationCard: ActivationCard;
}

function assertUniqueIds(
  values: Array<{ id: string }>,
  description: string,
): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new Error(`Duplicate ${description} id: ${value.id}.`);
    }
    ids.add(value.id);
  }
}

function assertResolvableReferences(useCase: UseCase): void {
  const sourceIds = new Set(useCase.sources.map((source) => source.id));
  const references = [
    ...useCase.steps.flatMap((step) =>
      step.sourceRefIds.map((sourceRefId) => ({
        owner: `Workflow step ${step.id}`,
        sourceRefId,
      })),
    ),
    ...useCase.guardrails.flatMap((guardrail) =>
      guardrail.sourceRefIds.map((sourceRefId) => ({
        owner: `Guardrail ${guardrail.id}`,
        sourceRefId,
      })),
    ),
  ];

  for (const reference of references) {
    if (!sourceIds.has(reference.sourceRefId)) {
      throw new Error(
        `${reference.owner} references missing source ${reference.sourceRefId}.`,
      );
    }
  }
}

export function compileApprovedUseCase(
  approvedUseCase: UseCase,
): CompiledMatterShiftBundle {
  const validation = validateUseCase(approvedUseCase);
  if (!validation.valid) {
    throw new Error(`Cannot compile invalid content: ${validation.errors.join(" ")}`);
  }

  if (!isApprovalCurrent(approvedUseCase)) {
    throw new Error(
      "Compilation requires current human approval for this exact content and source version.",
    );
  }

  assertUniqueIds(approvedUseCase.sources, "source");
  assertUniqueIds(approvedUseCase.steps, "workflow step");
  assertUniqueIds(approvedUseCase.guardrails, "guardrail");
  assertResolvableReferences(approvedUseCase);

  const useCase = structuredClone(approvedUseCase);
  const fingerprint = useCaseMaterialFingerprint(useCase);
  const bundleId = `mattershift-${useCase.id}-${fingerprint}`;
  const artifactIds = {
    episode: `${bundleId}-episode`,
    rehearsal: `${bundleId}-rehearsal`,
    activationCard: `${bundleId}-activation`,
  };

  return {
    manifest: {
      schemaVersion: "1.0",
      bundleId,
      useCaseId: useCase.id,
      sourceVersion: useCase.sourceVersion,
      approvalFingerprint: fingerprint,
      approvedBy: useCase.approvalRecord!.approvedBy,
      artifactIds,
    },
    useCase,
    episode: {
      id: artifactIds.episode,
      title: useCase.title,
      premise: useCase.problem,
      beats: useCase.steps.map((step, index) => ({
        id: `${artifactIds.episode}-beat-${index + 1}`,
        workflowStepId: step.id,
        title: step.title,
        tool: step.tool,
        instruction: step.instruction,
        sourceRefIds: [...step.sourceRefIds],
        riskLevel: step.riskLevel,
        humanReviewRequired: step.humanReviewRequired,
      })),
    },
    rehearsal: {
      id: artifactIds.rehearsal,
      title: `Rehearse: ${useCase.title}`,
      trigger: useCase.workTrigger,
      decisions: useCase.guardrails.flatMap((guardrail) => [
        {
          id: `${artifactIds.rehearsal}-${guardrail.id}-unsafe`,
          guardrailId: guardrail.id,
          label: guardrail.prohibitedAction,
          safe: false,
          consequence: guardrail.rule,
          sourceRefIds: [...guardrail.sourceRefIds],
        },
        {
          id: `${artifactIds.rehearsal}-${guardrail.id}-safe`,
          guardrailId: guardrail.id,
          label: guardrail.safeAlternative,
          safe: true,
          consequence: `Proceed within the approved workflow: ${guardrail.rule}`,
          sourceRefIds: [...guardrail.sourceRefIds],
        },
      ]),
    },
    activationCard: {
      id: artifactIds.activationCard,
      title: useCase.title,
      workTrigger: useCase.workTrigger,
      approvedTools: [...useCase.approvedTools],
      steps: useCase.steps.map((step) => ({
        workflowStepId: step.id,
        title: step.title,
        tool: step.tool,
        instruction: step.instruction,
        sourceRefIds: [...step.sourceRefIds],
      })),
      safetyChecklist: useCase.guardrails.map(
        (guardrail) => guardrail.safeAlternative,
      ),
      expectedOutcome: useCase.expectedOutcome,
      outcomeMetric: useCase.outcomeMetric,
    },
  };
}
