import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionPresence from './SectionPresence';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const paragraphText = "In 2025, I started my journey with React-JS, exploring the fundamentals of web architecture and responsive design. I quickly moved on to building real-world projects like StudyBuddy (an AI study assistant) and e-commerce platforms, mastering React.js and incorporating Node.js and MongoDB. Moving into 2026, my focus shifted toward writing clean, efficient code and optimizing web performance, while learning advanced state management and API integration. Currently, I am actively looking for internships, freelance projects, and full-time roles to apply my skills and continue growing as a developer.";

// Deterministic pseudo-random for scattering
const seededRandom = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const Experience = () => {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let ctx = gsap.context(() => {
      
      if (prefersReducedMotion) {
        gsap.set('.word', { opacity: 1, filter: 'blur(0px)' });
        gsap.set(['.exp-heading', '.exp-breadcrumb', '.exp-progress-line'], { opacity: 1, y: 0 });
        return;
      }

      const words = gsap.utils.toArray('.word');
      
      // Hide initially
      gsap.set(words, { 
        opacity: 0,
        filter: 'blur(8px)',
        y: 15 
      });

      gsap.set('.exp-progress-line', { scaleY: 0, transformOrigin: "top" });
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
        }
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
        }
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
        }
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
        }
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
      <SectionPresence sectionId="experience" />
      
      <div className="exp-parallax-bg absolute inset-0 pointer-events-none opacity-40 z-0" />

      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-ink-3)] z-10 hidden md:block opacity-20">
        <div className="exp-progress-line absolute top-0 left-0 w-full h-full bg-[var(--color-red)]" style={{ boxShadow: '0 0 12px var(--color-red)' }} />
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-20 relative z-20">
        
        <div className="mb-12 md:mb-20 flex flex-col items-start">
          <span className="exp-breadcrumb section-label mb-4 block text-[var(--color-ink-2)]" style={{ letterSpacing: '0.2em' }}>
            04 / MY JOURNEY
          </span>
          <h2 className="exp-heading" style={{ fontSize: 'clamp(36px, 8vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
            EXPERIENCE<br/>& GROWTH
          </h2>
        </div>

        <div className="relative w-full">
          <p className="exp-paragraph" style={{ color: 'var(--color-ink-2)', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 300, lineHeight: 1.6 }}>
            {splitText(paragraphText)}
          </p>
        </div>

      </div>
    </section>
  );
};

export default Experience;
