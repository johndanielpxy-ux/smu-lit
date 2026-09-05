import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LearningReviewResult } from "./coachingEngine";
import { LearningReview } from "./LearningReview";

const result: LearningReviewResult = {
  dimensions: {
    ai_output_verification: { state: "completed_with_guidance", observedEvidenceIds: ["trace-1"], sourceRefIds: ["ai-verification-policy"], explanation: "You corrected the AI draft after a focused hint." },
    clause_comparison: { state: "revisit_step", observedEvidenceIds: [], sourceRefIds: ["material-redline-rule"], explanation: "Compare the changed liability language.", repairTask: "compare_clauses" },
    playbook_application: { state: "completed_independently", observedEvidenceIds: ["trace-2"], sourceRefIds: ["renewal-routing-playbook"], explanation: "You opened the governing rule." },
    risk_reasoning: { state: "completed_independently", observedEvidenceIds: ["trace-3"], sourceRefIds: ["material-redline-rule"], explanation: "You selected legal review." },
    human_responsibility: { state: "completed_independently", observedEvidenceIds: ["trace-3"], sourceRefIds: ["human-responsibility"], explanation: "You made the final decision." },
    audit_completeness: { state: "completed_independently", observedEvidenceIds: ["trace-4"], sourceRefIds: ["renewal-routing-playbook"], explanation: "The decision trail is complete." },
  }, repairTasks: ["compare_clauses"], rehearsalComplete: false,
};

describe("LearningReview", () => {
  it("offers constructive, source-linked repair without certification language", () => {
    const onRepair = vi.fn(); const onOpenGuide = vi.fn(); const onOpenSource = vi.fn();
    const { container } = render(<LearningReview result={result} onRepair={onRepair} onOpenGuide={onOpenGuide} onOpenSource={onOpenSource} />);
    expect(screen.getByRole("heading", { name: /what you handled/i })).toBeVisible();
    expect(container.textContent?.toLowerCase()).not.toMatch(/\b(pass|fail|fitness|certified)\b/);
    fireEvent.click(screen.getByRole("button", { name: /repair clause comparison/i }));
    expect(onRepair).toHaveBeenCalledWith("compare_clauses");
    fireEvent.click(screen.getByRole("button", { name: /open material-redline-rule source/i }));
    expect(onOpenSource).toHaveBeenCalledWith("material-redline-rule");
    fireEvent.click(screen.getByRole("button", { name: /open workflow guide/i }));
    expect(onOpenGuide).toHaveBeenCalledOnce();
  });
});
