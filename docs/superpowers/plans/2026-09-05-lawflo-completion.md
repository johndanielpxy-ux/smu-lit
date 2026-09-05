# LAWFLO Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one coherent, phone-usable LAWFLO prototype that compiles an approved legal-engineering workflow into a source-linked episode, guarded rehearsal, point-of-work activation card and truthful evidence ledger.

**Architecture:** Keep the existing `UseCase` compiler, approval fingerprint, event store and evidence graph as the authoritative core. Add three isolated stateful subsystems around it: a versioned journey controller, a deterministic episode timeline and a guarded rehearsal engine. React components request typed transitions; pure reducers decide whether those transitions are legal. `App.tsx` owns orchestration and supplies one approved `UseCase` plus one scoped event reporter to every subsystem.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest 5, Testing Library, browser `localStorage`, optional Playwright for final browser automation, GitHub Pages for the static deployment.

**Spec:** `docs/TECHNICAL-DEPTH.md`, `docs/agent-handoffs/JOHN.md`, `../R&T-STRESS-TEST-YC-PATTERNS.md`, and `../R&T-COPY-AND-CONTEXTUALISE.md`.

## Global Constraints

- John/Codex is the sole repository writer for completion work. Teammate outputs arrive as content or QA feedback, not code.
- Preserve `UseCase`, `MatterShiftEvent`, `MatterShiftEventType` and existing integration contracts until the complete journey is green.
- Use one canonical workflow from `src/demo/demoUseCase.ts`; do not introduce a second fixture or private data model.
- Keep every person, policy and matter synthetic. Never claim a live R&T, Harvey, Microsoft, Teams or Outlook integration.
- No backend, authentication, database, document upload or live generation API is required for the hackathon proof.
- Every material instruction and safety correction must resolve to a current `SourceRef`.
- Human approval is content-addressed. Material or source-version changes invalidate approval and compiled outputs.
- Record only actions the prototype observes. Never seed first-use, repeat-use, time-saved, adoption or outcome claims.
- Remove unsupported quantified claims including “45 minutes”, “8 minutes”, “80% time saved”, “zero data leakage” and “reportable breach”.
- The primary journey must be understandable and demonstrable in four minutes, with the learner portion under three minutes.
- Every interactive view must work at 375px width, by keyboard, and with `prefers-reduced-motion` enabled.
- Reproduce the permitted visual reference's strongest product patterns: editorial typography, warm neutral surfaces, restrained coral signals, streaming-style episode framing, numbered learning paths, in-video checkpoint interruption, visible progress, assessment feedback and polished content cards. Translate them into LAWFLO's legal-workflow context rather than copying branding, wording or source assets.
- Runtime code must not contain the reference product's name in filenames, component names, CSS classes, tests, comments, analytics, user-facing copy or commit messages. Use only `lawflo-*` and domain-specific identifiers.
- Each task follows red-green-refactor discipline and ends with `npm test` plus a focused commit.

## Baseline and dependency map

- [x] `main` points to `57b8889` with LAWFLO branding.
- [x] Existing baseline passes 50 tests and `npm run build`.
- [x] Approved compiler, approval fingerprint, evidence graph and persistent event store exist.
- [ ] Journey controller is required before App integration.
- [ ] Episode and rehearsal engines can be built independently after the controller contract is fixed.
- [ ] Activation UI consumes rehearsal completion and the compiler's `activationCard` data.
- [ ] Adaptive reinforcement and change-impact depth begin after the full P0 journey is green.
- [ ] Full browser QA and deployment begin only after the integrated component tests are green.

---

### Task 1: Versioned journey controller

**Files:**
- Create: `src/features/journey/journeyReducer.ts`
- Create: `src/features/journey/journeyReducer.test.ts`
- Create: `src/features/journey/journeyStorage.ts`
- Create: `src/features/journey/journeyStorage.test.ts`

**Interfaces:**
- Consumes: `UseCase.id`, `UseCase.sourceVersion`, and optional `ApprovalRecord.contentFingerprint`.
- Produces:

