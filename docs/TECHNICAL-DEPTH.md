# LAWFLO technical architecture

LAWFLO is a governed learning compiler rather than a set of disconnected screens.

```text
workflow + playbook + template + example matter
                         │
                         ▼
              validated source bundle
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
  typed script and storyboard   human approval
             │                       │
             ├──── interactive episode
             ├──── guided rehearsal
             └──── source-linked workflow guide
                         │
                         ▼
           observed events + evidence graph
```

## 1. Source and generation boundary

`src/features/studio/` validates the five required inputs and separates uploaded object URLs from bundled release assets. `api/generation/module.ts` exposes a protected OpenAI generation route whose output must pass the same typed contract as the deterministic prepared demo. `server/videoGeneration.ts` provides protected Runway job creation, status and downloaded-media routes.

The public three-minute path uses a reviewed source pack and durable generated media. It never depends on a live provider queue during judging.

## 2. Approval and compilation

`src/domain/approval.ts` fingerprints the full material state of a workflow. `src/features/compiler/` refuses to compile an unapproved or stale source version and creates one versioned bundle for the episode, rehearsal, coaching rules and guide. A source or rule change invalidates the prior approval and identifies downstream learning objects that need review.

## 3. Episode engine

`src/features/episode/` combines four Runway-generated chapters, four narration tracks, deterministic legal evidence overlays and a checkpoint-gated reducer. The exact contract value, clause text and routing rule are rendered by the application, not trusted to a video model. The timeline cannot advance past the checkpoint until the learner makes and, if needed, repairs the decision.

## 4. Guided legal-AI rehearsal

`src/features/rehearsal/` is a guarded state machine presented as a realistic contract-review workspace. The learner opens the matter, runs the authorised AI, inspects its supporting clause, compares the approved template, applies the playbook rule, selects a route and reviews the audit record. Unsafe or incomplete actions produce focused recovery rather than a terminal score.

## 5. Evidence, persistence and coaching

The event store accepts only a closed vocabulary of observable actions and writes idempotent, source-versioned events. `src/features/evidence/` resolves those events back to the approved source, instruction and learning artefact. Journey, episode and rehearsal persistence are scoped by bundle, source, contract and approval fingerprints so older progress cannot silently resume against changed rules.

The coaching engine derives the final review from completed rehearsal behaviour. It does not invent downstream adoption, matter outcomes or first-safe-use analytics.

## 6. Deployment and verification

Render runs the Vite build behind a small Node server that serves the single-page application and generation endpoints. Credentials remain server-side. Unit and integration tests cover the compiler, approval, provider contracts, reducers, storage, safety boundaries and views; Playwright covers the complete creator-to-review journey, compact desktop and phone-to-desktop handoff.

Run all release gates with:

```bash
npm test
npm run build
npm run test:e2e
```
