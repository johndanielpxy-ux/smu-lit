import { describe, expect, it } from "vitest";
import type { JourneyScope } from "../journey/journeyReducer";
import { createRehearsalState } from "./rehearsalReducer";
import { clearRehearsal, loadRehearsal, saveRehearsal, type RehearsalStorage } from "./rehearsalStorage";

function memoryStorage(): RehearsalStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}
const scope: JourneyScope = { bundleId: "bundle", sourceVersion: "2", contractVersion: "1", approvalFingerprint: "ok" };

describe("rehearsal storage", () => {
  it("resumes only the exact approved contract", () => {
    const storage = memoryStorage();
    const state = { ...createRehearsalState("guided"), task: "verify_findings" as const, attempts: 2 };
    saveRehearsal(scope, state, storage);
    expect(loadRehearsal(scope, storage)).toEqual(state);
    expect(loadRehearsal({ ...scope, contractVersion: "changed" }, storage)).toBeNull();
    expect(loadRehearsal({ ...scope, approvalFingerprint: "changed" }, storage)).toBeNull();
  });

  it("rejects malformed state and clears the bundle key", () => {
    const storage = memoryStorage();
    storage.values.set("lawflo.rehearsal.bundle.v1", "not json");
    expect(loadRehearsal(scope, storage)).toBeNull();
    clearRehearsal(scope.bundleId, storage);
    expect(storage.values.size).toBe(0);
  });
});
