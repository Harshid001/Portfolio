import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPortfolio from './MainPortfolio';
import { GridTransitionProvider } from './components/transition/GridTransitionContext';
import GridOverlay from './components/transition/GridOverlay';
import GhostCursor from './components/GhostCursor';

import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';

const IntroAnimation = lazy(() => import('./components/IntroAnimation'));

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasHash = Boolean(window.location.hash);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem('portfolio_intro_seen');
    if (hasHash || prefersReduced || alreadySeen) return false;
    return true;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('portfolio_intro_seen', 'true');
    } catch {
      // Ignore storage errors in private browsing
    }
  };

  return (
    <>
      <GhostCursor />

      {/* Visible on focus skip link for keyboard & screen reader accessibility */}
      <a href="#projects" className="skip-to-content">
        Skip to content
      </a>

      <AnimatePresence>
        {showIntro && (
          <Suspense fallback={null}>
            <IntroAnimation onComplete={handleIntroComplete} />
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
        <div className="w-full">
          <BrowserRouter>
            <GridTransitionProvider>
              <Navbar />
              <GridOverlay />

              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<MainPortfolio />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>

              <Footer />
            </GridTransitionProvider>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
