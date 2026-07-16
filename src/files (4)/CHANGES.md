# Portal Transition — Refinement Pass

## Root cause of the blank-screen bug (point 1)

From the contact sheet + frame timing: `navigate()` fires ~7s into the
timeline, but nothing hides the destination page until either the
`portal:disperse` event (~8.4s) or `useWorldReveal`'s 2.5s fallback timer.
In that gap, whatever the destination renders — unfetched `<img>` sources,
unstyled layout — is visible straight through the transparent portal
canvas. That's the black/blank window from ~8s to ~10.8s in your video.

**Fix, two parts, both included:**
1. `assetPreload.js` (new) — warms the browser cache for the destination
   route's critical images the instant the user clicks, giving the full
   ~8s of animation to finish loading invisibly.
2. `portalDom.js`'s new reveal guard — a plain CSS rule that force-hides
   `[data-reveal]` elements the instant they're painted, whenever a
   transition is in flight. This is a hard guarantee, not timing-dependent,
   so even a slow connection can't cause a flash.
3. `portalTimelines.js` also pauses the `disperse` label until the preload
   promise resolves (capped at 4s so a broken asset link can never hang
   the transition).

**Action needed from you:** open `assetPreload.js` and fill in
`ROUTE_ASSETS` with the real critical image paths per route — I don't have
access to your actual asset files/paths, so this ships as an empty
scaffold that's otherwise a no-op.

## Point-by-point

| # | Feedback | Status |
|---|---|---|
| 1 | Destination page loading | **Fixed** — preload + CSS reveal guard (see above) |
| 2 | Portal appears too suddenly | Partially covered — the IGNITE phase (spark → gather-pulse → grow) was already in your timeline code; the actual *visual* ring growth lives in `PortalRing.jsx`, which wasn't provided. Flagging for you. |
| 3 | Homepage doesn't react enough | **Improved** — collapse tweens already stretch/scale/rotate/blur elements toward the core; added a direct `document.body` filter tween (saturate/contrast/brightness) during collapse so the ambient-lighting shift is guaranteed regardless of your CSS setup |
| 4 | Camera pacing | **Fixed** — dive is now 4 legs (approach → accelerate → cruise → decelerate) instead of 3; "camera slowly approaches" is now its own beat |
| 5 | Tunnel too short | **Partially fixed** — dive duration extended 3.5s → 4.2s, far plane bumped for headroom. True depth (multiple parallax layers, volumetric fog, evolving density) lives in `ParticleField.jsx` / a tunnel-geometry file, not provided |
| 6 | Repetitive tunnel geometry | **Not addressed** — lives entirely in `ParticleField.jsx`, not provided |
| 7 | White flash too strong (bloom) | **Not addressed** — bloom intensity lives in `PostFX.jsx`, not provided |
| 8 | Destination reveal too abrupt | Already implemented well in `useWorldReveal.js` (environment → lighting → atmosphere → structures → objects → interactive → UI, staggered). No changes needed. |
| 9 | Arrival pause | Already implemented (`.to({}, {duration: 0.5})` at the end of disperse). Left as-is. |
| 10 | Keep world alive after arrival | **Flagged, not code-fixed** — the portal canvas correctly unmounts after the transition for performance (per your own architecture comment). That means ambient motion after arrival has to live in the destination page's own persistent visuals, not this transition system. Added a `portalBreath`-style hook (`ambientDrift`) to `transitionState.js` for *during* the arrival pause, but true "always alive" needs something in `MainPortfolio`/`HobbiesProfile` themselves. |
| 11 | Portal energy/breathing | **Infrastructure added, not wired up** — added `transitionState.portalBreath`, oscillating during the stabilize hold before dive. `PortalRing.jsx` (not provided) needs to actually consume it. |
| 12 | Performance | Reviewed — `overwrite:'auto'`, mount-only-during-transition Canvas, reduced-motion fallback, and ref-based (not React state) high-frequency values were all already correct. Added `will-change` set/clear around the new body-filter tween so it doesn't leave a stray compositor layer. |

## Files not provided that block full coverage of points 2, 5, 6, 7, 11

- `scene/CameraRig.jsx`
- `scene/ParticleField.jsx`
- `scene/PortalRing.jsx`
- `scene/PostFX.jsx`

If you share those, I can wire `portalBreath` into the ring, add real depth
layers to the tunnel, reduce bloom intensity without losing detail, and
replace repetitive geometry with the organic energy-formation look you
described — without guessing at (and possibly conflicting with) what's
already there.
