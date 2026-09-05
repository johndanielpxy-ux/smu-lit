import type {
  EventScope,
  MatterShiftEvent,
  MatterShiftEventType,
  UseCase,
} from "./mattershift";

export type MatterShiftEventMetadata = NonNullable<MatterShiftEvent["metadata"]>;

export interface ReportEventOptions {
  idempotencyKey?: string;
}

export type MatterShiftEventReporter = (
  eventType: MatterShiftEventType,
  metadata?: MatterShiftEventMetadata,
  options?: ReportEventOptions,
) => void;

export interface LegalEngineerStudioProps {
  initialUseCase: UseCase;
  onCompile: (useCase: UseCase) => void;
  onEvent: MatterShiftEventReporter;
}

export interface EpisodePlayerProps {
  useCase: UseCase;
  onEvent: MatterShiftEventReporter;
  onComplete: () => void;
}

export interface LearnerFlowProps {
  useCase: UseCase;
  onEvent: MatterShiftEventReporter;
  onComplete: () => void;
}

export interface ActivationCardProps {
  useCase: UseCase;
  onEvent: MatterShiftEventReporter;
}

export function createScopedEventReporter(
  scope: EventScope,
  record: (
    event: Omit<MatterShiftEvent, "id" | "occurredAt">,
    options?: ReportEventOptions,
  ) => MatterShiftEvent,
): MatterShiftEventReporter {
  const scopeMetadata: MatterShiftEventMetadata = {
    sourceVersion: scope.sourceVersion,
    ...(scope.contractVersion
      ? { contractVersion: scope.contractVersion }
      : {}),
    ...(scope.approvalFingerprint
      ? { approvalFingerprint: scope.approvalFingerprint }
      : {}),
    ...(scope.bundleId ? { bundleId: scope.bundleId } : {}),
  };

  return (type, metadata, options) => {
    record(
      {
        useCaseId: scope.useCaseId,
        type,
        metadata: { ...metadata, ...scopeMetadata },
      },
      options,
    );
  };
}
