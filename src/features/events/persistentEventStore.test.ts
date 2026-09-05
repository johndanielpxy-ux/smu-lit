import { describe, expect, it } from "vitest";
import { createEventStore, type KeyValueStorage } from "./eventStore";

function memoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe("persistent observed-event store", () => {
  it("persists and rehydrates truthful events in insertion order", () => {
    const storage = memoryStorage();
    const firstStore = createEventStore({
      storage,
      now: () => "2026-09-05T05:00:00.000Z",
    });
    firstStore.record({ useCaseId: "uc-1", type: "episode_started" });
    firstStore.record({
      useCaseId: "uc-1",
      type: "checkpoint_answered",
      metadata: { safe: true },
    });

    const rehydrated = createEventStore({ storage });

    expect(rehydrated.getEvents("uc-1").map((event) => event.type)).toEqual([
      "episode_started",
      "checkpoint_answered",
    ]);
  });

  it("uses an idempotency key to prevent duplicate UI retries", () => {
    const store = createEventStore({ storage: memoryStorage() });
    const input = { useCaseId: "uc-1", type: "human_approved" as const };

    const first = store.record(input, { idempotencyKey: "approve:uc-1:v1" });
    const retry = store.record(input, { idempotencyKey: "approve:uc-1:v1" });

    expect(retry).toEqual(first);
    expect(store.getEvents("uc-1")).toHaveLength(1);
  });

  it("rejects reuse of an idempotency key for a different observed action", () => {
    const store = createEventStore({ storage: memoryStorage() });
    store.record(
      { useCaseId: "uc-1", type: "episode_started" },
      { idempotencyKey: "surface-action" },
    );

    expect(() =>
      store.record(
        { useCaseId: "uc-1", type: "workflow_guide_opened" },
        { idempotencyKey: "surface-action" },
      ),
    ).toThrow("Idempotency key collision");
  });

  it("records separate observed actions when no idempotency key is supplied", () => {
    const store = createEventStore({ storage: memoryStorage() });
    store.record({ useCaseId: "uc-1", type: "source_opened" });
    store.record({ useCaseId: "uc-1", type: "source_opened" });

    expect(store.getEvents("uc-1")).toHaveLength(2);
  });

  it("rejects event data that cannot survive JSON persistence", () => {
    const store = createEventStore({ storage: memoryStorage() });

    expect(() =>
      store.record({
        useCaseId: "uc-1",
        type: "checkpoint_answered",
        metadata: { score: Number.NaN },
      }),
    ).toThrow("finite JSON-safe values");
    expect(store.getEvents("uc-1")).toEqual([]);
  });

  it("rejects invalid scope and clock data before advancing the ledger", () => {
    const invalidClockStore = createEventStore({
      storage: memoryStorage(),
      now: () => "not-a-date",
    });

    expect(() =>
      invalidClockStore.record({ useCaseId: "uc-1", type: "episode_started" }),
    ).toThrow("valid ISO-compatible timestamp");
    expect(() =>
      invalidClockStore.record({ useCaseId: "  ", type: "episode_started" }),
    ).toThrow("non-empty use case id");
    expect(invalidClockStore.getEvents("uc-1")).toEqual([]);
  });

  it("recovers safely from corrupt persisted data without inventing events", () => {
    const storage = memoryStorage();
    storage.setItem("lawflo.observed-events.v1", "not-json");

    const store = createEventStore({ storage });

    expect(store.getEvents("uc-1")).toEqual([]);
    expect(store.getSummary("uc-1")).toEqual({
      useCaseId: "uc-1",
      totalObserved: 0,
      counts: {},
    });
  });

  it("rejects structurally corrupt envelopes that could duplicate event ids", () => {
    const storage = memoryStorage();
    storage.setItem(
      "lawflo.observed-events.v1",
      JSON.stringify({
        schemaVersion: 1,
        sequence: 1,
        events: [
          {
            id: "event-2",
            useCaseId: "uc-1",
            type: "episode_started",
            occurredAt: "2026-09-05T05:00:00.000Z",
          },
        ],
        idempotency: {},
      }),
    );
    const store = createEventStore({ storage });

    const event = store.record({
      useCaseId: "uc-1",
      type: "workflow_guide_opened",
    });

    expect(store.getEvents("uc-1")).toEqual([event]);
    expect(event.id).toBe("event-1");
  });

  it("summarises only events that were actually recorded", () => {
    const store = createEventStore({
      storage: memoryStorage(),
      now: () => "2026-09-05T05:00:00.000Z",
    });
    store.record({ useCaseId: "uc-1", type: "episode_started" });
    store.record({ useCaseId: "uc-2", type: "episode_started" });
    store.record({ useCaseId: "uc-1", type: "workflow_guide_opened" });

    expect(store.getSummary("uc-1")).toEqual({
      useCaseId: "uc-1",
      totalObserved: 2,
      counts: { episode_started: 1, workflow_guide_opened: 1 },
      lastOccurredAt: "2026-09-05T05:00:00.000Z",
    });
  });

  it("can isolate events by source version within the same use case", () => {
    const store = createEventStore({ storage: memoryStorage() });
    store.record({
      useCaseId: "uc-1",
      type: "episode_started",
      metadata: { sourceVersion: "1.0" },
    });
    store.record({
      useCaseId: "uc-1",
      type: "episode_started",
      metadata: { sourceVersion: "2.0" },
    });

    expect(store.getEvents("uc-1", "2.0")).toHaveLength(1);
    expect(store.getEvents("uc-1", "2.0")[0].metadata?.sourceVersion).toBe("2.0");
  });
});
