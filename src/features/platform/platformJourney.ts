export type PlatformRole = "legal_engineer" | "learner";

export type PlatformStage =
  | "welcome"
  | "role"
  | "studio"
  | "published"
  | "catalogue";

export type PlatformJourneyState = {
  stage: PlatformStage;
  role?: PlatformRole;
};

export type PlatformJourneyAction =
  | { type: "ENTER" }
  | { type: "SELECT_ROLE"; role: PlatformRole }
  | { type: "MODULE_PUBLISHED" }
  | { type: "VIEW_AS_LEARNER" }
  | { type: "BROWSE_AS_LEARNER" }
  | { type: "BACK_TO_WELCOME" }
  | { type: "RESET" };

export function createPlatformJourney(
  publishedModuleAvailable: boolean,
): PlatformJourneyState {
  return publishedModuleAvailable
    ? { stage: "welcome" }
    : { stage: "welcome" };
}

export function platformJourneyReducer(
  state: PlatformJourneyState,
  action: PlatformJourneyAction,
): PlatformJourneyState {
  switch (action.type) {
    case "ENTER":
      return state.stage === "welcome" ? { stage: "role" } : state;
    case "SELECT_ROLE":
      if (state.stage !== "role") return state;
      return action.role === "legal_engineer"
        ? { stage: "studio", role: action.role }
        : { stage: "catalogue", role: action.role };
    case "MODULE_PUBLISHED":
      return state.stage === "studio"
        ? { stage: "published", role: "legal_engineer" }
        : state;
    case "BACK_TO_WELCOME":
      return { stage: "welcome" };
    case "BROWSE_AS_LEARNER":
      return state.stage === "welcome"
        ? { stage: "catalogue", role: "learner" }
        : state;
    case "VIEW_AS_LEARNER":
      return state.stage === "published"
        ? { stage: "catalogue", role: "learner" }
        : state;
    case "RESET":
      return { stage: "welcome" };
  }
}
