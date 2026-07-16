// portalTimelines.js
//
// One GSAP timeline per direction. Each is the single source of truth for
// timing — DOM tweens (ghost logo, homepage collapse, energy pulse) and
// scene tweens (transitionState progress values) live on the SAME timeline,
// positioned with labels, so they can never drift out of sync.
//
// The narrative arc:
//   1. ANTICIPATE  — freeze, energy pulse, reality begins to distort
//   2. LOGO FOCUS  — the trigger becomes the visual focus
//   3. COLLAPSE    — the current world is torn apart toward the portal
//   4. GATHER      — remnants dissolve into particles
//   5. VORTEX/PORTAL — particles spiral into a dimensional gateway, then
//      a short "breathing" hold while it stabilizes
//   6. DIVE        — approach → accelerate → cruise → decelerate
//   7. DISPERSE    — gated on the destination's assets being preloaded,
//      then the portal dissolves and the new world constructs itself
//   8. AMBIENT     — subtle life after arrival
//
// Fix for feedback point 1 (destination page visibly loading): asset
// preloading for the target route is kicked off at the very top of each
// builder — as early as physically possible — and the 'disperse' label is
// gated with tl.addPause() so the reveal can never start before the
// destination's critical images (and webfonts) are warm in cache. See
// assetPreload.js and portalDom.js's reveal guard for the other half.

import gsap from 'gsap';
import { STAGE, resetProgress } from './transitionState';
import { EASE, DIVE_EASE_CHAIN } from './portalEasing';
import {
  createGhostLogo, removeGhostLogo, viewportCenter, getCollapseTargets,
  createEnergyCore, removeEnergyCore,
  setEnvironmentInfluence, clearEnvironmentInfluence,
  setEnvironmentOrigin, clearEnvironmentOrigin,
} from './portalDom';
import { preloadRouteAssets } from './assetPreload';

// Dive is now four legs instead of three (feedback point 4 — "camera
// slowly approaches" needed to be its own beat, not folded into the
// acceleration) and runs slightly longer overall (feedback point 5 —
// extend the tunnel). 0.5 approach + 1.0 accelerate + 1.7 cruise + 1.0
// decelerate = 4.2s total, up from the previous 3.5s.
const DIVE_LEGS = [
  { to: 0.06, duration: 0.5 }, // approach — slow creep, portal still settling
  { to: 0.32, duration: 1.0 }, // accelerate — the real slingshot
  { to: 0.82, duration: 1.7 }, // cruise — max speed through the tunnel
  { to: 1.00, duration: 1.0 }, // decelerate — gentle arrival
];
const DIVE_TOTAL = DIVE_LEGS.reduce((sum, leg) => sum + leg.duration, 0);

