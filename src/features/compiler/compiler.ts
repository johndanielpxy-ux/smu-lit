import { demoUseCase } from "../../demo/demoUseCase";
import { validateUseCase, type UseCase } from "../../domain/mattershift";

export interface CompilerInput {
  contributorName: string;
  contributorRole: string;
  targetRole: string;
  practiceGroup: string;
  workTrigger: string;
  problem: string;
  expectedOutcome: string;
  consentConfirmed: boolean;
  sourceText: string;
}

const requiredTextFields: Array<keyof Omit<CompilerInput, "consentConfirmed">> = [
  "contributorName",
  "contributorRole",
  "targetRole",
  "practiceGroup",
  "workTrigger",
  "problem",
  "expectedOutcome",
  "sourceText",
];

function toId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function compileUseCase(input: CompilerInput): Promise<UseCase> {
  for (const field of requiredTextFields) {
    if (!input[field].trim()) {
      throw new Error(`${field} is required.`);
    }
  }

  if (!input.consentConfirmed) {
    throw new Error("Contributor consent must be confirmed before compilation.");
  }

  const compiled: UseCase = {
    ...structuredClone(demoUseCase),
    id: `${toId(input.practiceGroup)}-${toId(input.workTrigger)}`,
    contributorName: input.contributorName.trim(),
    contributorRole: input.contributorRole.trim(),
    targetRole: input.targetRole.trim(),
    practiceGroup: input.practiceGroup.trim(),
    workTrigger: input.workTrigger.trim(),
    problem: input.problem.trim(),
    expectedOutcome: input.expectedOutcome.trim(),
    consentConfirmed: input.consentConfirmed,
    approvalStatus: "draft",
    approvedBy: undefined,
  };

  const validation = validateUseCase(compiled);
  if (!validation.valid) {
    throw new Error(`Compilation produced invalid data: ${validation.errors.join(" ")}`);
  }

  return compiled;
}
