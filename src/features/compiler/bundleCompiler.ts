import {
  isApprovalCurrent,
  trainingScenarioFingerprint,
  useCaseMaterialFingerprint,
} from "../../domain/approval";
import {
  validateUseCase,
  type AiFinding,
  type ContractScenario,
  type PlaybookFacts,
  type RiskLevel,
  type Route,
  type TrainingModuleContent,
  type TrainingScenarioRef,
  type UseCase,
} from "../../domain/mattershift";
import { evaluateRoute } from "./routeEngine";

export interface CompilationManifest {
  schemaVersion: "2.0";
  bundleId: string;
  useCaseId: string;
  sourceVersion: string;
  scenarioRefs: TrainingScenarioRef[];
  approvalFingerprint: string;
  approvedBy: string;
  artifactIds: {
    episode: string;
    aiAnalysis: string;
    rehearsal: string;
    coaching: string;
    workflowGuide: string;
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

export interface CompiledAiFinding extends AiFinding {
  status: "unverified";
  aiGenerated: true;
}

export interface CompiledAiAnalysis {
  id: string;
  contractVersion: string;
  findings: CompiledAiFinding[];
  proposedRoute: Route;
  sourceRefIds: string[];
}

export interface CompiledRehearsal {
  id: string;
  title: string;
  scenario: ContractScenario;
  requiredFindingIds: string[];
  requiredClauseIds: string[];
  requiredRuleIds: string[];
}

export type CoachingDimension =
  | "ai_output_verification"
  | "clause_comparison"
  | "playbook_application"
  | "risk_reasoning"
  | "human_responsibility"
  | "audit_completeness";

export interface CoachingPlan {
  id: string;
  safetyCriticalDimensions: CoachingDimension[];
  sourceRefIdsByDimension: Record<CoachingDimension, string[]>;
}

export interface WorkflowGuideStep {
  workflowStepId: string;
  title: string;
  tool: string;
  instruction: string;
  sourceRefIds: string[];
}

export interface WorkflowGuide {
  id: string;
  title: string;
  workTrigger: string;
  legalAiSteps: WorkflowGuideStep[];
  verificationChecks: string[];
  escalationConditions: string[];
  sourceRefIds: string[];
}

export interface CompiledLawfloBundle {
  manifest: CompilationManifest;
  useCase: UseCase;
  moduleContent: TrainingModuleContent;
  episode: CompiledEpisode;
  aiAnalysis: CompiledAiAnalysis;
  rehearsal: CompiledRehearsal;
  coaching: CoachingPlan;
  workflowGuide: WorkflowGuide;
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

function scenariosIn(content: TrainingModuleContent): ContractScenario[] {
  return [content.guidedScenario, content.soloReplayScenario].filter(
    (scenario): scenario is ContractScenario => Boolean(scenario),
  );
}

function scenarioRefs(content: TrainingModuleContent): TrainingScenarioRef[] {
  return scenariosIn(content).map((scenario) => ({
    scenarioId: scenario.id,
    mode: scenario.mode,
    scenarioVersion: scenario.contractVersion,
    contentFingerprint: trainingScenarioFingerprint(scenario),
  }));
}

function assertScenarioIntegrity(useCase: UseCase, scenario: ContractScenario): void {
  if (scenario.useCaseId !== useCase.id) {
    throw new Error(`Scenario ${scenario.id} belongs to a different use case.`);
  }
  const sourceIds = new Set(useCase.sources.map((source) => source.id));
  const clauseIds = new Set(scenario.clauses.map((clause) => clause.id));
  assertUniqueIds(scenario.clauses, "contract clause");
  assertUniqueIds(scenario.aiFindings, "AI finding");

  for (const clause of scenario.clauses) {
    for (const sourceRefId of clause.sourceRefIds) {
      if (!sourceIds.has(sourceRefId)) {
        throw new Error(`Contract clause ${clause.id} references missing source ${sourceRefId}.`);
      }
    }
  }
  for (const finding of scenario.aiFindings) {
    if (!clauseIds.has(finding.sourceClauseId)) {
      throw new Error(`AI finding ${finding.id} references missing clause ${finding.sourceClauseId}.`);
    }
    for (const sourceRefId of finding.sourceRefIds) {
      if (!sourceIds.has(sourceRefId)) {
        throw new Error(`AI finding ${finding.id} references missing source ${sourceRefId}.`);
      }
    }
  }
}

function assertApprovedScenarioSet(
  useCase: UseCase,
  content: TrainingModuleContent,
): void {
  const actual = scenarioRefs(content);
  if (JSON.stringify(actual) !== JSON.stringify(useCase.scenarioRefs)) {
    throw new Error("Training module content does not match the approved scenario set.");
  }
}

function findingsToFacts(findings: AiFinding[]): PlaybookFacts {
  const entries = Object.fromEntries(
    findings.map((finding) => [finding.field, finding.proposedValue]),
  ) as Partial<PlaybookFacts>;
  const fields: Array<keyof PlaybookFacts> = [
    "contractValue",
    "templateVersion",
    "materialRedline",
    "personalData",
    "governingLaw",
  ];
  const missing = fields.filter((field) => entries[field] === undefined);
  if (missing.length > 0) {
    throw new Error(`AI analysis is missing required findings: ${missing.join(", ")}.`);
  }
  return entries as PlaybookFacts;
}

export function compileApprovedTrainingModule(
  approvedUseCase: UseCase,
  moduleContent: TrainingModuleContent,
): CompiledLawfloBundle {
  const validation = validateUseCase(approvedUseCase);
  if (!validation.valid) {
    throw new Error(`Cannot compile invalid content: ${validation.errors.join(" ")}`);
  }
  if (!isApprovalCurrent(approvedUseCase)) {
    throw new Error(
      "Compilation requires current human approval for this exact content and source version.",
    );
  }

  for (const scenario of scenariosIn(moduleContent)) {
    assertScenarioIntegrity(approvedUseCase, scenario);
  }
  assertApprovedScenarioSet(approvedUseCase, moduleContent);

  const useCase = structuredClone(approvedUseCase);
  const content = structuredClone(moduleContent);
  const guided = content.guidedScenario;
  const fingerprint = useCaseMaterialFingerprint(useCase);
  const bundleId = `lawflo-${useCase.id}-${fingerprint}`;
  const artifactIds = {
    episode: `${bundleId}-episode`,
    aiAnalysis: `${bundleId}-analysis`,
    rehearsal: `${bundleId}-rehearsal`,
    coaching: `${bundleId}-coaching`,
    workflowGuide: `${bundleId}-guide`,
  };

  const proposedFacts = findingsToFacts(guided.aiFindings);
  const proposedRoute = evaluateRoute({
    useCase,
    verifiedFacts: proposedFacts,
    unresolvedMaterialFindingIds: [],
  }).route;
  const sourceRefIds = [
    ...new Set(guided.aiFindings.flatMap((finding) => finding.sourceRefIds)),
  ];

  return {
    manifest: {
      schemaVersion: "2.0",
      bundleId,
      useCaseId: useCase.id,
      sourceVersion: useCase.sourceVersion,
      scenarioRefs: structuredClone(useCase.scenarioRefs),
      approvalFingerprint: fingerprint,
      approvedBy: useCase.approvalRecord!.approvedBy,
      artifactIds,
    },
    useCase,
    moduleContent: content,
    episode: {
      id: artifactIds.episode,
      title: useCase.generatedModuleDraft?.title ?? useCase.title,
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
    aiAnalysis: {
      id: artifactIds.aiAnalysis,
      contractVersion: guided.contractVersion,
      findings: guided.aiFindings.map((finding) => ({
        ...finding,
        status: "unverified",
        aiGenerated: true,
      })),
      proposedRoute,
      sourceRefIds,
    },
    rehearsal: {
      id: artifactIds.rehearsal,
      title: `Rehearse: ${useCase.title}`,
      scenario: guided,
      requiredFindingIds: guided.aiFindings
        .filter((finding) => finding.material)
        .map((finding) => finding.id),
      requiredClauseIds: guided.clauses
        .filter((clause) => clause.materiallyChanged)
        .map((clause) => clause.id),
      requiredRuleIds: useCase.playbookRules
        .filter((rule) => rule.route === "legal_review")
        .map((rule) => rule.id),
    },
    coaching: {
      id: artifactIds.coaching,
      safetyCriticalDimensions: [
        "ai_output_verification",
        "clause_comparison",
        "playbook_application",
        "risk_reasoning",
        "human_responsibility",
      ],
      sourceRefIdsByDimension: {
        ai_output_verification: ["ai-verification-policy"],
        clause_comparison: ["approved-template-2026-2", "material-redline-rule"],
        playbook_application: ["renewal-routing-playbook", "material-redline-rule"],
        risk_reasoning: ["material-redline-rule"],
        human_responsibility: ["human-responsibility"],
        audit_completeness: ["renewal-routing-playbook"],
      },
    },
    workflowGuide: {
      id: artifactIds.workflowGuide,
      title: "Your sales-renewal legal AI workflow guide",
      workTrigger: useCase.workTrigger,
      legalAiSteps: useCase.steps.map((step) => ({
        workflowStepId: step.id,
        title: step.title,
        tool: step.tool,
        instruction: step.instruction,
        sourceRefIds: [...step.sourceRefIds],
      })),
      verificationChecks: useCase.aiOperations.map(
        (operation) => operation.verificationInstruction,
      ),
      escalationConditions: useCase.playbookRules
        .filter((rule) => rule.route === "legal_review")
        .map((rule) => rule.explanation),
      sourceRefIds: [...new Set(useCase.steps.flatMap((step) => step.sourceRefIds))],
    },
  };
}
