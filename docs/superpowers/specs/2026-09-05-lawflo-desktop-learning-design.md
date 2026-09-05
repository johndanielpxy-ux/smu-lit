# LAWFLO Desktop Learning Platform Design

**Date:** 2026-09-05  
**Status:** Approved architecture, pending written-spec review  
**Primary device:** Desktop or laptop browser  
**Prototype mode:** Deterministic synthetic demonstration

## 1. Product decision

LAWFLO is a desktop-first platform that turns an approved, firm-specific legal
AI workflow into a source-linked learning episode, a progressively guided
matter rehearsal, a constructive learning review and a reusable point-of-work
guide.

The prototype has two connected experiences:

1. A **Legal Engineer Studio** for preparing and approving the learning module.
2. A **Learner Workspace** for watching, practising and safely applying the
   legal AI workflow.

The prototype accepts a prepared set of synthetic files and a contributor
portrait through real browser upload controls. It then compiles a deterministic
module from the repository's canonical `UseCase`. It does not claim to generate
arbitrary training content from any uploaded document.

The canonical module must teach a workflow in which AI performs a substantive
legal task, such as extracting contract terms, comparing clauses or proposing a
risk classification. Generic form routing or rules automation alone does not
qualify. Human verification, legal-playbook constraints and escalation remain
part of every trained workflow.

The production vision may use live document extraction and generative models,
but the hackathon demonstration uses precomputed AI analysis so the learning
journey remains deterministic. It proves governance, source lineage,
interactive learning, safe practice, observable coaching and change control
without pretending that arbitrary documents were analysed live.

## 2. Problem and value proposition

Legal engineers and early adopters often establish useful legal AI workflows,
but those workflows remain tribal knowledge. Ordinary training can show which
buttons to press without teaching a lawyer, legal-operations professional or
business user when to verify AI output, apply the legal playbook or escalate to
human counsel.

LAWFLO turns one approved workflow into a governed learning loop:

```text
Legal AI workflow + playbook + contributor portrait
                 |
                 v
       reviewable workflow draft
                 |
        human approval + sources
                 |
                 v
       episode -> progressively guided rehearsal
                              |
                              v
                  evidence-based learning review
                              |
                    +---------+---------+
                    v                   v
          point-of-work guide    optional solo replay
```

The differentiator is not video generation alone. LAWFLO joins content
generation to safe legal AI practice and uses exact observed actions plus
source-backed rules to decide where the learner needs more or less support.

## 3. Actors

### 3.1 Legal engineer

The legal engineer:

- selects the target role and practice group;
- supplies the legal AI workflow, playbook, sample matter and contributor
  portrait;
- reviews extracted workflow steps and source coverage;
- approves an exact content fingerprint and source version;
- publishes the generated learning module;
- inspects change impact when a policy or workflow changes.

### 3.2 Workflow learner

The learner may be a lawyer, legal-operations professional, contract manager or
business user expected to operate a legal-controlled AI workflow. The learner:

- watches the interactive peer-led episode;
- answers the in-episode safety checkpoint;
- completes one rehearsal whose guidance decreases as confidence grows;
- repairs incomplete or unsafe steps with contextual support;
- receives an evidence-linked learning review;
- opens the final point-of-work guide;
- may optionally replay the workflow without guidance.

### 3.3 Responsible reviewer

The prototype represents the responsible reviewer as part of the workflow,
not as a third signed-in user. Submission for human approval is an observable
learner action. Production may connect that action to a firm's actual approval
system.

## 4. Demonstration content

The only complete prototype module is the synthetic workflow:

> AI-Assisted Contract Review: Route a Sales Renewal.

The learner must use a legal AI system to extract key terms from a routine sales
renewal, compare the agreement with the approved template, verify the AI's
findings, apply the legal review playbook and route the contract to business
approval or human legal review with an explainable audit record.

The demo pack contains:

- a synthetic AI-assisted contract-review workflow;
- a synthetic contract-review playbook and responsible-AI policy;
- a synthetic standard renewal template and submitted renewal agreement;
- a synthetic contributor portrait;
- precomputed AI extraction and semantic clause-comparison results;
- the expected verified findings and routing evidence encoded in the canonical
  `UseCase`.

The application provides both file inputs and a **Load synthetic demo pack**
fallback. The fallback prevents a failed live demonstration while preserving
the visible end-to-end authoring process.

## 5. End-to-end journey

### 5.1 Studio intake

The landing view is the Legal Engineer Studio. It shows five required inputs:

