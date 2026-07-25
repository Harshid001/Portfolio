import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  shaderMaterial,
  useTrailTexture,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";
import { loadGpuTier } from "../lib/gpuTier";

// A9: hoisted out of the pointer handler, which allocated a Vector2 plus a
// wrapper object on every animation frame the cursor was moving.
// Verified safe against drei: TrailTexture.addTouch() copies point.x / point.y
// into a new record synchronously and never retains the vector we hand it.
const POINTER_UV = new THREE.Vector2();
const POINTER_EVENT = { uv: POINTER_UV };

const DotMaterialImpl = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
    dotColor: new THREE.Color("#0d0d0d"),
    bgColor: new THREE.Color("#f5f2ed"),
    mouseTrail: null,
    render: 0,
    rotation: 0,
    gridSize: 50,
    dotOpacity: 0.08,
  },
  `
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform float time;
    uniform int render;
    uniform vec2 resolution;
    uniform vec3 dotColor;
    uniform vec3 bgColor;
    uniform sampler2D mouseTrail;
    uniform float rotation;
    uniform float gridSize;
    uniform float dotOpacity;

    vec2 rotate(vec2 uv, float angle) {
      float s = sin(angle);
      float c = cos(angle);
      mat2 rotationMatrix = mat2(c, -s, s, c);
      return rotationMatrix * (uv - 0.5) + 0.5;
    }

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    float sdfCircle(vec2 p, float r) {
      return length(p - 0.5) - r;
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);
      vec2 rotatedUv = rotate(uv, rotation);
      vec2 gridUv = fract(rotatedUv * gridSize);
      vec2 gridUvCenterInScreenCoords = rotate((floor(rotatedUv * gridSize) + 0.5) / gridSize, -rotation);

      float baseDot = sdfCircle(gridUv, 0.25);
      
      // Enhanced mouse influence — more lively cursor response
      float mouseInfluence = texture2D(mouseTrail, gridUvCenterInScreenCoords).r;
      float scaleInfluence = mouseInfluence * 0.9;

      float dotSize = 0.15; // fixed base size for uniform grid
      float sdfDot = sdfCircle(gridUv, dotSize * (1.0 + scaleInfluence * 1.5));
      float smoothDot = smoothstep(0.05, 0.0, sdfDot);

      // Boosted opacity influence for dramatic cursor-following effect
      float opacityInfluence = mouseInfluence * 5.0;

      // Make dots fully visible everywhere initially
      vec3 composition = mix(bgColor, dotColor, smoothDot * dotOpacity * (1.0 + opacityInfluence));
      gl_FragColor = vec4(composition, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);
extend({ DotMaterialImpl });

const easeInOutCirc = (x) =>
  x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;

function Scene() {
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  const materialRef = useRef(null);

  const rotation = 0;

  const isMobile =
    window.innerWidth < 768 ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gridSize = isMobile ? 40 : 80;

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: 0.25, // Increased radius to make it more responsive and visible
    maxAge: 400, // Make trail last a bit longer
    interpolate: 1,
    ease: easeInOutCirc,
  });

  const meshRef = useRef(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    const updateColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const paperColor =
        rootStyle.getPropertyValue("--color-paper").trim() || "#f5f2ed";
      const inkColor =
        rootStyle.getPropertyValue("--color-ink").trim() || "#0d0d0d";

      if (materialRef.current) {
        materialRef.current.uniforms.bgColor.value.set(paperColor);
        materialRef.current.uniforms.dotColor.value.set(inkColor);
      }
    };

    updateColors();

    const themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      }
    });

    themeObserver.observe(document.documentElement, { attributes: true });

    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const el = document.getElementById("about");
    if (!el || !meshRef.current) return;

    let ticking = false;

    // B3: the old handler called getBoundingClientRect() inside the rAF on
    // every pointer frame, forcing a synchronous layout while the user was
    // moving the cursor. The element's document-space box is layout-invariant
    // until a resize, so it is cached and the viewport position is derived
    // with cheap scroll math instead.
    let box = { top: 0, left: 0, width: 1, height: 1 };
    const measure = () => {
      const r = el.getBoundingClientRect();
      box = {
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width || 1,
        height: r.height || 1,
      };
    };
    measure();

    let resizeTimer = null;
    const scheduleMeasure = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    };
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(el);

    const handleMove = (e) => {
      if (!ticking) {
        const touch = e.touches && e.touches.length > 0 ? e.touches[0] : e;
        const clientX = touch.clientX;
        const clientY = touch.clientY;

        requestAnimationFrame(() => {
          // Direct UV calculation is orders of magnitude faster than Three.js raycasting
          const localX = clientX - (box.left - window.scrollX);
          const localY = clientY - (box.top - window.scrollY);

          POINTER_UV.set(localX / box.width, 1.0 - localY / box.height);
          onMove(POINTER_EVENT);
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("mousemove", handleMove, { passive: true });
    el.addEventListener("touchmove", handleMove, { passive: true });
    el.addEventListener("touchstart", handleMove, { passive: true });

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", scheduleMeasure);
      ro.disconnect();
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchstart", handleMove);
    };
  }, [onMove, isMobile]);

  const scale = Math.max(viewport.width, viewport.height) / 2;
  return (
    <mesh ref={meshRef} scale={[scale, scale, 1]}>
      <planeGeometry args={[2, 2]} />
      <dotMaterialImpl
        ref={materialRef}
        attach="material"
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        rotation={rotation}
        gridSize={gridSize}
        mouseTrail={trail}
        render={0}
      />
    </mesh>
  );
}

const DPR_CEILING = 1.5;

export default function DotShaderBackground() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dprMax, setDprMax] = useState(DPR_CEILING);

  // A1: fold the detected GPU tier into the DPR ceiling. Only ever lowers it.
  useEffect(() => {
    let cancelled = false;
    loadGpuTier().then((tier) => {
      if (!cancelled) setDprMax(Math.min(tier.dprCap, DPR_CEILING));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      // A3: resume slightly before the canvas scrolls into view so the first
      // visible frame is already warm rather than appearing mid-scroll.
      { threshold: 0, rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      // B5: isolate the canvas subtree so a canvas resize can never invalidate
      // layout or paint for sibling sections.
      style={{ overflow: "hidden", contain: "layout paint style" }}
    >
      <Canvas
        // A3: 'demand' still rendered on every invalidate() while off-screen.
        // 'never' fully parks the loop until the observer says otherwise.
        frameloop={isVisible ? "always" : "never"}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.NoToneMapping,
          // A8: fullscreen quad shader — no stencil, no readback needed.
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
        }}
        dpr={[1, dprMax]}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene />
        {/* A7: compile the dot shader on mount instead of on first scroll-in. */}
        <Preload all />
        {/* A4 */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        {/* A5: hysteresis via drei's own bounds + flipflops guard, so a
            recovering GPU can't oscillate between resolutions. */}
        <PerformanceMonitor
          bounds={() => [50, 55]}
          flipflops={3}
          onDecline={() => setDprMax((d) => (d > 1 ? 1 : d))}
          onIncline={() =>
            setDprMax((d) => (d < DPR_CEILING ? DPR_CEILING : d))
          }
          onFallback={() => setDprMax(1)}
        />
      </Canvas>
    </div>
  );
}
