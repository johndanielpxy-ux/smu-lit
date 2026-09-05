import { describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import type { MatterShiftEvent } from "../../domain/mattershift";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { buildEvidenceGraph, traceEvidence } from "./evidenceGraph";

const approved = approveUseCase(
  demoUseCase,
  "Jordan Lee",
  "2026-09-05T04:00:00.000Z",
);
const bundle = compileApprovedTrainingModule(approved, contractTrainingContent);

describe("evidenceGraph", () => {
  it("links policy sources to workflow instructions and compiled artefacts", () => {
    const graph = buildEvidenceGraph(bundle, []);
    const firstStep = approved.steps[0];
    const trace = traceEvidence(graph, `step:${firstStep.id}`);

    expect(trace.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        `step:${firstStep.id}`,
        ...firstStep.sourceRefIds.map((id) => `source:${id}`),
        `artifact:${bundle.episode.id}`,
        `artifact:${bundle.workflowGuide.id}`,
      ]),
    );
    expect(trace.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: `source:${firstStep.sourceRefIds[0]}`,
          to: `step:${firstStep.id}`,
          relation: "supports",
        }),
        expect.objectContaining({
          from: `step:${firstStep.id}`,
          to: `artifact:${bundle.episode.id}`,
          relation: "compiled_into",
        }),
      ]),
    );
  });

  it("makes the exact approval authorise every derived artefact", () => {
    const graph = buildEvidenceGraph(bundle, []);
    const approvalId = `approval:${bundle.manifest.approvalFingerprint}`;
    const authorisations = graph.edges.filter(
      (edge) => edge.from === approvalId && edge.relation === "authorizes",
    );

    expect(authorisations.map((edge) => edge.to)).toEqual(
      Object.values(bundle.manifest.artifactIds).map((id) => `artifact:${id}`),
    );
  });

  it("attaches only observed events for this use case to the relevant artefact", () => {
    const events: MatterShiftEvent[] = [
      {
        id: "event-1",
        useCaseId: approved.id,
        type: "episode_started",
        occurredAt: "2026-09-05T04:05:00.000Z",
        metadata: {
          sourceVersion: approved.sourceVersion,
          approvalFingerprint: approved.approvalRecord!.contentFingerprint,
        },
      },
      {
        id: "event-2",
        useCaseId: "another-use-case",
        type: "episode_started",
        occurredAt: "2026-09-05T04:06:00.000Z",
        metadata: { sourceVersion: approved.sourceVersion },
      },
    ];

    const graph = buildEvidenceGraph(bundle, events);

    expect(graph.nodes.some((node) => node.id === "event:event-1")).toBe(true);
    expect(graph.nodes.some((node) => node.id === "event:event-2")).toBe(false);
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        from: `artifact:${bundle.episode.id}`,
        to: "event:event-1",
        relation: "observed_in",
      }),
    );
  });

  it("connects a completed compilation to every artefact it produced", () => {
    const graph = buildEvidenceGraph(bundle, [
      {
        id: "event-compile",
        useCaseId: approved.id,
        type: "use_case_compiled",
        occurredAt: "2026-09-05T04:05:00.000Z",
        metadata: {
          bundleId: bundle.manifest.bundleId,
          sourceVersion: approved.sourceVersion,
          approvalFingerprint: approved.approvalRecord!.contentFingerprint,
        },
      },
    ]);

    expect(
      graph.edges
        .filter(
          (edge) =>
            edge.to === "event:event-compile" && edge.relation === "observed_in",
        )
        .map((edge) => edge.from),
    ).toEqual(
      Object.values(bundle.manifest.artifactIds).map((id) => `artifact:${id}`),
    );
  });

  it("does not attach a compilation event from a different approved bundle", () => {
    const graph = buildEvidenceGraph(bundle, [
      {
        id: "event-other-bundle",
        useCaseId: approved.id,
        type: "use_case_compiled",
        occurredAt: "2026-09-05T04:05:00.000Z",
        metadata: {
          bundleId: "lawflo-an-older-approved-bundle",
          sourceVersion: approved.sourceVersion,
        },
      },
    ]);

    expect(
      graph.nodes.some((node) => node.id === "event:event-other-bundle"),
    ).toBe(false);
  });

  it("does not attach events observed against an older source version", () => {
    const graph = buildEvidenceGraph(bundle, [
      {
        id: "event-old-version",
        useCaseId: approved.id,
        type: "episode_started",
        occurredAt: "2026-09-05T04:05:00.000Z",
        metadata: { sourceVersion: "0.9" },
      },
    ]);

    expect(
      graph.nodes.some((node) => node.id === "event:event-old-version"),
    ).toBe(false);
  });

  it("does not invent an artefact link for an event without a matching surface", () => {
    const graph = buildEvidenceGraph(bundle, [
      {
        id: "event-approval",
        useCaseId: approved.id,
        type: "human_approved",
        occurredAt: "2026-09-05T04:05:00.000Z",
        metadata: {
          sourceVersion: approved.sourceVersion,
          approvalFingerprint: approved.approvalRecord!.contentFingerprint,
        },
      },
    ]);

    expect(
      graph.edges.some(
        (edge) => edge.to === "event:event-approval" && edge.relation === "observed_in",
      ),
    ).toBe(false);
  });

  it("proves the clause-to-correction-to-rule-to-route coaching chain", () => {
    const graph = buildEvidenceGraph(bundle, [{
      id: "event-9", useCaseId: approved.id, type: "ai_finding_resolved",
      occurredAt: "2026-09-05T04:07:00.000Z",
      metadata: { sourceVersion: approved.sourceVersion, approvalFingerprint: approved.approvalRecord!.contentFingerprint, bundleId: bundle.manifest.bundleId, contractVersion: bundle.rehearsal.scenario.contractVersion, findingId: "guided-material-redline", resolution: "corrected" },
    }]);
    expect(graph.nodes).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "clause:liability", type: "contract_clause" }),
      expect.objectContaining({ id: "finding:guided-material-redline", type: "ai_finding" }),
      expect.objectContaining({ id: "rule:material-redline-review", type: "playbook_rule" }),
      expect.objectContaining({ id: "route:legal_review", type: "route_decision" }),
      expect.objectContaining({ id: "coaching:risk_reasoning", type: "coaching_dimension" }),
    ]));
    expect(graph.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "clause:liability", to: "finding:guided-material-redline", relation: "produced" }),
      expect.objectContaining({ from: "finding:guided-material-redline", to: "event:event-9", relation: "corrected_by" }),
      expect.objectContaining({ from: "event:event-9", to: "rule:material-redline-review", relation: "governed_by" }),
      expect.objectContaining({ from: "rule:material-redline-review", to: "route:legal_review", relation: "routed_by" }),
      expect.objectContaining({ from: "route:legal_review", to: "coaching:risk_reasoning", relation: "produced" }),
    ]));
  });
});
