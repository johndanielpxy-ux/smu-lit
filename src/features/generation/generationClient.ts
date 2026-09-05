import {
  validateGeneratedModule,
} from "../../../api/_lib/generationContract";
import type { GeneratedModuleDraft } from "../../domain/generation";
import type { DemoPack } from "../studio/demoPack";

const sourceKinds = ["workflow", "playbook", "template", "contract"] as const;

function requestBody(pack: DemoPack) {
  return {
    useCaseId: "sales-renewal-review",
    sourceVersion: "2026.2",
    contributor: {
      name: "Maya Tan",
      role: "Legal Innovation Counsel",
      consentConfirmed: true,
      portraitFilename: pack.filenames.portrait,
    },
    sources: sourceKinds.map((role) => ({
      id: role,
      role,
      filename: pack.filenames[role],
      content: pack[`${role}Text`],
    })),
  };
}

export async function requestGeneratedModule(
  pack: DemoPack,
  studioToken: string,
  fetcher: typeof fetch = fetch,
): Promise<GeneratedModuleDraft> {
  const response = await fetcher("/api/generation/module", {
    method: "POST",
    headers: {
      authorization: `Bearer ${studioToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody(pack)),
  });

  if (!response.ok) {
    if (response.status === 504) {
      throw new Error("Generation timed out. Your approved module is unchanged.");
    }
    if (response.status === 401) {
      throw new Error("Production access was not accepted. Check the Studio token.");
    }
    throw new Error("The draft could not be generated safely. Your approved module is unchanged.");
  }

  const payload = await response.json() as { draft?: unknown };
  if (!payload.draft) throw new Error("The generation service returned no draft.");
  return validateGeneratedModule(payload.draft, new Set(sourceKinds), "playbook");
}
