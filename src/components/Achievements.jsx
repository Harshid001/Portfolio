import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import hackathon1 from '../assets/hackathon/hackathon1.jpg';
import hackathon2 from '../assets/hackathon/hackathon2.jpg';
import hackathon3 from '../assets/hackathon/hackathon3.jpg';

const hackathonStats = [
  { value: '5+',  label: 'HACKATHONS ENTERED' },
  { value: '2',   label: 'NATIONAL LEVEL' },
  { value: '48H', label: 'MAX SPRINT' },
  { value: '∞',   label: 'LESSONS LEARNED' },
];

const hackathonDetails = [
  { name: 'Smart India Hackathon', date: '2026', project: 'Smart Factory AI', level: 'National Level' },
  { name: 'CodeFest Challenge', date: '2025', project: 'StudyBuddy Platform', level: 'State Level' },
];

const hackathonHighlights = [
  { title: 'Rapid Prototyping', body: 'Shipped full-stack apps in 24–48 hours under real competition pressure.' },
  { title: 'Team Collaboration', body: 'Divided tasks, communicated under stress, and delivered working prototypes together.' },
  { title: 'Full-Stack Execution', body: 'API integration, backend logic, and Tailwind-powered UIs — all in one sprint.' },
  { title: 'National Exposure', body: 'Competed alongside top developers from across India, sharpening competitive instincts.' },
  { title: 'Problem Solving', body: 'Tackled real industry challenges judged on scalability, innovation, and usability.' },
  { title: 'Growth Mindset', body: 'Every hackathon was a crash course in debugging, optimizing, and shipping fast.' },
];

const certificates = [
  {
    id: '01',
    title: 'Full Stack Web Development',
    issuer: 'Udemy / Self-Directed',
    date: '2024',
    skills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
    color: 'var(--color-ink)',
    accent: 'var(--color-paper)',
  },
  {
    id: '02',
    title: 'JavaScript Algorithms & Data Structures',
    issuer: 'freeCodeCamp',
    date: '2024',
    skills: ['ES6+', 'OOP', 'DSA', 'Problem Solving'],
    color: 'var(--color-paper-3)',
    accent: 'var(--color-ink)',
  },
  {
    id: '03',
    title: 'UI/UX Design Fundamentals',
    issuer: 'Google / Coursera',
    date: '2023',
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research'],
    color: 'var(--color-paper-2)',
    accent: 'var(--color-ink)',
  },
  {
    id: '04',
    title: 'Python for Everybody',
    issuer: 'University of Michigan (Coursera)',
    date: '2023',
    skills: ['Python', 'Data Structures', 'Web Scraping', 'APIs'],
    color: 'var(--color-ink)',
    accent: 'var(--color-paper)',
  },
];

