export type JourneyStage =
  | "studio"
  | "catalogue"
  | "episode"
  | "rehearsal"
  | "review"
  | "guide"
  | "solo_replay";

export interface JourneyScope {
  bundleId: string;
  sourceVersion: string;
  contractVersion: string;
  approvalFingerprint: string;
}

export interface JourneyState {
  scope: JourneyScope;
  stage: JourneyStage;
  completedStages: readonly JourneyStage[];
}

export type JourneyAction =
  | { type: "BUNDLE_PUBLISHED"; scope: JourneyScope }
  | { type: "EPISODE_COMPLETED" }
  | { type: "REHEARSAL_COMPLETED" }
  | { type: "REVIEW_OPENED" }
  | { type: "OPEN_GUIDE" }
  | { type: "START_SOLO_REPLAY" }
  | { type: "GO_TO"; stage: JourneyStage }
  | { type: "RESET" };

export function createJourneyState(scope: JourneyScope): JourneyState {
  return { scope: { ...scope }, stage: "studio", completedStages: [] };
}

function complete(
  state: JourneyState,
  stages: JourneyStage[],
): readonly JourneyStage[] {
  return [...new Set([...state.completedStages, ...stages])];
}

function canVisit(state: JourneyState, stage: JourneyStage): boolean {
  if (stage === "studio") return true;
  if (stage === "catalogue" || stage === "episode") {
    return state.completedStages.includes("studio");
  }
  if (stage === "rehearsal") return state.completedStages.includes("episode");
  if (stage === "review") return state.completedStages.includes("rehearsal");
  if (stage === "guide" || stage === "solo_replay") {
    return state.completedStages.includes("review");
  }
  return false;
}

export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
): JourneyState {
  switch (action.type) {
    case "BUNDLE_PUBLISHED":
      return {
        scope: { ...action.scope },
        stage: "catalogue",
        completedStages: complete(state, ["studio", "catalogue"]),
      };
    case "EPISODE_COMPLETED":
      if (state.stage !== "episode") return state;
      return {
        ...state,
        stage: "rehearsal",
        completedStages: complete(state, ["episode"]),
      };
    case "REHEARSAL_COMPLETED":
      if (state.stage !== "rehearsal" && state.stage !== "solo_replay") return state;
      if (state.stage === "solo_replay") {
        return { ...state, stage: "guide", completedStages: complete(state, ["solo_replay"]) };
      }
      return {
        ...state,
        stage: "review",
        completedStages: complete(state, ["rehearsal"]),
      };
    case "REVIEW_OPENED":
      if (state.stage !== "review") return state;
      return { ...state, completedStages: complete(state, ["review"]) };
    case "OPEN_GUIDE":
      return canVisit(state, "guide")
        ? { ...state, stage: "guide", completedStages: complete(state, ["guide"]) }
        : state;
    case "START_SOLO_REPLAY":
      return canVisit(state, "solo_replay")
        ? { ...state, stage: "solo_replay" }
        : state;
    case "GO_TO":
      return canVisit(state, action.stage) ? { ...state, stage: action.stage } : state;
    case "RESET":
      return createJourneyState(state.scope);
  }
}
