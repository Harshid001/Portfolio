// portalEasing.js
//
// Central place for every ease used across the portal timeline, so the
// forward (open) and backward (close) builders stay visually consistent
// and tuning the feel means editing one file.
//
// Deliberately built from GSAP's free, built-in eases only (power/sine/expo
// families) — no CustomEase / Club GreenSock plugin dependency, so this
// works on a stock `npm install gsap` with nothing else to configure.

export const EASE = {
  // Phase 1 — anticipation: slow charge-up with a springy end
  anticipate: 'power1.inOut',

  // Phase 2 — logo flies to center
  logoFocus: 'expo.inOut',

  // Phase 3 — homepage elements collapse into the portal
  // expo.in for a violent gravitational pull — elements accelerate hard
  // into the vortex.
  collapse: 'expo.in',

  // Phase 4 — particles gather from the dissolved logo
  gather: 'power2.inOut',

  // Phase 5 — particles spiral into the vortex ring
  vortex: 'sine.inOut',

  // Portal formation — dramatic but smooth
  portalForm: 'power3.out',

  // Portal closing (backward trip)
  portalClose: 'power3.in',

  // Phase 7 — particles disperse after arrival
  disperse: 'power2.inOut',

  // Backward trip — reconstruct elements
  reconstruct: 'power2.out',

  // Environment influence ramp — smooth onset
  envInfluence: 'power2.out',
};

// The camera-dive curve, now four legs instead of three (feedback point 4:
// "camera slowly approaches" was missing as its own beat, it went straight
// to acceleration). Chained as:
//   sine.out (slow creep forward while portal is still stabilizing)
//     → expo.in (the actual slingshot acceleration)
//       → none (cruise at max speed through the tunnel)
//         → expo.out (gentle deceleration into the arrival)
export const DIVE_EASE_CHAIN = ['sine.out', 'expo.in', 'none', 'expo.out'];
