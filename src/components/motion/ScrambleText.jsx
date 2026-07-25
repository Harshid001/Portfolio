import { useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

/**
 * Terminal-style decode. Cycles random glyphs per character, locking them in
 * left to right until the real text is revealed.
 *
 * Purely a text-content swap: no transform, no reflow beyond the characters
 * themselves. The element is rendered at final width by an invisible sizing
 * span so a decoding line never shifts the layout around it (CLS = 0).
 */
const ScrambleText = ({
  text,
  active = true,
  duration = 800,
  reduced = false,
  className,
  style,
}) => {
  const [display, setDisplay] = useState(reduced || !active ? text : '');
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    if (!active) return;

    let raf = 0;
    let start = 0;

    const tick = (now) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const locked = Math.floor(progress * text.length);

      let out = '';
      for (let i = 0; i < text.length; i += 1) {
        if (i < locked || text[i] === ' ') out += text[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);

      if (progress < 1) {
        frame.current += 1;
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, duration, reduced]);

  return (
    <span className={className} style={{ position: 'relative', ...style }}>
      {/* Reserves the final width so the scramble cannot reflow its neighbours. */}
      <span aria-hidden style={{ visibility: 'hidden' }}>{text}</span>
      <span
        style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}
      >
        {display}
      </span>
    </span>
  );
};

export default ScrambleText;
