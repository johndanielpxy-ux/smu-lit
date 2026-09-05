import type { MatterShiftEvent } from "../../domain/mattershift";
import type { CompiledMatterShiftBundle } from "../compiler/bundleCompiler";

export type EvidenceNodeType =
  | "source"
  | "workflow_step"
  | "guardrail"
  | "artifact"
  | "approval"
  | "event";

export type EvidenceRelation =
  | "supports"
  | "constrains"
  | "compiled_into"
  | "authorizes"
  | "observed_in";

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
  bundle: CompiledMatterShiftBundle,
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
  if (event.type === "rehearsal_passed") {
    return [`artifact:${bundle.rehearsal.id}`];
  }
  if (event.type === "activation_opened") {
    return [`artifact:${bundle.activationCard.id}`];
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
  bundle: CompiledMatterShiftBundle,
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
    event.metadata.bundleId === bundle.manifest.bundleId
  );
}

export function buildEvidenceGraph(
  bundle: CompiledMatterShiftBundle,
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
      edge(stepId, `artifact:${bundle.activationCard.id}`, "compiled_into"),
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
        `artifact:${bundle.activationCard.id}`,
        "compiled_into",
      ),
    );
  }

  const artifacts = [
    { id: bundle.episode.id, label: "Peer episode", detail: bundle.episode.title },
    {
      id: bundle.rehearsal.id,
      label: "Safe rehearsal",
      detail: bundle.rehearsal.title,
    },
    {
      id: bundle.activationCard.id,
      label: "Activation card",
      detail: bundle.activationCard.workTrigger,
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
