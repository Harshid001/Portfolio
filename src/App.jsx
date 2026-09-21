import { useState, lazy, Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPortfolio from './MainPortfolio';
import { GridTransitionProvider } from './components/transition/GridTransitionContext';
import GridOverlay from './components/transition/GridOverlay';
import GhostCursor from './components/GhostCursor';

const IntroAnimation = lazy(() => import('./components/IntroAnimation'));

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <GhostCursor />

      <AnimatePresence>
        {showIntro && (
          <Suspense fallback={null}>
            <IntroAnimation onComplete={() => setShowIntro(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      <div
        className="min-h-screen overflow-x-hidden custom-scrollbar"
        style={{
          backgroundColor: 'var(--color-paper)',
          color: 'var(--color-ink)',
        }}
      >
        <AnimatePresence>
          {!showIntro && (
            <motion.div
              key="main-app-content"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
              onAnimationComplete={(e) => {
                if (e?.currentTarget) e.currentTarget.style.willChange = 'auto';
              }}
            >
              <BrowserRouter>
                <GridTransitionProvider>
                  <Navbar />
                  <GridOverlay />

                  <Routes>
                    <Route path="/" element={<MainPortfolio />} />
                  </Routes>

                  <Footer />
                </GridTransitionProvider>
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
