# LAWFLO video-generation API recommendation

Date: 5 September 2026  
Decision: reproduce the strongest public Neuroflix product mechanics in a source-grounded legal-AI workflow trainer.

## Corrected executive answer

Use a **two-layer production stack**:

1. **OpenAI Responses API and text-to-speech** for document interpretation,
   source-linked scripts, shot lists, checkpoint questions and exact narration.
2. **Runway Multi-Shot Video in custom mode** for the cinematic 16:9 workplace
   scenes.

HeyGen is no longer the recommended primary renderer. Its talking-presenter
format is useful, but it does not match the reference product's visible output:
short cinematic scenes with recurring workplace characters, voiceover, captions
and story pacing.

## What Neuroflix publicly demonstrates

Neuroflix's public product follows this sequence:

1. An organisation supplies documents, decks or manuals.
2. A production team writes the script, designs the storyboard and creates the
   assessment questions.
3. The client reviews preview material and requests changes.
4. The approved course becomes a multi-scene cinematic video with natural
   voiceover, branding and embedded questions.
5. Learners encounter in-video checkpoints and application-based assessments.
6. The platform records comprehension by learner and topic and can export to an
   LMS using SCORM.

This is a human-in-the-loop production system, not evidence of a one-click call
to a single video model. The public site does not disclose its video-generation
vendor. [Neuroflix product and FAQ](https://www.neuroflix.io/)

Its privacy policy does disclose WorkOS, Supabase in Singapore, Google Gemini
for short-answer grading, Resend, Stripe and Vercel. The terms state that
organisations provide externally hosted video URLs and that Neuroflix itself
does not host the video files. [Neuroflix privacy policy](https://www.neuroflix.io/privacy)
[Neuroflix terms](https://www.neuroflix.io/terms)

The public landing page is a Next.js deployment and serves its sample MP4 files
from `ufs.sh`, which is consistent with UploadThing hosting. That hosting
identification is an inference from the public media URLs, not a Neuroflix
statement. No public page or browser bundle reviewed identifies the model used
to generate the cinematic footage.

## Reference-mechanic mapping

| Neuroflix invariant | LAWFLO implementation | Legal-tech adaptation |
|---|---|---|
| Documents become a produced episode | OpenAI creates a typed episode manifest | Every script and checkpoint carries source IDs |
| Script and storyboard are reviewed before production | Legal engineer sees and approves both | Approval is invalidated when a source changes |
| Multi-scene cinematic story | Runway custom Multi-Shot Video | A fictional lawyer applies the contract-review workflow |
| Real or recurring characters | Consented or synthetic character reference | Never use an unconsented lawyer or client likeness |
| Natural voiceover | OpenAI TTS from the approved narration | Video generation cannot rewrite legal wording |
| In-video checkpoints | Native player overlay that blocks progress | Learner must catch a material redline despite low value |
| Application-based assessment | Guided matter rehearsal and short answer | Focus on safe use, verification and escalation |
| Comprehension analytics | Evidence-linked learning review | Show corrections, reasoning and knowledge gaps |
| Course updates | Source fingerprint and affected-scene regeneration | Change only chapters touched by the new rule |

## Why Runway Multi-Shot is the primary visual API

Runway's Multi-Shot Video recipe is unusually close to the desired production
mechanic. In custom mode it accepts an ordered list of three to five shot prompts,
preserves the order and assembles a 5, 10 or 15 second 720p or 1080p video. It can
also generate audio, but LAWFLO should disable generated speech and use the exact
approved OpenAI voiceover instead. [Runway Multi-Shot Video](https://docs.dev.runwayml.com/recipes/multi-shot-video/)

Runway publishes reference-media guidance for talent images and requires the
caller to have permission to depict the person. It also exposes standard
asynchronous task handling through its SDK. [Runway reference media](https://docs.dev.runwayml.com/recipes/reference-media/)
[Runway API guide](https://docs.dev.runwayml.com/guides/using-the-api/)

Credits cost $0.01 each. Multi-Shot Video currently costs 13 credits per second
at 720p and 17 credits per second at 1080p. One 15-second 720p proof scene is
therefore about **$1.95**; two are about **$3.90**. [Runway pricing](https://docs.dev.runwayml.com/guides/pricing/)

## Provider roles

| Provider | Role | Decision |
|---|---|---|
| **OpenAI** | Source-grounded manifest, exact narration, questions and feedback | Required |
| **Runway Multi-Shot Video** | Cinematic scene production | Primary visual renderer |
| **Gemini Omni Flash** | Subject-reference video and iterative editing | Provider-adapter fallback |
| **HeyGen Avatar IV** | Optional presenter intro or outro | Not the core visual language |
| **OpenAI Sora 2** | Short cinematic generation | Do not build around it |

Google Gemini Omni Flash remains a strong second visual provider because it
supports image-to-video, subject references, first/last-frame interpolation,
stateful editing and extensions. It may ultimately outperform Runway on character
continuity, but Runway's custom Multi-Shot endpoint maps more directly to the
approved storyboard for tomorrow's build. [Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)

Sora 2 is available through OpenAI credits, but it rejects input images with
human faces by default and its Videos API is scheduled to shut down on
24 September 2026. Those constraints make it a poor fit for the uploaded-person
feature and a short-lived integration. [OpenAI video generation](https://developers.openai.com/api/docs/guides/video-generation)

## Exact LAWFLO generation pipeline

1. **Upload:** legal engineer supplies the workflow guide, contract template,
   review policy and synthetic sample agreement.
2. **Compile:** OpenAI returns a typed manifest containing learning objectives,
   three chapters, exact narration, three-to-five shots per chapter, checkpoint,
   rehearsal state and source IDs.
3. **Preview:** the studio displays narration, shot prompts, cited sources and
   assessment answers before spending video credits.
4. **Approve:** the legal engineer approves the manifest and source fingerprint.
5. **Render visuals:** LAWFLO submits an approved custom shot list to Runway with
   generated audio disabled.
6. **Render narration:** OpenAI TTS reads only the approved narration. The UI
   clearly discloses that the voice and footage are AI-generated.
7. **Assemble:** the browser player synchronises the MP4, narration and native
   captions. For the hackathon, separate synchronised media avoids adding an
   FFmpeg deployment dependency.
8. **Teach:** playback pauses for the material-redline checkpoint and then opens
   the guided contract-review rehearsal.
9. **Review:** OpenAI grades the learner's reasoning against the approved rubric,
   but routing correctness remains rule-based and source-linked.

## Server-side integration

- `POST /api/generation/module` — create the typed source-linked manifest with
  OpenAI.
- `POST /api/generation/chapter` — submit an approved custom Multi-Shot task to
  Runway.
- `GET /api/generation/chapter?id=...` — return normalised task status and the
  completed output URL.
- `POST /api/generation/voiceover` — create exact narration with OpenAI TTS.
- `POST /api/generation/review` — grade only the constructive learning response;
  deterministic workflow rules decide the safe route.

`OPENAI_API_KEY` and `RUNWAYML_API_SECRET` stay in Vercel environment variables.
The frontend receives only provider-neutral task IDs and signed media URLs.

## Hackathon proof to build first

Generate one genuine **15-second 720p cold open** containing three to five shots:
a fictional business user submits a low-value renewal, a lawyer opens the AI
review, and a material redline appears despite the low contract value. Add the
approved voiceover and captions, then pause on the routing checkpoint.

Pre-generate and cache that real clip before the live demo. The studio may show
the real generation request and job states, but the judge should never have to
wait for the provider. Retain the current deterministic motion-comic as the
failure and offline fallback.

## Hard boundaries

- Never send the source contracts or playbook to Runway. Send only approved shot
  prompts and consented visual references.
- Never allow the video model to generate or alter legal narration.
- Never imply that a participant's real face can be used without express consent
  and a successful provider test.
- Never make a live provider job the only demo path.
- Never burn credits before the legal engineer approves the storyboard.
- Never hide whether a scene is cached, generated or fallback media.

## Remaining uncertainty

The exact video model or production tools used by Neuroflix are not publicly
identified. Character continuity and queue latency must be judged with one paid
Runway render using LAWFLO's own fictional character reference. If that render is
not presentation-ready, test Gemini Omni Flash behind the same provider adapter;
do not revert to a generic presenter merely because it is easier.
