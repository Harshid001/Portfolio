import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NameText = "HARSHID SONI";
const SubtitleText = "FULL STACK DEVELOPER";

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  
  // Create particles from Canvas Text layout
  useEffect(() => {
    // Phase timer sequence
    // Phase 1 (0s) -> Scattered (default state)
    // Phase 2 (50ms) -> Assemble starts immediately
    // Phase 3 (1800ms) -> Text Solidifies, particles fade
    // Phase 4 (2600ms+) -> Enter CTA + Typewriter
    const timers = [
      setTimeout(() => setPhase(2), 50),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2600),
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // We base size on innerHeight and innerWidth
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Match clamp(48px, 12vw, 130px)
    let fontSize = Math.max(48, Math.min(130, w * 0.12));
    // If mobile, maybe clamp down a bit more so it doesn't wrap awkwardly?
    
    ctx.font = `bold ${fontSize}px Poppins, ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.letterSpacing = '0.04em';
    
    // Draw text centered
    ctx.fillText(NameText, w / 2, h / 2 - 20); // slightly offset up to make room for subtitle

    const imageData = ctx.getImageData(0, 0, w, h).data;
    const validCoords = [];

    // Step every 4 pixels horizontally and horizontally to sample positions
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const index = (y * w + x) * 4;
        const alpha = imageData[index + 3];
        if (alpha > 128) {
          validCoords.push({ x, y });
        }
      }
    }

    // Shuffle coords
    for (let i = validCoords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validCoords[i], validCoords[j]] = [validCoords[j], validCoords[i]];
    }

    // We want ~300 particles. Use whatever is available up to 300
    const numParticles = Math.min(300, validCoords.length);
    const selectedCoords = validCoords.slice(0, numParticles);

    const generated = selectedCoords.map((coord, i) => {
      // Scatter fully across screen
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      
      // Explosion vector from center outward for exit
      const dx = coord.x - w / 2;
      const dy = coord.y - h / 2;
      const angle = Math.atan2(dy, dx);
      // More explosive distance
      const dist = Math.random() * 800 + 400;
      
      return {
        id: i,
        startX,
        startY,
        targetX: coord.x,
        targetY: coord.y,
        exitX: coord.x + Math.cos(angle) * dist,
        exitY: coord.y + Math.sin(angle) * dist,
        color: Math.random() > 0.4 ? 'var(--color-paper)' : 'var(--color-ink-3)',
        size: Math.random() * 2 + 2,
        delay: Math.random() * 0.8 // increased delay for smoother wave
      };
    });

    setParticles(generated);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Typewriter effect for Phase 4
  useEffect(() => {
    if (phase >= 4) {
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength++;
        setSubtitle(SubtitleText.slice(0, currentLength));
        if (currentLength >= SubtitleText.length) {
          clearInterval(interval);
        }
      }, 50); // Speedy typewriter
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleComplete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200); // Wait longer before firing onComplete to let explosion finish
  };

  const springConfig = {
    type: "spring",
    stiffness: 40,  // Much softer spring
    damping: 20,    // More damping for smoothness
    mass: 1.5,      // Slightly heavier particles
  };

  return (
    <AnimatePresence>
      <motion.div
        key="intro-container"
        className="fixed inset-0 pointer-events-auto dark-section"
        style={{
          backgroundColor: 'var(--color-ink)',
          zIndex: 10000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      >
        {/* CSS-only generic noise scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0) 2px)`,
            backgroundSize: '100% 3px',
            opacity: 0.15,
            zIndex: 1,
          }}
        />

        {/* SKIP button */}
        <motion.button
          onClick={handleComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 right-8 z-10 cursor-none hover:text-white transition-colors"
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

        <div className="relative w-full h-full" style={{ zIndex: 2 }}>
          {/* Particles */}
          <AnimatePresence>
            {!isExiting && phase < 4 && particles.map((p) => {
              // Target state based on phase
              // phase 1: at start pos
              // phase 2: assembling to target
              // phase 3: fading out (opacity 0)
              const isFading = phase >= 3;
              
              return (
                <motion.div
                  key={`p-${p.id}`}
                  initial={{
                    x: p.startX,
                    y: p.startY,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={isExiting ? {
                    x: p.exitX,
                    y: p.exitY,
                    opacity: 0,
                    scale: 0.2,
                  } : {
                    x: phase >= 2 ? p.targetX : p.startX,
                    y: phase >= 2 ? p.targetY : p.startY,
                    opacity: isFading ? 0 : 1,
                  }}
                  transition={isExiting ? {
                    duration: 1.0,
                    ease: [0.16, 1, 0.3, 1],
                  } : isFading ? {
                    duration: 0.6,
                  } : {
                    ...springConfig,
                    delay: p.delay, // natural wave-in
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: 0, // Sharp square edges
                  }}
                />
              );
            })}
            
            {/* If Exiting but particles already unmounted, re-render them for explosion */}
            {isExiting && particles.map((p) => (
               <motion.div
                 key={`p-exit-${p.id}`}
                 initial={{
                   x: p.targetX,
                   y: p.targetY,
                   opacity: 1,
                 }}
                 animate={{
                   x: p.exitX,
                   y: p.exitY,
                   opacity: 0,
                 }}
                 transition={{
                   duration: 1.0 + Math.random() * 0.4,
                   ease: "easeOut",
                 }}
                 style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   width: p.size,
                   height: p.size,
                   backgroundColor: p.color,
                   borderRadius: 0,
                 }}
               />
            ))}
          </AnimatePresence>

          {/* Solid Text Element - Phase 3 onwards */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-20px' }}>
            <motion.h1
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={isExiting ? {
                opacity: 0,
                scale: 1.1,
                filter: 'blur(12px)',
              } : {
                opacity: phase >= 3 ? 1 : 0,
                scale: phase >= 3 ? 1 : 0.95,
                filter: phase >= 3 ? 'blur(0px)' : 'blur(8px)',
              }}
              transition={isExiting ? { duration: 0.8 } : { duration: 0.8, ease: "easeOut" }}
              className="text-[clamp(48px,12vw,130px)] m-0 leading-none whitespace-nowrap text-center"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-paper)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {NameText}
            </motion.h1>

            {/* Subtitle with Blinking Cursor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isExiting ? { opacity: 0, y: -20, filter: 'blur(4px)' } : { opacity: phase >= 4 ? 1 : 0 }}
              className="mt-6 sm:mt-10 min-h-[20px]"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--color-ink-3)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {subtitle}
              {phase >= 4 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                  style={{ display: 'inline-block', width: '10px', height: '2px', backgroundColor: 'var(--color-ink-3)', marginLeft: '4px', verticalAlign: 'bottom' }}
                />
              )}
            </motion.div>
          </div>
          
          {/* CTA Button Phase 4 */}
          <AnimatePresence>
            {phase >= 4 && !isExiting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute left-1/2 bottom-20 sm:bottom-32 -translate-x-1/2 z-10"
              >
                <button
                  onClick={handleComplete}
                  className="cursor-none group"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-paper)',
                    border: '2px solid var(--color-paper)',
                    padding: '12px 32px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    animation: 'pulseGlow 2.5s infinite',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                    e.currentTarget.style.color = 'var(--color-ink)';
                    e.currentTarget.style.boxShadow = '0 0 20px var(--color-paper)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-paper)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  [ ENTER ]
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        {/* Dissolve completely black on exit to transition into app */}
        <AnimatePresence>
          {isExiting && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.9 }}
               className="pointer-events-none absolute inset-0 z-[10002]"
               style={{ backgroundColor: 'var(--color-ink)' }}
            />
          )}
        </AnimatePresence>

        <style>{`
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(245, 242, 237, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(245, 242, 237, 0); }
            100% { box-shadow: 0 0 0 0 rgba(245, 242, 237, 0); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroAnimation;
