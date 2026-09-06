# LAWFLO Instructional Episode Correction

Date: 6 September 2026  
Status: Approved in chat; awaiting written-spec review

## Purpose

The current learner episode looks like generic AI footage with unrelated browser-generated speech. It does not visibly teach the contract-review workflow. This correction makes the episode a short, source-linked lesson that shows the AI output, the legal evidence, the human verification step, and the safe routing decision in sequence.

The live demo must remain achievable within three minutes. The learner episode therefore targets 50–60 seconds and retains one meaningful checkpoint before the guided rehearsal.

## Product principle

LAWFLO should use generative video for human presence and cinematic context, but never rely on a video model to render exact legal clauses, interface text, monetary values, or playbook rules. Those instructional elements must be deterministic application layers so they remain readable and factually aligned with the approved source pack.

This preserves the product claim: a legal engineer can turn an approved legal-AI workflow into engaging training without surrendering legal accuracy to the media generator.

## Episode structure

The prepared demonstration episode contains four ordered chapters.

### 1. AI reviews the renewal

- Show Maya beginning a routine renewal review in generated office footage.
- Overlay the actual extracted values: SGD 42,000, approved template version 2026.2, Singapore law, and the AI finding “No material redline detected.”
- State clearly that the AI result is a draft, not a routing decision.

### 2. Maya verifies the evidence

- Show a deterministic side-by-side clause comparison.
- The approved clause caps liability at 12 months of fees.
- The submitted clause imposes unlimited liability and includes indirect losses.
- Visually mark the changed language and connect it to the applicable playbook rule.

### 3. Learner decision

- Pause the episode after the evidence has been shown.
- Ask whether the low-value shortcut still permits the agreement to bypass legal review.
- An unsafe answer receives one concise corrective explanation and can be retried.
- The safe answer continues immediately; this is a learning checkpoint, not a fitness assessment.

### 4. Safe route and audit trail

- Show Maya correcting the AI finding and selecting legal review.
- Show the changed clause and matched playbook rule attached to the route.
- End with the lesson: the model proposes, the responsible human verifies, and the system records the reason.

## Media architecture

### Visual layer

The episode uses four prepared Runway video segments, one per chapter. Generated footage is limited to the presenter, office setting, gestures, and transitions. Prompts explicitly prohibit readable text, invented interfaces, logos, and screen close-ups that imply factual detail.

The player renders controlled React overlays above the videos. Overlay states are defined in the episode media manifest and timed in seconds. They include:

- an AI extraction panel;
- a clause comparison;
- a playbook rule card;
- a corrected routing decision; and
- an evidence-attached audit trail.

The deterministic overlay is the instructional source of truth. Generated footage is supporting atmosphere.

### Narration layer

Prepared narration is generated through Runway’s text-to-speech endpoint using the `eleven_v3` model and a Runway preset voice. This uses the existing `RUNWAYML_API_SECRET`; no separate ElevenLabs account is required.

Each chapter has its own MP3 so narration can start, pause, replay, and fail independently. Browser `speechSynthesis` must not be used for the prepared episode. Narration scripts are capped to the spoken duration of their matching video, use natural conversational phrasing, and describe only what is visible during that chapter.

Captions contain the exact approved narration and remain available if audio cannot play.

### Synchronisation

Starting a chapter starts its video and audio together. Pausing pauses both. Replaying resets both. The checkpoint opens only when chapter two finishes. Chapter four completion unlocks the guided rehearsal.

If a prepared MP3 fails, the episode continues with captions and a quiet status message. If a prepared video fails, the existing deterministic timeline remains the fallback; it must display the same evidence and lesson rather than generic prose.

## Creator experience corrections

After the legal engineer selects resources, the upload drop zone is replaced by a completed resource panel showing the five recognised files. The panel includes **Replace files**. The alternative **Use prepared source pack** action and its “or” divider are hidden once either uploaded or prepared sources are active.

The episode preview uses the same four-chapter media manifest as the learner player. It exposes working play/pause, volume, captions, and chapter position. Full script editing is outside this correction; the preview continues to expose the approved script and sources for inspection.

## Home screen

The home screen may receive one subtle, non-interactive workflow-line background treatment using existing institutional colours. It must not add copy, cards, metrics, or new decisions. This is lower priority than the episode and upload corrections and may be omitted if it risks delivery.

## Data and interfaces

`EpisodeMediaManifest` changes from a fixed two-segment tuple to an ordered list of four instructional segments. Each segment contains:

- stable identifier, title, video source, and audio source;
- exact narration and caption;
- overlay kind and timed overlay beats; and
- source references supporting the scene.

The prepared-media generation plan produces both video and narration assets. Existing generated files are never overwritten implicitly: regeneration writes new versioned filenames, and the manifest changes only after every required output has been downloaded successfully.

No user-uploaded document or portrait is required to leave the browser for the prepared demo path. Existing protected dynamic-generation endpoints remain unchanged unless a failing test proves a compatibility correction is necessary.

## Testing

All behavioural changes follow red-green-refactor.

Automated tests must prove:

- completed source selection replaces the chooser and removes the prepared-pack alternative;
- the manifest contains four ordered, source-linked chapters with video and audio assets;
- prepared playback never invokes browser speech synthesis;
- play, pause, replay, chapter advancement, and checkpoint continuation keep audio and video state aligned;
- audio failure preserves captions and does not block progression;
- generated prompts do not request readable legal text or invented software UI;
- the preview and learner use the same prepared media; and
- the complete creator-to-learner-to-rehearsal route still passes in Chromium.

Visual QA must confirm at desktop demo resolution that every narrated legal fact is simultaneously readable on screen, no generated nonsense text is visible, captions do not cover evidence, and the entire live route fits within three minutes.

## Acceptance criteria

The correction is ready only when:

1. A cold viewer can state that the AI missed a material liability change and that Maya routed the agreement to legal review.
2. Every spoken factual claim is supported by a visible deterministic element in the same chapter.
3. The prepared episode contains four distinct instructional chapters and one checkpoint.
4. Natural generated narration plays in creator preview and learner playback with volume control.
5. Browser text-to-speech is absent from the prepared path.
6. Uploaded files cannot be mistaken for members of the prepared source pack.
7. The live demonstration completes in no more than three minutes without relying on hidden controls or verbal explanation to repair the interface.

## Explicit non-goals

- Building a general-purpose video editor.
- Generating arbitrary legal training episodes live during the judged demo.
- Creating a separate ElevenLabs account or secret.
- Rebuilding the guided rehearsal unless a regression blocks the end-to-end demonstration.
- Adding analytics, cohort administration, certification, or unrelated platform breadth.

