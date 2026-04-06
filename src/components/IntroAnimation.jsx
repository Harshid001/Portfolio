import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NameText = "HARSHID SONI";
const SubtitleText = "FULL STACK DEVELOPER";

// We'll keep the same phase system to sync the HTML animations:
// Phase 1: Scattered
// Phase 2: Assembling
// Phase 3: Text becomes visible, Particle float
// Phase 4: CTA, Typewriter setup

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 }); // Higher radius for better interaction
  const particlesRef = useRef([]);
  // Track phase in a ref so requestAnimationFrame always gets the latest
  const stateRef = useRef({ phase: 1, isExiting: false, w: 0, h: 0 });

  useEffect(() => {
    stateRef.current.phase = phase;
    stateRef.current.isExiting = isExiting;
  }, [phase, isExiting]);

  // Main Canvas Setup and Particle Lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    let animationFrameId;
    let startTime = performance.now();

    const initParticles = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      stateRef.current.w = w;
      stateRef.current.h = h;

      const textHalfWidth = Math.min(w * 0.4, 400); 
      const textHalfHeight = Math.min(h * 0.2, 100);

      // 2000 particles spread across the screen
      const numParticles = 2000;

      particlesRef.current = Array.from({ length: numParticles }, () => {
        // Random point on screen for exiting
        const px = (Math.random() - 0.5) * w;
        const py = (Math.random() - 0.5) * h;
        const exitDist = Math.random() * 800 + 600;
        const angle = Math.atan2(py, px);

        return {
          x: (Math.random() - 0.5) * w * 1.5 + w / 2, // Physical initial X
          y: (Math.random() - 0.5) * h * 1.5 + h / 2, // Physical initial Y
          vx: 0,
          vy: 0,
          exitX: px + Math.cos(angle) * exitDist,
          exitY: py + Math.sin(angle) * exitDist,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          // Orbit across the whole screen dynamically, outside text bounds
          orbitRx: textHalfWidth + 50 + Math.random() * (w * 0.45), 
          orbitRy: textHalfHeight + 40 + Math.random() * (h * 0.45),
          // Wandering offsets for "free" movement
          wx: Math.random() * Math.PI * 2,
          wy: Math.random() * Math.PI * 2,
          ws: Math.random() * 0.02 + 0.005,
          wr: Math.random() * 40 + 20,
          // Color selection matching variables
          color: Math.random() > 0.4 ? '#f5f2ed' : '#a1a1aa', // var(--color-paper) & var(--color-ink-3) approx
          size: Math.random() * 1.5 + 1.0, 
          delay: Math.random() * 400, // Faster staggered entry
        };
      });
    };

    initParticles();

    // Responsive adaptation
    const onResize = () => {
      initParticles();
    };
    window.addEventListener('resize', onResize);

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Main Render Loop
    const render = (time) => {
      const elapsed = time - startTime;
      const { phase, isExiting, w, h } = stateRef.current;
      
      // Clear screen with core black/ink color
      ctx.fillStyle = '#0a0a0a'; 
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mRadius = mouseRef.current.radius;
      const cenX = w / 2;
      const cenY = h / 2;

      particlesRef.current.forEach(p => {
        let targetX = p.x;
        let targetY = p.y;
        let shouldRender = true;

        if (isExiting) {
          // Explode mode
          targetX = cenX + p.exitX;
          targetY = cenY + p.exitY;
        } else if (phase >= 2) {
          if (elapsed > p.delay) {
            // Randomly orbit the name on the whole screen from phase 2
            p.orbitAngle += p.orbitSpeed;
            
            // Add wandering motion for "free" feel
            p.wx += p.ws;
            p.wy += p.ws * 1.1; 
            const ox = Math.cos(p.wx) * p.wr;
            const oy = Math.sin(p.wy) * p.wr;

            targetX = cenX + Math.cos(p.orbitAngle) * p.orbitRx + ox;
            targetY = cenY + Math.sin(p.orbitAngle) * p.orbitRy + oy;
          } else {
            shouldRender = false; // Wait until delay finishes
          }
        } else {
           shouldRender = false;
        }

        // --- Physics Calculation ---
        // Mouse hover repulsion physics (Interactive Hover)
        if (phase >= 2 && !isExiting) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const interactionRadius = 250; // Larger radius, no lag zone
          const distSq = dx * dx + dy * dy;
          
          if (distSq < interactionRadius * interactionRadius) {
            const dist = Math.sqrt(distSq) || 0.01;
            // Stronger squared force logic gives snappy, fluid repulsion near the cursor
            const force = Math.pow((interactionRadius - dist) / interactionRadius, 1.2);
            
            const pushAngle = Math.atan2(dy, dx);
            
            // 1. Shift target outward so the spring doesn't fight the push (creates shape)
            targetX += Math.cos(pushAngle) * force * 180;
            targetY += Math.sin(pushAngle) * force * 180;

            // 2. Direct velocity push gives that instant zero-lag responsiveness
            p.vx += Math.cos(pushAngle) * force * 6;
            p.vy += Math.sin(pushAngle) * force * 6;
          }
        }

        // Spring movement to target variables
        const ease = isExiting ? 0.02 : 0.08;
        const drag = isExiting ? 0.98 : 0.86; // Adjusted for buttery smoothness

        const ax = (targetX - p.x) * ease;
        const ay = (targetY - p.y) * ease;
        
        p.vx += ax;
        p.vy += ay;
        p.vx *= drag;
        p.vy *= drag;

        p.x += p.vx;
        p.y += p.vy;

        // --- Rendering ---
        if (shouldRender) {
          // Slightly transparent during float to look like a ghostly aura so the main text reads clearly
          ctx.fillStyle = phase >= 3 && !isExiting ? p.color + '99' : p.color; 
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    const timers = [
      setTimeout(() => setPhase(2), 80),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 3500),
    ];

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      timers.forEach(clearTimeout);
    };
  }, []); // Only runs once, physics isolated in loop

  // Typewriter effect isolated
  useEffect(() => {
    if (phase >= 4) {
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength++;
        setSubtitle(SubtitleText.slice(0, currentLength));
        if (currentLength >= SubtitleText.length) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleComplete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200);
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
        {/* ── LOADING DOTS ── */}
        <AnimatePresence>
          {phase < 2 && (
            <motion.div
              key="loading-dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px',
                zIndex: 5,
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: 'easeInOut',
                  }}
                  style={{
                    display: 'block',
                    width: 6,
                    height: 6,
                    backgroundColor: 'var(--color-ink-3)',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NATIVE CANVAS LAYER: Zero lag, massive particle count */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-[1] w-full h-full pointer-events-none"
        />

        {/* Scanlines / Noise Overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0) 2px)`,
            backgroundSize: '100% 3px',
            opacity: 0.15,
            zIndex: 2,
          }}
        />

        <motion.button
          onClick={handleComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 right-8 z-[10] cursor-none hover:text-white transition-colors"
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

        <div className="relative w-full h-full" style={{ zIndex: 3 }}>
          {/* Main solid text layer overlapping the canvas particles seamlessly */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-20px' }}>
            <motion.h1
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={isExiting ? {
                opacity: 0,
                scale: 1.1,
                filter: 'blur(12px)',
              } : {
                opacity: phase >= 2 ? 1 : 0,
                scale: phase >= 2 ? 1 : 0.95,
                filter: phase >= 2 ? 'blur(0px)' : 'blur(8px)',
              }}
              transition={isExiting ? { duration: 0.8 } : { duration: 2.8, ease: "easeOut" }}
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
          
          <AnimatePresence>
            {phase >= 4 && !isExiting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute left-1/2 bottom-20 sm:bottom-32 -translate-x-1/2 z-[10] pointer-events-auto"
              >
                <button
                  onClick={handleComplete}
                  className="cursor-none group"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-paper)',
                    border: 'none',
                    fontWeight: 'bold',
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

        {/* ── PROGRESS BAR ── */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            width: '100%',
            backgroundColor: 'var(--color-ink-3)',
            transformOrigin: 'left',
            opacity: 0.35,
            zIndex: 6,
          }}
          initial={{ scaleX: 0 }}
          animate={isExiting ? { opacity: 0 } : { scaleX: 1 }}
          transition={isExiting
            ? { duration: 0.3 }
            : { duration: 3.8, ease: 'easeInOut' }
          }
        />

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
