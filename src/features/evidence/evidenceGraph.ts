import type { MatterShiftEvent } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";

export type EvidenceNodeType =
  | "source"
  | "workflow_step"
  | "guardrail"
  | "artifact"
  | "approval"
  | "event"
  | "ai_operation"
  | "ai_finding"
  | "contract_clause"
  | "playbook_rule"
  | "coaching_dimension"
  | "route_decision";

export type EvidenceRelation =
  | "supports"
  | "constrains"
  | "compiled_into"
  | "authorizes"
  | "observed_in"
  | "produced"
  | "verified_against"
  | "governed_by"
  | "corrected_by"
  | "routed_by";

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  detail: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface EvidenceEdge {
  id: string;
  from: string;
  to: string;
  relation: EvidenceRelation;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

function edge(
  from: string,
  to: string,
  relation: EvidenceRelation,
): EvidenceEdge {
  return { id: `${from}|${relation}|${to}`, from, to, relation };
}

function eventSurfaceIds(
  bundle: CompiledLawfloBundle,
  event: MatterShiftEvent,
): string[] {
  if (event.type === "use_case_compiled") {
    return Object.values(bundle.manifest.artifactIds).map(
      (artifactId) => `artifact:${artifactId}`,
    );
  }
  if (event.type === "episode_started" || event.type === "checkpoint_answered") {
    return [`artifact:${bundle.episode.id}`];
  }
  if (event.type === "rehearsal_completed") {
    return [`artifact:${bundle.rehearsal.id}`];
  }
  if (event.type === "workflow_guide_opened") {
    return [`artifact:${bundle.workflowGuide.id}`];
  }
  if (event.type === "source_opened") {
    const sourceRefId = event.metadata?.sourceRefId;
    if (typeof sourceRefId === "string") {
      return [`source:${sourceRefId}`];
    }
  }
  return [];
}

function isEventInBundleScope(
  bundle: CompiledLawfloBundle,
  event: MatterShiftEvent,
): boolean {
  if (
    event.useCaseId !== bundle.manifest.useCaseId ||
    event.metadata?.sourceVersion !== bundle.manifest.sourceVersion ||
    event.metadata?.approvalFingerprint !==
      bundle.manifest.approvalFingerprint
  ) {
    return false;
  }

  return (
    event.type !== "use_case_compiled" ||
    event.metadata?.bundleId === bundle.manifest.bundleId
  );
}

export function buildEvidenceGraph(
  bundle: CompiledLawfloBundle,
  events: MatterShiftEvent[],
): EvidenceGraph {
  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];

  for (const source of bundle.useCase.sources) {
    nodes.push({
      id: `source:${source.id}`,
      type: "source",
      label: source.title,
      detail: source.excerpt,
      metadata: { version: source.version },
    });
  }

  for (const operation of bundle.useCase.aiOperations) {
    const operationId = `ai-operation:${operation.id}`;
    nodes.push({ id: operationId, type: "ai_operation", label: operation.description, detail: operation.verificationInstruction, metadata: { task: operation.task, tool: operation.tool } });
    operation.sourceRefIds.forEach((sourceId) => edges.push(edge(`source:${sourceId}`, operationId, "supports")));
  }

  for (const clause of bundle.rehearsal.scenario.clauses) {
    const clauseId = `clause:${clause.id}`;
    nodes.push({ id: clauseId, type: "contract_clause", label: clause.heading, detail: clause.submittedText, metadata: { materiallyChanged: clause.materiallyChanged } });
    clause.sourceRefIds.forEach((sourceId) => edges.push(edge(`source:${sourceId}`, clauseId, "supports")));
  }

  for (const finding of bundle.aiAnalysis.findings) {
    const findingId = `finding:${finding.id}`;
    nodes.push({ id: findingId, type: "ai_finding", label: finding.label, detail: `AI proposed ${String(finding.proposedValue)}; verified value ${String(finding.verifiedValue)}.`, metadata: { material: finding.material, aiGenerated: true } });
    edges.push(edge(`clause:${finding.sourceClauseId}`, findingId, "produced"));
    edges.push(edge(findingId, `clause:${finding.sourceClauseId}`, "verified_against"));
    edges.push(edge(`ai-operation:compare-contract-clauses`, findingId, "produced"));
  }

  for (const rule of bundle.useCase.playbookRules) {
    const ruleId = `rule:${rule.id}`;
    nodes.push({ id: ruleId, type: "playbook_rule", label: rule.label, detail: rule.explanation, metadata: { route: rule.route, priority: rule.priority } });
    rule.sourceRefIds.forEach((sourceId) => edges.push(edge(`source:${sourceId}`, ruleId, "supports")));
  }

  const routeId = `route:${bundle.rehearsal.scenario.expectedRoute}`;
  nodes.push({ id: routeId, type: "route_decision", label: "Legal-review route", detail: "Verified material change requires legal review.", metadata: { route: bundle.rehearsal.scenario.expectedRoute } });
  for (const rule of bundle.useCase.playbookRules.filter((item) => item.route === bundle.rehearsal.scenario.expectedRoute)) edges.push(edge(`rule:${rule.id}`, routeId, "routed_by"));

  for (const dimension of Object.keys(bundle.coaching.sourceRefIdsByDimension) as Array<keyof typeof bundle.coaching.sourceRefIdsByDimension>) {
    const dimensionId = `coaching:${dimension}`;
    nodes.push({ id: dimensionId, type: "coaching_dimension", label: dimension.replaceAll("_", " "), detail: "Constructive review derived from observed learner actions." });
    bundle.coaching.sourceRefIdsByDimension[dimension].forEach((sourceId) => edges.push(edge(`source:${sourceId}`, dimensionId, "supports")));
    edges.push(edge(routeId, dimensionId, "produced"));
  }

  for (const step of bundle.useCase.steps) {
    const stepId = `step:${step.id}`;
    nodes.push({
      id: stepId,
      type: "workflow_step",
      label: step.title,
      detail: step.instruction,
      metadata: {
        tool: step.tool,
        riskLevel: step.riskLevel,
        humanReviewRequired: step.humanReviewRequired,
      },
    });
    for (const sourceRefId of step.sourceRefIds) {
      edges.push(edge(`source:${sourceRefId}`, stepId, "supports"));
    }
    edges.push(edge(stepId, `artifact:${bundle.episode.id}`, "compiled_into"));
    edges.push(
      edge(stepId, `artifact:${bundle.workflowGuide.id}`, "compiled_into"),
    );
  }

  for (const guardrail of bundle.useCase.guardrails) {
    const guardrailId = `guardrail:${guardrail.id}`;
    nodes.push({
      id: guardrailId,
      type: "guardrail",
      label: guardrail.rule,
      detail: guardrail.safeAlternative,
    });
    for (const sourceRefId of guardrail.sourceRefIds) {
      edges.push(edge(`source:${sourceRefId}`, guardrailId, "constrains"));
    }
    edges.push(
      edge(guardrailId, `artifact:${bundle.rehearsal.id}`, "compiled_into"),
    );
    edges.push(
      edge(
        guardrailId,
        `artifact:${bundle.workflowGuide.id}`,
        "compiled_into",
      ),
    );
  }

  const artifacts = [
    { id: bundle.episode.id, label: "Peer episode", detail: bundle.episode.title },
    {
      id: bundle.aiAnalysis.id,
      label: "Precomputed AI analysis",
      detail: `${bundle.aiAnalysis.findings.length} unverified findings`,
    },
    {
      id: bundle.rehearsal.id,
      label: "Safe rehearsal",
      detail: bundle.rehearsal.title,
    },
    {
      id: bundle.coaching.id,
      label: "Constructive coaching",
      detail: `${bundle.coaching.safetyCriticalDimensions.length} safety-critical dimensions`,
    },
    {
      id: bundle.workflowGuide.id,
      label: "Workflow guide",
      detail: bundle.workflowGuide.workTrigger,
    },
  ];
  for (const artifact of artifacts) {
    nodes.push({
      id: `artifact:${artifact.id}`,
      type: "artifact",
      label: artifact.label,
      detail: artifact.detail,
    });
  }

  const approvalId = `approval:${bundle.manifest.approvalFingerprint}`;
  nodes.push({
    id: approvalId,
    type: "approval",
    label: `Approved by ${bundle.manifest.approvedBy}`,
    detail: `Exact content fingerprint ${bundle.manifest.approvalFingerprint}; source version ${bundle.manifest.sourceVersion}.`,
  });
  for (const artifactId of Object.values(bundle.manifest.artifactIds)) {
    edges.push(edge(approvalId, `artifact:${artifactId}`, "authorizes"));
  }

  for (const event of events.filter((candidate) =>
    isEventInBundleScope(bundle, candidate),
  )) {
    const eventId = `event:${event.id}`;
    nodes.push({
      id: eventId,
      type: "event",
      label: event.type,
      detail: event.occurredAt,
      metadata: event.metadata ? { ...event.metadata } : undefined,
    });
    if (event.type === "ai_finding_resolved" && event.metadata?.resolution === "corrected" && typeof event.metadata.findingId === "string") {
      edges.push(edge(`finding:${event.metadata.findingId}`, eventId, "corrected_by"));
      edges.push(edge(eventId, "rule:material-redline-review", "governed_by"));
    }
    for (const surfaceId of eventSurfaceIds(bundle, event)) {
      if (nodes.some((node) => node.id === surfaceId)) {
        edges.push(edge(surfaceId, eventId, "observed_in"));
      }
    }
  }

  return { nodes, edges };
}

export function traceEvidence(
  graph: EvidenceGraph,
  nodeId: string,
): EvidenceGraph {
  const edges = graph.edges.filter(
    (candidate) => candidate.from === nodeId || candidate.to === nodeId,
  );
  const connectedIds = new Set([
    nodeId,
    ...edges.flatMap((candidate) => [candidate.from, candidate.to]),
  ]);

  return {
    nodes: graph.nodes.filter((node) => connectedIds.has(node.id)),
    edges,
  };
}
