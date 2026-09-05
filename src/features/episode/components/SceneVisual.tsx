import React from "react";
import type { EpisodeScene } from "../types";
import type { UseCase } from "../../../domain/mattershift";

interface SceneVisualProps {
  scene: EpisodeScene;
  useCase: UseCase;
}

export const SceneVisual: React.FC<SceneVisualProps> = ({ scene, useCase }) => {
  return (
    <div className="scene-visual-container" data-testid={`scene-visual-${scene.id}`}>
      {scene.visualType === "old_way" && (
        <div className="visual-card visual-old-way">
          <div className="visual-badge warning-badge">⚠️ Unstructured Legacy Process</div>
          <div className="visual-split">
            <div className="mockup-window glass-panel">
              <div className="window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="window-title">Unorganized Meeting Notes</span>
              </div>
              <div className="window-body text-xs text-muted">
                <p className="line-scratch">...Client disclosed restructuring details in Jurisdiction X...</p>
                <p className="line-scratch">...Need research on Sec 211B moratorium effect...</p>
                <p className="line-alert">🚨 Associate pastes full 12-page raw transcript into Public Web AI...</p>
              </div>
            </div>
            <div className="metric-box warning-box">
              <div className="metric-val">45+ min</div>
              <div className="metric-label">Manual turnaround time</div>
              <div className="metric-sub text-rose">High data leak vulnerability</div>
            </div>
          </div>
        </div>
      )}

      {scene.visualType === "discovery" && (
        <div className="visual-card visual-discovery">
          <div className="visual-badge verified-badge">✨ Validated Standard by {useCase.contributorName}</div>
          <div className="flow-pipeline">
            <div className="pipeline-node active-node">
              <div className="node-icon">🎙️</div>
              <div className="node-title">Teams Audio</div>
              <div className="node-tag">Authorised M365</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node active-node">
              <div className="node-icon">🤖</div>
              <div className="node-title">Copilot Draft</div>
              <div className="node-tag">Minutes & Actions</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node active-node highlight-node">
              <div className="node-icon">⚖️</div>
              <div className="node-title">Legal AI (Bounded)</div>
              <div className="node-tag">Zero Client Leak</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node active-node">
              <div className="node-icon">✉️</div>
              <div className="node-title">Outlook Update</div>
              <div className="node-tag">Partner Approved</div>
            </div>
          </div>
          <div className="pipeline-footer-info">
            <span className="info-chip">Governed SOP v{useCase.sourceVersion}</span>
            <span className="info-chip">Target Role: {useCase.targetRole}</span>
            <span className="info-chip">Practice: {useCase.practiceGroup}</span>
          </div>
        </div>
      )}

      {scene.visualType === "workflow_step" && (
        <div className="visual-card visual-workflow">
          <div className="visual-badge blue-badge">Step 1 & 2: Teams Transcript to Copilot Draft</div>
          <div className="mockup-window glass-panel">
            <div className="window-header">
              <span className="dot"></span>
              <span className="window-title">Microsoft 365 Copilot in Teams</span>
            </div>
            <div className="window-body">
              <div className="chat-bubble user-prompt">
                <strong>Prompt:</strong> Summarize key actions, assigned partners, and outstanding statutory questions from today's client conference.
              </div>
              <div className="chat-bubble ai-response">
                <div className="response-header">📋 Copilot Generated Actions:</div>
                <ul className="response-list">
                  <li>✅ <strong>Action 1:</strong> Draft urgent advisory on moratorium provisions.</li>
                  <li>🔍 <strong>Open Question:</strong> Does Court sanction require creditor consent under s210?</li>
                  <li>⏱️ <strong>Due:</strong> Today 5:00 PM (Assigned: Associate Team).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {scene.visualType === "risk_checkpoint" && (
        <div className="visual-card visual-risk-decision">
          <div className="visual-badge amber-badge">⚡ Decision Point: Data Sanitisation Gate</div>
          <div className="comparison-grid">
            <div className="comparison-col unsafe-col">
              <div className="col-header">❌ Unsafe Shortcut</div>
              <div className="col-content">
                <p>Paste raw unredacted notes with client names, deal numbers, and private financials into an unvetted model.</p>
                <span className="status-pill status-fail">Breach of Rule 1.02</span>
              </div>
            </div>
            <div className="comparison-col safe-col">
              <div className="col-header">🛡️ Firm-Authorised Workflow</div>
              <div className="col-content">
                <p>Formulate a sanitized, bounded legal inquiry inside the secure environment without confidential party identifiers.</p>
                <span className="status-pill status-pass">Fully Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {scene.visualType === "payoff" && (
        <div className="visual-card visual-payoff">
          <div className="visual-badge green-badge">🎯 Human Verification & Fast Delivery</div>
          <div className="payoff-grid">
            <div className="mockup-window glass-panel">
              <div className="window-header">
                <span className="window-title">Primary Citation Inspector</span>
              </div>
              <div className="window-body">
                <div className="citation-row verified">
                  <span className="citation-icon">📜</span>
                  <div className="citation-info">
                    <strong>Insolvency, Restructuring and Dissolution Act 2018 (s64)</strong>
                    <div className="citation-sub">Matched to source excerpt · Verified by Associate</div>
                  </div>
                  <span className="verified-tag">✓ Verified</span>
                </div>
              </div>
            </div>
            <div className="metric-box success-box">
              <div className="metric-val">8 min</div>
              <div className="metric-label">Total elapsed time</div>
              <div className="metric-sub text-emerald">100% Policy Compliant</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
