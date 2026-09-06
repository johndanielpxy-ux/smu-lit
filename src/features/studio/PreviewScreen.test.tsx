import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { preparedEpisodeMedia } from "../episode/episodeMedia";
import { PreviewScreen } from "./PreviewScreen";

describe("PreviewScreen", () => {
  it("keeps the episode dominant and offers one publishing action", () => {
    const onApprovePublish = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    render(<PreviewScreen title="Route a Sales Renewal" onApprovePublish={onApprovePublish} />);

    expect(screen.getByRole("heading", { name: /route a sales renewal/i })).toBeVisible();
    const video = screen.getByLabelText(/episode preview video/i);
    expect(video).toBeVisible();
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("src", preparedEpisodeMedia.segments[0].videoSrc);
    expect(screen.getByLabelText(/episode preview narration/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[0].audioSrc);
    expect(screen.getByText(/scene 1 of 4/i)).toBeVisible();
    expect(screen.queryByText("SGD 42,000")).not.toBeInTheDocument();
    fireEvent.timeUpdate(video, { target: { currentTime: 10 } });
    expect(screen.getByText("SGD 42,000")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /preview scene 2/i }));
    expect(screen.getByLabelText(/episode preview video/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[1].videoSrc);
    expect(screen.getByRole("button", { name: /approve and publish/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /approve exact version/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve and publish/i }));
    expect(onApprovePublish).toHaveBeenCalledTimes(1);
  });
});
