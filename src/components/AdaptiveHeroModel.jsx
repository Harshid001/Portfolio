import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { getHeroQuality } from '../lib/heroQuality';

const PrismTypography = lazy(() => import('./PrismTypography'));

function Monogram() {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[10%] pointer-events-none">
      <span className="font-mono font-black text-[clamp(5rem,13vw,13rem)] tracking-tighter text-slate-200/60" style={{ textShadow: '4px 6px 0 #334155' }}>
        {'<HS/>'}
      </span>
    </div>
  );
}

export default function AdaptiveHeroModel() {
  const [quality] = useState(() => getHeroQuality());
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const handleUnavailable = useCallback(() => setUnavailable(true), []);

  useEffect(() => {
    if (quality.mode === 'static') return;
    // Let the page's entrance paint before importing and compiling WebGL.
    const timer = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(timer);
  }, [quality]);

  if (!ready || unavailable || quality.mode === 'static') return <Monogram />;

  return (
    <Suspense fallback={<Monogram />}>
      <PrismTypography quality={quality} onUnavailable={handleUnavailable} />
    </Suspense>
  );
}
