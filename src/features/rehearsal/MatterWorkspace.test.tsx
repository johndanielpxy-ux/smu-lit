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

function verifyMaterialChange() {
  verifyFinding("Material standard-term change", /compare liability clause/i, /material redline detected/i);
}

function verifyFinding(label: string, clauseLabel: RegExp, choice: RegExp) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^open ${label}$`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: clauseLabel }));
  fireEvent.click(screen.getByRole("button", { name: choice }));
}

describe("MatterWorkspace", () => {
  it("repairs the AI finding and routes the redlined renewal to legal", () => {
    const onComplete = vi.fn();
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={onComplete} />);
    begin();
    verifyMaterialChange();
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm legal review route/i }));
    fireEvent.click(screen.getByRole("button", { name: /inspect audit trail/i }));
    expect(screen.getByRole("heading", { name: /rehearsal complete/i })).toBeVisible();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("reveals only the controls needed for the current learning objective", () => {
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/safe sandbox/i)).toBeVisible();
    expect(screen.getByRole("complementary", { name: /workflow coach/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /run ai review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /choose legal review/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open northstar matter/i }));
    expect(screen.getByRole("button", { name: /run ai review/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /choose legal review/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /run ai review/i }));
    verifyMaterialChange();
    expect(screen.getByRole("button", { name: /open material standard-term changes require legal review/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /choose legal review/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    expect(screen.getByRole("button", { name: /choose legal review/i })).toBeVisible();
  });

  it("keeps unsafe reliance recoverable and source linked", () => {
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    verifyMaterialChange();
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose business approval/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm business approval route/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/choose the route produced by the verified facts/i);
    expect(screen.getByRole("button", { name: /open controlling playbook source/i })).toBeVisible();
  });

  it("resumes during verification for the same approved bundle", () => {
    const first = render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    verifyMaterialChange();
    first.unmount();
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/corrected/i)).toBeVisible();
  });

  it("shows progressive task-specific hints instead of only counting hint use", () => {
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    fireEvent.click(screen.getByRole("button", { name: /show a focused hint/i }));
    expect(screen.getByRole("status", { name: /focused guidance/i })).toHaveTextContent(/open the ai finding/i);
  });

  it("uses visible source-grounded choices instead of hidden typed answers", () => {
    render(<MatterWorkspace bundle={bundle} mode="guided" onEvent={vi.fn()} onComplete={vi.fn()} />);
    begin();
    const findingButton = screen.getByRole("button", { name: /^open material standard-term change$/i });
    fireEvent.click(findingButton);
    fireEvent.click(screen.getByRole("button", { name: /compare liability clause/i }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no material redline/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /material redline detected/i })).toBeVisible();
  });
});
