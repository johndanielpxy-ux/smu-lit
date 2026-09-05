import { describe, expect, it } from "vitest";
import type { JourneyScope } from "../journey/journeyReducer";
import { createInitialEpisodeState } from "./episodeReducer";
import { clearEpisode, loadEpisode, saveEpisode, type EpisodeStorage } from "./episodeStorage";

function memoryStorage(): EpisodeStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}

const scope: JourneyScope = { bundleId: "bundle-1", sourceVersion: "2", contractVersion: "1", approvalFingerprint: "approved" };

describe("episode storage", () => {
  it("round-trips playback only for the exact approved scope", () => {
    const storage = memoryStorage();
    const state = { ...createInitialEpisodeState(), cueIndex: 2, elapsedSeconds: 34, answeredCheckpointIds: ["check"] };
    saveEpisode(scope, state, storage);
    expect(loadEpisode(scope, storage)).toEqual(state);
    expect(loadEpisode({ ...scope, sourceVersion: "3" }, storage)).toBeNull();
    expect(loadEpisode({ ...scope, contractVersion: "2" }, storage)).toBeNull();
    expect(loadEpisode({ ...scope, approvalFingerprint: "stale" }, storage)).toBeNull();
  });

  it("fails safely for malformed or unavailable storage and clears one scoped key", () => {
    const storage = memoryStorage();
    storage.values.set("lawflo.episode.bundle-1.v1", "{");
    expect(loadEpisode(scope, storage)).toBeNull();
    clearEpisode(scope.bundleId, storage);
    expect(storage.values.size).toBe(0);
  });
});
