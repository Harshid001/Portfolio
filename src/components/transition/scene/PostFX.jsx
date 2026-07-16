// PostFX.jsx
//
// Cinematic post-processing with restraint:
//   - Bloom: gentle, peaks during dive, never overpowering
//   - Chromatic Aberration: spikes at max speed, fades on arrival
//   - Vignette: deepens during the dive for tunnel vision
//   - All values are smoothly interpolated, never jumping
//
// Bloom intensity is mutated directly on the effect instance via ref
// for smooth per-frame animation without React re-renders.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { STAGE } from '../transitionState';

// Smooth interpolation for all effect values
const fx = { bloom: 0.4, ca: 0.0003, vignette: 0.7 };
const fxTarget = { bloom: 0.4, ca: 0.0003, vignette: 0.7 };
const FX_LERP = 0.07;

export default function PostFX({ transitionState }) {
  const bloomRef = useRef(null);
  const caRef = useRef(null);
  const vignetteRef = useRef(null);

  useFrame(() => {
    const { stage, diveProgress, portalProgress, disperseProgress, distortionProgress } = transitionState;

    // Base targets plus distortion boost
    let targetBloom = 0.4;
    let targetCa = 0.0003;
    let targetVignette = 0.7;

    // ---- Compute targets per stage ----
    if (stage === STAGE.ANTICIPATE) {
      targetBloom = 0.5;
      targetCa = 0.0004;
      targetVignette = 0.75;
    } else if (stage === STAGE.GATHER || stage === STAGE.VORTEX) {
      targetBloom = 0.6;
      targetCa = 0.0005;
      targetVignette = 0.8;
    } else if (stage === STAGE.PORTAL) {
      targetBloom = 0.5 + portalProgress * 0.6;
      targetCa = 0.0005 + portalProgress * 0.001;
      targetVignette = 0.85;
    } else if (stage === STAGE.DIVE) {
      // Peak at mid-dive (max speed), ease off at ends.
      const speedCurve = Math.sin(diveProgress * Math.PI);
      // Subdued bloom so the environment remains clearly visible (no white flash)
      targetBloom = 0.6 + speedCurve * 0.4; 
      targetCa = 0.0006 + speedCurve * 0.0015;
      targetVignette = 0.8 + speedCurve * 0.25;
    } else if (stage === STAGE.DISPERSE) {
      targetBloom = 0.8 * (1 - disperseProgress) + 0.3;
      targetCa = 0.001 * (1 - disperseProgress) + 0.0003;
      targetVignette = 0.9 * (1 - disperseProgress) + 0.5;
    } else if (stage === STAGE.AMBIENT) {
      targetBloom = 0.3;
      targetCa = 0.0002;
      targetVignette = 0.5;
    }

    // Add distortion effects driven by the core's space bending
    const dist = distortionProgress || 0;
    fxTarget.bloom = targetBloom + dist * 0.5;
    fxTarget.ca = targetCa + dist * 0.0025;
    fxTarget.vignette = targetVignette + dist * 0.15;

    // ---- Smooth interpolation ----
    fx.bloom += (fxTarget.bloom - fx.bloom) * FX_LERP;
    fx.ca += (fxTarget.ca - fx.ca) * FX_LERP;
    fx.vignette += (fxTarget.vignette - fx.vignette) * FX_LERP;

    if (bloomRef.current) bloomRef.current.intensity = fx.bloom;
    if (caRef.current?.offset) caRef.current.offset.set(fx.ca, fx.ca);
    if (vignetteRef.current) vignetteRef.current.darkness = fx.vignette;
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloomRef}
        intensity={0.4}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        ref={caRef}
        offset={new THREE.Vector2(0.0003, 0.0003)}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette
        ref={vignetteRef}
        eskil={false}
        offset={0.2}
        darkness={0.7}
      />
    </EffectComposer>
  );
}
