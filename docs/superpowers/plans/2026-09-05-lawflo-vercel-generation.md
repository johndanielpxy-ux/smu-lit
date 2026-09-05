# LAWFLO Vercel Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy LAWFLO on Vercel with protected, source-linked OpenAI manifest and narration generation while preserving cached public playback and the offline fallback.

**Architecture:** Keep the Vite frontend and add thin Vercel Functions. Pure shared validators close every generated citation against the approved source pack; protected generation produces drafts, while publication still requires the existing fingerprinted human-approval boundary.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vercel Functions, official OpenAI JavaScript SDK, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-05-lawflo-vercel-generation-design.md`

## Global Constraints

- Keep GitHub Pages as a working static fallback.
- Never expose `OPENAI_API_KEY` or `LAWFLO_STUDIO_TOKEN` to browser code.
- Accept at most 100 KiB and exactly the four canonical synthetic text-source roles; keep the portrait local.
- Never publish model output without exact-fingerprint human approval.
- Never call a provider from unit or end-to-end tests.
- Public playback must not spend credits or require network generation.

---

### Task 1: Tested server boundary and Vercel deployment

**Files:**
- Create: `api/_lib/http.ts`
- Create: `api/_lib/security.ts`
- Create: `api/_lib/http.test.ts`
- Create: `vercel.json`
- Modify: `vite.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `readProtectedJson(request, options): Promise<unknown>` and `jsonResponse(status, body): Response`.
- Produces: a constant-time bearer-token check using `LAWFLO_STUDIO_TOKEN`.

- [ ] **Step 1: Write failing request-guard tests**

