import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaReact, FaNodeJs, FaGitAlt, FaFigma, FaHtml5, FaCss3Alt, FaPython } from 'react-icons/fa';
import { DiMongodb, DiJavascript1 } from 'react-icons/di';
import { SiTypescript, SiTailwindcss, SiPostgresql, SiExpress, SiBlender, SiC, SiCplusplus } from 'react-icons/si';
import SectionPresence from './SectionPresence';

const skills = [
  {
    name: 'React',
    category: 'Frontend',
    description: 'Component-driven UI architecture',
    level: 'Advanced',
    icon: FaReact,
  },
  {
    name: 'JavaScript',
    category: 'Frontend',
    description: 'Dynamic, prototype-based scripting',
    level: 'Advanced',
    icon: DiJavascript1,
  },
  {
    name: 'TypeScript',
    category: 'Frontend',
    description: 'Typed superset of JavaScript',
    level: 'Intermediate',
    icon: SiTypescript,
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    description: 'Utility-first CSS framework',
    level: 'Advanced',
    icon: SiTailwindcss,
  },
  {
    name: 'Node.js',
    category: 'Backend',
    description: 'Server-side JavaScript runtime',
    level: 'Advanced',
    icon: FaNodeJs,
  },
  {
    name: 'MongoDB',
    category: 'Backend',
    description: 'NoSQL document database',
    level: 'Advanced',
    icon: DiMongodb,
  },
  {
    name: 'PostgreSQL',
    category: 'Backend',
    description: 'Relational SQL database',
    level: 'Intermediate',
    icon: SiPostgresql,
  },
  {
    name: 'Git',
    category: 'Tools',
    description: 'Distributed version control',
    level: 'Advanced',
    icon: FaGitAlt,
  },
  {
    name: 'Figma',
    category: 'Tools',
    description: 'Collaborative design tool',
    level: 'Intermediate',
    icon: FaFigma,
  },
  {
    name: 'React Native',
    category: 'Frontend',
    description: 'Cross-platform mobile apps',
    level: 'Intermediate',
    icon: FaReact,
  },
  {
    name: 'HTML',
    category: 'Frontend',
    description: 'Structure of the web',
    level: 'Advanced',
    icon: FaHtml5,
  },
  {
    name: 'CSS',
    category: 'Frontend',
    description: 'Styling and layout',
    level: 'Advanced',
    icon: FaCss3Alt,
  },
  {
    name: 'Express JS',
    category: 'Backend',
    description: 'Minimalist web framework',
    level: 'Intermediate',
    icon: SiExpress,
  },
  {
    name: 'Blender 3D',
    category: 'Tools',
    description: '3D creation suite',
    level: 'Intermediate',
    icon: SiBlender,
  },
  {
    name: 'C Language',
    category: 'Backend',
    description: 'Low-level systems programming',
    level: 'Intermediate',
    icon: SiC,
  },
  {
    name: 'C++',
    category: 'Backend',
    description: 'Object-oriented systems coding',
    level: 'Intermediate',
    icon: SiCplusplus,
  },
  {
    name: 'Python',
    category: 'Backend',
    description: 'General-purpose programming',
    level: 'Advanced',
    icon: FaPython,
  },
];

/* ─── Proficiency bar ─── */
const LevelBar = ({ level }) => {
  const segments = level === 'Advanced' ? 4 : level === 'Intermediate' ? 3 : 2;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 4,
            backgroundColor: i < segments ? 'var(--color-paper)' : 'var(--color-ink-2)',
          }}
        />
      ))}
    </div>
  );
};

/* ─── Single painting card ─── */
const PaintingCard = ({ skill, index }) => {
  const [flipped, setFlipped] = useState(false);

  const bgColor = index % 2 === 0 ? 'var(--color-paper-2)' : 'var(--color-paper-3)';

  return (
    <div
      className="cursor-none"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{
        perspective: 900,
        minWidth: 260,
        width: 260,
        height: 370,
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            border: '2px solid var(--color-ink)',
            boxShadow: '6px 6px 0 var(--color-ink)',
            backgroundColor: bgColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
        >
          {/* Background texture — faded rotated skill name */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-12deg)',
              fontFamily: 'var(--font-heading)',
              fontSize: 64,
              fontWeight: 900,
              color: 'var(--color-ink)',
              opacity: 0.08,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {skill.name}
          </div>

          {/* Bottom label area */}
          <div
            style={{
              padding: '20px 18px',
              borderTop: '2px solid var(--color-ink)',
              backgroundColor: bgColor,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-ink)',
                margin: 0,
              }}
            >
              {skill.name}
            </p>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--color-ink-3)',
                marginTop: 4,
                display: 'inline-block',
                border: '1px solid var(--color-ink-3)',
                padding: '2px 8px',
              }}
            >
              {skill.category}
            </span>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: '2px solid var(--color-ink)',
            boxShadow: '6px 6px 0 var(--color-ink), 0 0 20px var(--color-ink)',
            backgroundColor: 'var(--color-ink)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '30px 22px',
            animation: flipped ? 'glowPulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {/* Icon */}
          <motion.div
            initial={false}
            animate={
              flipped
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <skill.icon size={64} style={{ color: 'var(--color-paper)' }} />
          </motion.div>

          {/* Skill name */}
          <motion.p
            initial={false}
            animate={
              flipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--color-paper)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {skill.name}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={false}
            animate={
              flipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4, delay: 0.32 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-ink-3)',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {skill.description}
          </motion.p>

          {/* Level tag + bar */}
          <motion.div
            initial={false}
            animate={
              flipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--color-paper)',
                border: '1px solid var(--color-paper)',
                padding: '2px 10px',
              }}
            >
              {skill.level}
            </span>
            <LevelBar level={skill.level} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Main Skills Section ─── */
