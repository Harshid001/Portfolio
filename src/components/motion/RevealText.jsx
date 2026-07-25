import { motion } from 'framer-motion';
import { wipeIn, reducedVariants } from '../../lib/motionVariants';

/**
 * Clip-path mask wipe (left to right).
 *
 * The child text is always laid out - only the mask animates - so the heading
 * occupies its final box from the first frame and contributes zero layout
 * shift. Falls back to a plain opacity fade under prefers-reduced-motion.
 */
const RevealText = ({ children, delay = 0, reduced = false, style, className }) => (
  <motion.span
    className={className}
    variants={reduced ? reducedVariants : wipeIn}
    transition={reduced ? undefined : { ...wipeIn.visible.transition, delay }}
    style={{ display: 'block', willChange: 'clip-path', ...style }}
    // Drop the compositing hint once the wipe is done.
    onAnimationComplete={(e) => {
      if (e && e.currentTarget) e.currentTarget.style.willChange = 'auto';
    }}
  >
    {children}
  </motion.span>
);

export default RevealText;
