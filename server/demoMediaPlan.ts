import type { RunwayVideoShot } from "./runwayClient";

export interface DemoMediaPlan {
  filename: string;
  label: string;
  shots: [RunwayVideoShot, RunwayVideoShot, RunwayVideoShot];
}

const visualLanguage = "cinematic premium corporate training film, warm Singapore law-office light, navy and burnt-orange palette, natural camera movement, realistic Asian female legal innovation counsel in her early thirties, no logos, no readable text";

export const demoMediaPlans: readonly DemoMediaPlan[] = [
  {
    filename: "lawflo-review-the-renewal.mp4",
    label: "Review the renewal",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Wide establishing shot: Maya sits at a modern desk reviewing a routine sales-renewal agreement on a laptop, calm focused posture, colleagues softly out of focus, no readable text.` },
      { duration: 5, prompt: `${visualLanguage}. Over-shoulder close shot: an AI review panel appears beside a contract document; one changed liability clause is highlighted with a restrained orange marker, abstract interface shapes only, no readable text.` },
      { duration: 5, prompt: `${visualLanguage}. Medium close-up: Maya notices the discrepancy, pauses the automated route and compares the submitted clause against an approved template, precise confident expression, no readable text.` },
    ],
  },
  {
    filename: "lawflo-explain-the-route.mp4",
    label: "Explain the safe route",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Over-shoulder shot: Maya links the changed liability clause to a playbook rule in a clean abstract workflow interface, evidence nodes connect visually, no readable text.` },
      { duration: 5, prompt: `${visualLanguage}. Medium shot: Maya selects a legal-review route and records a concise reason while the low-risk shortcut visibly closes, subtle orange confirmation accent, no readable text.` },
      { duration: 5, prompt: `${visualLanguage}. Wide closing shot: the renewal moves to a legal reviewer with its evidence attached; Maya turns toward camera with composed confidence, collaborative office background, no readable text.` },
    ],
  },
];
