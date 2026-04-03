import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <CollabProvider>
      <CollabCursor />
      {!isMobile && <GhostCursors />}
      <ReactionBurst />
      {!isMobile && <LiveBar />}

      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden custom-scrollbar bg-paper text-ink">
        <Navbar />

        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Contact />
        </main>

        <Footer />
      </div>
    </CollabProvider>
  );
}

export default App;
