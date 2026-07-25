import { useEffect, useState } from 'react';

/**
 * Counts from 0 up to `target` once `active` flips true.
 *
 * Driven by requestAnimationFrame, and state is only committed when the
 * rendered integer actually changes, so a 48-step count costs 48 renders
 * instead of one per frame.
 *
 * Returns `target` immediately when `reduced` is true.
 */
export function useCountUp(target, options = {}) {
  const { active, duration = 1400, reduced = false } = options;
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    if (!active) return;

    let raf = 0;
    let start = 0;
    let last = -1;

    // easeOutExpo: fast out of the gate, long settle. Reads as "under load".
    const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const next = Math.round(ease(t) * target);
      if (next !== last) {
        last = next;
        setValue(next);
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduced]);

  return value;
}

/**
 * Splits a stat string such as "5+", "48H" or "2" into a countable number and
 * its suffix. Returns null when there is no leading digit (the infinity glyph),
 * which is the caller signal to scramble instead of count.
 */
export function parseStat(raw) {
  const m = /^(\d+)(.*)$/.exec(raw);
  if (!m) return null;
  return { number: Number(m[1]), suffix: m[2] };
}