export function buildForwardTimeline({
  logoEl, clickX, clickY, transitionState, navigate, targetPath, onComplete,
}) {
  resetProgress(transitionState);
  transitionState.active = true;
  transitionState.direction = 'forward';
  transitionState.stage = STAGE.IDLE;

  // Kick preloading off immediately — this is the single most important
  // line for fixing the blank-screen bug. It has the entire ~8s of
  // animation ahead of it to warm the cache before disperse needs it.
  const preloadPromise = preloadRouteAssets(targetPath);

  const startRect = logoEl.getBoundingClientRect();
  const elCenter = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2,
  };
  // The real click position — this is where the portal is BORN.
  // Falls back to element center only if no coordinates were passed.
  const origin = {
    x: typeof clickX === 'number' ? clickX : elCenter.x,
    y: typeof clickY === 'number' ? clickY : elCenter.y,
  };
  transitionState.clickX = origin.x;
  transitionState.clickY = origin.y;

  const ghost = createGhostLogo(logoEl);
  const center = viewportCenter();
  const deltaX = center.x - elCenter.x;
  const deltaY = center.y - elCenter.y;
  const collapseTargets = getCollapseTargets(document);

  const core = createEnergyCore(origin.x, origin.y);
  setEnvironmentOrigin(origin.x, origin.y);
  const corePos = { x: origin.x, y: origin.y };

  const tl = gsap.timeline({
    defaults: { overwrite: 'auto' },
    onUpdate: () => {
      setEnvironmentInfluence(transitionState.environmentInfluence);
      setEnvironmentOrigin(corePos.x, corePos.y);
      gsap.set(core, { left: corePos.x, top: corePos.y });
    },
    onComplete: () => {
      removeGhostLogo(ghost);
      removeEnergyCore(core);
      clearEnvironmentInfluence();
      clearEnvironmentOrigin();
      transitionState.stage = STAGE.AMBIENT;
      transitionState.active = false;
      onComplete?.();
    },
  });

  // ==== Phase 0 — IGNITE: a point of energy is born at the click ==========
  tl.set(logoEl, { autoAlpha: 0 })
    .call(() => { transitionState.stage = STAGE.ANTICIPATE; })
    .to(core, { opacity: 1, duration: 0.12, ease: 'power1.out' }, 0)
    .to(transitionState, { coreProgress: 0.4, duration: 0.18, ease: 'power2.out' }, 0)
    .to(core, { scale: 1.6, duration: 0.16, ease: 'power1.out' }, 0.12)
    .to(core, { scale: 1, duration: 0.22, ease: 'power1.inOut' }, 0.28)
    .to(transitionState, { environmentInfluence: 0.15, duration: 0.3, ease: 'power1.out' }, 0)
    .to(core, { scale: 1.9, duration: 0.2, ease: 'power1.out' }, 0.5)
    .to(core, { scale: 1.3, duration: 0.25, ease: 'power1.inOut' }, 0.7)
    .to(transitionState, { coreProgress: 1, duration: 0.45, ease: EASE.gather }, 0.5);

  tl.fromTo(ghost, { scale: 1 }, { scale: 1.1, duration: 0.25, ease: 'power1.out' }, 0.15)
    .to(ghost, { scale: 1, duration: 0.25, ease: 'power1.in' }, 0.4);

  // ==== Phase 1 — LOGO FOCUS: core migrates click → center, growing =======
  tl.addLabel('logoFocus', '+=0.05')
    .to(ghost, { x: deltaX, y: deltaY, scale: 2.8, duration: 1.0, ease: EASE.logoFocus }, 'logoFocus')
    .to(ghost, { rotation: 6, duration: 0.5, ease: 'sine.inOut' }, 'logoFocus')
    .to(ghost, { rotation: 0, duration: 0.5, ease: 'sine.inOut' }, 'logoFocus+=0.5')
    .to(corePos, { x: center.x, y: center.y, duration: 1.0, ease: EASE.logoFocus }, 'logoFocus')
    .to(core, { scale: 2.4, duration: 1.0, ease: EASE.logoFocus }, 'logoFocus');

  // ==== Phase 2 — WORLD COLLAPSE (reacting to the growing energy) =========
  tl.to(transitionState, { environmentInfluence: 0.8, duration: 1.2, ease: EASE.envInfluence }, 'logoFocus');

  // Ambient lighting change (feedback point 3) — driven directly here
  // rather than relying on the homepage's own CSS reacting to --portal-pull,
  // so the effect is guaranteed regardless of how the user's page CSS is
  // set up. will-change is set once and cleared at disperse to avoid
  // leaving a stray compositor layer behind (feedback point 12).
  tl.set(document.body, { willChange: 'filter' }, 0)
    .to(document.body, {
      filter: 'saturate(1.35) contrast(1.12) brightness(0.94)',
      duration: 1.1,
      ease: EASE.envInfluence,
    }, 'logoFocus');

  collapseTargets.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // Violent pull inward
    const dx = (center.x - cx) * 0.85;
    const dy = (center.y - cy) * 0.85;
    const rot = (Math.random() - 0.5) * 45;
    // Stretch and warp toward the core
    tl.to(el, {
      x: dx, y: dy, scale: 0.3, scaleY: 0.1, rotation: rot, opacity: 0,
      filter: 'blur(8px)', duration: 1.8, ease: EASE.collapse,
    }, `logoFocus+=${0.15 + i * 0.04}`);
  });

  // ==== Phase 3 — PARTICLES GATHER toward the core ==========================
  tl.addLabel('particles', 'logoFocus+=1.1')
    .to(ghost, { opacity: 0, filter: 'blur(12px)', duration: 0.4, ease: 'power1.out' }, 'particles')
    .to(core, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 'particles+=0.15')
    .call(() => { transitionState.stage = STAGE.GATHER; }, [], 'particles')
    .to(transitionState, { gatherProgress: 1, duration: 1.0, ease: EASE.gather }, 'particles')
    .to(transitionState, { environmentInfluence: 1, duration: 0.9, ease: EASE.envInfluence }, 'particles')
    .to(transitionState, { distortionProgress: 0.35, duration: 1.0, ease: 'power1.out' }, 'particles');

  // ==== Phase 4 — VORTEX + Phase 5 — RING GROWS FROM THE CORE ==============
  tl.addLabel('portal', 'particles+=0.8')
    .call(() => { transitionState.stage = STAGE.VORTEX; }, [], 'portal')
    .to(transitionState, { vortexProgress: 1, duration: 0.9, ease: EASE.vortex }, 'portal')
    .to(transitionState, { distortionProgress: 0.7, duration: 0.9, ease: 'power1.inOut' }, 'portal')
    .call(() => { transitionState.stage = STAGE.PORTAL; }, [], 'portal+=0.55')
    .to(transitionState, { portalProgress: 1, duration: 1.3, ease: EASE.portalForm }, 'portal+=0.55')
    .to(transitionState, { distortionProgress: 1, duration: 1.1, ease: 'power2.inOut' }, 'portal+=0.55')
    .to(transitionState, { distortionProgress: 0.7, duration: 0.5, ease: 'power1.inOut' }, 'portal+=1.75');

  // ---- Stabilize hold: the portal "breathes" before the camera moves ----
  // (feedback point 11 — "the portal should never feel like a static
  // glowing ring"). portalProgress finishes at 'portal+1.85'; this
  // oscillates portalBreath a few times during the hold. It's inert until
  // a scene component (PortalRing / ParticleField) reads it — see
  // transitionState.js.
  tl.to(transitionState, {
    portalBreath: 1.12, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 3,
  }, 'portal+=1.9');

  // ==== Phase 6 — CAMERA DIVE: approach → accelerate → cruise → decelerate =
  tl.addLabel('dive', 'portal+=2.6')
    .call(() => { transitionState.stage = STAGE.DIVE; }, [], 'dive');

  let elapsed = 0;
  DIVE_LEGS.forEach((leg, i) => {
    tl.to(transitionState, { diveProgress: leg.to, duration: leg.duration, ease: DIVE_EASE_CHAIN[i] },
      elapsed === 0 ? 'dive' : `dive+=${elapsed}`);
    elapsed += leg.duration;
  });

  // Route swap fires once the camera is fully "inside" — past acceleration,
  // early into the cruise — where the portal fully obscures the view.
  const navigateAt = DIVE_LEGS[0].duration + DIVE_LEGS[1].duration + DIVE_LEGS[2].duration * 0.25;
  tl.call(() => navigate(targetPath), [], `dive+=${navigateAt}`);

  // ==== Phase 7 — DISPERSE & WORLD REVEAL ===================================
  tl.addLabel('disperse', `dive+=${DIVE_TOTAL - 0.35}`)
    // Gate: do not reveal the destination until its critical assets are
    // confirmed warm (or the preload timeout has elapsed). In the normal
    // case this resolves instantly since preloadPromise had the whole
    // dive to finish; this is the safety net for slow connections.
    .addPause('disperse', () => {
      preloadPromise.then(() => {
        if (tl.paused()) tl.resume();
      });
    })
    .call(() => {
      transitionState.stage = STAGE.DISPERSE;
      window.dispatchEvent(new Event('portal:disperse'));
    }, [], 'disperse')
    .to(transitionState, { disperseProgress: 1, distortionProgress: 0, duration: 1.2, ease: EASE.disperse }, 'disperse')
    .to(document.body, {
      filter: 'saturate(1) contrast(1) brightness(1)',
      duration: 1.0,
      ease: 'power1.out',
      clearProps: 'filter,willChange',
    }, 'disperse')
    .to('#portal-canvas-wrapper', { autoAlpha: 0, duration: 1.0, ease: 'power1.out' }, 'disperse+=0.2')
    // Cinematic 300-500ms lock before user interaction returns (point 9)
    .to({}, { duration: 0.5 });

  return tl;
}

