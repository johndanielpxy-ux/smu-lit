import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";

export interface EpisodeCheckpoint {
  id: string;
  prompt: string;
  choices: Array<{ id: string; label: string; safe: boolean }>;
  safeChoiceId: string;
  sourceRefIds: string[];
}

export interface EpisodeCue {
  id: string;
  chapter: number;
  title: string;
  durationSeconds: number;
  narration: string;
  caption: string;
  visual: "portrait" | "contract" | "comparison" | "routing";
  sourceRefIds: string[];
  checkpoint?: EpisodeCheckpoint;
}

function generatedTimeline(bundle: CompiledLawfloBundle): EpisodeCue[] | undefined {
  const draft = bundle.useCase.generatedModuleDraft;
  if (!draft) return undefined;
  const visuals: EpisodeCue["visual"][] = ["portrait", "comparison", "routing"];
  return draft.chapters.map((chapter, index) => ({
    id: `generated-${chapter.id}`,
    chapter: index + 1,
    title: chapter.title,
    durationSeconds: 25,
    narration: chapter.narration,
    caption: chapter.narration,
    visual: visuals[index] ?? "contract",
    sourceRefIds: chapter.sourceRefIds,
    checkpoint: index === draft.chapters.length - 1 ? {
      id: "generated-routing-checkpoint",
      prompt: draft.checkpoint.question,
      choices: draft.checkpoint.options.map((option) => ({
        ...option,
        safe: option.id === draft.checkpoint.correctOptionId,
      })),
      safeChoiceId: draft.checkpoint.correctOptionId,
      sourceRefIds: draft.checkpoint.sourceRefIds,
    } : undefined,
  }));
}

export function createEpisodeTimeline(bundle: CompiledLawfloBundle): EpisodeCue[] {
  const generated = generatedTimeline(bundle);
  if (generated) return generated;
  const value = bundle.rehearsal.scenario.contractValue.toLocaleString("en-SG");
  return [
    {
      id: "bottleneck",
      chapter: 1,
      title: "The renewal bottleneck",
      durationSeconds: 16,
      narration: "Routine renewals look simple, but sending every one to legal slows the business. Maya shows how legal AI can help without handing it the final decision.",
      caption: "Routine renewals look simple—until review queues slow every deal.",
      visual: "portrait",
      sourceRefIds: ["renewal-routing-playbook"],
    },
    {
      id: "ai-extraction",
      chapter: 2,
      title: "AI extracts the matter",
      durationSeconds: 16,
      narration: `The authorised AI extracts a value of SGD ${value}, template version 2026.2 and Singapore law. It also claims there is no material redline. Every output is still a draft.`,
      caption: `AI draft: SGD ${value} · Template 2026.2 · No material redline?`,
      visual: "contract",
      sourceRefIds: ["authorised-ai-policy", "ai-verification-policy"],
    },
    {
      id: "clause-comparison",
      chapter: 3,
      title: "Compare, don't assume",
      durationSeconds: 18,
      narration: "The standard clause caps liability at twelve months of fees. The submitted agreement replaces it with unlimited liability, including indirect losses.",
      caption: "Standard: capped liability → Submitted: unlimited liability.",
      visual: "comparison",
      sourceRefIds: ["approved-template-2026-2", "material-redline-rule"],
    },
    {
      id: "human-verification",
      chapter: 4,
      title: "The human catches the miss",
      durationSeconds: 18,
      narration: "Maya opens the underlying clause and corrects the AI finding from no material redline to material redline. The model proposes; the responsible human verifies.",
      caption: "Human correction: materialRedline = true.",
      visual: "comparison",
      sourceRefIds: ["ai-verification-policy", "human-responsibility"],
    },
    {
      id: "playbook-routing",
      chapter: 5,
      title: "Apply the playbook",
      durationSeconds: 18,
      narration: `The agreement is only SGD ${value}, but the liability redline is material. Which route is safe?`,
      caption: "Low value helps only when the approved template is unchanged.",
      visual: "routing",
      sourceRefIds: ["renewal-routing-playbook", "material-redline-rule"],
      checkpoint: {
        id: "material-redline-route",
        prompt: "What should happen next?",
        choices: [
          { id: "approve-low-value", label: "Send to business approval", safe: false },
          { id: "escalate-material-redline", label: "Escalate to legal review", safe: true },
        ],
        safeChoiceId: "escalate-material-redline",
        sourceRefIds: ["renewal-routing-playbook", "material-redline-rule"],
      },
    },
    {
      id: "safe-escalation",
      chapter: 6,
      title: "Escalate with a reason",
      durationSeconds: 14,
      narration: "Maya routes the renewal to legal review with the changed liability clause and matched playbook rule attached. The decision is fast, explainable and auditable.",
      caption: "Legal review · Material liability change · Source attached.",
      visual: "routing",
      sourceRefIds: ["material-redline-rule", "human-responsibility"],
    },
  ];
}

export function cueStartSeconds(cues: EpisodeCue[], cueIndex: number): number {
  return cues.slice(0, cueIndex).reduce((sum, cue) => sum + cue.durationSeconds, 0);
}
