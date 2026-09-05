import { isApprovalCurrent } from "../../domain/approval";
import type { UseCase } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";

export interface ChangeImpactResult { approvalStillCurrent: boolean; affectedStepIds: string[]; affectedRuleIds: string[]; affectedArtifactIds: string[]; reasons: string[]; }
function changedIds<T extends { id: string }>(before: T[], after: T[]): string[] {
  const previous = new Map(before.map((item) => [item.id, JSON.stringify(item)]));
  return [...new Set([...after.filter((item) => previous.get(item.id) !== JSON.stringify(item)).map((item) => item.id), ...before.filter((item) => !after.some((candidate) => candidate.id === item.id)).map((item) => item.id)])];
}
export function assessChangeImpact(previousUseCase: UseCase, changedUseCase: UseCase, previousBundle: CompiledLawfloBundle): ChangeImpactResult {
  const sourceVersionChanged = previousUseCase.sourceVersion !== changedUseCase.sourceVersion;
  const affectedRuleIds = changedIds(previousUseCase.playbookRules, changedUseCase.playbookRules);
  const affectedStepIds = sourceVersionChanged ? changedUseCase.steps.map((step) => step.id) : changedIds(previousUseCase.steps, changedUseCase.steps);
  const materialChange = sourceVersionChanged || affectedRuleIds.length > 0 || affectedStepIds.length > 0;
  return {
    approvalStillCurrent: !materialChange && isApprovalCurrent(changedUseCase),
    affectedStepIds,
    affectedRuleIds,
    affectedArtifactIds: materialChange ? Object.values(previousBundle.manifest.artifactIds) : [],
    reasons: materialChange ? [sourceVersionChanged ? `Source version changed from ${previousUseCase.sourceVersion} to ${changedUseCase.sourceVersion}.` : "Approved workflow content changed.", "Human reapproval and artefact regeneration are required before learners see this update."] : [],
  };
}