1. Legal AI workflow instructions
2. Contract-review playbook and responsible-AI policy
3. Approved standard renewal template
4. Sample submitted renewal agreement
5. Contributor portrait

The browser displays selected filenames, input categories and validation
status. Text-based demo documents may be read locally for preview. The
contributor image is previewed locally and is not uploaded to a server.

The primary action is **Prepare workflow draft**. It remains disabled until all
five input categories are present or the synthetic demo pack is loaded.

### 5.2 Deterministic generation

Preparation runs visible compiler stages:

1. Validate inputs
2. Resolve the legal AI workflow steps
3. Link playbook rules and guardrails to sources
4. Load the precomputed AI term extraction and clause comparison
5. Build the episode timeline
6. Build the progressive rehearsal and optional replay configuration
7. Build the coaching and reinforcement rules
8. Build the point-of-work guide

The stage display represents real deterministic functions, not timed theatre.
Each stage must either produce its output or return a specific error.

The draft view exposes:

- target role and practice group;
- work trigger and expected outcome;
- the AI tasks, ordered tools and workflow steps;
- legal-playbook rules, guardrails and escalation conditions;
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
- rehearsal structure and optional solo-replay label;
- learning objectives;
- source and approval status;
- **Begin episode** as the primary learner action.

The catalogue framing should make LAWFLO feel like a platform while showing
only one complete module. Additional cards may be labelled as concept previews,
never as working content.

### 5.4 Interactive episode

The episode is a Neuroflix-inspired cinematic workplace story generated from the
approved workflow manifest. OpenAI produces the source-linked script, shot list,
checkpoint and exact narration. Runway renders approved multi-shot visuals with
generated speech disabled; OpenAI TTS supplies the approved voiceover. A
deterministic motion-comic remains the offline and provider-failure fallback. It
includes:

- contributor-led visual framing;
- chapter titles and progress;
- captions enabled by default;
- a searchable transcript and source rail;
- playback, pause, replay and chapter navigation;
- a checkpoint in which a low-value agreement contains a material non-standard
  clause and therefore still requires legal escalation;
- a direct handoff into practice.

The legal engineer reviews the script, storyboard, sources and source fingerprint
before video credits are spent. A source change invalidates approval and marks
only affected scenes for regeneration. The video provider receives approved
visual prompts and consented references, never the underlying contract or
playbook.

The learner cannot seek beyond an unanswered checkpoint. A wrong answer shows
the relevant policy explanation and allows another attempt. Episode completion
does not itself show that the learner can use the workflow; it prepares the
learner to practise it.

### 5.5 Progressively guided matter rehearsal

The rehearsal opens a single LAWFLO matter workspace. It resembles real desktop
legal work without copying or claiming integration with any commercial
application. It is one continuous learning experience rather than a separate
lesson followed by an examination.

The workspace contains:

- **Contract files:** submitted renewal, approved template, playbook and policy;
- **AI review panel:** precomputed term extraction, clause comparison and
  proposed risk classification;
- **Document comparison:** linked standard and submitted clauses with highlighted
  deviations;
- **Verification workspace:** controls to confirm, correct or reject each AI
  finding;
- **Routing panel:** business approval, signature or human legal review;
- **Workflow rail:** current objective, completed actions and optional hints;
- **Audit panel:** inputs, rules, decisions, corrections and human-review reason.

The learner completes these meaningful actions:

1. Confirm contract type, value, parties and template version.
2. Run the simulated legal AI review.
3. Inspect the AI-extracted terms against the contract text.
4. Correct one deliberately inaccurate extracted term.
5. Inspect the AI's semantic clause comparison rather than relying only on the
   contract value.
6. Identify a material change to the standard liability position.
7. Apply the source-linked legal playbook and review the proposed risk route.
8. Correct an unsafe low-risk recommendation and escalate the agreement to
   human legal review.
9. Inspect the final reasoning and audit record.

Each task follows a progressive-support loop:

1. **Orient:** explain the objective and identify the relevant matter context.
2. **Attempt:** ask the learner to act before revealing an answer.
3. **Assist:** keep hints available but initially collapsed.
4. **Protect:** quarantine an unsafe external action and explain its risk.
5. **Verify:** compare the AI result with the contract, template or playbook.
6. **Reflect:** identify what the learner handled well and what to repair.

