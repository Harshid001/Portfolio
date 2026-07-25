// PortalRing.jsx
//
// The dimensional gateway — upgraded from a single torus to a dual-torus
// with opposing rotations for volumetric depth. The shader combines:
//   - fresnel rim brightening for glass-like edges
//   - three noise layers (instead of two) for animated distortion
//   - a radial falloff with wider soft glow
//   - subtle color shifting based on time for "living" energy

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGE } from '../transitionState';

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    vUv = uv;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uInfluence;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorGlow;
  uniform vec3 uColorCore;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    // Fresnel — view-dependent rim brightening for volumetric appearance.
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);

    // Three noise layers for rich, animated distortion.
    float n1 = sin(vUv.x * 50.0 + uTime * 1.6) * 0.5 + 0.5;
    float n2 = sin(vUv.y * 30.0 - uTime * 1.1 + vUv.x * 20.0) * 0.5 + 0.5;
    float n3 = sin((vUv.x + vUv.y) * 35.0 + uTime * 0.8) * 0.5 + 0.5;
    float distortion = (n1 * 0.4 + n2 * 0.35 + n3 * 0.25) * 0.45;

    // Soft radial falloff — wider glow for volumetric feel.
    float radial = smoothstep(0.0, 1.0, 1.0 - abs(vUv.y - 0.5) * 1.8);
    float glow = clamp(fresnel + distortion * radial, 0.0, 1.6);

    // Subtle color shift over time — the portal feels alive.
    float colorShift = sin(uTime * 0.4) * 0.15 + 0.85;
    vec3 coreColor = mix(uColorCore, uColorPrimary, colorShift);
    vec3 color = mix(uColorGlow, coreColor, fresnel);

    // Environment influence intensifies the glow.
    float influenceBoost = 1.0 + uInfluence * 0.4;
    float alpha = glow * uProgress * influenceBoost;

    gl_FragColor = vec4(color * (1.0 + glow * 0.8), clamp(alpha, 0.0, 1.0));
  }
