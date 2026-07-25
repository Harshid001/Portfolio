// gpuTier.js
//
// A1: one GPU detection for the whole app, shared by both the r3f canvases
// and the three hand-rolled WebGLRenderer components. Previously every
// renderer hardcoded its own pixel-ratio ceiling with no knowledge of the
// actual hardware.
//
// `detect-gpu` is already on disk as a @react-three/drei dependency (drei's
// own useDetectGPU is a thin wrapper over it), so this adds no new package to
// the bundle graph that three/r3f wasn't already pulling in. It is imported
// lazily so it never lands in the critical-path chunk.

const FALLBACK = {
  tier: 2,
  isMobile: false,
  dprCap: 1.5,
  particleScale: 1,
  shadows: false,
};

let cached = null;
let pending = null;

/**
 * Synchronous best-guess tier. Safe to call during render or renderer setup;
 * returns the conservative fallback until detection resolves.
 */
export function gpuTierSync() {
  return cached ?? FALLBACK;
}

/**
 * Resolves the real GPU tier once and memoises it. Every caller after the
 * first shares the same promise, so detection runs exactly once per page load.
 */
export function loadGpuTier() {
  if (cached) return Promise.resolve(cached);

  if (!pending) {
    pending = import("detect-gpu")
      .then(({ getGPUTier }) => getGPUTier())
      .then((result) => {
        const tier = result?.tier ?? 2;
        const isMobile = Boolean(result?.isMobile);
        const deviceDpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        cached = {
          tier,
          isMobile,
          // Hard rule from the brief: never exceed min(devicePixelRatio, 2).
          dprCap:
            tier <= 1 ? Math.min(deviceDpr, 1.25) : Math.min(deviceDpr, 2),
          particleScale: tier <= 1 ? 0.5 : 1,
          shadows: tier >= 3,
        };
        return cached;
      })
      .catch(() => {
        // Detection is a progressive enhancement — never let it break a scene.
        cached = FALLBACK;
        return cached;
      });
  }

  return pending;
}