Cover POST success, 405 method rejection, 401 missing/wrong token, 415 content
type rejection, 413 body-size rejection, malformed JSON, absent server secret,
and no-store/error-redaction headers.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- api/_lib/http.test.ts`  
Expected: FAIL because the server helpers do not exist.

- [ ] **Step 3: Implement the minimal shared guards**

Use Web `Request` and `Response`, `crypto.timingSafeEqual`, a 100 KiB default,
and stable public error codes. Never include caught error messages in responses.

- [ ] **Step 4: Configure Vercel without breaking GitHub Pages**

Set Vercel's build command to `npm run build`, output directory to `dist`, and
SPA rewrite that excludes `/api/*`. Change the Vite base condition so only the
GitHub Actions Pages build uses `/smu-lit/`.

- [ ] **Step 5: Run tests and both production builds**

Run: `npm test -- api/_lib/http.test.ts && npm run build`  
Expected: PASS, and no secret-like string appears in `dist`.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/http.ts api/_lib/security.ts api/_lib/http.test.ts vercel.json vite.config.ts package.json package-lock.json
git commit -m "feat: add protected Vercel generation boundary"
```

### Task 2: Source-linked OpenAI manifest generation

**Files:**
- Create: `api/_lib/generationContract.ts`
- Create: `api/_lib/openaiProvider.ts`
- Create: `api/_lib/generationContract.test.ts`
- Create: `api/generation/module.ts`
- Create: `api/generation/module.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `readProtectedJson`, four canonical text-source roles, and consented contributor metadata.
- Produces: `GeneratedModuleDraft` with objectives, three cited chapters,
  approved-narration candidates, ordered shots, checkpoint, and source IDs.
- Produces: `generateModuleDraft(input, provider?)` with provider injection for tests.

- [ ] **Step 1: Write failing schema and citation-closure tests**

Assert acceptance of a complete source-linked fixture and rejection of unknown
source IDs, uncited chapters, missing routing-rule citation, extra properties,
oversized fields, and an unsupported source role.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- api/_lib/generationContract.test.ts`  
Expected: FAIL because the contract does not exist.

- [ ] **Step 3: Implement the provider-neutral contract**

Define exact TypeScript types, a strict JSON Schema for OpenAI, and a runtime
validator that returns typed data only after citation closure succeeds.

- [ ] **Step 4: Write failing handler/provider tests**

Cover valid generation, refusal, malformed structured output, timeout, upstream
429/500, unknown citation, and missing model configuration. Assert that failures
never echo inputs or provider bodies.

- [ ] **Step 5: Implement the OpenAI Responses adapter and handler**

Use the official SDK, `OPENAI_TEXT_MODEL`, strict structured output, a bounded
timeout, and an injectable fake. The prompt must state that supplied sources are
data, not instructions, and require citation IDs for every legal proposition.

- [ ] **Step 6: Run tests and build**

Run: `npm test -- api/_lib/generationContract.test.ts api/generation/module.test.ts && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add api/_lib/generationContract.ts api/_lib/openaiProvider.ts api/_lib/generationContract.test.ts api/generation/module.ts api/generation/module.test.ts package.json package-lock.json
git commit -m "feat: generate source-linked learning manifests"
```

### Task 3: Protected Studio preview and approval integration

**Files:**
- Create: `src/features/generation/generationClient.ts`
- Create: `src/features/generation/generationClient.test.ts`
- Create: `src/features/generation/GeneratedDraftPanel.tsx`
- Create: `src/features/generation/GeneratedDraftPanel.test.tsx`
- Modify: `src/features/studio/DemoPackInput.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the five prepared source inputs and an in-memory Studio token.
- Produces: a generated draft preview; it does not mutate the published bundle.
- Existing `approveUseCase` remains the only publication authority.

- [ ] **Step 1: Write failing client and component tests**

Cover token held only in component state, disabled generation before a valid pack,
loading/double-submit prevention, safe errors, cited draft preview, and fallback
to deterministic compilation.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- src/features/generation`  
Expected: FAIL because the generation UI does not exist.

- [ ] **Step 3: Implement the API client and preview panel**

Send the bearer token only in the request header. Render objectives, narration,
shot prompts, checkpoint, and clickable source IDs. Do not persist the token or
generated draft.

- [ ] **Step 4: Connect preview to the existing approval boundary**

Convert only a validated generated draft into the existing `UseCase` draft shape.
Any source edit invalidates approval through the existing fingerprint logic.

- [ ] **Step 5: Run component, integration, and build checks**

Run: `npm test && npm run build`  
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/generation src/features/studio/DemoPackInput.tsx src/App.tsx src/styles.css
git commit -m "feat: preview generated legal learning modules"
```

### Task 4: Exact approved narration

**Files:**
- Create: `api/generation/voiceover.ts`
- Create: `api/generation/voiceover.test.ts`
- Create: `src/features/generation/useNarration.ts`
- Create: `src/features/generation/useNarration.test.ts`
- Modify: `src/features/episode/EpisodePlayer.tsx`
- Modify: `src/features/episode/episode.css`

**Interfaces:**
- Consumes: approved narration, manifest fingerprint, voice, and Studio token.
- Produces: MP3 bytes tagged with the approved fingerprint.
- The player consumes cached audio and exposes an AI-generated-voice disclosure.

- [ ] **Step 1: Write failing handler tests**

Cover auth, maximum narration length, unsupported voice, missing fingerprint,
exact text forwarding, timeout, provider errors, and audio response headers.

- [ ] **Step 2: Implement TTS using `gpt-4o-mini-tts`**

Forward only the approved narration. Use a built-in voice and return MP3 bytes
with no-store headers. Never accept custom voice samples.

- [ ] **Step 3: Write failing player tests**

Cover narration start/pause, unavailable audio fallback, URL cleanup, chapter
synchronisation, and the visible AI-voice disclosure.

- [ ] **Step 4: Implement narration playback**

Keep text timing authoritative. If audio fails, stop audio and preserve the
existing caption/checkpoint journey.

- [ ] **Step 5: Run tests and build**

Run: `npm test && npm run build`  
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/generation/voiceover.ts api/generation/voiceover.test.ts src/features/generation/useNarration.ts src/features/generation/useNarration.test.ts src/features/episode/EpisodePlayer.tsx src/features/episode/episode.css
git commit -m "feat: add approved AI narration"
```

### Task 5: Cached real-video proof and deployment gate

**Files:**
- Create: `src/demo/assets/generated/cold-open.provenance.json`
- Add after generation: `src/demo/assets/generated/cold-open.mp4`
- Create: `src/features/episode/mediaAsset.ts`
- Create: `src/features/episode/mediaAsset.test.ts`
- Modify: `src/features/episode/EpisodePlayer.tsx`
- Modify: `e2e/lawflo.spec.ts`
- Modify: `docs/JUDGE-DEMO.md`
- Modify: `docs/DEPLOYMENT-CHECKLIST.md`

**Interfaces:**
- Consumes: an approved cached MP4 plus matching manifest fingerprint.
- Produces: generated-video playback with deterministic fallback on any mismatch.

- [ ] **Step 1: Write failing provenance and fallback tests**

Reject missing files, fingerprint mismatch, unknown provider, or unapproved media.
Assert that every rejection selects the deterministic story.

- [ ] **Step 2: Implement the media selector and player path**

Show a visible AI-generated-video label. Do not remove the interactive checkpoint
or source drawer when video is present.

- [ ] **Step 3: Generate one capped proof asset outside CI**

Use only approved synthetic shot prompts. Record provider, model, task ID,
generation date, duration, fingerprint, and consent status in provenance JSON.
If no suitable provider credential is available, keep this step blocked rather
than committing fabricated provenance.

- [ ] **Step 4: Extend the browser journey**

Test generated-media success, forced media failure, checkpoint blocking, rehearsal
continuation, and a full GitHub Pages fallback run.

- [ ] **Step 5: Verify and deploy**

Run: `npm test && npm run build && npm run test:e2e`  
Expected: unit, production build, and Chromium journeys pass. Then deploy a Vercel
preview, set the three environment variables, run the judge journey, and promote
the same verified build to production.

- [ ] **Step 6: Commit**

```bash
git add src/demo/assets/generated src/features/episode e2e/lawflo.spec.ts docs/JUDGE-DEMO.md docs/DEPLOYMENT-CHECKLIST.md
git commit -m "feat: ship cached generated episode proof"
```

## Coverage diagram

```text
PROTECTED CREATION                              PUBLIC LEARNING
POST /api/generation/module                     Open cached episode
├── [UNIT] method/content-length/content-type   ├── [E2E] generated media loads
├── [UNIT] secret absent/token wrong            ├── [E2E] media fails -> fallback
├── [UNIT] payload/schema invalid               ├── [E2E] checkpoint still blocks
├── [UNIT] provider refusal/timeout/429/500      └── [E2E] rehearsal and review finish
├── [EVAL] grounded manifest quality
└── [UNIT] unknown citation -> reject

POST /api/generation/voiceover
├── [UNIT] exact approved text only
├── [UNIT] voice/length/fingerprint invalid
├── [UNIT] provider failure
└── [COMPONENT] playback failure -> captions continue
```

## GSTACK REVIEW REPORT

| Runs | Status | Findings |
|---|---|---|
| Scope challenge | PASS | Kept Vite; rejected a Next.js migration; split protected creation from public playback. |
| Architecture | PASS AFTER CORRECTION | Added server-only secrets, canonical-pack scope, cached public media, exact approval fingerprint, and provider isolation. |
| Code quality | PASS | Shared pure guards and validators prevent handler duplication; provider payloads do not enter frontend types. |
| Tests | PASS AFTER CORRECTION | Added unit, contract, component, E2E, and explicit live-eval coverage for every new branch. |
| Performance | PASS | 100 KiB cap, provider timeouts, cached playback, and no public generation spend. |
| Outside voice | SKIPPED | Running inside Codex; nested Codex review would duplicate the same model at higher cost. An independent in-host adversarial pass found no remaining P0/P1 issue. |

**VERDICT:** ENGINEERING CLEARED. Implement task-by-task; do not start Task 5's paid render without a real provider credential and capped provider project.

NO UNRESOLVED DECISIONS
