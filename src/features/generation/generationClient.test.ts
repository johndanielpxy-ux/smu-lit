import { describe, expect, it } from "vitest";
import { loadSyntheticDemoPack } from "../studio/demoPack";
import { requestGeneratedModule } from "./generationClient";

const draft = {
  schemaVersion: "1.0" as const,
  title: "Generated module",
  learningObjectives: ["Verify AI findings."],
  chapters: ["one", "two", "three"].map((id) => ({
    id,
    title: id,
    narration: `Narration ${id}`,
    sourceRefIds: [id === "three" ? "playbook" : "workflow"],
    shots: [1, 2, 3].map((shot) => ({ id: `${id}-${shot}`, prompt: `Shot ${shot}` })),
  })),
  checkpoint: {
    question: "Route?",
    options: [{ id: "legal", label: "Legal" }, { id: "business", label: "Business" }],
    correctOptionId: "legal",
    explanation: "The playbook controls.",
    sourceRefIds: ["playbook"],
  },
};

describe("requestGeneratedModule", () => {
  it("sends four text sources with the token in a header and never sends the portrait", async () => {
    let request: Request | undefined;
    const fetcher: typeof fetch = async (input, init) => {
      request = new Request(new URL(String(input), "https://lawflo.example"), init);
      return Response.json({ draft });
    };
    await expect(requestGeneratedModule(loadSyntheticDemoPack(), "studio-token", fetcher)).resolves.toEqual(draft);
    expect(request?.headers.get("authorization")).toBe("Bearer studio-token");
    const body = JSON.parse(await request!.text()) as { sources: unknown[]; contributor: Record<string, unknown> };
    expect(body.sources).toHaveLength(4);
    expect(JSON.stringify(body)).not.toContain("portraitUrl");
    expect(body.contributor.portraitFilename).toBe("maya-tan.png");
  });

  it("turns server failures into a safe user-facing error", async () => {
    const fetcher: typeof fetch = async () => Response.json({ error: { code: "PROVIDER_TIMEOUT", message: "Provider body" } }, { status: 504 });
    await expect(requestGeneratedModule(loadSyntheticDemoPack(), "studio-token", fetcher)).rejects.toThrow("Generation timed out. Your approved module is unchanged.");
  });
});
