# MatterShift agent rules

You are contributing to a shared hackathon repository. Read this file, the
README, and only your assigned file in `docs/agent-handoffs/` before editing.

## Product north star

MatterShift helps a law firm's legal engineers turn one tested, approved AI
workflow into a source-verified peer story, a safe rehearsal, and a
point-of-work action.

This is a synthetic prototype. It is not connected to R&T, Harvey, Microsoft,
or any client system.

## Work boundaries

1. Work only on your assigned branch and owned paths.
2. Do not edit `src/domain/mattershift.ts`, `src/demo/demoUseCase.ts`, the event
   store, shared styles, or another teammate's folder unless John asks you to.
   Keep feature-specific CSS inside your owned feature folder.
3. Import the shared `UseCase` and `MatterShiftEvent` types. Do not make a
   second data model or a private copy of the demo workflow.
4. Keep all names, policies, scenarios, and analytics synthetic.
5. Never commit API keys, confidential documents, or real client data.
6. Do not claim that an action happened unless the running prototype observed
   it. The allowed event types are defined in `src/domain/mattershift.ts`.
7. Preserve the current React + TypeScript + Vite stack. Do not add a backend,
   database, authentication, or live AI dependency for this demo.
8. Keep the demo path usable on a laptop and easy to understand in under three
   minutes.

## Technical depth floor

A branch is not complete merely because a page renders. Every subsystem must
contain:

- a typed integration contract;
- non-trivial pure logic (compiler, reducer, timeline, validation, scoring, or
  provenance computation) separated from its React views;
- real interaction state rather than decorative buttons;
- automated tests for happy, unsafe, and boundary paths;
- an accessible phone layout and a documented integration story.

Complete the **Core** and **Depth 1** sections in your handoff. If those finish
early, continue into **Depth 2**. Do not add random visual features to fill
time; deepen the mechanism that the judges can inspect and demo.

## Required checks

Before handing work to John, run:

```bash
npm test
npm run build
```

If you add interactive behavior, test the complete happy path and at least one
unsafe or error path. Report exactly what you tested and any remaining risk.

## Using gstack in Antigravity

Run `bash scripts/link-gstack-antigravity.sh` once after installing gstack.
Useful project skills are then available under `.agents/skills/`. Use `qa` for
the live browser flow, `review` before handoff, and `design-review` for visual
work when those skills appear in your client.

If a skill is missing or fails to load, do not stop. Follow the assigned
handoff, run the two required checks, and give John a short manual test report.

## Handoff format

Send John:

- branch name and latest commit;
- files changed;
- tests and build result;
- a 3-step demo path;
- known gaps or integration assumptions.
