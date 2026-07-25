// ParticleField.jsx
//
// A single InstancedMesh (default 4000 instances) plays every particle-driven
// phase of the transition. Deep parallax is achieved by assigning each
// particle a `depthLayer` (0–1) that controls its speed during the dive:
// near particles (layer ~1) streak dramatically past the camera while
// far particles (layer ~0) drift slowly, creating genuine depth perception.
//
// Post-arrival, a subset of particles remain as gentle ambient floaters
// to keep the world feeling alive.

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGE } from '../transitionState';

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

export default function ParticleField({ transitionState, count = 2500 }) {
  const meshRef = useRef(null);

  const particles = useMemo(() => {
    const arr = new Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = {
        angle: Math.random() * Math.PI * 2,
        // Slight bias toward mid-radius so the vortex reads as a ring.
        radius: 0.5 + Math.random() * 2.8,
        spinSpeed: 0.3 + Math.random() * 1.2,
        riseSpeed: (Math.random() - 0.5) * 0.5,
        size: 0.015 + Math.random() * 0.045,
        streak: 5 + Math.random() * 14,
        isWhite: Math.random() > 0.3,
        seed: Math.random() * 1000,
        // Depth layer: 0 = far background, 1 = near foreground.
        // This is the key to parallax — near particles move much faster.
        depthLayer: Math.random(),
        // Turbulence amplitude — slight randomness in movement
        turbulence: 0.3 + Math.random() * 0.7,
        // Ambient drift parameters (post-arrival floating)
        ambientRadius: 1 + Math.random() * 5,
        ambientSpeed: 0.1 + Math.random() * 0.3,
        ambientPhase: Math.random() * Math.PI * 2,
      };
    }
    return arr;
  }, [count]);

  // Assign per-instance color once.
  useMemo(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    particles.forEach((p, i) => {
      tmpColor.set(p.isWhite ? '#ffffff' : '#c7ccd6');
      mesh.setColorAt(i, tmpColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particles]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const {
      stage, gatherProgress, vortexProgress, portalProgress,
      diveProgress, disperseProgress, environmentInfluence,
      clickX, clickY, distortionProgress
    } = transitionState;

    if (stage === STAGE.IDLE) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    // Project pixel click coordinates to 3D world space at z=0
    const originX = clickX ? ((clickX / state.size.width) * 2 - 1) * (state.viewport.width / 2) : 0;
    const originY = clickY ? (-(clickY / state.size.height) * 2 + 1) * (state.viewport.height / 2) : 0;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const angle = p.angle + t * p.spinSpeed * 0.35;
      let x = 0, y = 0, z = 0;
      let scaleX = p.size, scaleY = p.size, scaleZ = p.size;

      // Subtle turbulence offset applied to most stages, boosted by distortionProgress
      const distBoost = 1 + (distortionProgress || 0) * 1.5;
      const turbX = Math.sin(t * 1.3 + p.seed) * p.turbulence * 0.08 * distBoost;
      const turbY = Math.cos(t * 1.7 + p.seed * 0.7) * p.turbulence * 0.08 * distBoost;

      switch (stage) {
        case STAGE.ANTICIPATE: {
          // Particles barely visible, gathering energy at the exact click origin
          const s = p.size * 0.3;
          x = originX + Math.cos(angle) * p.radius * 0.1 + turbX;
          y = originY + Math.sin(angle) * p.radius * 0.1 + turbY;
          z = -0.2;
          scaleX = scaleY = scaleZ = s;
          break;
        }
        case STAGE.GATHER: {
          // Spreading outward from the origin (which has moved to the center).
          const r = p.radius * gatherProgress;
          x = Math.cos(angle) * r + turbX;
          y = Math.sin(angle) * r * 0.6 + turbY;
          z = -gatherProgress * 0.6;
          const s = p.size * (0.2 + gatherProgress * 0.8);
          scaleX = scaleY = scaleZ = s;
          break;
        }
        case STAGE.VORTEX: {
          // Spiral inward — radius eases toward a ring band.
          // Environment influence pulls particles faster.
          const pull = 1 + environmentInfluence * 0.3;
          const r = THREE.MathUtils.lerp(
            p.radius,
            1.6 + (p.radius % 0.5),
            vortexProgress * pull
          );
          x = Math.cos(angle * (1 + vortexProgress * 1.2)) * r + turbX;
          y = Math.sin(angle * (1 + vortexProgress * 1.2)) * r + turbY;
          z = Math.sin(t * 0.7 + p.seed) * 0.35 - vortexProgress * 0.5;
          scaleX = scaleY = scaleZ = p.size;
          break;
        }
        case STAGE.PORTAL: {
          // Settled onto the ring rim, orbiting dynamically.
          // Energy circulates before being pulled in.
          const orbitAngle = angle + (portalProgress * t * p.spinSpeed * 2.0);
          const ringR = 1.8 + Math.sin(p.seed + t * 1.2) * 0.25;
          x = Math.cos(orbitAngle) * ringR + turbX * 0.5;
          y = Math.sin(orbitAngle) * ringR + turbY * 0.5;
          z = Math.sin(t * 1.5 + p.seed) * 0.5;
          scaleX = scaleY = scaleZ = p.size * (1 + portalProgress * 0.6);
          break;
        }
        case STAGE.DIVE: {
          // ---- DEEP PARALLAX & ORGANIC GEOMETRY ----
          // Near particles streak past, far particles move slowly.
          const layerSpeed = 5 + p.depthLayer * 45; 
          // Much longer tunnel for depth
          const travelLength = 250;
          const travel = ((t * layerSpeed + p.seed) % travelLength) - (travelLength - 50);

          // Organic energy formation instead of discrete rings:
          // We use p.radius * p.turbulence rather than modulo math to avoid concentric rings.
          const ringR = 1.2 + (p.radius * p.turbulence * 1.5) * (1 + p.depthLayer);

          // Evolving density: as particles get closer, they spiral more
          const zProgress = Math.max(0, (travel + 150) / 200); // 0 when far, 1 when near
          const orbitAngle = angle + (diveProgress * t * p.spinSpeed * (1.0 + zProgress * 2.0));
          
          x = Math.cos(orbitAngle) * ringR * (1 + diveProgress * 0.5);
          y = Math.sin(orbitAngle) * ringR * (1 + diveProgress * 0.5);
          z = travel;

          const streakFactor = 0.2 + p.depthLayer * 2.5;
          // Organic fragments: 1 in 40 particles becomes a massive light ribbon
          const isRibbon = (i % 40 === 0);
          
          // "Volumetric fog" via scale: fade out in the distance by scaling down
          const fogScale = Math.max(0, Math.min(1, (travel + 200) / 60)); // scales up as it approaches -140

          if (isRibbon) {
            scaleX = scaleY = p.size * 5.0 * fogScale;
            scaleZ = p.size * 150 * streakFactor * (0.5 + diveProgress * 1.5) * fogScale;
          } else {
            scaleX = scaleY = p.size * (0.6 + (1 - p.depthLayer) * 0.5) * fogScale;
            scaleZ = p.size * p.streak * streakFactor * (0.5 + diveProgress * 1.5) * fogScale;
          }

          // Add some organic waviness based on Z depth
          x += Math.sin(z * 0.05 + t) * 0.8 * diveProgress;
          y += Math.cos(z * 0.04 - t) * 0.8 * diveProgress;
          
          x += turbX * (1 - diveProgress * 0.3);
          y += turbY * (1 - diveProgress * 0.3);
          break;
        }
        case STAGE.DISPERSE: {
          const r = THREE.MathUtils.lerp(1.8, p.radius * 2.5, disperseProgress);
          x = Math.cos(angle) * r + turbX;
          y = Math.sin(angle) * r + turbY;
          z = disperseProgress * 1.5;
          const s = p.size * (1 - disperseProgress * 0.85);
          scaleX = scaleY = scaleZ = Math.max(s, 0.0001);
          break;
        }
        case STAGE.AMBIENT: {
          // Post-arrival: gentle floating particles keep the world alive.
          // Only a subset is visible (every other particle) so it's subtle.
          if (i % 3 !== 0) {
            scaleX = scaleY = scaleZ = 0.0001;
            break;
          }
          const aAngle = p.ambientPhase + t * p.ambientSpeed;
          x = Math.cos(aAngle) * p.ambientRadius;
          y = Math.sin(aAngle * 0.7) * p.ambientRadius * 0.6;
          z = Math.sin(t * 0.3 + p.seed) * 1.5;
          scaleX = scaleY = scaleZ = p.size * 0.5;
          break;
        }
        default: {
          scaleX = scaleY = scaleZ = 0.0001;
          break;
        }
      }

      dummy.position.set(x, y, z);
      dummy.scale.set(scaleX, scaleY, Math.max(scaleZ, 0.0001));
      dummy.rotation.set(0, 0, angle);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Whole-field opacity
    const mat = mesh.material;
    if (mat) {
      if (stage === STAGE.ANTICIPATE) mat.opacity = (transitionState.coreProgress || 0) * 0.3;
      else if (stage === STAGE.GATHER) mat.opacity = gatherProgress;
      else if (stage === STAGE.DISPERSE) mat.opacity = 1 - disperseProgress;
      else if (stage === STAGE.AMBIENT) mat.opacity = 0.25;
      else mat.opacity = 1;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
