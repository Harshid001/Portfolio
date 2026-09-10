import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';

import ScrambleText from './motion/ScrambleText';
import RevealText from './motion/RevealText';
import MagneticCard from './motion/MagneticCard';
import { useCountUp, parseStat } from '../hooks/useCountUp';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  blurSlideIn,
  cardRise,
  photoReveal,
  badgePop,
  reducedVariants,
  EASE_WIPE,
} from '../lib/motionVariants';

import hackathon1 from '../assets/hackathon/hackathon1.jpg';
import hackathon2 from '../assets/hackathon/hackathon2.jpg';
import hackathon3 from '../assets/hackathon/hackathon3.jpg';
import hackathon1Webp from '../assets/hackathon/hackathon1.webp';
import hackathon2Webp from '../assets/hackathon/hackathon2.webp';
import hackathon3Webp from '../assets/hackathon/hackathon3.webp';

// Paired so the gallery can serve WebP with a JPEG fallback. Intrinsic sizes
// are recorded here purely to set width/height and kill layout shift - the
// rendered box is still driven by the 1/1 aspect-ratio wrapper.
const hackathonGallery = [
  { webp: hackathon1Webp, fallback: hackathon1, width: 1024, height: 768 },
  { webp: hackathon2Webp, fallback: hackathon2, width: 1024, height: 768 },
  { webp: hackathon3Webp, fallback: hackathon3, width: 576, height: 1024 },
];

const hackathonStats = [
  { value: '5+', label: 'HACKATHONS ENTERED' },
  { value: '2', label: 'NATIONAL LEVEL' },
  { value: '48H', label: 'MAX SPRINT' },
  { value: 'âˆž', label: 'LESSONS LEARNED' },
];

const hackathonDetails = [
  {
    name: 'Smart India Hackathon',
    date: '2026',
    project: 'Smart Factory AI',
    level: 'National Level',
  },
  {
    name: 'CodeFest Challenge',
    date: '2025',
    project: 'StudyBuddy Platform',
    level: 'State Level',
  },
];

const hackathonHighlights = [
  {
    title: 'Rapid Prototyping',
    body: 'Shipped full-stack apps in 24â€“48 hours under real competition pressure.',
  },
  {
    title: 'Team Collaboration',
    body: 'Divided tasks, communicated under stress, and delivered working prototypes together.',
  },
  {
    title: 'Full-Stack Execution',
    body: 'API integration, backend logic, and modern responsive UIs — all in one sprint.',
  },
  {
    title: 'National Exposure',
    body: 'Competed alongside top developers from across India, sharpening competitive instincts.',
  },
  {
    title: 'Problem Solving',
    body: 'Tackled real industry challenges judged on scalability, innovation, and usability.',
  },
  {
    title: 'Growth Mindset',
    body: 'Every hackathon was a crash course in debugging, optimizing, and shipping fast.',
  },
];

