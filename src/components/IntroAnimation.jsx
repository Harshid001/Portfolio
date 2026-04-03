import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  // Pre-compute random scatter directions for each letter so they stay consistent
  const nameText = "HARSHID SONI";
  const scatterDirections = useMemo(() => 
    nameText.split('').map(() => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 800,
      rotate: (Math.random() - 0.5) * 360,
      scale: Math.random() * 0.5 + 0.3,
    })), []
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onComplete(), 1200);
      }, 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 1200);
  };

  // Smooth cubic bezier easings
  const smoothEase = [0.22, 1, 0.36, 1];
  const entryEase = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-auto"
          style={{ backgroundColor: 'var(--color-ink)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: smoothEase }}
        >
          {/* Skip button */}
          <motion.button
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute top-8 right-8 z-10 hover:text-white transition-colors cursor-none"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink-3)',
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              letterSpacing: '0.1em'
            }}
          >
            SKIP →
          </motion.button>

          <div className="flex flex-col items-center w-full max-w-4xl px-6 relative">
            {/* Phase 1: Horizontal line */}
            <AnimatePresence>
              {phase === 1 && (
                <motion.div
                  key="line"
                  initial={{ scaleX: 0, opacity: 0.6 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 1.6, opacity: 0 }}
                  transition={{ duration: 1.0, ease: smoothEase }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    right: '10%',
                    height: '1px',
                    backgroundColor: 'var(--color-white)',
                    originX: 0.5
                  }}
                />
              )}
            </AnimatePresence>

            {/* Phase 2+: Name letters */}
            {phase >= 2 && (
              <div className="flex justify-center" style={{ perspective: '800px', whiteSpace: 'nowrap' }}>
                {nameText.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      opacity: 0,
                      filter: 'blur(12px)',
                      scale: 1.15,
                    }}
                    animate={isExiting ? {
                      // Scatter exit
                      x: scatterDirections[i].x,
                      y: scatterDirections[i].y,
                      rotate: scatterDirections[i].rotate,
                      scale: scatterDirections[i].scale,
                      opacity: 0,
                      filter: 'blur(6px)',
                    } : {
                      // Smooth blur-to-sharp entrance
                      opacity: 1,
                      filter: 'blur(0px)',
                      scale: 1,
                    }}
                    transition={isExiting ? {
                      duration: 0.9 + Math.random() * 0.4,
                      delay: i * 0.03,
                      ease: [0.55, 0, 1, 0.45],
                    } : {
                      delay: i * 0.07,
                      duration: 0.7,
                      ease: entryEase,
                      filter: { duration: 0.9, delay: i * 0.07 },
                    }}
                    className="inline-block"
                    style={{
                      fontSize: 'clamp(60px, 13vw, 120px)',
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-paper)',
                      lineHeight: 0.9,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      willChange: 'transform, filter, opacity',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Phase 3: Subtitle */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={isExiting ? {
                  opacity: 0,
                  y: -20,
                  filter: 'blur(8px)',
                } : {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                }}
                transition={isExiting ? {
                  duration: 0.6,
                  ease: smoothEase,
                } : {
                  duration: 0.8,
                  ease: entryEase,
                }}
                style={{
                  marginTop: '20px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-ink-3)',
                  letterSpacing: '0.3em',
                  fontSize: '14px',
                  textTransform: 'uppercase'
                }}
              >
                FULL STACK DEVELOPER
              </motion.div>
            )}

            {/* Decorative corner marks — visible during name phase */}
            {phase >= 2 && !isExiting && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.2, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: smoothEase }}
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '-20px',
                    width: '24px',
                    height: '24px',
                    borderTop: '1px solid var(--color-ink-3)',
                    borderLeft: '1px solid var(--color-ink-3)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.2, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: smoothEase }}
                  style={{
                    position: 'absolute',
                    bottom: '-40px',
                    right: '-20px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '1px solid var(--color-ink-3)',
                    borderRight: '1px solid var(--color-ink-3)',
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
      ) : (
        /* Dissolve overlay — replaces the old page-up clipPath wipe */
        <motion.div
          key="intro-dissolve"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: smoothEase }}
          className="fixed inset-0 z-[10001] pointer-events-none"
          style={{ backgroundColor: 'var(--color-ink)' }}
        />
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