```ts
export type JourneyStage =
  | "studio"
  | "episode"
  | "rehearsal"
  | "activation"
  | "evidence";

export interface JourneyState {
  stage: JourneyStage;
  completed: JourneyStage[];
  useCaseId: string;
  sourceVersion: string;
  approvalFingerprint?: string;
}

export type JourneyAction =
  | { type: "BUNDLE_COMPILED"; approvalFingerprint: string }
  | { type: "EPISODE_COMPLETED" }
  | { type: "REHEARSAL_COMPLETED" }
  | { type: "ACTIVATION_OPENED" }
  | { type: "GO_TO"; stage: JourneyStage }
  | { type: "RESET" };

export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
): JourneyState;
```

- [ ] **Step 1: Write reducer tests for legal and illegal progression**

```ts
it("cannot open rehearsal before the episode completes", () => {
  const next = journeyReducer(initialJourney, {
    type: "GO_TO",
    stage: "rehearsal",
  });
  expect(next.stage).toBe("studio");
});

it("advances compiled work through every required stage", () => {
  const episode = journeyReducer(initialJourney, {
    type: "BUNDLE_COMPILED",
    approvalFingerprint: "msc-12345678",
  });
  expect(episode.stage).toBe("episode");
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `npm test -- src/features/journey/journeyReducer.test.ts`

Expected: FAIL because `journeyReducer.ts` does not exist.

- [ ] **Step 3: Implement the pure reducer with an explicit stage order**

```ts
const stageOrder: JourneyStage[] = [
  "studio",
  "episode",
  "rehearsal",
  "activation",
  "evidence",
];

function canVisit(state: JourneyState, target: JourneyStage): boolean {
  if (target === "studio") return true;
  const prerequisite = stageOrder[stageOrder.indexOf(target) - 1];
  return state.completed.includes(prerequisite);
}
```

- [ ] **Step 4: Add storage tests for current, stale, malformed and unavailable storage**

```ts
it("rejects progress saved for an older source version", () => {
  storage.setItem(KEY, JSON.stringify({ ...saved, sourceVersion: "0.9" }));
  expect(loadJourney(storage, currentUseCase)).toBeNull();
});
```

- [ ] **Step 5: Implement `loadJourney`, `saveJourney` and `clearJourney`**

Use the storage key `lawflo.journey.v1`. Return `null` rather than throwing when storage is unavailable, malformed or stale. Require matching `useCaseId`, `sourceVersion`, and approval fingerprint when one exists.

- [ ] **Step 6: Run focused and full tests**

Run: `npm test -- src/features/journey && npm test`

Expected: focused tests and all existing tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/journey
git commit -m "feat: add guarded journey state"
```

---

### Task 2: Deterministic episode timeline engine

**Files:**
- Create: `src/features/episode/timeline.ts`
- Create: `src/features/episode/timeline.test.ts`
- Create: `src/features/episode/episodeReducer.ts`
- Create: `src/features/episode/episodeReducer.test.ts`
- Create: `src/features/episode/episodeStorage.ts`
- Create: `src/features/episode/episodeStorage.test.ts`

**Interfaces:**
- Consumes: the approved `UseCase` and its compiler-derived workflow steps.
- Produces:

```ts
export interface EpisodeCue {
  id: string;
  chapter: number;
  title: string;
  durationSeconds: number;
  narration: string;
  caption: string;
  sourceRefIds: string[];
  checkpointId?: string;
}

export interface EpisodeState {
  status: "idle" | "playing" | "paused" | "checkpoint" | "complete";
  cueIndex: number;
  elapsedSeconds: number;
  answeredCheckpointIds: string[];
}

export type EpisodeAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TICK" }
  | { type: "SEEK"; cueIndex: number }
  | { type: "ANSWER"; checkpointId: string; safe: boolean }
  | { type: "REPLAY" };
```

- [ ] **Step 1: Write timeline-generation tests**

Assert that five chapters are produced, every cue has at least one resolvable source, total duration is 60–90 seconds, and no narration contains unsupported quantified claims.

- [ ] **Step 2: Run the timeline tests and verify they fail**

Run: `npm test -- src/features/episode/timeline.test.ts`

Expected: FAIL because `createEpisodeTimeline` is missing.

- [ ] **Step 3: Implement `createEpisodeTimeline(useCase)`**

