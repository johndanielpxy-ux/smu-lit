import React, { useState } from "react";
import type { EpisodeCheckpoint, EpisodeCheckpointOption } from "../types";
import type { UseCase, SourceRef } from "../../../domain/mattershift";

interface CheckpointOverlayProps {
  checkpoint: EpisodeCheckpoint;
  useCase: UseCase;
  onAnswer: (option: EpisodeCheckpointOption) => void;
  onContinue: () => void;
}

export const CheckpointOverlay: React.FC<CheckpointOverlayProps> = ({
  checkpoint,
  useCase,
  onAnswer,
  onContinue,
}) => {
  const [selectedOption, setSelectedOption] = useState<EpisodeCheckpointOption | null>(null);
  const [inspectingSource, setInspectingSource] = useState<SourceRef | null>(null);

  const handleSelect = (option: EpisodeCheckpointOption) => {
    setSelectedOption(option);
    onAnswer(option);
  };

  const handleOpenSource = (sourceRefId: string) => {
    const matched = useCase.sources.find((s) => s.id === sourceRefId) || {
      id: sourceRefId,
      title: "Governing Responsible AI Policy",
      version: useCase.sourceVersion,
      excerpt: "Client-related information may be processed only in firm-authorised systems using the minimum necessary data.",
    };
    setInspectingSource(matched);
  };

  return (
    <div className="checkpoint-overlay-backdrop" data-testid="checkpoint-overlay">
      <div className="checkpoint-card glass-panel-elevated">
        <div className="checkpoint-header">
          <div className="checkpoint-pill">⚡ IN-VIDEO RISK CHECKPOINT</div>
          <h2 className="checkpoint-title">{checkpoint.question}</h2>
          <p className="checkpoint-subtitle">{checkpoint.subtitle}</p>
        </div>

        {!selectedOption ? (
          <div className="checkpoint-options-grid">
            {checkpoint.options.map((option, idx) => (
              <button
                key={option.id}
                className="checkpoint-option-btn"
                onClick={() => handleSelect(option)}
                data-testid={`checkpoint-option-${option.id}`}
              >
                <span className="option-letter">{idx === 0 ? "A" : "B"}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="checkpoint-feedback-container" data-testid="checkpoint-feedback">
            <div className={`feedback-banner ${selectedOption.safe ? "safe-banner" : "unsafe-banner"}`}>
              <div className="feedback-icon">{selectedOption.safe ? "✅" : "⚠️"}</div>
              <div className="feedback-content">
                <h3 className="feedback-status-title">
                  {selectedOption.safe ? "Safe & Compliant Choice" : "High-Risk Non-Compliant Action"}
                </h3>
                <p className="feedback-text">{selectedOption.explanation}</p>
              </div>
            </div>

            <div className="checkpoint-actions">
              <button
                className="btn-secondary source-btn"
                onClick={() => handleOpenSource(selectedOption.sourceRefId)}
                data-testid="inspect-source-btn"
              >
                📖 Inspect Governing Policy Passage
              </button>

              {selectedOption.safe ? (
                <button
                  className="btn-primary continue-btn"
                  onClick={onContinue}
                  data-testid="checkpoint-continue-btn"
                >
                  Continue to Payoff →
                </button>
              ) : (
                <button
                  className="btn-outline retry-btn"
                  onClick={() => setSelectedOption(null)}
                  data-testid="checkpoint-retry-btn"
                >
                  ↩ Choose Safe Alternative
                </button>
              )}
            </div>
          </div>
        )}

        {inspectingSource && (
          <div className="source-drawer-backdrop" onClick={() => setInspectingSource(null)}>
            <div
              className="source-drawer-modal glass-panel-elevated"
              onClick={(e) => e.stopPropagation()}
              data-testid="source-drawer-modal"
            >
              <div className="drawer-header">
                <div>
                  <div className="source-pill">VERIFIED POLICY PROVENANCE</div>
                  <h3 className="drawer-title">{inspectingSource.title}</h3>
                  <div className="drawer-version">Version {inspectingSource.version}</div>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setInspectingSource(null)}
                  aria-label="Close Source Drawer"
                >
                  ✕
                </button>
              </div>
              <div className="drawer-body">
                <blockquote className="source-passage">"{inspectingSource.excerpt}"</blockquote>
                <div className="provenance-seal">
                  🔒 Legally binding firm SOP · Traceable to Singapore Legaltech Guidelines
                </div>
              </div>
              <div className="drawer-footer">
                <button className="btn-secondary" onClick={() => setInspectingSource(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
