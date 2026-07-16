// portalDom.js
//
// The logo "flying to center and dissolving" is implemented as a plain DOM
// element (a "ghost") created imperatively and animated with GSAP — not a
// React component. Two reasons:
//
//   1. It needs to exist and be positioned in the same synchronous tick the
//      user clicks, with zero React render lag.
//   2. It's transient (lives for ~1s, then removed) — mounting it through
//      React just to immediately tear it down adds render-cycle coordination
//      for no benefit.
//
// Tag any element you want the homepage (or the destination page, on the
// way back) to collapse into the logo with `data-portal-collapse`. Optional
// `data-portal-order="N"` overrides stagger order (lower = earlier); default
// order is DOM order.

export function createGhostLogo(logoEl) {
  const rect = logoEl.getBoundingClientRect();
  const computed = getComputedStyle(logoEl);

  const ghost = document.createElement('div');
  ghost.textContent = logoEl.textContent.replace(/\|\s*$/, '').trim() || 'HS';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.dataset.portalGhost = 'true';

  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    display: 'flex',
    alignItems: 'center',
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
    color: computed.color,
    transformOrigin: 'center center',
    zIndex: '1000',
    pointerEvents: 'none',
    willChange: 'transform, opacity, filter',
    filter: 'blur(0px)',
  });

  document.body.appendChild(ghost);
  return ghost;
}

export function removeGhostLogo(ghost) {
  ghost?.remove();
}

// Returns the viewport-center point the ghost logo animates to/from —
// also used as the world-space spawn point for the particle system, since
// the R3F camera looks straight down -Z at the screen center by default.
export function viewportCenter() {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function getCollapseTargets(root = document) {
  return Array.from(root.querySelectorAll('[data-portal-collapse]')).sort((a, b) => {
    const oa = Number(a.dataset.portalOrder ?? 999);
    const ob = Number(b.dataset.portalOrder ?? 999);
    return oa - ob;
  });
}

// ---- Energy pulse ----
// Injects a radial-gradient pulse centered on the logo that briefly flashes
// outward during the ANTICIPATE phase — creates the "reality distorting"
// visual before anything actually moves.
let pulseOverlay = null;

export function createEnergyPulse(cx, cy) {
  if (pulseOverlay) pulseOverlay.remove();
  pulseOverlay = document.createElement('div');
  pulseOverlay.id = 'portal-energy-pulse';
  Object.assign(pulseOverlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '997',
    pointerEvents: 'none',
    background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(188,214,255,0.12) 0%, transparent 60%)`,
    opacity: '0',
    willChange: 'opacity, transform',
  });
  document.body.appendChild(pulseOverlay);
  return pulseOverlay;
}

export function removeEnergyPulse() {
  pulseOverlay?.remove();
  pulseOverlay = null;
}

// ---- Environment influence via CSS custom property ----
// Sets --portal-pull (0→1) on <html> so that any CSS-animated decorative
// elements (floating dots, background shapes) can subscribe to the portal's
// gravitational pull without needing JS per-element.
export function setEnvironmentInfluence(value) {
  document.documentElement.style.setProperty('--portal-pull', value.toFixed(3));
}

export function clearEnvironmentInfluence() {
  document.documentElement.style.removeProperty('--portal-pull');
}

// ---- Energy core & Positional origin ----
// The literal point of energy at the click. Everything else grows from this.
export function createEnergyCore(x, y) {
  const el = document.createElement('div');
  el.className = 'portal-energy-core';
  Object.assign(el.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: '6px',
    height: '6px',
    marginLeft: '-3px',
    marginTop: '-3px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, var(--portal-core-color, #8ef) 45%, transparent 70%)',
    boxShadow: '0 0 12px 4px var(--portal-core-color, #8ef)',
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: '0',
    transform: 'scale(0.3)',
    willChange: 'transform, opacity',
  });
  document.body.appendChild(el);
  return el;
}

export function removeEnergyCore(el) {
  el?.parentNode?.removeChild(el);
}

// Positional counterpart to setEnvironmentInfluence — lets decorative
// elements bend TOWARD the actual point, not just react to a scalar.
export function setEnvironmentOrigin(x, y) {
  const root = document.documentElement.style;
  root.setProperty('--portal-x', `${x}px`);
  root.setProperty('--portal-y', `${y}px`);
}

export function clearEnvironmentOrigin() {
  const root = document.documentElement.style;
  root.removeProperty('--portal-x');
  root.removeProperty('--portal-y');
}

// ---- Reveal guard (fixes the blank/unstyled destination flash) ----
//
// The portal canvas is transparent by design, so the destination route is
// visible behind it from the moment it mounts. useWorldReveal.js already
// waits for the 'portal:disperse' event before animating [data-reveal]
// elements in — but that's a JS-timed hide, which itself only takes effect
// after React has mounted, rendered, and an effect has run. In between
// first paint and that effect, the elements are visible at their natural
// (unhidden) state — that gap is the blank/broken-image flash from the
// video.
//
// This guard closes that gap with a plain CSS rule instead of JS: while
// html[data-portal-active="true"], every [data-reveal] element is forced
// to opacity:0 the instant it's painted — no JS execution required, no
// race condition possible. useWorldReveal's GSAP fromTo() then takes over
// normally once it actually starts the reveal.
let revealGuardInjected = false;

export function ensureRevealGuard() {
  if (revealGuardInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.id = 'portal-reveal-guard';
  style.textContent = `
html[data-portal-active="true"] [data-reveal] {
  opacity: 0 !important;
}
`;
  document.head.appendChild(style);
  revealGuardInjected = true;
}

// Call with true right when a transition (or its reduced-motion fallback)
// starts, and false in its onComplete. Only affects pages that mount
// *while* a transition is in flight — direct/refresh page loads are
// unaffected since the attribute is false by default.
export function setPortalActive(active) {
  document.documentElement.dataset.portalActive = active ? 'true' : 'false';
}
