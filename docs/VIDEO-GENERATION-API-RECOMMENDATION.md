# LAWFLO video-generation API recommendation

Date: 5 September 2026  
Decision: choose the production-facing video provider for LAWFLO’s document-to-interactive-training workflow.

## Executive answer

Use **HeyGen’s Avatar IV Photo Avatar API as LAWFLO’s primary video renderer**, with OpenAI generating the source-linked episode structure and exact approved scripts.

HeyGen is the best fit because LAWFLO needs a presenter who can be created from one portrait, speak an exact legal script, preserve a consistent identity across chapters, produce a downloadable video asynchronously, and expose controls for voice, motion, expressiveness, resolution, background, captions and callbacks. Its current API supports a reusable photo avatar from a PNG or JPEG and renders a lip-synced video from either an exact script or pre-recorded audio. [HeyGen Photo Avatar](https://developers.heygen.com/photo-avatar.md) [HeyGen Create Video](https://developers.heygen.com/reference/create-video.md)

Do **not** use OpenAI Sora as the core renderer. It is capable of short generated clips and costs $0.10 per second for Sora 2 at 720p, but OpenAI has announced that the Sora 2 models and Videos API will shut down on 24 September 2026. It may be used for a disposable hackathon insert, but building LAWFLO around it would create an immediate migration problem. [OpenAI video generation](https://developers.openai.com/api/docs/guides/video-generation) [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)

## Requirement fit

| Candidate | Exact legal script | One-photo presenter | Consistency across chapters | Best use in LAWFLO | Verdict |
|---|---|---|---|---|---|
| **HeyGen Avatar IV** | Yes; script or supplied audio | Yes | Reusable photo-avatar ID | Core presenter videos | **Choose** |
| **Tavus Phoenix** | Yes; script or audio URL | Yes | Reusable trained face | Backup avatar provider; future conversational tutor | Strong fallback |
| **Gemini Omni Flash** | Prompt-controlled, not a deterministic narration contract | Reference images and subject references | Stronger than general video models; editable across turns | Cinematic B-roll and visual transitions | Optional secondary |
| **Runway Gen-4.5 / router** | No guaranteed verbatim instruction | Image-to-video, not purpose-built presenter scripting | Good general visual consistency | Provider-agnostic B-roll experiments | Not the core |
| **OpenAI Sora 2** | No guaranteed verbatim instruction | Image reference, but human-character reuse is restricted | Short clips and extensions | At most a temporary demo insert | Reject as core |

### Why HeyGen wins

- A single portrait can become a reusable photo avatar; the render request accepts an exact `script`, `voice_id`, 720p/1080p/4K resolution, aspect ratio, background, gesture `motion_prompt`, and expressiveness. [Photo Avatar guide](https://developers.heygen.com/photo-avatar.md)
- The production endpoint supports both script-driven speech and caller-supplied audio, returns sidecar subtitles, and supports callbacks for asynchronous completion. [Create Video reference](https://developers.heygen.com/reference/create-video.md)
- Direct API access is pay-as-you-go with a $5 minimum wallet top-up rather than requiring an enterprise contract. Exact operation charges should be checked in the API dashboard before batch rendering because the public page does not expose a complete per-operation table. [HeyGen API pricing](https://www.heygen.com/api-pricing)
- HeyGen’s technical consent gate applies to digital twins, with a webcam consent flow available to all customers. Its documentation says photo avatars do not require that provider flow; LAWFLO should nevertheless require affirmative contributor consent for every identifiable portrait. [Avatar consent](https://developers.heygen.com/docs/avatar-consent.md)

### Why Tavus is the fallback

Tavus also exposes a clean asynchronous endpoint that accepts a trained face plus either an exact script or audio URL, then returns hosted/downloadable video when ready. A face can be trained from a single image or video. Its public pricing lists paid plans from $22 per month and asynchronous video-generation allocations, with overages listed from $1 to $0.80 per minute across tiers. Tavus becomes more attractive if LAWFLO later adds a live conversational video tutor, but that is not tomorrow’s core experience. [Tavus async video quickstart](https://docs.tavus.io/sections/video/quickstart.md) [Tavus pricing](https://www.tavus.io/pricing)

### Why cinematic generators are secondary

Google currently recommends **Gemini Omni Flash** as its default general video model. It supports text, image, audio and video inputs, subject references, iterative editing, native audio and 720p/1080p output, with an effective 720p price of about $0.10 per second. That makes it the strongest optional B-roll provider, but it is still a creative video generator rather than a deterministic legal presenter. [Gemini video overview](https://ai.google.dev/gemini-api/docs/video) [Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni) [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

Runway provides a mature asynchronous SDK and a broad model router. Gen-4.5 currently costs 12 credits per second, with credits sold at $0.01 each, while routed Gemini Omni Flash costs 10 credits per second. It is useful if LAWFLO later wants one integration across several cinematic models, but that flexibility does not solve exact presenter narration. [Runway API guide](https://docs.dev.runwayml.com/guides/using-the-api/) [Runway pricing](https://docs.dev.runwayml.com/guides/pricing/)

## Recommended LAWFLO architecture

1. **Ingest locally and structure with OpenAI.** Send the approved synthetic documents to a server-side OpenAI Responses API route. Produce the existing typed `UseCase`, source anchors, six chapter scripts, checkpoint, rehearsal scenario and guide.
2. **Require human approval.** The legal engineer edits and approves the exact source fingerprint and narration before any video job starts.
3. **Create or reuse the presenter.** Upload the contributor portrait to HeyGen once and retain the returned avatar ID. For real people, LAWFLO records explicit consent even where the provider does not require a digital-twin consent workflow.
4. **Render one clip per chapter.** Submit six independent exact-script renders. Per-chapter clips make the checkpoint natural and allow only an affected chapter to be regenerated when a source changes.
5. **Keep legal evidence outside the pixels.** Captions, contract clauses, source excerpts and decision labels remain native HTML generated from the approved bundle. The video is the presenter layer, not the legal authority.
6. **Pause between Chapters 5 and 6.** LAWFLO overlays the routing checkpoint, records the learner’s reasoning and starts the final clip only after the safe route is understood.
7. **Fall back safely.** If any provider job is queued or fails, use the current motion-comic chapter with the same approved script. Never block the rehearsal or silently substitute unapproved wording.

### Vercel endpoints

- `POST /api/avatar` — upload a synthetic or consented contributor portrait and return a provider-neutral avatar ID.
- `POST /api/generation/module` — use OpenAI to create the source-linked structured bundle.
- `POST /api/generation/chapter` — submit one approved chapter to the selected avatar provider.
- `GET /api/generation/chapter?id=…` — proxy provider status without exposing API credentials.
- `POST /api/webhooks/heygen` — record completion and failure callbacks once persistent storage is added.

The frontend stores only provider-neutral job IDs and approved manifests. `OPENAI_API_KEY` and `HEYGEN_API_KEY` remain in Vercel environment variables.

## Hackathon implementation order

1. Add the OpenAI structured-generation route and render its real output in the studio.
2. Add one HeyGen Photo Avatar render for Chapter 1 using the synthetic Maya portrait.
3. Replace Chapter 1’s static frame with the returned video while retaining the current five fallback chapters.
4. Demonstrate that changing the approved Chapter 1 script creates a new job and provenance record.
5. If generation time is reliable, render the other five chapters in parallel; otherwise keep the one real render and explain the provider-neutral queue.

This is enough to prove genuine document-to-video generation without making the judge wait for an entire episode render.

## Failure rules

- Never send the underlying contract or playbook to the avatar provider; send only the approved narration, portrait and visual settings.
- Never expose either API key to the Vite client.
- Never describe a deterministic fallback as a newly generated video.
- Never let generated audio or on-screen text become the source of legal truth; the approved structured bundle remains authoritative.
- Never regenerate every chapter after a localized source change; use the evidence graph to identify and replace only affected clips.
- Disclose that the voice and presenter video are AI-generated.

## Remaining uncertainty

The strongest unresolved variable is real-world avatar quality and queue latency on the available account tier. Documentation establishes API capability, not how the synthetic Maya portrait will look under venue conditions. Run one paid Chapter 1 render before integrating all six chapters. Stop and retain the existing motion-comic fallback if the face, speech or turnaround is not presentation-ready.
