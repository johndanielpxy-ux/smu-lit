# LAWFLO agent rules

Read this file and the README before editing.

## Product north star

LAWFLO helps a law firm's legal AI pioneers transfer approved, firm-specific workflows to other lawyers through interactive episodes, guided rehearsals and source-linked guidance.

This repository is a synthetic prototype. It is not connected to R&T, Harvey, Microsoft or a client system.

## Guardrails

1. Keep names, policies, scenarios, contracts and analytics synthetic.
2. Never commit API keys, confidential documents or real client data.
3. Keep OpenAI, Runway and studio credentials on the server. Never expose them through `VITE_*` variables.
4. Reuse the canonical domain types in `src/domain/mattershift.ts` and the synthetic workflow in `src/demo/demoUseCase.ts`.
5. Record only actions observed by the running prototype. Do not seed adoption or outcome metrics and describe them as measured.
6. Every material training instruction must resolve to a current source reference.
7. Preserve the boundary between an AI-generated draft and a human-approved legal decision.
8. Keep the prepared demo path usable on a laptop and understandable in under three minutes.

## Engineering floor

Product behaviour belongs in typed domain logic, reducers, validation or selectors rather than JSX event handlers alone. Cover happy, unsafe and boundary paths with automated tests. Keep keyboard access, visible focus, reduced motion and the desktop rehearsal handoff working.

## Required checks

```bash
npm test
npm run build
npm run test:e2e
```

Report the exact checks run, failures corrected and remaining operational risks. Do not claim the release is ready without evidence from these gates.
