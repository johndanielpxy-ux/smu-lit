# LAWFLO Hybrid Three-Minute Demo Design

**Date:** 2026-09-06

**Status:** Approved product architecture; three-minute choreography confirmed

**Primary device:** Desktop browser

**Primary personas:** Legal engineer, then workflow learner

## Outcome

LAWFLO must look and behave like an online learning platform. It turns a legal
engineer's firm-specific legal AI workflow into a cinematic, interactive
training episode and then transfers the learner directly into guided practice.

The interface reveals one stage and one dominant action at a time. Source
controls, approval fingerprints, audit evidence and change-impact details remain
available through progressive disclosure, but never dominate the default path.

## Product sequence

### 1. Welcome

The opening page contains the LAWFLO wordmark, one short value proposition and
one primary action, **Enter LAWFLO**. A quiet secondary link may let a returning
learner browse published training. No platform dashboard or governance strip is
visible.

### 2. Role selection

The user answers **How will you use LAWFLO today?** with either **Legal
engineer** or **Learner**. The judge route selects Legal engineer. In a
production system the signed-in account may remember this role; the prototype
uses an explicit choice so both sides of the platform are legible.

### 3. Source intake

The Legal Engineer Studio begins with one large source drop zone. It accepts the
workflow instructions, playbook, approved template and synthetic example matter.
An optional contributor portrait is a secondary input. Selected sources appear
as a compact file list. The demo provides **Use prepared source pack** so the
presenter completes intake in one click.

The only primary action is **Create episode**. Detailed source validation opens
in a secondary drawer.

### 4. Episode production

The page replaces intake with one calm production sequence:

1. Reading approved sources
2. Writing the source-linked script
3. Planning cinematic scenes
4. Generating video and narration
5. Adding learning interactions

In ordinary use these stages represent the real asynchronous OpenAI and Runway
pipeline. In judge-demo mode, the application verifies and loads an episode
previously produced by the same pipeline, then completes the visible sequence in
roughly six seconds. The UI must not claim that a new Runway render completed in
six seconds. It labels the result **Prepared demo render**.

### 5. Legal-engineer preview

The generated episode is the dominant object. A compact storyboard rail shows
the three scenes. Script, source coverage and generation details open in
drawers. The primary action is **Approve and publish**.

### 6. Perspective handoff

Publication produces a dedicated success page: **Your episode is ready for
learners.** The primary action, **View as learner**, changes persona without
requiring a second login during the demonstration.

### 7. Learner course page

The page uses a cinematic episode poster, the learning objective and a single
**Start episode** action. It should read as a premium microlearning product, not
an administrator console.

### 8. Interactive episode

The episode comprises two real 15-second Runway renders. Each render contains a
controlled multi-shot sequence; exact approved narration is played per segment.
The first segment establishes the routine renewal and the legal AI result. The
video then pauses at one decision checkpoint. The second segment shows the safe
verification and escalation workflow.

The player exposes only play/pause, captions, progress and optional transcript.
The learner cannot pass the checkpoint without answering it. An unsafe answer
receives a short source-grounded correction and offers one immediate retry.

### 9. Practice handoff

The completed player becomes a short transition: **You saw how Maya handled the
AI review. Now handle the matter yourself.** The only primary action is **Start
guided rehearsal**.

### 10. Guided rehearsal

The simulated legal workspace reveals one objective at a time. The live demo
shows the minimum complete safety loop:

1. Run the legal AI review.
2. Open the material liability finding and verify it against the contract.
3. Apply the playbook rule and route the agreement to Legal review with a short
   reason.

The contract remains central. Later tools appear when the corresponding task
begins. Hints are collapsed by default. The learner is coached, not certified or
ranked.

### 11. Learning review

The final page names one behaviour handled correctly, one behaviour to improve
and the supporting source. It offers **Practise again** and **Open desk guide**
as secondary continuation paths. These paths exist in the product but are not
opened during the live demonstration.

## Three-minute choreography

| Time | Visible action | Claim proved |
|---|---|---|
| 0:00–0:12 | Welcome, enter and choose Legal engineer | Two-sided learning platform |
| 0:12–0:28 | Use prepared source pack and create episode | Firm workflow is the source |
| 0:28–0:38 | Prepared generation sequence resolves | Real hybrid generation pipeline |
| 0:38–0:50 | Preview, approve and publish | Human control before release |
| 0:50–1:00 | Switch to learner and start episode | Author-to-learner handoff |
| 1:00–1:42 | Watch 30-second episode and answer one checkpoint | Cinematic, interactive learning |
| 1:42–1:50 | Start guided rehearsal | Learning transfers into practice |
| 1:50–2:42 | Review AI result, verify clause, apply rule and route | Safe legal AI workflow behaviour |
| 2:42–2:55 | Show constructive learning review | Evidence-based coaching |
| 2:55–3:00 | Close on the product thesis | Legal engineers scale safe practice |

The route has a five-second safety margin. Navigation preserves state and does
not rely on venue connectivity after initial load.

## Intentionally excluded from the live route

- Editing the generated script or individual prompts
- Replacing or regenerating individual scenes
- Full transcript and source inspection
- Change-impact analysis and the complete audit ledger
- Solo replay and the desk guide walkthrough
- Waiting for a fresh Runway task

These capabilities remain available for questions or a longer DevPost video.

## Hybrid media architecture

- OpenAI produces a source-linked script, storyboard, checkpoint and exact
  narration text.
- Runway generates approved cinematic visuals from scene prompts. It never
  receives the underlying contract or playbook.
- Approved Runway outputs are downloaded into durable application assets because
  provider output URLs expire within 24–48 hours.
- A server-only Runway credential powers fresh generation in the Studio.
- Fresh generation is asynchronous and exposes honest task status.
- If fresh generation fails, the prepared episode remains playable and is
  explicitly labelled as the prepared demonstration render.

## Visual rules

- Warm institutional canvas with the existing burgundy accent
- One dominant heading and one primary action per stage
- No dashboard grid on welcome, role selection, generation or transition pages
- No gradients, neon, glass effects, heavy shadows or decorative metric cards
- Generous whitespace and constrained reading width
- Video is the dominant learner surface
- Governance information appears only in drawers or post-task evidence views
- Motion communicates progress and transitions without competing for attention
- Keyboard focus, captions, reduced motion and desktop viewport support remain
  mandatory

## Acceptance tests

1. A cold viewer can describe the authoring flow as sources, generation,
   preview and publish within ten seconds.
2. A cold viewer can describe the learner flow as watch, interact, rehearse and
   review within ten seconds.
3. Every screen has one visually dominant primary action.
4. The episode plays real generated video and visibly pauses for a checkpoint.
5. The rehearsal demonstrates AI output, human verification, a playbook rule
   and legal escalation.
6. A rehearsed presenter can finish the canonical route in no more than 2:55.
7. The prepared route works after the page has loaded even if venue connectivity
   fails.
8. No screen falsely represents a cached render as a newly completed generation.
