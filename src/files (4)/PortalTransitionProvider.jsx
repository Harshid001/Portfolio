// PortalTransitionProvider.jsx
//
// Wrap your app with this once, above <Routes> (see README for the exact
// spot). Anything inside can then call:
//
//   const { triggerPortal, isTransitioning } = usePortalTransition();
//   triggerPortal({ logoEl: someRef.current, targetPath: '/hobbies' });
//
// The provider figures out direction from targetPath ('/' = returning home
// = backward, anything else = forward), builds the matching GSAP master
// timeline from portalTimelines.js, and mounts <PortalCanvas> only while a
// transition is actually running — the R3F scene, Three.js, and
// postprocessing bundle never load or render at all outside a transition.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import PortalCanvas from './PortalCanvas';
import { createTransitionState } from './transitionState';
import { buildForwardTimeline, buildBackwardTimeline } from './portalTimelines';
import { ensureRevealGuard, setPortalActive } from './portalDom';
import { preloadRouteAssets } from './assetPreload';

const PortalTransitionContext = createContext(null);

export function usePortalTransition() {
  const ctx = useContext(PortalTransitionContext);
  if (!ctx) {
    throw new Error('usePortalTransition must be called within a <PortalTransitionProvider>');
  }
  return ctx;
}

const PHASE = { IDLE: 'idle', OPENING: 'opening', CLOSING: 'closing' };

export default function PortalTransitionProvider({ children }) {
  const navigate = useNavigate();
  const transitionState = useRef(createTransitionState()).current;
  const timelineRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [canvasMounted, setCanvasMounted] = useState(false);

  // Inject the reveal-guard <style> tag once, for the lifetime of the app.
  useEffect(() => {
    ensureRevealGuard();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onChange = (e) => { reducedMotionRef.current = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const lockPage = useCallback((locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
    document.body.style.cursor = locked ? 'wait' : '';
  }, []);

  const runReducedMotionFallback = useCallback((targetPath) => {
    lockPage(true);
    setPortalActive(true);
    // Even the simple fade fallback can show the same blank-page flash,
    // so it gets the same preload guarantee as the full animation.
    const preloadPromise = preloadRouteAssets(targetPath);

    const tl = gsap.timeline({
      onComplete: () => {
        lockPage(false);
        setPortalActive(false);
        setPhase(PHASE.IDLE);
      },
    });
    tl.set('#portal-fade-overlay', { visibility: 'visible' })
      .to('#portal-fade-overlay', { opacity: 1, duration: 0.18, ease: 'power1.out' })
      .addPause('>', () => {
        preloadPromise.then(() => {
          if (tl.paused()) tl.resume();
        });
      })
      .call(() => navigate(targetPath))
      .to('#portal-fade-overlay', { opacity: 0, duration: 0.25, ease: 'power1.out' })
      .set('#portal-fade-overlay', { visibility: 'hidden' });
  }, [lockPage, navigate]);

  const triggerPortal = useCallback(({ logoEl, targetPath, clickX, clickY }) => {
    if (phase !== PHASE.IDLE || !targetPath || !logoEl) return;

    if (reducedMotionRef.current) {
      runReducedMotionFallback(targetPath);
      return;
    }

    const direction = targetPath === '/' ? 'backward' : 'forward';
    setPhase(direction === 'forward' ? PHASE.OPENING : PHASE.CLOSING);
    setCanvasMounted(true);
    lockPage(true);
    setPortalActive(true);

    // Give the canvas one frame to mount before the timeline starts
    // animating values it reads.
    requestAnimationFrame(() => {
      const build = direction === 'forward' ? buildForwardTimeline : buildBackwardTimeline;
      const tl = build({
        logoEl,
        clickX,
        clickY,
        transitionState,
        navigate,
        targetPath,
        onComplete: () => {
          lockPage(false);
          setPortalActive(false);
          setCanvasMounted(false);
          setPhase(PHASE.IDLE);
        },
      });
      timelineRef.current = tl;
    });
  }, [phase, navigate, lockPage, runReducedMotionFallback, transitionState]);

  return (
    <PortalTransitionContext.Provider
      value={{ triggerPortal, phase, isTransitioning: phase !== PHASE.IDLE }}
    >
      {children}

      {/* Accessible fallback overlay used only when reduced-motion is on. */}
      <div
        id="portal-fade-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#05050a',
          opacity: 0,
          visibility: 'hidden',
          zIndex: 998,
          pointerEvents: 'none',
        }}
      />

      {canvasMounted && <PortalCanvas transitionState={transitionState} />}
    </PortalTransitionContext.Provider>
  );
}
