// transitionState.js
//
// A single mutable object shared by:
//   - GSAP (writes to it — this is what the master timeline actually tweens)
//   - the R3F scene (reads it every frame via useFrame)
//
// This is deliberately NOT React state. Piping 60fps camera/particle values
// through useState would mean 60+ re-renders/sec of the whole provider tree
// for a 4-5s sequence. Plain mutable object + useFrame polling is the
// standard pattern for animation-heavy R3F scenes.

export const STAGE = {
  IDLE: 'idle',
  ANTICIPATE: 'anticipate', // brief charge-up beat — energy pulse before anything moves
  GATHER: 'gather',         // logo dissolving into particles, particles spreading out
  VORTEX: 'vortex',         // particles spiraling into a vortex
  PORTAL: 'portal',         // portal ring formed — the dimensional gateway
  DIVE: 'dive',             // camera travelling through the portal
  DISPERSE: 'disperse',     // particles/portal dissolving away (transition end)
  AMBIENT: 'ambient',       // post-arrival — subtle life (particles, breathing, drift)
};

export function createTransitionState() {
  return {
    active: false,
    direction: 'forward', // 'forward' = opening the universe, 'backward' = returning home
    stage: STAGE.IDLE,

    // Exact origin of the interaction — everything is born here.
    clickX: 0,
    clickY: 0,

    // Phase progress values (0 → 1), each driven by one leg of the GSAP
    // master timeline. Scene components read whichever ones are relevant
    // to the current `stage`.
    coreProgress: 0,       // 0→1, the tiny point's own birth/pulse
    distortionProgress: 0, // 0→1, space-bend strength for PostFX / background warp
    anticipateProgress: 0,
    collapseProgress: 0,
    gatherProgress: 0,
    vortexProgress: 0,
    portalProgress: 0,
    diveProgress: 0,
    disperseProgress: 0,

    // How strongly the portal influences the environment (0 → 1).
    // Ramps up during VORTEX/PORTAL so nearby DOM and particles react
    // before the gateway fully opens — makes the portal feel like a force.
    environmentInfluence: 0,

    // NEW — oscillates around 1 (e.g. 0.9-1.15) during the PORTAL
    // stabilize hold, right before the dive starts. Feeds "the portal
    // should never feel like a static glowing ring" (point 11): once
    // PortalRing reads this, it can multiply ring scale/emissive
    // intensity by it for a breathing effect, and ParticleField can use
    // it to nudge orbiting-particle speed. Inert until a scene component
    // consumes it — safe to leave as-is if nothing reads it yet.
    portalBreath: 0,

    // Post-arrival ambient drift (0 → 1, stays at 1 after arrival).
    // Drives gentle floating particles, camera breathing, soft lighting.
    // NOTE: the portal canvas unmounts once the transition completes (see
    // PortalTransitionProvider's canvasMounted flag) — that's intentional
    // for performance, but it means this field can only drive ambience
    // *during* the transition/arrival-pause window, not indefinitely
    // after. Point 10's "always feel alive" ambient motion belongs to the
    // destination page's own persistent visuals, not this transition
    // system — see the summary notes for details.
    ambientDrift: 0,

    // Ambient values updated every frame regardless of stage.
    time: 0,
  };
}

// Resets all progress values back to 0 without touching `active`/`direction`,
// used between phases if a builder wants a clean slate.
export function resetProgress(state) {
  state.coreProgress = 0;
  state.distortionProgress = 0;
  state.anticipateProgress = 0;
  state.collapseProgress = 0;
  state.gatherProgress = 0;
  state.vortexProgress = 0;
  state.portalProgress = 0;
  state.diveProgress = 0;
  state.disperseProgress = 0;
  state.environmentInfluence = 0;
  state.portalBreath = 0;
  state.ambientDrift = 0;
}
