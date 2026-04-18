import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import SectionPresence from './SectionPresence';

import hackathon1 from '../assets/hackathon/hackathon1.jpg';
import hackathon2 from '../assets/hackathon/hackathon2.jpg';
import hackathon3 from '../assets/hackathon/hackathon3.jpg';

/* ─── Data ─── */
const hackathonStats = [
  { value: '5+',  label: 'HACKATHONS ENTERED' },
  { value: '2',   label: 'NATIONAL LEVEL' },
  { value: '48H', label: 'MAX SPRINT' },
  { value: '∞',   label: 'LESSONS LEARNED' },
];

const hackathonHighlights = [
  { icon: '⚡', title: 'Rapid Prototyping', body: 'Shipped full-stack apps in 24–48 hours under real competition pressure.' },
  { icon: '🤝', title: 'Team Collaboration', body: 'Divided tasks, communicated under stress, and delivered working prototypes together.' },
  { icon: '🔧', title: 'Full-Stack Execution', body: 'API integration, backend logic, and Tailwind-powered UIs — all in one sprint.' },
  { icon: '🏆', title: 'National Exposure', body: 'Competed alongside top developers from across India, sharpening competitive instincts.' },
  { icon: '🧠', title: 'Problem Solving', body: 'Tackled real industry challenges judged on scalability, innovation, and usability.' },
  { icon: '🚀', title: 'Growth Mindset', body: 'Every hackathon was a crash course in debugging, optimizing, and shipping fast.' },
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
              }}
              whileHover={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
              transition={{ duration: 0.15 }}
            >
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1, color: 'inherit' }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-ink-3)', marginTop: '6px', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </motion.div>
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
                cursor: 'crosshair',
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

              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3
                data-invert="true"
                style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
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
          {[hackathon1, hackathon2, hackathon3].map((img, i) => (
            <motion.div
              key={i}
              className="brutal-border relative group overflow-hidden cursor-crosshair"
              style={{
                aspectRatio: '1/1',
                backgroundColor: 'var(--color-paper)',
                boxShadow: '6px 6px 0 var(--color-ink)',
                transition: 'box-shadow 0.2s ease',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ boxShadow: '12px 12px 0 var(--color-ink)', y: -5 }}
            >
              <img 
                src={img} 
                alt={`Hackathon Journey ${i + 1}`} 
                className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" 
              />
              
              {/* Optional Brutalist tag */}
              <div 
                className="absolute top-4 left-4 px-3 py-1 brutal-border text-xs font-bold uppercase tracking-widest z-20 translate-y-[-150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
              >
                PHOTO 0{i + 1}
              </div>
            </motion.div>
          ))}
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
        backgroundColor: cert.color,
        border: `2px solid var(--color-ink)`,
        boxShadow: hovered
          ? '10px 10px 0 var(--color-ink)'
          : '6px 6px 0 var(--color-ink)',
        transition: 'box-shadow 0.2s ease',
        cursor: 'crosshair',
        overflow: 'hidden',
        position: 'relative',
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
    <SectionPresence sectionId="hackathons" />
    <HackathonSection />
    <CertificatesSection />
  </>
);

export default Achievements;