Generate one old-way cue, one peer-discovery cue, workflow cues derived from `useCase.steps`, one confidentiality checkpoint and one verification/human-review payoff. Use the canonical source IDs and fictional contributor. Do not hard-code R&T endorsement or performance figures.

- [ ] **Step 4: Write reducer tests for playback and checkpoint enforcement**

```ts
it("refuses to seek beyond an unanswered checkpoint", () => {
  const next = episodeReducer(atCheckpointBoundary, {
    type: "SEEK",
    cueIndex: finalCueIndex,
  });
  expect(next.status).toBe("checkpoint");
  expect(next.cueIndex).toBe(checkpointCueIndex);
});
```

Cover play, pause, tick, wrong answer, safe answer, replay and completion.

- [ ] **Step 5: Implement `episodeReducer` without React state mutation**

The reducer must clamp seeks to the first unanswered checkpoint. A wrong answer retains `checkpoint` status. A safe answer records the checkpoint ID and permits continuation.

- [ ] **Step 6: Add versioned resume tests and storage implementation**

Use `lawflo.episode.<useCase.id>.<sourceVersion>.v1`. Store only cue index, elapsed time and answered checkpoint IDs. Reject data for a different workflow or source version.

- [ ] **Step 7: Run focused and full tests, then commit**

Run: `npm test -- src/features/episode && npm test`

```bash
git add src/features/episode
git commit -m "feat: add governed episode timeline"
```

---

### Task 3: Cinematic episode player and transcript rail

**Files:**
- Create: `src/features/episode/EpisodePlayer.tsx`
- Create: `src/features/episode/EpisodePlayer.test.tsx`
- Create: `src/features/episode/EpisodePlayer.css`
- Create: `src/features/episode/components/CheckpointPanel.tsx`
- Create: `src/features/episode/components/EpisodeControls.tsx`
- Create: `src/features/episode/components/TranscriptRail.tsx`
- Create: `src/features/episode/index.ts`

**Interfaces:**
- Consumes: `EpisodePlayerProps` from `src/domain/integration.ts`, the Task 2 timeline, reducer and storage.
- Produces: `<EpisodePlayer useCase onEvent onComplete />`.

- [ ] **Step 1: Write component tests before importing legacy episode code**

Test title entry, `episode_started` exactly once, pause/replay, captions, blocked seek, unsafe feedback, safe continuation, source expansion, transcript search, resume/restart and completion callback.

```tsx
it("emits episode_started once across pause and replay", () => {
  render(<EpisodePlayer {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /start episode/i }));
  fireEvent.click(screen.getByRole("button", { name: /pause/i }));
  fireEvent.click(screen.getByRole("button", { name: /play/i }));
  expect(onEvent).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run component tests and verify they fail**

Run: `npm test -- src/features/episode/EpisodePlayer.test.tsx`

Expected: FAIL because the component is missing.

- [ ] **Step 3: Selectively reuse Su-Ann's visual concepts**

Use commit `363b9a9` and the permitted external product only as interaction and visual references. Do not cherry-pick the contaminated commit or copy third-party source/assets. Recreate episode-owned components against the new reducer and shared callback. Keep all CSS inside `src/features/episode/` and name selectors for LAWFLO concepts only.

- [ ] **Step 4: Implement the player as a reducer-driven motion comic**

Use one interval owned by the player to dispatch `TICK`; all state changes go through `episodeReducer`. Default captions on. Provide visible play/pause, replay, chapter state, elapsed time and reduced-motion behavior. No live media API may be required.

The visual shell includes a streaming-style `S1:E1` label, large cinematic stage, “Now playing” state, chapter rail, structured progress, strong captions, warm off-white supporting panels, near-black typography, restrained coral actions and high-quality content cards. The checkpoint interrupts the episode stage rather than appearing as a detached generic form.

- [ ] **Step 5: Implement checkpoint and source inspection**

Unsafe options remain blocked and show the exact policy excerpt. The safe option emits `checkpoint_answered` once for the submitted action. The Continue control remains disabled until a safe answer is recorded.

- [ ] **Step 6: Implement searchable transcript/source rail**

Generate transcript rows from `EpisodeCue[]`; filtering must match narration, captions, chapter titles and source titles. Opening a source emits `source_opened` only on the actual click.

- [ ] **Step 7: Add resume/restart and completion behavior**

When matching saved state exists, show explicit Resume and Restart buttons. Completion calls `onComplete()` and clears episode storage only after the user chooses “Practise this workflow”.

- [ ] **Step 8: Run tests and commit**

Run: `npm test -- src/features/episode && npm test && npm run build`

```bash
git add src/features/episode
git commit -m "feat: add cinematic workflow episode"
```

---

### Task 4: Guarded rehearsal and explainable assessment engine

**Files:**
- Create: `src/features/learner-flow/scenario.ts`
- Create: `src/features/learner-flow/scenario.test.ts`
- Create: `src/features/learner-flow/rehearsalReducer.ts`
- Create: `src/features/learner-flow/rehearsalReducer.test.ts`
- Create: `src/features/learner-flow/assessment.ts`
- Create: `src/features/learner-flow/assessment.test.ts`
- Create: `src/features/learner-flow/rehearsalStorage.ts`
- Create: `src/features/learner-flow/rehearsalStorage.test.ts`

**Interfaces:**
- Consumes: `UseCase.steps`, `UseCase.guardrails`, `UseCase.sources`.
- Produces:

```ts
export type RehearsalStage =
  | "ready"
  | "meeting_summary"
  | "choose_ai_tool"
  | "unsafe_attempt_blocked"
  | "source_explanation"
  | "retry"
  | "approved"
  | "human_review"
  | "rehearsal_passed";

