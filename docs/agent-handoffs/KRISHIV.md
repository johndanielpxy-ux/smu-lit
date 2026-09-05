# Krishiv: safe learner rehearsal

## Your branch and ownership

- Branch: `feat/learner-flow`
- Own: `src/features/learner-flow/`
- Do not edit the app shell, shared contract, demo fixture, event store, or
  another teammate's folder.

## Mission

Build the interactive practice that converts passive learning into a safe,
repeatable work habit. It must feel like using the workflow while preventing a
confidentiality mistake. This is a deterministic simulation, not a real legal
AI system.

## Required component

Use an integration shape like:

```ts
interface LearnerFlowProps {
  useCase: UseCase;
  onEvent: (eventType: MatterShiftEventType) => void;
  onComplete: () => void;
}
```

Import types from `src/domain/mattershift.ts` and render from the passed
`useCase`.

## Required state flow

Implement an explicit state machine or reducer with this path:

```text
ready
→ meeting_summary
→ choose_ai_tool
→ unsafe_attempt_blocked
→ source_explanation
→ retry
→ approved
→ human_review
→ rehearsal_passed
→ activation_opened
```

The learner receives a fictional meeting summary and chooses what to do next.
The tempting unsafe choice is pasting the full confidential transcript into a
public AI tool. Block it before any simulated transfer. Explain the relevant
synthetic policy, then allow a retry. The safe path uses an authorised tool,
minimum necessary information, one bounded question, opened source checks, and
human review before sharing.

End with a point-of-work action card containing a copyable prompt template,
the approved tool sequence, a short safety checklist, and “Open activation
card”. It may simulate opening the card; do not claim a real Teams, Outlook, or
firm-system integration.

Emit `source_opened` on a genuine source interaction, `rehearsal_passed` only
after the complete safe path, and `activation_opened` only after the user opens
the action card. Do not invent first-use, repeat-use, time-saved, or adoption
events.

## Depth ladder

### Core: safe branching rehearsal

Build every state, the blocked unsafe branch, source explanation, successful
retry, human review, completion, and activation card described above.

### Depth 1: auditable simulation engine (required)

- Implement the rehearsal as a typed reducer/state machine with guarded
  transitions. React views may request transitions but cannot mutate state
  directly.
- Define choice data separately from UI, including consequence, source IDs,
  risk weight, whether it is blocked, and the safe repair path.
- Build a deterministic assessment engine that scores source checking,
  minimisation, tool choice, bounded prompting, and human review. Explain the
  score from observed decisions instead of a magic total.
- Keep an in-session decision trace and render a review screen mapping each
  choice to the exact synthetic policy excerpt.
- Persist a versioned session locally. Resume only when `useCase.id` and
  `sourceVersion` still match; otherwise explain why the simulation restarted.

### Depth 2: testable scenario variation (if ahead)

- Create a scenario adapter that can run the same engine against at least two
  synthetic variants without changing the reducer.
- Add undo/restart semantics that never leave duplicate observed events.
- Add tests using generated action sequences to prove no route can reach
  `rehearsal_passed` without source verification and human review.

## Usability

Keep one obvious action per state, provide Back/Restart where safe, preserve
progress, and make the blocked choice educational rather than punitive. It
must work by keyboard and on a phone.

## Tests and done condition

Add unit tests for transition guards, scoring, decision trace, versioned resume,
and event deduplication, plus component tests for the blocked unsafe choice,
policy explanation, successful retry, human review requirement, rehearsal
completion, activation, and reset. You are done when Core and Depth 1 cannot
skip safety steps, events match real actions, and both required project
commands pass.

Send John the handoff format from `AGENTS.md`.