`;

export default function PortalRing({ transitionState }) {
  // Outer ring — main portal structure
  const outerRef = useRef(null);
  const outerMatRef = useRef(null);
  // Inner ring — counter-rotating for depth
  const innerRef = useRef(null);
  const innerMatRef = useRef(null);
  // Tiny emissive core that the ring grows from
  const coreRef = useRef(null);
  // Event horizon that blocks homepage content
  const horizonRef = useRef(null);

  const outerUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uInfluence: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#ffffff') },
    uColorGlow: { value: new THREE.Color('#bcd6ff') },
    uColorCore: { value: new THREE.Color('#e8f0ff') },
  }), []);

  const innerUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uInfluence: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#d4e4ff') },
    uColorGlow: { value: new THREE.Color('#8ab4f8') },
    uColorCore: { value: new THREE.Color('#ffffff') },
  }), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const {
      stage, portalProgress, diveProgress, disperseProgress,
      environmentInfluence, coreProgress
    } = transitionState;

    let visible = false;
    let progress = 0;
    let outerScale = 1;
    let innerScale = 0.85;
    let coreVisible = false;
    let coreScale = 0.001;
    let coreOpacity = 0;

    // The core hands off visually into the ring
    if (stage === STAGE.ANTICIPATE || stage === STAGE.GATHER || stage === STAGE.VORTEX) {
      coreVisible = true;
      // Core pulses and grows organically
      coreScale = 0.5 + coreProgress * 2.5 + Math.sin(elapsed * 8) * 0.2;
      coreOpacity = coreProgress;
    }

    if (stage === STAGE.PORTAL) {
      visible = true;
      // Continue from the vortex fade-in (which topped out at 0.3) instead of
      // resetting to portalProgress alone — this removes a dip in the ring's
      // glow right at the stage handoff.
      progress = 0.3 + portalProgress * 0.7;
      
      // Organic breathing: the portal is unstable but controlled.
      // Incorporating transitionState.portalBreath for Point 11.
      const breath = Math.sin(elapsed * 2.5) * 0.04 + Math.cos(elapsed * 1.8) * 0.03;
      const dynamicBreath = transitionState.portalBreath > 0 ? transitionState.portalBreath : 1.0;
      
      outerScale = (0.5 + portalProgress * 0.5 + breath) * dynamicBreath;
      innerScale = (0.4 + portalProgress * 0.45 + breath * 0.8) * dynamicBreath;
      
      // Core fades out as ring establishes
      if (portalProgress < 0.8) {
        coreVisible = true;
        coreScale = 3.0 + portalProgress * 2.0;
        coreOpacity = 1.0 - (portalProgress / 0.8);
      }
    } else if (stage === STAGE.DIVE) {
      visible = true;
      progress = 1;
      // Ring grows and slides past as the camera dives through.
      const breath = Math.sin(elapsed * 4) * 0.08;
      outerScale = 1 + diveProgress * 3.5 + breath;
      innerScale = 0.85 + diveProgress * 3 + breath * 0.8;
      if (outerRef.current) outerRef.current.position.z = -diveProgress * 8;
      if (innerRef.current) innerRef.current.position.z = -diveProgress * 7;
      if (horizonRef.current) horizonRef.current.position.z = -diveProgress * 6.5;
    } else if (stage === STAGE.DISPERSE) {
      visible = true;
      progress = Math.max(0, 1 - disperseProgress);
      outerScale = 1 + disperseProgress * 2;
      innerScale = 0.85 + disperseProgress * 1.8;
    } else if (stage === STAGE.VORTEX) {
      // Point 2: Visual ring growth starts here and scales up significantly.
      visible = true;
      progress = transitionState.vortexProgress * 0.6; // Increased glow during vortex
      const breath = Math.sin(elapsed * 3) * 0.03;
      // Ring scales up dramatically from a small point during vortex
      outerScale = 0.1 + transitionState.vortexProgress * 0.5 + breath;
      innerScale = 0.05 + transitionState.vortexProgress * 0.45 + breath;
    }

    if (coreRef.current) {
      coreRef.current.visible = coreVisible;
      coreRef.current.scale.setScalar(coreScale);
      if (coreRef.current.material) {
        coreRef.current.material.opacity = coreOpacity;
      }
    }

    // Outer ring - living energy rotation
    if (outerRef.current && outerMatRef.current) {
      outerRef.current.visible = visible;
      outerMatRef.current.uniforms.uTime.value = elapsed;
      outerMatRef.current.uniforms.uProgress.value = progress;
      outerMatRef.current.uniforms.uInfluence.value = environmentInfluence;
      outerRef.current.scale.setScalar(outerScale);
      // Continuous organic rotation
      outerRef.current.rotation.z += 0.0015 + Math.sin(elapsed) * 0.0005;
    }

    // Inner ring — counter-rotation creates depth
    if (innerRef.current && innerMatRef.current) {
      innerRef.current.visible = visible;
      innerMatRef.current.uniforms.uTime.value = elapsed;
      innerMatRef.current.uniforms.uProgress.value = progress * 0.7;
      innerMatRef.current.uniforms.uInfluence.value = environmentInfluence;
      innerRef.current.scale.setScalar(innerScale);
      innerRef.current.rotation.z -= 0.0022 + Math.cos(elapsed * 0.8) * 0.0005; 
      innerRef.current.rotation.x = Math.sin(elapsed * 0.3) * 0.1;
      innerRef.current.rotation.y = Math.cos(elapsed * 0.2) * 0.05;
    }
    
    // Event horizon (blocks the homepage from showing through the center)
    if (horizonRef.current) {
      horizonRef.current.visible = visible && (stage === STAGE.PORTAL || stage === STAGE.DIVE || stage === STAGE.DISPERSE || stage === STAGE.VORTEX);
      horizonRef.current.scale.setScalar(innerScale * 1.02);
      if (horizonRef.current.material) {
        // Horizon fades in with the ring progress
        horizonRef.current.material.opacity = progress * 1.5;
      }
    }
  });

  const { viewport } = useThree();
  const baseScale = (Math.min(viewport.width, viewport.height) * 0.42) / 2;

  return (
    <group scale={baseScale}>
      {/* Event Horizon — deep black disk that occludes the homepage */}
      <mesh ref={horizonRef} visible={false} position={[0, 0, -0.2]}>
        <circleGeometry args={[1.7, 32]} />
        <meshBasicMaterial color="#010103" transparent depthWrite={false} />
      </mesh>
      {/* Tiny emissive core */}
      <mesh ref={coreRef} visible={false} position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Outer ring — main portal structure */}
      <mesh ref={outerRef} visible={false}>
        <torusGeometry args={[2, 0.28, 32, 100]} />
        <shaderMaterial
          ref={outerMatRef}
          uniforms={outerUniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner ring — counter-rotating for volumetric depth */}
      <mesh ref={innerRef} visible={false}>
        <torusGeometry args={[1.7, 0.18, 24, 80]} />
        <shaderMaterial
          ref={innerMatRef}
          uniforms={innerUniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
