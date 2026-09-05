# MatterShift

MatterShift helps a law firm's legal engineers turn tested and approved AI workflows into cinematic peer stories, safe rehearsals and point-of-work action cards.

> MatterShift compiles one approved internal workflow into a source-verified peer story, a safe rehearsal and a point-of-work action.

This repository contains a synthetic hackathon demonstration. It is not connected to R&T, Harvey, Microsoft or any client system.

## Run locally

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run build
```

## Shared contract

The contract checkpoint is commit `e3f115e` on `feat/core-integration`.

All feature branches import:

- `UseCase`, `MatterShiftEvent` and related types from `src/domain/mattershift.ts`.
- The canonical synthetic workflow from `src/demo/demoUseCase.ts`.
- Event helpers from `src/features/events/eventStore.ts` after the second core commit lands.

Do not rename shared types or create private alternative demo data. Coordinate contract changes with John.

## Team branches

| Owner | Branch | Owned feature path |
|---|---|---|
| John | `feat/core-integration` | domain, demo fixture, compiler, events and application shell |
| Su-Ann | `feat/cinematic-episode` | `src/features/episode/` and episode assets |
| Ananya | `feat/legal-engineer-studio` | `src/features/legal-engineer-studio/` and synthetic content |
| Krishiv | `feat/learner-flow` | `src/features/learner-flow/` |

Because the repository began empty, teammates should base their feature branches on the contract branch:

```bash
git fetch origin
git switch -c feat/your-branch origin/feat/core-integration
```

Replace `feat/your-branch` with the assigned branch above.

## Prototype truth boundary

The event ledger may display only actions the prototype actually observes:

- `use_case_compiled`
- `source_opened`
- `human_approved`
- `episode_started`
- `checkpoint_answered`
- `rehearsal_passed`
- `activation_opened`

First safe use, repeat use and operational outcomes require governed production integrations. Do not seed those values and present them as observed evidence.

## Safety

- Use synthetic policies, fictional people and simulated interfaces.
- Do not commit secrets, real client documents or confidential firm material.
- Every material instruction must resolve to a current source reference.
- A workflow cannot be presented as approved without a named human approver.
