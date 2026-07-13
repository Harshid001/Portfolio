import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CollabProvider } from './context/CollabContext';
import CollabCursor from './components/CollabCursor';
import GhostCursors from './components/GhostCursors';
import LiveBar from './components/LiveBar';
import ReactionBurst from './components/ReactionBurst';
import IntroAnimation from './components/IntroAnimation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import SkillsMarquee from './components/SkillsMarquee';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';


function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fullscreen on first click
    const handleFirstClick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Fullscreen not supported or blocked: ${err.message}`);
        });
      }
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  return (
    <CollabProvider>
      <CollabCursor />
      {!isMobile && <GhostCursors />}
      <ReactionBurst />


      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden custom-scrollbar" style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}>
        <AnimatePresence>
          {!showIntro && (
            <motion.div
              key="main-app-content"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <Navbar />

              <main>
                <Hero />
                <About />
                <SkillsMarquee />
                <Skills />
                <Projects />
                <Experience />
                <Achievements />
                <Contact />
              </main>

              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CollabProvider>
  );
}

export default App;
