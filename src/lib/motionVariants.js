/**
 * Shared Framer Motion variants.
 *
 * Every timing/easing constant used by the animated sections lives here so the
 * whole site stays on one motion language. Nothing in this file touches colour,
 * typography or spacing - variants only ever drive transform / opacity /
 * clip-path / filter.
 */

// Brutalist "snap" curve: slow start, hard arrival. Used for masked wipes.
export const EASE_WIPE = [0.76, 0, 0.24, 1];
// Soft settle used for translation-based reveals.
export const EASE_OUT = [0.22, 1, 0.36, 1];

/**
 * Left-to-right clip-path mask wipe. The element is fully laid out the whole
 * time (only the mask moves), so it reserves its own space and contributes
 * zero CLS.
 */
export const wipeIn = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.9, ease: EASE_WIPE },
  },
};

/** Generic stagger container. Pass custom={staggerSeconds} to override. */
export const staggerParent = {
  hidden: {},
  visible: (stagger = 0.1) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

/** Slide + de-blur entry used by the participation rows. */
export const blurSlideIn = {
  hidden: { opacity: 0, x: -24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

/** Card entry for the takeaway grid. Delay is supplied per-card (diagonal wave). */
export const cardRise = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT, delay },
  }),
};

/** Photo "developing" reveal: mask up from the bottom while easing out of a punch-in. */
export const photoReveal = {
  hidden: { clipPath: 'inset(100% 0 0 0)', scale: 1.15 },
  visible: (delay = 0) => ({
    clipPath: 'inset(0% 0 0 0)',
    scale: 1,
    transition: { duration: 0.8, ease: EASE_WIPE, delay },
  }),
};

/** Level badge: spring pop, played after its row has landed. */
export const badgePop = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 18, delay: 0.35 },
  },
};

/**
 * Reduced-motion equivalents. Same variant names, no transforms at all - just
 * an opacity swap - so callers can switch the whole map in one line.
 */
export const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};
