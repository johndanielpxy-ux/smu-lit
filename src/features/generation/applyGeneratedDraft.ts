import type { GeneratedModuleDraft } from "../../domain/generation";
import type { SourceRef, UseCase } from "../../domain/mattershift";
import type { DemoPack } from "../studio/demoPack";

const documentRoles = ["workflow", "playbook", "template", "contract"] as const;

function documentSources(pack: DemoPack, sourceVersion: string): SourceRef[] {
  return documentRoles.map((role) => ({
    id: role,
    title: pack.filenames[role],
    version: sourceVersion,
    excerpt: pack[`${role}Text`].replace(/\s+/g, " ").trim().slice(0, 240),
  }));
}

export function applyGeneratedDraft(
  useCase: UseCase,
  generatedModuleDraft: GeneratedModuleDraft,
  pack: DemoPack,
): UseCase {
  const generatedSourceIds = new Set<string>(documentRoles);
  return {
    ...useCase,
    generatedModuleDraft,
    sources: [
      ...useCase.sources.filter((source) => !generatedSourceIds.has(source.id)),
      ...documentSources(pack, useCase.sourceVersion),
    ],
    approvalStatus: "draft",
    approvedBy: undefined,
    approvalRecord: undefined,
  };
}
