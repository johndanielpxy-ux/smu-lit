import type {
  MatterShiftEvent,
  MatterShiftEventType,
  UseCase,
} from "./mattershift";

export type MatterShiftEventMetadata = NonNullable<MatterShiftEvent["metadata"]>;

export type MatterShiftEventReporter = (
  eventType: MatterShiftEventType,
  metadata?: MatterShiftEventMetadata,
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
  useCase: Pick<UseCase, "id" | "sourceVersion" | "approvalRecord">,
  record: (
    event: Omit<MatterShiftEvent, "id" | "occurredAt">,
  ) => MatterShiftEvent,
): MatterShiftEventReporter {
  return (type, metadata) => {
    record({
      useCaseId: useCase.id,
      type,
      metadata: {
        ...metadata,
        sourceVersion: useCase.sourceVersion,
        ...(useCase.approvalRecord
          ? { approvalFingerprint: useCase.approvalRecord.contentFingerprint }
          : {}),
      },
    });
  };
}