Guidance fades during the same rehearsal. Early tasks identify both the
objective and likely tool. Middle tasks identify the objective while leaving
the action to the learner. Final tasks ask the learner to prepare and submit
the update with minimal prompting. Successful first attempts move forward
without unnecessary explanation. Repeated or safety-critical errors reveal
progressively stronger support.

The unsafe action is allowed as an attempt inside the sandbox, recorded,
quarantined and explained. No information leaves the browser. A learner cannot
permanently fail: safety-critical omissions trigger a focused repair attempt
before the rehearsal completes.

### 5.6 Optional solo replay

After the learning review, LAWFLO offers **Try this workflow without guidance**.
This is a confidence-building option, not a qualification gate. It uses a
shorter renewal variation with a different value and clause deviation while the
governing playbook remains source-equivalent.

Optional replay mode:

- hides the workflow hints;
- keeps source and matter materials available;
- does not interrupt ordinary actions with coaching;
- records the complete decision trace;
- quarantines actions that would represent an external disclosure or sending;
- produces a comparison with the learner's guided attempt.

Skipping or stopping the replay never removes access to the workflow guide and
never labels the learner unfit to use the workflow.

### 5.7 Evidence-based learning review

The coaching engine reviews both process and work product to choose constructive
feedback and reinforcement. It does not certify fitness to use the workflow.

**Process evidence** includes:

- which contract, template and playbook materials were opened;
- whether each material AI finding was verified against contract text;
- which AI findings were confirmed, corrected or rejected;
- whether the learner inspected the material clause deviation;
- which playbook rules were applied;
- whether the proposed routing was accepted or corrected;
- whether human legal review was requested when required.

**Work-product evidence** includes:

- whether the seeded extraction error was corrected;
- whether contract value, template status and material deviations are accurate;
- whether the risk classification matches the verified facts and playbook;
- whether the routing decision contains a source-linked explanation.

The review returns one learning state per dimension:

| Dimension | Evidence of progress | Repair trigger |
|---|---|---|
| AI-output verification | Material extracted terms checked against the contract | AI findings accepted unread |
| Clause comparison | Standard and submitted clauses inspected | Contract value used as the only risk signal |
| Playbook application | Relevant threshold and exception rules opened | Rule applied without its exceptions |
| Risk reasoning | Route follows verified facts and linked rules | Non-standard liability clause classified low risk |
| Human responsibility | Ambiguity or exception routed to legal review | AI recommendation treated as final legal judgement |
| Audit completeness | Inputs, corrections, rule and reason are recorded | Routing decision has no explanation |

States use constructive language such as **Completed independently**,
**Completed with guidance** and **Revisit this step**. There is no opaque
AI-generated percentage, pass/fail verdict or fitness label. Safety-critical
dimensions must be repaired before the guided rehearsal is marked complete.
The review explains:

> Observed action -> rule applied -> source excerpt -> required repair

The learner returns only to portions that need repair. The system may generate
friendly summary wording, but the learning state, reinforcement selection and
underlying evidence remain deterministic.

### 5.8 Point-of-work guide

Completing the progressively guided rehearsal produces a personalised compact
activation card containing:

- when to use the workflow;
- approved legal AI and review sequence;
- contract-intake checklist;
- mandatory AI-output and clause-verification checks;
- playbook escalation conditions and human-review requirement;
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
    EpisodeEngine  MatterSim   CoachingEngine
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
- distinguishes AI-produced findings from deterministic playbook rules and
  human decisions;
- binds the precomputed AI analysis to the exact synthetic contract version;
- derives episode cues, progressive rehearsal tasks, optional replay variation,
  coaching rules and activation card;
- creates a content-addressed manifest;
- refuses compilation if source links are unresolved or approval is stale.

### 6.3 Journey controller

- enforces Studio -> Module -> Episode -> Rehearsal -> Review -> Activation;
- exposes optional Solo Replay after Review without making it a prerequisite;
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
- adapts hint strength inside the rehearsal from the observed action trace;
- reuses the same reducer for optional solo replay with coaching interruptions
  disabled;
- separates user-visible workspace state from immutable expected evidence.

### 6.6 Coaching engine

- evaluates explicit evidence predicates;
- returns dimension-level learning states and source-linked explanations;
- selects progressively stronger support after an incomplete attempt;
- never infers an action that was not recorded;
- treats a superficially correct final document as insufficient when required
  verification actions were skipped;
- never produces a certification, fitness decision or permanent failure state.

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

