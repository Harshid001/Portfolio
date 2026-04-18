import { useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import heroImg from '../assets/Profile.png';
import SectionPresence from './SectionPresence';

const DotShaderBackground = lazy(() => import('./DotShaderBackground'));

const CountUp = ({ end, label }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp = null;
    const duration = 1500;
    
    const step = (timestamp) => {      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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
      className="flex flex-col brutal-border p-4 sm:p-6 h-full justify-center items-center text-center"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <h3 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1 }}>
        {count}{end.toString().includes('+') || end.toString().includes('%') ? end.toString().replace(/[0-9]/g, '') : ''}
      </h3>
      <p className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-3)' }}>
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
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-start">

          {/* LEFT COLUMN: Hero Image + Stats */}
          <div className="w-full flex flex-col gap-10 sm:gap-12">
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-square brutal-border transition-all duration-300 group cursor-crosshair"
              style={{ boxShadow: '8px 8px 0 var(--color-ink)', backgroundColor: 'var(--color-paper-3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '16px 16px 0 var(--color-ink)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '8px 8px 0 var(--color-ink)'}
            >
              <img src={heroImg} alt="About Harshid" className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-0" 
              style={{ borderTop: '2px solid var(--color-ink)', borderLeft: '2px solid var(--color-ink)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
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
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Text content + Info Pills */}
          <div className="w-full flex flex-col gap-12 sm:gap-16 lg:pt-4">
            
            {/* Beyond Code (Description) */}
            <div>
              <motion.h3
                className="text-2xl sm:text-3xl mb-6 font-black uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Beyond Code
              </motion.h3>

              <motion.div
                className="space-y-4 sm:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <p className="text-lg sm:text-xl leading-relaxed text-justify font-medium" style={{ color: 'var(--color-ink)' }}>
                  I am a passionate Full Stack Developer currently pursuing a B.E. in Computer Science at Swaminarayan University.
                  <br/><br/>
                  I enjoy building raw, functional web applications, stripping away the unnecessary to focus on real-world problem-solving.
                  I am always open to new opportunities, collaborations, and challenging projects.
                </p>
              </motion.div>
            </div>

            {/* My Journey (Info Pills) */}
            <div>
              <motion.h3
                className="text-2xl sm:text-3xl mb-8 font-bold uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                My Journey
              </motion.h3>

              <div className="space-y-6">
                {infoPills.map((pill, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4 sm:gap-6 items-center p-4 border-2 group hover:bg-neutral-100 transition-colors duration-300 hover:cursor-crosshair brutal-border"
                    style={{ backgroundColor: 'var(--color-paper)' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div 
                      className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl group-hover:scale-125 transition-transform duration-300"
                    >
                      {pill.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold tracking-widest text-sm sm:text-base group-hover:translate-x-2 transition-transform duration-300" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', textTransform: 'uppercase' }}>
                        {pill.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
