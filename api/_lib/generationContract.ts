import type { GeneratedModuleDraft } from "../../src/domain/generation";

export type { GeneratedModuleDraft } from "../../src/domain/generation";

export const sourceRoles = ["workflow", "playbook", "template", "contract"] as const;
export type GenerationSourceRole = (typeof sourceRoles)[number];

export interface GenerationSource {
  id: string;
  role: GenerationSourceRole;
  filename: string;
  content: string;
}

export interface GenerationModuleRequest {
  useCaseId: string;
  sourceVersion: string;
  contributor: {
    name: string;
    role: string;
    consentConfirmed: true;
    portraitFilename: string;
  };
  sources: GenerationSource[];
}

export class GenerationContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationContractError";
  }
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GenerationContractError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: string[], label: string) {
  const unexpected = Object.keys(value).filter((key) => !keys.includes(key));
  if (unexpected.length) {
    throw new GenerationContractError(`${label} has an unexpected field: ${unexpected[0]}.`);
  }
  const missing = keys.filter((key) => !(key in value));
  if (missing.length) throw new GenerationContractError(`${label} is missing ${missing[0]}.`);
}

function text(value: unknown, label: string, maxLength = 12_000) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new GenerationContractError(`${label} must be non-empty text no longer than ${maxLength} characters.`);
  }
  return value;
}

function textList(value: unknown, label: string, minimum: number, maximum: number) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new GenerationContractError(`${label} must contain between ${minimum} and ${maximum} items.`);
  }
  return value.map((item, index) => text(item, `${label}[${index}]`, 1_000));
}

function citedIds(value: unknown, sourceIds: Set<string>, label: string) {
  const ids = textList(value, `${label} source references`, 1, 8);
  for (const id of ids) {
    if (!sourceIds.has(id)) throw new GenerationContractError(`${label} references unknown source ${id}.`);
  }
  return ids;
}

export function validateGenerationRequest(value: unknown): GenerationModuleRequest {
  const input = record(value, "Generation request");
  exactKeys(input, ["useCaseId", "sourceVersion", "contributor", "sources"], "Generation request");

  const contributor = record(input.contributor, "Contributor");
  exactKeys(contributor, ["name", "role", "consentConfirmed", "portraitFilename"], "Contributor");
  if (contributor.consentConfirmed !== true) {
    throw new GenerationContractError("Contributor consent must be confirmed.");
  }

  if (!Array.isArray(input.sources)) throw new GenerationContractError("Sources must be an array.");
  const sources = input.sources.map((candidate, index) => {
    const source = record(candidate, `Source ${index + 1}`);
    exactKeys(source, ["id", "role", "filename", "content"], `Source ${index + 1}`);
    if (!sourceRoles.includes(source.role as GenerationSourceRole)) {
      throw new GenerationContractError(`Unsupported source role: ${String(source.role)}.`);
    }
    return {
      id: text(source.id, `Source ${index + 1} id`, 100),
      role: source.role as GenerationSourceRole,
      filename: text(source.filename, `Source ${index + 1} filename`, 200),
      content: text(source.content, `Source ${index + 1} content`),
    };
  });

  const roleCounts = new Map(sourceRoles.map((role) => [role, 0]));
  sources.forEach((source) => roleCounts.set(source.role, (roleCounts.get(source.role) ?? 0) + 1));
  if (sources.length !== sourceRoles.length || [...roleCounts.values()].some((count) => count !== 1)) {
    throw new GenerationContractError("Provide exactly one source for each role: workflow, playbook, template and contract.");
  }
  if (new Set(sources.map((source) => source.id)).size !== sources.length) {
    throw new GenerationContractError("Every source requires a unique id.");
  }

  return {
    useCaseId: text(input.useCaseId, "Use-case id", 100),
    sourceVersion: text(input.sourceVersion, "Source version", 100),
    contributor: {
      name: text(contributor.name, "Contributor name", 200),
      role: text(contributor.role, "Contributor role", 200),
      consentConfirmed: true,
      portraitFilename: text(contributor.portraitFilename, "Portrait filename", 200),
    },
    sources,
  };
}

