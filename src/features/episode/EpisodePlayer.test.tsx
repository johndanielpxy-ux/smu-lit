import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "../compiler/bundleCompiler";
import { EpisodePlayer } from "./EpisodePlayer";
import { preparedEpisodeMedia } from "./episodeMedia";

const bundle = compileApprovedTrainingModule(
  approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
  contractTrainingContent,
);

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

describe("EpisodePlayer", () => {
  it("plays durable video segments, pauses for the checkpoint, then offers the guided rehearsal", () => {
    const onComplete = vi.fn();
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    render(<EpisodePlayer bundle={bundle} media={preparedEpisodeMedia} onEvent={vi.fn()} onComplete={onComplete} />);

    const video = screen.getByTitle(/prepared training episode/i);
    expect(video).toHaveAttribute("src", preparedEpisodeMedia.segments[0].videoSrc);
    expect(screen.getByTitle(/episode narration/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[0].audioSrc);
    expect(screen.getByText(/SGD 42,000/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /play episode video/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /play episode video/i }));
    expect(play).toHaveBeenCalled();

    fireEvent.ended(video);
    expect(screen.getByTitle(/prepared training episode/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[1].videoSrc);
    expect(screen.getByText(/unlimited.*including indirect losses/i)).toBeVisible();
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    expect(screen.getByRole("heading", { name: /what should happen next/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /send to business approval/i }));
    expect(screen.getByText(/low value never cancels/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /escalate to legal review/i }));
    expect(screen.getByTitle(/prepared training episode/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[2].videoSrc);

    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    expect(screen.getByTitle(/prepared training episode/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[3].videoSrc);
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    expect(screen.getByRole("button", { name: /start guided rehearsal/i })).toBeVisible();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /start guided rehearsal/i }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("uses the uploaded contributor portrait in the learning experience", () => {
    render(<EpisodePlayer bundle={bundle} portraitUrl="blob:custom-presenter" onEvent={vi.fn()} onComplete={vi.fn()} />);
    expect(screen.getByRole("img", { name: /fictional legal innovation counsel/i })).toHaveAttribute("src", "blob:custom-presenter");
  });

  it("uses prepared narration without invoking browser speech synthesis", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak, cancel });
    vi.stubGlobal("SpeechSynthesisUtterance", class { rate = 1; pitch = 1; constructor(public text: string) {} });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    render(<EpisodePlayer bundle={bundle} media={preparedEpisodeMedia} onEvent={vi.fn()} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /play episode video/i }));
    expect(screen.getByTitle(/episode narration/i)).toHaveAttribute("src", expect.stringMatching(/\.mp3$/));
    expect(cancel).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });

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
