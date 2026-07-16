// useWorldReveal.js
//
// Call this on mount of any page that's a portal destination (or a
// homepage being reconstructed on the way back). It fades/grows elements
// in group by group so the new world constructs itself progressively —
// "nothing pops into existence."
//
// The reveal order matches the requested cinematic sequence:
//   Environment → Lighting → Atmosphere → Large Structures →
//   Floating Objects → Interactive Elements → UI
//
// Usage:
//   const rootRef = useRef(null);
//   useWorldReveal(rootRef);
//   ...
//   <div ref={rootRef}>
//     <div data-reveal="environment">...</div>
//     <div data-reveal="cards">
//       <Card data-reveal="cards" />
//     </div>
//   </div>
//
// Groups with no matching elements are skipped automatically.
//
// NOTE: the actual "don't flash unstyled content" guarantee now comes from
// portalDom.js's CSS reveal guard (a synchronous CSS rule that force-hides
// [data-reveal] elements while a transition is in flight) — this hook only
// controls *when the GSAP entrance animation starts*, not whether the
// elements are visible before then. See portalDom.js for details.

import { useEffect } from 'react';
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

// Per-group animation config — each group has its own personality
// so the arrival feels organic rather than uniform.
const GROUP_CONFIG = {
  environment: { y: 0, scale: 0.98, blur: 8, duration: 1.8, ease: 'power2.out' },
  lighting:    { y: 0, scale: 1, blur: 6, duration: 1.6, ease: 'power1.out' },
  atmosphere:  { y: 0, scale: 1, blur: 8, duration: 1.8, ease: 'power1.out' },
  ground:      { y: 30, scale: 0.96, blur: 4, duration: 1.5, ease: 'power2.out' },
  objects:     { y: 40, scale: 0.92, blur: 6, duration: 1.6, ease: 'power3.out' },
  cards:       { y: 35, scale: 0.9, blur: 5, duration: 1.4, ease: 'back.out(1.1)' },
  text:        { y: 20, scale: 0.97, blur: 3, duration: 1.2, ease: 'power2.out' },
  interactive: { y: 18, scale: 0.95, blur: 2, duration: 1.0, ease: 'power2.out' },
  ui:          { y: 12, scale: 0.98, blur: 2, duration: 0.9, ease: 'power2.out' },
};

const DEFAULT_CONFIG = { y: 24, scale: 0.94, blur: 6, duration: 1.2, ease: 'power2.out' };

// Safety-net only — normally 'portal:disperse' fires well before this.
// Bumped from 2500ms to comfortably clear the new, longer dive (~4.2s)
// plus the pre-dive portal formation/stabilize time, so it never fires
// early and cuts the reveal off mid-sequence.
const FALLBACK_MS = 4200;

import { usePortalTransition } from './PortalTransitionProvider';

export function useWorldReveal(containerRef, { enabled = true, delay = 0.1 } = {}) {
  const { isTransitioning } = usePortalTransition();

  useEffect(() => {
    if (!enabled || !containerRef.current) return undefined;

    let hasRevealed = false;
    let tweens = []; // Track tweens for React Strict Mode cleanup

    const startReveal = (d) => {
      if (hasRevealed) return;
      hasRevealed = true;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let currentDelay = d;

      REVEAL_ORDER.forEach((group) => {
        const els = containerRef.current.querySelectorAll(`[data-reveal="${group}"]`);
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
          overwrite: 'auto', // Fix concurrent tween fights
          clearProps: 'filter', // Just clear filter, keep opacity/transform so they don't snap wildly
        });
        
        tweens.push(tween);

        // 30% overlap for the next group
        currentDelay += (cfg.duration * 0.7);
      });
    };

    let onDisperse;
    let fallback;

    if (isTransitioning) {
      onDisperse = () => startReveal(0);
      window.addEventListener('portal:disperse', onDisperse, { once: true });
      
      fallback = setTimeout(() => {
        startReveal(0);
      }, FALLBACK_MS);
    } else {
      startReveal(delay);
    }

    return () => {
      if (onDisperse) window.removeEventListener('portal:disperse', onDisperse);
      if (fallback) clearTimeout(fallback);
      tweens.forEach(t => t.kill()); // Crucial for React 18 Strict Mode!
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, enabled, delay]);
}
