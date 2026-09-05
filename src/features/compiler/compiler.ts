import { demoUseCase } from "../../demo/demoUseCase";
import { validateUseCase, type UseCase } from "../../domain/mattershift";
import { validateDemoPack, type DemoPack } from "../studio/demoPack";

export async function prepareDraftFromDemoPack(pack: DemoPack): Promise<UseCase> {
  const validation = validateDemoPack(pack);
  if (!validation.valid) {
    throw new Error(`Cannot prepare draft: ${validation.errors.join(" ")}`);
  }

  const draft: UseCase = {
    ...structuredClone(demoUseCase),
    approvalStatus: "draft",
    approvedBy: undefined,
    approvalRecord: undefined,
  };
  const domainValidation = validateUseCase(draft);
  if (!domainValidation.valid) {
    throw new Error(
      `Draft preparation produced invalid data: ${domainValidation.errors.join(" ")}`,
    );
  }
  return draft;
}
