import { describe, expect, it, vi } from "vitest";
import { createScopedEventReporter } from "./integration";

describe("createScopedEventReporter", () => {
  it("binds every callback to the complete approved bundle scope", () => {
    const record = vi.fn((event) => ({
      ...event,
      id: "event-1",
      occurredAt: "2026-09-05T05:00:00.000Z",
    }));
    const report = createScopedEventReporter(
      {
        useCaseId: "sales-renewal-review",
        sourceVersion: "2.0",
        contractVersion: "contract-1.0",
        approvalFingerprint: "msc-12345678",
        bundleId: "lawflo-bundle-1",
      },
      record,
    );

    report(
      "checkpoint_answered",
      { safe: true },
      { idempotencyKey: "checkpoint:route-risk" },
    );

    expect(record).toHaveBeenCalledWith(
      {
        useCaseId: "sales-renewal-review",
        type: "checkpoint_answered",
        metadata: {
          safe: true,
          sourceVersion: "2.0",
          contractVersion: "contract-1.0",
          approvalFingerprint: "msc-12345678",
          bundleId: "lawflo-bundle-1",
        },
      },
      { idempotencyKey: "checkpoint:route-risk" },
    );
  });
});
