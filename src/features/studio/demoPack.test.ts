import { describe, expect, it, vi } from "vitest";
import {
  DEMO_PACK_MARKERS,
  loadSyntheticDemoPack,
  readDemoTextFile,
  validateDemoPack,
} from "./demoPack";

function textFile(name: string, content: string): File {
  const file = new File([content], name, { type: "text/markdown" });
  Object.defineProperty(file, "text", {
    configurable: true,
    value: vi.fn().mockResolvedValue(content),
  });
  return file;
}

describe("demoPack", () => {
  it("loads a complete bundled pack without runtime fetch", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const pack = loadSyntheticDemoPack();

    expect(validateDemoPack(pack)).toEqual({ valid: true, errors: [] });
    expect(pack.portraitUrlKind).toBe("bundled");
    expect(pack.contractText).toContain(DEMO_PACK_MARKERS.contract);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("reads a local marked text file", async () => {
    const content = `${DEMO_PACK_MARKERS.contract}\nSynthetic contract`;

    await expect(
      readDemoTextFile(textFile("contract.md", content), DEMO_PACK_MARKERS.contract),
    ).resolves.toBe(content);
  });

  it("rejects arbitrary, oversized and unreadable text files", async () => {
    await expect(
      readDemoTextFile(textFile("contract.md", "Other contract"), DEMO_PACK_MARKERS.contract),
    ).rejects.toMatchObject({ code: "MARKER_MISMATCH" });

    const oversized = textFile("contract.md", DEMO_PACK_MARKERS.contract);
    Object.defineProperty(oversized, "size", { value: 2 * 1024 * 1024 + 1 });
    await expect(
      readDemoTextFile(oversized, DEMO_PACK_MARKERS.contract),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });

    const unreadable = textFile("contract.md", DEMO_PACK_MARKERS.contract);
    Object.defineProperty(unreadable, "text", {
      value: vi.fn().mockRejectedValue(new Error("blocked")),
    });
    await expect(
      readDemoTextFile(unreadable, DEMO_PACK_MARKERS.contract),
    ).rejects.toMatchObject({ code: "FILE_READ_FAILED" });
  });

  it("rejects a pack whose contract was silently replaced", () => {
    const pack = { ...loadSyntheticDemoPack(), contractText: "Other contract" };

    expect(validateDemoPack(pack).errors).toContain(
      "The selected contract is not the versioned LAWFLO demonstration contract.",
    );
  });
});
