import type { JourneyStage, JourneyState } from "../journey/journeyReducer";

export interface LearnerNavigationItem {
  label: string;
  stage: Extract<JourneyStage, "episode" | "rehearsal" | "review" | "guide">;
  unlockedBy?: JourneyStage;
}

const items: LearnerNavigationItem[] = [
  { label: "Episode", stage: "episode" },
  { label: "Rehearsal", stage: "rehearsal", unlockedBy: "episode" },
  { label: "Review", stage: "review", unlockedBy: "rehearsal" },
  { label: "Guide", stage: "guide", unlockedBy: "review" },
];

export function visibleLearnerNavigation(journey: JourneyState) {
  return items.filter((item) => !item.unlockedBy || journey.completedStages.includes(item.unlockedBy));
}
