# Su-Ann: cinematic peer episode

## Your branch and ownership

- Branch: `feat/cinematic-episode`
- Own: `src/features/episode/`, `src/assets/episode/`, and `public/episode/`
- Do not edit the app shell, shared contract, demo fixture, event store, or
  another teammate's folder.

## Mission

Turn the approved workflow into a short, premium, Neuroflix-inspired learning
episode. Copy the useful product pattern, not Neuroflix's source code, assets,
branding, or exact wording: story-led explanation, chapters, captions,
checkpoint, immediate feedback, and a clear transition into rehearsal.

The episode should make a lawyer think: “Someone like me already uses this, I
understand the safety boundary, and I can try it now.”

## Required component

Export a component with this integration shape (exact file organisation is up
to you):

```ts
interface EpisodePlayerProps {
  useCase: UseCase;
  onEvent: (eventType: MatterShiftEventType) => void;
  onComplete: () => void;
}
```

Import the types from `src/domain/mattershift.ts`. Render content from the
passed `useCase`; do not duplicate `demoUseCase` in your folder.

## Required experience

1. A strong opening card introduces fictional peer Maya Tan and the work
   trigger: a client-team meeting has just ended.
2. A 60–120 second episode moves through the approved cross-tool workflow:
   Teams transcript, Copilot draft, human verification, one sanitised bounded
   legal-AI request, source verification, and a reviewed Outlook update.
3. Include play/pause, chapter progress, captions/transcript, and a replay
   option. Pre-generated local media or a polished motion-comic treatment is
   preferred; the demo must not depend on a live generation API.
4. Pause for one meaningful checkpoint: the user must reject pasting a full
   confidential transcript into a public AI tool and choose the safe
   alternative.
5. Show immediate feedback tied to a visible synthetic policy source.
6. Completion calls `onComplete()` and offers “Practise this workflow”.

Only emit `episode_started` when playback actually starts and
`checkpoint_answered` when the learner actually answers.

## Depth ladder

### Core: shippable episode

Build the full playable story, chapter navigation, captions, checkpoint,
feedback, and completion handoff described above.

### Depth 1: timeline engine (required)

- Define a typed timeline model for scenes, narration cues, caption intervals,
  policy/source cues, and interactive checkpoints.
- Write a pure timeline reducer that supports play, pause, seek, replay,
  checkpoint gating, and completion without skipping unanswered checkpoints.
- Drive the UI from this model rather than hard-coded `setTimeout` chains.
- Persist the learner's last completed chapter in local storage and offer a
  deliberate resume/restart choice.
- Generate a searchable transcript/source rail from the same timeline data so
  narration, captions, chapters, and sources cannot drift apart.

### Depth 2: production polish (if ahead)

- Add keyboard shortcuts, a caption-size control, playback-speed choices, and
  reduced-motion behavior.
- Add a deterministic fallback when video/audio is missing so the judge never
  sees a blank player.
- Add instrumentation tests proving events fire once, seeking cannot bypass the
  checkpoint, and resume state is versioned by `useCase.id` + `sourceVersion`.

## Visual direction

Aim for an editorial legal-tech documentary, not a generic course player:
warm near-black, parchment, restrained signal colours, clear hierarchy,
cinematic crops, subtle motion, and excellent captions. Respect reduced-motion
preferences and phone layouts. Avoid fake testimonials, stock-lawyer clichés,
and decorative controls that do nothing.

## Tests and done condition

Add unit tests for the timeline reducer plus component tests for starting,
pausing/replaying, seeking, resume, the checkpoint, correct feedback, event
deduplication, and completion. You are done when Core and Depth 1 work without
network access, the callback contract is clean, and both required project
commands pass.

Send John the handoff format from `AGENTS.md`.
