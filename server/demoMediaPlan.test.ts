import { describe, expect, it } from "vitest";
import { validateRunwayVideoInput } from "./runwayClient";
import { demoMediaPlans } from "./demoMediaPlan";

describe("demoMediaPlans", () => {
  it("contains the two durable 15-second episode segments expected by the learner", () => {
    expect(demoMediaPlans.map((plan) => plan.filename)).toEqual([
      "lawflo-review-the-renewal.mp4",
      "lawflo-explain-the-route.mp4",
    ]);
    expect(demoMediaPlans).toHaveLength(2);
    for (const plan of demoMediaPlans) {
      expect(validateRunwayVideoInput({ shots: plan.shots }).shots).toHaveLength(3);
    }
  });

  it("keeps visible text out of the generated footage", () => {
    for (const plan of demoMediaPlans) {
      expect(plan.shots.every((shot) => /no readable text/i.test(shot.prompt))).toBe(true);
    }
  });
});