export interface DecisionTraceEntry {
  choiceId: string;
  safe: boolean;
  sourceRefIds: string[];
  dimensions: Array<
    "authorised_tool" | "minimisation" | "bounded_prompt" | "source_check" | "human_review"
  >;
}

export function rehearsalReducer(
  state: RehearsalState,
  action: RehearsalAction,
): RehearsalState;

export function assessTrace(trace: DecisionTraceEntry[]): AssessmentResult;
```

- [ ] **Step 1: Write scenario tests**

Assert that every choice has a consequence, source reference, blocked flag, safe repair and scored dimensions. Assert that all source IDs exist in the supplied `UseCase`.

- [ ] **Step 2: Write generated transition tests**

```ts
it.each(allActionSequences)(
  "never passes without source checking and human review",
  (actions) => {
    const state = actions.reduce(rehearsalReducer, initialState);
    if (state.stage === "rehearsal_passed") {
      expect(state.sourceChecked).toBe(true);
      expect(state.humanReviewed).toBe(true);
    }
  },
);
```

- [ ] **Step 3: Run tests and verify failure**

Run: `npm test -- src/features/learner-flow`

Expected: FAIL because the engine files are missing.

- [ ] **Step 4: Implement scenario data and guarded reducer**

The unsafe public-chatbot action transitions only to `unsafe_attempt_blocked`. The safe retry requires an authorised tool and minimum-necessary bounded prompt. `REVIEW_SOURCES` and `CONFIRM_HUMAN_REVIEW` must both occur before `COMPLETE` can reach `rehearsal_passed`.

- [ ] **Step 5: Implement explainable scoring**

Return one boolean result and explanation per dimension instead of a magic percentage. Overall pass requires every dimension to pass.

- [ ] **Step 6: Implement versioned session storage**

Use `lawflo.rehearsal.<useCase.id>.<sourceVersion>.v1`. Persist stage, trace and completion flags. Reject malformed and stale sessions without throwing.

- [ ] **Step 7: Run tests and commit**

Run: `npm test -- src/features/learner-flow && npm test`

```bash
git add src/features/learner-flow
git commit -m "feat: add auditable rehearsal engine"
```

---

### Task 5: Learner simulation and activation card UI

**Files:**
- Create: `src/features/learner-flow/LearnerFlow.tsx`
- Create: `src/features/learner-flow/LearnerFlow.test.tsx`
- Create: `src/features/learner-flow/ActivationCard.tsx`
- Create: `src/features/learner-flow/ActivationCard.test.tsx`
- Create: `src/features/learner-flow/LearnerFlow.css`
- Create: `src/features/learner-flow/index.ts`

**Interfaces:**
- Consumes: `LearnerFlowProps` and `ActivationCardProps` from `src/domain/integration.ts`, plus Task 4 engine functions.
- Produces: `<LearnerFlow useCase onEvent onComplete />` and `<ActivationCard useCase onEvent />`.

- [ ] **Step 1: Write learner-flow component tests**

Test the unsafe action, policy explanation, safe retry, source verification, human review, completion event deduplication, resume/restart and reset.

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test -- src/features/learner-flow/LearnerFlow.test.tsx`

