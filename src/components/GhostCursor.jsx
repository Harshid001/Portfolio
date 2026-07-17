import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const GhostCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  // Outer trailing circle coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config for the trailing effect
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Inner dot exact coordinates
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  
  useEffect(() => {
    // Only enable on desktop
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const moveCursor = (e) => {
      // 32px width/height -> offset by 16px to center
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      
      // 8px width/height -> offset by 4px to center
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Check if hovering over clickable/interactive elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, dotX, dotY, isVisible]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer Ghost Trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            width: isHovered ? 64 : 32,
            height: isHovered ? 64 : 32,
            /* When it expands to 64, offset by another -16px to remain centered */
            x: isHovered ? -16 : 0,
            y: isHovered ? -16 : 0,
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)',
            border: isHovered ? '0px solid #fff' : '2px solid rgba(255, 255, 255, 0.6)',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="rounded-full flex items-center justify-center"
        />
      </motion.div>

      {/* Inner Exact Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference hidden md:block"
        style={{
          x: dotX,
          y: dotY,
          opacity: isVisible && !isHovered ? 1 : 0,
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>
    </>
  );
};

export default GhostCursor;
