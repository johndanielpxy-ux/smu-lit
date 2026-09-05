import { describe, expect, it } from "vitest";
import { createJourneyState, journeyReducer, type JourneyStage, type JourneyState } from "../journey/journeyReducer";
import { visibleLearnerNavigation } from "./learnerNavigation";

const scope = {
  bundleId: "bundle-1",
  sourceVersion: "source-1",
  contractVersion: "contract-1",
  approvalFingerprint: "approval-1",
};

const stateWith = (completedStages: readonly JourneyStage[]): JourneyState => ({
  ...createJourneyState(scope),
  stage: "catalogue",
  completedStages,
});

const labels = (completedStages: readonly JourneyStage[]) => {
  const journey = stateWith(completedStages);

  return visibleLearnerNavigation(journey).map((item) => item.label);
};

describe("visibleLearnerNavigation", () => {
  it("reveals learner stages only after the preceding experience is completed", () => {
    expect(labels([])).toEqual(["Episode"]);
    expect(labels(["episode"])).toEqual(["Episode", "Rehearsal"]);
    expect(labels(["episode", "rehearsal"])).toEqual(["Episode", "Rehearsal", "Review"]);
    expect(labels(["episode", "rehearsal", "review"])).toEqual([
      "Episode",
      "Rehearsal",
      "Review",
      "Guide",
    ]);
  });

  it("keeps navigation visibility stable while moving between unlocked stages", () => {
    const started: JourneyState = {
      ...stateWith(["studio", "catalogue", "episode"]),
      stage: "episode",
    };
    const moved = journeyReducer(started, { type: "GO_TO", stage: "rehearsal" });

    expect(visibleLearnerNavigation(moved).map((item) => item.label)).toEqual([
      "Episode",
      "Rehearsal",
    ]);
  });
});
