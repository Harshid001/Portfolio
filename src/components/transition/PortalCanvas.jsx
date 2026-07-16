// PortalCanvas.jsx
//
// Mounted by PortalTransitionProvider only for the duration of a
// transition (see `canvasMounted` there) — Three.js, R3F, and the
// postprocessing bundle are never in the render tree, and pay zero cost,
// outside of an actual portal transition.
//
// Particle count stays at 4000 for dense parallax during the dive.
//
// far plane bumped 150 → 220: the dive is now ~4.2s (up from 3.5s) with a
// longer cruise leg, so if/when ParticleField or a tunnel-geometry
// component adds extra depth layers for feedback point 5 ("extend the
// tunnel... make the journey feel deeper"), there's headroom before they
// get clipped. No visual change on its own until those layers exist.

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraRig from './scene/CameraRig';
import ParticleField from './scene/ParticleField';
import PortalRing from './scene/PortalRing';
import PostFX from './scene/PostFX';

export default function PortalCanvas({ transitionState }) {
  return (
    <div
      id="portal-canvas-wrapper"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'transparent', // Homepage remains fully visible around the portal
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 220 }}
      >
        <fog attach="fog" args={['#020205', 10, 90]} />
        <Suspense fallback={null}>
          <CameraRig transitionState={transitionState} />
          <PortalRing transitionState={transitionState} />
          <ParticleField transitionState={transitionState} count={4000} />
          <PostFX transitionState={transitionState} />
        </Suspense>
      </Canvas>
    </div>
  );
}
