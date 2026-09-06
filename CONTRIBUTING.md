# Contributing to LAWFLO

## Local setup

```bash
git clone https://github.com/johndanielpxy-ux/smu-lit.git
cd smu-lit
npm ci
npm run dev
```

Create a focused branch from the current `main` branch. Keep each commit limited to one coherent product or documentation change.

## Product rules

- Use only synthetic or properly authorised source material and portraits.
- Keep API credentials server-side. Never add secrets to `VITE_*` variables, fixtures, screenshots or documentation.
- Import the canonical types from `src/domain/mattershift.ts` and the synthetic use case from `src/demo/demoUseCase.ts`; do not create competing data models.
- Record only actions the running prototype actually observed.
- Every material legal instruction must resolve to an approved source reference.
- Preserve the distinction between AI-generated drafts and human-approved decisions.
- Keep the primary demonstration understandable on a laptop in under three minutes.

## Before opening a pull request

```bash
npm test
npm run build
npm run test:e2e
```

Report the exact checks run, any failure fixed and any remaining operational risk. Generated media should be reviewed visually before it is committed.
