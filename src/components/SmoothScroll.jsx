import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Respect the OS-level motion preference: hijacking the scrollbar is one of
    // the most nausea-inducing things a site can do to these users.
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Standard expo-out curve, slightly snappier than the previous 1.2s ramp
      // so the page stops drifting after the wheel input ends.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native touch scrolling is already smooth and GPU-driven on mobile;
      // syncing it through JS only adds jank and battery drain.
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // Named reference so the cleanup below actually removes THIS callback.
    // The previous version passed a brand-new arrow function to
    // `gsap.ticker.remove()`, so the old one stayed registered forever and kept
    // driving a destroyed Lenis instance on every frame.
    const raf = (time) => lenis.raf(time * 1000);

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return children;
}
