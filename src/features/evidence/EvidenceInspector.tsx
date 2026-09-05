import { useMemo, useState } from "react";
import type { MatterShiftEvent } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import { buildEvidenceGraph } from "./evidenceGraph";

interface EvidenceInspectorProps {
  bundle: CompiledLawfloBundle;
  events: MatterShiftEvent[];
  onSourceOpen?: (sourceRefId: string) => void;
}

export function EvidenceInspector({
  bundle,
  events,
  onSourceOpen,
}: EvidenceInspectorProps) {
  const [selectedStepId, setSelectedStepId] = useState(
    bundle.useCase.steps[0]?.id ?? "",
  );
  const [openSourceIds, setOpenSourceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const graph = useMemo(
    () => buildEvidenceGraph(bundle, events),
    [bundle, events],
  );
  const selectedStep =
    bundle.useCase.steps.find((step) => step.id === selectedStepId) ??
    bundle.useCase.steps[0];
  const sources = bundle.useCase.sources.filter((source) =>
    selectedStep?.sourceRefIds.includes(source.id),
  );
  const observedNodes = graph.nodes.filter((node) => node.type === "event");
  const derivedArtifactIds = new Set([
    `artifact:${bundle.episode.id}`,
    `artifact:${bundle.workflowGuide.id}`,
  ]);
  const derivedEventLabels = Array.from(
    new Set(
      graph.edges
        .filter(
          (edge) =>
            edge.relation === "observed_in" && derivedArtifactIds.has(edge.from),
        )
        .map((edge) => graph.nodes.find((node) => node.id === edge.to)?.label)
        .filter((label): label is string => Boolean(label))
        .map((label) =>
          label === "use_case_compiled"
            ? "Bundle compilation observed"
            : label.replaceAll("_", " "),
        ),
    ),
  );

  function toggleSource(sourceRefId: string) {
    const isOpen = openSourceIds.has(sourceRefId);
    const next = new Set(openSourceIds);
    if (isOpen) {
      next.delete(sourceRefId);
    } else {
      next.add(sourceRefId);
      onSourceOpen?.(sourceRefId);
    }
    setOpenSourceIds(next);
  }

  return (
    <section className="evidence-inspector" aria-labelledby="evidence-title">
      <div className="evidence-heading">
        <div>
          <p className="eyebrow">Judge-visible provenance</p>
          <h2 id="evidence-title">Evidence chain</h2>
          <p>
            Inspect one instruction from synthetic policy to approved learning
            artefact to a genuinely observed prototype action.
          </p>
        </div>
        <div className="manifest-stamp">
          <span>Exact version</span>
          <strong>{bundle.manifest.approvalFingerprint}</strong>
          <small>Policy v{bundle.manifest.sourceVersion}</small>
        </div>
      </div>

      <div className="evidence-step-picker" aria-label="Workflow instructions">
        {bundle.useCase.steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={step.id === selectedStep?.id ? "active" : ""}
            aria-pressed={step.id === selectedStep?.id}
            onClick={() => setSelectedStepId(step.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step.title}
          </button>
        ))}
      </div>

      {selectedStep && (
        <div className="evidence-chain">
          <article className="chain-card">
            <span className="chain-label">Supporting sources</span>
            <div className="source-stack">
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={openSourceIds.has(source.id) ? "expanded" : ""}
                  aria-expanded={openSourceIds.has(source.id)}
                  onClick={() => toggleSource(source.id)}
                >
                  <strong>{source.title}</strong>
                  <span>
                    v{source.version} · {openSourceIds.has(source.id) ? "close" : "open"} excerpt
                  </span>
                  <p>{source.excerpt}</p>
                </button>
              ))}
            </div>
          </article>

          <div className="chain-arrow" aria-hidden="true">→</div>

          <article className="chain-card chain-statement">
            <span className="chain-label">Instruction</span>
            <h3>{selectedStep.title}</h3>
            <p>{selectedStep.instruction}</p>
            <small>
              {selectedStep.tool} · {selectedStep.riskLevel} risk
            </small>
          </article>

          <div className="chain-arrow" aria-hidden="true">→</div>

          <article className="chain-card">
            <span className="chain-label">Derived surfaces</span>
            <ul className="artifact-stack">
              <li><strong>Peer episode</strong><span>Beat preserves this step and its sources</span></li>
              <li><strong>Activation card</strong><span>Same instruction at the point of work</span></li>
            </ul>
          </article>
        </div>
      )}

      {derivedEventLabels.length > 0 && (
        <div className="observed-proof">
          <span className="chain-label">Observed proof</span>
          {derivedEventLabels.map((label) => (
            <strong key={label}>{label}</strong>
          ))}
        </div>
      )}

      <footer className="evidence-footer">
        <span>{graph.nodes.length} lineage nodes</span>
        <span>{graph.edges.length} verified links</span>
        <span>{observedNodes.length} observed actions</span>
        <span>Approved by {bundle.manifest.approvedBy}</span>
      </footer>
    </section>
  );
}
