# LAWFLO Instructional Episode Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic two-clip episode with a source-accurate four-chapter lesson using synchronized Runway/ElevenLabs narration and deterministic legal-workflow visuals.

**Architecture:** Runway video supplies cinematic context while typed React overlay beats display every legal fact. A four-segment manifest owns video, audio, captions, sources, and overlay timing; one player consumes it in creator preview and learner mode. The offline media script generates versioned video and Eleven v3 narration assets through the existing Runway SDK.

**Tech Stack:** React 19, TypeScript 7, Vitest, Testing Library, Playwright, Runway SDK 4.20, CSS

**Spec:** `docs/superpowers/specs/2026-09-06-lawflo-instructional-episode-correction-design.md`

## Global Constraints

- The prepared lesson must remain 50–60 seconds with four chapters and one learning checkpoint.
- Generated video must not contain instructional text or invented application screens.
- Exact legal facts must be rendered as deterministic UI and supported by source references.
- Prepared narration must use Runway `eleven_v3`; browser speech synthesis is prohibited.
- The guided rehearsal remains unchanged unless an end-to-end regression requires a compatibility fix.
- Existing unexplained deletions in `demo-upload-pack/` and the untracked pitch-deck handoff are user-owned and must not be included in commits.

---

### Task 1: Completed Upload State

**Files:**
- Modify: `src/features/studio/DemoPackInput.tsx`
- Modify: `src/features/studio/DemoPackInput.test.tsx`
- Modify: `src/features/studio/studio.css`

**Interfaces:**
- Consumes: existing `PartialDemoPack`, `completePack`, and `replaceDraft` flow.
- Produces: a completed resource panel that replaces the upload/prepared choice whenever `readyKinds.length > 0`.

- [ ] **Step 1: Write the failing behavioural test**

Add a test that loads the prepared pack and asserts that the five-file list and **Replace files** control are visible while **Upload workflow resources**, the “or” divider, and **Use prepared source pack** are absent.

- [ ] **Step 2: Verify RED**

Run `npm test -- src/features/studio/DemoPackInput.test.tsx` and confirm the new assertion fails because the chooser remains mounted.

- [ ] **Step 3: Implement the replacement state**

Render either the empty chooser or the completed panel, never both. The replacement control must activate the same hidden multi-file input and keep `onReady` and validation behaviour unchanged.

- [ ] **Step 4: Verify GREEN**

Run `npm test -- src/features/studio/DemoPackInput.test.tsx` and confirm all tests pass.

- [ ] **Step 5: Commit**

Commit only the three files above with `Fix completed workflow upload state`.

### Task 2: Four-Chapter Instructional Manifest

**Files:**
- Modify: `src/features/episode/episodeMedia.ts`
- Modify: `src/features/episode/episodeMedia.test.ts`
- Modify: `server/demoMediaPlan.ts`
- Modify: `server/demoMediaPlan.test.ts`
- Modify: `server/runwayClient.ts`
- Modify: `server/runwayClient.test.ts`

**Interfaces:**
- Produces: `EpisodeOverlayBeat`, `EpisodeMediaSegment`, and an `EpisodeMediaManifest` whose `segments` is a four-item readonly array.
- Produces: four 15-second Runway video plans and four matching `eleven_v3` narration plans.
- Consumes: existing `renderRunwayVideo` validation and multi-shot recipe.

- [ ] **Step 1: Write failing manifest and media-plan tests**

Assert four stable chapters, local MP4 and MP3 paths, non-empty source references, timed overlay beats, a checkpoint after chapter two, and total duration of 60 seconds. Assert prompts prohibit readable text and describe cinematic context rather than an invented interface.

- [ ] **Step 2: Verify RED**

Run `npm test -- src/features/episode/episodeMedia.test.ts server/demoMediaPlan.test.ts server/runwayClient.test.ts` and confirm the tests fail against the two-segment contract and video-only client.

- [ ] **Step 3: Implement the typed manifest and Runway speech boundary**

Add a `renderRunwayNarration(client, input)` boundary using:

```ts
client.textToSpeech.create({
  model: "eleven_v3",
  promptText: input.narration,
  voice: { type: "runway-preset", presetId: "Maya" },
  languageCode: "en",
  applyTextNormalization: "auto",
  stability: 0.58,
  similarityBoost: 0.76,
  style: 0.18,
  speed: 1,
  useSpeakerBoost: true,
  seed: 42000,
}).waitForTaskOutput();
```

The four segments are `ai-review`, `verify-evidence`, `learner-decision`, and `safe-route`. Their overlay data contains literal extracted facts, literal clause text, and the final route with source IDs.

- [ ] **Step 4: Verify GREEN**

Run the same focused test command and confirm all tests pass.

- [ ] **Step 5: Commit**

Commit only the six files above with `Define four chapter instructional media`.

### Task 3: Offline Video and Narration Generation

**Files:**
- Modify: `scripts/generateDemoMedia.ts`
- Modify: `server/videoGeneration.ts`
- Modify: `server/videoGeneration.test.ts`

