# LAWFLO Hybrid Three-Minute Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild LAWFLO as a quiet staged learning platform with a real generated-video episode, an honest prepared-demo path and a complete judge journey under 2:55.

**Architecture:** A top-level experience reducer controls welcome, role, authoring, publication and learner stages. Existing compiler, rehearsal, coaching and evidence logic remain intact behind focused screens. A server-only Runway adapter creates asynchronous multi-shot renders; the canonical demo plays durable prepared assets and never labels them as newly generated.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest, Testing Library, Playwright, Node 22 server, OpenAI SDK, Runway Node SDK, vanilla CSS.

**Spec:** `docs/superpowers/specs/2026-09-06-lawflo-hybrid-demo-design.md`

## Global Constraints

- Desktop-first, minimum rehearsal width 900px.
- One dominant primary action per screen.
- Preserve the existing institutional palette and typography.
- No client data, browser-exposed provider secrets or direct Runway output URLs.
- Prepared media must remain usable after initial page load without venue connectivity.
- Cached media must be labelled **Prepared demo render**.
- Canonical judge route must complete in no more than 2:55.
- Preserve source linkage, human approval, audit events and constructive coaching.

---

### Task 1: Staged platform journey

**Files:**
- Create: `src/features/platform/platformJourney.ts`
- Create: `src/features/platform/platformJourney.test.ts`
- Create: `src/features/platform/WelcomeScreen.tsx`
- Create: `src/features/platform/RoleScreen.tsx`
- Create: `src/features/platform/PublishedScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: `PlatformStage`, `PlatformRole`, `createPlatformJourney()` and `platformJourneyReducer(state, action)`.
- Consumes: the existing learner `journeyReducer` only after publication.

- [ ] Write reducer tests proving `welcome → role → studio` and `published → catalogue` transitions, and that reset returns to `welcome`.
- [ ] Run `npm test -- src/features/platform/platformJourney.test.ts` and verify the new module is missing.
- [ ] Implement the typed reducer and three single-purpose screens with the exact primary actions from the spec.
- [ ] Replace the always-visible dashboard shell in `App.tsx` with stage rendering; keep governance and reset controls inside secondary menus after publication.
- [ ] Update `App.test.tsx` to prove only **Enter LAWFLO** dominates welcome and later-stage controls are absent.
- [ ] Run `npm test -- src/features/platform/platformJourney.test.ts src/App.test.tsx` and verify both pass.
- [ ] Commit with `git commit -m "feat: stage the LAWFLO platform journey"`.

### Task 2: Focused authoring and prepared production

**Files:**
- Create: `src/features/studio/ProductionScreen.tsx`
- Create: `src/features/studio/ProductionScreen.test.tsx`
- Create: `src/features/studio/PreviewScreen.tsx`
- Create: `src/features/studio/PreviewScreen.test.tsx`
- Modify: `src/features/studio/DemoPackInput.tsx`
- Modify: `src/features/studio/DemoPackInput.test.tsx`
- Modify: `src/features/studio/studio.css`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `ProductionScreen({ mode: "prepared" | "live", onComplete })` and `PreviewScreen({ bundleDraft, media, onApprovePublish })`.
- Consumes: `loadSyntheticDemoPack`, `prepareDraftFromDemoPack`, `GeneratedModuleDraft` and the existing approval compiler.

- [ ] Write failing tests proving source intake has one drop zone, prepared-pack action and one disabled/enabled **Create episode** action.
- [ ] Write failing tests proving prepared production says **Prepared demo render**, advances through five stages and exposes no publish action.
- [ ] Simplify `DemoPackInput` into one upload surface with a compact selected-file list and a collapsed source-settings disclosure.
- [ ] Implement deterministic prepared-production timing with reduced-motion support and an immediate test clock path.
- [ ] Implement preview with one large media surface, compact scene rail, secondary details drawers and one **Approve and publish** action.
- [ ] Connect preparation, approval and compilation without removing existing source fingerprints or events.
- [ ] Run the three studio component test files and `src/App.test.tsx`.
- [ ] Commit with `git commit -m "feat: focus authoring on sources to published episode"`.

### Task 3: Runway generation boundary

**Files:**
- Create: `server/runwayClient.ts`
- Create: `server/runwayClient.test.ts`
- Create: `server/videoGeneration.ts`
- Create: `server/videoGeneration.test.ts`
- Modify: `server/index.ts`
- Modify: `server/renderApp.ts`
- Modify: `server/renderApp.test.ts`
- Modify: `render.yaml`
- Modify: `package.json`

**Interfaces:**
- Produces: `createVideoGeneration(request): Promise<{ taskId: string }>` and `getVideoGeneration(taskId): Promise<VideoGenerationStatus>` behind `/api/generation/video` and `/api/generation/video/:taskId`.
- Request: `{ mode: "custom"; duration: 15; ratio: "1280:720"; shots: Array<{ prompt: string; duration: number }> }` with 3–5 shots summing to 15 seconds.
- Status: `{ status: "pending" | "running" | "succeeded" | "failed"; mediaId?: string; error?: string }`.

- [ ] Install `@runwayml/sdk` and commit the lockfile change with this task.
- [ ] Write failing adapter tests with a fake Runway client; prove credentials stay server-side, shot count/duration are validated and provider failures become safe structured errors.
- [ ] Implement the SDK adapter using `RUNWAYML_API_SECRET` and the dated multi-shot recipe version `2026-06`.
- [ ] Write route tests for authentication, create, poll, unknown task and failed task states.
- [ ] Implement server routes without returning ephemeral Runway URLs to the browser; download successful media to a server-owned media identifier.
- [ ] Add `RUNWAYML_API_SECRET` as a non-synced Render secret in `render.yaml` and document that it must be entered in the dashboard.
- [ ] Run `npm test -- server/runwayClient.test.ts server/videoGeneration.test.ts server/renderApp.test.ts`.
- [ ] Commit with `git commit -m "feat: add server-side Runway video generation"`.

### Task 4: Real interactive video episode

**Files:**
- Create: `src/demo/assets/video/README.md`
- Create: `src/features/episode/episodeMedia.ts`
- Create: `src/features/episode/episodeMedia.test.ts`
- Modify: `src/features/episode/EpisodePlayer.tsx`
- Modify: `src/features/episode/EpisodePlayer.test.tsx`
- Modify: `src/features/episode/episodeReducer.ts`
- Modify: `src/features/episode/episodeReducer.test.ts`
- Modify: `src/features/episode/episode.css`

**Interfaces:**
- Produces: `EpisodeMediaManifest` containing two ordered local video segments, per-segment captions/narration and one checkpoint boundary.
- Consumes: the compiled episode checkpoint, narration URLs and durable files under `public/media/demo/`.

- [ ] Write a failing manifest test proving both media files are local/durable and the checkpoint occurs between segments.
- [ ] Replace the static portrait stage with an HTML video player that advances segment one → checkpoint → segment two.
- [ ] Preserve captions, transcript, source drawer, event reporting and checkpoint retry behaviour while preventing unresolved forward seeking.
- [ ] Add a dedicated completion transition with **Start guided rehearsal** instead of exposing rehearsal early.
- [ ] Update tests to assert actual `<video>` playback, checkpoint pause, unsafe correction, retry and completion.
- [ ] Run all episode tests.
- [ ] Commit with `git commit -m "feat: play a real interactive training episode"`.

### Task 5: Progressive guided rehearsal

**Files:**
- Modify: `src/features/rehearsal/MatterWorkspace.tsx`
- Modify: `src/features/rehearsal/MatterWorkspace.test.tsx`
- Modify: `src/features/rehearsal/components/WorkflowRail.tsx`
- Modify: `src/features/rehearsal/components/AiReviewPanel.tsx`
- Modify: `src/features/rehearsal/components/VerificationPanel.tsx`
- Modify: `src/features/rehearsal/components/RoutingPanel.tsx`
- Modify: `src/features/rehearsal/rehearsal.css`

**Interfaces:**
- Preserves: existing `rehearsalReducer`, evidence events, source opening and `onComplete` contract.
- Produces: progressive disclosure keyed by existing `state.task` and a visually dominant current objective.

- [ ] Add failing component tests proving routing controls are absent before verification and appear only at the appropriate task.
- [ ] Make the contract the central persistent surface; reveal AI review, verification and routing only when the reducer reaches each step.
- [ ] Reduce the live route to run review, verify the material liability change, apply the playbook and submit Legal review with rationale.
- [ ] Keep hints collapsed, preserve unsafe-action quarantine and leave deeper findings accessible outside the canonical demo path.
- [ ] Run all rehearsal, coaching and integration tests.
- [ ] Commit with `git commit -m "feat: guide learners through one legal AI objective at a time"`.

### Task 6: Visual consolidation and timed release gate

**Files:**
- Modify: `src/styles.css`
- Modify: `src/tokens-institutional.css`
- Modify: `src/features/episode/episode.css`
- Modify: `src/features/studio/studio.css`
- Modify: `src/features/rehearsal/rehearsal.css`
- Modify: `playwright.config.ts`
- Create: `e2e/three-minute-demo.spec.ts`
- Modify: `docs/JUDGE-DEMO.md`
- Modify: `docs/DEPLOYMENT-CHECKLIST.md`

**Interfaces:**
- Consumes: stable accessible button names from Tasks 1–5.
- Produces: one Playwright canonical route and a recorded runtime measurement.

- [ ] Remove the always-visible utility strip, dashboard grids and competing primary buttons from the canonical path.
- [ ] Apply the institutional palette with large whitespace, restrained borders, no heavy shadows and reduced-motion support.
- [ ] Write the Playwright route using prepared sources, prepared render, checkpoint retry, guided rehearsal and review.
- [ ] Run `npm test`, `npm run build` and `npm run test:e2e`; repair every regression.
- [ ] Run the canonical route three times, record each duration and fail readiness if any run exceeds 2:55 or any interaction needs venue network access.
- [ ] Inspect welcome, authoring, player, rehearsal and review at 1440×900 and 1024×768; record screenshots and correct overflow or competing hierarchy.
- [ ] Update deployment documentation with `RUNWAYML_API_SECRET`, prepared-media validation and the safe fallback route.
- [ ] Commit with `git commit -m "feat: ship the three-minute LAWFLO demo journey"`.

## Self-review

- Spec coverage: all eleven stages, the hybrid media boundary, the live-demo exclusions, visual rules and eight acceptance tests map to Tasks 1–6.
- Placeholder scan: no deferred implementation steps or unspecified error handling remain.
- Type consistency: the platform reducer owns macro stages; learner journey state begins after publication; episode media uses a dedicated manifest; the Runway server never returns provider URLs.
- Primary risk: the two prepared Runway MP4 files do not yet exist and require the user's Runway credential. UI and server work can proceed before generation, but the real-video acceptance gate cannot pass without those assets.
