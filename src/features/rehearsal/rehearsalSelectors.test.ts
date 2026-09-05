import { describe, expect, it } from "vitest";
import { guidedContractScenario } from "../../demo/contractScenarios";
import { auditEntries, currentObjective, unresolvedMaterialFindings } from "./rehearsalSelectors";
import { createRehearsalState } from "./rehearsalReducer";

describe("rehearsal selectors", () => {
  it("reports unresolved material findings without mutating state", () => {
    const state = createRehearsalState("guided");
    expect(currentObjective(state)).toBe("intake");
    expect(unresolvedMaterialFindings(state, guidedContractScenario).map((item) => item.id)).toContain("guided-material-redline");
    expect(auditEntries(state)).toEqual([]);
    expect(state.findingResolutions).toEqual({});
  });
});
