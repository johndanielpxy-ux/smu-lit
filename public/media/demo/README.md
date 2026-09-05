# LAWFLO prepared episode media

The player expects two durable MP4 files in this directory:

- `lawflo-review-the-renewal.mp4`
- `lawflo-explain-the-route.mp4`

They are deliberately not remote Runway output URLs because those expire. Generate the two approved 15-second scenes with the server-only Runway workflow:

```bash
RUNWAYML_API_SECRET="your-secret" npm run generate:demo-media
```

The command skips existing files and writes each completed download atomically. Review both renders, then commit the final MP4s before the demo. Until both exist, the player falls back truthfully to the deterministic interactive story.
