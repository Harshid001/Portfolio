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

const DIVE_LEGS = [
  { to: 0.06, duration: 0.15 }, // approach
  { to: 0.32, duration: 0.35 }, // accelerate
  { to: 0.82, duration: 0.55 }, // cruise
  { to: 1.00, duration: 0.35 }, // decelerate
];
const DIVE_TOTAL = DIVE_LEGS.reduce((sum, leg) => sum + leg.duration, 0); // 1.4s

export function buildForwardTimeline({
  logoEl, clickX, clickY, transitionState, navigate, targetPath, onComplete, onDisperse,
}) {
  resetProgress(transitionState);
  transitionState.active = true;
  transitionState.direction = 'forward';
  transitionState.stage = STAGE.IDLE;

  const preloadPromise = preloadRouteAssets(targetPath);

  const startRect = logoEl.getBoundingClientRect();
  const elCenter = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2,
  };
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

  let lastInfluence = -1;
  let lastCoreX = null;
  let lastCoreY = null;

  const tl = gsap.timeline({
    defaults: { overwrite: 'auto' },
    onUpdate: () => {
      const influence = transitionState.environmentInfluence;
      if (influence !== lastInfluence) {
        setEnvironmentInfluence(influence);
        lastInfluence = influence;
      }
      if (corePos.x !== lastCoreX || corePos.y !== lastCoreY) {
        setEnvironmentOrigin(corePos.x, corePos.y);
        gsap.set(core, { x: corePos.x - origin.x, y: corePos.y - origin.y });
        lastCoreX = corePos.x;
        lastCoreY = corePos.y;
      }
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

  tl.addLabel('logoFocus', '+=0.05')
    .to(ghost, { x: deltaX, y: deltaY, scale: 2.8, duration: 0.6, ease: EASE.logoFocus }, 'logoFocus')
    .to(ghost, { rotation: 6, duration: 0.3, ease: 'sine.inOut' }, 'logoFocus')
    .to(ghost, { rotation: 0, duration: 0.3, ease: 'sine.inOut' }, 'logoFocus+=0.3')
    .to(corePos, { x: center.x, y: center.y, duration: 0.6, ease: EASE.logoFocus }, 'logoFocus')
    .to(core, { scale: 2.4, duration: 0.6, ease: EASE.logoFocus }, 'logoFocus');

  tl.to(transitionState, { environmentInfluence: 0.8, duration: 0.7, ease: EASE.envInfluence }, 'logoFocus');
  tl.to('#portal-ambient-tint', { opacity: 1, duration: 0.65, ease: EASE.envInfluence }, 'logoFocus');
  tl.set(collapseTargets, { willChange: 'transform, opacity' }, 'logoFocus');

  collapseTargets.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (center.x - cx) * 0.85;
    const dy = (center.y - cy) * 0.85;
    const rot = (Math.random() - 0.5) * 45;
    tl.to(el, {
      x: dx, y: dy, scale: 0.3, scaleY: 0.1, rotation: rot, opacity: 0,
      filter: 'blur(4px)',
      duration: 0.8,
      ease: EASE.collapse,
      clearProps: 'willChange',
    }, `logoFocus+=${0.08 + i * 0.02}`);
  });

  tl.addLabel('particles', 'logoFocus+=0.55')
    .to(ghost, { opacity: 0, filter: 'blur(6px)', duration: 0.25, ease: 'power1.out' }, 'particles')
    .to(core, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 'particles+=0.08')
    .call(() => { transitionState.stage = STAGE.GATHER; }, [], 'particles')
    .to(transitionState, { gatherProgress: 1, duration: 0.5, ease: EASE.gather }, 'particles')
    .to(transitionState, { environmentInfluence: 1, duration: 0.45, ease: EASE.envInfluence }, 'particles')
    .to(transitionState, { distortionProgress: 0.35, duration: 0.5, ease: 'power1.out' }, 'particles');

  tl.addLabel('portal', 'particles+=0.35')
    .call(() => { transitionState.stage = STAGE.VORTEX; }, [], 'portal')
    .to(transitionState, { vortexProgress: 1, duration: 0.45, ease: EASE.vortex }, 'portal')
    .to(transitionState, { distortionProgress: 0.7, duration: 0.45, ease: 'power1.inOut' }, 'portal')
    .call(() => { transitionState.stage = STAGE.PORTAL; }, [], 'portal+=0.25')
    .to(transitionState, { portalProgress: 1, duration: 0.6, ease: EASE.portalForm }, 'portal+=0.25')
    .to(transitionState, { distortionProgress: 1, duration: 0.5, ease: 'power2.inOut' }, 'portal+=0.25')
    .to(transitionState, { distortionProgress: 0.7, duration: 0.25, ease: 'power1.inOut' }, 'portal+=0.75');

  tl.to(transitionState, {
    portalBreath: 1.12, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: 1,
  }, 'portal+=0.85');

  tl.addLabel('dive', 'portal+=1.1')
    .call(() => { transitionState.stage = STAGE.DIVE; }, [], 'dive');

  let elapsed = 0;
  DIVE_LEGS.forEach((leg, i) => {
    tl.to(transitionState, { diveProgress: leg.to, duration: leg.duration, ease: DIVE_EASE_CHAIN[i] },
      elapsed === 0 ? 'dive' : `dive+=${elapsed}`);
    elapsed += leg.duration;
  });

  const navigateAt = DIVE_LEGS[0].duration + DIVE_LEGS[1].duration + DIVE_LEGS[2].duration * 0.3;
  tl.call(() => navigate(targetPath), [], `dive+=${navigateAt}`);

  // FIX: the destination reveal signal now goes through onDisperse (React
  // state, see PortalTransitionProvider) as the primary mechanism. The
  // window event is kept as a secondary signal for any other listeners,
  // but nothing critical depends on it being caught anymore.
  tl.addLabel('disperse', `dive+=${DIVE_TOTAL - 0.15}`)
    .addPause('disperse-=0.01', () => {
      preloadPromise.then(() => {
        if (tl.paused()) tl.resume();
      });
    })
    .call(() => {
      transitionState.stage = STAGE.DISPERSE;
      onDisperse?.();
      window.dispatchEvent(new Event('portal:disperse'));
    }, [], 'disperse')
    .to(transitionState, { disperseProgress: 1, distortionProgress: 0, duration: 0.55, ease: EASE.disperse }, 'disperse')
    .to('#portal-ambient-tint', { opacity: 0, duration: 0.5, ease: 'power1.out' }, 'disperse')
    .to('#portal-canvas-wrapper', { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, 'disperse+=0.1')
    .to({}, { duration: 0.3 });

  tl.timeScale(0.7);

  return tl;
}

export function buildBackwardTimeline({ logoEl, transitionState, navigate, targetPath, onComplete, onDisperse }) {
  resetProgress(transitionState);
  transitionState.active = true;
  transitionState.direction = 'backward';
  transitionState.stage = STAGE.DIVE;
  transitionState.diveProgress = 1;
  transitionState.portalProgress = 1;
  transitionState.vortexProgress = 1;
  transitionState.gatherProgress = 1;
  transitionState.environmentInfluence = 1;

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

  tl.set('#portal-canvas-wrapper', { autoAlpha: 0 })
    .to('#portal-canvas-wrapper', { autoAlpha: 1, duration: 0.25, ease: 'power1.out' });

  tl.set(collapseTargets, { willChange: 'transform, opacity' }, 0);

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
        opacity: 0, filter: 'blur(4px)',
        duration: 0.4,
        ease: EASE.collapse,
        clearProps: 'willChange',
      },
      i * 0.02
    );
  });

  const [approach, accelerate, cruise, decelerate] = DIVE_LEGS;
  tl.addLabel('exit', 0.08)
    .to(transitionState, { diveProgress: 0.75, duration: decelerate.duration, ease: 'power3.in' }, 'exit')
    .to(transitionState, { diveProgress: 0.25, duration: cruise.duration, ease: 'none' }, `exit+=${decelerate.duration}`)
    .to(transitionState, { diveProgress: 0, duration: accelerate.duration, ease: 'expo.out' }, `exit+=${decelerate.duration + cruise.duration}`);

  tl.call(() => navigate(targetPath), [], `exit+=${decelerate.duration + cruise.duration * 0.5}`);

  tl.addLabel('portalShrink', `exit+=${decelerate.duration + cruise.duration + accelerate.duration}`)
    .addPause('portalShrink-=0.01', () => {
      preloadPromise.then(() => {
        if (tl.paused()) tl.resume();
      });
    })
    .call(() => { transitionState.stage = STAGE.PORTAL; }, [], 'portalShrink')
    .to(transitionState, { portalProgress: 0, duration: 0.35, ease: EASE.portalClose }, 'portalShrink')
    .to(transitionState, { environmentInfluence: 0.3, duration: 0.4, ease: 'power1.inOut' }, 'portalShrink')
    .call(() => { transitionState.stage = STAGE.VORTEX; }, [], 'portalShrink+=0.25')
    .to(transitionState, { vortexProgress: 0, duration: 0.3, ease: EASE.vortex }, 'portalShrink+=0.25')
    .call(() => { transitionState.stage = STAGE.GATHER; }, [], 'portalShrink+=0.45')
    .to(transitionState, { gatherProgress: 0, duration: 0.35, ease: EASE.reconstruct }, 'portalShrink+=0.45')
    .to(transitionState, { environmentInfluence: 0, duration: 0.25, ease: 'power1.in' }, 'portalShrink+=0.55');

  tl.addLabel('rebuildLogo', 'portalShrink+=0.65')
    .call(() => {
      onDisperse?.();
      window.dispatchEvent(new Event('portal:disperse'));
    }, [], 'rebuildLogo')
    .to(ghost, { opacity: 1, duration: 0.25, ease: 'power1.in' }, 'rebuildLogo')
    .to(ghost, { x: deltaX, y: deltaY, scale: 1, duration: 0.45, ease: EASE.logoFocus }, 'rebuildLogo')
    .to('#portal-canvas-wrapper', { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 'rebuildLogo+=0.15');

  tl.timeScale(0.7);

  return tl;
}
