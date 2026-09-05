# LAWFLO deployment checklist

## Release target

- Public URL: `https://choosuann.github.io/smu-lit/`
- Deployment source: `main` via `.github/workflows/deploy-pages.yml`
- Access model: public static site; no sign-in, API key or model call required
- Runtime: all learner actions and progress stay in browser storage

## Before merging

- [ ] `npm ci`
- [ ] `npx playwright install chromium`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] Record the release commit: `________________`

## Browser evidence

- [ ] Golden path completes at 1440×900
- [ ] Golden path remains usable at 1024×768
- [ ] A 390×844 screen displays the intentional desktop-rehearsal boundary
- [ ] Uploaded and bundled five-file packs compile to the same approved manifest
- [ ] Unsafe low-value routing produces constructive focused repair
- [ ] Repeated publication produces one stable `module_published` event
- [ ] Learner actions produce no fetch/XHR, WebSocket or cross-origin traffic
- [ ] Browser refresh resumes the published episode and Reset clears all progress
- [ ] There are zero uncaught page errors

## Signed-out check

1. Open the public URL in a private browser window.
2. Confirm the studio renders without authentication.
3. Load the synthetic demo pack, approve the exact version and publish.
4. Complete the episode checkpoint and open the rehearsal.
5. Confirm no credentials, pop-ups or external service calls are requested.

## Known risks and fallback

- GitHub Pages must be enabled with **GitHub Actions** as its source before the first deployment.
- The generated portrait is about 2 MB, so the first cold load may be slower on poor venue Wi-Fi. Reload once before judging so it is cached.
- If stale browser progress appears, select **Reset demo** and reload the page.
- If Pages is unavailable, run `npm run build` and `npm run preview -- --host 0.0.0.0`; the complete experience is static and works locally.
