import type {
  MatterShiftEvent,
  MatterShiftEventType,
} from "../../domain/mattershift";

const STORAGE_KEY = "mattershift.observed-events.v1";
const SCHEMA_VERSION = 1;

const allowedEventTypes: ReadonlySet<MatterShiftEventType> = new Set([
  "use_case_compiled",
  "source_opened",
  "human_approved",
  "episode_started",
  "checkpoint_answered",
  "rehearsal_passed",
  "activation_opened",
]);

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RecordEventOptions {
  idempotencyKey?: string;
}

export interface ObservedEventSummary {
  useCaseId: string;
  totalObserved: number;
  counts: Partial<Record<MatterShiftEventType, number>>;
  lastOccurredAt?: string;
}

export interface MatterShiftEventStore {
  record(
    event: Omit<MatterShiftEvent, "id" | "occurredAt">,
    options?: RecordEventOptions,
  ): MatterShiftEvent;
  getEvents(useCaseId: string, sourceVersion?: string): MatterShiftEvent[];
  getSummary(useCaseId: string, sourceVersion?: string): ObservedEventSummary;
  reset(): void;
}

interface StoredEnvelope {
  schemaVersion: 1;
  sequence: number;
  events: MatterShiftEvent[];
  idempotency: Record<string, string>;
}

interface CreateEventStoreOptions {
  storage?: KeyValueStorage;
  storageKey?: string;
  now?: () => string;
}

function cloneEvent(event: MatterShiftEvent): MatterShiftEvent {
  return {
    ...event,
    metadata: event.metadata ? { ...event.metadata } : undefined,
  };
}

function isJsonSafeMetadata(
  metadata: MatterShiftEvent["metadata"] | unknown,
): metadata is MatterShiftEvent["metadata"] {
  return (
    metadata === undefined ||
    (typeof metadata === "object" &&
      metadata !== null &&
      !Array.isArray(metadata) &&
      Object.values(metadata).every(
        (item) =>
          typeof item === "string" ||
          typeof item === "boolean" ||
          (typeof item === "number" && Number.isFinite(item)),
      ))
  );
}

function isMatterShiftEvent(value: unknown): value is MatterShiftEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<MatterShiftEvent>;
  return (
    typeof event.id === "string" &&
    /^event-\d+$/.test(event.id) &&
    typeof event.useCaseId === "string" &&
    event.useCaseId.length > 0 &&
    typeof event.occurredAt === "string" &&
    !Number.isNaN(Date.parse(event.occurredAt)) &&
    typeof event.type === "string" &&
    allowedEventTypes.has(event.type as MatterShiftEventType) &&
    isJsonSafeMetadata(event.metadata)
  );
}

function isEnvelopeConsistent(parsed: Partial<StoredEnvelope>): boolean {
  if (
    parsed.schemaVersion !== SCHEMA_VERSION ||
    !Number.isInteger(parsed.sequence) ||
    (parsed.sequence ?? -1) < 0 ||
    !Array.isArray(parsed.events) ||
    !parsed.events.every(isMatterShiftEvent) ||
    !parsed.idempotency ||
    typeof parsed.idempotency !== "object" ||
    Array.isArray(parsed.idempotency)
  ) {
    return false;
  }

  const eventIds = parsed.events.map((event) => event.id);
  const uniqueEventIds = new Set(eventIds);
  const maximumEventSequence = Math.max(
    0,
    ...eventIds.map((id) => Number(id.slice("event-".length))),
  );
  const idempotencyTargets = Object.values(parsed.idempotency);

  return (
    uniqueEventIds.size === eventIds.length &&
    parsed.sequence! >= maximumEventSequence &&
    idempotencyTargets.every(
      (eventId) =>
        typeof eventId === "string" && uniqueEventIds.has(eventId),
    )
  );
}

function stableMetadata(
  metadata: MatterShiftEvent["metadata"],
): string {
  if (!metadata) return "{}";
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(metadata).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );
}

function isSameObservedAction(
  stored: MatterShiftEvent,
  candidate: Omit<MatterShiftEvent, "id" | "occurredAt">,
): boolean {
  return (
    stored.useCaseId === candidate.useCaseId &&
    stored.type === candidate.type &&
    stableMetadata(stored.metadata) === stableMetadata(candidate.metadata)
  );
}

function emptyEnvelope(): StoredEnvelope {
  return {
    schemaVersion: SCHEMA_VERSION,
    sequence: 0,
    events: [],
    idempotency: {},
  };
}

