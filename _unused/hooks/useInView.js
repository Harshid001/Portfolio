import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element scrolls into view, then disconnects.
 *
 * The previous version spread the whole `options` object into the observer
 * config and listed `options.threshold` / `options.rootMargin` as deps. Because
 * callers pass an object literal, a fresh `options` was created on every render,
 * which tore down and rebuilt the IntersectionObserver constantly.
 * The values are now read once via a ref, so the observer is created exactly one
 * time per element.
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  const threshold = options.threshold ?? 0.15;
  const rootMargin = options.rootMargin ?? '0px';

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Graceful degradation for very old browsers: just show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect(); // trigger once
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
