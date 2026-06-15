import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { shaderMaterial, useTrailTexture } from '@react-three/drei'
import * as THREE from 'three'

const DotMaterialImpl = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
    dotColor: new THREE.Color('#0d0d0d'),
    bgColor: new THREE.Color('#f5f2ed'),
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
      float screenMask = smoothstep(0.0, 1.0, 1.0 - uv.y * 0.3);
      vec2 centerDisplace = vec2(0.5, 0.5);
      float circleMaskCenter = length(uv - centerDisplace);
      float circleMaskFromCenter = smoothstep(0.2, 0.9, circleMaskCenter);
      float combinedMask = max(screenMask * 0.6, circleMaskFromCenter * 0.8);

      float circleAnimatedMask = sin(time * 1.5 + circleMaskCenter * 8.0);

      // Enhanced mouse influence — more lively cursor response
      float mouseInfluence = texture2D(mouseTrail, gridUvCenterInScreenCoords).r;
      float scaleInfluence = max(mouseInfluence * 0.9, circleAnimatedMask * 0.25);

      float dotSize = min(pow(circleMaskCenter, 1.5) * 0.35 + 0.05, 0.35);
      float sdfDot = sdfCircle(gridUv, dotSize * (1.0 + scaleInfluence * 0.6));
      float smoothDot = smoothstep(0.05, 0.0, sdfDot);

      // Boosted opacity influence for dramatic cursor-following effect
      float opacityInfluence = max(mouseInfluence * 80.0, circleAnimatedMask * 0.4);

      vec3 composition = mix(bgColor, dotColor, smoothDot * combinedMask * dotOpacity * (1.0 + opacityInfluence));
      gl_FragColor = vec4(composition, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)
extend({ DotMaterialImpl })

function Scene() {
  const size = useThree((s) => s.size)
  const viewport = useThree((s) => s.viewport)
  const materialRef = useRef(null)
  const camera = useThree((s) => s.camera)
  const raycaster = useThree((s) => s.raycaster)
  const rotation = 0
  const gridSize = 80

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: 0.25, // Increased radius to make it more responsive and visible
    maxAge: 400, // Make trail last a bit longer
    interpolate: 1,
    ease: function easeInOutCirc(x) {
      return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
    },
  })

  const meshRef = useRef(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  useEffect(() => {
    const updateColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const paperColor = rootStyle.getPropertyValue('--color-paper').trim() || '#f5f2ed';
      const inkColor = rootStyle.getPropertyValue('--color-ink').trim() || '#0d0d0d';
      
      if (materialRef.current) {
        materialRef.current.uniforms.bgColor.value.set(paperColor);
        materialRef.current.uniforms.dotColor.value.set(inkColor);
      }
    };
    
    updateColors();
    
    const themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          updateColors();
        }
      }
    });
    
    themeObserver.observe(document.documentElement, { attributes: true });
    
    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    const el = document.getElementById('about')
    if (!el || !meshRef.current) return

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX
      const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY
      
      const x = clientX - rect.left
      const y = clientY - rect.top
      
      // Convert to Normalized Device Coordinates (-1 to +1)
      const mouseVec = new THREE.Vector2(
        (x / rect.width) * 2 - 1,
        -(y / rect.height) * 2 + 1
      )
      
      raycaster.setFromCamera(mouseVec, camera)
      const intersects = raycaster.intersectObject(meshRef.current)
      
      if (intersects.length > 0) {
        onMove({ uv: intersects[0].uv })
      }
    }

    el.addEventListener('mousemove', handleMove, { passive: true })
    el.addEventListener('touchmove', handleMove, { passive: true })
    el.addEventListener('touchstart', handleMove, { passive: true })

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchstart', handleMove)
    }
  }, [onMove, camera, raycaster])

  const scale = Math.max(viewport.width, viewport.height) / 2
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
  )
}

export default function DotShaderBackground() {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ overflow: 'hidden' }}>
      {isVisible && (
        <Canvas
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
          }}
          dpr={[1, 1.5]}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Scene />
        </Canvas>
      )}
    </div>
  )
}
