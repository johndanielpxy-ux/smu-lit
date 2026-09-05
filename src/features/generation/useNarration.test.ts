import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { requestNarration, useNarration } from "./useNarration";

const input = {
  narration: "Exact approved narration.",
  approvalFingerprint: "msc-abcd1234",
  voice: "marin" as const,
  studioToken: "studio-token",
};

describe("requestNarration", () => {
  it("requests exact approved text and returns MP3 bytes", async () => {
    let captured: Request | undefined;
    const fetcher: typeof fetch = async (target, init) => {
      captured = new Request(new URL(String(target), "https://lawflo.example"), init);
      return new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "audio/mpeg" } });
    };
    const blob = await requestNarration(input, fetcher);
    expect(blob.type).toBe("audio/mpeg");
    expect(captured?.headers.get("authorization")).toBe("Bearer studio-token");
    await expect(captured?.json()).resolves.toEqual({ narration: input.narration, approvalFingerprint: input.approvalFingerprint, voice: "marin" });
  });

  it("preserves the episode when narration fails", async () => {
    await expect(requestNarration(input, async () => Response.json({}, { status: 503 }))).rejects.toThrow("Narration is unavailable. The episode will continue with captions.");
  });
});

describe("useNarration", () => {
  it("replaces and revokes browser-owned audio URLs", async () => {
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValueOnce("blob:first").mockReturnValueOnce("blob:second");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const fetcher: typeof fetch = async () => new Response(new Uint8Array([1]), { headers: { "content-type": "audio/mpeg" } });
    const { result, unmount } = renderHook(() => useNarration(fetcher));
    await act(async () => { await result.current.generate(input); });
    await waitFor(() => expect(result.current.url).toBe("blob:first"));
    await act(async () => { await result.current.generate(input); });
    expect(result.current.url).toBe("blob:second");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:first");
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:second");
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});
