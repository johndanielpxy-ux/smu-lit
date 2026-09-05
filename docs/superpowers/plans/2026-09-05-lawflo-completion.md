# LAWFLO Legal AI Learning Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public desktop website that compiles one approved legal AI contract-review workflow into a cinematic episode, progressively guided contract rehearsal, constructive learning review, optional solo replay and personalised workflow guide.

**Architecture:** Extend the existing `UseCase`, module-level approval fingerprint, deterministic compiler, scoped event store and evidence graph. One canonical synthetic contract-review bundle drives every surface. Pure reducers and evaluators own progression, routing and coaching; React renders those decisions and records only actions the browser genuinely observes.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest 5, Testing Library, browser `localStorage`, CSS, Playwright, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-05-lawflo-desktop-learning-design.md`

## Global Constraints

- The complete learner workflow targets desktop and laptop browsers at 1280-1440px and remains usable at 1024px. A narrow viewport explains that rehearsal requires a larger screen.
- John and Codex are the only repository writers. Teammate research, copy and QA arrive as reviewed inputs rather than code.
- The canonical module is **AI-Assisted Contract Review: Route a Sales Renewal**.
- A legal AI workflow must contain an AI-produced legal finding, human verification, source-linked playbook controls and a human escalation path. Rules-based routing alone does not qualify.
- The prototype uses precomputed AI extraction and semantic comparison bound to one synthetic contract version. It never claims live or arbitrary contract analysis.
- Every person, company, policy, contract and decision is synthetic. No firm, vendor or commercial application endorses the prototype.
- No uploaded file, portrait, contract text or learner action leaves the browser.
- Material changes to the workflow, sources, contract scenario or precomputed AI analysis invalidate approval, generated artefacts and saved learner progress.
- Every workflow instruction, AI correction, routing rule and coaching repair resolves to a current `SourceRef`.
- The learner receives constructive states: `completed_independently`, `completed_with_guidance` or `revisit_step`. The product never issues a fitness decision, certification score or permanent failure.
- Safety-critical omissions trigger focused repair before rehearsal completion. Optional solo replay never gates the workflow guide.
- Runtime source, filenames, component names, selectors, tests, comments, analytics, copy and commits do not name the permitted visual reference product.
- Use editorial typography, warm neutral surfaces, restrained coral actions, cinematic episode framing, visible path progress, embedded checkpoints and polished learning cards.
- Record only observed actions. Do not seed adoption, efficiency, time-saved, learner-outcome or production-usage metrics.
- The deployed static build completes without API credentials or runtime model calls.
- Every task follows red-green-refactor discipline and ends with focused tests, the full test suite and a focused commit.

## Dependency Map

```text
Task 1  Domain + canonical contract fixture
  |
  +----> Task 2  Demo-pack intake
  |
  +----> Task 3  Governed compiler + route evaluator
                   |
                   +----> Task 4  Journey controller
                   |
                   +----> Task 5  Episode engine + player
                   |
                   +----> Task 6  Rehearsal state machine
                                  |
                                  +----> Task 7  Desktop matter workspace
                                  |
                                  +----> Task 8  Coaching review + guide
                                                    |
                                                    +----> Task 9  Solo replay

Tasks 2, 4, 5, 7, 8, 9
              |
              v
Task 10  App integration + evidence graph
              |
              v
Task 11  Visual, accessibility and resilience pass
              |
              v
