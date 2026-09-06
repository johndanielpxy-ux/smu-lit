import type { RunwayVideoShot } from "./runwayClient";

export interface DemoMediaPlan {
  filename: string;
  audioFilename: string;
  label: string;
  narration: string;
  shots: [RunwayVideoShot, RunwayVideoShot, RunwayVideoShot];
}

const visualLanguage = "cinematic premium corporate training film, warm Singapore law-office light, navy and burnt-orange palette, natural camera movement, realistic Asian female legal innovation counsel in her early thirties, no logos, no readable text, no software interface, no screens facing camera";

export const demoMediaPlans: readonly DemoMediaPlan[] = [
  {
    filename: "lawflo-v2-01-ai-review.mp4", audioFilename: "lawflo-v2-01-ai-review.mp3", label: "AI reviews the renewal",
    narration: "A sales renewal arrives at forty-two thousand Singapore dollars. The authorised AI extracts the key facts and reports no material redline. Maya treats that result as a draft, never a decision.",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Wide establishing shot of Maya receiving a routine sales renewal at her desk, focused and calm.` },
      { duration: 5, prompt: `${visualLanguage}. Side profile of Maya studying a laptop while a restrained warm light moves across the desk.` },
      { duration: 5, prompt: `${visualLanguage}. Medium shot of Maya pausing before acting, signalling that an automated result needs human verification.` },
    ],
  },
  {
    filename: "lawflo-v2-02-verify-evidence.mp4", audioFilename: "lawflo-v2-02-verify-evidence.mp3", label: "Maya verifies the evidence",
    narration: "Maya opens the source clauses. The approved template caps liability at twelve months of fees. The submitted agreement replaces that safeguard with unlimited liability, including indirect losses.",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Over-shoulder angle with Maya opening two physical document folders side by side, pages deliberately out of focus.` },
      { duration: 5, prompt: `${visualLanguage}. Close shot of Maya tracing two different passages with a pen, recognising a serious discrepancy.` },
      { duration: 5, prompt: `${visualLanguage}. Medium close-up as Maya marks the discrepancy for review with a decisive, careful expression.` },
    ],
  },
  {
    filename: "lawflo-v2-03-learner-decision.mp4", audioFilename: "lawflo-v2-03-learner-decision.mp3", label: "Apply the legal playbook",
    narration: "The contract value is low, but the template has materially changed. The playbook says the shortcut applies only when standard terms are untouched. Maya corrects the AI finding.",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Maya consults a bound legal playbook beside the agreement, pages and markings out of focus.` },
      { duration: 5, prompt: `${visualLanguage}. Maya compares the playbook and agreement, then closes a shortcut folder to show it cannot be used.` },
      { duration: 5, prompt: `${visualLanguage}. Maya records a careful correction, viewed from the side with the desk surface in focus.` },
    ],
  },
  {
    filename: "lawflo-v2-04-safe-route.mp4", audioFilename: "lawflo-v2-04-safe-route.mp3", label: "Route with an audit trail",
    narration: "Maya routes the renewal to legal review and attaches the changed clause and controlling playbook rule. The model proposed; the responsible human verified; LAWFLO preserved the reason.",
    shots: [
      { duration: 5, prompt: `${visualLanguage}. Maya assembles the agreement and playbook into one organised review file, precise hand movement.` },
      { duration: 5, prompt: `${visualLanguage}. Maya passes the organised review file to a legal colleague across a modern office table.` },
      { duration: 5, prompt: `${visualLanguage}. Confident closing shot of Maya in the collaborative office after completing a safe, accountable handoff.` },
    ],
  },
];
