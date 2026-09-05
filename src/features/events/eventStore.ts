import type {
  MatterShiftEvent,
  MatterShiftEventType,
} from "../../domain/mattershift";

const allowedEventTypes: ReadonlySet<MatterShiftEventType> = new Set([
  "use_case_compiled",
  "source_opened",
  "human_approved",
  "episode_started",
  "checkpoint_answered",
  "rehearsal_passed",
  "activation_opened",
]);

let events: MatterShiftEvent[] = [];
let eventSequence = 0;

export function recordEvent(
  event: Omit<MatterShiftEvent, "id" | "occurredAt">,
): MatterShiftEvent {
  if (!allowedEventTypes.has(event.type)) {
    throw new Error(`Unsupported MatterShift event type: ${event.type}`);
  }

  eventSequence += 1;
  const stored: MatterShiftEvent = {
    ...event,
    id: `event-${eventSequence}`,
    occurredAt: new Date().toISOString(),
    metadata: event.metadata ? { ...event.metadata } : undefined,
  };

  events = [...events, stored];
  return stored;
}

export function getEvents(useCaseId: string): MatterShiftEvent[] {
  return events
    .filter((event) => event.useCaseId === useCaseId)
    .map((event) => ({
      ...event,
      metadata: event.metadata ? { ...event.metadata } : undefined,
    }));
}

export function resetDemo(): void {
  events = [];
  eventSequence = 0;
}
