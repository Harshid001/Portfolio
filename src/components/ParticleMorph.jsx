import { useEffect, useRef } from 'react';

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

const ParticleMorph = () => {
  const stageRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Load Three.js from CDN if not already present
    const loadThree = () => {
      return new Promise((resolve, reject) => {
        if (window.THREE) { resolve(); return; }
        const existing = document.querySelector(`script[src="${THREE_CDN}"]`);
        if (existing) {
          if (window.THREE) { resolve(); return; }
          existing.addEventListener('load', resolve);
          existing.addEventListener('error', reject);
          return;
        }
        const s = document.createElement('script');
        s.src = THREE_CDN;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    };

    let disposed = false;

    loadThree().then(() => {
      if (disposed) return;

      const THREE = window.THREE;
      const container = stage;

      // ---------- Renderer / Scene / Camera ----------
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = window.innerWidth < 768 ? 320 : 270;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.zIndex = '1';
      container.appendChild(renderer.domElement);

      const onResize = () => {
        if (disposed) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.position.z = window.innerWidth < 768 ? 320 : 270;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight, false);
      };
      window.addEventListener('resize', onResize);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---------- Soft circular sprite for each particle ----------
      function makeDotTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }
      const dotTexture = makeDotTexture();

      // ---------- Real brand-mark path data ----------
      const LOGOS = {
        github:   { vb: [512, 512], d: "M216.5 362.5c-66-8-112.5-55.5-112.5-117 0-25 9-52 24-70-6.5-16.5-5.5-51.5 2-66 20-2.5 47 8 63 22.5 19-6 39-9 63.5-9s44.5 3 62.5 8.5c15.5-14 43-24.5 63-22 7 13.5 8 48.5 1.5 65.5 16 19 24.5 44.5 24.5 70.5 0 61.5-46.5 108-113.5 116.5 17 11 28.5 35 28.5 62.5l0 52C323 491.5 335.5 500 350.5 494 441 459.5 512 369 512 257 512 115.5 397 0 255.5 0S0 115.5 0 257c0 111 70.5 203 165.5 237.5 13.5 5 26.5-4 26.5-17.5l0-40c-7 3-16 5-24 5-33 0-52.5-18-66.5-51.5-5.5-13.5-11.5-21.5-23-23-6-.5-8-3-8-6 0-6 10-10.5 20-10.5 14.5 0 27 9 40 27.5 10 14.5 20.5 21 33 21s20.5-4.5 32-16c8.5-8.5 15-16 21-21z" },
        linkedin: { vb: [448, 512], d: "M416 32L31.9 32C14.3 32 0 46.5 0 64.3L0 447.7C0 465.5 14.3 480 31.9 480L416 480c17.6 0 32-14.5 32-32.3l0-383.4C448 46.5 433.6 32 416 32zM135.4 416l-66.4 0 0-213.8 66.5 0 0 213.8-.1 0zM102.2 96a38.5 38.5 0 1 1 0 77 38.5 38.5 0 1 1 0-77zM384.3 416l-66.4 0 0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2z" },
        youtube:  { vb: [576, 512], d: "M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z" },
        x:        { vb: [448, 512], d: "M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48zM332.4 421.8l39.1 0-252.4-333.8-42 0 255.3 333.8z" }
      };
      const ORDER = ['github', 'linkedin', 'youtube', 'x'];
      const URLS = {
        github:   'https://github.com/Harshid001',
        linkedin: 'https://www.linkedin.com/in/harshid-soni-441500385/',
        youtube:  'https://www.youtube.com/@Harshid001',
        x:        'https://x.com/HarshidSoni2007'
      };

      const SIZE = 220;
      const TARGET = 190; // logo bounding box fits inside this, centered — same for every mark

      function newCanvas() {
        const c = document.createElement('canvas');
        c.width = c.height = SIZE;
        return c;
      }

      function drawLogo(ctx, key) {
        const { vb, d } = LOGOS[key];
        const [vbW, vbH] = vb;
        const scale = Math.min(TARGET / vbW, TARGET / vbH);
        const offsetX = (SIZE - vbW * scale) / 2;
        const offsetY = (SIZE - vbH * scale) / 2;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#000';
        ctx.fill(new Path2D(d));
        ctx.restore();
      }

      const PARTICLE_COUNT = window.innerWidth < 768 ? 3000 : 6000;

      function sampleShape(key) {
        const c = newCanvas();
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, SIZE, SIZE);
        drawLogo(ctx, key);
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

        const candidates = [];
        for (let y = 0; y < SIZE; y++) {
          for (let x = 0; x < SIZE; x++) {
            const i = (y * SIZE + x) * 4;
            if (data[i + 3] > 60) candidates.push([x, y]);
          }
        }

        const positions = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const p = candidates.length
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : [SIZE / 2, SIZE / 2];
          const x = (p[0] - SIZE / 2) * 0.85 + (Math.random() - 0.5) * 2;
          const y = -(p[1] - SIZE / 2) * 0.85 + (Math.random() - 0.5) * 2; // perfectly centered vertically
          const z = (Math.random() - 0.5) * 26;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }
        return positions;
      }

      const shapes = ORDER.map(sampleShape);

      const alphaMaps = {};
      ORDER.forEach((key) => {
        const c = newCanvas();
        const ctx = c.getContext('2d');
        drawLogo(ctx, key);
        alphaMaps[key] = ctx.getImageData(0, 0, SIZE, SIZE).data;
      });

      function isPointOnLogo(canvasX, canvasY, key) {
        const map = alphaMaps[key];
        const r = 7;
        for (let dx = -r; dx <= r; dx += 3) {
          for (let dy = -r; dy <= r; dy += 3) {
            const x = Math.round(canvasX + dx);
            const y = Math.round(canvasY + dy);
            if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;
            const i = (y * SIZE + x) * 4;
            if (map[i + 3] > 60) return true;
          }
        }
        return false;
      }

      function modelSpaceToCanvasPixel(mx, my) {
        const canvasX = mx / 0.85 + SIZE / 2;
        const canvasY = SIZE / 2 - my / 0.85;
        return [canvasX, canvasY];
      }

      // ---------- Entry: particles materialize near their final spot and snap into
      // place, each on its own random delay, instead of flying in from a shared cloud.
      const INTRO_SPREAD = 0.4; // fraction of the intro window each particle takes once its own delay hits
      const delays = new Float32Array(PARTICLE_COUNT);
      for (let i = 0; i < PARTICLE_COUNT; i++) delays[i] = Math.random() * (1 - INTRO_SPREAD);

      function makeJitterStart(base) {
        const positions = new Float32Array(base.length);
        for (let i = 0; i < base.length; i += 3) {
          const r = 22 + Math.random() * 34; // short local scatter, not a cross-stage flight
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i] = base[i] + r * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = base[i + 1] + r * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = base[i + 2] + r * Math.cos(phi) * 0.5;
        }
        return positions;
      }
      const introStart = prefersReducedMotion ? shapes[0].slice() : makeJitterStart(shapes[0]);

      // ---------- Points object ----------
      const geometry = new THREE.BufferGeometry();
      const restPositions = introStart.slice();
      const displayPositions = restPositions.slice();
      geometry.setAttribute('position', new THREE.BufferAttribute(displayPositions, 3));
      geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));

      // Custom shader (rather than PointsMaterial) so each point can fade/pop in on
      // its own schedule via aDelay — PointsMaterial only supports one opacity for all.
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: dotTexture },
          uSize: { value: 2.1 * Math.min(window.devicePixelRatio || 1, 2) },
          uOpacity: { value: 0.85 },
          uColor: { value: new THREE.Color('#1a1612') },
          uIntro: { value: prefersReducedMotion ? 1 : 0 },
          uSpread: { value: INTRO_SPREAD }
        },
        vertexShader: `
          attribute float aDelay;
          uniform float uSize;
          uniform float uIntro;
          uniform float uSpread;
          varying float vAlpha;
          void main() {
            float t = clamp((uIntro - aDelay) / uSpread, 0.0, 1.0);
            vAlpha = t;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * (300.0 / -mvPosition.z) * (0.25 + 0.75 * t);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uOpacity;
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            vec4 tex = texture2D(uTexture, gl_PointCoord);
            if (tex.a < 0.02) discard;
            gl_FragColor = vec4(uColor, tex.a * uOpacity * vAlpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // ---------- Visibility Optimization ----------
      let isVisible = true;
      const visObserver = new IntersectionObserver(
        ([entry]) => { isVisible = entry.isIntersecting; },
        { threshold: 0 }
      );
      visObserver.observe(container);

      // ---------- Interactivity state ----------
      const mouse = { x: 0, y: 0 };
      const targetRotation = { x: 0, y: 0 };
      let targetScale = 1;
      const HOVER_SCALE = 1.08;   // slight enlarge on hover
      let scrollVelocity = 0;
      const REPEL_RADIUS = 34;
      const REPEL_STRENGTH = 14;

      let isHovering = false;

      const onMouseEnter = () => {
        isHovering = true;
        targetScale = HOVER_SCALE;
      };

      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotation.y = mouse.x * 0.35;
        targetRotation.x = mouse.y * 0.2;
      };

      const onMouseLeave = () => {
        isHovering = false;
        targetRotation.x = 0;
        targetRotation.y = 0;
        targetScale = 1;
      };

      const onWheel = (e) => {
        scrollVelocity = Math.max(-3, Math.min(3, scrollVelocity + e.deltaY * 0.01));
      };

      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
      container.addEventListener('wheel', onWheel, { passive: true });

      const _cursorWorld = new THREE.Vector3();
      const _raycaster = new THREE.Raycaster();
      const _mouseVec = new THREE.Vector2();

      // ---------- Click shockwave: a little delight — click anywhere on the model
      // and it shatters outward from that point, then elastically snaps back. ----------
      const burstDir = new Float32Array(PARTICLE_COUNT * 3);
      let burstStart = null;
      const BURST_MS = 1300;

      container.style.cursor = 'pointer';
      const onClick = (e) => {
        const rect = container.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const cy = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        _mouseVec.set(cx, cy);
        _raycaster.setFromCamera(_mouseVec, camera);
        const denom = _raycaster.ray.direction.z;
        if (Math.abs(denom) < 1e-6) return;
        const t = (points.position.z - _raycaster.ray.origin.z) / denom;
        if (t <= 0) return;
        const clickWorldAbs = _raycaster.ray.origin.clone().addScaledVector(_raycaster.ray.direction, t);
        const scaleFactor = points.scale.x || 1;
        const clickLocal = clickWorldAbs.clone().sub(points.position).divideScalar(scaleFactor);

        for (let i = 0; i < restPositions.length; i += 3) {
          const dx = restPositions[i] - clickLocal.x;
          const dy = restPositions[i + 1] - clickLocal.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const kick = (140 / (dist + 30)) * (0.7 + Math.random() * 0.6); // closer particles get a bigger kick
          burstDir[i] = (dx / dist) * kick;
          burstDir[i + 1] = (dy / dist) * kick;
          burstDir[i + 2] = (Math.random() - 0.5) * kick * 0.5;
        }
        burstStart = performance.now();

        if (phase === 'hold') {
          const [canvasX, canvasY] = modelSpaceToCanvasPixel(clickLocal.x, clickLocal.y);
          if (isPointOnLogo(canvasX, canvasY, currentDisplayKey)) {
            const url = URLS[currentDisplayKey];
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
          }
        }
      };
      container.addEventListener('click', onClick);

      const HOLD_MS = 2200;
      const MORPH_MS = 1600;
      const INTRO_MS = 1500;
      let restIndex = 0;
      let fromPos = shapes[0];
      let toPos = shapes[0];
      let phase = prefersReducedMotion ? 'hold' : 'intro';
      let phaseStart = performance.now();
      let currentDisplayKey = ORDER[0];

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      let animId;
      function animate(now) {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        if (!isVisible) return; // skip GPU math when out of view

        scrollVelocity *= 0.94;

        if (!prefersReducedMotion) {
          const elapsed = now - phaseStart;

          // Update theme color dynamically
          const isDark = document.documentElement.classList.contains('dark');
          material.uniforms.uColor.value.set(isDark ? '#f5f2ed' : '#1a1612');

          if (phase === 'intro') {
            const introProgress = Math.min(elapsed / INTRO_MS, 1);
            material.uniforms.uIntro.value = introProgress;
            for (let i = 0, p = 0; i < restPositions.length; i += 3, p++) {
              const tLocal = Math.min(Math.max((introProgress - delays[p]) / INTRO_SPREAD, 0), 1);
              const e = easeOutCubic(tLocal);
              restPositions[i] = introStart[i] + (shapes[0][i] - introStart[i]) * e;
              restPositions[i + 1] = introStart[i + 1] + (shapes[0][i + 1] - introStart[i + 1]) * e;
              restPositions[i + 2] = introStart[i + 2] + (shapes[0][i + 2] - introStart[i + 2]) * e;
            }
            if (introProgress >= 1) {
              phase = 'hold';
              phaseStart = now;
              material.uniforms.uIntro.value = 1;
              currentDisplayKey = ORDER[0];
            }
          } else if (phase === 'hold' && elapsed > HOLD_MS) {
            phase = 'morph';
            phaseStart = now;
            fromPos = shapes[restIndex];
            restIndex = (restIndex + 1) % shapes.length;
            toPos = shapes[restIndex];
          } else if (phase === 'morph') {
            const t = Math.min(elapsed / MORPH_MS, 1);
            const e = easeInOutCubic(t);
            for (let i = 0; i < restPositions.length; i++) {
              restPositions[i] = fromPos[i] + (toPos[i] - fromPos[i]) * e;
            }
            if (t >= 1) { 
              phase = 'hold'; 
              phaseStart = now; 
              currentDisplayKey = ORDER[restIndex];
            }
          }

          // Update the label text to match the currently targeted shape
          const labelEl = document.getElementById('particle-model-label');
          if (labelEl) {
            let displayIndex = restIndex;
            let t = 0;
            
            if (phase === 'morph') {
              t = Math.min((now - phaseStart) / MORPH_MS, 1);
              // Show old name during first half of morph
              if (t < 0.5) {
                displayIndex = (restIndex - 1 + ORDER.length) % ORDER.length;
              }
            }

            const name = ORDER[displayIndex];
            let displayText = name === 'x' ? 'X (TWITTER)' : name.toUpperCase();
            
            // Dynamic text animation during morph
            if (phase === 'morph') {
              const progress = Math.abs(t - 0.5); // 0.5 -> 0 -> 0.5
              const intensity = 0.5 - progress;   // 0 -> 0.5 -> 0
              
              // Add a subtle text scramble effect during the blurtiest part of the transition
              if (intensity > 0.3) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+><[]';
                displayText = displayText.split('').map(c => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join('');
              }
              
              labelEl.innerText = displayText;
              labelEl.style.opacity = Math.max(0, progress * 2); 
              labelEl.style.transform = `translate(calc(-50% + 25px), ${intensity * 15}px)`;
              labelEl.style.filter = `blur(${intensity * 5}px)`;
              labelEl.style.letterSpacing = `${0.2 + intensity * 0.5}em`;
            } else {
              labelEl.innerText = displayText;
              labelEl.style.opacity = 1;
              labelEl.style.transform = `translate(calc(-50% + 25px), 0px)`;
              labelEl.style.filter = `blur(0px)`;
              labelEl.style.letterSpacing = `0.2em`;
            }
          }

          points.rotation.y += (targetRotation.y - points.rotation.y) * 0.06;
          points.rotation.x += (targetRotation.x - points.rotation.x) * 0.06;
          points.rotation.y += 0.0022 + scrollVelocity * 0.01;

          // Model enlarges slightly while hovering.
          const currentScale = points.scale.x + (targetScale - points.scale.x) * 0.08;
          points.scale.setScalar(currentScale);

          _mouseVec.set(mouse.x, mouse.y);
          _raycaster.setFromCamera(_mouseVec, camera);
          const denom = _raycaster.ray.direction.z;
          let hasCursor = false;
          if (Math.abs(denom) > 1e-6) {
            const t2 = -_raycaster.ray.origin.z / denom;
            if (t2 > 0) {
              _cursorWorld.copy(_raycaster.ray.origin).addScaledVector(_raycaster.ray.direction, t2);
              hasCursor = true;
            }
          }

          let burstEnvelope = 0;
          if (burstStart !== null) {
            const u = Math.min((now - burstStart) / BURST_MS, 1);
            // Fast outward snap (first 15%), then an elastic exponential settle back to 0.
            burstEnvelope = u < 0.15 ? u / 0.15 : Math.exp(-6.5 * (u - 0.15));
            if (u >= 1) burstStart = null;
          }

          for (let i = 0; i < restPositions.length; i += 3) {
            let ox = restPositions[i];
            let oy = restPositions[i + 1];
            let oz = restPositions[i + 2];

            if (hasCursor) {
              const dx = ox - _cursorWorld.x;
              const dy = oy - _cursorWorld.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < REPEL_RADIUS && dist > 0.001) {
                const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
                ox += (dx / dist) * force;
                oy += (dy / dist) * force;
              }
            }

            if (Math.abs(scrollVelocity) > 0.01) {
              const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
              const push = scrollVelocity * 2.2;
              ox += (ox / len) * push;
              oy += (oy / len) * push;
              oz += (oz / len) * push;
            }

            if (burstEnvelope > 0.001) {
              ox += burstDir[i] * burstEnvelope;
              oy += burstDir[i + 1] * burstEnvelope;
              oz += burstDir[i + 2] * burstEnvelope;
            }

            displayPositions[i] = ox;
            displayPositions[i + 1] = oy;
            displayPositions[i + 2] = oz;
          }
          geometry.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);

      // Store cleanup function
      cleanupRef.current = () => {
        disposed = true;
        cancelAnimationFrame(animId);
        visObserver.disconnect();
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', onMouseLeave);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
        geometry.dispose();
        material.dispose();
        dotTexture.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div ref={stageRef} id="particle-stage" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="glass-refraction" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div id="particle-glass-wrap" className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div id="particle-glass">
          <div id="particle-glass-rim"></div>
        </div>
        <div id="particle-glass-shadow"></div>
      </div>
      
      {/* MODEL NAME LABEL */}
      <div 
        id="particle-model-label" 
        className="absolute top-0 lg:top-2 left-1/2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-[0.2em] pointer-events-none z-10 transition-colors duration-300 backdrop-blur-md whitespace-nowrap"
        style={{ 
          color: 'var(--color-ink)', 
          backgroundColor: 'color-mix(in srgb, var(--color-paper) 80%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 4px 12px color-mix(in srgb, var(--color-ink) 5%, transparent)',
          transform: 'translateX(calc(-50% + 25px))'
        }}
      >
        GITHUB
      </div>
    </div>
  );
};

export default ParticleMorph;
