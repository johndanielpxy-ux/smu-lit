import type { JourneyScope } from "../journey/journeyReducer";
import type { EpisodeState } from "./episodeReducer";

export interface EpisodeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface EpisodeEnvelope {
  schemaVersion: 1;
  scope: JourneyScope;
  state: EpisodeState;
}

function key(bundleId: string): string { return `lawflo.episode.${bundleId}.v1`; }
function browserStorage(): EpisodeStorage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; }
}
function sameScope(a: JourneyScope, b: JourneyScope): boolean {
  return a.bundleId === b.bundleId && a.sourceVersion === b.sourceVersion && a.contractVersion === b.contractVersion && a.approvalFingerprint === b.approvalFingerprint;
}
function isState(value: unknown): value is EpisodeState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<EpisodeState>;
  return ["idle", "playing", "paused", "checkpoint", "complete"].includes(state.status ?? "") && Number.isInteger(state.cueIndex) && (state.cueIndex ?? -1) >= 0 && Number.isFinite(state.elapsedSeconds) && (state.elapsedSeconds ?? -1) >= 0 && Array.isArray(state.answeredCheckpointIds) && state.answeredCheckpointIds.every((id) => typeof id === "string");
}

export function saveEpisode(scope: JourneyScope, state: EpisodeState, storage: EpisodeStorage | undefined = browserStorage()): void {
  if (!storage) return;
  try { storage.setItem(key(scope.bundleId), JSON.stringify({ schemaVersion: 1, scope, state } satisfies EpisodeEnvelope)); } catch { /* Optional resume. */ }
}
export function loadEpisode(scope: JourneyScope, storage: EpisodeStorage | undefined = browserStorage()): EpisodeState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key(scope.bundleId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EpisodeEnvelope>;
    if (parsed.schemaVersion !== 1 || !parsed.scope || !sameScope(parsed.scope, scope) || !isState(parsed.state)) return null;
    return structuredClone(parsed.state);
  } catch { return null; }
}
export function clearEpisode(bundleId: string, storage: EpisodeStorage | undefined = browserStorage()): void {
  if (!storage) return;
  try { storage.removeItem(key(bundleId)); } catch { /* Reset remains usable. */ }
}
