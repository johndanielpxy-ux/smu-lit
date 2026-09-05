import type { CoachingDimension, CoachingPlan } from "../compiler/bundleCompiler";
import type { LearningState, RehearsalState, RehearsalTask } from "../rehearsal/rehearsalReducer";

export type SupportLevel = "orientation" | "hint" | "worked_example" | "focused_repair";
export interface LearningDimensionResult { state: LearningState; observedEvidenceIds: string[]; sourceRefIds: string[]; explanation: string; repairTask?: RehearsalTask; }
export interface LearningReviewResult { dimensions: Record<CoachingDimension, LearningDimensionResult>; repairTasks: RehearsalTask[]; rehearsalComplete: boolean; }

const config: Record<CoachingDimension, { actions: string[]; task: RehearsalTask; title: string }> = {
  ai_output_verification: { actions: ["finding_corrected", "finding_confirmed"], task: "verify_findings", title: "AI-output verification" },
  clause_comparison: { actions: ["clause_opened"], task: "compare_clauses", title: "Clause comparison" },
  playbook_application: { actions: ["rule_opened"], task: "apply_playbook", title: "Playbook application" },
  risk_reasoning: { actions: ["route_accepted"], task: "choose_route", title: "Risk reasoning" },
  human_responsibility: { actions: ["route_accepted"], task: "choose_route", title: "Human responsibility" },
  audit_completeness: { actions: ["audit_opened"], task: "inspect_audit", title: "Audit completeness" },
};

export function deriveLearningReview(state: RehearsalState, plan: CoachingPlan): LearningReviewResult {
  const dimensions = Object.fromEntries((Object.keys(config) as CoachingDimension[]).map((dimension) => {
    const item = config[dimension];
    const evidence = state.trace.filter((entry) => item.actions.includes(entry.action) && entry.safe);
    const guided = (state.hintCounts[item.task] ?? 0) > 0 || state.trace.some((entry) => (entry.action === "route_rejected" || entry.action === "repair_completed") && (entry.task === item.task || item.task === "choose_route"));
    const observed = evidence.length > 0;
    const dimensionState: LearningState = observed ? (guided ? "completed_with_guidance" : "completed_independently") : "revisit_step";
    return [dimension, {
      state: dimensionState,
      observedEvidenceIds: evidence.map((entry) => entry.id),
      sourceRefIds: [...plan.sourceRefIdsByDimension[dimension]],
      explanation: observed ? `${item.title} was demonstrated${guided ? " after guidance" : " through your own action"}.` : `${item.title} needs one focused revisit with the approved source open.`,
      ...(observed ? {} : { repairTask: item.task }),
    } satisfies LearningDimensionResult];
  })) as unknown as Record<CoachingDimension, LearningDimensionResult>;
  const repairTasks = [...new Set(plan.safetyCriticalDimensions.map((dimension) => dimensions[dimension].repairTask).filter((task): task is RehearsalTask => Boolean(task)))];
  return { dimensions, repairTasks, rehearsalComplete: state.task === "complete" && repairTasks.length === 0 };
}