// ============================================================================
// BACKWARD TIMELINE — returning from the destination to the home page
// ============================================================================

export function buildBackwardTimeline({ logoEl, transitionState, navigate, targetPath, onComplete }) {
  resetProgress(transitionState);
  transitionState.active = true;
  transitionState.direction = 'backward';
  // Backward starts "inside" the portal — seed full progress
  transitionState.stage = STAGE.DIVE;
  transitionState.diveProgress = 1;
  transitionState.portalProgress = 1;
  transitionState.vortexProgress = 1;
  transitionState.gatherProgress = 1;
  transitionState.environmentInfluence = 1;

  // Same preload guarantee applies on the way home.
  const preloadPromise = preloadRouteAssets(targetPath);

  const ghost = createGhostLogo(logoEl);
  gsap.set(ghost, { opacity: 0, scale: 2.8 });
  const center = viewportCenter();
  const endRect = logoEl.getBoundingClientRect();
  const endCenter = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2,
  };
  const deltaX = endCenter.x - center.x;
  const deltaY = endCenter.y - center.y;

  const collapseTargets = getCollapseTargets(document);

  const tl = gsap.timeline({
    defaults: { overwrite: 'auto' },
    onUpdate: () => {
      setEnvironmentInfluence(transitionState.environmentInfluence);
    },
    onComplete: () => {
      removeGhostLogo(ghost);
      clearEnvironmentInfluence();
      gsap.set(logoEl, { autoAlpha: 1 });
      transitionState.active = false;
      transitionState.stage = STAGE.IDLE;
      onComplete?.();
    },
  });

  // Fade canvas in smoothly so it's not a hard cut.
  tl.set('#portal-canvas-wrapper', { autoAlpha: 0 })
    .to('#portal-canvas-wrapper', { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });

  // Collapse destination page elements
  collapseTargets.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (center.x - cx) * 0.5;
    const dy = (center.y - cy) * 0.5;
    const rot = (Math.random() - 0.5) * 14;
    tl.to(
      el,
      {
        x: dx, y: dy,
        scale: 0.75, rotation: rot,
        opacity: 0, filter: 'blur(8px)',
        duration: 0.7, ease: EASE.collapse,
      },
      i * 0.03
    );
  });

  // Camera exits portal — dive in reverse (fast → cruise → gentle).
  // Kept as the original 3-leg curve since the backward trip wasn't
  // flagged in the feedback and this keeps the change surface smaller.
  const [approach, accelerate, cruise, decelerate] = DIVE_LEGS;
  tl.addLabel('exit', 0.15)
    .to(transitionState, { diveProgress: 0.75, duration: decelerate.duration, ease: 'power3.in' }, 'exit')
    .to(transitionState, { diveProgress: 0.25, duration: cruise.duration, ease: 'none' }, `exit+=${decelerate.duration}`)
    .to(transitionState, { diveProgress: 0, duration: accelerate.duration, ease: 'expo.out' }, `exit+=${decelerate.duration + cruise.duration}`);

  // Route swap while fully immersed
  tl.call(() => navigate(targetPath), [], `exit+=${decelerate.duration + cruise.duration * 0.5}`);

  // Portal shrinks, particles flow back through the vortex
  tl.addLabel('portalShrink', `exit+=${decelerate.duration + cruise.duration + accelerate.duration}`)
    .addPause('portalShrink', () => {
      preloadPromise.then(() => {
        if (tl.paused()) tl.resume();
      });
    })
    .call(() => { transitionState.stage = STAGE.PORTAL; }, [], 'portalShrink')
    .to(transitionState, { portalProgress: 0, duration: 0.65, ease: EASE.portalClose }, 'portalShrink')
    .to(transitionState, { environmentInfluence: 0.3, duration: 0.8, ease: 'power1.inOut' }, 'portalShrink')
    .call(() => { transitionState.stage = STAGE.VORTEX; }, [], 'portalShrink+=0.5')
    .to(transitionState, { vortexProgress: 0, duration: 0.6, ease: EASE.vortex }, 'portalShrink+=0.5')
    .call(() => { transitionState.stage = STAGE.GATHER; }, [], 'portalShrink+=0.9')
    .to(transitionState, { gatherProgress: 0, duration: 0.7, ease: EASE.reconstruct }, 'portalShrink+=0.9')
    .to(transitionState, { environmentInfluence: 0, duration: 0.5, ease: 'power1.in' }, 'portalShrink+=1.1');

  // Rebuild logo and slide it back to the navbar
  tl.addLabel('rebuildLogo', 'portalShrink+=1.3')
    .call(() => { window.dispatchEvent(new Event('portal:disperse')); }, [], 'rebuildLogo')
    .to(ghost, { opacity: 1, duration: 0.4, ease: 'power1.in' }, 'rebuildLogo')
    .to(ghost, { x: deltaX, y: deltaY, scale: 1, duration: 0.85, ease: EASE.logoFocus }, 'rebuildLogo')
    .to('#portal-canvas-wrapper', { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, 'rebuildLogo+=0.25');

  return tl;
}
