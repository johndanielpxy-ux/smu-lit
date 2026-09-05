import type {
  JourneyScope,
  JourneyStage,
  JourneyState,
} from "./journeyReducer";

const STORAGE_KEY = "lawflo.journey.v2";
const stages: JourneyStage[] = [
  "studio",
  "catalogue",
  "episode",
  "rehearsal",
  "review",
  "guide",
  "solo_replay",
];

export interface JourneyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface JourneyEnvelope {
  schemaVersion: 2;
  state: JourneyState;
}

function browserStorage(): JourneyStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function sameScope(left: JourneyScope, right: JourneyScope): boolean {
  return (
    left.bundleId === right.bundleId &&
    left.sourceVersion === right.sourceVersion &&
    left.contractVersion === right.contractVersion &&
    left.approvalFingerprint === right.approvalFingerprint
  );
}

function isScope(value: unknown): value is JourneyScope {
  if (!value || typeof value !== "object") return false;
  const scope = value as Partial<JourneyScope>;
  return [
    scope.bundleId,
    scope.sourceVersion,
    scope.contractVersion,
    scope.approvalFingerprint,
  ].every((item) => typeof item === "string" && item.length > 0);
}

function isJourneyState(value: unknown): value is JourneyState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<JourneyState>;
  return (
    isScope(state.scope) &&
    typeof state.stage === "string" &&
    stages.includes(state.stage as JourneyStage) &&
    Array.isArray(state.completedStages) &&
    state.completedStages.every(
      (stage) => typeof stage === "string" && stages.includes(stage as JourneyStage),
    )
  );
}

export function saveJourney(
  state: JourneyState,
  storage: JourneyStorage | undefined = browserStorage(),
): void {
  if (!storage) return;
  const envelope: JourneyEnvelope = { schemaVersion: 2, state };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Resume is optional; the in-memory journey remains usable.
  }
}

export function loadJourney(
  scope: JourneyScope,
  storage: JourneyStorage | undefined = browserStorage(),
): JourneyState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Partial<JourneyEnvelope>;
    if (
      envelope.schemaVersion !== 2 ||
      !isJourneyState(envelope.state) ||
      !sameScope(envelope.state.scope, scope)
    ) {
      return null;
    }
    return structuredClone(envelope.state);
  } catch {
    return null;
  }
}

export function clearJourney(
  storage: JourneyStorage | undefined = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Reset remains successful even when browser storage is blocked.
  }
}
