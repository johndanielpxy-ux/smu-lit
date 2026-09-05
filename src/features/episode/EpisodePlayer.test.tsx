import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { EpisodePlayer } from "./EpisodePlayer";

const bundle = compileApprovedTrainingModule(
  approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
  contractTrainingContent,
);

describe("EpisodePlayer", () => {
  it("plays approved AI narration and falls back to captions when audio fails", () => {
    const view = render(<EpisodePlayer bundle={bundle} narrationUrl="blob:approved-narration" onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/ai-generated voice/i)).toBeVisible();
    const audio = screen.getByTitle(/approved ai narration/i);
    expect(audio).toHaveAttribute("src", "blob:approved-narration");
    fireEvent.error(audio);
    expect(screen.getByRole("status")).toHaveTextContent(/captions remain active/i);
    expect(screen.queryByTitle(/approved ai narration/i)).not.toBeInTheDocument();
    view.unmount();
  });

  it("describes the fallback truthfully as an interactive story rather than generated video", () => {
    render(<EpisodePlayer bundle={bundle} onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByText(/interactive story · deterministic fallback/i)).toBeVisible();
    expect(screen.queryByText(/generated video/i)).not.toBeInTheDocument();
  });

  it("plays a captioned episode and emits one deduplicated start event", () => {
    const onEvent = vi.fn();
    render(<EpisodePlayer bundle={bundle} onEvent={onEvent} onComplete={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /route a sales renewal/i })).toBeVisible();
    expect(screen.getAllByText(/routine renewals look simple/i)).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Play episode" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause episode" }));
    fireEvent.click(screen.getByRole("button", { name: "Play episode" }));
    expect(onEvent).toHaveBeenCalledWith("episode_started", expect.any(Object), expect.objectContaining({ idempotencyKey: expect.any(String) }));
    expect(onEvent.mock.calls.filter(([type]) => type === "episode_started")).toHaveLength(1);
  });

  it("blocks chapter skipping, repairs an unsafe answer and opens exact sources", () => {
    const onEvent = vi.fn();
    render(<EpisodePlayer bundle={bundle} onEvent={onEvent} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /chapter 6/i }));
    expect(screen.getByRole("heading", { name: /what should happen next/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /send to business approval/i }));
    expect(screen.getByText(/low value never cancels/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /escalate to legal review/i }));
    expect(screen.queryByText(/low value never cancels/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sources/i }));
    fireEvent.click(screen.getByRole("button", { name: /material redline rule/i }));
    expect(onEvent).toHaveBeenCalledWith("source_opened", expect.objectContaining({ sourceRefId: "material-redline-rule" }));
  });

  it("searches the transcript", () => {
    render(<EpisodePlayer bundle={bundle} onEvent={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /transcript/i }));
    fireEvent.change(screen.getByRole("searchbox", { name: /search transcript/i }), { target: { value: "liability" } });
    expect(screen.getByText(/unlimited liability/i)).toBeVisible();
  });
});
