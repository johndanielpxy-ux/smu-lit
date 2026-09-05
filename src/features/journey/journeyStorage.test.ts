import { describe, expect, it } from "vitest";
import { createJourneyState, journeyReducer, type JourneyScope } from "./journeyReducer";
import {
  clearJourney,
  loadJourney,
  saveJourney,
  type JourneyStorage,
} from "./journeyStorage";

function memoryStorage(): JourneyStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const scope: JourneyScope = {
  bundleId: "bundle-1",
  sourceVersion: "2026.2",
  contractVersion: "1.0",
  approvalFingerprint: "msc-12345678",
};

describe("journeyStorage", () => {
  it("round-trips state only for the exact bundle scope", () => {
    const storage = memoryStorage();
    const state = journeyReducer(createJourneyState(scope), {
      type: "BUNDLE_PUBLISHED",
      scope,
    });
    saveJourney(state, storage);

    expect(loadJourney(scope, storage)).toEqual(state);
    expect(loadJourney({ ...scope, contractVersion: "2.0" }, storage)).toBeNull();
    expect(loadJourney({ ...scope, sourceVersion: "2027.1" }, storage)).toBeNull();
  });

  it("rejects malformed state and unavailable storage without throwing", () => {
    const storage = memoryStorage();
    storage.setItem("lawflo.journey.v2", "not-json");
    expect(loadJourney(scope, storage)).toBeNull();

    const blocked: JourneyStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => saveJourney(createJourneyState(scope), blocked)).not.toThrow();
    expect(loadJourney(scope, blocked)).toBeNull();
    expect(() => clearJourney(blocked)).not.toThrow();
  });

  it("clears exactly the journey key", () => {
    const storage = memoryStorage();
    saveJourney(createJourneyState(scope), storage);
    clearJourney(storage);
    expect(loadJourney(scope, storage)).toBeNull();
  });
});