Expected: FAIL because `LearnerFlow.tsx` does not exist.

- [ ] **Step 3: Implement one-action-per-screen learner views**

Every screen renders from reducer state. The unsafe choice must be educational, not punitive. Back and Restart appear only where they cannot bypass a required check.

- [ ] **Step 4: Render the decision trace and source-linked assessment**

At completion, map each observed choice to its exact policy excerpt. Emit `rehearsal_passed` once only after the reducer reaches `rehearsal_passed`.

- [ ] **Step 5: Write activation-card tests**

Test work trigger, approved tool sequence, source-linked steps, copyable bounded-prompt template, four safety checks and `activation_opened` exactly once when the card genuinely opens.

- [ ] **Step 6: Implement the activation card**

Use compiler-derived workflow data. Label Teams, Outlook and other interfaces as simulated. Clipboard failure must retain visible selectable text and show a non-blocking status message.

- [ ] **Step 7: Run tests and commit**

Run: `npm test -- src/features/learner-flow && npm test && npm run build`

```bash
git add src/features/learner-flow
git commit -m "feat: add safe rehearsal and activation UI"
```

---

### Task 6: Integrate the complete journey in App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/domain/integration.ts`
- Modify: `src/domain/integration.test.ts`
- Modify: `src/features/events/eventStore.ts`
- Modify: `src/features/events/persistentEventStore.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: Tasks 1, 3 and 5; `compileApprovedUseCase`; `createScopedEventReporter`; `EvidenceInspector`.
- Produces: one start-to-finish LAWFLO application with truthful, source-version-bound events.

- [ ] **Step 1: Replace placeholder tests with a golden component journey**

```tsx
it("completes compile, episode, rehearsal, activation and evidence", async () => {
  render(<App />);
  await prepareApproveAndCompile();
  expect(screen.getByTestId("episode-player")).toBeVisible();
  await completeEpisode();
  await completeSafeRehearsal();
  expect(screen.getByRole("heading", { name: /point-of-work/i })).toBeVisible();
});
```

Also add an unsafe journey test and a reset-after-progress test.

- [ ] **Step 2: Run App tests and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL while placeholders remain.

- [ ] **Step 3: Mount real components and the journey reducer**

After compilation, pass the exact approved `bundle.useCase` to every feature. Completion callbacks dispatch journey actions. Stage navigation may revisit completed stages but cannot skip prerequisites.

- [ ] **Step 4: Scope all observed events**

Use `createScopedEventReporter(bundle.useCase, recordEvent)`. Refresh the ledger after each reported action. Preserve source version and approval fingerprint in every event.

- [ ] **Step 5: Make reset comprehensive**

`Reset demo` clears the event store, journey storage, episode storage and rehearsal storage, restores the canonical draft and returns focus to the Studio heading.

- [ ] **Step 6: Keep evidence visible but subordinate**

Reveal `EvidenceInspector` after compilation through a “How this is governed” control and automatically at journey completion. The primary learner journey remains the visual focus.

- [ ] **Step 7: Run integration and full verification**

Run: `npm test -- src/App.test.tsx && npm test && npm run build`

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/domain src/features/events src/styles.css
git commit -m "feat: integrate the complete LAWFLO journey"
```

---

### Task 7: Adaptive reinforcement and platform depth

**Files:**
- Create: `src/features/adaptation/adaptationEngine.ts`
- Create: `src/features/adaptation/adaptationEngine.test.ts`
- Create: `src/features/adaptation/AdaptationSummary.tsx`
- Create: `src/features/change-impact/changeImpact.ts`
- Create: `src/features/change-impact/changeImpact.test.ts`
- Create: `src/features/change-impact/ChangeImpactPanel.tsx`
- Modify: `src/features/learner-flow/scenario.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: approved bundle, actual checkpoint events, rehearsal decision trace, sources and approval fingerprint.
- Produces:

```ts
export interface ReinforcementRecommendation {
  focus: "confidentiality" | "tool_choice" | "verification" | "human_review";
  reason: string;
  sourceRefIds: string[];
  scenarioVariantId: string;
}

