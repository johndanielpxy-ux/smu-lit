import { describe, expect, it, vi } from "vitest";
import { OpenAIProviderError } from "../_lib/openaiProvider";
import { createModuleHandler } from "./module";

const token = "protected-studio-token";

function validRequestBody() {
  const roles = ["workflow", "playbook", "template", "contract"];
  return {
    useCaseId: "sales-renewal-review",
    sourceVersion: "2026.2",
    contributor: { name: "Maya Tan", role: "Legal Innovation Counsel", consentConfirmed: true, portraitFilename: "maya.png" },
    sources: roles.map((role) => ({ id: role, role, filename: `${role}.md`, content: `LAWFLO-DEMO: ${role}\nSynthetic approved content` })),
  };
}

function validDraft() {
  return {
    schemaVersion: "1.0",
    title: "A material redline changes the route",
    learningObjectives: ["Verify AI findings before routing."],
    chapters: ["intake", "review", "route"].map((id, index) => ({
      id,
      title: `Chapter ${index + 1}`,
      narration: `Narration ${index + 1}`,
      sourceRefIds: [["workflow"], ["contract", "template"], ["playbook"]][index],
      shots: [1, 2, 3].map((shot) => ({ id: `${id}-${shot}`, prompt: `Synthetic workplace shot ${shot}` })),
    })),
    checkpoint: {
      question: "Where should the renewal go?",
      options: [{ id: "business", label: "Business approval" }, { id: "legal", label: "Legal review" }],
      correctOptionId: "legal",
      explanation: "A material redline overrides value.",
      sourceRefIds: ["playbook"],
    },
  };
}

function request(body: unknown = validRequestBody()) {
  return new Request("https://lawflo.example/api/generation/module", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("module generation handler", () => {
  it("returns a validated source-linked draft", async () => {
    const handler = createModuleHandler({ studioToken: token, generate: async () => validDraft() });
    const response = await handler(request());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ draft: validDraft() });
  });

  it("rejects invalid inputs before any provider spend", async () => {
    const generate = vi.fn(async () => validDraft());
    const handler = createModuleHandler({ studioToken: token, generate });
    const body = validRequestBody();
    body.sources.pop();
    const response = await handler(request(body));
    expect(response.status).toBe(422);
    expect(generate).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ error: { code: "INVALID_GENERATION_REQUEST" } });
  });

  it("rejects generated output containing an unknown citation", async () => {
    const draft = validDraft();
    draft.chapters[0].sourceRefIds = ["invented-policy"];
    const handler = createModuleHandler({ studioToken: token, generate: async () => draft });
    const response = await handler(request());
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ error: { code: "UNSAFE_GENERATED_OUTPUT", message: "The generated draft did not pass source verification." } });
  });

  it.each([
    ["PROVIDER_REFUSAL", 422],
    ["PROVIDER_TIMEOUT", 504],
    ["PROVIDER_RATE_LIMITED", 429],
    ["PROVIDER_UNAVAILABLE", 503],
    ["GENERATION_NOT_CONFIGURED", 503],
  ] as const)("normalises %s without exposing provider details", async (code, status) => {
    const handler = createModuleHandler({ studioToken: token, generate: async () => { throw new OpenAIProviderError(code, "upstream secret body"); } });
    const response = await handler(request());
    expect(response.status).toBe(status);
    expect(await response.text()).not.toContain("upstream secret body");
  });

  it("normalises unexpected errors without exposing source text", async () => {
    const handler = createModuleHandler({ studioToken: token, generate: async () => { throw new Error("Synthetic approved content"); } });
    const response = await handler(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("Synthetic approved content");
  });
});