const certificates = [
  {
    id: '01',
    title: 'Generative AI Mastermind',
    issuer: 'Outskill',
    date: '2026',
    skills: ['GenAI', 'Prompt Engineering', 'Autonomous Workflows'],
    color: 'var(--color-ink)',
    accent: 'var(--color-paper)',
    link: 'https://res.cloudinary.com/dh0xawlig/image/upload/v1789017756/Screenshot_2026-09-10_105016_bbr6ru.png',
  },
  {
    id: '02',
    title: 'Tic Tech Toe \'26',
    issuer: 'IEEE SB DAIICT',
    date: '2026',
    skills: ['National Competition', 'Tech Challenge', 'Full Stack'],
    color: 'var(--color-paper-3)',
    accent: 'var(--color-ink)',
    link: 'https://res.cloudinary.com/dh0xawlig/image/upload/v1789017863/Screenshot_2026-09-10_105411_h4rsrp.png',
  },
  {
    id: '03',
    title: 'Delta — Full-Stack Dev',
    issuer: 'Apna College',
    date: '2026',
    skills: ['React', 'Node.js', 'Express', 'MongoDB'],
    color: 'var(--color-paper-2)',
    accent: 'var(--color-ink)',
    link: 'https://res.cloudinary.com/dh0xawlig/image/upload/v1789020889/db78aef3-1e58-4c76-89ad-6c30bef84882_dakjv9.png',
  },
  {
    id: '04',
    title: 'TATA Crucible Quiz \'25',
    issuer: 'Tata Group',
    date: '2025',
    skills: ['Business', 'Technology', 'National Quiz'],
    color: 'var(--color-ink)',
    accent: 'var(--color-paper)',
    link: 'https://res.cloudinary.com/dh0xawlig/image/upload/v1789017456/b7c87848-17f6-4c93-a877-bc3674c9989f_rcdv1b.jpg',
  },
  {
    id: '05',
    title: 'Aarogya Setu 2.0',
    issuer: 'Govt of India / NHA',
    date: '2025',
    skills: ['Digital Health', 'Awareness', 'MyGov'],
    color: 'var(--color-paper-3)',
    accent: 'var(--color-ink)',
    link: 'https://res.cloudinary.com/dh0xawlig/image/upload/v1789017501/ba2b66fd-098c-47db-b012-cd33046e9529_s0ws1i.jpg',
  },
];

/* â”€â”€â”€ Doodle SVG Components â”€â”€â”€ */
const DoodleArrow = ({ style }) => (
  <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={style}>
    <path
      d="M2 15 Q15 5 28 15 Q41 25 54 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      strokeDasharray="3 2"
    />
    <path
      d="M50 10 L58 15 L50 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const DoodleStar = ({ style }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={style}>
    <path
      d="M14 2 L16 11 L25 9 L18 15 L22 24 L14 19 L6 24 L10 15 L3 9 L12 11 Z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
      strokeLinejoin="round"
    />
  </svg>
);

const DoodleCircle = ({ style }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={style}>
    <path
      d="M20 4 C30 4 36 10 36 20 C36 30 30 36 20 36 C10 36 4 30 4 20 C4 10 10 4 20 4"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
  </svg>
);

/* â”€â”€â”€ Animated pieces of the hackathon block â”€â”€â”€ */

/**
 * One cell of the stat strip.
 *
 * - the 2px divider "draws" (scaleY 0 to 1) instead of fading in
 * - numeric stats count up, the non-numeric one (infinity) scrambles
 * - hover inverts via a scaleY wipe from the bottom instead of a hard colour cut
 *
 * Palette is untouched: the wipe paints the exact same --color-ink the previous
 * whileHover set, and the resting state renders identically.
 */
const StatCell = ({ stat, index, inView, reduced, isLast }) => {
  const [hovered, setHovered] = useState(false);
  const parsed = parseStat(stat.value);
  const count = useCountUp(parsed ? parsed.number : 0, {
    active: inView,
    duration: 1200 + index * 120,
    reduced,
  });
  const counting = Boolean(parsed) && !reduced && inView && count < parsed.number;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.45, delay: index * 0.1, ease: EASE_WIPE }}
      style={{
        padding: '24px 20px',
        // The border stays in the box model but transparent, so swapping the
        // painted line for an animated element cannot shift the 2px of layout
        // it occupies.
        borderRight: isLast ? 'none' : '2px solid transparent',
        textAlign: 'center',
        backgroundColor: 'var(--color-paper)',
        color: hovered ? 'var(--color-paper)' : 'var(--color-ink)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'color 0.25s',
      }}
    >
      {/* Hover inversion, wiped up from the bottom edge. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.25, ease: EASE_WIPE }}
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'bottom',
          backgroundColor: 'var(--color-ink)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* The divider, drawn top-down, then pulsed while its counter runs. */}
      {!isLast && (
        <motion.span
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{
            scaleY: inView ? 1 : 0,
            opacity: counting ? [0.45, 1, 0.45] : 1,
          }}
          transition={{
            scaleY: { duration: 0.5, delay: index * 0.1, ease: EASE_WIPE },
            opacity: counting
              ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 },
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: -2,
            width: 2,
            backgroundColor: 'var(--color-ink)',
            transformOrigin: 'top',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 900,
            lineHeight: 1,
            color: 'inherit',
          }}
        >
          {parsed ? (
            `${count}${parsed.suffix}`
          ) : (
            <ScrambleText
              text={stat.value}
              active={inView}
              reduced={reduced}
              duration={800}
            />
          )}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            color: 'inherit',
            opacity: 0.7,
            marginTop: '6px',
            textTransform: 'uppercase',
          }}
        >
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
};

