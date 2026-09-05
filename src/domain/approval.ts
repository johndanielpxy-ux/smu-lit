import {
  validateUseCase,
  type ContractScenario,
  type UseCase,
} from "./mattershift";

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  return `{${Object.keys(objectValue)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(objectValue[key])}`)
    .join(",")}}`;
}

function fnv1a32(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function useCaseMaterialFingerprint(useCase: UseCase): string {
  const {
    approvalStatus: _approvalStatus,
    approvedBy: _approvedBy,
    approvalRecord: _approvalRecord,
    ...materialContent
  } = useCase;

  return `msc-${fnv1a32(stableSerialize(materialContent))}`;
}

export function trainingScenarioFingerprint(
  scenario: ContractScenario,
): string {
  return `scenario-${fnv1a32(stableSerialize(scenario))}`;
}

export function isApprovalCurrent(useCase: UseCase): boolean {
  if (
    (useCase.approvalStatus !== "human_approved" &&
      useCase.approvalStatus !== "published") ||
    !useCase.approvedBy?.trim() ||
    !useCase.approvalRecord
  ) {
    return false;
  }

  return (
    useCase.approvedBy === useCase.approvalRecord.approvedBy &&
    useCase.sourceVersion === useCase.approvalRecord.sourceVersion &&
    useCaseMaterialFingerprint(useCase) ===
      useCase.approvalRecord.contentFingerprint
  );
}

export function approveUseCase(
  useCase: UseCase,
  approvedBy: string,
  approvedAt = new Date().toISOString(),
): UseCase {
  const normalizedApprover = approvedBy.trim();
  if (!normalizedApprover) {
    throw new Error("A named human approver is required.");
  }

  const validation = validateUseCase({
    ...useCase,
    approvalStatus: "draft",
    approvedBy: undefined,
    approvalRecord: undefined,
  });
  if (!validation.valid) {
    throw new Error(
      `Cannot approve an invalid use case: ${validation.errors.join(" ")}`,
    );
  }

  const contentFingerprint = useCaseMaterialFingerprint(useCase);
  return {
    ...structuredClone(useCase),
    approvalStatus: "human_approved",
    approvedBy: normalizedApprover,
    approvalRecord: {
      approvedBy: normalizedApprover,
      approvedAt,
      contentFingerprint,
      sourceVersion: useCase.sourceVersion,
    },
  };
}

export function invalidateApprovalIfChanged(
  approvedUseCase: UseCase,
  candidate: UseCase,
): UseCase {
  const approvalRecord = approvedUseCase.approvalRecord;
  if (
    approvalRecord &&
    useCaseMaterialFingerprint(candidate) === approvalRecord.contentFingerprint &&
    candidate.sourceVersion === approvalRecord.sourceVersion
  ) {
    return {
      ...structuredClone(candidate),
      approvalStatus: approvedUseCase.approvalStatus,
      approvedBy: approvedUseCase.approvedBy,
      approvalRecord: structuredClone(approvalRecord),
    };
  }

  return {
    ...structuredClone(candidate),
    approvalStatus: "draft",
    approvedBy: undefined,
    approvalRecord: undefined,
  };
}
