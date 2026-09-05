import React from "react";
import type { UseCase } from "../../../domain/mattershift";

interface CompletionCardProps {
  useCase: UseCase;
  onComplete: () => void;
  onReplay: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  useCase,
  onComplete,
  onReplay,
}) => {
  return (
    <div className="completion-card-container glass-panel-elevated" data-testid="completion-card">
      <div className="completion-badge">🏆 EPISODE MASTERED</div>
      <h2 className="completion-title">You've Unlocked the Governed Meeting-to-Update Workflow</h2>
      <p className="completion-subtitle">
        Validated by {useCase.contributorName} · Formally approved for {useCase.practiceGroup}
      </p>

      <div className="completion-metrics-grid">
        <div className="comp-metric-box">
          <div className="metric-num text-emerald">100%</div>
          <div className="metric-txt">Risk Checkpoint Passed</div>
        </div>
        <div className="comp-metric-box">
          <div className="metric-num text-sky">8 min</div>
          <div className="metric-txt">Governed Target Time (vs 45m)</div>
        </div>
        <div className="comp-metric-box">
          <div className="metric-num text-amber">0%</div>
          <div className="metric-txt">Data Leakage Risk</div>
        </div>
      </div>

      <div className="completion-takeaways">
        <h4 className="takeaways-header">Key Workflow Takeaways:</h4>
        <ul className="takeaways-list">
          <li>🔒 <strong>Confidentiality First:</strong> Keep unredacted transcripts inside M365; only feed sanitised questions to legal AI.</li>
          <li>🔍 <strong>Source Verification:</strong> Never rely on raw AI summaries without checking primary statutory citations.</li>
          <li>✍️ <strong>Professional Responsibility:</strong> Human partner/associate review remains mandatory before dispatch.</li>
        </ul>
      </div>

      <div className="completion-cta-row">
        <button
          className="btn-primary dominant-cta-btn"
          onClick={onComplete}
          data-testid="practise-workflow-btn"
        >
          🚀 Practise this workflow in interactive simulator →
        </button>
        <button
          className="btn-secondary"
          onClick={onReplay}
          data-testid="replay-episode-btn"
        >
          🔄 Replay Episode
        </button>
      </div>
    </div>
  );
};
