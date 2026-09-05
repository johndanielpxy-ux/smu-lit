import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import type { LearningReviewResult } from "../coaching/coachingEngine";
import { WorkflowGuide } from "./WorkflowGuide";

const bundle = compileApprovedTrainingModule(approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"), contractTrainingContent);
const review = { dimensions: Object.fromEntries(Object.keys(bundle.coaching.sourceRefIdsByDimension).map((key) => [key, { state: key === "clause_comparison" ? "completed_with_guidance" : "completed_independently", observedEvidenceIds: [], sourceRefIds: bundle.coaching.sourceRefIdsByDimension[key as keyof typeof bundle.coaching.sourceRefIdsByDimension], explanation: "Observed." }])) as unknown as LearningReviewResult["dimensions"], repairTasks: [], rehearsalComplete: true };

describe("WorkflowGuide", () => {
  it("shows the trigger, legal AI sequence, verification, escalation and current sources", () => {
    const onEvent = vi.fn(); const onStartSoloReplay = vi.fn();
    const { rerender } = render(<WorkflowGuide bundle={bundle} review={review} onEvent={onEvent} onStartSoloReplay={onStartSoloReplay} />);
    expect(screen.getByText(bundle.workflowGuide.workTrigger)).toBeVisible();
    expect(screen.getByRole("heading", { name: /watch carefully/i })).toBeVisible();
    expect(screen.getByText(/compare each extracted term/i)).toBeVisible();
    expect(screen.getByText(/material change to an approved standard term/i)).toBeVisible();
    expect(screen.getAllByText(/version 2026.2/i).length).toBeGreaterThan(0);
    rerender(<WorkflowGuide bundle={bundle} review={review} onEvent={onEvent} onStartSoloReplay={onStartSoloReplay} />);
    expect(onEvent.mock.calls.filter(([type]) => type === "workflow_guide_opened")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /try the marigold matter/i }));
    expect(onStartSoloReplay).toHaveBeenCalledOnce();
  });
});
