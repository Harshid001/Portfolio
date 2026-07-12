import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TRAIL_COUNT = 4;

const CollabCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDark, setIsDark] = useState(false);
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

    const updateHoverState = (e) => {
      const target = e.target;
      setIsHovering(target.closest('a, button, [role="button"], input, textarea, select, label[for]') !== null);
      setIsDark(target.closest('.dark-section') !== null);
    };

    const animateTrail = () => {
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trailPositions.current[i].x += (trailPositions.current[i - 1].x - trailPositions.current[i].x) * 0.3;
        trailPositions.current[i].y += (trailPositions.current[i - 1].y - trailPositions.current[i].y) * 0.3;
      }
      trailPositions.current[0].x += (mouse.x - trailPositions.current[0].x) * 0.5;
      trailPositions.current[0].y += (mouse.y - trailPositions.current[0].y) * 0.5;
      trailRefs.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${trailPositions.current[i].x - 4}px, ${trailPositions.current[i].y - 4}px) rotate(45deg)`;
        }
      });
      animFrame = requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousemove', updateHoverState);
    document.addEventListener('mousedown', onMouseDown);
    animFrame = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousemove', updateHoverState);
      document.removeEventListener('mousedown', onMouseDown);
      cancelAnimationFrame(animFrame);
    };
  }, [isTouchDevice, dotX, dotY, ringX, ringY]);

  if (isTouchDevice) return null;

  const currentInk = isDark ? '#ffffff' : 'var(--color-ink)';
  const currentPaper = isDark ? '#000000' : 'var(--color-paper)';
  const blendMode = isDark ? 'difference' : 'normal';

  return (
    <>
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none"
          style={{
            width: 8 - i, height: 8 - i,
            backgroundColor: currentInk,
            opacity: 0.6 - (i * 0.15),
            zIndex: 99998,
            mixBlendMode: blendMode
          }}
        />
      ))}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX, y: ringY, width: 28, height: 28, marginLeft: -14, marginTop: -14,
          border: `2px solid ${currentInk}`,
          backgroundColor: isHovering ? currentInk : 'transparent',
          rotate: 45,
          zIndex: 99999, transition: 'background-color 0.15s, border-color 0.15s',
          mixBlendMode: blendMode
        }}
        animate={{ scale: isClicking ? 0.8 : isHovering ? 1.5 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: dotX, y: dotY, width: 8, height: 8, marginLeft: -4, marginTop: -4,
          backgroundColor: isClicking ? 'var(--color-red)' : isHovering ? currentPaper : currentInk,
          rotate: 45,
          zIndex: 99999, transition: 'background-color 0.15s',
          mixBlendMode: blendMode
        }}
      />
    </>
  );
};

export default CollabCursor;
