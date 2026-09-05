# LAWFLO Desktop Learning Platform Design

**Date:** 2026-09-05  
**Status:** Approved architecture, pending written-spec review  
**Primary device:** Desktop or laptop browser  
**Prototype mode:** Deterministic synthetic demonstration

## 1. Product decision

LAWFLO is a desktop-first platform that turns an approved, firm-specific legal
workflow into a source-linked learning episode, a safe matter simulation, an
independent challenge, an explainable review and a reusable point-of-work
guide.

The prototype has two connected experiences:

1. A **Legal Engineer Studio** for preparing and approving the learning module.
2. A **Lawyer Learning Workspace** for watching, practising and demonstrating
   the workflow.

The prototype accepts a prepared set of synthetic files and a contributor
portrait through real browser upload controls. It then compiles a deterministic
module from the repository's canonical `UseCase`. It does not claim to generate
arbitrary training content from any uploaded document.

The production vision may use document extraction and generative models, but
the hackathon demonstration proves the harder product mechanics: governance,
source lineage, interactive learning, safe practice, observable assessment and
change control.

## 2. Problem and value proposition

Legal engineers and early adopters often establish useful AI-assisted
workflows, but those workflows remain tribal knowledge. Ordinary training can
show what to do without establishing whether a lawyer can safely perform the
work on a matter.

LAWFLO turns one approved workflow into a governed learning loop:

```text
Firm materials + contributor portrait
                 |
                 v
       reviewable workflow draft
                 |
        human approval + sources
                 |
                 v
   episode -> guided rehearsal -> challenge
                 |                   |
                 +---------+---------+
                           v
              evidence-based review
                           |
                           v
                point-of-work guide
```

The differentiator is not video generation alone. LAWFLO joins content
generation to safe performance practice and shows why a learner passed or
failed using the exact observed actions and source-backed rules.

## 3. Actors

### 3.1 Legal engineer

The legal engineer:

- selects the target role and practice group;
- supplies the workflow, policy, sample matter and contributor portrait;
- reviews extracted workflow steps and source coverage;
- approves an exact content fingerprint and source version;
- publishes the generated learning module;
- inspects change impact when a policy or workflow changes.

### 3.2 Lawyer learner

The lawyer:

- watches the interactive peer-led episode;
- answers the in-episode safety checkpoint;
- completes the workflow once with guidance;
- completes a shorter changed-matter challenge independently;
- receives an evidence-linked review;
- opens the final point-of-work guide.

### 3.3 Responsible reviewer

The prototype represents the responsible reviewer as part of the workflow,
not as a third signed-in user. Submission for human approval is an observable
learner action. Production may connect that action to a firm's actual approval
system.

## 4. Demonstration content

The only complete prototype module is the synthetic workflow:

> From meeting to verified client-team update.

The learner must turn an authorised meeting transcript into reviewed minutes,
one bounded legal research request, verified research support and a final
client-team update.

The demo pack contains:

- a synthetic workflow/SOP document;
- a synthetic responsible-AI policy;
- a synthetic meeting transcript and matter brief;
- a synthetic contributor portrait;
- the expected reviewed output encoded in the canonical `UseCase`.

The application provides both file inputs and a **Load synthetic demo pack**
fallback. The fallback prevents a failed live demonstration while preserving
the visible end-to-end authoring process.

## 5. End-to-end journey

### 5.1 Studio intake

The landing view is the Legal Engineer Studio. It shows four required inputs:

1. Workflow instructions
2. Responsible-AI policy
3. Sample matter materials
4. Contributor portrait

The browser displays selected filenames, input categories and validation
status. Text-based demo documents may be read locally for preview. The
contributor image is previewed locally and is not uploaded to a server.

The primary action is **Prepare workflow draft**. It remains disabled until all
four input categories are present or the synthetic demo pack is loaded.

### 5.2 Deterministic generation

Preparation runs visible compiler stages:

1. Validate inputs
2. Resolve workflow steps
3. Link guardrails to sources
4. Build episode timeline
5. Build guided and challenge scenarios
6. Build assessment rubric
7. Build point-of-work guide

