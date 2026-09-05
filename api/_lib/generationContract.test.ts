import { describe, expect, it } from "vitest";
import {
  generatedModuleJsonSchema,
  validateGeneratedModule,
  validateGenerationRequest,
} from "./generationContract";

const sourceIds = ["workflow", "playbook", "template", "contract"];

function validRequest() {
  return {
    useCaseId: "sales-renewal-review",
    sourceVersion: "2026.2",
    contributor: {
      name: "Maya Tan",
      role: "Legal Innovation Counsel",
      consentConfirmed: true,
      portraitFilename: "maya-tan.png",
    },
    sources: sourceIds.map((role) => ({
      id: role,
      role,
      filename: `${role}.md`,
      content: `LAWFLO-DEMO: ${role}\nApproved ${role} content`,
    })),
  };
}

function validModule() {
  return {
    schemaVersion: "1.0",
    title: "The renewal that was not low risk",
    learningObjectives: ["Verify AI findings before applying the routing playbook."],
    chapters: ["intake", "review", "route"].map((id, index) => ({
      id,
      title: `Chapter ${index + 1}`,
      narration: `Approved narration for chapter ${index + 1}.`,
      sourceRefIds: [sourceIds[index]],
      shots: [1, 2, 3].map((shot) => ({
        id: `${id}-shot-${shot}`,
        prompt: `Synthetic law office shot ${shot}; no readable contract text.`,
      })),
    })),
    checkpoint: {
      question: "What should Maya do after finding a material liability redline?",
      options: [
        { id: "business", label: "Send to business approval" },
        { id: "legal", label: "Escalate to legal review" },
      ],
      correctOptionId: "legal",
      explanation: "The material-redline rule overrides the low-value shortcut.",
      sourceRefIds: ["playbook"],
    },
  };
}

describe("validateGenerationRequest", () => {
  it("accepts four governed text sources and consented contributor metadata", () => {
    expect(validateGenerationRequest(validRequest())).toEqual(validRequest());
  });

  it("rejects missing, duplicate, or unsupported source roles", () => {
    const missing = validRequest();
    missing.sources.pop();
    expect(() => validateGenerationRequest(missing)).toThrow(/exactly one source for each role/i);

    const duplicate = validRequest();
    duplicate.sources[3].role = "workflow";
    expect(() => validateGenerationRequest(duplicate)).toThrow(/exactly one source for each role/i);

    const unsupported = validRequest();
    unsupported.sources[0].role = "portrait";
    expect(() => validateGenerationRequest(unsupported)).toThrow(/unsupported source role/i);
  });

  it("rejects unconsented metadata and unexpected properties", () => {
    const unconsented = validRequest();
    unconsented.contributor.consentConfirmed = false;
    expect(() => validateGenerationRequest(unconsented)).toThrow(/consent/i);

    expect(() => validateGenerationRequest({ ...validRequest(), apiKey: "must-not-pass" })).toThrow(/unexpected field/i);
  });
});

describe("validateGeneratedModule", () => {
  it("accepts a complete three-chapter source-linked module", () => {
    expect(validateGeneratedModule(validModule(), new Set(sourceIds))).toEqual(validModule());
  });

  it("rejects unknown citations and uncited chapters", () => {
    const unknown = validModule();
    unknown.chapters[0].sourceRefIds = ["invented-policy"];
    expect(() => validateGeneratedModule(unknown, new Set(sourceIds))).toThrow(/unknown source/i);

    const uncited = validModule();
    uncited.chapters[1].sourceRefIds = [];
    expect(() => validateGeneratedModule(uncited, new Set(sourceIds))).toThrow(/source reference/i);
  });

  it("rejects a checkpoint that does not cite the controlling playbook", () => {
    const module = validModule();
    module.checkpoint.sourceRefIds = ["contract"];
    expect(() => validateGeneratedModule(module, new Set(sourceIds), "playbook")).toThrow(/controlling playbook/i);
  });

  it("rejects wrong chapter count, invalid correct option, and extra fields", () => {
    const short = validModule();
    short.chapters.pop();
    expect(() => validateGeneratedModule(short, new Set(sourceIds))).toThrow(/three chapters/i);

    const wrongOption = validModule();
    wrongOption.checkpoint.correctOptionId = "missing";
    expect(() => validateGeneratedModule(wrongOption, new Set(sourceIds))).toThrow(/correct option/i);

    expect(() => validateGeneratedModule({ ...validModule(), published: true }, new Set(sourceIds))).toThrow(/unexpected field/i);
  });

  it("exports a strict schema with every object closed to extra properties", () => {
    const objects: Array<Record<string, unknown>> = [];
    const visit = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      const object = value as Record<string, unknown>;
      if (object.type === "object") objects.push(object);
      Object.values(object).forEach(visit);
    };
    visit(generatedModuleJsonSchema);
    expect(objects.length).toBeGreaterThan(4);
    expect(objects.every((object) => object.additionalProperties === false)).toBe(true);
  });
});
