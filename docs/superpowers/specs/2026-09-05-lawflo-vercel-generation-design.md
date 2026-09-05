# LAWFLO Vercel Generation Design

Date: 5 September 2026  
Status: Approved after adversarial review  
Supersedes: the static-only generation boundary in `2026-09-05-lawflo-desktop-learning-design.md`

## Goal

Add genuine AI production to LAWFLO without making the public demo depend on a
slow provider job, exposing API credentials, or allowing generated text to
silently become legal truth.

## Product boundary

LAWFLO has two operating modes:

1. **Protected production:** John supplies the five governed inputs, previews a
   source-linked manifest, approves its exact fingerprint, and then requests
   narration or visual generation.
2. **Public learning:** judges and learners play a cached approved episode,
   complete the existing guided matter rehearsal, and can always fall back to
   the deterministic interactive story.

The public learner path does not spend generation credits.

## Architecture

Keep the React/Vite application. Add Vercel Functions rather than migrating to
Next.js. GitHub Pages remains the static fallback; Vercel becomes the API-capable
primary deployment.

```text
Protected Studio
     |
     | four text sources + contributor metadata + in-memory presenter token
     v
Vercel /api/generation/module
     |-- method, origin, token and body-size gates
     |-- OpenAI structured response
     |-- deterministic schema + source-ID verification
     v
Draft manifest -> human preview -> fingerprint approval
     |
     +--> /api/generation/voiceover -> approved narration only
     +--> provider adapter -> approved visual prompts only
                                   |
                                   v
                         cached approved media
                                   |
                                   v
Public player -> checkpoint -> guided rehearsal -> learning review
     |
     +--> deterministic interactive-story fallback
```

## Security and cost controls

- `OPENAI_API_KEY` and `LAWFLO_STUDIO_TOKEN` exist only in Vercel environment
  variables.
- The Studio token is entered by the presenter and held in React memory. It is
  never committed, bundled, placed in a URL, or written to local storage.
- Generation routes reject non-POST methods, missing or incorrect bearer tokens,
  unsupported content types, malformed bodies, and bodies above 100 KiB.
- Only the four expected text-source roles are accepted. The contributor's
  portrait remains local and is never sent to OpenAI. The initial production route
  supports the canonical synthetic demo pack, not arbitrary confidential client
  material.
- OpenAI project-level spend limits are the final cost backstop. In-process rate
  limiting is not represented as durable protection because Vercel instances do
  not share memory.
- Responses use `Cache-Control: no-store`. Errors do not echo source text, bearer
  tokens, or provider response bodies.

## Legal-grounding boundary

OpenAI may propose learning objectives, narration, shots, and checkpoint wording.
It may not approve or publish them.

The server accepts a generated manifest only when:

- it conforms to the strict response schema;
- every citation uses a supplied source ID;
- every chapter includes at least one citation;
- the checkpoint cites the rule that controls the correct route;
- narration and visual prompts do not contain source text outside the supplied
  synthetic pack; and
- the frontend records a new human approval for the exact generated fingerprint.

Provider refusal, malformed output, unknown citations, timeout, or network error
leaves the last approved deterministic bundle untouched.

## OpenAI integration

Use the Responses API with strict Structured Outputs for the manifest. Keep the
text model configurable through `OPENAI_TEXT_MODEL`; do not expose a model picker
in the hackathon UI. Use `gpt-4o-mini-tts` with a built-in voice for narration and
display the required AI-voice disclosure.

The server uses the official OpenAI JavaScript SDK. Provider calls live behind
small injectable functions so tests use deterministic fakes and never consume
credits.

## Video integration

The provider-neutral visual interface accepts only an approved list of shot
prompts. The first public proof is one pre-generated 15-second 720p cold open.
The repository stores or references the approved cached result together with its
manifest fingerprint and provider/job provenance.

Runway remains the preferred cinematic renderer when a Runway credential is
available. OpenAI video is not the long-term dependency because its announced
shutdown and face-reference restrictions conflict with this product. No live
video render is required for the judge path.

## Failure behaviour

| Failure | User-visible result | State rule |
|---|---|---|
| Missing Studio token | “Production access required” | No provider call |
| Invalid source pack | Existing source-specific error | No provider call |
| Provider refusal/malformed JSON | “Draft could not be generated safely” | Keep current draft |
| Unknown citation | Name the invalid citation count, not source text | Reject entire manifest |
| Provider timeout/network error | Retry action plus deterministic fallback | Keep approved bundle |
| Narration failure | Episode remains playable without audio | Do not invalidate text approval |
| Cached media unavailable | Deterministic interactive story | Preserve full learning journey |

## Testing

- Unit-test request guards, constant-time token comparison, size enforcement,
  provider error normalisation, schema validation, citation closure, and exact
  approved-narration forwarding.
- Contract-test both handlers with injected provider fakes.
- Add a deterministic evaluation fixture that rejects unsupported legal claims,
  missing source IDs, and a wrong routing rule.
- Extend Playwright coverage for protected Studio denial, successful generated
  draft preview with a mocked API, and public fallback playback.
- Keep live provider evaluation outside ordinary CI and run it explicitly with a
  capped OpenAI project before the demo.

## Deployment

- `vercel.json` builds with `npm run build` and serves `dist` plus `/api/*`.
- Vercel environment variables: `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, and
  `LAWFLO_STUDIO_TOKEN`.
- GitHub Pages continues deploying `dist` and therefore remains the zero-secret
  fallback.
- Vercel preview and production URLs must pass unit, build, and browser tests.

## Adversarial review

### Architecture

**Pass after correction.** A Next.js migration was unnecessary blast radius.
Protected creation plus cached public playback removes the live-provider single
point of failure and prevents anonymous credit spend.

### Code quality

**Pass with an explicit boundary.** Provider-specific payloads stay server-side;
the frontend consumes a provider-neutral manifest. Validation and source closure
are pure functions rather than duplicated handler checks.

### Tests

**Pass with required additions.** Every request branch and every visible fallback
has a named test above. Live LLM quality is an explicit evaluation, not a mocked
unit-test claim.

### Performance

**Pass for the hackathon load.** Bodies are capped at 100 KiB, provider calls have
timeouts, and public playback is cached. Streaming and durable job queues are
deferred because they do not improve the four-minute demo.

## Explicitly deferred

- arbitrary confidential-client uploads;
- multi-tenant authentication and durable rate limiting;
- production media storage and retention policies;
- a live Runway render in the judge path;
- LMS/SCORM export; and
- semantic grading of all learner prose.

These are production extensions, not claims made by the prototype.
