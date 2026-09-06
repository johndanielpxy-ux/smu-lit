import { describe, expect, it } from "vitest";
import { validateRunwayVideoInput } from "./runwayClient";
import { demoMediaPlans } from "./demoMediaPlan";

describe("demoMediaPlans", () => {
  it("contains four durable video and narration chapters expected by the learner", () => {
    expect(demoMediaPlans.map((plan) => plan.filename)).toEqual([
      "lawflo-v2-01-ai-review.mp4",
      "lawflo-v2-02-verify-evidence.mp4",
      "lawflo-v2-03-learner-decision.mp4",
      "lawflo-v2-04-safe-route.mp4",
    ]);
    expect(demoMediaPlans).toHaveLength(4);
    for (const plan of demoMediaPlans) {
      expect(validateRunwayVideoInput({ shots: plan.shots }).shots).toHaveLength(3);
      expect(plan.audioFilename).toMatch(/\.mp3$/);
      expect(plan.narration.split(/\s+/).length).toBeLessThanOrEqual(42);
    }
  });

  it("keeps legal text and invented software interfaces out of generated footage", () => {
    for (const plan of demoMediaPlans) {
      expect(plan.shots.every((shot) => /no readable text/i.test(shot.prompt))).toBe(true);
      expect(plan.shots.every((shot) => /no software interface/i.test(shot.prompt))).toBe(true);
    }
  });
});
