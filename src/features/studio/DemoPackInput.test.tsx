import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoPackInput } from "./DemoPackInput";

describe("DemoPackInput", () => {
  it("loads the complete deterministic pack without a file dialog", async () => {
    const onReady = vi.fn();
    const onEvent = vi.fn();
    render(<DemoPackInput onReady={onReady} onEvent={onEvent} />);

    expect(screen.getAllByLabelText(/select/i)).toHaveLength(5);
    fireEvent.click(
      screen.getByRole("button", { name: /load synthetic demo pack/i }),
    );

    expect(await screen.findByText(/five inputs ready/i)).toBeVisible();
    expect(onReady).toHaveBeenCalledWith(
      expect.objectContaining({
        contractText: expect.stringContaining("submitted-sales-renewal-v1"),
      }),
    );
    expect(onEvent).toHaveBeenCalledWith("demo_pack_loaded", {
      source: "bundled",
      inputCount: 5,
    });
  });

  it("revokes only replaced user-owned portrait URLs", async () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:portrait-one")
      .mockReturnValueOnce("blob:portrait-two");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    render(<DemoPackInput onReady={vi.fn()} onEvent={vi.fn()} />);
    const portraitInput = screen.getByLabelText(/select contributor portrait/i);

    fireEvent.change(portraitInput, {
      target: { files: [new File(["one"], "one.png", { type: "image/png" })] },
    });
    fireEvent.change(portraitInput, {
      target: { files: [new File(["two"], "two.png", { type: "image/png" })] },
    });

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(2));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:portrait-one");
    expect(revokeObjectURL).not.toHaveBeenCalledWith(expect.stringMatching(/^\/src\//));
  });
});