The stage display represents real deterministic functions, not timed theatre.
Each stage must either produce its output or return a specific error.

The draft view exposes:

- target role and practice group;
- work trigger and expected outcome;
- ordered tools and workflow steps;
- guardrails and safe alternatives;
- source coverage per instruction;
- generated artefact manifest;
- current approval status.

The legal engineer approves the exact draft. Any material edit or source-version
change invalidates the approval and prevents the module from opening.

### 5.3 Generated module catalogue

After approval, the application reveals a polished module page rather than
jumping into a developer dashboard. It includes:

- contributor portrait and role;
- module title, practice group and intended learner;
- episode length and chapter count;
- guided rehearsal and challenge labels;
- learning objectives;
- source and approval status;
- **Begin episode** as the primary learner action.

The catalogue framing should make LAWFLO feel like a platform while showing
only one complete module. Additional cards may be labelled as concept previews,
never as working content.

### 5.4 Interactive episode

The episode is a deterministic motion-comic player generated from the approved
workflow. It includes:

- contributor-led visual framing;
- chapter titles and progress;
- captions enabled by default;
- a searchable transcript and source rail;
- playback, pause, replay and chapter navigation;
- one confidentiality checkpoint that interrupts playback;
- a direct handoff into practice.

The learner cannot seek beyond an unanswered checkpoint. A wrong answer shows
the relevant policy explanation and allows another attempt. Episode completion
does not itself count as workflow competence.

### 5.5 Guided matter rehearsal

The guided rehearsal opens a single LAWFLO matter workspace. It resembles real
desktop legal work without copying or claiming integration with any commercial
application.

The workspace contains:

- **Matter files:** meeting transcript, matter brief and policy extracts;
- **Minutes workspace:** generated draft minutes with one seeded factual error;
- **Authorised AI workbench:** bounded prompt composer and deterministic output;
- **Source viewer:** returned authorities with open, inspect, accept and reject
  actions;
- **Client update editor:** editable final communication;
- **Workflow rail:** current objective, completed actions and optional hints;
- **Submission control:** send the work for simulated responsible-lawyer review.

The learner completes these meaningful actions:

1. Open the authorised transcript.
2. Generate draft minutes in the authorised workspace.
3. Compare the draft against the transcript and repair the seeded error.
4. Create a minimum-necessary bounded research request.
5. Avoid or recover from the unsafe full-transcript/public-tool action.
6. Open and verify each material source.
7. Revise the client-team update using verified information.
8. Submit the work for human review.

Guided mode provides contextual hints and immediate explanations. The unsafe
action is allowed as an attempt inside the sandbox, recorded, quarantined and
explained. No information leaves the browser.

### 5.6 Independent challenge

After guided rehearsal, the learner receives a shorter variation of the same
approved workflow. The names, dates, assignments and research issue differ,
but the rules and required actions remain source-equivalent.

Challenge mode:

- hides the workflow hints;
- does not reveal correctness after ordinary actions;
- records the complete decision trace;
- quarantines only actions that would represent external disclosure or sending;
- allows submission when the learner believes the work is complete.

The challenge prevents the review from measuring only memory of the immediately
preceding guided screens.

### 5.7 Evidence-based review

The review engine assesses both process and work product.

**Process evidence** includes:

- which tools and files were opened;
- the order of required actions;
- whether the unsafe route was attempted;
- whether the prompt was bounded and minimised;
- which sources were opened, accepted or rejected;
- whether human review was requested.

**Work-product evidence** includes:

- whether the seeded factual error was corrected;
- whether required action owners and deadlines remain present;
- whether unsupported research propositions were removed;
- whether the final update contains the expected safe sections.

The assessment returns one result per dimension:

| Dimension | Required evidence | Failure example |
|---|---|---|
| Authorised tool | Approved workbench selected | Public tool selected |
| Data minimisation | Bounded prompt contains only necessary facts | Full transcript used |
| Factual verification | Seeded error corrected against transcript | Incorrect deadline remains |
| Source verification | Every material source opened and resolved | Citation accepted unopened |
| Human responsibility | Work submitted for reviewer approval | Update treated as final AI output |
| Output completeness | Required update sections are present | Action owner omitted |

