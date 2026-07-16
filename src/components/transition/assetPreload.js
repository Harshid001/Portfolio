// assetPreload.js
//
// Fixes the "destination page visibly loads" bug (feedback point 1).
//
// The portal canvas is intentionally transparent (see PortalCanvas.jsx),
// which means whatever the destination route renders is visible through it
// immediately on mount. If that route's <img> tags haven't finished
// fetching yet, the user sees broken/blank images or unstyled layout
// *before* the dive/disperse animation finishes hiding it — that's the
// black/blank window you saw in the video around 8-10s.
//
// The fix has two halves:
//   1. THIS FILE — warm the browser's HTTP cache for the destination
//      route's critical images (and wait for webfonts) as early as
//      possible — ideally the instant the user clicks, giving the ~4-8s
//      of animation time to do the fetching invisibly.
//   2. portalDom.js's reveal guard — force-hides `[data-reveal]` elements
//      via CSS the instant they mount, so even in a worst case (slow
//      network, preload not finished) nothing unstyled ever flashes.
//      portalTimelines.js also pauses the timeline at the 'disperse'
//      label until this preload promise resolves (bounded by `timeout`
//      below, so a broken image link can never hang the transition).
//
// ACTION NEEDED: fill in the real critical asset paths per route below.
// Only list assets that are visible "above the fold" / immediately on
// arrival — preloading everything defeats the point of lazy loading.

import profileImg from '../../assets/Profile.png';

const ROUTE_ASSETS = {
  '/': [
    profileImg,
  ],
  '/hobbies': [
    // e.g. '/images/hobbies/hero.jpg', '/images/hobbies/gallery-1.jpg',
  ],
};

// In-flight/complete promises are cached per path so re-triggering a
// transition to the same route (or navigating back and forth) doesn't
// re-fetch assets that are already warm in the browser cache.
const cache = new Map();

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    // Resolve on error too — a missing/broken asset should never hang
    // the transition, it should just fall through to the normal
    // (slightly-less-smooth) load.
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  });
}

function fontsReady() {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.ready) {
    return Promise.resolve();
  }
  return document.fonts.ready.catch(() => {});
}

/**
 * Kick off preloading for a route. Safe to call multiple times — later
 * calls for the same path reuse the same in-flight promise.
 *
 * @param {string} path - the target route, e.g. '/hobbies'
 * @param {object} opts
 * @param {number} opts.timeout - hard cap in ms; the returned promise
 *   always resolves by this point even if some assets are still loading,
 *   so a slow/broken asset can never stall the portal indefinitely.
 */
export function preloadRouteAssets(path, { timeout = 4000 } = {}) {
  if (cache.has(path)) return cache.get(path);

  const urls = ROUTE_ASSETS[path] || [];

  const work = Promise.all([
    fontsReady(),
    ...urls.map(preloadImage),
  ]);

  const capped = new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout);
    work.then(() => {
      clearTimeout(timer);
      resolve();
    });
  });

  cache.set(path, capped);
  return capped;
}

/**
 * Optional: if MainPortfolio / HobbiesProfile are ever converted to
 * React.lazy() chunks, register their dynamic import here so the JS chunk
 * itself is fetched in parallel with the images — same pattern, just add
 * `chunk: () => import('../../HobbiesProfile')` per route and call this
 * from PortalTransitionProvider alongside preloadRouteAssets.
 */
export const ROUTE_CHUNKS = {
  // '/hobbies': () => import('../../components/HobbiesProfile'),
};

export function preloadRouteChunk(path) {
  const loader = ROUTE_CHUNKS[path];
  return loader ? loader().catch(() => {}) : Promise.resolve();
}
