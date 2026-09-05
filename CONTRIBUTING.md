# Contributing with Antigravity

You do not need to design the architecture. The shared contract and demo data
already exist. Your job is to complete one bounded feature and hand John a
clean branch.

## 1. Get the project

```bash
git clone https://github.com/choosuann/smu-lit-.git
cd smu-lit-
npm install
bash scripts/link-gstack-antigravity.sh
```

The linker is optional. If it cannot find gstack, continue with the written
handoff and the normal test/build commands.

## 2. Create your branch

```bash
git fetch origin
git switch main
git pull --ff-only
```

Then run exactly one assigned command:

```bash
# Su-Ann
git switch -c feat/cinematic-episode

# Ananya
git switch -c feat/legal-engineer-studio

# Krishiv
git switch -c feat/learner-flow
```

## 3. Start Antigravity

Open the repository root in Antigravity. Start the agent with:

> Read AGENTS.md and docs/agent-handoffs/NAME.md. Implement only that handoff in
> the owned paths. Reuse the shared types and demoUseCase. Complete Core and
> Depth 1, then proceed to Depth 2 if time remains. Run npm test and npm run
> build before stopping. Do not edit shared files; report blockers instead.

Replace `NAME.md` with `SU-ANN.md`, `ANANYA.md`, or `KRISHIV.md`.

## 4. Check and share the work

```bash
npm test
npm run build
git status --short
git add your-owned-paths
git commit -m "feat: add your feature name"
git push -u origin your-branch-name
```

Replace `your-owned-paths` with every path listed at the top of your handoff
(for example, Su-Ann includes both `src/features/episode` and `public/episode`).
Add only your owned feature folders plus their tests/assets. Send John the
branch, commit, changed files, demo steps, and remaining gaps. John owns
integration into the application shell.

## When stuck

Copy the exact error and the command that caused it into Antigravity. Ask it to
diagnose without changing shared files. If the problem is in a shared contract
or application shell, stop and send the evidence to John instead of working
around the contract.
