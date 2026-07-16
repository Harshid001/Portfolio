// CameraRig.jsx
//
// Cinematic camera system with:
//   - smooth inertia (position and FOV lerp toward targets, never snap)
//   - physically believable acceleration/deceleration
//   - subtle ambient breathing that persists even when idle
//   - no sudden velocity changes at any point

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGE } from '../transitionState';

// Lerp factor — lower = smoother/laggier, higher = snappier.
// 0.08 gives a nice cinematic drag without feeling sluggish.
const LERP_SPEED = 0.08;
const FOV_LERP = 0.06;

// Track previous values for smooth interpolation
const target = { x: 0, y: 0, z: 6, fov: 50 };
const current = { x: 0, y: 0, z: 6, fov: 50 };

export default function CameraRig({ transitionState }) {
  const { camera } = useThree();

  useFrame((state) => {
    const { stage, diveProgress, disperseProgress } = transitionState;
    const t = state.clock.elapsedTime;

    // ---- Compute target position/FOV based on stage ----
    let targetZ = 6;
    let targetFov = 50;
    let shakeAmp = 0;
    // Ambient camera breathing — always active, very subtle
    let breathX = Math.sin(t * 0.4) * 0.015;
    let breathY = Math.cos(t * 0.35) * 0.01;

    if (stage === STAGE.ANTICIPATE) {
      targetZ = 6;           // camera holds its ground
      targetFov = 49;        // subtle tightening only
    } else if (stage === STAGE.GATHER || stage === STAGE.VORTEX) {
      targetZ = 6;           // still holding while energy gathers
      targetFov = 48;
    } else if (stage === STAGE.PORTAL) {
      targetZ = 6;           // still holding — the portal grows to fill the frame,
      targetFov = 49;        // the camera doesn't chase it
    } else if (stage === STAGE.DIVE) {
      // Cinematic depth — much deeper travel for immersion.
      // The slingshot feel comes from the easing in portalTimelines;
      // here we just map progress to depth and widening FOV.
      targetZ = THREE.MathUtils.lerp(5, -45, diveProgress);
      targetFov = THREE.MathUtils.lerp(50, 78, Math.min(diveProgress * 1.4, 1));
      // Shake intensity peaks at mid-dive (max speed) then fades.
      const speedCurve = Math.sin(diveProgress * Math.PI);
      shakeAmp = speedCurve * 0.03;
      // Reduce breathing during high-speed dive
      breathX *= (1 - diveProgress * 0.8);
      breathY *= (1 - diveProgress * 0.8);
    } else if (stage === STAGE.DISPERSE) {
      targetZ = -45;
      targetFov = THREE.MathUtils.lerp(78, 55, disperseProgress);
      // Breathing returns as we arrive
      breathX *= disperseProgress;
      breathY *= disperseProgress;
    } else if (stage === STAGE.AMBIENT) {
      targetZ = 6;
      targetFov = 50;
      // Gentle breathing persists — the world feels alive.
      breathX = Math.sin(t * 0.25) * 0.02;
      breathY = Math.cos(t * 0.2) * 0.015;
    }

    // ---- Camera shake during dive ----
    const shakeX = Math.sin(t * 8.5) * shakeAmp;
    const shakeY = Math.cos(t * 7.2) * shakeAmp;

    // ---- Smooth interpolation (inertia) ----
    // Position and FOV lerp toward targets — no sudden jumps.
    target.x = breathX + shakeX;
    target.y = breathY + shakeY;
    target.z = targetZ;
    target.fov = targetFov;

    current.x += (target.x - current.x) * LERP_SPEED;
    current.y += (target.y - current.y) * LERP_SPEED;
    current.z += (target.z - current.z) * LERP_SPEED;
    current.fov += (target.fov - current.fov) * FOV_LERP;

    camera.position.set(current.x, current.y, current.z);
    camera.lookAt(0, 0, current.z - 10);

    if (Math.abs(camera.fov - current.fov) > 0.01) {
      camera.fov = current.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
