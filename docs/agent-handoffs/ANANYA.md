# Ananya: legal engineer studio

## Your branch and ownership

- Branch: `feat/legal-engineer-studio`
- Own: `src/features/legal-engineer-studio/` and `src/content/`
- Do not edit the app shell, shared contract, demo fixture, event store, or
  another teammate's folder.

## Mission

Build the small editor a legal engineer uses to turn a tested practice into an
approved LAWFLO learning object. This is a controlled form, not a general
AI chatbot and not a backend.

## Required component

Build an integration-friendly component using the shared contract:

```ts
interface LegalEngineerStudioProps {
  initialUseCase: UseCase;
  onCompile: (useCase: UseCase) => void;
  onEvent: (eventType: MatterShiftEventType) => void;
}
```

Import types and validation from `src/domain/mattershift.ts`. Use the passed
data as the starting state. Do not make a second private data model.

## Required experience

Use a clear three-stage flow:

1. **Capture**: contributor, role, audience, trigger, problem, approved tools,
   workflow steps, expected outcome, and explicit consent.
2. **Ground**: every step and guardrail must display at least one source chip.
   Provide the five existing synthetic policy principles: authorised systems,
   confidentiality/data minimisation, purpose limitation, source verification,
   and human responsibility.
3. **Approve and compile**: show validation errors before approval, require a
   named human approver, and produce a readable compilation summary.

An unsafe submission such as “paste the complete transcript into a public AI”
must be blocked with a useful safe alternative. Never silently label draft
content approved.

Emit `source_opened` only when a user opens a source, `human_approved` only
after a named approval action, and `use_case_compiled` only after valid content
is compiled.

## Depth ladder

### Core: governed editor

Build the complete capture, grounding, approval, and compilation flow described
above, including the unsafe-submission blocker.

### Depth 1: provenance compiler (required)

- Use a reducer for draft, validation, review, approval, and compiled states.
- Build a pure source-coverage engine that returns every ungrounded step and
  guardrail, stale source version, high-risk step, and missing human review.
- Render an inspectable provenance matrix: rows are workflow statements;
  columns show source, version, risk, human-review requirement, and status.
- Produce a deterministic compiled bundle with episode outline, rehearsal
  scenario, activation-card data, and a manifest containing source version and
  approver. The bundle can remain in memory but must be downloadable as JSON.
- Store versioned local drafts and show a meaningful diff between the current
  draft and last approved snapshot. Changing a material instruction after
  approval must return the use case to draft/review status.

### Depth 2: governance hardening (if ahead)

- Add import validation for a compiled JSON bundle with useful errors.
- Add a rule-explanation panel showing which validation rule blocked compile
  and the precise safe repair.
- Add tests for tampered imports, duplicate source IDs, stale approval after an
  edit, deterministic compilation, and local-draft migration.

## Keep the scope safe

- All content is local, synthetic, and deterministic.
- No authentication, database, API key, document upload, or live AI call.
- Do not invent R&T policy. Use “Meridian & Rowe Synthetic Responsible AI
  Policy” and make the fictional status visible.
- A source chip must open the exact title, version, and excerpt supporting the
  instruction.

## Tests and done condition

Add unit tests for the reducer, coverage engine, version invalidation, and
compiler, plus component tests for missing consent, missing sources, approval
without an approver, the unsafe transcript guardrail, download, and successful
compilation. You are done when Core and Depth 1 pass, callbacks are truthful,
and both required project commands pass.

Send John the handoff format from `AGENTS.md`.