The Reset control clears the journey, playback, rehearsal, optional replay and
event stores before returning to Studio.

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
| AI analysis does not match the selected contract | Block the rehearsal and identify the version mismatch |
| Unverified material AI finding | Keep routing incomplete and direct the learner to the relevant clause |
| Ambiguous playbook outcome | Require human legal review rather than infer a low-risk route |
| Unsafe simulation action | Record and quarantine it; never transmit or silently pass |
| Incomplete rehearsal submission | Identify missing evidence and open a focused, source-linked repair attempt |
| Optional replay abandoned | Preserve the learning review and workflow-guide access |

The demo must never require a network call after the static site loads.

## 9. Visual and interaction direction

The interface uses the permitted reference mechanics while translating them
into legal AI workflow training:

- editorial typography and warm neutral surfaces;
- restrained coral accents for current state and primary action;
- cinematic episode stage with chapter framing;
- polished module cards and visible learning-path progress;
- checkpoints embedded inside playback;
- dense but calm desktop workbench panels;
- learning feedback that reads like constructive reviewed work, not a game
  leaderboard or fitness test.

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
- contract-version binding for precomputed AI findings;
- separation of AI findings, playbook rules and human routing decisions;
- journey transition matrix;
- episode seek and checkpoint enforcement;
- generated rehearsal and optional-replay task completeness;
- matter-simulator action transitions;
- coaching predicate and progressive-hint truth tables;
- event deduplication and evidence scoping;
- stale-session rejection.

### 10.2 Component tests

- real file selection and synthetic-pack fallback;
- prepare, approve and publish controls;
- episode playback and checkpoint recovery;
- guided acceptance of an unsafe AI route and source-linked repair;
- correction of the deliberately inaccurate extracted term;
- reduced guidance after a correct attempt;
- focused repair after an incomplete submission;
- optional replay availability without gating the guide;
- dimension-level debrief evidence;
- activation-card unlock;
- reset and resume behavior;
- keyboard names, focus movement and status announcements.

### 10.3 Browser tests

The end-to-end suite covers:

1. synthetic pack -> approval -> episode -> progressive rehearsal -> review ->
   activation;
2. unsafe reliance on the AI's low-risk recommendation and recovery;
3. focused repair caused by an unverified extracted term;
4. refresh and resume;
5. source-version change and reapproval;
6. reset from a partially completed session;
7. optional solo replay without guide lockout;
8. signed-out deployment at 1440x900 and 1024x768;
9. keyboard-only completion of the primary controls.

Tests and build must pass without API credentials.

## 11. Judge demonstration

The shipped product contains the complete journey, while the live demonstration
uses a four-minute fast path:

1. Load the synthetic demo pack and show the five inputs.
2. Prepare, inspect source coverage and approve the module.
3. Start the generated episode and answer its checkpoint.
4. Enter rehearsal and run the simulated AI contract review.
5. Correct the seeded extraction error and inspect the liability deviation.
6. Reject the unsafe low-risk route, apply the playbook and escalate to legal.
7. Show the constructive review and personalised point-of-work guide.
8. Reveal the optional solo replay, then open the evidence graph during
   technical questions.

The presenter may use explicit demo navigation to compress waiting and repeated
steps, but the application must also support completing the journey normally.

## 12. Non-goals for the prototype

- arbitrary document-to-course generation;
- server-side file storage;
- authentication or role management;
- face cloning, lip-sync or voice cloning;
- pixel-level replicas of third-party applications;
- live contract-system, document-management or legal-AI integration;
- a live model call or a claim that arbitrary uploaded contracts were analysed;
- subjective model-based grading;
- certification, fitness-to-use decisions or permanent learner failure;
- production process mining;
- fabricated adoption, efficiency or outcome metrics;
- phone-based completion of the legal AI simulation.

## 13. Completion criteria

The prototype is complete only when:

- the legal engineer can load the demo inputs, inspect, approve and publish;
- one approved bundle generates every learner artefact;
- the canonical module visibly teaches AI extraction, semantic clause
  comparison, human verification, playbook constraints and legal escalation;
- the product never presents deterministic rules automation alone as legal AI;
- the learner can complete the episode and progressively guided rehearsal on a
  desktop browser;
- the optional solo replay is available but never gates the workflow guide;
- a correct-looking output still triggers focused repair when required process
  evidence is missing;
- every safety deduction resolves to a current source excerpt;
- source or material changes invalidate approval and saved progress;
- the deployed site completes without credentials or network generation;
- the golden, unsafe, repair, optional-replay, resume and reset browser paths
  pass;
- a cold tester can finish without verbal repair from the team.