/**
 * A single "Notable Participation" row.
 *
 * Enters blurred and offset, decodes its BUILT line like terminal output, then
 * pops its level badge with a one-shot ring. Triggered at -15% so the row is
 * meaningfully on screen before it plays, and once:true so nothing replays on
 * scroll-up.
 */
const ParticipationRow = ({ hack, index, reduced }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-6 brutal-border transition-colors duration-300 group"
      variants={reduced ? reducedVariants : blurSlideIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.15 }}
      style={{
        backgroundColor: 'var(--color-paper-3)',
        color: 'var(--color-ink)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        e.currentTarget.style.backgroundColor = 'var(--color-ink)';
        e.currentTarget.style.color = 'var(--color-paper)';
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        e.currentTarget.style.backgroundColor = 'var(--color-paper-3)';
        e.currentTarget.style.color = 'var(--color-ink)';
      }}
    >
      {/* Left edge bar. scaleX, never width, so it stays on the compositor. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: hovered && !reduced ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: 'currentColor',
          transformOrigin: 'left',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{ x: hovered && !reduced ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <h4
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'inherit',
          }}
        >
          {hack.name}
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'inherit',
            opacity: 0.8,
            letterSpacing: '0.1em',
            marginTop: '4px',
          }}
        >
          BUILT:{' '}
          <ScrambleText
            text={hack.project}
            active={inView}
            reduced={reduced}
            duration={700}
          />
        </p>
      </motion.div>

      <div className="mt-4 sm:mt-0 text-left sm:text-right">
        <motion.span
          className="inline-block px-3 py-1 mb-2 sm:mb-1 border"
          variants={reduced ? reducedVariants : badgePop}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            textTransform: 'uppercase',
            borderColor: 'currentColor',
            color: 'inherit',
            position: 'relative',
          }}
        >
          {hack.level}
          {/* One-shot ring that expands and fades as the badge lands. */}
          {!reduced && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 1 }}
              animate={inView ? { opacity: [0, 0.6, 0], scale: 1.6 } : false}
              transition={{ duration: 0.4, delay: 0.35 + index * 0.15 }}
              style={{
                position: 'absolute',
                inset: -1,
                border: '1px solid currentColor',
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.span>
        <motion.p
          animate={{
            scale: hovered && !reduced ? 1.15 : 1,
            opacity: hovered && !reduced ? 0.7 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'inherit',
            transformOrigin: 'right center',
          }}
        >
          {hack.date}
        </motion.p>
      </div>
    </motion.div>
  );
};

