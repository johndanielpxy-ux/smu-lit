import { describe, expect, it } from "vitest";
import {
  createPlatformJourney,
  platformJourneyReducer,
  type PlatformJourneyState,
} from "./platformJourney";

describe("platformJourneyReducer", () => {
  it("moves a legal engineer from welcome into the studio", () => {
    let state = createPlatformJourney(false);

    state = platformJourneyReducer(state, { type: "ENTER" });
    state = platformJourneyReducer(state, {
      type: "SELECT_ROLE",
      role: "legal_engineer",
    });

    expect(state).toEqual({ stage: "studio", role: "legal_engineer" });
  });

  it("moves a learner from role selection to the published catalogue", () => {
    let state = platformJourneyReducer(createPlatformJourney(true), {
      type: "ENTER",
    });

    state = platformJourneyReducer(state, {
      type: "SELECT_ROLE",
      role: "learner",
    });

    expect(state).toEqual({ stage: "catalogue", role: "learner" });
  });

  it("hands a published module from its author to the learner", () => {
    let state: PlatformJourneyState = {
      stage: "studio",
      role: "legal_engineer",
    };

    state = platformJourneyReducer(state, { type: "MODULE_PUBLISHED" });
    state = platformJourneyReducer(state, { type: "VIEW_AS_LEARNER" });

    expect(state).toEqual({ stage: "catalogue", role: "learner" });
  });

  it("resets every experience to the welcome screen", () => {
    const state = { stage: "catalogue", role: "learner" } as const;

    expect(platformJourneyReducer(state, { type: "RESET" })).toEqual({
      stage: "welcome",
    });
  });
});