Task 12  Browser automation + GitHub Pages deployment
```

## File Responsibility Map

| Area | Files | Responsibility |
|---|---|---|
| Domain | `src/domain/mattershift.ts`, `src/domain/integration.ts` | Shared legal AI, routing, event and component contracts |
| Canonical demo | `src/demo/demoUseCase.ts`, `src/demo/contractScenarios.ts`, `src/demo/assets/*` | One approved scenario set containing the guided contract and solo variation |
| Intake | `src/features/studio/demoPack.ts`, `DemoPackInput.tsx` | Local file validation, demo-pack fallback and contributor portrait preview |
| Compiler | `src/features/compiler/bundleCompiler.ts`, `routeEngine.ts` | Derive artefacts, evaluate verified facts and preserve provenance |
| Journey | `src/features/journey/*` | Legal stage progression and version-bound resume |
| Episode | `src/features/episode/*` | Timeline, checkpoints, transcript and cinematic player |
| Rehearsal | `src/features/rehearsal/*` | Matter state machine, desktop workspace and observed action trace |
| Coaching | `src/features/coaching/*` | Progressive support, focused repair and constructive learning review |
| Guide | `src/features/guide/*` | Personalised point-of-work card and optional solo replay entry |
| Evidence | `src/features/events/*`, `src/features/evidence/*` | Truthful event storage and source-to-action graph |
| Shell | `src/App.tsx`, `src/styles.css` | Orchestrate the complete public experience |
| Delivery | `e2e/*`, `.github/workflows/deploy-pages.yml` | Browser regression and signed-out static deployment |

---

### Task 1: Legal AI domain contract and canonical sales-renewal fixture

**Files:**
- Modify: `src/domain/mattershift.ts`
- Modify: `src/domain/mattershift.test.ts`
- Modify: `src/domain/integration.ts`
- Modify: `src/domain/integration.test.ts`
- Replace: `src/demo/demoUseCase.ts`
- Modify: `src/demo/demoUseCase.test.ts`
- Create: `src/demo/contractScenarios.ts`
- Create: `src/demo/contractScenarios.test.ts`

**Interfaces:**
- Produces `LegalAiOperation`, `PlaybookRule`, `TrainingScenarioRef`, `TrainingModuleContent`, `ContractScenario`, `AiFinding`, `ContractClause`, `EventScope` and the updated `UseCase`.
- Extends the existing approval contract so it authorizes one exact training module, not merely the workflow shell.

- [ ] **Step 1: Write failing validation tests for a genuine legal AI workflow**

```ts
it("rejects rules-only automation without a legal AI operation", () => {
  const candidate = { ...demoUseCase, aiOperations: [] };
  expect(validateUseCase(candidate).errors).toContain(
    "At least one legal AI operation is required.",
  );
});

it("rejects an AI operation without human verification", () => {
  const candidate = structuredClone(demoUseCase);
  candidate.aiOperations[0].verificationInstruction = "";
  expect(validateUseCase(candidate).valid).toBe(false);
});
```

- [ ] **Step 2: Add the legal AI and playbook types**

```ts
export type LegalAiTask = "extract" | "compare" | "classify";
export type Route = "business_approval" | "signature" | "legal_review";

export interface LegalAiOperation {
  id: string;
  task: LegalAiTask;
  tool: string;
  description: string;
  verificationInstruction: string;
  sourceRefIds: string[];
}

export interface PlaybookFacts {
  contractValue: number;
  templateVersion: string;
  materialRedline: boolean;
  personalData: boolean;
  governingLaw: string;
}

interface PlaybookRuleBase {
  id: string;
  label: string;
  route: Route;
  priority: number;
  explanation: string;
  sourceRefIds: string[];
}

export type EqualityPlaybookRule = {
  [K in keyof PlaybookFacts]: PlaybookRuleBase & {
    field: K;
    operator: "eq" | "neq";
    value: PlaybookFacts[K];
  };
}[keyof PlaybookFacts];

export type PlaybookRule =
  | EqualityPlaybookRule
  | (PlaybookRuleBase & {
      field: "contractValue";
      operator: "lt";
      value: number;
    })
  | (PlaybookRuleBase & {
      field: keyof PlaybookFacts;
      operator: "present";
      value?: never;
    });

export interface TrainingScenarioRef {
  scenarioId: string;
  scenarioVersion: string;
  contentFingerprint: string;
}
```

Add `aiOperations: LegalAiOperation[]`, `playbookRules: PlaybookRule[]` and `scenarioRefs: TrainingScenarioRef[]` to `UseCase`. Extend validation to require exactly one `guided` and at most one `solo_replay` scenario reference, unique IDs, resolvable sources, at least one AI operation, a non-empty verification instruction for each operation and at least one `legal_review` rule. Add compile-time `@ts-expect-error` tests for invalid operator/value pairs so the rule language cannot regress to loosely typed combinations.

- [ ] **Step 3: Define the contract scenario types and fixture**

```ts
export interface ContractClause {
  id: string;
  heading: string;
  standardText: string;
  submittedText: string;
  materiallyChanged: boolean;
  sourceRefIds: string[];
}

export interface AiFinding {
  id: string;
  label: string;
  field: PlaybookRule["field"];
  proposedValue: string | number | boolean;
  verifiedValue: string | number | boolean;
  sourceClauseId: string;
  material: boolean;
}

export interface ContractScenario {
  id: string;
  mode: "guided" | "solo_replay";
  useCaseId: string;
  contractVersion: string;
  contractName: string;
  counterparty: string;
  clauses: ContractClause[];
  aiFindings: AiFinding[];
  expectedRoute: Route;
}

export interface TrainingModuleContent {
  guidedScenario: ContractScenario;
  soloReplayScenario?: ContractScenario;
}
```

Use a synthetic SGD 42,000 guided renewal. Its precomputed AI analysis correctly extracts the value but incorrectly reports `materialRedline: false`. The submitted liability clause differs materially from the approved template, so the expected route is `legal_review`. Add a deterministic SGD 36,000 solo-replay renewal whose data-processing clause changes and whose expected route is also `legal_review`.

Implement `trainingScenarioFingerprint(scenario)` over scenario content, including every clause and precomputed AI finding. Populate `UseCase.scenarioRefs` for every scenario in `TrainingModuleContent` before approval, and extend `useCaseMaterialFingerprint` so the ordered scenario references participate in the approval fingerprint. This is a deterministic integrity fingerprint for prototype version binding, not a cryptographic signature.

- [ ] **Step 4: Replace the meeting fixture with the sales-renewal workflow**

Create AI operations for term extraction, semantic clause comparison and risk classification. Create playbook rules requiring legal review for a material liability redline, ambiguous facts or an unverified material AI finding. Make low value relevant only when the approved template is unchanged.

- [ ] **Step 5: Expand the event vocabulary**

Replace `rehearsal_passed` and `activation_opened` with constructive event names and add the observed legal AI actions:

```ts
export type MatterShiftEventType =
  | "demo_pack_loaded"
  | "human_approved"
  | "use_case_compiled"
  | "module_published"
  | "source_opened"
  | "episode_started"
  | "checkpoint_answered"
  | "rehearsal_started"
  | "ai_analysis_opened"
  | "ai_finding_resolved"
  | "playbook_rule_opened"
  | "route_selected"
  | "repair_completed"
  | "rehearsal_completed"
  | "workflow_guide_opened"
  | "solo_replay_started";

export interface EventScope {
  useCaseId: string;
  sourceVersion: string;
  contractVersion?: string;
  approvalFingerprint?: string;
  bundleId?: string;
}

export interface ReportEventOptions {
  idempotencyKey?: string;
}

export type MatterShiftEventReporter = (
  eventType: MatterShiftEventType,
  metadata?: MatterShiftEventMetadata,
  options?: ReportEventOptions,
) => void;
```

Change `createScopedEventReporter` to accept an `EventScope` rather than a
partial `UseCase`. It merges that scope into every event so the compiler and
learner surfaces share one event contract without importing feature-layer
bundle types into the domain. Forward `ReportEventOptions` to the event store's
existing `RecordEventOptions`; test that an identical completion key returns the
original event while a key reused for different metadata throws a collision.

- [ ] **Step 6: Run the domain and fixture tests**

Run: `npm test -- src/domain src/demo`

Expected: all domain and fixture tests pass; the fixture exposes one deliberately inaccurate material AI finding and resolves every source ID.

- [ ] **Step 7: Run the full suite and commit**

Run: `npm test && npm run build`

```bash
git add src/domain src/demo
git commit -m "feat: define legal AI contract review domain"
```

---

### Task 2: Local demo-pack intake and synthetic authoring assets

**Files:**
- Create: `src/demo/assets/contract-review-workflow.md`
- Create: `src/demo/assets/contract-review-playbook.md`
- Create: `src/demo/assets/standard-sales-renewal.md`
- Create: `src/demo/assets/submitted-sales-renewal.md`
- Create: `src/demo/assets/maya-tan.png`
- Create: `src/features/studio/demoPack.ts`
- Create: `src/features/studio/demoPack.test.ts`
- Create: `src/features/studio/DemoPackInput.tsx`
- Create: `src/features/studio/DemoPackInput.test.tsx`
- Create: `src/features/studio/studio.css`

**Interfaces:**
- Consumes the Task 1 fixture.
- Produces `DemoPack`, `DemoPackStatus`, `loadSyntheticDemoPack()` and `<DemoPackInput onReady onEvent />`.

- [ ] **Step 1: Add explicit markers to the four text assets**

Each markdown file begins with a version marker. For example:

```md
LAWFLO-DEMO: submitted-sales-renewal-v1
SYNTHETIC TRAINING DOCUMENT — NOT A REAL AGREEMENT
```

The submitted agreement contains the SGD 42,000 value and the changed liability clause encoded in `contractScenarios.ts`. The playbook states that low value is insufficient when any material standard term changes.

- [ ] **Step 2: Write failing pack-validation tests**

```ts
it("accepts the complete bundled synthetic pack", () => {
  expect(validateDemoPack(loadSyntheticDemoPack())).toEqual({
    valid: true,
    errors: [],
  });
});

it("rejects an arbitrary contract instead of silently mapping the fixture", () => {
  const pack = { ...loadSyntheticDemoPack(), contractText: "Other contract" };
  expect(validateDemoPack(pack).errors).toContain(
    "The selected contract is not the versioned LAWFLO demonstration contract.",
  );
});
```

- [ ] **Step 3: Implement local-file loading and validation**

```ts
export type DemoPackKind =
  | "workflow"
  | "playbook"
  | "template"
  | "contract"
  | "portrait";

export interface DemoPack {
  workflowText: string;
  playbookText: string;
  templateText: string;
  contractText: string;
  portraitUrl: string;
  portraitUrlKind: "bundled" | "object_url";
  filenames: Record<DemoPackKind, string>;
}

export interface DemoPackStatus {
  readyKinds: DemoPackKind[];
  missingKinds: DemoPackKind[];
  errors: string[];
}

export async function readDemoTextFile(
  file: File,
  expectedMarker: string,
): Promise<string>;
```

Accept `.md` and `.txt` for text inputs and `image/png`, `image/jpeg` or `image/svg+xml` for the portrait. Limit each file to 2 MB. `readDemoTextFile` throws a named, recoverable error when the marker is absent or `File.text()` fails.

Import the four bundled Markdown fixtures using Vite `?raw` imports and import the synthetic portrait through Vite's asset pipeline. `loadSyntheticDemoPack()` must be synchronous and make no runtime `fetch` call. User-selected text is read with `File.text()` and user-selected portraits use object URLs; only URLs marked `portraitUrlKind: "object_url"` may be revoked.

- [ ] **Step 4: Write the upload-component tests**

Test five labelled inputs, missing-category messaging, accepted file state, rejected arbitrary content, portrait preview cleanup and **Load synthetic demo pack**.

```tsx
it("loads the complete deterministic pack without a file dialog", async () => {
  render(<DemoPackInput onReady={onReady} onEvent={onEvent} />);
  fireEvent.click(screen.getByRole("button", { name: /load synthetic demo pack/i }));
  expect(await screen.findByText(/five inputs ready/i)).toBeVisible();
  expect(onReady).toHaveBeenCalledWith(expect.objectContaining({
    contractText: expect.stringContaining("submitted-sales-renewal-v1"),
  }));
});
```

- [ ] **Step 5: Implement the studio intake UI**

Show the five inputs as polished file cards with filename, local-only label and validation state. Revoke replaced or unmounted user-upload object URLs, never the bundled portrait URL. The primary callback fires only after `validateDemoPack` returns `valid: true`.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/features/studio src/demo && npm test && npm run build`

```bash
git add src/demo/assets src/features/studio
git commit -m "feat: add deterministic legal AI demo intake"
```

---

### Task 3: Governed artefact compiler and explainable route evaluator

**Files:**
- Modify: `src/features/compiler/bundleCompiler.ts`
- Modify: `src/features/compiler/bundleCompiler.test.ts`
- Modify: `src/features/compiler/compiler.ts`
- Modify: `src/features/compiler/compiler.test.ts`
- Create: `src/features/compiler/routeEngine.ts`
- Create: `src/features/compiler/routeEngine.test.ts`

**Interfaces:**
- Consumes `UseCase`, `TrainingModuleContent` and current human approval.
- Produces `prepareDraftFromDemoPack()`, `CompiledLawfloBundle`, `CompiledAiAnalysis`, `CompiledRehearsal`, `CoachingPlan`, `WorkflowGuide` and `evaluateRoute()`.

- [ ] **Step 1: Replace the generic compiler input with validated demo-pack mapping**

Write a failing test that rejects an invalid `DemoPack` and one that maps the
complete marked pack to a fresh draft of the canonical contract `UseCase`.
Implement this exact signature:

```ts
export async function prepareDraftFromDemoPack(pack: DemoPack): Promise<UseCase>;
```

The function calls `validateDemoPack`, clones `demoUseCase`, clears approval and
does not derive content from arbitrary document prose.

Keep `compiler.ts` responsible only for validated pack-to-draft preparation. Keep
`bundleCompiler.ts` responsible only for turning a current, module-level human
approval into immutable learning artefacts. Do not export a generic
`compileUseCase` alias that blurs those stages.

- [ ] **Step 2: Write failing route-evaluator tests**

```ts
it("escalates a low-value renewal with a material liability redline", () => {
  const result = evaluateRoute({
    useCase: approvedUseCase,
    verifiedFacts: {
      contractValue: 42000,
      templateVersion: "2026.2",
      materialRedline: true,
      personalData: false,
      governingLaw: "Singapore",
    },
    unresolvedMaterialFindingIds: [],
  });
  expect(result.route).toBe("legal_review");
  expect(result.matchedRuleIds).toContain("material-redline-review");
});

it("requires verification before returning a low-risk route", () => {
  const result = evaluateRoute({
    useCase: approvedUseCase,
    verifiedFacts: lowRiskFacts,
    unresolvedMaterialFindingIds: ["liability-change"],
  });
  expect(result.route).toBe("legal_review");
  expect(result.reasonCode).toBe("UNVERIFIED_MATERIAL_AI_FINDING");
});
```

- [ ] **Step 3: Implement priority-safe route evaluation**

```ts
export interface RouteDecision {
  route: Route;
  reasonCode:
    | "PLAYBOOK_MATCH"
    | "UNVERIFIED_MATERIAL_AI_FINDING"
    | "AMBIGUOUS_FACTS";
  matchedRuleIds: string[];
  sourceRefIds: string[];
  explanation: string;
}
```

Evaluate verified facts only. Use an exhaustive switch over the discriminated `PlaybookRule` union with a `never` guard. Missing or ambiguous material data returns `legal_review`. When several rules match, the highest-priority legal-review rule wins. Every returned reason includes at least one current source ID. Test `lt`, typed `eq`, typed `neq`, `present`, no-match, missing facts and priority ties.

- [ ] **Step 4: Expand the compiled manifest**

```ts
export interface CompilationManifest {
  schemaVersion: "2.0";
  bundleId: string;
  useCaseId: string;
  sourceVersion: string;
  scenarioRefs: TrainingScenarioRef[];
  approvalFingerprint: string;
  approvedBy: string;
  artifactIds: {
    episode: string;
    aiAnalysis: string;
    rehearsal: string;
    coaching: string;
    workflowGuide: string;
  };
}
```

Replace `CompiledMatterShiftBundle` with `CompiledLawfloBundle`. Before compiling, recompute every `trainingScenarioFingerprint` in `TrainingModuleContent` and reject unless the complete ID, mode, version and fingerprint set exactly matches `UseCase.scenarioRefs`. Because `scenarioRefs` is included in `useCaseMaterialFingerprint`, the human approval and resulting bundle ID authorize the workflow, sources, guided matter, optional solo variation and both precomputed AI analyses together.

Use this final compiler boundary:

```ts
export function compileApprovedTrainingModule(
  approvedUseCase: UseCase,
  moduleContent: TrainingModuleContent,
): CompiledLawfloBundle;
```

Remove the old `compileApprovedUseCase` export after migrating its tests and callers.

- [ ] **Step 5: Compile precomputed AI findings without treating them as verified**

```ts
export interface CompiledAiFinding extends AiFinding {
  status: "unverified";
  aiGenerated: true;
}

export interface CompiledAiAnalysis {
  id: string;
  contractVersion: string;
  findings: CompiledAiFinding[];
  proposedRoute: Route;
  sourceRefIds: string[];
}
```

The generated AI analysis proposes `business_approval` because it misses the liability deviation. The compiler labels the output as precomputed and unverified; it does not silently correct the finding.

- [ ] **Step 6: Define and compile every learner artefact from the same approved bundle**

```ts
export interface CompiledRehearsal {
  id: string;
  scenario: ContractScenario;
  requiredFindingIds: string[];
  requiredClauseIds: string[];
  requiredRuleIds: string[];
}

export type CoachingDimension =
  | "ai_output_verification"
  | "clause_comparison"
  | "playbook_application"
  | "risk_reasoning"
  | "human_responsibility"
  | "audit_completeness";

export interface CoachingPlan {
  id: string;
  safetyCriticalDimensions: CoachingDimension[];
  sourceRefIdsByDimension: Record<CoachingDimension, string[]>;
}

export interface WorkflowGuide {
  id: string;
  title: string;
  workTrigger: string;
  legalAiSteps: WorkflowGuideStep[];
  verificationChecks: string[];
  escalationConditions: string[];
  sourceRefIds: string[];
}

export interface WorkflowGuideStep {
  workflowStepId: string;
  title: string;
  tool: string;
  instruction: string;
  sourceRefIds: string[];
}

export interface CompiledLawfloBundle {
  manifest: CompilationManifest;
  useCase: UseCase;
  moduleContent: TrainingModuleContent;
  episode: CompiledEpisode;
  aiAnalysis: CompiledAiAnalysis;
  rehearsal: CompiledRehearsal;
  coaching: CoachingPlan;
  workflowGuide: WorkflowGuide;
}
```

The rehearsal references the same finding IDs and clause IDs as the AI analysis. The coaching plan references the same playbook rule and sources. The workflow guide uses approved instructions only. Assert that no unresolved source, clause or finding reference reaches the bundle.

- [ ] **Step 7: Verify stale approval and contract-version failures**

Run: `npm test -- src/features/compiler`

Expected: compilation fails for changed scenario content with an unchanged version, a changed contract version, stale approval, mismatched scenario ID, duplicate rule ID, missing source, missing clause or unverified rules-only `UseCase`.

- [ ] **Step 8: Run the full suite and commit**

Run: `npm test && npm run build`

```bash
git add src/features/compiler
git commit -m "feat: compile explainable contract review training"
```

---

### Task 4: Version-bound journey controller

**Files:**
- Create: `src/features/journey/journeyReducer.ts`
- Create: `src/features/journey/journeyReducer.test.ts`
- Create: `src/features/journey/journeyStorage.ts`
- Create: `src/features/journey/journeyStorage.test.ts`

**Interfaces:**
- Consumes `bundleId`, `sourceVersion`, `contractVersion` and `approvalFingerprint`.
- Produces `JourneyState`, `journeyReducer`, `loadJourney`, `saveJourney` and `clearJourney`.

- [ ] **Step 1: Write the legal-transition matrix tests**

```ts
export type JourneyStage =
  | "studio"
  | "catalogue"
  | "episode"
  | "rehearsal"
  | "review"
  | "guide"
  | "solo_replay";

it("cannot open rehearsal before the episode checkpoint is complete", () => {
  const next = journeyReducer(episodeState, {
    type: "GO_TO",
    stage: "rehearsal",
  });
  expect(next.stage).toBe("episode");
});

it("opens solo replay only after review without making it a guide prerequisite", () => {
  const guide = journeyReducer(reviewedState, { type: "OPEN_GUIDE" });
  expect(guide.stage).toBe("guide");
});
```

- [ ] **Step 2: Implement the pure reducer**

Use explicit actions `BUNDLE_PUBLISHED`, `EPISODE_COMPLETED`, `REHEARSAL_COMPLETED`, `REVIEW_OPENED`, `OPEN_GUIDE`, `START_SOLO_REPLAY`, `GO_TO` and `RESET`. Completed stages may be revisited. `solo_replay` is reachable from `review` or `guide` but never appears in the prerequisite chain.

- [ ] **Step 3: Write storage rejection tests**

Reject malformed JSON and state saved for a different bundle, source version, contract version, approval fingerprint or schema version. Return `null` rather than throwing when storage is unavailable.

- [ ] **Step 4: Implement versioned storage**

Use `lawflo.journey.v2`. Save only serialisable navigation state. `clearJourney()` removes exactly that key.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/features/journey && npm test && npm run build`

```bash
git add src/features/journey
git commit -m "feat: add governed learning journey"
```

---

### Task 5: Source-linked episode timeline and cinematic player

**Files:**
- Create: `src/features/episode/timeline.ts`
- Create: `src/features/episode/timeline.test.ts`
- Create: `src/features/episode/episodeReducer.ts`
- Create: `src/features/episode/episodeReducer.test.ts`
- Create: `src/features/episode/episodeStorage.ts`
- Create: `src/features/episode/episodeStorage.test.ts`
- Create: `src/features/episode/EpisodePlayer.tsx`
- Create: `src/features/episode/EpisodePlayer.test.tsx`
- Create: `src/features/episode/episode.css`
- Create: `src/features/episode/index.ts`

**Interfaces:**
- Consumes `CompiledLawfloBundle`.
- Produces `EpisodeCue[]`, `EpisodeState`, `episodeReducer` and `<EpisodePlayer bundle onEvent onComplete />`.

- [ ] **Step 1: Write timeline-generation tests**

Assert six chapters: bottleneck, legal AI extraction, clause comparison, human verification, playbook routing and safe escalation. Every material cue must resolve at least one source ID. The checkpoint must present a SGD 42,000 agreement with a material liability redline.

```ts
it("teaches that low value cannot override a material redline", () => {
  const timeline = createEpisodeTimeline(bundle);
  const checkpoint = timeline.find((cue) => cue.checkpoint);
  expect(checkpoint?.checkpoint?.safeChoiceId).toBe("escalate-material-redline");
  expect(checkpoint?.sourceRefIds).toContain("playbook-material-redline");
});
```

- [ ] **Step 2: Implement timeline creation**

```ts
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
```

Use the same typed timeline for both generated and fallback media. Produce a
source-linked script and custom shot list, render at least one real 15-second
720p cinematic chapter through a server-side Runway adapter, and generate its
exact approved narration through OpenAI TTS. Keep the 90-120 second deterministic
motion-comic timeline as the offline and provider-failure fallback so the demo
does not depend on network generation.

- [ ] **Step 3: Write reducer tests for playback and checkpoint enforcement**

Cover play, pause, tick, seek clamping, wrong answer, safe repair, replay and completion. Seeking cannot bypass an unanswered checkpoint.

```ts
export interface EpisodeState {
  status: "idle" | "playing" | "paused" | "checkpoint" | "complete";
  cueIndex: number;
  elapsedSeconds: number;
  answeredCheckpointIds: string[];
}
```

- [ ] **Step 4: Implement the episode reducer**

The reducer owns all playback state. One component interval dispatches `TICK`; React does not mutate elapsed time independently.

- [ ] **Step 5: Add version-bound episode resume**

Write storage tests for current, malformed, stale-source, stale-contract and
stale-approval data. Implement `loadEpisode`, `saveEpisode` and `clearEpisode`
using `lawflo.episode.<bundleId>.v1`. Persist cue index, elapsed seconds and
answered checkpoint IDs only. Storage failure returns `null` and does not block
playback.

- [ ] **Step 6: Write component tests**

Test the opening title, captions on by default, play/pause, chapter progress, blocked seek, unsafe explanation, safe continuation, transcript search, source opening and `episode_started` deduplication.

- [ ] **Step 7: Implement the cinematic player**

Render the contributor portrait, `S1:E1` framing, contract overlays, semantic-diff visuals, chapter rail and transcript/source drawer. The checkpoint replaces the visual stage while active. Under reduced motion, switch cues without transforms or autoplay animation.

- [ ] **Step 7A: Add the approved-media production path**

Add server-side, provider-neutral routes for module compilation, Runway chapter
rendering, task-status polling and OpenAI voiceover. The studio must show the
script, three-to-five-shot storyboard, cited sources and estimated credit spend
before approval. Store no provider secret in the Vite client. Pre-generate and
cache the real chapter before the live demo; label generated, cached and fallback
media truthfully.

- [ ] **Step 8: Verify and commit**

Run: `npm test -- src/features/episode && npm test && npm run build`

```bash
git add src/features/episode
git commit -m "feat: add legal AI learning episode"
```

---

### Task 6: Contract rehearsal state machine and routing trace

**Files:**
- Create: `src/features/rehearsal/rehearsalReducer.ts`
- Create: `src/features/rehearsal/rehearsalReducer.test.ts`
- Create: `src/features/rehearsal/rehearsalStorage.ts`
- Create: `src/features/rehearsal/rehearsalStorage.test.ts`
- Create: `src/features/rehearsal/rehearsalSelectors.ts`
- Create: `src/features/rehearsal/rehearsalSelectors.test.ts`

**Interfaces:**
- Consumes compiled AI findings, contract clauses, playbook rules and `evaluateRoute`.
- Produces `RehearsalState`, `DecisionTraceEntry`, `rehearsalReducer`, selectors and versioned resume.

- [ ] **Step 1: Define and test the rehearsal state contract**

```ts
export type RehearsalTask =
  | "intake"
  | "run_ai_review"
  | "verify_findings"
  | "compare_clauses"
  | "apply_playbook"
  | "choose_route"
  | "inspect_audit"
  | "complete";

export type LearningState =
  | "completed_independently"
  | "completed_with_guidance"
  | "revisit_step";

export interface DecisionTraceEntry {
  id: string;
  action: string;
  task: RehearsalTask;
  occurredAtSequence: number;
  sourceRefIds: string[];
  safe: boolean;
}

export interface RehearsalState {
  mode: "guided" | "solo";
  task: RehearsalTask;
  findingResolutions: Record<
    string,
    { status: "confirmed" | "corrected"; value: string | number | boolean }
  >;
  openedClauseIds: string[];
  openedRuleIds: string[];
  selectedRoute?: Route;
  routeDecision?: RouteDecision;
  repairTask?: RehearsalTask;
  hintCounts: Partial<Record<RehearsalTask, number>>;
  trace: DecisionTraceEntry[];
  sequence: number;
}
```

- [ ] **Step 2: Write transition and invariant tests**

Generate action sequences and assert:

- route selection remains available after AI review so an unsafe reliance
  attempt can be observed and repaired;
- route submission cannot complete before all material findings are resolved;
- an unopened liability comparison cannot support completion;
- `business_approval` cannot complete when `materialRedline` is verified true;
- `legal_review` completes only after the matched rule is opened;
- an incomplete attempt enters focused repair rather than a terminal failure;
- solo mode and guided mode share the same safety invariants.

- [ ] **Step 3: Implement the reducer**

Use actions `OPEN_INPUT`, `RUN_AI_REVIEW`, `OPEN_FINDING`, `CONFIRM_FINDING`, `CORRECT_FINDING`, `OPEN_CLAUSE`, `OPEN_RULE`, `SELECT_ROUTE`, `SUBMIT_ROUTE`, `USE_HINT`, `COMPLETE_REPAIR`, `OPEN_AUDIT` and `RESET`.

The seeded `materialRedline` finding can complete only through `CORRECT_FINDING`. `SUBMIT_ROUTE` evaluates verified facts through `evaluateRoute`; it never trusts the AI-proposed route directly.

- [ ] **Step 4: Implement selectors**

```ts
export function currentObjective(state: RehearsalState): RehearsalTask;
export function unresolvedMaterialFindings(state: RehearsalState): AiFinding[];
export function canCompleteRoute(state: RehearsalState): boolean;
export function auditEntries(state: RehearsalState): DecisionTraceEntry[];
```

Selectors must not mutate state or synthesize unobserved actions.

- [ ] **Step 5: Implement versioned storage**

Use `lawflo.rehearsal.<bundleId>.v1`. Store finding resolutions, opened clause/rule IDs, route, trace, attempts, hints and current task. Reject a changed contract version or approval fingerprint.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/features/rehearsal && npm test && npm run build`

```bash
git add src/features/rehearsal
git commit -m "feat: add contract review rehearsal engine"
```

---

### Task 7: Desktop simulated matter workspace

**Files:**
- Create: `src/features/rehearsal/MatterWorkspace.tsx`
- Create: `src/features/rehearsal/MatterWorkspace.test.tsx`
- Create: `src/features/rehearsal/components/ContractPane.tsx`
- Create: `src/features/rehearsal/components/AiReviewPanel.tsx`
- Create: `src/features/rehearsal/components/VerificationPanel.tsx`
- Create: `src/features/rehearsal/components/RoutingPanel.tsx`
- Create: `src/features/rehearsal/components/WorkflowRail.tsx`
- Create: `src/features/rehearsal/rehearsal.css`
- Create: `src/features/rehearsal/index.ts`

**Interfaces:**
- Consumes `CompiledLawfloBundle`, Task 6 reducer and a scoped event reporter.
- Produces `<MatterWorkspace bundle mode="guided" onEvent onComplete />`.

- [ ] **Step 1: Write the golden guided-rehearsal component test**

```tsx
it("repairs the AI finding and routes the redlined renewal to legal", async () => {
  render(<MatterWorkspace bundle={bundle} mode="guided" {...callbacks} />);
  await runAiReview();
  await correctFinding("materialRedline", true);
  await openClause("liability");
  await openRule("material-redline-review");
  await chooseRoute("legal_review");
  expect(screen.getByText(/rehearsal complete/i)).toBeVisible();
});
```

- [ ] **Step 2: Write the unsafe and incomplete paths**

Test accepting all AI findings unread, choosing business approval, submitting before rule inspection and refreshing during verification. Each path remains recoverable and links the repair to the exact contract clause or playbook source.

- [ ] **Step 3: Implement the application-like shell**

Use a three-column desktop grid:

```text
+-------------------+-----------------------------+------------------+
| Workflow rail     | Contract / comparison       | AI review        |
| current objective | standard vs submitted text  | findings + route |
| hints             | highlighted material clause | verification     |
+-------------------+-----------------------------+------------------+
| Audit drawer / coaching message / primary action                   |
+--------------------------------------------------------------------+
```

At 1024px the rail becomes a compact top row and the two work panels remain side by side. Under 900px the rehearsal is replaced with a desktop-required message; no controls are silently hidden.

- [ ] **Step 4: Implement real learner actions**

The user opens documents, runs the simulated AI review, expands findings, selects confirm/correct, opens linked clauses and rules, chooses a route and inspects the audit. Do not render the entire journey as Next buttons.

- [ ] **Step 5: Scope observed events**

Emit `ai_analysis_opened`, `ai_finding_resolved`, `playbook_rule_opened`, `route_selected`, `repair_completed` and `rehearsal_completed` only after the corresponding reducer transition succeeds. Attach finding, clause, rule and route IDs in metadata.

- [ ] **Step 6: Implement keyboard and focus behavior**

Use native buttons, tabs only where arrow-key semantics are implemented, visible focus, `aria-live` for coaching updates and focus transfer to the next objective heading. The contract text remains selectable.

- [ ] **Step 7: Verify and commit**

Run: `npm test -- src/features/rehearsal && npm test && npm run build`

```bash
git add src/features/rehearsal
git commit -m "feat: add desktop contract rehearsal workspace"
```

---

### Task 8: Progressive coaching and constructive learning review

**Files:**
- Create: `src/features/coaching/coachingEngine.ts`
- Create: `src/features/coaching/coachingEngine.test.ts`
- Create: `src/features/coaching/LearningReview.tsx`
- Create: `src/features/coaching/LearningReview.test.tsx`
- Create: `src/features/coaching/coaching.css`

**Interfaces:**
- Consumes the rehearsal trace, finding resolutions, hints, attempts and source-linked coaching plan.
- Produces `LearningReviewResult`, `deriveLearningReview()` and `<LearningReview result onRepair onOpenGuide />`.

- [ ] **Step 1: Write coaching-state tests**

```ts
it("marks a first-attempt verified finding as completed independently", () => {
  const result = deriveLearningReview(cleanTrace, coachingPlan);
  expect(result.dimensions.aiOutputVerification.state).toBe(
    "completed_independently",
  );
});

it("returns a source-linked repair for an unopened material clause", () => {
  const result = deriveLearningReview(skippedClauseTrace, coachingPlan);
  expect(result.dimensions.clauseComparison).toMatchObject({
    state: "revisit_step",
    repairTask: "compare_clauses",
    sourceRefIds: ["playbook-material-redline"],
  });
});
```

- [ ] **Step 2: Implement deterministic support selection**

Support levels are `orientation`, `hint`, `worked_example` and `focused_repair`. A successful first attempt earns `completed_independently`. Any hint or repair produces `completed_with_guidance` after correction. An unresolved safety-critical dimension remains `revisit_step`.

- [ ] **Step 3: Implement dimension-level review**

Return these dimensions: AI-output verification, clause comparison, playbook application, risk reasoning, human responsibility and audit completeness. Each contains the observed evidence IDs, source IDs, state, explanation and optional repair task.

```ts
export interface LearningDimensionResult {
  state: LearningState;
  observedEvidenceIds: string[];
  sourceRefIds: string[];
  explanation: string;
  repairTask?: RehearsalTask;
}

export interface LearningReviewResult {
  dimensions: Record<CoachingDimension, LearningDimensionResult>;
  repairTasks: RehearsalTask[];
  rehearsalComplete: boolean;
}
```

- [ ] **Step 4: Write review-component tests**

Assert constructive labels, no percentage, no `pass`, `fail`, `fitness` or `certified` copy, exact source expansion, focused repair action and guide availability once every safety-critical repair is complete.

- [ ] **Step 5: Implement the review UI**

Show a calm review sheet with **What you handled**, **What we repaired** and **Keep beside you**. A repair button returns to exactly one rehearsal task. `Open workflow guide` does not depend on solo replay.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/features/coaching && npm test && npm run build`

```bash
git add src/features/coaching
git commit -m "feat: add constructive legal AI coaching"
```

---

### Task 9: Personalised workflow guide and optional solo replay

**Files:**
- Create: `src/features/guide/WorkflowGuide.tsx`
- Create: `src/features/guide/WorkflowGuide.test.tsx`
- Create: `src/features/guide/guide.css`
- Create: `src/features/rehearsal/soloReplay.ts`
- Create: `src/features/rehearsal/soloReplay.test.ts`
- Modify: `src/features/rehearsal/MatterWorkspace.tsx`
- Modify: `src/features/rehearsal/MatterWorkspace.test.tsx`

**Interfaces:**
- Consumes `WorkflowGuide`, `LearningReviewResult` and Task 6 reducer.
- Produces `<WorkflowGuide bundle review onStartSoloReplay />` and `getApprovedSoloReplayScenario()`.

- [ ] **Step 1: Write the guide tests**

Assert the trigger, legal AI sequence, contract-intake checks, AI verification checks, playbook escalation conditions, current versions and source excerpts. `workflow_guide_opened` fires once when the guide genuinely opens.

- [ ] **Step 2: Implement personalised reinforcement**

Order the guide's **Watch carefully** section from the dimensions completed with guidance. Do not claim weakness when the corresponding behavior was not observed. Keep every recommendation linked to the same approved source set.

- [ ] **Step 3: Write solo-replay selection tests**

Select the pre-approved SGD 36,000 renewal whose data-processing clause changes. The replay uses the same workflow, reducer and playbook, hides hints and expects `legal_review`. It must not mutate the canonical guided scenario and must reject a replay scenario whose current fingerprint differs from the one in the bundle approval.

- [ ] **Step 4: Implement optional solo replay**

`getApprovedSoloReplayScenario(bundle)` verifies and clones `bundle.moduleContent.soloReplayScenario`; it never invents or mutates training content after publication. `MatterWorkspace` accepts `mode: "guided" | "solo"`; solo mode suppresses coaching interruptions except quarantine of simulated external disclosure or sending.

- [ ] **Step 5: Prove replay does not gate the guide**

Test that users can open, close and reopen the guide without starting replay; abandon replay and return to the guide; and reset replay without losing the completed learning review.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/features/guide src/features/rehearsal && npm test && npm run build`

```bash
git add src/features/guide src/features/rehearsal
git commit -m "feat: add workflow guide and solo replay"
```

---

### Task 10: Complete application integration, publication and evidence graph

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/features/events/eventStore.ts`
- Modify: `src/features/events/eventStore.test.ts`
- Modify: `src/features/events/persistentEventStore.test.ts`
- Modify: `src/features/evidence/evidenceGraph.ts`
- Modify: `src/features/evidence/evidenceGraph.test.ts`
- Modify: `src/features/evidence/EvidenceInspector.tsx`
- Modify: `src/features/evidence/EvidenceInspector.test.tsx`
- Create: `src/features/change-impact/changeImpact.ts`
- Create: `src/features/change-impact/changeImpact.test.ts`
- Create: `src/features/change-impact/ChangeImpactPanel.tsx`
- Create: `src/features/change-impact/ChangeImpactPanel.test.tsx`

**Interfaces:**
- Consumes Tasks 2, 3, 4, 5, 7, 8 and 9.
- Produces one complete Studio -> Catalogue -> Episode -> Rehearsal -> Review -> Guide journey plus optional Solo Replay.

- [ ] **Step 1: Replace shell tests with the complete golden journey**

```tsx
it("publishes and completes the legal AI contract learning journey", async () => {
  render(<App />);
  await loadPackApproveAndPublish();
  await completeEpisodeCheckpoint();
  await verifyAiFindingsAndEscalate();
  expect(screen.getByRole("heading", { name: /your workflow guide/i })).toBeVisible();
});
```

Add unsafe AI-reliance, focused repair, optional replay, version invalidation and comprehensive reset integration tests. For publication, checkpoint continuation, rehearsal completion, repair completion and guide opening, dispatch the completion callback twice and assert the scoped event ledger contains exactly one event for that stable idempotency key; also assert a key collision with different metadata renders the recoverable integrity error.

- [ ] **Step 2: Replace owner-labelled stage tabs with learner navigation**

Use the Task 4 journey controller. The public UI contains no teammate names or mounting-point placeholders. Users may revisit completed stages but cannot skip episode or rehearsal prerequisites.

- [ ] **Step 3: Integrate the Studio and publication boundary**

The app receives a validated `DemoPack`, prepares the canonical draft, records named synthetic approval, compiles the bundle and records `module_published`. Compilation exceptions render a recoverable status panel rather than a blank screen.

- [ ] **Step 4: Integrate scoped events**

Use one `createScopedEventReporter(eventScopeFromBundle(bundle), eventStore.record)` instance after compilation. Include `sourceVersion`, `contractVersion`, `approvalFingerprint` and `bundleId` in every post-compilation event. Pass stable idempotency keys only for stage-completion events (`checkpoint`, `rehearsal`, `repair`, `guide`); keep repeated learner actions independently observable.

- [ ] **Step 5: Expand the evidence graph**

Add node types `ai_operation`, `ai_finding`, `contract_clause`, `playbook_rule`, `coaching_dimension` and `route_decision`. Add relations `produced`, `verified_against`, `governed_by`, `corrected_by` and `routed_by`.

The graph must prove this chain:

```text
submitted liability clause
        -> precomputed AI finding
        -> learner correction
        -> material-redline playbook rule
        -> legal-review route
        -> constructive coaching result
```

- [ ] **Step 6: Implement playbook change impact and reapproval**

```ts
export interface ChangeImpactResult {
  approvalStillCurrent: boolean;
  affectedStepIds: string[];
  affectedRuleIds: string[];
  affectedArtifactIds: string[];
  reasons: string[];
}

export function assessChangeImpact(
  previousUseCase: UseCase,
  changedUseCase: UseCase,
  previousBundle: CompiledLawfloBundle,
): ChangeImpactResult;
```

Test a changed material-redline rule and source version. The result invalidates
approval, lists episode, rehearsal, coaching and guide artefacts, and explains
the required regeneration. Render the result behind **Simulate a playbook
update** in the Studio so it does not lengthen the primary learner path.

- [ ] **Step 7: Keep evidence subordinate but inspectable**

Place the event ledger and evidence graph behind **How this is governed**. Open it automatically after the learning review for the judge path. Remove all unobserved future-metric chips.

- [ ] **Step 8: Make reset complete**

Clear event, journey, episode, rehearsal and solo-replay state; revoke the portrait object URL; restore the draft fixture; return focus to the Studio heading.

- [ ] **Step 9: Verify and commit**

Run: `npm test -- src/App.test.tsx src/features/events src/features/evidence src/features/change-impact && npm test && npm run build`

```bash
git add src/App.tsx src/App.test.tsx src/styles.css src/features/events src/features/evidence src/features/change-impact
git commit -m "feat: integrate the complete LAWFLO platform"
```

---

### Task 11: Desktop visual system, accessibility and failure resilience

**Files:**
- Modify: `src/styles.css`
- Modify: `src/features/studio/studio.css`
- Modify: `src/features/episode/episode.css`
- Modify: `src/features/rehearsal/rehearsal.css`
- Modify: `src/features/coaching/coaching.css`
- Modify: `src/features/guide/guide.css`
- Modify: relevant component tests beside each feature

**Interfaces:**
- Consumes the integrated Task 10 application.
- Produces the final polished, keyboard-usable and failure-safe desktop experience.

- [ ] **Step 1: Establish shared design tokens**

Define CSS custom properties for warm canvas, paper, ink, muted ink, coral action, legal blue, safe green, warning amber, border, focus ring, spacing, radii and shadows. Use one display family and one interface family already available through system font stacks; do not add a font-loading runtime dependency.

- [ ] **Step 2: Write accessibility regressions**

Assert heading order, labelled file inputs, caption defaults, named playback controls, visible status regions, focus transfer, source disclosure state and no interaction implemented only through color.

- [ ] **Step 3: Implement desktop breakpoints**

- 1280px and above: full three-column rehearsal workspace.
- 1024-1279px: compact workflow rail above two work panels.
- Below 900px: render the desktop-required explanation plus accessible Studio metadata and workflow guide; do not render unusable simulator controls.

- [ ] **Step 4: Implement reduced motion and missing-capability behavior**

Under `prefers-reduced-motion: reduce`, remove autoplay transitions, transforms and parallax while preserving cue changes. Mock unavailable `localStorage`, clipboard, object URLs and file reads; every failure follows the spec's recovery table.

- [ ] **Step 5: Run static and component verification**

Run: `npm test && npm run build`

Expected: all tests and the production build pass with no API environment variables.

- [ ] **Step 6: Run manual browser QA with gstack**

Exercise golden, unsafe-repair, refresh-resume, optional-replay, reset and stale-version paths at 1440x900 and 1024x768. At 768x1024 confirm the desktop-required explanation. Record console errors and failed requests before making fixes.

- [ ] **Step 7: Fix every blocker and major regression, then rerun the same matrix**

Do not add unrelated decoration after the first clean regression. Preserve the permitted visual mechanics and the code-name prohibition.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "fix: polish and harden the LAWFLO experience"
```

---

### Task 12: Browser automation, signed-out deployment and demo operations

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `e2e/lawflo.spec.ts`
- Create: `.github/workflows/deploy-pages.yml`
- Create: `docs/DEPLOYMENT-CHECKLIST.md`
- Create: `docs/JUDGE-DEMO.md`

**Interfaces:**
- Consumes the Task 11 production build.
- Produces repeatable browser tests, a public GitHub Pages site and a four-minute demonstration script.

- [ ] **Step 1: Install Playwright and add the script**

Run: `npm install --save-dev @playwright/test`

Add `"test:e2e": "playwright test"` to `package.json` and configure Chromium with a Vite web server.

- [ ] **Step 2: Write the browser tests before deployment configuration**

Cover:

- synthetic pack -> approval -> publication;
- real browser file selection for all four marked documents plus the portrait -> validation -> approval -> publication;
- episode checkpoint and blocked seek;
- AI finding correction -> clause inspection -> playbook -> legal route;
- skipped verification -> focused repair -> completion;
- workflow guide without solo replay;
- solo replay abandonment and return;
- refresh/resume and reset;
- 1440x900, 1024x768 and narrow-screen messaging;
- keyboard activation of the primary path;
- rapid repeated completion actions produce one event per stable idempotency key;
- no fetch/XHR, WebSocket or cross-origin request caused by learner actions after the initial static assets load;
- zero uncaught page errors.

Use Playwright `setInputFiles` with the repository's marked synthetic documents
and portrait for the real-upload path. Assert every filename and local-only
validation state before publication, then confirm the resulting bundle manifest
matches the bundled fallback's scenario ID and content fingerprint.

Install a Playwright request listener before starting the journey. Allow only the
initial same-origin document, JavaScript, CSS and image assets. Fail the test if
any subsequent learner action initiates `fetch`/XHR, WebSocket, model, analytics
or cross-origin traffic. Keep this assertion active for both bundled and uploaded
demo-pack journeys.

- [ ] **Step 3: Run Chromium locally**

Run: `npx playwright install chromium && npm run test:e2e`

Expected: every browser path passes against the local Vite server.

Use Playwright Clock in episode journeys: install the page clock before playback,
start the real reducer-driven timer, and fast-forward each cue interval until the
checkpoint. Do not add a production `fastMode`, shorten the authored timeline or
use arbitrary sleeps. Keep one reducer unit test around the true duration boundary.

- [ ] **Step 4: Configure GitHub Pages with an end-to-end release gate**

Set Vite's production base to `/smu-lit-/` when `GITHUB_ACTIONS` is true. The workflow uses `actions/setup-node@v4` with Node 22, runs `npm ci`, installs the pinned Playwright Chromium runtime with `npx playwright install --with-deps chromium`, then runs `npm test`, `npm run build` and `npm run test:e2e` before uploading `dist`. Grant only `contents: read`, `pages: write` and `id-token: write`; use GitHub's Pages concurrency group and deploy only from `main`.

Configure Playwright's CI web server to run the production build through `vite preview` with the same `/smu-lit-/` base used by Pages. Browser tests navigate through that base path so a broken asset or navigation URL blocks deployment rather than appearing after publication.

- [ ] **Step 5: Write the readiness record**

`docs/DEPLOYMENT-CHECKLIST.md` records the deployed URL, commit, test commands and results, viewports, golden path, repair path, event-integrity check, signed-out check, known risks and fallback reset instructions.

- [ ] **Step 6: Write the four-minute judge script**

`docs/JUDGE-DEMO.md` contains:

1. Load five synthetic inputs.
2. Inspect legal AI operations and approve the exact version.
3. Publish and play the episode checkpoint.
4. Run the simulated AI contract review.
5. Correct the missed material liability redline.
6. Apply the playbook and escalate to legal review.
7. Show constructive coaching and the workflow guide.
8. Open the source-to-decision evidence chain.

Also include a 30-second fallback route that starts from the published module and uses Reset before every live presentation.

- [ ] **Step 7: Run the complete completion gate**

Run locally on Node 22: `npm test && npm run build && npm run test:e2e`

Open the production preview and the deployed URL. Confirm both complete the same path with no credentials or model calls.

- [ ] **Step 8: Commit delivery configuration**

```bash
git add package.json package-lock.json vite.config.ts playwright.config.ts e2e .github/workflows docs/DEPLOYMENT-CHECKLIST.md docs/JUDGE-DEMO.md
git commit -m "chore: add LAWFLO deployment and demo gates"
```

---

## Execution Order and Checkpoints

### Checkpoint A: Legal AI truthfulness

- [ ] Tasks 1-3 complete.
- [ ] The fixture is contract-specific and synthetic.
- [ ] AI findings, deterministic rules and human decisions remain visibly distinct.
- [ ] A material liability redline overrides the low-value shortcut.
- [ ] Compilation rejects stale approval, contract version and source references.

### Checkpoint B: Complete learning mechanics

- [ ] Tasks 4-9 complete.
- [ ] Episode checkpoint cannot be bypassed.
- [ ] Rehearsal requires real inspection and correction actions, not only Next buttons.
- [ ] Guidance fades and increases from observed behavior.
- [ ] Focused repair replaces pass/fail assessment.
- [ ] Solo replay is optional and does not gate the guide.

### Checkpoint C: Integrated demonstration

- [ ] Task 10 complete.
- [ ] One bundle drives episode, rehearsal, coaching, guide and evidence.
- [ ] Events are bound to use case, source version, contract version, approval fingerprint and bundle.
- [ ] The evidence graph traces the wrong AI finding through correction and escalation.
- [ ] Reset leaves no stale progress or fake observed events.

### Checkpoint D: Public delivery

- [ ] Tasks 11-12 complete.
- [ ] Production build, unit tests and browser tests pass.
- [ ] The deployed URL works signed out at 1440x900 and 1024x768.
- [ ] The narrow-screen explanation is intentional and accessible.
- [ ] A cold tester completes the journey without verbal repair.
- [ ] The four-minute and 30-second judge paths are rehearsed.

## Priority Policy

### P0: Required for submission

- Contract-specific legal AI domain and canonical synthetic pack.
- Precomputed AI extraction, clause comparison and deliberately wrong material finding.
- Current-source approval and version-bound compilation.
- Source-linked cinematic episode with enforced checkpoint.
- Desktop matter rehearsal with finding correction, clause inspection and legal escalation.
- Progressive coaching, focused repair and personalised workflow guide.
- Truthful event ledger and inspectable evidence chain.
- Desktop visual polish, reset, signed-out deployment and browser regression.

### P1: Complete unless a P0 blocker remains at the 90-minute freeze

- Optional solo replay variation.
- Resume across refresh for episode and rehearsal.
- Searchable episode transcript.
- Policy/playbook change-impact view and required reapproval.
- Automated narrow-screen and keyboard Playwright paths.
- Additional catalogue cards clearly labelled as concept previews.

### P2: Do not start before every P0 gate is green

- Live model calls or arbitrary contract ingestion.
- Authentication, accounts, databases or server-side file storage.
- Real firm-tool integration or process mining.
- Face cloning, voice cloning or lip sync.
- A second complete workflow such as conflict-of-interest disclosure.
- Badges, leaderboards, certification or quantified adoption claims.

## Final Stop Condition

Do not call LAWFLO ready until a cold tester can load the synthetic pack, approve and publish the module, complete the episode checkpoint, inspect and correct the inaccurate AI finding, open the material clause and playbook rule, escalate the agreement to legal review, finish focused repair, open the personalised workflow guide and inspect the evidence chain on the public signed-out desktop site without verbal repair.

## Engineering Review Addendum

### Reviewed runtime and authorization flow

```text
Vite-bundled marked documents + portrait          user-selected marked local files
                    |                                           |
                    +--------------- validate -------------------+
                                        |
                          prepareDraftFromDemoPack()
                                        |
             TrainingModuleContent { guided, optional solo replay }
                                        |
             human approval over workflow + sources + scenario refs
                                        |
               verify every scenario content fingerprint again
                                        |
                      compileApprovedTrainingModule()
                                        |
       +---------------+---------------+---------------+---------------+
       |               |               |               |               |
    episode        rehearsal        coaching          guide        evidence graph
       |               |               |               |               |
       +---------------+------- scoped observed events +---------------+
                                        |
                 version-bound localStorage + complete reset
```

Inline ASCII comments belong in `bundleCompiler.ts` beside the approval-to-bundle
boundary, `rehearsalReducer.ts` beside the legal transition matrix, and
`coachingEngine.ts` beside support escalation. Presentational components do not
need diagrams.

### Test coverage map

Vitest is the detected unit/component framework; Playwright is added for the
browser gate. Stars describe the required test quality after implementation,
not current implementation coverage.

```text
CODE PATHS                                             USER FLOWS
[+] pack -> draft -> approval -> bundle                [+] Publish a module
  +-- [★★★ PLANNED] bundled ?raw assets                  +-- [★★★ ->E2E] bundled five-input fallback
  +-- [★★★ PLANNED] five valid browser Files             +-- [★★★ ->E2E] five real file selections
  +-- [★★★ PLANNED] marker/MIME/size/read failures        +-- [★★★ ->E2E] reject arbitrary document
  +-- [★★★ PLANNED] object URL replace/unmount            +-- [★★★ ->E2E] approve exact scenario set
  +-- [★★★ PLANNED] stale workflow/source/scenario        +-- [★★★ ->E2E] recover from compile error

[+] typed route evaluation                            [+] Watch the episode
  +-- [★★★ PLANNED] lt/eq/neq/present                   +-- [★★★ ->E2E] play, pause, captions, transcript
  +-- [★★★ PLANNED] missing/ambiguous fact               +-- [★★★ ->E2E] blocked seek at checkpoint
  +-- [★★★ PLANNED] material finding unresolved          +-- [★★★ ->E2E] unsafe answer, repair, continue
  +-- [★★★ PLANNED] legal-rule priority/tie               +-- [★★★ ->E2E] clock-fast-forward real timer

[+] journey/episode/rehearsal reducers                [+] Rehearse the legal AI workflow
  +-- [★★★ PLANNED] every legal/illegal transition       +-- [★★★ ->E2E] inspect and correct AI finding
  +-- [★★★ PLANNED] corrupt/stale/unavailable storage     +-- [★★★ ->E2E] compare material clause
  +-- [★★★ PLANNED] confirm/correct/route branches        +-- [★★★ ->E2E] open rule and escalate to legal
  +-- [★★★ PLANNED] focused repair and recovery           +-- [★★★ ->E2E] unsafe reliance -> focused repair
  +-- [★★★ PLANNED] guided/solo invariant parity          +-- [★★★ ->E2E] refresh/resume and reset

[+] coaching/guide/evidence                           [+] Finish and reuse learning
  +-- [★★★ PLANNED] independent/guided/revisit states    +-- [★★★ ->E2E] constructive review -> guide
  +-- [★★★ PLANNED] source-linked repair selection        +-- [★★★ ->E2E] guide without solo replay
  +-- [★★★ PLANNED] approved solo scenario selection      +-- [★★★ ->E2E] abandon replay -> return to guide
  +-- [★★★ PLANNED] scope and idempotency collision       +-- [★★★ ->E2E] rapid clicks do not overcount
  +-- [★★★ PLANNED] exact evidence-chain construction     +-- [★★★ ->E2E] source-to-route evidence inspection

[+] delivery boundary                                [+] Public-site operation
  +-- [★★★ PLANNED] production base and asset URLs        +-- [★★★ ->E2E] 1440x900 and 1024x768 paths
  +-- [★★★ PLANNED] no runtime fetch/XHR/WebSocket        +-- [★★★ ->E2E] narrow-screen explanation
  +-- [★★★ PLANNED] reduced motion/storage/clipboard      +-- [★★★ ->E2E] keyboard-only primary path
  +-- [★★★ PLANNED] CI blocks failed unit/build/E2E       +-- [★★★ ->E2E] signed-out deployed smoke path

PLANNED COVERAGE: 36/36 grouped paths (100%)
QUALITY TARGET: ★★★:36  ★★:0  ★:0
LLM EVALS: none — the prototype contains no runtime model or prompt call.
```

### Failure-mode audit

| Codepath | Realistic failure | Test | Handling and user experience |
|---|---|---|---|
| Demo-pack intake | Wrong marker, MIME, oversize file or `File.text()` rejection | Unit + E2E | File card names the rejected input and retains recoverable controls |
| Portrait lifecycle | Object URL leaks or bundled URL is incorrectly revoked | Component | Revoke only owned object URLs on replacement, unmount and reset |
| Module approval | Scenario content changes without version change | Unit + integration | Compilation rejects the fingerprint mismatch and requests reapproval |
| Bundle compiler | Missing source, clause, finding or scenario reference | Unit | Recoverable publication panel; no partial bundle is exposed |
| Route evaluator | Missing fact or conflicting legal rules | Unit | Fail closed to `legal_review` with source-linked reasoning |
| Episode | Timer races, checkpoint bypass or stale resume | Reducer + component + E2E | Clamp state, restore only exact bundle state, keep controls usable |
| Rehearsal | Unsafe AI route is selected before verification | Reducer + E2E | Record the attempt and enter focused repair; never complete silently |
| Coaching | Trace lacks evidence for a safety-critical dimension | Unit + component | Show `revisit_step` linked to the exact task and source |
| Solo replay | Replay content differs from the approved scenario | Unit + integration | Reject replay and return to the already available guide |
| Event ledger | Duplicate callback or idempotency-key collision | Unit + integration + E2E | Return original event for a duplicate; show integrity error on collision |
| Browser storage | Corrupt, blocked or full `localStorage` | Unit + component | Discard invalid resume data and continue in-memory with a clear notice |
| Static delivery | Wrong Pages base path, missing asset or unexpected network call | CI E2E | Block deployment; retain the prior successful Pages deployment |

Critical silent gaps after accepted changes: **0**.

### What already exists

- `src/domain/mattershift.ts` already supplies the core `UseCase`, source,
  guardrail and event contracts; Task 1 extends them instead of creating a
  parallel domain model.
- `src/domain/approval.ts` already provides deterministic material fingerprints
  and freshness checks; 1A broadens the approved material to the scenario set.
- `src/features/compiler/compiler.ts` already prepares drafts; it is retained and
  renamed for an explicit pack-to-draft responsibility.
- `src/features/compiler/bundleCompiler.ts` already compiles approved learning
  artefacts; Task 3 migrates it rather than adding a second final compiler.
- `src/features/events/eventStore.ts` already supports idempotency, persistence
  fallback and JSON-safe metadata; 3A exposes those options through the reporter.
- `src/features/evidence/*` already renders source-backed event evidence; Task 10
  expands its vocabulary and graph rather than rebuilding the inspector.
- `src/App.tsx` and its integration test already provide the application shell;
  the roadmap replaces placeholder stage content inside that shell.

### NOT in scope

- Arbitrary-document legal analysis — deferred because reliable extraction and
  legal-quality evaluation require a materially different model-backed product.
- Runtime OpenAI, Gemini or third-party model calls — deferred to preserve a
  deterministic, credential-free judging path.
- Authentication, database persistence and server-side file storage — deferred
  because the hackathon prototype is a public single-browser learning demo.
- Real firm integrations, workflow execution and document transmission — deferred
  because the simulation must never imply it can alter a live legal matter.
- Face/voice cloning, generated speech and lip sync — deferred as high-cost polish
  that does not deepen the legal AI learning mechanism.
- Certification, fitness decisions, leaderboards and adoption claims — excluded
  because LAWFLO supports learning and has no evidence base for those judgments.
- A second complete compliance workflow — deferred until the contract-review
  module passes the cold-tester and public-deployment gates.

No `TODOS.md` items are proposed: these are deliberate product boundaries, not
forgotten work needed to complete this hackathon submission.

### Worktree parallelization strategy

| Step | Modules touched | Depends on |
|---|---|---|
| A. Domain and approved content | `domain/`, `demo/`, `compiler/` | — |
| B. Journey and episode | `journey/`, `episode/` | A |
| C. Rehearsal engine and workspace | `rehearsal/` | A |
| D. Coaching and guide | `coaching/`, `guide/` | C |
| E. Integration and evidence | app shell, `events/`, `evidence/`, `change-impact/` | B, C, D |
| F. Visual and delivery gate | styles, E2E, GitHub workflow, demo docs | E |

- Lane A: A (foundational and sequential).
- Lane B: B (can run after A).
- Lane C: C -> D (sequential because coaching consumes the rehearsal trace).
- Lane D: E -> F (integration and delivery, after B and C).
- Execution order: finish A; B and C may run in parallel worktrees; merge both;
  finish D; then E and F sequentially.
- Conflict flags: B and C both consume compiler/domain types but do not edit those
  modules after A. E is the intentional merge point and must not run in parallel
  with either lane. John and Codex remain the only repository writers unless John
  explicitly reassigns implementation.

### Implementation Tasks

Synthesized from the engineering review. These are already placed in their
corresponding numbered roadmap tasks; checkbox both locations as they ship.

- [ ] **T1 (P1, human: ~1h / Codex: ~15m)** — Approval — Bind human approval to the complete guided and solo scenario set.
  - Surfaced by: Architecture and outside voice — workflow-only approval did not authorize generated scenario content.
  - Files: `src/domain/mattershift.ts`, `src/domain/approval.ts`, `src/demo/contractScenarios.ts`, `src/features/compiler/bundleCompiler.ts`
  - Verify: `npm test -- src/domain src/demo src/features/compiler`
- [ ] **T2 (P1, human: ~30m / Codex: ~8m)** — Intake — Bundle marked documents with Vite `?raw` and track portrait URL ownership.
  - Surfaced by: Architecture — runtime asset fetching conflicted with static/offline guarantees.
  - Files: `src/demo/assets/*`, `src/features/studio/demoPack.ts`, `src/features/studio/DemoPackInput.tsx`
  - Verify: `npm test -- src/features/studio src/demo`
- [ ] **T3 (P1, human: ~30m / Codex: ~8m)** — Evidence — Forward idempotency options through the scoped reporter.
  - Surfaced by: Architecture — UI completion callbacks could not reach the event store's existing dedupe contract.
  - Files: `src/domain/integration.ts`, `src/features/events/eventStore.ts`, `src/App.test.tsx`
  - Verify: `npm test -- src/domain/integration.test.ts src/features/events src/App.test.tsx`
- [ ] **T4 (P1, human: ~1h / Codex: ~15m)** — Routing — Replace loosely typed playbook rules with an exhaustive discriminated union.
  - Surfaced by: Code quality — incompatible operator/value pairs were representable.
  - Files: `src/domain/mattershift.ts`, `src/features/compiler/routeEngine.ts`
  - Verify: `npm test -- src/domain src/features/compiler/routeEngine.test.ts && npm run build`
- [ ] **T5 (P2, human: ~30m / Codex: ~8m)** — Compiler — Rename draft preparation to preserve the human-approval boundary.
  - Surfaced by: Code quality — two compile entry points obscured draft versus approved generation.
  - Files: `src/features/compiler/compiler.ts`, `src/features/compiler/compiler.test.ts`
  - Verify: `npm test -- src/features/compiler && npm run build`
- [ ] **T6 (P1, human: ~2h / Codex: ~30m)** — Browser QA — Cover real file selection, network silence, rapid completion actions and deterministic episode time.
  - Surfaced by: Test review — component-only coverage hid browser APIs and reporter wiring; real time made CI flaky.
  - Files: `playwright.config.ts`, `e2e/lawflo.spec.ts`, `src/App.test.tsx`
  - Verify: `npm run test:e2e`
- [ ] **T7 (P1, human: ~45m / Codex: ~12m)** — Delivery — Gate GitHub Pages deployment on Node 22 unit, build and Chromium E2E checks.
  - Surfaced by: Distribution architecture — the original workflow could publish a broken integrated journey.
  - Files: `vite.config.ts`, `.github/workflows/deploy-pages.yml`
  - Verify: clean GitHub Actions Pages run on `main`, followed by signed-out smoke test.

_No new tasks from the performance section._

### Review completion summary

- Step 0: Scope Challenge — full staged scope retained by explicit choice B.
- Architecture Review: 4 issues found; all resolved by choices 1A-4A.
- Code Quality Review: 2 issues found; all resolved by choices 5A-6A.
- Test Review: coverage diagram produced; 4 gaps found and resolved by choices 7A-10A.
- Performance Review: 0 issues found.
- Outside voice: nested Codex pass skipped because this review is already running under Codex; independent in-host challenge found 1 issue, resolved by choice 11A.
- NOT in scope: written.
- What already exists: written; existing domain, approval, compiler, event and evidence foundations are reused.
- TODOS.md updates: 0 items proposed; deferred items are explicit product boundaries.
- Failure modes: 12 grouped production failures reviewed; 0 critical silent gaps remain.
- Parallelization: 4 lanes; B and C may run in parallel after foundational lane A, with integration sequential afterward.
- Lake Score: 11/11 review recommendations chose the complete option.
- Retrospective: prior commits progressively corrected generic workflow scope and assessment-heavy rehearsal. This plan preserves those approved changes and hardens the exact areas previously shown to drift: source scope, approval scope, observed evidence and constructive coaching.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | Not run |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | SKIPPED | Already running under Codex; in-host challenge included in Eng Review |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 11 issues, 0 critical gaps; all accepted fixes folded into this plan |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | Not run |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | Not run |

**VERDICT:** ENG CLEARED — the full staged roadmap is ready to implement.

NO UNRESOLVED DECISIONS
