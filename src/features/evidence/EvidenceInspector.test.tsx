import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { EvidenceInspector } from "./EvidenceInspector";

describe("EvidenceInspector", () => {
  it("expands a policy excerpt before reporting that it was opened", () => {
    const bundle = compileApprovedTrainingModule(
      approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
      contractTrainingContent,
    );
    const onSourceOpen = vi.fn();
    render(
      <EvidenceInspector
        bundle={bundle}
        events={[]}
        onSourceOpen={onSourceOpen}
      />,
    );
    const source = screen.getAllByRole("button", {
      name: /meridian & rowe synthetic sales renewal playbook/i,
    })[0];

    expect(source).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(source);

    expect(source).toHaveAttribute("aria-expanded", "true");
    expect(source).toHaveTextContent(/close excerpt/i);
    expect(onSourceOpen).toHaveBeenCalledWith(bundle.useCase.steps[0].sourceRefIds[0]);
  });
});
