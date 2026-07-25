import { useRef, lazy, Suspense } from 'react';
import Hero from './components/Hero';
import { useWorldReveal } from './components/transition/useWorldReveal';
import { useGridTransition } from './components/transition/GridTransitionContext';

// Only the hero is above the fold. Everything else is code-split so the first
// paint doesn't have to download/parse Achievements (824 lines), the project
// carousel, and the GSAP-driven Experience timeline.
const About = lazy(() => import('./components/About'));
const SkillsMarquee = lazy(() => import('./components/SkillsMarquee'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Experience = lazy(() => import('./components/Experience'));
const Achievements = lazy(() => import('./components/Achievements'));
const Contact = lazy(() => import('./components/Contact'));

// Reserves vertical space while a chunk streams in, so lazy loading never
// causes a layout shift or a scroll jump.
const SectionFallback = () => <div style={{ minHeight: '60vh' }} aria-hidden />;

const MainPortfolio = () => {
  const rootRef = useRef(null);
  useWorldReveal(rootRef);
  const { contentOpacity } = useGridTransition();

  return (
    <main
      ref={rootRef}
      style={{
        opacity: contentOpacity,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <div data-reveal="environment">
        <Hero />
      </div>

      {/*
        `content-visibility: auto` lets the browser skip layout, style and paint
        for sections that are still off-screen. `contain-intrinsic-size` gives it
        a size estimate so the scrollbar stays stable.
      */}
      <div
        data-reveal="objects"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 2000px' }}
      >
        <Suspense fallback={<SectionFallback />}>
          <About />
          <SkillsMarquee />
          <Skills />
        </Suspense>
      </div>

      <div
        data-reveal="cards"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 3000px' }}
      >
        <Suspense fallback={<SectionFallback />}>
          <Projects />
          <Experience />
          <Achievements />
        </Suspense>
      </div>

      <div
        data-reveal="ui"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 1200px' }}
      >
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </div>
    </main>
  );
};

export default MainPortfolio;