export function deriveReinforcement(
  checkpointEvents: MatterShiftEvent[],
  trace: DecisionTraceEntry[],
): ReinforcementRecommendation;

export interface ChangeImpactResult {
  approvalStillCurrent: boolean;
  affectedWorkflowStepIds: string[];
  affectedArtifactIds: string[];
  reasons: string[];
}

export function assessChangeImpact(
  previousUseCase: UseCase,
  changedUseCase: UseCase,
  previousBundle: CompiledMatterShiftBundle,
): ChangeImpactResult;
```

- [ ] **Step 1: Write adaptation tests from observed decisions**

Assert that an unsafe confidentiality answer produces a confidentiality-focused scenario, while a clean safe path produces a verification-focused variation. Every recommendation must cite sources and must not infer behavior the prototype did not observe.

- [ ] **Step 2: Implement deterministic reinforcement selection**

Use explicit priority rules over actual checkpoint events and rehearsal trace. Do not call a model. Render why the scenario changed and which observed action caused the decision.

- [ ] **Step 3: Add two scenario variations from the same approved bundle**

Create a post-meeting follow-up variation and a bounded legal-research variation. Both use the same reducer and canonical source set; only trigger, choice wording and relevant workflow steps differ.

- [ ] **Step 4: Write change-impact tests**

Clone the canonical use case in tests, change one source version or material instruction, and assert that approval becomes stale and every derived artifact containing the affected statement is listed for regeneration.

- [ ] **Step 5: Implement and render change impact**

Show previous version, changed version, affected steps, affected episode/rehearsal/activation artifacts and required reapproval. Label the view as a deterministic simulation of a production control plane.

- [ ] **Step 6: Integrate depth without lengthening the primary demo**

Apply reinforcement automatically inside rehearsal and place change impact behind “Show policy-change resilience”. The four-minute path remains direct, while judges can inspect the deeper mechanisms during Q&A.

- [ ] **Step 7: Run tests and commit**

Run: `npm test -- src/features/adaptation src/features/change-impact src/App.test.tsx && npm test && npm run build`

```bash
git add src/features/adaptation src/features/change-impact src/features/learner-flow/scenario.ts src/App.tsx src/App.test.tsx
git commit -m "feat: add adaptive reinforcement and change impact"
```

---

### Task 8: Mobile, accessibility and failure-path polish

**Files:**
- Modify: `src/styles.css`
- Modify: `src/features/episode/EpisodePlayer.css`
- Modify: `src/features/learner-flow/LearnerFlow.css`
- Modify: relevant component tests beside each feature

**Interfaces:**
- Consumes: the integrated application from Task 6.
- Produces: a resilient experience at phone, tablet and desktop widths.

- [ ] **Step 1: Add accessibility regression tests**

Assert named controls, heading order, dialog labeling, visible focus, caption defaults, `aria-live` status messaging and focus transfer after stage completion.

- [ ] **Step 2: Add reduced-motion and missing-capability tests**

Mock unavailable `localStorage`, clipboard and speech/media APIs. The journey must still complete without uncaught errors or blank screens.

- [ ] **Step 3: Implement responsive layouts**

At 375px: use one content column, minimum 44px controls, no horizontal scrolling, readable captions and a collapsible transcript/evidence rail. At 768px and above: restore two-column workspace where useful.

- [ ] **Step 4: Implement reduced motion**

Under `prefers-reduced-motion: reduce`, remove parallax, long transforms and auto-animated transitions while preserving state changes and captions.

- [ ] **Step 5: Run automated checks**

Run: `npm test && npm run build`

- [ ] **Step 6: Run gstack browser QA**

Test the golden path, unsafe path, refresh/resume and reset at 375x812, 768x1024 and 1440x900. Capture console and failed-network evidence. Record every failure before editing.

- [ ] **Step 7: Fix blocker and major findings, then rerun the same checks**

Stop visual expansion after the first clean regression pass. Do not add decorative features during this task.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "fix: harden LAWFLO demo experience"
```

