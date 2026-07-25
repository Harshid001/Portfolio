// useWorldReveal.js
//
// Progressive on-mount reveal. Elements tagged with `data-reveal="<group>"`
// fade/scale in group by group, in REVEAL_ORDER, so the page assembles
// itself instead of popping in all at once.
//
// This used to be coupled to the portal transition system (it waited on a
// `disperseKey` counter from PortalTransitionProvider). That system has been
// removed, so the hook now simply reveals on mount — which is what it did in
// the common "direct load" case anyway.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
  const hasRevealedRef = useRef(false);
  const tweensRef = useRef([]);

  useEffect(() => {
    if (!enabled || !containerRef.current || hasRevealedRef.current) return undefined;

    hasRevealedRef.current = true;
    runReveal(containerRef.current, delay, tweensRef.current);

    const tweens = tweensRef.current;
    return () => {
      // React StrictMode double-invoke cleanup: kill tweens and reset the
      // flag so the animation runs correctly on remount.
      tweens.forEach((t) => t.kill());
      tweensRef.current = [];
      hasRevealedRef.current = false;
    };
  }, [containerRef, enabled, delay]);
}