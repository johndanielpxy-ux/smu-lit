import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChangeImpactPanel } from "./ChangeImpactPanel";

describe("ChangeImpactPanel", () => {
  it("keeps update simulation behind an explicit disclosure", () => {
    render(<ChangeImpactPanel result={{ approvalStillCurrent: false, affectedStepIds: ["route"], affectedRuleIds: ["rule"], affectedArtifactIds: ["episode"], reasons: ["Reapproval and regeneration required."] }} />);
    expect(screen.queryByText(/reapproval and regeneration/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /simulate a playbook update/i }));
    expect(screen.getByText(/reapproval and regeneration/i)).toBeVisible();
  });
});
