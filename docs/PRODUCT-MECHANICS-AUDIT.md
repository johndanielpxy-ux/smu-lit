# LAWFLO product-mechanics audit

Research date: 5 September 2026  
Scope: every external product explicitly described as a borrowed mechanic, a
reference product, or a strategic constraint in the LAWFLO planning documents.

## Bottom line

The product references were not fabricated, but the earlier research was not
uniformly deep enough. Most headline mechanics are supported. Four
attributions need qualification, one source has a material identity conflict,
and one current product claim could not be independently re-verified.

The most important result is not a new competitor feature. It is that the
current prototype does not yet deliver several mechanics its own product story
inherits from the references:

1. The episode is a timed motion-comic, not generated audiovisual media.
2. The rehearsal records actions, but its “hint” button reveals no hint and its
   verification panel exposes the answer before the learner supplies one.
3. “Source-verified” overstates what the compiler proves. It verifies source
   references and exact approval scope, not the truth of each sourced claim.
4. The change-impact view invalidates artefacts but does not show the changed
   passage or the precise downstream scenes and tasks affected.

These are product-integrity gaps, not cosmetic gaps.

## Evidence standard

- **Verified:** the public product page, documentation, or an inspectable demo
  directly supports the attributed mechanic.
- **Verified with qualification:** the product supports the underlying pattern,
  but LAWFLO's wording or abstraction went beyond the source.
- **Source conflict:** two current public sources describe a material point
  differently.
- **Insufficient current evidence:** the present claim could not be verified
  against an accessible current first-party source.

YC profiles were used for the nine YC companies because they contain the
companies' own launch descriptions. Where possible, the current company site
was checked as well. Marketing outcome figures were not treated as independent
proof.

## Reference ledger

### 1. Neuroflix — source-to-cinematic learning

**What LAWFLO borrowed:** source documents, script/storyboard production,
cinematic recurring characters, natural voiceover, in-video checkpoints,
application-based assessment, comprehension analytics, and course updates.

**Verdict: verified, with a major workflow clarification.** Neuroflix's public
site describes a managed production process: discovery, preview and iteration,
full production after approval, then deployment. Its FAQ says its team writes
the script, designs the storyboard, generates the video, and builds the
questions. This is not evidence of an unattended one-click video API.

**Missed useful mechanics:** a real preview-and-revision loop; AI-graded
short-answer questions testing application and analysis; per-topic knowledge
gaps; SCORM export; and explicit separation between Studio production and Engine
delivery/analytics.

**LAWFLO implication:** preserve the governed draft → preview → approve → render
sequence. Do not describe the current deterministic bundle as arbitrary
document-to-video generation. A real cached generated clip plus provider/job
provenance is the minimum credible visual proof.

