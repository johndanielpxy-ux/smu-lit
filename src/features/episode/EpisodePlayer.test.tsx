import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { EpisodePlayer } from "./EpisodePlayer";
import { demoUseCase } from "../../demo/demoUseCase";

describe("EpisodePlayer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the title entry screen with legal engineer and use case metadata", () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();

    render(<EpisodePlayer useCase={demoUseCase} onEvent={onEvent} onComplete={onComplete} />);

    expect(screen.getByTestId("episode-title-screen")).toBeInTheDocument();
    expect(screen.getByText(demoUseCase.title)).toBeInTheDocument();
    expect(screen.getByText("Maya Tan")).toBeInTheDocument();
    expect(screen.getByTestId("start-episode-btn")).toBeInTheDocument();
  });

  it("emits episode_started event when playback starts", () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();

    render(<EpisodePlayer useCase={demoUseCase} onEvent={onEvent} onComplete={onComplete} />);

    fireEvent.click(screen.getByTestId("start-episode-btn"));

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "episode_started",
        useCaseId: demoUseCase.id,
        metadata: expect.objectContaining({
          title: demoUseCase.title,
          contributor: "Maya Tan",
        }),
      })
    );
  });

  it("renders chapter navigation pills and allows seeking to chapters", () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();

    render(
      <EpisodePlayer
        useCase={demoUseCase}
        onEvent={onEvent}
        onComplete={onComplete}
        autoplay={true}
      />
    );

    expect(screen.getByTestId("chapter-pill-1")).toBeInTheDocument();
    expect(screen.getByTestId("chapter-pill-2")).toBeInTheDocument();

    // Click Chapter 2 pill
    fireEvent.click(screen.getByTestId("chapter-pill-1"));
    expect(screen.getByText(/CHAPTER 2: THE DISCOVERY/i)).toBeInTheDocument();
  });

  it("toggles captions visibility via CC button", () => {
    render(
      <EpisodePlayer
        useCase={demoUseCase}
        onComplete={vi.fn()}
        autoplay={true}
      />
    );

    expect(screen.getByTestId("captions-container")).toBeInTheDocument();

    const ccBtn = screen.getByTestId("captions-toggle-btn");
    fireEvent.click(ccBtn);

    expect(screen.queryByTestId("captions-container")).not.toBeInTheDocument();

    fireEvent.click(ccBtn);
    expect(screen.getByTestId("captions-container")).toBeInTheDocument();
  });

  it("handles checkpoint selection, emits checkpoint_answered, and opens source drawer", () => {
    const onEvent = vi.fn();
    const onComplete = vi.fn();

    render(
      <EpisodePlayer
        useCase={demoUseCase}
        onEvent={onEvent}
        onComplete={onComplete}
        autoplay={true}
      />
    );

    // Seek directly to Chapter 4 (Risk Moment)
    fireEvent.click(screen.getByTestId("chapter-pill-3"));

    // Advance time to trigger checkpoint pause
    act(() => {
      vi.advanceTimersByTime(8000);
    });

    // Checkpoint overlay should be visible
    expect(screen.getByTestId("checkpoint-overlay")).toBeInTheDocument();
    expect(
      screen.getByText(/How should you submit this research question/i)
    ).toBeInTheDocument();

    // Select the safe option
    const safeOptionBtn = screen.getByTestId("checkpoint-option-safe-bounded-query");
    fireEvent.click(safeOptionBtn);

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "checkpoint_answered",
        useCaseId: demoUseCase.id,
        metadata: expect.objectContaining({
          safe: true,
          optionId: "safe-bounded-query",
        }),
      })
    );

    // Inspect policy source
    const inspectBtn = screen.getByTestId("inspect-source-btn");
    fireEvent.click(inspectBtn);

    expect(screen.getByTestId("source-drawer-modal")).toBeInTheDocument();
    expect(screen.getByText(/VERIFIED POLICY PROVENANCE/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Do not place confidential, privileged or personal information into public AI/i)
    ).toBeInTheDocument();

    // Close source drawer
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("source-drawer-modal")).not.toBeInTheDocument();

    // Continue to payoff
    const continueBtn = screen.getByTestId("checkpoint-continue-btn");
    fireEvent.click(continueBtn);

    expect(screen.queryByTestId("checkpoint-overlay")).not.toBeInTheDocument();
  });

  it("displays completion card and calls onComplete when Practice CTA is clicked", () => {
    const onComplete = vi.fn();

    render(
      <EpisodePlayer
        useCase={demoUseCase}
        onComplete={onComplete}
        autoplay={true}
      />
    );

    // Seek to last chapter (Chapter 5)
    fireEvent.click(screen.getByTestId("chapter-pill-4"));

    // Fast-forward through the last scene duration
    act(() => {
      vi.advanceTimersByTime(16000);
    });

    expect(screen.getByTestId("completion-card")).toBeInTheDocument();
    expect(screen.getByText(/You've Unlocked the Governed Meeting-to-Update Workflow/i)).toBeInTheDocument();

    const practiceBtn = screen.getByTestId("practise-workflow-btn");
    fireEvent.click(practiceBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
