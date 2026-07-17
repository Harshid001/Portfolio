/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { CURSOR_RING_SIZE } from './GhostCursor';

const NAME = 'HARSHID SONI';
const SUBTITLE = 'FULL STACK DEVELOPER —';

// ---------------------------------------------------------------------------
// Boot-style wordmark: a bright scan line wipes the name on left-to-right
// (like a device backlight switching on), then the revealed text pulses its
// glow twice before settling — the same "power on → flash → steady" beat
// most OEM boot logos use, instead of a generic per-letter fade-in.
// ---------------------------------------------------------------------------
const REVEAL_DELAY = 0.4;
const REVEAL_DURATION = 1.1;
const REVEAL_EASE = [0.65, 0, 0.35, 1];

const nameTextStyle = {
  display: 'block',
  fontFamily: '"Poppins", sans-serif',
  fontSize: 'clamp(36px, 10vw, 100px)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  lineHeight: 1.05,
  margin: 0,
};

// ---------------------------------------------------------------------------
// Scripted timeline for the eye-box.
// ---------------------------------------------------------------------------
const FLY_DELAY = 0.4;
const FLY_DURATION = 1.2;       // slightly longer for a smoother arc
const ROLL_TURNS = 720;
const LOOK_DURATION = 1.6;
const CENTER_DURATION = 0.3;
const MORPH_DURATION = 0.5;     // slightly longer for a visible morph beat
const SETTLE_PAUSE = 0.15;     // beat between landing and looking

const EYE_WIDTH = 8;
const EYE_HEIGHT = 12;
const EYE_GAP = 5;

// How the whole eye squares shift during the "looking" stage
const LOOK_KEYFRAMES = {
  x: [0, -2.5, 3, -2, 2.5, -1.2, 0],
  y: [0, 2, -2.5, -1.2, 2, -2, 0],
  times: [0, 0.14, 0.32, 0.48, 0.66, 0.84, 1],
};

// Smooth deceleration curve for the roll (fast start, gentle land)
const FLY_EASE = [0.22, 1, 0.36, 1];       // cubic-bezier: aggressive out-expo feel
const ROLL_EASE = [0.16, 1, 0.3, 1];       // even softer for the spin deceleration
const MORPH_EASE = [0.25, 0.46, 0.45, 0.94]; // subtle ease-out for the 45° snap

const Eye = ({ visible, scale, lookAnimate, lookTransition }) => (
  <motion.div
    animate={{
      opacity: visible ? 1 : 0,
      scale: scale,
      ...lookAnimate,
    }}
    transition={{ duration: 0.3, ease: 'easeInOut', ...lookTransition }}
    style={{
      width: EYE_WIDTH,
      height: EYE_HEIGHT,
      borderRadius: '50%',
      backgroundColor: '#f5f2ed',
      flexShrink: 0,
    }}
  />
);

/**
 * The thrown, eyed box. Already CURSOR_RING_SIZE from frame one — nothing
 * resizes. It rolls in from off-screen left with an arc, lands under the
 * name with a gentle settle-bounce, looks around, centers its eyes which
 * scale down and fade, then rotates 45° with a spring-snap to become the
 * cursor diamond — tracking the real mouse for the last stretch so the
 * handoff to GhostCursor is invisible.
 */
