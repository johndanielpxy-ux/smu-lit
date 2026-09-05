import { describe, expect, it, vi } from "vitest";
import { createScopedEventReporter } from "./integration";

describe("createScopedEventReporter", () => {
  it("binds teammate callbacks to the canonical use case and event shape", () => {
    const record = vi.fn((event) => ({
      ...event,
      id: "event-1",
      occurredAt: "2026-09-05T05:00:00.000Z",
    }));
    const report = createScopedEventReporter(
      {
        id: "canonical-use-case",
        sourceVersion: "2.0",
        approvalRecord: {
          approvedBy: "Jordan Lee",
          approvedAt: "2026-09-05T05:00:00.000Z",
          contentFingerprint: "msc-12345678",
          sourceVersion: "2.0",
        },
      },
      record,
    );

    report("checkpoint_answered", { safe: true });

    expect(record).toHaveBeenCalledWith({
      useCaseId: "canonical-use-case",
      type: "checkpoint_answered",
      metadata: {
        safe: true,
        sourceVersion: "2.0",
        approvalFingerprint: "msc-12345678",
      },
    });
  });
});
