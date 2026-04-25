import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TouchFeedback = () => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleTouch = (e) => {
      // Only handle if it's a touch or if we want to show it for clicks too
      const touch = e.touches ? e.touches[0] : e;
      const newRipple = {
        id: Date.now(),
        x: touch.clientX,
        y: touch.clientY,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    // Also add for mouse clicks to see it in action on desktop
    window.addEventListener('mousedown', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleTouch);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.5, scale: 0 }}
            animate={{ opacity: 0, scale: 4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid var(--color-red)',
              backgroundColor: 'rgba(192, 57, 43, 0.1)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TouchFeedback;