There is no opaque AI-generated percentage. Overall competence requires all
safety-critical dimensions to pass. The result explains:

> Observed action -> rule applied -> source excerpt -> required repair

The learner may retry only failed portions or replay the complete challenge.
The system may generate friendly summary wording, but the pass/fail result and
evidence remain deterministic.

### 5.8 Point-of-work guide

Passing the challenge unlocks a compact activation card containing:

- when to use the workflow;
- approved tool sequence;
- bounded-prompt template;
- mandatory verification checks;
- human-review requirement;
- links to the governing sources;
- workflow and policy version.

This proves how the training transfers into work without claiming a live
integration. Production may surface the same card inside authorised firm tools.

## 6. System architecture

The canonical `UseCase` remains the authoritative content object. Five isolated
subsystems consume it:

```text
DemoPackLoader
      |
      v
GovernedCompiler -----> Approval + artefact manifest
      |                              |
      +---------------+--------------+
                      v
                JourneyController
          +-----------+-----------+
          |           |           |
          v           v           v
    EpisodeEngine  MatterSim   ReviewEngine
          |           |           |
          +-----------+-----------+
                      v
              ScopedEventStore
                      |
                      v
               EvidenceGraph
```

### 6.1 Demo pack loader

- validates required input categories;
- previews local text and portrait files;
- maps the prepared demo pack to the canonical `UseCase`;
- rejects unsupported or incomplete input without silently substituting data.

### 6.2 Governed compiler

- validates identifiers and source references;
- derives episode cues, simulation tasks, challenge variation, rubric and
  activation card;
- creates a content-addressed manifest;
- refuses compilation if source links are unresolved or approval is stale.

### 6.3 Journey controller

- enforces Studio -> Module -> Episode -> Guided -> Challenge -> Review ->
  Activation;
- permits revisiting completed stages;
- rejects stage skipping;
- persists progress against use-case ID, source version and approval
  fingerprint.

### 6.4 Episode engine

- owns timeline state, checkpoint gates, transcript and resume behavior;
- emits only observed playback and checkpoint actions;
- derives every material cue from source-linked workflow content.

### 6.5 Matter simulator

- owns the simulated files, editors, tools, objectives and decision trace;
- uses the same reducer for guided and challenge modes with different feedback
  policies;
- separates user-visible workspace state from immutable expected evidence.

### 6.6 Review engine

- evaluates explicit evidence predicates;
- returns dimension-level results and source-linked explanations;
- never infers an action that was not recorded;
- treats a superficially correct final document as insufficient when required
  verification actions were skipped.

### 6.7 Event store and evidence graph

- scopes events to use-case ID, source version, approval fingerprint and bundle;
- deduplicates completion events;
- connects sources, instructions, generated artefacts and learner actions;
- never seeds fake adoption, time-saving or learner-outcome data.

## 7. Data and state boundaries

All prototype content remains in the browser. No uploaded file, portrait,
prompt or simulated matter data is transmitted externally.

Persistent progress stores only serialisable demo state. File object URLs are
session-local and are revoked on reset or replacement. Saved sessions are
discarded when any of these values differ:

- `useCase.id`
- `sourceVersion`
- approval fingerprint
- simulation schema version

The Reset control clears the journey, playback, simulation, challenge and event
stores before returning to Studio.

## 8. Failure handling

| Failure | Required behavior |
|---|---|
| Missing demo input | Identify the missing category and keep preparation disabled |
| Unsupported file | Preserve other valid selections and explain accepted formats |
| Failed local file read | Show a recoverable error and offer the synthetic demo pack |
| Unresolved source | Block approval and identify the affected instruction |
| Material edit after approval | Mark the bundle stale and require reapproval |
| Stale saved session | Discard it and start the current module cleanly |
| Unavailable local storage | Continue the journey without resume support |
| Clipboard unavailable | Keep the prompt visible and selectable |
| Portrait unavailable | Use a neutral generated monogram, not a broken image |
| Unsafe simulation action | Record and quarantine it; never transmit or silently pass |
| Incomplete challenge submission | Permit submission, then fail the missing dimensions visibly |

