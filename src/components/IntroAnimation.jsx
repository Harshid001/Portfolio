import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAME = 'HARSHID SONI';
const SUBTITLE = 'FULL STACK DEVELOPER —';

const letterVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.6 + i * 0.07,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const IntroAnimation = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleComplete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);
  };

  // Total delay before the last letter finishes appearing
  const lastLetterDelay = 0.6 + (NAME.length - 1) * 0.07 + 0.6;

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="intro-screen"
          className="dark-section"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ── SKIP BUTTON ── */}
          <motion.button
            onClick={handleComplete}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              position: 'absolute',
              top: 32,
              right: 32,
              background: 'transparent',
              border: 'none',
              color: '#555',
              fontFamily: '"Fira Code", monospace',
              fontSize: '11px',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              padding: '8px 12px',
              transition: 'color 0.3s ease',
            }}
            whileHover={{ color: '#fff' }}
          >
            SKIP →
          </motion.button>

          {/* ── CENTER CONTENT ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
            {/* ── NAME: letter-by-letter stagger ── */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 0,
              }}
            >
              {NAME.split('').map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'inline-block',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: 'clamp(36px, 10vw, 100px)',
                    fontWeight: 700,
                    color: '#f5f2ed',
                    letterSpacing: '0.06em',
                    lineHeight: 1,
                    width: char === ' ' ? '0.35em' : 'auto',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            {/* ── SUBTITLE ── */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: lastLetterDelay + 0.2,
                duration: 0.8,
                ease: 'easeOut',
              }}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: '12px',
                color: '#666',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginTop: '24px',
                marginBottom: 0,
              }}
            >
              {SUBTITLE}
            </motion.p>

            {/* ── HORIZONTAL LINE ── */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: lastLetterDelay + 0.5,
                duration: 1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '1px',
                backgroundColor: '#333',
                marginTop: '28px',
                transformOrigin: 'left center',
              }}
            />

            {/* ── ENTER BUTTON ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: lastLetterDelay + 1.0,
                duration: 0.7,
                ease: 'easeOut',
              }}
              style={{ marginTop: '40px' }}
            >
              <button
                onClick={handleComplete}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: '1px solid #444',
                  color: hovered ? '#0a0a0a' : '#f5f2ed',
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '12px',
                  letterSpacing: '0.2em',
                  padding: '14px 40px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'color 0.35s ease, border-color 0.35s ease',
                  borderColor: hovered ? '#f5f2ed' : '#444',
                  zIndex: 1,
                }}
              >
                {/* Fill background on hover */}
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#f5f2ed',
                    transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left center',
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    zIndex: -1,
                  }}
                />
                [ ENTER ]
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* ── EXIT OVERLAY: fade the whole screen out ── */
        <motion.div
          key="intro-exit"
          className="dark-section"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#0a0a0a',
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
