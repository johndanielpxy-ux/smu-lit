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

## Join the team

Antigravity contributors should start with [CONTRIBUTING.md](CONTRIBUTING.md),
then read [AGENTS.md](AGENTS.md), the [technical depth plan](docs/TECHNICAL-DEPTH.md),
and their one assigned handoff in [`docs/agent-handoffs/`](docs/agent-handoffs/).
Run Antigravity from the repository root so it can discover the workspace
instructions.

If gstack is installed, expose the relevant skills to Antigravity with:

```bash
bash scripts/link-gstack-antigravity.sh
```

The handoff documents and the `npm test` / `npm run build` gates remain the
fallback if a skill is unavailable.

## Shared contract

The contract checkpoint is commit `e3f115e`, now included on `main`.

All feature branches import:

- `UseCase`, `MatterShiftEvent` and related types from `src/domain/mattershift.ts`.
- The canonical synthetic workflow from `src/demo/demoUseCase.ts`.
- Event helpers from `src/features/events/eventStore.ts`.

Do not rename shared types or create private alternative demo data. Coordinate contract changes with John.

## Team branches

| Owner | Branch | Owned feature path |
|---|---|---|
| John | `feat/system-integration` | domain, compiler, event analytics and application shell |
| Su-Ann | `feat/cinematic-episode` | `src/features/episode/` and episode assets |
| Ananya | `feat/legal-engineer-studio` | `src/features/legal-engineer-studio/` and synthetic content |
| Krishiv | `feat/learner-flow` | `src/features/learner-flow/` |

Teammates should base their feature branches on `main`:

```bash
git fetch origin
git switch main
git pull --ff-only
git switch -c feat/your-branch
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