const EyeBox = ({ isTouchDevice, onSequenceDone, restPos }) => {
  const [stage, setStage] = useState('flying');
  const [ready, setReady] = useState(false);

  const stageRef = useRef(stage);
  const mouseRef = useRef({ x: 0, y: 0 });
  const startedRef = useRef(false);

  const boxX = useMotionValue(-120);
  const boxY = useMotionValue(0);
  const rotateMV = useMotionValue(0);
  const glowMV = useMotionValue(0);   // morph flash intensity

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    if (restPos && !ready) setReady(true);
  }, [restPos, ready]);

  // Track the real cursor. During 'tracking' stage, match GhostCursor's
  // own spring (stiffness 120, damping 18) so the swap is pixel-perfect.
  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (stageRef.current === 'tracking') {
        animate(boxX, e.clientX, { type: 'spring', stiffness: 120, damping: 18 });
        animate(boxY, e.clientY, { type: 'spring', stiffness: 120, damping: 18 });
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [boxX, boxY]);

  // Main sequence — runs exactly once when ready.
  useEffect(() => {
    if (!ready || startedRef.current) return undefined;
    startedRef.current = true;

    const target = restPos;
    boxY.set(target.y);
    mouseRef.current = { x: target.x, y: target.y };

    const timers = [];

    // ── FLY IN with a gentle arc ──
    timers.push(
      setTimeout(() => {
        // Horizontal: smooth deceleration
        animate(boxX, target.x, { duration: FLY_DURATION, ease: FLY_EASE });
        // Vertical: subtle arc — rise then settle with a micro-bounce
        animate(boxY, [target.y, target.y - 24, target.y + 6, target.y - 2, target.y], {
          duration: FLY_DURATION,
          times: [0, 0.35, 0.7, 0.88, 1],
          ease: FLY_EASE,
        });
        // Roll: decelerates separately so the spin feels heavy/natural
        animate(rotateMV, ROLL_TURNS, { duration: FLY_DURATION, ease: ROLL_EASE });
      }, FLY_DELAY * 1000)
    );

    // ── Small pause after landing before eyes start looking ──
    const lookStart = (FLY_DELAY + FLY_DURATION + SETTLE_PAUSE) * 1000;
    timers.push(setTimeout(() => setStage('looking'), lookStart));

    if (isTouchDevice) {
      const fadeStart = lookStart + LOOK_DURATION * 1000;
      timers.push(setTimeout(() => setStage('centering'), fadeStart));
      timers.push(
        setTimeout(() => {
          setStage('fading');
          onSequenceDone();
        }, fadeStart + CENTER_DURATION * 1000)
      );
      return () => timers.forEach(clearTimeout);
    }

    const centerStart = lookStart + LOOK_DURATION * 1000;
    timers.push(setTimeout(() => setStage('centering'), centerStart));

    const morphStart = centerStart + CENTER_DURATION * 1000;
    timers.push(
      setTimeout(() => {
        setStage('morphing');

        // Flash-pulse: white glow peaks then fades during the morph
        animate(glowMV, [0, 1, 0], {
          duration: MORPH_DURATION,
          times: [0, 0.3, 1],
          ease: 'easeInOut',
        });

        // Glide toward the real cursor position
        animate(boxX, mouseRef.current.x, {
          duration: MORPH_DURATION,
          ease: MORPH_EASE,
        });
        animate(boxY, mouseRef.current.y, {
          duration: MORPH_DURATION,
          ease: MORPH_EASE,
        });

        // Spring-snap the final 45° so it feels organic, not linear
        animate(rotateMV, ROLL_TURNS + 45, {
          type: 'spring',
          stiffness: 260,
          damping: 20,
        });
      }, morphStart)
    );

    const trackStart = morphStart + MORPH_DURATION * 1000;
    timers.push(
      setTimeout(() => {
        setStage('tracking');
        onSequenceDone();
      }, trackStart)
    );

    return () => timers.forEach(clearTimeout);
  }, [ready]);

  if (!ready) return null;

  const isCursorForm = stage === 'morphing' || stage === 'tracking';
  const eyesVisible = stage === 'flying' || stage === 'looking' || stage === 'centering';
  // Eyes scale down during centering→morphing for a smooth disappearance
  const eyeScale = stage === 'centering' ? 0.6 : stage === 'morphing' || stage === 'tracking' ? 0 : 1;

  // During 'looking', the whole eye square shifts around; otherwise snaps back
  const lookAnimate = stage === 'looking'
    ? { x: LOOK_KEYFRAMES.x, y: LOOK_KEYFRAMES.y }
    : { x: 0, y: 0 };
  const lookTransition = stage === 'looking'
    ? { x: { duration: LOOK_DURATION, times: LOOK_KEYFRAMES.times, ease: 'easeInOut' }, y: { duration: LOOK_DURATION, times: LOOK_KEYFRAMES.times, ease: 'easeInOut' } }
    : { x: { duration: CENTER_DURATION, ease: [0.25, 0.46, 0.45, 0.94] }, y: { duration: CENTER_DURATION, ease: [0.25, 0.46, 0.45, 0.94] } };

  const surfaceAnimate = {
    backgroundColor: isCursorForm ? '#FFFFFF' : '#141414',
    borderColor: isCursorForm ? 'rgba(245,242,237,0)' : 'rgba(245,242,237,0.6)',
    boxShadow: isCursorForm
      ? '0 0 0px rgba(245,242,237,0)'
      : '0 0 12px rgba(245,242,237,0.08)',
  };
  const surfaceTransition = {
    duration: stage === 'morphing' ? MORPH_DURATION : 0.35,
    ease: isCursorForm ? MORPH_EASE : 'easeInOut',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === 'fading' ? 0 : 1 }}
      transition={{ duration: stage === 'fading' ? 0.4 : 0.25 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: boxX,
        y: boxY,
        width: CURSOR_RING_SIZE,
        height: CURSOR_RING_SIZE,
        marginLeft: -CURSOR_RING_SIZE / 2,
        marginTop: -CURSOR_RING_SIZE / 2,
        zIndex: 10001,
        pointerEvents: 'none',
        mixBlendMode: isCursorForm ? 'difference' : 'normal',
      }}
    >
      {/* Morph flash ring — pulses white during the box→cursor snap */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          opacity: glowMV,
          background: 'radial-gradient(circle, rgba(245,242,237,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={surfaceAnimate}
        transition={surfaceTransition}
        style={{
          width: '100%',
          height: '100%',
          rotate: rotateMV,
          borderWidth: 2,
          borderStyle: 'solid',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: EYE_GAP,
          overflow: 'hidden',
        }}
      >
        <Eye visible={eyesVisible} scale={eyeScale} lookAnimate={lookAnimate} lookTransition={lookTransition} />
        <Eye visible={eyesVisible} scale={eyeScale} lookAnimate={lookAnimate} lookTransition={lookTransition} />
      </motion.div>
    </motion.div>
  );
};

