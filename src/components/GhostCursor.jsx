import { useEffect, useRef, useState } from 'react';

// Exported so other components (IntroAnimation's eye-box, etc.) can match
// this cursor's exact size/shape instead of hardcoding a duplicate number.
export const CURSOR_RING_SIZE = 36;

const TRAIL_COUNT = 3;
const DOT_SIZE = 7;
const TRAIL_SIZE = 4;

/**
 * Only genuinely interactive elements get the hover state. The old list
 * included `p`, `span`, `li`, `h1`-`h6`, `img` and `svg`, which meant almost
 * every pixel of the page fired a React state update on `mouseover` — the
 * single largest source of cursor lag on this site.
 */
const HOVER_SELECTORS = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'textarea',
  'select',
  'label[for]',
  '.brutal-card',
  '.tag',
  '.btn-primary',
  '.btn-secondary',
  '.skill-item',
  '[data-hoverable]',
].join(', ');

const GhostCursor = () => {
  // `isTouchDevice` is the only piece of React state left. Everything else is
  // written straight to the DOM from a single rAF loop, so moving the mouse
  // never re-renders this component (or its parents) again.
  const [isTouchDevice, setIsTouchDevice] = useState(
    () =>
      typeof window !== 'undefined' &&
      (('ontouchstart' in window && navigator.maxTouchPoints > 0) ||
        window.matchMedia('(pointer: coarse)').matches),
  );

  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    if (isTouchDevice) return;

    const onFirstTouch = () => setIsTouchDevice(true);
    window.addEventListener('touchstart', onFirstTouch, { once: true });

    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!root || !ring || !dot) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: mouse.x, y: mouse.y };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({
      x: mouse.x,
      y: mouse.y,
    }));

    let visible = false;
    let hovering = false;
    let clicking = false;
    let clickTimer = null;
    let frame = null;
    // Only paint when something actually changed. Once the pointer settles the
    // loop STOPS COMPLETELY rather than re-arming a no-op frame every 16ms.
    // The old 0.1px settle threshold was below one CSS pixel, so sub-pixel
    // drift meant `settled` rarely latched and the rAF kept spinning forever.
    let dirty = true;
    let settledFrames = 0;
    const SETTLE_EPS = 0.5;
    const SETTLE_FRAMES = 3;
    // Re-arms the loop after it has fully stopped.
    const wake = () => {
      dirty = true;
      settledFrames = 0;
      if (frame === null) frame = requestAnimationFrame(render);
    };

    const show = () => {
      if (visible) return;
      visible = true;
      wake();
      root.style.opacity = '1';
      document.body.classList.add('hide-cursor');
    };

    const hide = () => {
      if (!visible) return;
      visible = false;
      root.style.opacity = '0';
      document.body.classList.remove('hide-cursor');
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      wake();
      show();
    };

    const onMouseDown = () => {
      clicking = true;
      wake();
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clicking = false;
        wake();
      }, 150);
    };

    const onMouseOver = (e) => {
      const next = !!e.target.closest?.(HOVER_SELECTORS);
      if (next !== hovering) {
        hovering = next;
        wake();
        // Colour/border/pulse changes are handled by CSS transitions on this
        // class; only the transform stays in JS. Toggling here (rather than in
        // the rAF loop) means one class write per hover, not one per frame.
        ring.classList.toggle('is-hover', hovering);
        dot.classList.toggle('is-hover', hovering);
      }
    };

    const render = () => {
      if (!dirty) {
        // Actually stop, don't re-arm. `wake()` restarts on the next input.
        frame = null;
        return;
      }
      frame = requestAnimationFrame(render);

      // Spring-ish follow for the ring, cascading lag for the trail.
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;

      trail[0].x += (mouse.x - trail[0].x) * 0.5;
      trail[0].y += (mouse.y - trail[0].y) * 0.5;
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.3;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.3;
      }

      // Reactivity on interactive elements: the diamond opens up into a larger
      // hollow outline (see `.gc-ring.is-hover` in index.css) and punches back
      // in on click.
      const scale = clicking ? 0.68 : hovering ? 1.7 : 1;
      // A little extra rotation on hover makes the state change feel alive
      // rather than like a plain resize.
      const spin = hovering ? 135 : 45;

      // translate3d keeps every node on its own GPU layer; no layout, no paint.
      ring.style.transform = `translate3d(${ringPos.x - CURSOR_RING_SIZE / 2}px, ${
        ringPos.y - CURSOR_RING_SIZE / 2
      }px, 0) rotate(${spin}deg) scale(${scale})`;

      dot.style.transform = `translate3d(${mouse.x - DOT_SIZE / 2}px, ${
        mouse.y - DOT_SIZE / 2
      }px, 0) rotate(45deg)`;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${trail[i].x - TRAIL_SIZE / 2}px, ${
            trail[i].y - TRAIL_SIZE / 2
          }px, 0)`;
        }
      }

      // Settle check: stop redrawing once everything has caught up. The
      // threshold is half a CSS pixel (below the browser's own snapping), and
      // it must hold for SETTLE_FRAMES consecutive frames before we park the
      // loop — that dead zone stops a single jittery frame from re-dirtying.
      const settled =
        Math.abs(mouse.x - ringPos.x) < SETTLE_EPS &&
        Math.abs(mouse.y - ringPos.y) < SETTLE_EPS &&
        Math.abs(trail[TRAIL_COUNT - 1].x - mouse.x) < SETTLE_EPS &&
        Math.abs(trail[TRAIL_COUNT - 1].y - mouse.y) < SETTLE_EPS;
      if (settled) {
        settledFrames += 1;
        if (settledFrames >= SETTLE_FRAMES) dirty = false;
      } else {
        settledFrames = 0;
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', hide);
    document.documentElement.addEventListener('mouseenter', show);

    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', hide);
      document.documentElement.removeEventListener('mouseenter', show);
      document.body.classList.remove('hide-cursor');
      if (clickTimer) clearTimeout(clickTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  const base = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    mixBlendMode: 'difference',
    backgroundColor: '#FFFFFF',
    willChange: 'transform',
  };

  return (
    <div
      ref={rootRef}
      className="ghost-cursor-root"
      style={{
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          style={{
            ...base,
            width: TRAIL_SIZE,
            height: TRAIL_SIZE,
            backgroundColor: `rgba(255, 255, 255, ${0.4 - i * 0.1})`,
            zIndex: 99998,
          }}
        />
      ))}

      {/*
        `backgroundColor` is deliberately NOT set inline here — the `.gc-ring`
        class owns the fill/border so the hover state can transition smoothly.
      */}
      <div
        ref={ringRef}
        className="gc-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          mixBlendMode: 'difference',
          willChange: 'transform',
          width: CURSOR_RING_SIZE,
          height: CURSOR_RING_SIZE,
          zIndex: 99999,
        }}
      />

      <div
        ref={dotRef}
        className="gc-dot"
        style={{
          ...base,
          width: DOT_SIZE,
          height: DOT_SIZE,
          zIndex: 99999,
        }}
      />
    </div>
  );
};

export default GhostCursor;
