import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Experience.css';

const ShaderBackground = React.lazy(() => import('./ShaderBackground'));

gsap.registerPlugin(ScrollTrigger);

const paragraphText =
  'Since 2025, I have been building modern web applications with JavaScript, React, Node.js, and Python. Through projects like StudyBuddy, PINCODE, and MF-advisor, I have focused on building reusable UI components, responsive layouts, API integrations, and robust client-side state management. Moving through 2026, my priorities are web performance, accessibility, and production engineering practices while preparing for frontend internships and junior developer roles.';


const Experience = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.word', { opacity: 1, filter: 'blur(0px)' });
        gsap.set(['.exp-heading', '.exp-breadcrumb', '.exp-progress-line'], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const words = gsap.utils.toArray('.word');

      // Hide initially
      gsap.set(words, {
        opacity: 0,
        filter: 'blur(8px)',
        y: 15,
      });

      gsap.set('.exp-progress-line', { scaleY: 0, transformOrigin: 'top' });
      gsap.set(['.exp-breadcrumb', '.exp-heading'], { opacity: 0, y: 40 });

      // -- Header Reveal Animation --
      gsap.to(['.exp-breadcrumb', '.exp-heading'], {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'top 30%',
          scrub: 1,
        },
      });

      // -- Progress Line Animation --
      gsap.to('.exp-progress-line', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: 1,
        },
      });

      // -- Parallax Background --
      gsap.to('.exp-parallax-bg', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // -- Paragraph Reveal Animation --
      // Just let text slowly appear as the user scrolls into the section
      gsap.to(words, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.015,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%', // Triggers when the section reaches the middle of the viewport
          toggleActions: 'play none none reverse', // Plays on enter, reverses on leave back up
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const splitText = (text) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="word-wrapper" style={{ perspective: 400 }}>
        <span className="word inline-block">{word}</span>
        <span className="space">&nbsp;</span>
      </span>
    ));
  };

  return (
    <section
      id="experience"
      ref={containerRef}
      className="exp-section relative w-full flex flex-col justify-start overflow-hidden pt-16 pb-24"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <React.Suspense fallback={null}>
        <ShaderBackground />
      </React.Suspense>

      <div className="exp-parallax-bg absolute inset-0 pointer-events-none opacity-40 z-0" />

      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-ink-3)] z-10 hidden md:block opacity-20">
        <div
          className="exp-progress-line absolute top-0 left-0 w-full h-full bg-[var(--color-red)]"
          style={{ boxShadow: '0 0 12px var(--color-red)' }}
        />
      </div>

      {/* Subtle readability backdrop over dynamic shader */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `
            radial-gradient(ellipse 75% 65% at 50% 50%, color-mix(in srgb, var(--color-paper) 80%, transparent) 0%, color-mix(in srgb, var(--color-paper) 45%, transparent) 100%)
          `,
        }}
      />

      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-20 relative z-20">
        <div className="mb-12 md:mb-20 flex flex-col items-start">
          <span
            className="exp-breadcrumb section-label mb-4 block"
            style={{ 
              letterSpacing: '0.2em',
              color: 'var(--color-ink)',
            }}
          >
            04 / EDUCATION &amp; EXPERIENCE
          </span>
          <h2
            className="exp-heading"
            style={{
              fontSize: 'clamp(36px, 8vw, 80px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
            }}
          >
            EDUCATION &amp;
            <br />EXPERIENCE
          </h2>
        </div>

        <div className="relative w-full">
          {/* Accessible plain paragraph for screen readers */}
          <p className="sr-only">{paragraphText}</p>
          <p
            className="exp-paragraph"
            aria-hidden="true"
            style={{
              color: 'var(--color-ink)',
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            {splitText(paragraphText)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Experience;

