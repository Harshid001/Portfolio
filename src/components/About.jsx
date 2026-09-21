import { lazy, Suspense } from 'react';
import { motion as Motion } from 'framer-motion';
import heroImg from '../assets/Profile.png';
import heroImgWebp from '../assets/Profile.webp';
import GrainText from './GrainText';

const DotShaderBackground = lazy(() => import('./DotShaderBackground'));

const About = () => {
  return (
    <section
      id="about"
      className="relative py-24 border-t-2"
      style={{
        backgroundColor: 'var(--color-paper)',
        borderColor: 'var(--color-ink)',
      }}
    >
      {/* 3D DOT SHADER BACKGROUND */}
      <Suspense fallback={null}>
        <DotShaderBackground />
      </Suspense>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADING (Original size: clamp(40px, 10vw, 120px), strictly 2 lines, box width hugs word limit) */}
        <Motion.div
          className="mb-8 sm:mb-10 about-heading-area relative w-fit max-w-full"
          data-no-shader-action="true"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Subtle soft paper aura to fade out dots behind heading text */}
          <div
            className="absolute -inset-4 sm:-inset-6 pointer-events-none rounded-2xl -z-10"
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 40% 50%, color-mix(in srgb, var(--color-paper) 80%, transparent) 0%, color-mix(in srgb, var(--color-paper) 40%, transparent) 60%, transparent 100%)',
            }}
          />
          <span
            className="section-label mb-3 block"
            style={{ color: 'var(--color-ink)' }}
          >
            01 / ABOUT ME
          </span>
          <h2
            className="w-fit"
            style={{
              fontSize: 'clamp(36px, 10vw, 120px)',
              lineHeight: 0.9,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            <GrainText style={{ display: 'inline-block', width: 'fit-content' }}>
              <span className="whitespace-nowrap block">MORE THAN</span>
              <span className="whitespace-nowrap block">JUST CODE</span>
            </GrainText>
          </h2>
        </Motion.div>

        {/* 2-COLUMN GRID: Hero Image on Left, Beyond Code on Right */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">
          {/* LEFT COLUMN: Hero Image */}
          <div className="w-full flex justify-center lg:justify-start">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-sm lg:max-w-[420px] aspect-[4/5] group"
            >
              {/* GPU-accelerated brutalist shadow */}
              <div
                className="absolute inset-0 bg-[var(--color-ink)] transition-transform duration-300 ease-out group-hover:translate-x-4 group-hover:translate-y-4"
                style={{
                  transform: 'translate(8px, 8px)',
                  willChange: 'transform',
                }}
              />
              {/* Foreground content container */}
              <div
                className="absolute inset-0 brutal-border overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--color-paper-3)',
                  willChange: 'transform',
                }}
              >
                <picture>
                  <source srcSet={heroImgWebp} type="image/webp" />
                  <img
                    src={heroImg}
                    alt="Harshid Soni — Full Stack Developer portrait"
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="1000"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ objectPosition: 'center top' }}
                  />
                </picture>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                />
              </div>
            </Motion.div>
          </div>

          {/* RIGHT COLUMN: Beyond Code Bio */}
          <div
            className="w-full flex flex-col gap-8 lg:pt-4 about-text-area relative"
            data-no-shader-action="true"
          >
            {/* Subtle soft paper aura to fade out dots behind paragraph text */}
            <div
              className="absolute -inset-6 sm:-inset-10 pointer-events-none rounded-3xl -z-10"
              style={{
                background:
                  'radial-gradient(ellipse 85% 75% at 45% 50%, color-mix(in srgb, var(--color-paper) 85%, transparent) 0%, color-mix(in srgb, var(--color-paper) 45%, transparent) 65%, transparent 100%)',
              }}
            />

            {/* Beyond Code (Description) */}
            <div>
              <Motion.h3
                className="text-3xl sm:text-4xl mb-6 font-black uppercase tracking-tight"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-ink)',
                }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
              >
                Beyond Code
              </Motion.h3>

              <Motion.div
                className="space-y-6 lg:space-y-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <p
                  className="text-lg sm:text-xl leading-relaxed font-medium"
                  style={{
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  I am a driven Full Stack Developer with a strong foundation in
                  modern web technologies, currently pursuing my B.E. in
                  Computer Science at Swaminarayan University.
                </p>
                <p
                  className="text-lg sm:text-xl leading-relaxed font-medium"
                  style={{
                    color: 'var(--color-ink-2)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  I specialize in building high-performance, scalable
                  applications with intuitive user experiences. My focus is on
                  writing clean, maintainable code and solving complex
                  real-world problems efficiently.
                </p>
                <p
                  className="text-lg sm:text-xl leading-relaxed font-medium"
                  style={{
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  I thrive in collaborative environments and am eager to bring
                  my technical skills, adaptability, and innovative mindset to a
                  forward-thinking engineering team.
                </p>
              </Motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
