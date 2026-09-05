# Technical depth plan

LAWFLO is not four screens. It is a small governed compilation system:

```text
Approved workflow + sources + guardrails
                  │
                  ▼
        deterministic compiler
                  │
      ┌───────────┼────────────┐
      ▼           ▼            ▼
 peer episode  rehearsal   activation card
      │           │            │
      └───────────┼────────────┘
                  ▼
       truthful observed events
                  │
                  ▼
        evidence/provenance graph
```

## Four real engineering systems

| Owner | System | Technical mechanism | Judge-visible proof |
|---|---|---|---|
| John | Compiler + evidence graph | staged pure compiler, source lineage, content manifest, event-derived analytics | inspect one instruction from source to artefact to observed event |
| Su-Ann | Episode engine | typed media timeline, checkpoint-gated reducer, transcript/source derivation, resume | seek and resume without bypassing the safety checkpoint |
| Ananya | Governance studio | draft/review reducer, provenance coverage, approval invalidation, compiled JSON bundle | edit an approved instruction and watch approval/source status invalidate |
| Krishiv | Simulation engine | guarded state machine, data-driven scenarios, explainable scoring, decision trace | attempt unsafe action, see it blocked, retry, and inspect evidence |

## Integration contract

All systems consume the same `UseCase`. Generated objects retain `useCase.id`
and `sourceVersion`. Any persisted state is namespaced by both fields. All
callbacks use the shared event vocabulary and fire only after genuine user
actions.

The integration shell owns navigation and the central event store. Subsystems
own their internal state and export typed components plus pure logic that can
be tested without rendering React.

## Depth policy

Core + Depth 1 in every handoff is the target, not a stretch. Depth 2 is the
queue when an agent finishes early. A teammate should not respond to spare time
by adding unrelated cards, animations, or a live API. They should strengthen
their reducer/compiler, provenance, persistence, accessibility, or tests.

## Merge order

1. Freeze shared contracts and canonical fixture.
2. Develop the three subsystems independently against those contracts.
3. Merge the legal engineer studio first because it creates the compiled input.
4. Merge episode and rehearsal in either order.
5. Integrate activation and evidence views, then run golden/unsafe end-to-end
   paths from a clean browser.

No branch is accepted solely from screenshots. It must pass its logic tests,
component tests, the repository test command, and the production build.
