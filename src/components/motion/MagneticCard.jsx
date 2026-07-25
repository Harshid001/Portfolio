import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Cursor-tracked spotlight + subtle 3D tilt.
 *
 * Pointer position is written to motion values (never React state), so moving
 * the mouse re-renders nothing - Framer writes straight to the compositor.
 * Only transform and opacity are animated.
 *
 * Both effects are disabled entirely when `disabled` is true, which the caller
 * sets for touch/mobile and for prefers-reduced-motion.
 */
const MagneticCard = ({ children, disabled = false, style, className, ...rest }) => {
  const ref = useRef(null);

  // Normalised -0.5..0.5 pointer offset within the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Raw pixel position for the spotlight gradient.
  const sx = useMotionValue(-999);
  const sy = useMotionValue(-999);
  const glow = useMotionValue(0);

  const spring = { stiffness: 260, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), spring);

  // Hooks must run unconditionally, so the gradient is always derived even when
  // the spotlight element is not rendered.
  const spotlight = useTransform(
    [sx, sy],
    ([x, y]) =>
      `radial-gradient(220px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 70%)`,
  );

  const handleMove = (e) => {
    if (disabled) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x / r.width - 0.5);
    py.set(y / r.height - 0.5);
    sx.set(x);
    sy.set(y);
  };

  const handleEnter = () => {
    if (!disabled) glow.set(1);
  };

  const handleLeave = () => {
    // Spring back to flat rather than snapping.
    px.set(0);
    py.set(0);
    glow.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transformStyle: disabled ? undefined : 'preserve-3d',
        rotateX: disabled ? 0 : rotateX,
        rotateY: disabled ? 0 : rotateY,
      }}
      {...rest}
    >
      {/*
        Spotlight. Uses currentColor-neutral white at 6% so it reads as a light
        wash on any theme and introduces no new palette entry.
      */}
      {!disabled && (
        <motion.span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: glow,
            background: spotlight,
            transition: 'opacity 0.25s',
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default MagneticCard;