/* ─── Doodle SVG Components ─── */
const DoodleArrow = ({ style }) => (
  <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={style}>
    <path d="M2 15 Q15 5 28 15 Q41 25 54 15" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" fill="none" strokeDasharray="3 2" />
    <path d="M50 10 L58 15 L50 20" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const DoodleStar = ({ style }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={style}>
    <path d="M14 2 L16 11 L25 9 L18 15 L22 24 L14 19 L6 24 L10 15 L3 9 L12 11 Z"
      stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
  </svg>
);

const DoodleCircle = ({ style }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={style}>
    <path d="M20 4 C30 4 36 10 36 20 C36 30 30 36 20 36 C10 36 4 30 4 20 C4 10 10 4 20 4"
      stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"
      strokeDasharray="4 2" />
  </svg>
);

/* ─── PART A: Hackathon Section ─── */
const HackathonSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const doodleY1 = useTransform(scrollYProgress, [0, 1], ['-20px', '40px']);
  const doodleY2 = useTransform(scrollYProgress, [0, 1], ['30px', '-30px']);
  const doodleRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  return (
    <section
      ref={sectionRef}
      id="hackathons"
      className="relative py-24 overflow-hidden border-t-2"
      style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-ink)' }}
    >
      {/* ── FLOATING DOODLE LAYER ── */}
      <motion.div
        style={{ y: doodleY1, rotate: doodleRotate, position: 'absolute', top: '8%', right: '4%', zIndex: 0, color: 'var(--color-ink)', opacity: 0.12, pointerEvents: 'none' }}
      >
        <DoodleStar style={{ width: 64, height: 64 }} />
      </motion.div>
      <motion.div
        style={{ y: doodleY2, position: 'absolute', top: '30%', right: '12%', zIndex: 0, color: 'var(--color-ink)', opacity: 0.1, pointerEvents: 'none' }}
      >
        <DoodleCircle style={{ width: 80, height: 80 }} />
      </motion.div>
      <motion.div
        style={{ y: doodleY1, position: 'absolute', bottom: '15%', left: '3%', zIndex: 0, color: 'var(--color-ink)', opacity: 0.1, pointerEvents: 'none' }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DoodleArrow style={{ width: 80, height: 40 }} />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', top: '55%', left: '8%', zIndex: 0, color: 'var(--color-ink)', opacity: 0.08, pointerEvents: 'none' }}
        animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DoodleStar style={{ width: 44, height: 44 }} />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section label + title */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block">05 / HACKATHONS</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
              BATTLE<br />TESTED
            </h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ color: 'var(--color-ink)', opacity: 0.4, marginBottom: '8px' }}
              animate={{ x: [0, 8, 0] }}
            >
              <DoodleArrow style={{ width: 72, height: 36 }} />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 mb-16"
          style={{ border: '2px solid var(--color-ink)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {hackathonStats.map((stat, i) => (
            <motion.div
              key={i}
              style={{
                padding: '24px 20px',
                borderRight: i < hackathonStats.length - 1 ? '2px solid var(--color-ink)' : 'none',
                textAlign: 'center',
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
              }}
              whileHover={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
              transition={{ duration: 0.15 }}
            >
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1, color: 'inherit' }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'inherit', opacity: 0.7, marginTop: '6px', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Hackathon Details List */}
        <motion.div
          className="mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-ink)', textTransform: 'uppercase', marginBottom: '20px' }}>
            Notable Participations
          </h3>
          {hackathonDetails.map((hack, i) => (
            <div 
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 brutal-border transition-colors duration-300 group"
              style={{ backgroundColor: 'var(--color-paper-3)', color: 'var(--color-ink)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-paper)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-paper-3)'; e.currentTarget.style.color = 'var(--color-ink)'; }}
            >
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'inherit' }}>
                  {hack.name}
                </h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'inherit', opacity: 0.8, letterSpacing: '0.1em', marginTop: '4px' }}>
                  BUILT: {hack.project}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <span className="inline-block px-3 py-1 mb-2 sm:mb-1 border" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', borderColor: 'currentColor', color: 'inherit' }}>
                  {hack.level}
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', color: 'inherit' }}>
                  {hack.date}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Highlight cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0" style={{ border: '2px solid var(--color-ink)' }}>
          {hackathonHighlights.map((item, i) => (
            <motion.div
              key={i}
              className="brutal-card"
              style={{
                padding: '28px 24px',
                borderRight: (i % 3 !== 2) ? '2px solid var(--color-ink)' : 'none',
                borderBottom: i < 3 ? '2px solid var(--color-ink)' : 'none',
                position: 'relative',
                overflow: 'hidden',

                backgroundColor: 'var(--color-paper-2)',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                backgroundColor: 'var(--color-ink)',
                transition: { duration: 0.15 },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.querySelectorAll('[data-invert]').forEach(el => {
                  el.style.color = 'var(--color-paper)';
                });
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelectorAll('[data-invert]').forEach(el => {
                  el.style.color = '';
                });
              }}
            >
              {/* Decorative rotated text watermark */}
              <span style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%) rotate(-20deg)',
                fontFamily: 'var(--font-heading)', fontSize: 80, fontWeight: 900,
                opacity: 0.03, pointerEvents: 'none', userSelect: 'none',
                color: 'var(--color-ink)', whiteSpace: 'nowrap',
              }}>HACK</span>

              <h3
                data-invert="true"
                style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--color-ink)', marginBottom: 10,
                  transition: 'color 0.15s',
                }}
              >
                {item.title}
              </h3>
              <p
                data-invert="true"
                style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65,
                  color: 'var(--color-ink-2)', transition: 'color 0.15s',
                }}
              >
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── HACKATHON JOURNEY GALLERY ── */}
        <motion.div
          className="mt-24 mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-label mb-4 block">GLIMPSES</span>
          <h3 style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1, fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
            HACKATHON JOURNEY
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[hackathon1, hackathon2, hackathon3].map((img, i) => {
            const hackathonAlts = [
              "Harshid Soni at hackathon event - team collaboration",
              "Hackathon coding session - building prototypes under pressure",
              "Hackathon team presentation and project demo"
            ];
            return (
              <motion.div
                key={i}
                className="relative group"
                style={{ aspectRatio: '1/1' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                onTouchStart={() => {}}
              >
                {/* GPU-accelerated brutalist shadow */}
                <div 
                  className="absolute inset-0 bg-[var(--color-ink)] transition-transform duration-200 ease-out group-hover:translate-x-3 group-hover:translate-y-3"
                  style={{ transform: 'translate(6px, 6px)', willChange: 'transform' }}
                />
                {/* Foreground image container */}
                <div className="relative z-10 w-full h-full brutal-border overflow-hidden bg-[var(--color-paper)] transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:-translate-x-1" style={{ willChange: 'transform' }}>
                  <img 
                    src={img} 
                    alt={hackathonAlts[i]} 
                    loading="lazy"
                    className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-105 group-active:scale-105" 
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

/* ─── Certificate Card ─── */
const CertificateCard = ({ cert, index }) => {
  const [hovered, setHovered] = useState(false);
  const isInverted = cert.color === 'var(--color-ink)';

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 60, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.2 } }}
      style={{

        position: 'relative',
      }}
    >
      {/* GPU-accelerated brutalist shadow */}
      <div 
        className="absolute inset-0 transition-transform duration-200 ease-out pointer-events-none"
        style={{ 
          backgroundColor: 'var(--color-ink)',
          transform: hovered ? 'translate(10px, 10px)' : 'translate(6px, 6px)',
          willChange: 'transform'
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
      <div style={{
        position: 'absolute', top: '-10px', right: '-10px',
        fontFamily: 'var(--font-heading)', fontSize: 120, fontWeight: 900,
        opacity: isInverted ? 0.06 : 0.05,
        color: cert.accent, lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {cert.id}
      </div>

      {/* Top strip */}
      <div style={{
        borderBottom: `2px solid ${isInverted ? 'rgba(245,242,237,0.2)' : 'var(--color-ink)'}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: isInverted ? 'rgba(245,242,237,0.5)' : 'var(--color-ink-3)',
        }}>
          CERTIFICATE · {cert.id}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={isInverted ? 'rgba(245,242,237,0.5)' : 'var(--color-ink-3)'}
          strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M8.56 14.75 L6 22 L12 19 L18 22 L15.44 14.75" />
        </svg>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 20px 28px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800,
          fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.2,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          color: cert.accent, marginBottom: 10,
        }}>
          {cert.title}
        </h3>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: isInverted ? 'rgba(245,242,237,0.6)' : 'var(--color-ink-3)',
          marginBottom: 20,
        }}>
          {cert.issuer}
        </p>

        {/* Skills tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 20 }}>
          {cert.skills.map((s) => (
            <span key={s} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              border: `1px solid ${isInverted ? 'rgba(245,242,237,0.3)' : 'var(--color-ink)'}`,
              color: isInverted ? 'rgba(245,242,237,0.7)' : 'var(--color-ink)',
              padding: '3px 10px',
            }}>
              {s}
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: isInverted ? 'rgba(245,242,237,0.4)' : 'var(--color-ink-3)',
            letterSpacing: '0.1em',
          }}>
            {cert.date}
          </span>
          <motion.div
            animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0.4 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 28, height: 28,
              border: `2px solid ${cert.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              stroke={cert.accent} strokeWidth="2" strokeLinecap="round">
              <path d="M2 6 L5 9 L10 3" />
            </svg>
          </motion.div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

/* ─── PART B: Certificates Section ─── */
const CertificatesSection = () => (
  <section
    id="certificates"
    className="py-24 border-t-2"
    style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
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
          EARNED &<br />CERTIFIED
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {certificates.map((cert, i) => (
          <CertificateCard key={cert.id} cert={cert} index={i} />
        ))}
      </div>
    </div>
  </section>
);

/* ─── Main Export ─── */
const Achievements = () => (
  <>
    <HackathonSection />
    <CertificatesSection />
  </>
);

export default Achievements;
