import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ShaderBackground() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    // Neo-brutal B&W adaptation of the example's golden shader
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;
      uniform float hoverStrength;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        vec2 mouseUV = (mouse * 2.0 - 1.0);
        float mouseDist = length(uv - mouseUV);
        float mouseInfluence = smoothstep(1.8, 0.0, mouseDist) * hoverStrength;
        float t = time * 0.05;
        float lineWidth = 0.002;
        vec2 displacedUV = uv + mouseUV * mouseInfluence * 0.15;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float fj = float(j);
            float channelOffset;
            if (j == 0) channelOffset = 0.0;
            else if (j == 1) channelOffset = 0.006;
            else channelOffset = 0.012;

            float wave = fract(t - channelOffset + fi * 0.01) * 5.0;
            float dist = length(displacedUV) + mod(displacedUV.x + displacedUV.y, 0.2);
            color[j] += lineWidth * fi * fi / abs(wave - dist);
          }
        }

        // Neo-brutal: dark grey/black rays on light paper background
        vec3 darkTint = vec3(
          color.r * 0.55 + 0.008,
          color.g * 0.50 + 0.006,
          color.b * 0.45 + 0.004
        );

        // Paper white background matching --color-paper (#f5f2ed)
        vec3 bgColor = vec3(0.96, 0.95, 0.93);

        float brightness = (darkTint.r + darkTint.g + darkTint.b) / 3.0;

        // Invert the mix: rays darken the light background
        vec3 rayColor = vec3(0.05, 0.05, 0.05);
        float rayIntensity = smoothstep(0.0, 0.12, brightness);
        vec3 finalColor = mix(bgColor, rayColor, rayIntensity * 0.85);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const camera = new THREE.Camera()
    camera.position.z = 1
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      mouse: { value: new THREE.Vector2(0.5, 0.5) },
      hoverStrength: { value: 0.0 },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)

    const onResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height
      )
    }
    onResize()
    window.addEventListener('resize', onResize, false)

    let isHovering = false

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height
      isHovering = true
    }
    const onMouseEnter = () => { isHovering = true }
    const onMouseLeave = () => { isHovering = false }

    container.addEventListener('mousemove', onMouseMove, { passive: true })
    container.addEventListener('mouseenter', onMouseEnter, { passive: true })
    container.addEventListener('mouseleave', onMouseLeave, { passive: true })

    let isVisible = true
    const visObserver = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting },
      { threshold: 0 }
    )
    visObserver.observe(container)

    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      if (!isVisible) {
        if (sceneRef.current) sceneRef.current.animationId = animationId
        return
      }
      const targetHover = isHovering ? 1.0 : 0.0
      uniforms.hoverStrength.value += (targetHover - uniforms.hoverStrength.value) * 0.05
      const speed = 0.005 + uniforms.hoverStrength.value * 0.045
      uniforms.time.value += speed
      uniforms.mouse.value.x += (mouseRef.current.x - uniforms.mouse.value.x) * 0.08
      uniforms.mouse.value.y += (mouseRef.current.y - uniforms.mouse.value.y) * 0.08
      renderer.render(scene, camera)
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }
    animate()

    return () => {
      visObserver.disconnect()
      window.removeEventListener('resize', onResize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseenter', onMouseEnter)
      container.removeEventListener('mouseleave', onMouseLeave)
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)
        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }
        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ overflow: 'hidden' }}
    />
  )
}
