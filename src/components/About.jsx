import { useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import heroImg from '../assets/hero.png';
import SectionPresence from './SectionPresence';

const DotShaderBackground = lazy(() => import('./DotShaderBackground'));

const CountUp = ({ end, label }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp = null;
    const duration = 1500;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, hasStarted]);

  return (
    <motion.div 
      onViewportEnter={() => setHasStarted(true)} 
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-col brutal-border p-6"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <h3 style={{ fontSize: '72px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1 }}>
        {count}{end.toString().includes('+') || end.toString().includes('%') ? end.toString().replace(/[0-9]/g, '') : ''}
      </h3>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink-3)', letterSpacing: '0.1em', uppercase: 'true' }}>
        {label}
      </p>
    </motion.div>
  );
};

const infoPills = [
  { icon: "📍", text: "INDIA" },
  { icon: "🎓", text: "SWAMINARAYAN UNIVERSITY" },
  { icon: "💼", text: "OPEN TO WORK" }
];

const About = () => {
  return (
    <section id="about" className="relative py-20 md:py-28 lg:py-32 overflow-hidden border-t-2" style={{ borderColor: 'var(--color-ink)' }}>
      <SectionPresence sectionId="about" />

      {/* 3D DOT SHADER BACKGROUND */}
      <Suspense fallback={null}>
        <DotShaderBackground />
      </Suspense>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-20">

        {/* CENTERED HEADING */}
        <motion.div
          className="mb-16 sm:mb-20 md:mb-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label mb-4 block">01 / ABOUT ME</span>
          <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9, color: 'var(--color-ink)' }}>
            MORE THAN<br/>JUST CODE
          </h2>
        </motion.div>

        {/* 2-COLUMN GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 xl:gap-24">

          {/* LEFT COLUMN: My Journey + Image */}
          <div className="w-full overflow-hidden">
            <motion.h3
              className="text-xl sm:text-2xl mb-6 sm:mb-10"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              My Journey
            </motion.h3>

            {/* Info Pills as Timeline Items */}
            <div className="space-y-8 sm:space-y-10 mb-10">
              {infoPills.map((pill, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 brutal-border flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-paper)' }}
                  >
                    <span className="text-lg">{pill.icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-ink)', textTransform: 'uppercase' }}>
                      {pill.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative w-full aspect-square brutal-border transition-all duration-300 group cursor-none"
              style={{ boxShadow: '6px 6px 0 var(--color-ink)', backgroundColor: 'var(--color-paper-3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '12px 12px 0 var(--color-ink)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '6px 6px 0 var(--color-ink)'}
            >
              <img src={heroImg} alt="About Harshid" className="w-full h-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Beyond Code + Stats */}
          <div>
            <motion.h3
              className="text-xl sm:text-2xl mb-6 sm:mb-8"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Beyond Code
            </motion.h3>

            <motion.div
              className="space-y-4 sm:space-y-5 mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="text-[17px] leading-[1.8]" style={{ color: 'var(--color-ink-2)' }}>
                I am a passionate Full Stack Developer currently pursuing a B.E. in Computer Science at Swaminarayan University.
                I enjoy building raw, functional web applications, stripping away the unnecessary to focus on real-world problem-solving.
                I am always open to new opportunities, collaborations, and challenging projects.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-8" style={{ borderTop: '2px solid var(--color-ink)', borderLeft: '2px solid var(--color-ink)' }}>
              <div style={{ marginRight: '-2px', marginBottom: '-2px' }}>
                <CountUp end={"5"} label="PROJECTS" />
              </div>
              <div style={{ marginRight: '-2px', marginBottom: '-2px' }}>
                <CountUp end={"2"} label="YEARS LEARNING" />
              </div>
              <div style={{ marginRight: '-2px', marginBottom: '-2px' }}>
                <CountUp end={"3"} label="TECH STACKS" />
              </div>
              <div style={{ marginRight: '-2px', marginBottom: '-2px' }}>
                <CountUp end={"100"} label="PASSION %" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
