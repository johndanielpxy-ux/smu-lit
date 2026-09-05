import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { MatterWorkspace } from "./MatterWorkspace";

const bundle = compileApprovedTrainingModule(approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"), contractTrainingContent);
beforeEach(() => window.localStorage.clear());

function begin() {
  fireEvent.click(screen.getByRole("button", { name: /open northstar matter/i }));
  fireEvent.click(screen.getByRole("button", { name: /run ai review/i }));
}

describe("MatterWorkspace", () => {
  it("repairs the AI finding and routes the redlined renewal to legal", () => {
    const onComplete = vi.fn();
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={onComplete} />);
    begin();
    for (const finding of bundle.rehearsal.scenario.aiFindings) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^open ${finding.label}$`, "i") }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${finding.id === "guided-material-redline" ? "correct" : "confirm"} ${finding.label}$`, "i") }));
    }
    fireEvent.click(screen.getByRole("button", { name: /compare liability clause/i }));
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit route/i }));
    fireEvent.click(screen.getByRole("button", { name: /inspect audit trail/i }));
    expect(screen.getByText(/rehearsal complete/i)).toBeVisible();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("keeps unsafe reliance recoverable and source linked", () => {
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    fireEvent.click(screen.getByRole("button", { name: /choose business approval/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit route/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/verify the material ai findings/i);
    expect(screen.getByRole("button", { name: /open ai verification policy source/i })).toBeVisible();
  });

  it("resumes during verification for the same approved bundle", () => {
    const first = render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    fireEvent.click(screen.getByRole("button", { name: /open contract value/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm contract value/i }));
    first.unmount();
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/confirmed/i)).toBeVisible();
  });
});
