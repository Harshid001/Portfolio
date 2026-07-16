import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CollabProvider } from './context/CollabContext';
import CollabCursor from './components/CollabCursor';
import GhostCursors from './components/GhostCursors';
import LiveBar from './components/LiveBar';
import ReactionBurst from './components/ReactionBurst';
import IntroAnimation from './components/IntroAnimation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPortfolio from './MainPortfolio';
import PortalTransitionProvider from './components/transition/PortalTransitionProvider';
import { GridTransitionProvider } from './components/transition/GridTransitionContext';
import GridOverlay from './components/transition/GridOverlay';


function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
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
              <BrowserRouter>
                <PortalTransitionProvider>
                  <GridTransitionProvider>
                    <Navbar />
                    <GridOverlay />
                    
                    <Routes>
                      <Route path="/" element={<MainPortfolio />} />
                    </Routes>

                    <Footer />
                  </GridTransitionProvider>
                </PortalTransitionProvider>
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CollabProvider>
  );
}

export default App;
