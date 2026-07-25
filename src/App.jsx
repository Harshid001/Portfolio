import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPortfolio from './MainPortfolio';
import { GridTransitionProvider } from './components/transition/GridTransitionContext';
import GridOverlay from './components/transition/GridOverlay';
import GhostCursor from './components/GhostCursor';

// The intro plays once and is then thrown away, so it should never sit inside
// the main bundle. Splitting it lets the browser parse the actual page sooner.
const IntroAnimation = lazy(() => import('./components/IntroAnimation'));

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {/*
        Mounted from the very first frame, including during the intro.
        Previously it only mounted after the intro finished, so the cursor had
        to boot up mid-interaction — that was the "slight delay" on entry.
        The intro's skip button is a normal button, so it picks up the cursor's
        hover state for free.
      */}
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
              // Drop the compositing layer once the entrance finishes so the
              // whole page isn't permanently promoted to its own GPU texture.
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
