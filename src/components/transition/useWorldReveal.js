// useWorldReveal.js
//
// Call this on mount of any page that's a portal destination (or a
// homepage being reconstructed on the way back). It fades/grows elements
// in group by group so the new world constructs itself progressively.
//
// FIX: previously watched a one-shot `window` CustomEvent
// (`portal:disperse`). One-shot DOM events are inherently racy with
// component mount timing — if the listener isn't attached at the exact
// instant the event fires, it's gone, and the content (hidden by
// portalDom.js's CSS guard) never gets revealed. This now watches
// `disperseKey`, a counter exposed through PortalTransitionProvider's
// context: since it's normal React state, every render sees the current
// value, so there's no window in which the signal can be "missed."
//
// A bounded fallback timer is still kept as a last line of defense, in
// case `isTransitioning` is somehow true with no transition actually able
// to complete (see PortalTransitionProvider's own safety timeout, which
// this is intentionally shorter than, so this page usually recovers
// first).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortalTransition } from './PortalTransitionProvider';

const REVEAL_ORDER = [
  'environment',
  'lighting',
  'atmosphere',
  'ground',
  'objects',       // large structures
  'cards',         // floating objects / project cards
  'text',          // headings, body copy
  'interactive',   // buttons, inputs, interactive demos
  'ui',            // nav elements, status bars
];

const GROUP_CONFIG = {
  environment: { y: 0, scale: 0.98, blur: 5, duration: 1.8, ease: 'power2.out' },
  lighting:    { y: 0, scale: 1, blur: 4, duration: 1.6, ease: 'power1.out' },
  atmosphere:  { y: 0, scale: 1, blur: 5, duration: 1.8, ease: 'power1.out' },
  ground:      { y: 30, scale: 0.96, blur: 3, duration: 1.5, ease: 'power2.out' },
  objects:     { y: 40, scale: 0.92, blur: 4, duration: 1.6, ease: 'power3.out' },
  cards:       { y: 35, scale: 0.9, blur: 3, duration: 1.4, ease: 'back.out(1.1)' },
  text:        { y: 20, scale: 0.97, blur: 2, duration: 1.2, ease: 'power2.out' },
  interactive: { y: 18, scale: 0.95, blur: 1, duration: 1.0, ease: 'power2.out' },
  ui:          { y: 12, scale: 0.98, blur: 1, duration: 0.9, ease: 'power2.out' },
};

const DEFAULT_CONFIG = { y: 24, scale: 0.94, blur: 4, duration: 1.2, ease: 'power2.out' };

// Independent last-resort timer — shorter than the provider's own
// SAFETY_TIMEOUT_MS (9000ms) so, in the worst case, this page reveals
// itself before the provider even finishes force-cleaning-up.
const FALLBACK_MS = 2600;

function runReveal(container, delay, tweensOut) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentDelay = delay;

  REVEAL_ORDER.forEach((group) => {
    const els = container.querySelectorAll(`[data-reveal="${group}"]`);
    if (!els.length) return;

    if (prefersReduced) {
      gsap.set(els, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'all' });
      return;
    }

    const cfg = GROUP_CONFIG[group] || DEFAULT_CONFIG;

    const tween = gsap.fromTo(els, {
      opacity: 0,
      y: cfg.y,
      scale: cfg.scale,
      filter: `blur(${cfg.blur}px)`,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: cfg.duration,
      ease: cfg.ease,
      stagger: 0.12,
      delay: currentDelay,
      overwrite: 'auto',
      clearProps: 'filter',
    });

    tweensOut.push(tween);
    currentDelay += (cfg.duration * 0.7);
  });
}

export function useWorldReveal(containerRef, { enabled = true, delay = 0.1 } = {}) {
  const { isTransitioning, disperseKey } = usePortalTransition();
  // Captured once, on first render — used to detect when disperseKey
  // advances *past* whatever it was when this page mounted, rather than
  // reacting to a stale value left over from some earlier transition.
  const baselineKeyRef = useRef(disperseKey);
  const hasRevealedRef = useRef(false);
  const tweensRef = useRef([]);

  useEffect(() => {
    if (!enabled || !containerRef.current || hasRevealedRef.current) return undefined;

    if (!isTransitioning) {
      // Direct load / no transition in flight — reveal immediately, no
      // need to wait on anything.
      hasRevealedRef.current = true;
      runReveal(containerRef.current, delay, tweensRef.current);
      return undefined;
    }

    if (disperseKey !== baselineKeyRef.current) {
      // The transition that brought us here has already dispersed by the
      // time this effect ran — reveal now, no delay needed.
      hasRevealedRef.current = true;
      runReveal(containerRef.current, 0, tweensRef.current);
      return undefined;
    }

    // Still mid-transition and disperse hasn't happened yet — the
    // baseline-check above will catch it on the next render once
    // disperseKey changes (it's a dependency below). This fallback is
    // purely defensive, for the case where disperse never fires at all.
    const fallback = setTimeout(() => {
      if (hasRevealedRef.current || !containerRef.current) return;
      hasRevealedRef.current = true;
      runReveal(containerRef.current, 0, tweensRef.current);
    }, FALLBACK_MS);

    return () => {
      clearTimeout(fallback);
      // React 18 Strict Mode cleanup: kill tweens and reset the revealed flag
      // so the animation can properly run again on remount.
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
      hasRevealedRef.current = false;
    };
  }, [containerRef, enabled, delay, isTransitioning, disperseKey]);
}