function readEnvelope(
  storage: KeyValueStorage | undefined,
  storageKey: string,
): StoredEnvelope {
  if (!storage) return emptyEnvelope();

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return emptyEnvelope();
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope>;
    if (!isEnvelopeConsistent(parsed)) {
      throw new Error("Invalid event envelope");
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      sequence: parsed.sequence!,
      events: parsed.events!.map(cloneEvent),
      idempotency: { ...parsed.idempotency! },
    };
  } catch {
    try {
      storage.removeItem(storageKey);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    return emptyEnvelope();
  }
}

function browserStorage(): KeyValueStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function createEventStore(
  options: CreateEventStoreOptions = {},
): MatterShiftEventStore {
  const storage = options.storage;
  const storageKey = options.storageKey ?? STORAGE_KEY;
  const now = options.now ?? (() => new Date().toISOString());
  let envelope = readEnvelope(storage, storageKey);

  function persist(): void {
    if (!storage) return;
    try {
      storage.setItem(storageKey, JSON.stringify(envelope));
    } catch {
      // Keep the in-memory ledger usable when storage is full or blocked.
    }
  }

  return {
    record(event, recordOptions = {}) {
      if (!allowedEventTypes.has(event.type)) {
        throw new Error(`Unsupported MatterShift event type: ${event.type}`);
      }
      if (!event.useCaseId.trim()) {
        throw new Error("A non-empty use case id is required.");
      }
      if (!isJsonSafeMetadata(event.metadata)) {
        throw new Error(
          "Event metadata must contain only finite JSON-safe values.",
        );
      }

      const idempotencyKey = recordOptions.idempotencyKey?.trim();
      if (idempotencyKey) {
        const existingId = envelope.idempotency[idempotencyKey];
        const existing = envelope.events.find((item) => item.id === existingId);
        if (existing) {
          if (!isSameObservedAction(existing, event)) {
            throw new Error(
              `Idempotency key collision: ${idempotencyKey} already identifies a different event.`,
            );
          }
          return cloneEvent(existing);
        }
      }

      const occurredAt = now();
      if (Number.isNaN(Date.parse(occurredAt))) {
        throw new Error("Event time must be a valid ISO-compatible timestamp.");
      }
      envelope.sequence += 1;
      const stored: MatterShiftEvent = {
        ...event,
        id: `event-${envelope.sequence}`,
        occurredAt,
        metadata: event.metadata ? { ...event.metadata } : undefined,
      };
      envelope.events = [...envelope.events, stored];
      if (idempotencyKey) {
        envelope.idempotency = {
          ...envelope.idempotency,
          [idempotencyKey]: stored.id,
        };
      }
      persist();
      return cloneEvent(stored);
    },

    getEvents(useCaseId, sourceVersion) {
      return envelope.events
        .filter(
          (event) =>
            event.useCaseId === useCaseId &&
            (sourceVersion === undefined ||
              event.metadata?.sourceVersion === sourceVersion),
        )
        .map(cloneEvent);
    },

    getSummary(useCaseId, sourceVersion) {
      const observed = envelope.events.filter(
        (event) =>
          event.useCaseId === useCaseId &&
          (sourceVersion === undefined ||
            event.metadata?.sourceVersion === sourceVersion),
      );
      const counts: Partial<Record<MatterShiftEventType, number>> = {};
      for (const event of observed) {
        counts[event.type] = (counts[event.type] ?? 0) + 1;
      }
      return {
        useCaseId,
        totalObserved: observed.length,
        counts,
        ...(observed.length > 0
          ? { lastOccurredAt: observed[observed.length - 1].occurredAt }
          : {}),
      };
    },

    reset() {
      envelope = emptyEnvelope();
      if (storage) {
        try {
          storage.removeItem(storageKey);
        } catch {
          // The in-memory reset remains authoritative for this session.
        }
      }
    },
  };
}

const defaultStore = createEventStore({ storage: browserStorage() });

export function recordEvent(
  event: Omit<MatterShiftEvent, "id" | "occurredAt">,
  options?: RecordEventOptions,
): MatterShiftEvent {
  return defaultStore.record(event, options);
}

export function getEvents(
  useCaseId: string,
  sourceVersion?: string,
): MatterShiftEvent[] {
  return defaultStore.getEvents(useCaseId, sourceVersion);
}

export function getEventSummary(
  useCaseId: string,
  sourceVersion?: string,
): ObservedEventSummary {
  return defaultStore.getSummary(useCaseId, sourceVersion);
}

export function resetDemo(): void {
  defaultStore.reset();
}