const Skills = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef(null);

  // Compute how many cards fit in the viewport
  useEffect(() => {
    const updateCount = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 260 + 24; // card width + gap
      setVisibleCount(Math.max(1, Math.floor(containerWidth / cardWidth)));
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const maxIndex = Math.max(0, skills.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  // Wheel horizontal scroll for trackpad users
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelAccumulator = 0;
    
    const handleWheel = (e) => {
      // Check if it's primarily a horizontal scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        wheelAccumulator += e.deltaX;
        
        if (wheelAccumulator > 50) {
          setCurrentIndex((i) => Math.min(maxIndex, i + 1));
          wheelAccumulator = 0;
        } else if (wheelAccumulator < -50) {
          setCurrentIndex((i) => Math.max(0, i - 1));
          wheelAccumulator = 0;
        }
      } else {
        // Vertical scroll -> reset accumulator
        wheelAccumulator = 0;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [maxIndex]);

  const slideX = -(currentIndex * (260 + 24));

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section
      id="skills"
      className="py-24 relative border-t-2"
      style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
    >
      <SectionPresence sectionId="skills" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block">02 / SKILLS</span>
          <h2
            style={{
              fontSize: 'clamp(60px, 12vw, 140px)',
              lineHeight: 0.9,
            }}
          >
            TOOLS OF
            <br />
            THE TRADE
          </h2>
        </motion.div>



        {/* Gallery viewport */}
        <div
          ref={containerRef}
          style={{ overflow: 'hidden', width: '100%' }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -(maxIndex * 284), right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipePower = offset.x + (velocity.x * 0.2);
              const cardsMoved = Math.round(swipePower / 284);
              let newIndex = currentIndex - cardsMoved;
              newIndex = Math.max(0, Math.min(newIndex, maxIndex));
              setCurrentIndex(newIndex);
            }}
            animate={{ x: slideX }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{
              display: 'flex',
              gap: 24,
              paddingBottom: 12,
              paddingRight: 12,
              cursor: 'grab',
              touchAction: 'pan-y',
            }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {skills.map((skill, i) => (
              <PaintingCard key={skill.name} skill={skill} index={i} />
            ))}
          </motion.div>
        </div>

        {/* Navigation controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 32,
          }}
        >
          {/* Left arrow */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="cursor-none"
            style={{
              width: 48,
              height: 48,
              border: '2px solid var(--color-ink)',
              backgroundColor: currentIndex === 0 ? 'var(--color-paper-3)' : 'var(--color-ink)',
              color: currentIndex === 0 ? 'var(--color-ink-3)' : 'var(--color-paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              transition: 'background-color 0.15s, color 0.15s',
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentIndex === 0) return;
              e.currentTarget.style.backgroundColor = 'var(--color-paper)';
              e.currentTarget.style.color = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              if (currentIndex === 0) return;
              e.currentTarget.style.backgroundColor = 'var(--color-ink)';
              e.currentTarget.style.color = 'var(--color-paper)';
            }}
            aria-label="Previous skill"
          >
            ←
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="cursor-none"
            style={{
              width: 48,
              height: 48,
              border: '2px solid var(--color-ink)',
              backgroundColor: currentIndex >= maxIndex ? 'var(--color-paper-3)' : 'var(--color-ink)',
              color: currentIndex >= maxIndex ? 'var(--color-ink-3)' : 'var(--color-paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              transition: 'background-color 0.15s, color 0.15s',
              opacity: currentIndex >= maxIndex ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentIndex >= maxIndex) return;
              e.currentTarget.style.backgroundColor = 'var(--color-paper)';
              e.currentTarget.style.color = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              if (currentIndex >= maxIndex) return;
              e.currentTarget.style.backgroundColor = 'var(--color-ink)';
              e.currentTarget.style.color = 'var(--color-paper)';
            }}
            aria-label="Next skill"
          >
            →
          </button>

          {/* Frame counter */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              letterSpacing: '0.12em',
              color: 'var(--color-ink-3)',
              marginLeft: 8,
            }}
          >
            {pad(currentIndex + 1)} / {pad(skills.length)}
          </span>
        </div>
      </div>

      {/* Glow pulse keyframe */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 6px 6px 0 var(--color-ink), 0 0 12px var(--color-ink); }
          50% { box-shadow: 6px 6px 0 var(--color-ink), 0 0 28px var(--color-ink); }
        }

      `}</style>
    </section>
  );
};

export default Skills;