/* â”€â”€â”€ PART A: Hackathon Section â”€â”€â”€ */
const HackathonSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const doodleY1 = useTransform(scrollYProgress, [0, 1], ['-20px', '40px']);
  const doodleY2 = useTransform(scrollYProgress, [0, 1], ['30px', '-30px']);
  const doodleRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  // One switch for the whole section. When the OS asks for reduced motion we
  // hand every child the opacity-only variant set and skip pointer effects.
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  // Halve stagger on small screens so the section does not feel sluggish.
  const stagger = isMobile ? 0.04 : 0.08;

  // Header fires slightly before it is centred so the wipe reads as you arrive.
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-20%' });

  // Counters start only once a good chunk of the strip is on screen.
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-20%' });

  // "Sprint line": fills as the participation list passes through the viewport.
  const listRef = useRef(null);
  const { scrollYProgress: listProgress } = useScroll({
    target: listRef,
    offset: ['start 85%', 'end 60%'],
  });

  // Alternating horizontal drift for the three glimpse photos.
  const galleryX1 = useTransform(scrollYProgress, [0, 1], ['-30px', '30px']);
  const galleryX2 = useTransform(scrollYProgress, [0, 1], ['30px', '-30px']);
  const galleryX3 = useTransform(scrollYProgress, [0, 1], ['-30px', '30px']);
  const galleryX = [galleryX1, galleryX2, galleryX3];

  return (
    <section
      ref={sectionRef}
      id="hackathons"
      className="relative py-24 overflow-hidden border-t-2"
      style={{
        backgroundColor: 'var(--color-paper-2)',
        borderColor: 'var(--color-ink)',
      }}
    >
      {/* â”€â”€ FLOATING DOODLE LAYER â”€â”€ */}
      <motion.div
        style={{
          y: doodleY1,
          rotate: doodleRotate,
          position: 'absolute',
          top: '8%',
          right: '4%',
          zIndex: 0,
          color: 'var(--color-ink)',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <DoodleStar style={{ width: 64, height: 64 }} />
      </motion.div>
      <motion.div
        style={{
          y: doodleY2,
          position: 'absolute',
          top: '30%',
          right: '12%',
          zIndex: 0,
          color: 'var(--color-ink)',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <DoodleCircle style={{ width: 80, height: 80 }} />
      </motion.div>
      <motion.div
        style={{
          y: doodleY1,
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          zIndex: 0,
          color: 'var(--color-ink)',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DoodleArrow style={{ width: 80, height: 40 }} />
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          top: '55%',
          left: '8%',
          zIndex: 0,
          color: 'var(--color-ink)',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
        animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DoodleStar style={{ width: 44, height: 44 }} />
      </motion.div>

      {/* â”€â”€ AMBIENT LAYER â”€â”€ */}
      {!reduced && (
        <>
          {/* Grain. Painted from --color-ink so it inherits the active theme
              instead of introducing a colour of its own. */}
          <motion.div
            aria-hidden
            animate={{ backgroundPosition: ['0px 0px', '128px 96px'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.03,
              backgroundImage:
                'radial-gradient(var(--color-ink) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
            }}
          />
          {/* A single 1px scanline drifting top to bottom every 8s. */}
          <motion.div
            aria-hidden
            initial={{ top: 0 }}
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 1,
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.06,
              backgroundColor: 'var(--color-ink)',
            }}
          />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section label + title */}
        <motion.div
          ref={headerRef}
          className="mb-16"
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
        >
          <span className="section-label mb-4 block">
            <ScrambleText
              text="05 / HACKATHONS"
              active={headerInView}
              reduced={reduced}
              duration={700}
            />
            {!reduced && (
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                style={{ marginLeft: '2px' }}
              >
                â–Œ
              </motion.span>
            )}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {/* Each word is masked independently and staggered by 120ms. The
                text is always laid out, so the h2 never changes size. */}
            <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
              <RevealText reduced={reduced}>BATTLE</RevealText>
              <RevealText reduced={reduced} delay={0.12}>
                TESTED
              </RevealText>
            </h2>
            {/* Outer element wipes the squiggle into view once the words land;
                the inner one keeps the original idle drift. A clip wipe is used
                rather than SVG pathLength so the dashed stroke stays dashed. */}
            <motion.div
              initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 100% 0 0)' }}
              animate={
                headerInView
                  ? reduced
                    ? { opacity: 1 }
                    : { clipPath: 'inset(0 0% 0 0)' }
                  : false
              }
              transition={{ delay: 0.8, duration: 0.8, ease: EASE_WIPE }}
              style={{
                color: 'var(--color-ink)',
                opacity: 0.4,
                marginBottom: '8px',
              }}
            >
              <motion.div animate={reduced ? undefined : { x: [0, 8, 0] }}>
                <DoodleArrow style={{ width: 72, height: 36 }} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 mb-16"
          style={{ border: '2px solid var(--color-ink)' }}
        >
          {hackathonStats.map((stat, i) => (
            <StatCell
              key={i}
              stat={stat}
              index={i}
              inView={statsInView}
              reduced={reduced}
              isLast={i === hackathonStats.length - 1}
            />
          ))}
        </div>

        {/* Hackathon Details List */}
        <div ref={listRef} className="mb-16 space-y-4" style={{ position: 'relative' }}>
          {/* Sprint line. Absolutely positioned so it adds no layout, and
              scaleY is bound directly to the list's scroll progress. */}
          {!reduced && (
            <motion.span
              aria-hidden
              style={{
                position: 'absolute',
                left: -16,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: 'var(--color-ink)',
                opacity: 0.25,
                transformOrigin: 'top',
                scaleY: listProgress,
                pointerEvents: 'none',
              }}
            />
          )}
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            Notable Participations
          </h3>
          {hackathonDetails.map((hack, i) => (
            <ParticipationRow
              key={i}
              hack={hack}
              index={i}
              reduced={reduced}
            />
          ))}
        </div>

        {/* Highlight cards grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
          style={{ border: '2px solid var(--color-ink)' }}
        >
          {hackathonHighlights.map((item, i) => (
            <MagneticCard
              key={i}
              // Pointer tilt and spotlight are meaningless on touch and are
              // suppressed outright for reduced-motion users.
              disabled={isMobile || reduced}
              className="brutal-card"
              style={{
                padding: '28px 24px',
                borderRight:
                  i % 3 !== 2 ? '2px solid var(--color-ink)' : 'none',
                borderBottom: i < 3 ? '2px solid var(--color-ink)' : 'none',
                position: 'relative',
                overflow: 'hidden',

                backgroundColor: 'var(--color-paper-2)',
              }}
              // Diagonal wave: delay grows with row + column, so the reveal
              // sweeps from the top-left corner of the grid.
              variants={reduced ? reducedVariants : cardRise}
              custom={(Math.floor(i / 3) + (i % 3)) * stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{
                backgroundColor: 'var(--color-ink)',
                transition: { duration: 0.15 },
              }}
              onMouseEnter={(e) => {
                e.currentTarget
                  .querySelectorAll('[data-invert]')
                  .forEach((el) => {
                    el.style.color = 'var(--color-paper)';
                  });
              }}
              onMouseLeave={(e) => {
                e.currentTarget
                  .querySelectorAll('[data-invert]')
                  .forEach((el) => {
                    el.style.color = '';
                  });
              }}
            >
              {/* Decorative rotated text watermark */}
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%) rotate(-20deg)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 80,
                  fontWeight: 900,
                  opacity: 0.03,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  color: 'var(--color-ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                HACK
              </span>

              <h3
                data-invert="true"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: 18,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-ink)',
                  marginBottom: 10,
                  transition: 'color 0.15s',
                }}
              >
                {item.title}
              </h3>
              <p
                data-invert="true"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: 'var(--color-ink-2)',
                  transition: 'color 0.15s',
                }}
              >
                {item.body}
              </p>
            </MagneticCard>
          ))}
        </div>

        {/* â”€â”€ HACKATHON JOURNEY GALLERY â”€â”€ */}
        <motion.div
          className="mt-24 mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-label mb-4 block">GLIMPSES</span>
          <h3
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              lineHeight: 1,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-ink)',
            }}
          >
            HACKATHON JOURNEY
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {hackathonGallery.map((img, i) => {
            const hackathonAlts = [
              'Harshid Soni at hackathon event - team collaboration',
              'Hackathon coding session - building prototypes under pressure',
              'Hackathon team presentation and project demo',
            ];
            return (
              <motion.div
                key={i}
                className="relative group"
                // x is a scroll-linked motion value (alternating direction per
                // image); the reveal itself is a bottom-up clip mask.
                style={{ aspectRatio: '1/1', x: reduced ? 0 : galleryX[i] }}
                variants={reduced ? reducedVariants : photoReveal}
                custom={i * (isMobile ? 0.06 : 0.12)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                onTouchStart={() => {}}
              >
                {/* GPU-accelerated brutalist shadow */}
                <div
                  className="absolute inset-0 bg-[var(--color-ink)] transition-transform duration-200 ease-out group-hover:translate-x-3 group-hover:translate-y-3"
                  style={{
                    transform: 'translate(6px, 6px)',
                    willChange: 'transform',
                  }}
                />
                {/* Foreground image container */}
                <div
                  className="relative z-10 w-full h-full brutal-border overflow-hidden bg-[var(--color-paper)] transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:-translate-x-1"
                  style={{ willChange: 'transform' }}
                >
                  <picture>
                    <source srcSet={img.webp} type="image/webp" />
                    <img
                      src={img.fallback}
                      alt={hackathonAlts[i]}
                      loading="lazy"
                      decoding="async"
                      width={img.width}
                      height={img.height}
                      className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-105 group-active:scale-105"
                    />
                  </picture>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─── Certificate Preview Lightbox Modal ─── */
const CertificateModal = ({
  cert,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  totalCount,
  currentIndex,
}) => {
  const [loaded, setLoaded] = useState(false);

  // Close on Escape key, navigate on Arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Reset loaded status when cert changes
  useEffect(() => {
    setLoaded(false);
  }, [cert?.id]);

  if (!cert) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        backgroundColor: 'rgba(7, 9, 14, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate: ${cert.title}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        style={{
          width: '100%',
          maxWidth: '920px',
          backgroundColor: 'var(--color-paper)',
          border: '2px solid var(--color-ink)',
          boxShadow: '10px 10px 0px var(--color-ink)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '2px solid var(--color-ink)',
            backgroundColor: 'var(--color-paper-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                padding: '3px 8px',
              }}
            >
              CERTIFICATE // {cert.id}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-ink-3)',
                letterSpacing: '0.08em',
              }}
              className="hidden sm:inline"
            >
              {currentIndex + 1} OF {totalCount}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full-resolution image in new tab"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '6px 12px',
                border: '1.5px solid var(--color-ink)',
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] cursor-pointer"
            >
              <span>FULL SIZE</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate modal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                border: '1.5px solid var(--color-ink)',
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-[var(--color-red)] hover:text-white hover:border-[var(--color-red)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Certificate Image Canvas Area */}
        <div
          style={{
            position: 'relative',
            padding: '16px',
            backgroundColor: '#0a0c10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
            maxHeight: '58vh',
            overflow: 'hidden',
          }}
        >
          {/* Loading state indicator */}
          {!loaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: 'var(--color-paper-2)',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--color-paper-3)',
                  borderTopColor: 'var(--color-ink)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  color: 'var(--color-ink-3)',
                  textTransform: 'uppercase',
                }}
              >
                LOADING CREDENTIAL...
              </span>
            </div>
          )}

          <img
            key={cert.id}
            src={cert.link}
            alt={cert.title}
            onLoad={() => setLoaded(true)}
            style={{
              maxHeight: '54vh',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              border: '2px solid var(--color-ink)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        </div>

        {/* Certificate Metadata and Navigation Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '2px solid var(--color-ink)',
            backgroundColor: 'var(--color-paper)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-ink)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {cert.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '4px 0 8px',
              }}
            >
              {cert.issuer} • {cert.date}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cert.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid var(--color-ink)',
                    padding: '2px 8px',
                    backgroundColor: 'var(--color-paper-2)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous certificate"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '8px 14px',
                border: '1.5px solid var(--color-ink)',
                backgroundColor: hasPrev
                  ? 'var(--color-paper)'
                  : 'var(--color-paper-3)',
                color: hasPrev ? 'var(--color-ink)' : 'var(--color-ink-3)',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                opacity: hasPrev ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}
              className={
                hasPrev
                  ? 'hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]'
                  : ''
              }
            >
              ← PREV
            </button>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--color-ink-3)',
              }}
            >
              {currentIndex + 1} / {totalCount}
            </span>

            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next certificate"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '8px 14px',
                border: '1.5px solid var(--color-ink)',
                backgroundColor: hasNext
                  ? 'var(--color-paper)'
                  : 'var(--color-paper-3)',
                color: hasNext ? 'var(--color-ink)' : 'var(--color-ink-3)',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                opacity: hasNext ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}
              className={
                hasNext
                  ? 'hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]'
                  : ''
              }
            >
              NEXT →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Certificate Card ─── */
const CertificateCard = ({ cert, index, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const isInverted = cert.color === 'var(--color-ink)';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(cert)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(cert);
        }
      }}
      aria-label={`View certificate: ${cert.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 60, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.2 } }}
      style={{
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* GPU-accelerated brutalist shadow */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out pointer-events-none"
        style={{
          backgroundColor: 'var(--color-ink)',
          transform: hovered ? 'translate(10px, 10px)' : 'translate(6px, 6px)',
          willChange: 'transform',
        }}
      />

      {/* Foreground Content wrapper */}
      <div
        className="relative z-10 overflow-hidden h-full flex flex-col"
        style={{
          backgroundColor: cert.color,
          border: `2px solid var(--color-ink)`,
        }}
      >
        {/* Certificate number watermark */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            fontFamily: 'var(--font-heading)',
            fontSize: 120,
            fontWeight: 900,
            opacity: isInverted ? 0.06 : 0.05,
            color: cert.accent,
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {cert.id}
        </div>

        {/* Top strip */}
        <div
          style={{
            borderBottom: `2px solid ${isInverted ? 'rgba(245,242,237,0.2)' : 'var(--color-ink)'}`,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: isInverted
                ? 'rgba(245,242,237,0.5)'
                : 'var(--color-ink-3)',
            }}
          >
            CERTIFICATE · {cert.id}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isInverted ? 'rgba(245,242,237,0.5)' : 'var(--color-ink-3)'}
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M8.56 14.75 L6 22 L12 19 L18 22 L15.44 14.75" />
          </svg>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 20px 28px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: cert.accent,
              marginBottom: 10,
            }}
          >
            {cert.title}
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isInverted
                ? 'rgba(245,242,237,0.6)'
                : 'var(--color-ink-3)',
              marginBottom: 20,
            }}
          >
            {cert.issuer}
          </p>

          {/* Skills tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: 20,
            }}
          >
            {cert.skills.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: `1px solid ${isInverted ? 'rgba(245,242,237,0.3)' : 'var(--color-ink)'}`,
                  color: isInverted
                    ? 'rgba(245,242,237,0.7)'
                    : 'var(--color-ink)',
                  padding: '3px 10px',
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: isInverted
                  ? 'rgba(245,242,237,0.4)'
                  : 'var(--color-ink-3)',
                letterSpacing: '0.1em',
              }}
            >
              {cert.date}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                border: `1.5px solid ${cert.accent}`,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: hovered ? cert.accent : 'transparent',
                color: hovered
                  ? (isInverted ? 'var(--color-ink)' : 'var(--color-paper)')
                  : cert.accent,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span>VIEW CERTIFICATE</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── PART B: Certificates Section ─── */
const CertificatesSection = () => {
  const [selectedCert, setSelectedCert] = useState(null);

  const currentIndex = selectedCert
    ? certificates.findIndex((c) => c.id === selectedCert.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < certificates.length - 1;

  const handlePrev = () => {
    if (hasPrev) setSelectedCert(certificates[currentIndex - 1]);
  };
  const handleNext = () => {
    if (hasNext) setSelectedCert(certificates[currentIndex + 1]);
  };

  return (
    <section
      id="certificates"
      className="py-24 border-t-2"
      style={{
        backgroundColor: 'var(--color-paper)',
        borderColor: 'var(--color-ink)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block">06 / CREDENTIALS</span>
          <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
            EARNED &<br />
            CERTIFIED
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {certificates.map((cert, i) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              index={i}
              onSelect={(c) => setSelectedCert(c)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCert && (
          <CertificateModal
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            totalCount={certificates.length}
            currentIndex={currentIndex}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

/* â”€â”€â”€ Main Export â”€â”€â”€ */
const Achievements = () => (
  <>
    <HackathonSection />
    <CertificatesSection />
  </>
);

export default Achievements;