---

### Task 9: Browser automation, deployment and completion gate

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`
- Create: `e2e/lawflo.spec.ts`
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy-pages.yml`
- Create: `docs/DEPLOYMENT-CHECKLIST.md`

**Interfaces:**
- Consumes: Task 8's green build.
- Produces: repeatable browser tests and a public signed-out GitHub Pages deployment.

- [ ] **Step 1: Add Playwright and browser-test scripts**

Run: `npm install --save-dev @playwright/test`

Add:

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Write the failing golden-path and unsafe-path tests**

`e2e/lawflo.spec.ts` must cover compilation, episode start, blocked unsafe choice, successful retry, activation, evidence, reset and a 375px viewport.

- [ ] **Step 3: Run Playwright and fix only genuine integration failures**

Run: `npx playwright install chromium && npm run test:e2e`

Expected: all tests PASS with no uncaught page errors.

- [ ] **Step 4: Configure GitHub Pages paths and workflow**

Set Vite's production base to `/smu-lit/` when `GITHUB_ACTIONS` is true. The workflow must install with `npm ci`, run `npm test`, run `npm run build`, upload `dist`, and deploy only from `main`.

- [ ] **Step 5: Verify the production artefact locally**

Run: `npm test && npm run build && npm run preview`

Open the preview in a clean browser session. Confirm there are no missing assets and the four-minute journey completes.

- [ ] **Step 6: Merge through a pull request and verify deployment**

Push the completion branch, open a PR into `main`, confirm every check, merge with squash, and open the published URL signed out.

- [ ] **Step 7: Record the final completion gate**

`docs/DEPLOYMENT-CHECKLIST.md` must record:

- exact deployed URL and commit;
- tests run and results;
- phone and desktop viewports tested;
- golden and unsafe paths tested;
- observed-event integrity check;
- remaining known risks;
- fallback reset instructions.

- [ ] **Step 8: Final stop condition**

Declare the product ready only when a cold tester can compile, watch, make the unsafe choice, recover, complete rehearsal, open activation and inspect evidence without verbal repair, and the same journey works signed out on the deployed URL.

---

## Priority and cut order

### P0: Cannot cut

- Current-source human approval and deterministic compilation.
- One source-linked cinematic episode.
- One blocked confidentiality choice with a safe retry.
- Source verification and human review before rehearsal completion.
- Point-of-work activation card.
- Truthful event ledger and evidence view.
- Reset, mobile layout and a public signed-out deployment.

### P1: Build after P0; do not pre-emptively cut

- Searchable transcript rail.
- Resume across browser restarts.
- Playback-speed controls.
- Full generated-action-sequence test matrix.
- Deterministic reinforcement based on observed checkpoint and rehearsal behavior.
- Two rehearsal variations generated from the same approved bundle.
- Policy-change impact and reapproval demonstration.
- A polished catalogue/content-card shell that makes the platform feel broader than one demo workflow without fabricating completed content.
- Automated browser tests, provided the complete manual regression is recorded.

Cut P1 only at the 90-minute pre-submission freeze if a P0 blocker remains. Until that freeze, complete P1 systematically instead of stopping at a visual shell.

### P2: Do not start before P0 is green

- Additional use cases or practice-group variants.
- Avatars, badges, leaderboards or gamification.
- Live AI generation, uploads, authentication or enterprise integrations.
- Quantified adoption or time-saving dashboards.
- Elaborate video production or new 3D assets.

## Completion checklist

- [ ] One approved `UseCase` generates the episode, rehearsal and activation card.
- [ ] Every material instruction opens at least one exact source excerpt.
- [ ] Source-version or material changes invalidate approval and prior progress.
- [ ] No seek, back, refresh or replay path bypasses the confidentiality checkpoint.
- [ ] No action sequence reaches `rehearsal_passed` without source verification and human review.
- [ ] Prototype events are emitted once and bound to source version plus approval fingerprint.
- [ ] No fabricated adoption, outcome or time-saved claim appears.
- [ ] The entire path works at 375px and with reduced motion.
- [ ] `npm test`, `npm run build` and the browser regression pass.
- [ ] The deployed URL opens and works while signed out.
