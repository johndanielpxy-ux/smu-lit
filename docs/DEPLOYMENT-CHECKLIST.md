# LAWFLO deployment checklist

## Release target

- Public URL: record after the Render service reports **Live**: `________________`
- Deployment source: `main` via the Render Blueprint in `render.yaml`
- Region and runtime: Singapore, Node 22+
- Access model: the learner journey is public; production generation endpoints
  require `LAWFLO_STUDIO_TOKEN`
- Secrets: `OPENAI_API_KEY`, `RUNWAYML_API_SECRET`, and `LAWFLO_STUDIO_TOKEN`
  are server-only Render environment variables
- Learner progress remains in browser storage; prepared MP4s ship with the build

## Before merging

- [x] Dependencies installed
- [x] Chromium available
- [x] `npm test` — 199 passing
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] Canonical route repeated three times without failure
- [ ] Generate and visually approve both durable Runway MP4s
- [ ] Confirm all three Render secrets are set
- [ ] Record the release commit: `________________`

## Browser evidence

- [x] Canonical route reaches the learning review on desktop
- [x] Golden path remains usable without horizontal overflow at 1024×768
- [x] A 390×844 screen displays the intentional desktop-rehearsal boundary
- [x] Unsafe low-value routing produces constructive correction
- [x] There are zero uncaught page errors on the canonical route
- [ ] Prepared Runway MP4s play through both segments in deployed Chrome
- [ ] Browser refresh resumes the published episode and Reset clears all progress

## Signed-out check

1. Open the public URL in a private browser window.
2. Confirm the studio renders without authentication.
3. Use the prepared source pack, create the episode, approve and publish.
4. Complete the episode checkpoint and open the rehearsal.
5. Confirm no credentials, pop-ups or external service calls are requested.

## Known risks and fallback

- Render's free service may cold-start; open the public URL before judging.
- The generated portrait is about 2 MB, so the first cold load may be slower on poor venue Wi-Fi. Reload once before judging so it is cached.
- Runway output URLs expire. Only the downloaded files in `public/media/demo/`
  count as release media.
- If stale browser progress appears, select **Reset demo** and reload the page.
- If Render is unavailable, run `npm run build` and `npm run preview -- --host
  0.0.0.0`; the prepared learner experience remains usable locally.