export function validateGeneratedModule(
  value: unknown,
  sourceIds: Set<string>,
  controllingPlaybookSourceId?: string,
): GeneratedModuleDraft {
  const module = record(value, "Generated module");
  exactKeys(module, ["schemaVersion", "title", "learningObjectives", "chapters", "checkpoint"], "Generated module");
  if (module.schemaVersion !== "1.0") throw new GenerationContractError("Generated module schemaVersion must be 1.0.");
  if (!Array.isArray(module.chapters) || module.chapters.length !== 3) {
    throw new GenerationContractError("Generated module must contain exactly three chapters.");
  }

  const chapters = module.chapters.map((candidate, index) => {
    const chapter = record(candidate, `Chapter ${index + 1}`);
    exactKeys(chapter, ["id", "title", "narration", "sourceRefIds", "shots"], `Chapter ${index + 1}`);
    if (!Array.isArray(chapter.shots) || chapter.shots.length < 3 || chapter.shots.length > 5) {
      throw new GenerationContractError(`Chapter ${index + 1} must contain between 3 and 5 shots.`);
    }
    return {
      id: text(chapter.id, `Chapter ${index + 1} id`, 100),
      title: text(chapter.title, `Chapter ${index + 1} title`, 200),
      narration: text(chapter.narration, `Chapter ${index + 1} narration`, 2_000),
      sourceRefIds: citedIds(chapter.sourceRefIds, sourceIds, `Chapter ${index + 1}`),
      shots: chapter.shots.map((candidateShot, shotIndex) => {
        const shot = record(candidateShot, `Chapter ${index + 1} shot ${shotIndex + 1}`);
        exactKeys(shot, ["id", "prompt"], `Chapter ${index + 1} shot ${shotIndex + 1}`);
        return {
          id: text(shot.id, `Chapter ${index + 1} shot ${shotIndex + 1} id`, 100),
          prompt: text(shot.prompt, `Chapter ${index + 1} shot ${shotIndex + 1} prompt`, 1_000),
        };
      }),
    };
  });

  const checkpoint = record(module.checkpoint, "Checkpoint");
  exactKeys(checkpoint, ["question", "options", "correctOptionId", "explanation", "sourceRefIds"], "Checkpoint");
  if (!Array.isArray(checkpoint.options) || checkpoint.options.length < 2 || checkpoint.options.length > 4) {
    throw new GenerationContractError("Checkpoint must contain between 2 and 4 options.");
  }
  const options = checkpoint.options.map((candidate, index) => {
    const option = record(candidate, `Checkpoint option ${index + 1}`);
    exactKeys(option, ["id", "label"], `Checkpoint option ${index + 1}`);
    return { id: text(option.id, `Checkpoint option ${index + 1} id`, 100), label: text(option.label, `Checkpoint option ${index + 1} label`, 300) };
  });
  const correctOptionId = text(checkpoint.correctOptionId, "Checkpoint correct option id", 100);
  if (!options.some((option) => option.id === correctOptionId)) {
    throw new GenerationContractError("Checkpoint correct option must reference one supplied option.");
  }
  const checkpointSourceIds = citedIds(checkpoint.sourceRefIds, sourceIds, "Checkpoint");
  if (controllingPlaybookSourceId && !checkpointSourceIds.includes(controllingPlaybookSourceId)) {
    throw new GenerationContractError("Checkpoint must cite the controlling playbook source.");
  }

  return {
    schemaVersion: "1.0",
    title: text(module.title, "Generated module title", 300),
    learningObjectives: textList(module.learningObjectives, "Learning objectives", 1, 5),
    chapters,
    checkpoint: {
      question: text(checkpoint.question, "Checkpoint question", 500),
      options,
      correctOptionId,
      explanation: text(checkpoint.explanation, "Checkpoint explanation", 1_000),
      sourceRefIds: checkpointSourceIds,
    },
  };
}

const closedObject = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const shortText = { type: "string", minLength: 1, maxLength: 1_000 };
const sourceRefs = { type: "array", minItems: 1, maxItems: 8, items: shortText };

export const generatedModuleJsonSchema = closedObject({
  schemaVersion: { type: "string", enum: ["1.0"] },
  title: { type: "string", minLength: 1, maxLength: 300 },
  learningObjectives: { type: "array", minItems: 1, maxItems: 5, items: shortText },
  chapters: {
    type: "array",
    minItems: 3,
    maxItems: 3,
    items: closedObject({
      id: { type: "string", minLength: 1, maxLength: 100 },
      title: { type: "string", minLength: 1, maxLength: 200 },
      narration: { type: "string", minLength: 1, maxLength: 2_000 },
      sourceRefIds: sourceRefs,
      shots: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: closedObject({
          id: { type: "string", minLength: 1, maxLength: 100 },
          prompt: shortText,
        }),
      },
    }),
  },
  checkpoint: closedObject({
    question: { type: "string", minLength: 1, maxLength: 500 },
    options: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: closedObject({
        id: { type: "string", minLength: 1, maxLength: 100 },
        label: { type: "string", minLength: 1, maxLength: 300 },
      }),
    },
    correctOptionId: { type: "string", minLength: 1, maxLength: 100 },
    explanation: shortText,
    sourceRefIds: sourceRefs,
  }),
});
