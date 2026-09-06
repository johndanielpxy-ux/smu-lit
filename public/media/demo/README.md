# LAWFLO prepared episode media

The release player uses four durable video and narration pairs:

- `lawflo-v2-01-ai-review.mp4` and `.mp3`
- `lawflo-v2-02-verify-evidence.mp4` and `.mp3`
- `lawflo-v2-03-learner-decision.mp4` and `.mp3`
- `lawflo-v2-04-safe-route.mp4` and `.mp3`

The files are downloaded release assets rather than temporary provider URLs. Regenerate missing assets with the server-only Runway workflow:

```bash
RUNWAYML_API_SECRET="your-secret" npm run generate:demo-media
```

The command skips completed files and writes new downloads atomically. Review every render before committing it. Exact legal facts remain in deterministic interface overlays rather than generated footage.
