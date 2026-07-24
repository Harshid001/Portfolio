import { useRef } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import SkillsMarquee from './components/SkillsMarquee';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';


const MainPortfolio = () => {
  const rootRef = useRef(null);

  return (
    <main ref={rootRef}>
      <div>
        <Hero />
      </div>
      <div>
        <About />
        <SkillsMarquee />
        <Skills />
      </div>
      <div>
        <Projects />
        <Experience />
        <Achievements />
      </div>
      <div>
        <Contact />
      </div>
    </main>
  );
};

export default MainPortfolio;
