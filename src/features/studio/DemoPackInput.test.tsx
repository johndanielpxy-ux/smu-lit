import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoPackInput } from "./DemoPackInput";

describe("DemoPackInput", () => {
  it("loads the complete deterministic pack without a file dialog", async () => {
    const onReady = vi.fn();
    const onCreate = vi.fn();
    const onEvent = vi.fn();
    render(<DemoPackInput onReady={onReady} onCreate={onCreate} onEvent={onEvent} />);

    expect(screen.getByLabelText(/upload workflow resources/i)).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: /use prepared source pack/i }),
    );

    expect(await screen.findByText(/5 sources ready/i)).toBeVisible();
    expect(onReady).toHaveBeenCalledWith(
      expect.objectContaining({
        contractText: expect.stringContaining("submitted-sales-renewal-v1"),
      }),
    );
    expect(onEvent).toHaveBeenCalledWith("demo_pack_loaded", {
      source: "bundled",
      inputCount: 5,
    });
    fireEvent.click(screen.getByRole("button", { name: /create episode/i }));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ contractText: expect.any(String) }));
  });

  it("explains which inputs leave the browser for protected generation", async () => {
    render(<DemoPackInput onReady={vi.fn()} onCreate={vi.fn()} onEvent={vi.fn()} />);

    expect(screen.getByText(/approved text sources are sent to the protected generation service/i)).not.toBeVisible();
    fireEvent.click(screen.getByText(/source settings/i));
    expect(screen.getByText(/approved text sources are sent to the protected generation service/i)).toBeVisible();
    expect(screen.getByText(/the portrait stays in this browser/i)).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: /use prepared source pack/i }),
    );

    expect(await screen.findByText(/contract-review-workflow.md/i)).toBeVisible();
    expect(screen.getByText(/maya-tan.png/i)).toBeVisible();
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
    render(<DemoPackInput onReady={vi.fn()} onCreate={vi.fn()} onEvent={vi.fn()} />);
    const portraitInput = screen.getByLabelText(/upload contributor portrait/i);

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