**Interfaces:**
- Consumes: four `demoMediaPlans`, `renderRunwayVideo`, and `renderRunwayNarration`.
- Produces: versioned local MP4 and MP3 files under `public/media/demo/`, written atomically after successful downloads.

- [ ] **Step 1: Write the failing download test**

Exercise the existing download boundary with an `audio/mpeg` response and assert the returned bytes and content type are accepted without weakening the video response checks.

- [ ] **Step 2: Verify RED**

Run `npm test -- server/videoGeneration.test.ts` and confirm audio download fails under the video-only contract.

- [ ] **Step 3: Implement media download and generation**

Generalize the download helper to accept an explicit expected media family. For each plan, generate missing video and narration independently, use partial files, then rename into their final versioned destinations. Existing non-empty assets are skipped.

- [ ] **Step 4: Verify GREEN and build**

Run `npm test -- server/videoGeneration.test.ts server/demoMediaPlan.test.ts server/runwayClient.test.ts` followed by `npm run build`.

- [ ] **Step 5: Generate prepared assets**

Run `npm run generate:demo-media` with `RUNWAYML_API_SECRET` supplied through the terminal’s hidden prompt. Confirm all eight outputs are non-empty and inspect their durations.

- [ ] **Step 6: Commit**

Commit the script, tests, and generated assets with `Generate instructional episode media`.

### Task 4: Synchronized Instructional Player

**Files:**
- Modify: `src/features/episode/EpisodePlayer.tsx`
- Modify: `src/features/episode/EpisodePlayer.test.tsx`
- Create: `src/features/episode/InstructionalOverlay.tsx`
- Create: `src/features/episode/InstructionalOverlay.test.tsx`
- Modify: `src/features/episode/episode.css`
- Modify: `src/features/studio/PreviewScreen.tsx`
- Modify: `src/features/studio/PreviewScreen.test.tsx`

**Interfaces:**
- Consumes: the four-chapter `EpisodeMediaManifest` and current compiled bundle.
- Produces: synchronized video/audio playback, deterministic timed overlays, one checkpoint, and the existing rehearsal transition.

- [ ] **Step 1: Write failing player and overlay tests**

Assert that prepared playback renders a chapter-specific audio element, never calls `speechSynthesis`, pauses both media elements, renders the correct legal fact from the current overlay beat, advances chapter one to two, opens the checkpoint after chapter two, and resumes at chapter three after the safe answer.

- [ ] **Step 2: Verify RED**

Run `npm test -- src/features/episode/InstructionalOverlay.test.tsx src/features/episode/EpisodePlayer.test.tsx src/features/studio/PreviewScreen.test.tsx` and confirm failure against the two-video browser-speech player.

- [ ] **Step 3: Implement the overlay component**

Render four explicit visual variants: extraction, clause comparison, decision evidence, and route/audit trail. Use semantic headings and text so the evidence remains accessible and testable.

- [ ] **Step 4: Implement synchronized playback**

Maintain one video ref and one audio ref. `play()` resets both to the same chapter start and starts both; `pause()` pauses both; `handleMediaEnded()` advances or opens the checkpoint. Update overlay time from the video `timeupdate` event. Audio failure hides the audio element, shows the caption fallback status, and never blocks the video.

- [ ] **Step 5: Reuse the manifest in preview**

Preview must show the same ordered chapter rail, audio controls, captions, and instructional overlays as learner playback without changing the publish transition.

- [ ] **Step 6: Verify GREEN**

Run the focused tests, then `npm test` and `npm run build`.

- [ ] **Step 7: Commit**

Commit only the files in this task with `Build synchronized instructional episode`.

### Task 5: Demo Regression and Deployment

**Files:**
- Modify: `tests/lawflo-demo.spec.ts`
- Modify: `Agents/Feedback Records/2026-09-06-lawflo-product-flow-hierarchy.md`
- Modify: `Agents/Recurring Failure Register.md`

**Interfaces:**
- Consumes: the complete creator, preview, learner, episode, checkpoint, rehearsal, and review flow.
- Produces: recorded cold-viewer and three-minute-demo evidence for the recurring client-feedback gates.

- [ ] **Step 1: Write the failing browser-route assertions**

Extend the Chromium route to assert that uploaded/prepared selection becomes a completed state, the learner sees four chapter labels, audio is present, the liability comparison is visible before the checkpoint, and rehearsal unlocks only after the final chapter.

- [ ] **Step 2: Verify RED, then implement only compatibility fixes**

Run `npm run test:e2e`. If the route fails because of an application regression, make the smallest correction in the owning component and rerun its focused unit test before rerunning Playwright.

- [ ] **Step 3: Run full verification**

Run `npm test`, `npm run build`, and `npm run test:e2e`. Record test counts, cold-viewer findings, changes, and remaining risks in the feedback record and append the recurrence repair to the failure register.

- [ ] **Step 4: Commit and push**

Commit only the e2e and feedback evidence files with `Verify instructional episode demo`, then push `main`.

- [ ] **Step 5: Verify production**

Open `https://lawflo.onrender.com/`, confirm the deployed revision, run the prepared creator-to-learner route at desktop size, inspect console/network failures, and time the complete demo.

