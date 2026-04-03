import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TRAIL_COUNT = 5;

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

    const updateHoverState = (e) => {
      const target = e.target;
      setIsHovering(target.closest('a, button, [role="button"], input, textarea, select, label[for]') !== null);
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

  return (
    <>
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => (trailRefs.current[i] = el)}
          className="fixed top-0 left-0 pointer-events-none"
          style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: `rgba(52, 211, 153, ${0.3 - i * 0.06})`, zIndex: 9998 }}
        />
      ))}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: ringX, y: ringY, width: 36, height: 36, marginLeft: -18, marginTop: -18,
          borderRadius: '50%',
          border: isHovering ? '1.5px solid rgba(52,211,153,0.3)' : '1.5px solid rgba(52,211,153,0.5)',
          backgroundColor: isHovering ? 'rgba(52,211,153,0.1)' : 'transparent',
          zIndex: 9999, transition: 'background-color 0.2s, border-color 0.2s',
        }}
        animate={{ scale: isClicking ? 0.7 : isHovering ? 2 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      />
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
