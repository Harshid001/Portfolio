import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TRAIL_COUNT = 5;

// Exported so other components (IntroAnimation's eye-box, etc.) can match
// this cursor's exact size/shape instead of hardcoding a duplicate number.
export const CURSOR_RING_SIZE = 36;

const HOVER_SELECTORS = [
  'a', 'button', '[role="button"]', 'input', 'textarea', 'select', 'label[for]',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'video', 'svg',
  '.brutal-card', '.tag', '.btn-primary', '.btn-secondary',
  '.skill-item', '[data-hoverable]',
  'li', 'p', 'span',
].join(', ');

const GhostCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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
      if (!isVisible) {
        setIsVisible(true);
        document.body.classList.add('hide-cursor');
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      document.body.classList.remove('hide-cursor');
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      document.body.classList.add('hide-cursor');
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
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    animFrame = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.body.classList.remove('hide-cursor');
      cancelAnimationFrame(animFrame);
    };
  }, [isTouchDevice, dotX, dotY, ringX, ringY]);

  if (isTouchDevice) return null;

  // Derive visual states
  const ringSize = CURSOR_RING_SIZE;

  return (
    <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
      {/* Trails */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none"
          style={{
            width: 4,
            height: 4,
            borderRadius: '0px',
            backgroundColor: `rgba(255, 255, 255, ${0.4 - i * 0.08})`,
            zIndex: 99998,
            transition: 'background-color 0.3s ease',
            mixBlendMode: 'difference'
          }}
        />
      ))}

      {/* Main ring cursor — static size, shrinks on click */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          zIndex: 99999,
          mixBlendMode: 'difference'
        }}
        animate={{
          scale: isClicking ? 0.7 : 1,
          rotate: 45,
          borderRadius: '0px',
          borderColor: 'transparent',
          borderWidth: '0px',
          backgroundColor: '#FFFFFF',
          boxShadow: 'none',
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 18,
          borderRadius: { duration: 0.25, ease: 'easeInOut' }
        }}
      />

      {/* Center dot — remains visible */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: dotX, y: dotY, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5,
          borderRadius: '0px', backgroundColor: '#FFFFFF', zIndex: 99999,
          mixBlendMode: 'difference'
        }}
        animate={{ scale: 1, rotate: 45 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      />
    </div>
  );
};

export default GhostCursor;
