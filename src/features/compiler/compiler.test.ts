import { describe, expect, it } from "vitest";
import { validateUseCase } from "../../domain/mattershift";
import { loadSyntheticDemoPack } from "../studio/demoPack";
import { prepareDraftFromDemoPack } from "./compiler";

describe("prepareDraftFromDemoPack", () => {
  it("maps the complete marked pack to a fresh canonical draft", async () => {
    const result = await prepareDraftFromDemoPack(loadSyntheticDemoPack());

    expect(validateUseCase(result)).toEqual({ valid: true, errors: [] });
    expect(result.id).toBe("ai-assisted-sales-renewal-review");
    expect(result.approvalStatus).toBe("draft");
    expect(result.approvedBy).toBeUndefined();
    expect(result.approvalRecord).toBeUndefined();
    expect(result.scenarioRefs).toHaveLength(2);
  });

  it("rejects arbitrary document content instead of silently mapping the fixture", async () => {
    const pack = { ...loadSyntheticDemoPack(), contractText: "Other agreement" };

    await expect(prepareDraftFromDemoPack(pack)).rejects.toThrow(
      "not the versioned LAWFLO demonstration contract",
    );
  });
});
