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
    willChange: 'transform, opacity',
  });

  document.body.appendChild(ghost);
  return ghost;
}

export function removeGhostLogo(ghost) {
  ghost?.remove();
}

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

export function setEnvironmentInfluence(value) {
  document.documentElement.style.setProperty('--portal-pull', value.toFixed(2));
}

export function clearEnvironmentInfluence() {
  document.documentElement.style.removeProperty('--portal-pull');
}

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
    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, var(--portal-core-color, #8ef) 40%, transparent 75%)',
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

export function setEnvironmentOrigin(x, y) {
  const root = document.documentElement.style;
  root.setProperty('--portal-x', `${Math.round(x)}px`);
  root.setProperty('--portal-y', `${Math.round(y)}px`);
}

export function clearEnvironmentOrigin() {
  const root = document.documentElement.style;
  root.removeProperty('--portal-x');
  root.removeProperty('--portal-y');
}

// ---- Reveal guard ----
// While html[data-portal-active="true"], [data-reveal] elements are forced
// invisible via CSS — synchronously, before any JS runs — so a destination
// page can never flash unstyled content behind the transparent portal
// canvas while it's mounting.
//
// `!important` restored here: it's not required for the *normal* path
// (useWorldReveal's GSAP tween sets inline opacity, which beats a
// non-important rule regardless), but it matters as a defensive backstop
// in any scenario where something else ends up touching `opacity` on
// these elements before the reveal tween runs — with `!important`, the
// guard wins outright rather than depending on which write happened last.
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

export function setPortalActive(active) {
  document.documentElement.dataset.portalActive = active ? 'true' : 'false';
}
