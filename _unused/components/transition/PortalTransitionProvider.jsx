// PortalTransitionProvider.jsx
//
// Wrap your app with this once, above <Routes>. Anything inside can then call:
//
//   const { triggerPortal, isTransitioning } = usePortalTransition();
//   triggerPortal({ logoEl: someRef.current, targetPath: '/hobbies' });
//
// ============================================================================
// FIX: "component doesn't render on first transition-navigation, only after
// a hard reload"
// ============================================================================
// Root cause: the "safe to reveal" signal was a one-shot `window` event
// (`portal:disperse`), and the CSS guard that hides destination content
// until then (`data-portal-active` on <html>) was only ever cleared in the
// GSAP timeline's final onComplete. Both are fragile in the same way — if
// anything between timeline-start and that final callback throws, stalls,
// or the event simply isn't caught by whatever's listening at that instant,
// nothing ever un-hides the page and nothing ever resets the guard. Because
// both live in memory (a ref/attribute, not anything tied to the page),
// only a full reload clears them — which is exactly the reported symptom.
//
// Fix, two parts:
//   1. The disperse signal is now a React state counter (`disperseKey`)
//      exposed through context instead of a DOM event. A counter in state
//      can't be "missed" — any component reading it via a hook always sees
//      the current value on every render, regardless of exact mount timing.
//   2. Timeline construction is wrapped in try/catch, and a hard safety
//      timeout forces full cleanup (unlocks the page, clears the guard,
//      resets the "is a transition running" ref) if `onComplete` hasn't
//      fired within a generous ceiling. So even a genuine bug deep inside
//      the GSAP timeline can no longer strand the app in a stuck state that
//      only a reload can fix.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

// Generous ceiling — comfortably above the real transition's worst-case
// duration (dive + portal formation + the 4s preload timeout cap, times
// the 0.7 timeScale) — but short enough that a genuinely broken transition
// self-heals in-session instead of requiring a reload.
const SAFETY_TIMEOUT_MS = 3500;

export default function PortalTransitionProvider({ children }) {
  const navigate = useNavigate();
  const transitionState = useRef(createTransitionState()).current;
  const timelineRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const isRunningRef = useRef(false);

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [canvasMounted, setCanvasMounted] = useState(false);
  // Increments once per completed transition, right when the destination
  // is actually ready to reveal. Consumers (useWorldReveal) watch this via
  // context instead of a window event.
  const [disperseKey, setDisperseKey] = useState(0);
  const notifyDisperse = useCallback(() => {
    setDisperseKey((k) => k + 1);
    setPortalActive(false);
  }, []);

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

  useEffect(() => () => {
    timelineRef.current?.kill();
  }, []);

  const lockPage = useCallback((locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
    document.body.style.cursor = locked ? 'wait' : '';
  }, []);

  // Single, idempotent cleanup path — used by normal completion, the
  // try/catch failure path, AND the safety timeout, so there's exactly one
  // place that can "unstick" the app, and it's impossible for state to be
  // left half-cleared.
  const finishTransition = useCallback(() => {
    lockPage(false);
    setPortalActive(false);
    setCanvasMounted(false);
    isRunningRef.current = false;
    setPhase(PHASE.IDLE);
  }, [lockPage]);

  const runReducedMotionFallback = useCallback((targetPath) => {
    lockPage(true);
    setPortalActive(true);
    setPhase(PHASE.OPENING);
    const preloadPromise = preloadRouteAssets(targetPath);

    let done = false;
    const forceUnlockTimer = setTimeout(() => {
      setPortalActive(false);
    }, 3000);

    const safetyTimer = setTimeout(() => {
      if (done) return;
      done = true;
      console.warn('[portal] reduced-motion fallback exceeded safety timeout — forcing cleanup');
      timelineRef.current?.kill();
      notifyDisperse();
      finishTransition();
    }, SAFETY_TIMEOUT_MS);

    try {
      const tl = gsap.timeline({
        onComplete: () => {
          if (done) return;
          done = true;
          clearTimeout(safetyTimer);
          clearTimeout(forceUnlockTimer);
          finishTransition();
        },
      });
      timelineRef.current = tl;
      tl.set('#portal-fade-overlay', { visibility: 'visible' })
        .to('#portal-fade-overlay', { opacity: 1, duration: 0.18, ease: 'power1.out' })
        .addPause('>', () => {
          preloadPromise.then(() => {
            if (tl.paused()) tl.resume();
          });
        })
        .call(() => {
          navigate(targetPath);
          notifyDisperse();
          window.dispatchEvent(new Event('portal:disperse'));
        })
        .to('#portal-fade-overlay', { opacity: 0, duration: 0.25, ease: 'power1.out' })
        .set('#portal-fade-overlay', { visibility: 'hidden' });
    } catch (err) {
      console.error('[portal] reduced-motion fallback failed to start, cleaning up', err);
      clearTimeout(safetyTimer);
      clearTimeout(forceUnlockTimer);
      done = true;
      notifyDisperse();
      finishTransition();
    }
  }, [lockPage, navigate, notifyDisperse, finishTransition]);

  const triggerPortal = useCallback(({ logoEl, targetPath, clickX, clickY }) => {
    if (isRunningRef.current || !targetPath || !logoEl) return;
    isRunningRef.current = true;

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
      let done = false;
      const forceUnlockTimer = setTimeout(() => {
        setPortalActive(false);
      }, 3000);

      const safetyTimer = setTimeout(() => {
        if (done) return;
        done = true;
        console.warn('[portal] transition exceeded safety timeout — forcing cleanup so the app can\'t get stuck');
        timelineRef.current?.kill();
        notifyDisperse();
        finishTransition();
      }, SAFETY_TIMEOUT_MS);

      try {
        const build = direction === 'forward' ? buildForwardTimeline : buildBackwardTimeline;
        const tl = build({
          logoEl,
          clickX,
          clickY,
          transitionState,
          navigate,
          targetPath,
          onDisperse: notifyDisperse,
          onComplete: () => {
            if (done) return;
            done = true;
            clearTimeout(safetyTimer);
            clearTimeout(forceUnlockTimer);
            finishTransition();
          },
        });
        timelineRef.current = tl;
      } catch (err) {
        console.error('[portal] transition failed to start, cleaning up', err);
        clearTimeout(safetyTimer);
        clearTimeout(forceUnlockTimer);
        done = true;
        notifyDisperse();
        finishTransition();
      }
    });
  }, [navigate, lockPage, runReducedMotionFallback, transitionState, notifyDisperse, finishTransition]);

  const contextValue = useMemo(
    () => ({ triggerPortal, phase, isTransitioning: phase !== PHASE.IDLE, disperseKey }),
    [triggerPortal, phase, disperseKey]
  );

  return (
    <PortalTransitionContext.Provider value={contextValue}>
      {children}

      {/* Ambient lighting reaction overlay — opacity-only, compositor-cheap. */}
      <div
        id="portal-ambient-tint"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 996,
          background: 'linear-gradient(135deg, rgba(120,170,255,0.35), rgba(255,150,190,0.22))',
          mixBlendMode: 'overlay',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

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