// ── Staggered spring variants for post-sequence elements ──
const postItemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const IntroAnimation = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [restPos, setRestPos] = useState(null);
  const nameWrapRef = useRef(null);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches
    );
    document.body.classList.add('hide-cursor');
    return () => document.body.classList.remove('hide-cursor');
  }, []);

  // Measure where "under the name" is so the eye-box has a real target.
  useEffect(() => {
    const measure = () => {
      if (nameWrapRef.current) {
        const rect = nameWrapRef.current.getBoundingClientRect();
        setRestPos({ x: rect.left + rect.width / 2, y: rect.bottom + 28 });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleComplete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);
  };

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
            cursor: 'none',
          }}
        >
          {/* ── EYE-BOX ── */}
          <EyeBox isTouchDevice={isTouchDevice} onSequenceDone={() => setSequenceDone(true)} restPos={restPos} />

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

          {/* ── CENTER CONTENT — shifts up smoothly when subtitle appears ── */}
          <motion.div
            animate={{ y: sequenceDone ? -30 : 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
            {/* ── NAME: boot-style scanline wipe + glow pulse + ambient breathe ── */}
            <div
              ref={nameWrapRef}
              style={{
                position: 'relative',
                maxWidth: '92vw',
                textAlign: 'center',
              }}
            >
              {/* ghost layer — dim copy holds the box size */}
              <h1 aria-hidden="true" style={{ ...nameTextStyle, color: 'rgba(245, 242, 237, 0.07)' }}>
                {NAME}
              </h1>

              {/* bright layer — revealed by the wipe, pulses glow, then breathes */}
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: REVEAL_DURATION, delay: REVEAL_DELAY, ease: REVEAL_EASE }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <motion.h1
                  animate={{
                    textShadow: [
                      '0 0 0px rgba(245,242,237,0)',
                      '0 0 28px rgba(245,242,237,0.9)',
                      '0 0 0px rgba(245,242,237,0)',
                      '0 0 18px rgba(245,242,237,0.55)',
                      '0 0 4px rgba(245,242,237,0.15)',
                    ],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: REVEAL_DELAY + REVEAL_DURATION,
                    times: [0, 0.22, 0.48, 0.72, 1],
                    ease: 'easeInOut',
                  }}
                  style={{ ...nameTextStyle, color: '#f5f2ed' }}
                >
                  {NAME}
                </motion.h1>
              </motion.div>

              {/* scan bar — bright edge in lockstep with the wipe */}
              <motion.div
                initial={{ left: '0%', opacity: 1 }}
                animate={{ left: '100%', opacity: [1, 1, 0] }}
                transition={{
                  duration: REVEAL_DURATION,
                  delay: REVEAL_DELAY,
                  ease: REVEAL_EASE,
                  times: [0, 0.85, 1],
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: 'linear-gradient(180deg, transparent, #f5f2ed 40%, #f5f2ed 60%, transparent)',
                  boxShadow: '0 0 24px 6px rgba(245, 242, 237, 0.85)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* ── SUBTITLE, LINE, ENTER — staggered spring entrances ── */}
            <AnimatePresence>
              {sequenceDone && (
                <motion.div
                  key="post-sequence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <motion.p
                    custom={0}
                    variants={postItemVariants}
                    initial="hidden"
                    animate="visible"
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

                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      height: '1px',
                      backgroundColor: '#333',
                      marginTop: '28px',
                      transformOrigin: 'left center',
                    }}
                  />

                  <motion.div
                    custom={0.55}
                    variants={postItemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ marginTop: '40px' }}
                  >
                    <motion.button
                      onClick={handleComplete}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.04 }}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                      onTouchStart={() => setHovered(true)}
                      onTouchEnd={() => setHovered(false)}
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
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        /* ── EXIT OVERLAY ── */
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
