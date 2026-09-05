# John: compiler, integration, and evidence

## Your branch and ownership

- Branch: `feat/system-integration`
- Own: `src/domain/`, `src/demo/`, `src/features/compiler/`,
  `src/features/events/`, `src/App.tsx`, `src/styles.css`, and integration tests.
- Do not implement a teammate's subsystem while their branch is active. Supply
  contracts, fixtures, and review feedback, then integrate their exported
  component.

## Mission

Make the four branches behave like one technically coherent product and make
the architecture visible to judges. Your job is more than page assembly: own
the compilation boundary, governed evidence model, truthful metrics, end-to-end
demo, conflict resolution, and deployment.

## Core: shared integration

1. Freeze and document the shared `UseCase`, event, and component contracts.
2. Provide one canonical, versioned synthetic use case and no duplicate domain
   data.
3. Integrate Studio → Episode → Rehearsal → Activation into a resumable journey.
4. Add an architecture/evidence view that shows the input, compiled artefacts,
   source lineage, approval, observed events, and production-only integrations.
5. Keep the main demo path under three minutes and build a failure-safe reset.

## Depth 1: workflow compiler and evidence graph (required)

- Expand the compiler into pure stages: normalize, validate, resolve source
  lineage, derive episode beats, derive rehearsal choices, derive activation
  card, and create a content-addressed manifest.
- Build an evidence graph linking each instruction and guardrail to sources,
  approver, source version, generated artefacts, and observed learner events.
- Reject unresolved references, cycles, duplicate IDs, invalid transitions,
  or compiled content whose approval became stale.
- Derive all dashboard counts from the event store. Separate “observed in this
  prototype” from the proposed governed production contract for first safe use,
  repeat use, elapsed time, and outcomes.
- Add integration tests that compile the canonical use case and exercise every
  subsystem callback without event duplication.

## Depth 2: resilience and demo operations (if ahead)

- Add schema versioning/migration for stored content and sessions.
- Add an offline/demo health panel and seed/reset controls with no fake observed
  events.
- Add automated end-to-end browser coverage for the golden path, unsafe path,
  refresh/resume, phone viewport, and keyboard navigation.
- Create a deployment checklist, judge script, 30-second fallback demo, and
  architecture slide using only claims the prototype can prove.

## Done condition

Core and Depth 1 are complete; every teammate branch passes review; the golden
and unsafe paths work from a clean browser; tests/build/e2e pass; the deployed
URL works signed out; and the evidence view makes the technical work inspectable.