Sources: [Neuroflix product and FAQ](https://www.neuroflix.io/),
[privacy policy](https://www.neuroflix.io/privacy),
[terms](https://www.neuroflix.io/terms).

### 2. Pincites / Filevine LOIS for Word — existing materials to live playbooks

**What LAWFLO borrowed:** turn existing templates and contracts into playbooks,
then surface approved guidance where the work happens.

**Verdict: verified.** The original Pincites launch describes an onboarding flow
that converts existing contracts into playbooks and a Word add-in that surfaces
guidance during review. Pincites has since been acquired; its current descendant
is presented as LOIS for Word.

**Missed useful mechanics:** current LOIS for Word also learns from explicit
feedback and edits, accumulates precedent libraries, carries context across
reviews, and proposes refinements to playbooks. LAWFLO currently ingests one
source pack but has no author-feedback loop that improves future modules.

Sources: [Pincites YC profile](https://www.ycombinator.com/companies/pincites),
[LOIS for Word](https://www.filevine.com/platform/lois-for-word/).

### 3. Perceptron ML — proof before use

**What LAWFLO borrowed:** every material fact should trace to an openable primary
source before it may be used.

**Verdict: verified.** Perceptron publicly says every fact is derived from and
checked against a primary source before a model may use it, with citations that
open to the original.

**Missed useful mechanic:** this is a truth/authority gate, not merely a foreign
key check. LAWFLO currently confirms that source IDs resolve and that a named
human approved an exact fingerprint. It does not independently establish that a
source excerpt proves the instruction.

**Required wording correction:** use **source-linked and human-approved** for the
prototype. Reserve **source-verified** for a system that validates passage-level
support or records a real reviewer verification for each proposition.

Sources: [Perceptron ML](https://perceptronml.com/),
[YC profile](https://www.ycombinator.com/companies/perceptron-ml).

### 4. Lightfield — context, policy, work product, approval

**What LAWFLO borrowed:** receive work from familiar channels, gather context,
apply company policy and past decisions, prepare a result, and place the human
decision boundary at counsel approval.

**Verdict: verified.** Lightfield's product page explicitly presents “requests
arrive where they already do → it does the work → you approve” and lists email,
Teams, Slack and business-system integrations.

**Qualification:** LAWFLO's point-of-work action card is an adaptation. Lightfield
performs legal work and asks counsel to approve it; LAWFLO teaches a learner what
to do next. Do not imply a direct product equivalence.

Sources: [Lightfield](https://trylightfield.ai/),
[YC profile](https://www.ycombinator.com/companies/lightfield).

### 5. Draftwise — institutional knowledge as the compounding asset

**What LAWFLO borrowed:** reuse firm precedent, preferred language, standards and
internal guidance rather than building a generic course catalogue.

**Verdict: verified.** Draftwise describes a structured intelligence layer over
positions, fallbacks and negotiation patterns, plus a Knowledge Console and
Playbook Studio controlling which institutional knowledge powers workflows.

**Missed useful mechanics:** permission-aware knowledge controls, direct feedback
from edits, and a visible distinction between precedent, firm standard and
current deal context. LAWFLO's source types are currently flattened into one
list.

Sources: [Draftwise](https://www.draftwise.com/),
[YC profile](https://www.ycombinator.com/companies/draftwise).

### 6. LegalOS — AI work followed by legal responsibility

**What LAWFLO borrowed:** automation may prepare work, but a qualified human
retains responsibility for the final legal output.

**Verdict: source conflict; keep only the narrow human-review principle.** The YC
profile calls LegalOS an AI-native immigration law firm and says every case is
reviewed and signed by licensed attorneys. The current LegalOS site describes
attorney case preparation and support, but its footer states that LegalOS Inc.
is not a law firm. Those statements may reflect a service/entity distinction,
but the public pages do not resolve it.

**LAWFLO implication:** the human-control mechanic remains defensible. Do not use
LegalOS as proof of a particular organisational or regulatory model, and do not
repeat its success-rate claims.

Sources: [LegalOS](https://www.legalos.ai/),
[YC profile](https://www.ycombinator.com/companies/legalos).

### 7. Mage Legal — a bounded end-to-end legal workflow

**What LAWFLO borrowed:** structure one defined legal task into inspectable
stages rather than centre the product on generic chat.

**Verdict: verified with qualification.** Mage visibly structures diligence into
linked documents, amendment chains, tabular findings, schedule review and
memoranda. “Typed workflow object” and LAWFLO's exact compiler stages are our
engineering abstraction, not a public Mage claim.

**Missed useful mechanic:** outputs retain the chain from documents to findings
to reports and reviewer recommendations. LAWFLO's evidence graph adopts this
well, but should not mark a verification edge as observed before the learner
performs it.

Sources: [Mage Legal](https://magelegal.com/),
[YC profile](https://www.ycombinator.com/companies/mage-legal).

### 8. Rescript — detect change, explain impact, update the work product

**What LAWFLO borrowed:** source changes should identify what changed and what
response is required.

**Verdict: verified.** Rescript presents one lifecycle: establish a baseline,
monitor for changes, then deliver updated work products. Its public example
shows a regulation redline, the affected business unit and an explanation of
why the change matters.

**Missed useful mechanic:** LAWFLO's current simulator only reports that the
source version changed and marks every artefact affected. A stronger version
would show the changed passage, affected rules, episode beats, rehearsal tasks
and guide instructions, then regenerate only those nodes.

Sources: [Rescript](https://rescript.ai/),
[YC profile](https://www.ycombinator.com/companies/rescript).

### 9. Osmaura — a contextual action briefing

**What LAWFLO borrowed:** a compact prompt should tell a professional why this
moment matters and where to begin.

**Verdict: verified with wording correction.** Osmaura says it produces a
focused partner briefing explaining **what happened, why it may matter, and
where a timely conversation could begin**. The earlier wording “who, why now,
what to say” was our synthesis, not Osmaura's stated product sequence.

**LAWFLO implication:** the guide's “when to use / why now / how to start safely”
structure is a legitimate contextualisation, but should be presented as LAWFLO's
design rather than attributed verbatim to Osmaura.

Sources: [Osmaura](https://www.osmaura.com/),
[YC profile](https://www.ycombinator.com/companies/osmaura).

### 10. Lexi — firm standards, familiar tools and auditability

**What LAWFLO borrowed:** learn firm style and standards, work in familiar tools,
and preserve role controls and audit trails.

**Verdict: verified.** Lexi's YC profile explicitly names team standards, tone
and processes; integrations with Word, Outlook and iManage; role-based access;
and audit trails. Its current site also emphasizes verified citations and firm
standards.

**LAWFLO implication:** retain the audit trail and firm-specific source model.
The prototype's site-only guide is honest; a Teams- or Word-style surface must
remain labelled simulated until a real integration exists.

Sources: [Lexi](https://www.getlexi.io/),
[YC profile](https://www.ycombinator.com/companies/lexi).

### 11. Harvey Academy, Innovation and Command Center — enablement and adoption

**What LAWFLO borrowed:** legal-AI workflow education, Innovation-team ownership,
firm-specific workflows, role-based enablement and adoption analytics.

**Verdict: verified with an attribution correction.** Harvey Academy provides
on-demand legal-AI literacy and workflow learning and describes planned
role-based enablement. Harvey's Innovation page gives Innovation teams ownership
of custom workflows, embedded expertise, adoption tracking and compliance.
Command Center measures adoption by feature, role, group and region and supports
targeted activation plans.

**Correction:** the reviewed Harvey pages do not call this operator a “legal
engineer.” That persona came from John's product framing and LAWFLO's
contextualisation. It is still a useful role name, but it must not be presented
as Harvey terminology.

**Missed useful mechanics:** cohort-level friction, identification of groups that
need support, and a direct action loop from usage evidence to targeted training.
These belong in a production roadmap, not fabricated prototype analytics.

Sources: [Harvey Academy](https://www.harvey.ai/blog/introducing-harvey-academy),
[Innovation teams](https://www.harvey.ai/solutions/innovation),
[Command Center](https://www.harvey.ai/platform/command-center).

### 12. Hotshot — short, practical legal-AI instruction

**What LAWFLO borrowed:** concise legal-AI videos focused on real use cases,
risks, prompting and supervision.

**Verdict: verified with qualification.** Hotshot explicitly offers short,
practical videos and courses on legal AI uses, limitations, ethics and
supervision. “Respect for billable time” is a reasonable design inference, not
a quoted Hotshot mechanic.

**LAWFLO implication:** keep episodes short and task-specific. Do not cite
Hotshot as evidence for a mandatory train-before-access gate; that earlier idea
has been superseded by LAWFLO's constructive-learning decision.

Source: [Hotshot AI training](https://www.hotshotlegal.com/artificial-intelligence).

### 13. SkillBurst — firm voice, custom policy and learner-time discipline

**What LAWFLO borrowed:** bite-sized, interactive learning that can be branded
and customised to a firm's policies, procedures and preferences.

**Verdict: verified.** SkillBurst directly states these mechanics and explicitly
says its modules should respect learners' time and intelligence because every
minute counts.

**Missed useful mechanics:** its as-designed → branded → policy-customised ladder
is a clean product model for LAWFLO templates. A future module could begin from
an approved generic workflow pattern, then add firm sources and branding without
mixing the two authorities.

Source: [SkillBurst](https://www.skillburst.com/).

### 14. Intellek — LMS and authoring boundary

**What LAWFLO used it for:** evidence that generic course administration,
authoring and enterprise reporting already exist, so LAWFLO should own the
legal-workflow compiler rather than rebuild an LMS.

**Verdict: insufficient current evidence for the full earlier claim.** The
current Intellek site returned HTTP 403 during this audit. An older official
Intellek video supports the LMS and course-authoring claims, but this audit did
not obtain a current first-party source confirming the earlier specific phrase
“AI-assisted course authoring, software walkthroughs and reporting.”

**LAWFLO implication:** the strategic boundary remains sensible, but external
materials should say “existing LMS and authoring platforms” or cite a currently
accessible source. Do not rely on the unverified specific feature bundle.

Sources: [Intellek site](https://intellek.io/),
[official 2019 LMS video](https://www.youtube.com/watch?v=Kx-FdCr943s),
[official 2019 authoring video](https://www.youtube.com/watch?v=7AkwF0cMKzI).

### 15. Whatfix Mirror and DAP — safe replica, progressive guidance, friction data

**What LAWFLO borrowed:** risk-free application replicas, guided practice and
workflow support.

**Verdict: verified.** Mirror combines application replicas, guided practice,
assessment and analytics before go-live. The wider Whatfix model then provides
in-app guidance during live work and analytics after launch.

**Missed useful mechanics:** the complete lifecycle is sandbox → point-of-work
support → targeted analytics. Guidance is layered as flows, task lists, smart
tips and searchable help. Analytics identify step-level hesitation and drop-off,
and guidance can be role-specific for occasional users.

**Current mismatch:** LAWFLO's `USE_HINT` action increments a count but the UI
does not render hint content. The review can therefore label an action “with
guidance” even though no guidance was shown. This fails the reference mechanic.

Sources: [Whatfix Mirror](https://whatfix.com/products/mirror/),
[Whatfix for CLM](https://whatfix.com/solutions/clm/).

### 16. AltaClaro — Learn, Do, Review and targeted coaching

**What LAWFLO borrowed:** practitioner-led learning, realistic legal assignments
and personalised review.

**Verdict: verified.** AltaClaro's Learn–Do–Review model uses short instruction,
documents derived from real matters, simulated assignments, model answers and
experienced-practitioner review. Benchmark360 applies a standardised competency
rubric and returns strengths, development areas and targeted mentoring insight.
AltaClaro's current simulations also demonstrate AI agents acting as witness,
opposing counsel and court reporter, followed by rubric-based feedback.

**Missed useful mechanics:** realistic matters should contain incomplete facts,
grey areas and practical considerations. Feedback should address the learner's
reasoning and work product, not merely whether a UI action occurred. A guided
exercise can culminate in an optional capstone without becoming a fitness gate.

**Current mismatch:** LAWFLO's review explanations are generated from the
presence of a small set of events. The learner never writes a route rationale or
produces a review note, so the product cannot yet claim that it reviewed the
learner's reasoning or work product.

Sources: [AltaClaro](https://www.altaclaro.com/),
[GenAI supervisory course](https://www.altaclaro.com/classes/guiding-effective-use-of-genai),
[Benchmark360](https://www.altaclaro.com/news/altaclaro-unveils-benchmark360),
[simulation and judgment](https://www.altaclaro.com/-artificial-lawyer-replay).

### 17. Praktio — realistic work product, safe attempts and explanation

**What LAWFLO borrowed:** make mistakes safely, retry and receive immediate
feedback while working with realistic legal documents.

**Verdict: directly verified in a public exercise.** Praktio's Running Useful
Redlines demo alternates concise video/takeaways with a realistic supervisor
email and attachment set. The learner edits the work product by selecting the
correct document versions, sees attempts remaining, submits, retries after a
wrong answer, and receives a substantive explanation after the correct answer.
The product explicitly describes exercises as practice, not tests, and says
scores are not shared with employers.

**Missed useful mechanics:** the interaction changes the actual work product;
feedback explains the professional reason; and the lesson returns to a final
reinforcement segment. Praktio also uses reference material and spaced repeated
practice.

**Current mismatch:** LAWFLO exposes `verifiedValue` as soon as a finding opens,
then lets the learner press **Correct** to copy that value. This rehearses button
selection, not contract verification. The next version should require the
learner to mark the conflicting clause or supply the corrected value/rationale
before revealing the model answer.

Sources: [Praktio first-year training](https://praktio.com/pages/first-years),
[Running Useful Redlines](https://praktio.com/products/running-useful-redlines),
[public exercise](https://learner.praktio.com/?moduleId=60d380b89252c40012cd5087).

## Context sources, not copied products

Rajah & Tann's own AI strategy and Microsoft's deployment case study materially
shape the problem: approved tools, privacy, human oversight, training, daily-work
fit and ongoing support. They are requirements, not competitor mechanics. The
R&T page describes Harvey as a “Gen AI Pioneer”; it does not supply the term
“legal engineer.”

Sources: [R&T AI strategy](https://sg.rajahtannasia.com/ai-strategy/),
[Microsoft R&T Copilot case study](https://www.microsoft.com/en/customers/story/1765414330609650283-rajahtann-microsoft-365-copilot-professional-services-en-singapore).

The prior LexisNexis R&T case-study URL returned HTTP 403 during this audit. Its
“share successful internal use cases to overcome scepticism” claim should remain
internally qualified unless the saved source or another accessible first-party
copy is produced.

OpenAI, Runway, Gemini and Vercel are implementation providers rather than
product-mechanic references. Their suitability is covered separately in
`docs/VIDEO-GENERATION-API-RECOMMENDATION.md` and should be re-checked against
current provider documentation before implementation.

## Current implementation gap audit

| Surface | What is genuinely present | Material gap | Severity |
|---|---|---|---|
| Governed studio | Five-file synthetic pack, exact approval fingerprint and fail-closed publication | Files compile to pre-authored content; no arbitrary document understanding, editable generated draft or true preview/iteration | Critical if described as document-to-video generation |
| Episode | Chapters, captions, transcript, sources, gated checkpoint and replay | No video or narration audio; static portrait and timed text are not Neuroflix-equivalent audiovisual generation | Critical |
| Rehearsal | Deterministic matter state machine, contract comparison, AI-error correction, playbook routing and repair | Hint produces no hint; correct answer is exposed; learner creates no work product or rationale | Critical |
| Learning review | Constructive labels and source links; no fitness or pass/fail verdict | Infers reasoning from clicks and hint counters; does not review reasoning or work product | High |
| Evidence | Source IDs, exact approval fingerprint, typed lineage and observed events | `verified_against` edges exist before observed verification; “verified links” and “source-verified” overclaim | Critical integrity issue |
| Change impact | Source/version change pauses publication and identifies affected IDs | No passage diff, dependency-specific impact or selective regeneration | Medium |
| Point-of-work guide | Personalised checklist, trigger, verification steps and sources | It is inside LAWFLO, not surfaced in a real work tool; acceptable only when described as the production handoff design | Medium |
| Analytics | Prototype records only actions it actually observes | No production adoption or outcome data; current restraint is correct | Pass |

## Prioritised product corrections

### P0 — required before making the strongest demo claims

1. Replace **source-verified** with **source-linked and human-approved** unless
   passage-level reviewer verification is added. Do not count unobserved
   `verified_against` relations as verified evidence.
2. Either include a genuine cached generated video/voiceover with job provenance
   or call the current surface an interactive episode, not video generation.
3. Make hints visible and task-specific. A click that only increments a hidden
   counter is not guidance.
4. Make the learner do legal work before revealing the answer: identify the
   clause, enter or select the corrected fact, and state the route reason.

### P1 — highest-value differentiation after P0

5. Show a model/worked answer only after the attempt, explain the consequence,
   and let the learner revise. This combines Praktio's work-product practice and
   AltaClaro's review without turning the exercise into certification.
6. Add a source-diff view: changed passage → affected rule → affected scene/task
   → reapproval. This turns the Rescript pattern into visible technical depth.
7. Add a real creator revision step between generated draft and approval. Track
   which reviewer edit changed the reusable pattern.
8. Use optional solo replay as a capstone with fewer prompts and a different
   clause, while preserving sources and access to the workflow guide.

### P2 — production roadmap, not hackathon theatre

9. Use observed friction to target reinforcement by role or practice group.
10. Surface the approved guide in Word, Teams or the intranet only after a real
    integration exists.
11. Add LMS/SCORM export, cohort controls and authoring templates rather than
    rebuilding a full LMS.

## Claims safe to use in the pitch

- LAWFLO compiles one **source-linked, human-approved** workflow into a peer
  episode, safe matter rehearsal and reusable desk guide.
- The prototype demonstrates deterministic AI-output verification and legal
  routing on synthetic materials.
- The rehearsal is constructive practice, not a certification or fitness test.
- The event ledger contains only actions observed inside the prototype.
- Production integrations, arbitrary source generation and repeat-use analytics
  are future interfaces unless they are actually implemented before the demo.

## Claims to stop using

- “Source-verified” when only source IDs and approval fingerprints were checked.
- “Harvey's legal-engineer model.” Harvey publicly addresses Innovation and
  Legal Ops teams; LAWFLO's legal-engineer persona is the team's concept.
- “Osmaura's who/why-now/what-to-say framework.” That exact framework is
  LAWFLO's synthesis.
- “The prototype reviews learner reasoning” until the learner provides a
  rationale or work product that can be reviewed.
- The full specific Intellek feature bundle until a current accessible source is
  obtained.

## Remaining uncertainty

- Most enterprise product workflows are visible only through marketing pages or
  demos; this audit does not claim access to private deployments.
- Vendor outcome figures are self-reported and were not used as proof of product
  efficacy.
- Neuroflix's video-generation provider remains undisclosed.
- Intellek's current feature set and the LexisNexis R&T case study could not be
  re-verified from accessible current first-party pages.
