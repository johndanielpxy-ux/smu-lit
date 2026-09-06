import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InstructionalOverlay } from "./InstructionalOverlay";

describe("InstructionalOverlay", () => {
  it("renders the exact approved and submitted clauses as visible evidence", () => {
    render(<InstructionalOverlay overlay={{
      kind: "comparison",
      eyebrow: "Source check",
      title: "The AI missed a material change",
      standardClause: "Liability is capped at 12 months of fees.",
      submittedClause: "Liability is unlimited, including indirect losses.",
    }} />);

    expect(screen.getByText(/capped at 12 months/i)).toBeVisible();
    expect(screen.getByText(/unlimited, including indirect losses/i)).toBeVisible();
  });
});
