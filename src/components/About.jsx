import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/Profile.png';
import SectionPresence from './SectionPresence';

const DotShaderBackground = lazy(() => import('./DotShaderBackground'));

const About = () => {
  return (
    <section id="about" className="relative py-24 border-t-2" style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}>
      <SectionPresence sectionId="about" />

      {/* 3D DOT SHADER BACKGROUND */}
      <Suspense fallback={null}>
        <DotShaderBackground />
      </Suspense>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADING */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block" style={{ color: 'var(--color-ink)' }}>01 / ABOUT ME</span>
          <h2
            style={{
              fontSize: 'clamp(40px, 10vw, 120px)',
              lineHeight: 0.9,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            MORE THAN
            <br />
            JUST CODE
          </h2>
        </motion.div>

        {/* 2-COLUMN GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center lg:items-start pt-8">

          {/* LEFT COLUMN: Hero Image */}
          <div className="w-full flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-sm lg:max-w-[420px] aspect-[4/5] brutal-border transition-all duration-300 group overflow-hidden cursor-crosshair"
              style={{ boxShadow: '8px 8px 0 var(--color-ink)', backgroundColor: 'var(--color-paper-3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '16px 16px 0 var(--color-ink)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '8px 8px 0 var(--color-ink)'}
            >
              <img 
                src={heroImg} 
                alt="About Harshid" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                style={{ objectPosition: 'center top' }}
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: 'var(--color-ink)' }}
              />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Text content */}
          <div className="w-full flex flex-col gap-8 lg:pt-4">
            
            {/* Beyond Code (Description) */}
            <div>
              <motion.h3
                className="text-3xl sm:text-4xl mb-8 font-black uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
              >
                Beyond Code
              </motion.h3>

              <motion.div
                className="space-y-6 lg:space-y-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <p className="text-lg sm:text-xl leading-relaxed font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
                  I am a driven Full Stack Developer with a strong foundation in modern web technologies, currently pursuing my B.E. in Computer Science at Swaminarayan University.
                </p>
                <p className="text-lg sm:text-xl leading-relaxed font-medium" style={{ color: 'var(--color-ink-2)', fontFamily: 'var(--font-body)' }}>
                  I specialize in building high-performance, scalable applications with intuitive user experiences. My focus is on writing clean, maintainable code and solving complex real-world problems efficiently. 
                </p>
                <p className="text-lg sm:text-xl leading-relaxed font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
                  I thrive in collaborative environments and am eager to bring my technical skills, adaptability, and innovative mindset to a forward-thinking engineering team.
                </p>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
