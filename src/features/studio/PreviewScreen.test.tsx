import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreviewScreen } from "./PreviewScreen";

describe("PreviewScreen", () => {
  it("keeps the episode dominant and offers one publishing action", () => {
    const onApprovePublish = vi.fn();
    render(<PreviewScreen title="Route a Sales Renewal" onApprovePublish={onApprovePublish} />);

    expect(screen.getByRole("heading", { name: /route a sales renewal/i })).toBeVisible();
    const video = screen.getByTitle(/episode preview video/i);
    expect(video).toBeVisible();
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("src", expect.stringMatching(/review-the-renewal\.mp4/));
    expect(screen.getByRole("button", { name: /approve and publish/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /approve exact version/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve and publish/i }));
    expect(onApprovePublish).toHaveBeenCalledTimes(1);
  });
});
