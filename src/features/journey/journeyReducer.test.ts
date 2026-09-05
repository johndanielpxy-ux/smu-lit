import { describe, expect, it } from "vitest";
import { createJourneyState, journeyReducer, type JourneyScope } from "./journeyReducer";

const scope: JourneyScope = {
  bundleId: "bundle-1",
  sourceVersion: "2026.2",
  contractVersion: "1.0",
  approvalFingerprint: "msc-12345678",
};

describe("journeyReducer", () => {
  it("cannot open rehearsal before the episode is complete", () => {
    const published = journeyReducer(createJourneyState(scope), {
      type: "BUNDLE_PUBLISHED",
      scope,
    });
    const attempted = journeyReducer(published, { type: "GO_TO", stage: "rehearsal" });

    expect(attempted.stage).toBe("catalogue");
  });

  it("moves through episode, rehearsal, review and guide in order", () => {
    let state = journeyReducer(createJourneyState(scope), {
      type: "BUNDLE_PUBLISHED",
      scope,
    });
    state = journeyReducer(state, { type: "GO_TO", stage: "episode" });
    state = journeyReducer(state, { type: "EPISODE_COMPLETED" });
    state = journeyReducer(state, { type: "REHEARSAL_COMPLETED" });
    state = journeyReducer(state, { type: "REVIEW_OPENED" });
    state = journeyReducer(state, { type: "OPEN_GUIDE" });

    expect(state.stage).toBe("guide");
    expect(state.completedStages).toEqual(
      expect.arrayContaining(["studio", "catalogue", "episode", "rehearsal", "review"]),
    );
  });

  it("opens solo replay only after review and never makes it a guide prerequisite", () => {
    const reviewed = {
      ...createJourneyState(scope),
      stage: "review" as const,
      completedStages: ["studio", "catalogue", "episode", "rehearsal", "review"] as const,
    };

    expect(journeyReducer(reviewed, { type: "OPEN_GUIDE" }).stage).toBe("guide");
    expect(journeyReducer(reviewed, { type: "START_SOLO_REPLAY" }).stage).toBe(
      "solo_replay",
    );
  });

  it("resets to a clean studio state", () => {
    const state = journeyReducer(createJourneyState(scope), {
      type: "BUNDLE_PUBLISHED",
      scope,
    });

    expect(journeyReducer(state, { type: "RESET" })).toEqual(createJourneyState(scope));
  });
});
