export interface GeneratedModuleDraft {
  schemaVersion: "1.0";
  title: string;
  learningObjectives: string[];
  chapters: Array<{
    id: string;
    title: string;
    narration: string;
    sourceRefIds: string[];
    shots: Array<{ id: string; prompt: string }>;
  }>;
  checkpoint: {
    question: string;
    options: Array<{ id: string; label: string }>;
    correctOptionId: string;
    explanation: string;
    sourceRefIds: string[];
  };
}
