import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * HeroBrightShowcase
 *
 * Dedicated architectural Neo-Brutalist interactive visual for Bright Theme.
 * Replaces the WebGL particle cloud with an ultra-clean, high-contrast,
 * interactive 3D perspective console card featuring the <HS/> monogram,
 * precision blueprint drafting grid, and tactile developer telemetry.
 */
const HeroBrightShowcase = () => {
  const cardRef = useRef(null);

  // Mouse tilt motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid, physics-based responsiveness
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Map normalized mouse coordinates (-0.5 to 0.5) to subtle 3D rotation
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  // Subtle floating parallax offsets for internal layers
  const innerX = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const innerY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 lg:p-8"
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[480px] bg-[#fcfaf7] border-2 border-[var(--color-ink)] p-6 sm:p-8 shadow-[8px_8px_0px_var(--color-ink)] transition-shadow duration-300 hover:shadow-[14px_14px_0px_var(--color-ink)] cursor-default select-none overflow-hidden"
      >
        {/* Drafting Grid Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(13, 13, 13, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(13, 13, 13, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Blueprint Corner Registration Marks */}
        <span className="absolute top-2 left-2.5 font-mono text-[11px] text-[var(--color-ink)] opacity-40 pointer-events-none">
          +
        </span>
        <span className="absolute top-2 right-2.5 font-mono text-[11px] text-[var(--color-ink)] opacity-40 pointer-events-none">
          +
        </span>
        <span className="absolute bottom-2 left-2.5 font-mono text-[11px] text-[var(--color-ink)] opacity-40 pointer-events-none">
          +
        </span>
        <span className="absolute bottom-2 right-2.5 font-mono text-[11px] text-[var(--color-ink)] opacity-40 pointer-events-none">
          +
        </span>

        {/* Header Metadata Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b-2 border-[var(--color-ink)]">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block shadow-[0_0_8px_#22c55e]"
              style={{ animation: 'pulse-dot 2s infinite ease-in-out' }}
            />
            <span className="font-mono text-xs font-bold tracking-widest text-[var(--color-ink)]">
              SYS // HS-CORE.v2
            </span>
          </div>
          <span className="font-mono text-[11px] text-[var(--color-ink-2)] tracking-wider">
            23°01'N 72°34'E
          </span>
        </div>

        {/* Centerpiece: Sculpted Monogram Display */}
        <motion.div
          style={{ x: innerX, y: innerY }}
          className="relative z-10 py-10 flex flex-col items-center justify-center text-center"
        >
          {/* Accent Label */}
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-ink-2)] mb-2 font-semibold">
            [ ARCHITECTURAL MONOGRAM ]
          </span>

          {/* Bold <HS/> Typographic Sculpture */}
          <div className="relative my-2">
            <h2
              className="font-mono font-black text-6xl sm:text-7xl tracking-tighter text-[var(--color-ink)]"
              style={{
                textShadow:
                  '3px 3px 0px #e8e4dc, 6px 6px 0px var(--color-ink)',
                letterSpacing: '-0.04em',
              }}
            >
              {'<HS/>'}
            </h2>
          </div>

          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)] font-bold mt-3 px-3 py-1 bg-[var(--color-paper-2)] border border-[var(--color-ink)]">
            FULL STACK DEVELOPER
          </p>
        </motion.div>

        {/* Floating Interactive Skill Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t-2 border-[var(--color-ink)]">
          {[
            { label: 'REACT', note: 'v19.x' },
            { label: 'NODE.JS', note: 'RUNTIME' },
            { label: 'EXPRESS', note: 'API ARCH' },
            { label: 'MONGODB', note: 'NOSQL' },
            { label: 'NEXT.JS', note: 'HYBRID' },
            { label: 'SYSTEMS', note: 'C / C++' },
          ].map((pill, i) => (
            <div
              key={pill.label}
              className="bg-[#ffffff] border border-[var(--color-ink)] px-2 py-1.5 flex flex-col items-start justify-center shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_var(--color-ink)] transition-all"
            >
              <span className="font-mono text-[10px] font-bold text-[var(--color-ink)]">
                {pill.label}
              </span>
              <span className="font-mono text-[8px] text-[var(--color-ink-3)]">
                {pill.note}
              </span>
            </div>
          ))}
        </div>

        {/* Terminal Telemetry Footer */}
        <div className="relative z-10 mt-4 pt-3 flex items-center justify-between font-mono text-[10px] text-[var(--color-ink-2)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-ink)] font-bold">&gt;</span>
            <span>harshid.state</span>
            <span className="text-[#22c55e] font-semibold">= ready</span>
          </div>
          <span className="bg-[var(--color-ink)] text-[var(--color-paper)] px-2 py-0.5 font-bold tracking-widest text-[9px]">
            ONLINE
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBrightShowcase;
