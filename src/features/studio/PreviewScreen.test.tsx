import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { preparedEpisodeMedia } from "../episode/episodeMedia";
import { PreviewScreen } from "./PreviewScreen";

describe("PreviewScreen", () => {
  it("keeps the episode dominant and offers one publishing action", () => {
    const onApprovePublish = vi.fn();
    render(<PreviewScreen title="Route a Sales Renewal" onApprovePublish={onApprovePublish} />);

    expect(screen.getByRole("heading", { name: /route a sales renewal/i })).toBeVisible();
    const video = screen.getByTitle(/episode preview video/i);
    expect(video).toBeVisible();
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("src", preparedEpisodeMedia.segments[0].videoSrc);
    expect(screen.getByTitle(/episode preview narration/i)).toHaveAttribute("src", preparedEpisodeMedia.segments[0].audioSrc);
    expect(screen.getByText(/scene 1 of 4/i)).toBeVisible();
    expect(screen.getByText("SGD 42,000")).toBeVisible();
    expect(screen.getByRole("button", { name: /approve and publish/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /approve exact version/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve and publish/i }));
    expect(onApprovePublish).toHaveBeenCalledTimes(1);
  });
});
