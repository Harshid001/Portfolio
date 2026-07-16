import { useRef } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import SkillsMarquee from './components/SkillsMarquee';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import { useWorldReveal } from './components/transition/useWorldReveal';
import { useGridTransition } from './components/transition/GridTransitionContext';

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
        willChange: 'opacity'
      }}
    >
      <div data-portal-collapse data-reveal="environment">
        <Hero />
      </div>
      <div data-portal-collapse data-reveal="objects">
        <About />
        <SkillsMarquee />
        <Skills />
      </div>
      <div data-portal-collapse data-reveal="cards">
        <Projects />
        <Experience />
        <Achievements />
      </div>
      <div data-portal-collapse data-reveal="ui">
        <Contact />
      </div>
    </main>
  );
};

export default MainPortfolio;
