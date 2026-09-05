import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductionScreen } from "./ProductionScreen";

describe("ProductionScreen", () => {
  it("honestly identifies the prepared render and completes five stages", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<ProductionScreen mode="prepared" stepDurationMs={10} onComplete={onComplete} />);

    expect(screen.getByText(/prepared demo render/i)).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(50));
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