The demo must never require a network call after the static site loads.

## 9. Visual and interaction direction

The interface uses the permitted reference mechanics while translating them
into legal-workflow training:

- editorial typography and warm neutral surfaces;
- restrained coral accents for current state and primary action;
- cinematic episode stage with chapter framing;
- polished module cards and visible learning-path progress;
- checkpoints embedded inside playback;
- dense but calm desktop workbench panels;
- assessment feedback that reads like reviewed work, not a game leaderboard.

The learner workspace targets 1280-1440px laptop screens and remains usable at
1024px. It is not designed as a phone workflow. Narrow widths show a message
that learning modules require a laptop or desktop, while Studio metadata and
the final guide may remain readable.

Runtime source, component names, selectors, tests, analytics, comments,
user-facing copy and commit messages use only LAWFLO and legal-domain names.

## 10. Testing strategy

### 10.1 Pure-logic tests

- demo-pack validation and canonical mapping;
- compiler source resolution and approval invalidation;
- journey transition matrix;
- episode seek and checkpoint enforcement;
- generated guided/challenge task completeness;
- matter-simulator action transitions;
- rubric predicate truth tables;
- event deduplication and evidence scoping;
- stale-session rejection.

### 10.2 Component tests

- real file selection and synthetic-pack fallback;
- prepare, approve and publish controls;
- episode playback and checkpoint recovery;
- guided unsafe attempt and safe repair;
- challenge submission with passing and failing outputs;
- dimension-level debrief evidence;
- activation-card unlock;
- reset and resume behavior;
- keyboard names, focus movement and status announcements.

### 10.3 Browser tests

The end-to-end suite covers:

1. synthetic pack -> approval -> episode -> guided -> challenge -> review ->
   activation;
2. unsafe public-tool attempt and recovery;
3. challenge failure caused by skipped source verification;
4. refresh and resume;
5. source-version change and reapproval;
6. reset from a partially completed session;
7. signed-out deployment at 1440x900 and 1024x768;
8. keyboard-only completion of the primary controls.

Tests and build must pass without API credentials.

## 11. Judge demonstration

The shipped product contains the complete journey, while the live demonstration
uses a four-minute fast path:

1. Load the synthetic demo pack and show the four inputs.
2. Prepare, inspect source coverage and approve the module.
3. Start the generated episode and answer its checkpoint.
4. Enter guided rehearsal and make the unsafe public-tool attempt.
5. Recover, correct the seeded error and verify one source.
6. Switch to the independent challenge's final submission state.
7. Show the evidence-linked review and point-of-work guide.
8. Open the evidence graph during technical questions.

The presenter may use explicit demo navigation to compress waiting and repeated
steps, but the application must also support completing the journey normally.

## 12. Non-goals for the prototype

- arbitrary document-to-course generation;
- server-side file storage;
- authentication or role management;
- face cloning, lip-sync or voice cloning;
- pixel-level replicas of third-party applications;
- live Teams, Outlook, document-management or legal-AI integration;
- subjective model-based grading;
- production process mining;
- fabricated adoption, efficiency or outcome metrics;
- phone-based completion of the lawyer simulation.

## 13. Completion criteria

The prototype is complete only when:

- the legal engineer can load the demo inputs, inspect, approve and publish;
- one approved bundle generates every learner artefact;
- the learner can complete the episode, guided rehearsal and changed-matter
  challenge on a desktop browser;
- a correct-looking output cannot pass when required process evidence is
  missing;
- every safety deduction resolves to a current source excerpt;
- source or material changes invalidate approval and saved progress;
- the deployed site completes without credentials or network generation;
- the golden, unsafe, failing-review, resume and reset browser paths pass;
- a cold tester can finish without verbal repair from the team.

