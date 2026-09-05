import { beforeEach, describe, expect, it } from "vitest";
import { getEvents, recordEvent, resetDemo } from "./eventStore";

describe("eventStore", () => {
  beforeEach(() => {
    resetDemo();
  });

  it("records immutable identifiers and timestamps", () => {
    const event = recordEvent({
      useCaseId: "use-case-1",
      type: "use_case_compiled",
    });

    expect(event.id).toMatch(/^event-/);
    expect(Number.isNaN(Date.parse(event.occurredAt))).toBe(false);
    expect(getEvents("use-case-1")).toEqual([event]);
  });

  it("filters events by use case and preserves insertion order", () => {
    const first = recordEvent({
      useCaseId: "use-case-1",
      type: "episode_started",
    });
    recordEvent({ useCaseId: "use-case-2", type: "source_opened" });
    const second = recordEvent({
      useCaseId: "use-case-1",
      type: "checkpoint_answered",
      metadata: { safe: false },
    });

    expect(getEvents("use-case-1")).toEqual([first, second]);
  });

  it("resets all prototype events", () => {
    recordEvent({ useCaseId: "use-case-1", type: "human_approved" });
    resetDemo();
    expect(getEvents("use-case-1")).toEqual([]);
  });
});
