# Neuroflix product reference for LAWFLO

Research date: 5 September 2026

## Verified product shape

Neuroflix presents two joined products:

- **Neuro Studio:** documents become a script, storyboard, cinematic video,
  voiceover and assessment package through a preview-and-approval process.
- **Neuro Engine:** the course is distributed, playback is checkpointed,
  application answers are graded, and comprehension is reported by learner and
  topic.

The public examples are 16:9, multi-scene workplace stories with recurring
characters. They are not talking-avatar lectures. The player uses season and
episode framing, chapter duration, captions and in-video pauses. [Product and FAQ](https://www.neuroflix.io/)

## Verified platform services

Neuroflix publicly identifies these platform services in its privacy policy:

| Function | Service |
|---|---|
| Authentication, SSO and SCIM | WorkOS |
| Database and file storage | Supabase, Singapore region |
| Short-answer grading | Google Gemini |
| Payments | Stripe |
| Transactional email | Resend |
| Hosting and deployment | Vercel |

The application is delivered with Next.js. Its public sample videos are served
from `ufs.sh`; this is consistent with UploadThing, but that provider name is an
inference rather than a disclosed dependency. [Privacy policy](https://www.neuroflix.io/privacy)

## What is not public

No reviewed public page, privacy disclosure, browser request or client-side
bundle names the AI video-generation or voice provider. The terms say that
organisations supply externally hosted video URLs and Neuroflix does not host or
control those video files. This supports a separation between video production
and the learning platform, but it does not establish which production tools are
used. [Terms of service](https://www.neuroflix.io/terms)

Do not claim that Neuroflix uses Runway, Veo, HeyGen, ElevenLabs or any other
undisclosed provider.

## Invariant mechanics to copy and contextualise

1. Start from existing documents, not a blank course builder.
2. Create a script, storyboard and questions before rendering video.
3. Give the subject-matter expert a preview and revision gate.
4. Produce a cinematic story with recurring characters and natural voiceover.
5. Pause playback for meaningful questions rather than appending only a quiz.
6. Test application and analysis, not mere recognition or completion.
7. Report comprehension and knowledge gaps by topic.
8. Make course updates cheaper than traditional re-production.

## LAWFLO-specific differentiation

LAWFLO applies those mechanics to **safe adoption of legal-AI workflows**:

- every narration line, question and workflow step is traceable to an approved
  source;
- a source-version change invalidates approval and marks affected scenes stale;
- the lesson continues into a guided matter rehearsal using simulated files;
- learners verify AI extractions, correct an error and choose the safe route;
- deterministic policy logic governs the route while AI gives constructive
  feedback on the learner's reasoning;
- the learner receives a point-of-work workflow guide rather than a generic
  certificate.

## Beat-by-beat implementation check

| Reference beat | LAWFLO proof |
|---|---|
| Upload content | Four legal workflow documents |
| Generate production plan | Typed source-linked episode manifest |
| Preview and iterate | Editable narration, shot list and citations |
| Approve production | Legal-engineer approval and source fingerprint |
| Cinematic episode | Runway custom Multi-Shot workplace scene |
| Natural narration | Exact approved OpenAI TTS track |
| Embedded checkpoint | Material-redline routing decision |
| Application assessment | Guided contract-review rehearsal |
| Comprehension report | Evidence-linked strengths and repair actions |
| Update course | Regenerate only source-affected scenes |

The implementation fails this reference gate if it becomes a talking-head
course, a generic quiz, or a video disconnected from the approved sources.
