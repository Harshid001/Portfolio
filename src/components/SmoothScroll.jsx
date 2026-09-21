import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // On touch-only mobile devices, native hardware scrolling is already optimal and battery-friendly.
    // Desktop devices with mouse wheels or precision trackpads get luxurious Lenis smooth scrolling.
    const isTouchOnly =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(pointer: fine)').matches;

    if (isTouchOnly) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.__lenis = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    // Keep Lenis updated via native requestAnimationFrame at monitor refresh rate
    let rafId;
    function update(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return children;
}
