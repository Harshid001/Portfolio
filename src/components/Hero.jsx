import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaYoutube, FaTwitter } from 'react-icons/fa';
import SectionPresence from './SectionPresence';

const ShaderBackground = lazy(() => import('./ShaderBackground'));

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const textSlam = {
  hidden: { y: 80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "backOut" } },
};

const Hero = () => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <SectionPresence sectionId="home" />

      {/* 3D SHADER BACKGROUND */}
      <Suspense fallback={null}>
        <ShaderBackground />
      </Suspense>

      {/* Semi-transparent overlay for text legibility */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 50%, color-mix(in srgb, var(--color-paper) 55%, transparent) 0%, transparent 60%),
            linear-gradient(90deg, color-mix(in srgb, var(--color-paper) 50%, transparent) 0%, color-mix(in srgb, var(--color-paper) 15%, transparent) 50%, transparent 70%)
          `,
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TEXT CONTENT */}
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          animate="visible" 
          className="max-w-2xl pt-10 lg:pt-0"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <span className="section-label flex items-center gap-3">
              <span 
                className="w-2.5 h-2.5 bg-red-600 block rounded-full" 
                style={{ backgroundColor: 'var(--color-red)', animation: 'pulse-dot 1.5s infinite' }} 
              />
              AVAILABLE FOR WORK
            </span>
          </motion.div>

          <div className="mb-4 overflow-hidden leading-[0.85]">
            <motion.h1 style={{ fontSize: 'clamp(40px, 12vw, 110px)', color: 'var(--color-ink)', letterSpacing: '-0.02em' }} className="flex flex-wrap">
              {['H','A','R','S','H','I','D'].map((char, i) => (
                <motion.span key={i} variants={textSlam} className="inline-block">{char === ' ' ? '\u00A0' : char}</motion.span>
              ))}
            </motion.h1>
            <motion.h1 style={{ fontSize: 'clamp(40px, 12vw, 110px)', color: 'var(--color-ink)', letterSpacing: '-0.02em' }} className="flex flex-wrap">
              {['S','O','N','I'].map((char, i) => (
                <motion.span 
                  key={i} 
                  variants={textSlam} 
                  className="inline-block decoration-ink underline decoration-[4px] sm:decoration-[6px] underline-offset-[8px] sm:underline-offset-[16px]"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <motion.div variants={fadeUp} className="mb-6 mt-12 flex items-center">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--color-ink-2)', letterSpacing: '0.1em', fontWeight: 600 }}>
              [ FULL STACK DEVELOPER ]<span style={{ opacity: showCursor ? 1 : 0, color: 'var(--color-ink)', fontWeight: 'bold' }}>_</span>
            </span>
          </motion.div>

          <motion.p variants={fadeUp} className="text-lg max-w-[420px] mb-10" style={{ color: 'var(--color-ink-2)' }}>
            Building scalable web apps & solving real-world problems. No fluff, just functional code and brutal aesthetics.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row mb-12 w-full sm:w-auto flex-wrap">
            <motion.a 
              href="#projects" 
              onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView(); }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary cursor-none h-[56px] w-full sm:w-auto flex items-center justify-center">
              VIEW PROJECTS
            </motion.a>
            <motion.a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView(); }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary cursor-none h-[56px] w-full sm:w-auto flex items-center justify-center mt-4 sm:mt-0 sm:-ml-[2px]">
              CONTACT ME
            </motion.a>
            <motion.a 
              href="/resume.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="btn-secondary cursor-none h-[56px] w-full sm:w-auto flex items-center justify-center mt-4 sm:mt-0 sm:-ml-[2px]">
              DOWNLOAD RESUME
            </motion.a>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-4">
            {[
              { icon: <FaGithub />, link: "https://github.com/Harshid001" },
              { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/harshid-soni-441500385/" },
              { icon: <FaYoutube />, link: "https://www.youtube.com/@Harshid001" },
              { icon: <FaTwitter />, link: "https://x.com/HarshidSoni2007" }
            ].map((social, i) => (
              <motion.a 
                key={i} 
                href={social.link} 
                target="_blank" 
                rel="noreferrer"
                whileTap={{ scale: 0.9, rotate: 5 }}
                className="w-[44px] h-[44px] flex items-center justify-center text-xl cursor-none transition-all brutal-border" 
                style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-white)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-paper)'; e.currentTarget.style.color = 'var(--color-ink)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div 
        className="absolute bottom-4 right-6 flex flex-col items-center justify-center gap-2 z-10"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.2em' }}>SCROLL</span>
        <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--color-ink)' }} />
      </div>

    </section>
  );
};

export default Hero;
