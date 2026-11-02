export function getHeroQuality(device = navigator, reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const cores = device.hardwareConcurrency;
  const memory = device.deviceMemory;
  if (reducedMotion || (cores && cores <= 4) || (memory && memory <= 4)) {
    return { mode: 'static' };
  }
  if (cores >= 12 && memory >= 8) {
    return { mode: 'full', density: 2400, dpr: 1.25, bloom: true, fps: 30 };
  }
  // Missing hardware hints should never opt a device into expensive effects.
  return { mode: 'balanced', density: 900, dpr: 1, bloom: false, fps: 30 };
}
