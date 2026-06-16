import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TRAIL_COUNT = 5;

const HOVER_SELECTORS = [
  'a', 'button', '[role="button"]', 'input', 'textarea', 'select', 'label[for]',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'video', 'svg',
  '.brutal-card', '.tag', '.btn-primary', '.btn-secondary',
  '.skill-item', '[data-hoverable]',
  'li', 'p', 'span',
].join(', ');

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const trailRefs = useRef([]);

  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const ringX = useSpring(0, { stiffness: 120, damping: 18 });
  const ringY = useSpring(0, { stiffness: 120, damping: 18 });
  const trailPositions = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 })));

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
    window.addEventListener('touchstart', () => setIsTouchDevice(true), { once: true });
    if (isTouchDevice) return;

    let animFrame;
    const mouse = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const onMouseDown = () => {
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 150);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest && e.target.closest(HOVER_SELECTORS)) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e) => {
      if (!e.relatedTarget || (e.relatedTarget.closest && !e.relatedTarget.closest(HOVER_SELECTORS))) {
        setIsHovering(false);
      }
    };

    const animateTrail = () => {
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trailPositions.current[i].x += (trailPositions.current[i - 1].x - trailPositions.current[i].x) * 0.3;
        trailPositions.current[i].y += (trailPositions.current[i - 1].y - trailPositions.current[i].y) * 0.3;
      }
      trailPositions.current[0].x += (mouse.x - trailPositions.current[0].x) * 0.5;
      trailPositions.current[0].y += (mouse.y - trailPositions.current[0].y) * 0.5;
      trailRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate(${trailPositions.current[i].x - 2}px, ${trailPositions.current[i].y - 2}px)`;
      });
      animFrame = requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', onMouseDown);
    animFrame = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', onMouseDown);
      cancelAnimationFrame(animFrame);
    };
  }, [isTouchDevice, dotX, dotY, ringX, ringY]);

  if (isTouchDevice) return null;

  // Derive visual states
  const ringSize = 36;
  const hoverScale = 2.5;

  return (
    <>
      {/* Trails — fade out on hover */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none"
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: `rgba(52, 211, 153, ${isHovering ? 0 : 0.3 - i * 0.06})`,
            zIndex: 9998,
            transition: 'background-color 0.3s ease',
          }}
        />
      ))}

      {/* Radial glow — appears on hover, emerges from cursor center */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          width: 80,
          height: 80,
          marginLeft: -40,
          marginTop: -40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(52, 211, 153, 0) 70%)',
          zIndex: 9997,
        }}
        animate={{
          scale: isHovering ? 3 : 0,
          opacity: isHovering ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />

      {/* Main ring cursor — morphs circle → square on hover */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          zIndex: 9999,
        }}
        animate={{
          scale: isClicking ? 0.7 : isHovering ? hoverScale : 1,
          borderRadius: isHovering ? '4px' : '50%',
          borderColor: isHovering ? 'rgba(52, 211, 153, 0.6)' : 'rgba(52, 211, 153, 0.5)',
          borderWidth: isHovering ? '1.5px' : '1.5px',
          backgroundColor: isHovering ? 'rgba(52, 211, 153, 0.08)' : 'rgba(52, 211, 153, 0)',
          boxShadow: isHovering
            ? '0 0 20px rgba(52, 211, 153, 0.2), inset 0 0 15px rgba(52, 211, 153, 0.05)'
            : '0 0 0px rgba(52, 211, 153, 0), inset 0 0 0px rgba(52, 211, 153, 0)',
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 18,
          borderRadius: { duration: 0.25, ease: 'easeInOut' },
          backgroundColor: { duration: 0.2 },
          boxShadow: { duration: 0.3 },
        }}
      >
        {/* Corner accents — visible only on hover, emerge with scale */}
        {isHovering && (
          <>
            <motion.span
              className="absolute pointer-events-none"
              style={{ top: -1, left: -1, width: 6, height: 6, borderTop: '2px solid rgba(52,211,153,0.8)', borderLeft: '2px solid rgba(52,211,153,0.8)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            />
            <motion.span
              className="absolute pointer-events-none"
              style={{ top: -1, right: -1, width: 6, height: 6, borderTop: '2px solid rgba(52,211,153,0.8)', borderRight: '2px solid rgba(52,211,153,0.8)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
            <motion.span
              className="absolute pointer-events-none"
              style={{ bottom: -1, left: -1, width: 6, height: 6, borderBottom: '2px solid rgba(52,211,153,0.8)', borderLeft: '2px solid rgba(52,211,153,0.8)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
            <motion.span
              className="absolute pointer-events-none"
              style={{ bottom: -1, right: -1, width: 6, height: 6, borderBottom: '2px solid rgba(52,211,153,0.8)', borderRight: '2px solid rgba(52,211,153,0.8)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            />
          </>
        )}
      </motion.div>

      {/* Center dot — hides on hover */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: dotX, y: dotY, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5,
          borderRadius: '50%', backgroundColor: '#34D399', zIndex: 9999,
        }}
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      />
    </>
  );
};

export default CustomCursor;
