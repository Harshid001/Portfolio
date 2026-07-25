import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const PrismTypography = ({ text = '<HS/>' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    /* ================================================================== *
     * Parameters
     * ================================================================== */
    const params = {
      text: text, density: 3200, size: 1.25, thickness: 0.09, depth: 3.2,
      material: 'iridescent', bloom: 0.72, idle: 1.0, cameraDrift: true
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Formation timeline (seconds) */
    const T = { emerge: 0.6, spread: 1.4, travel: 1.4, travelVar: 0.6, pulse: 1.2 };
    const FORM_END = T.emerge + T.spread + T.travel + T.travelVar;   
    const SEQ_END  = FORM_END + T.pulse;                             

    /* ================================================================== *
     * Renderer / scene / camera
     * ================================================================== */
    // A8: `antialias: true` was a no-op here. This scene renders through
    // EffectComposer (see below) into its own WebGLRenderTargets, and the
    // renderer's antialias flag only applies to the DEFAULT framebuffer — so
    // it was allocating a multisampled backbuffer that never received a draw.
    // `preserveDrawingBuffer: true` was unused too: nothing in this file calls
    // toDataURL / toBlob / readPixels, and it defeats the driver's fast-clear
    // path every frame. Removing both is a zero-visual-change win, which is
    // why no SMAAPass compensation is needed.
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 500);
    camera.position.set(0, 1.4, 44);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 12;
    controls.maxDistance = 120;
    controls.autoRotate = false;
    controls.enabled = false;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

    const key  = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-8, 10, 14);
    const fill = new THREE.DirectionalLight(0x6fa8ff, 1.9); fill.position.set(14, -6, 8);
    const rim  = new THREE.DirectionalLight(0xff9ad8, 1.4); rim.position.set(2, 4, -16);
    scene.add(key, fill, rim, new THREE.AmbientLight(0x2b3350, 0.7));

    const sculpture = new THREE.Group();
    sculpture.position.x = 5;   // shift model to the right
    scene.add(sculpture);

    /* ================================================================== *
     * Hollow wireframe triangular prism — edges only, rounded joints
     * ================================================================== */
    function buildPrismWireframe(tube){
      const R = 0.55, H = 1.0, parts = [], top = [], bot = [];
      for (let i = 0; i < 3; i++){
        const a = (i/3)*Math.PI*2 + Math.PI/2;
        top.push(new THREE.Vector3(Math.cos(a)*R,  H/2, Math.sin(a)*R));
        bot.push(new THREE.Vector3(Math.cos(a)*R, -H/2, Math.sin(a)*R));
      }
      const edges = [];
      for (let i = 0; i < 3; i++){
        edges.push([top[i], top[(i+1)%3]]);
        edges.push([bot[i], bot[(i+1)%3]]);
        edges.push([top[i], bot[i]]);
      }
      const up = new THREE.Vector3(0,1,0);
      for (const [a,b] of edges){
        const dir = new THREE.Vector3().subVectors(b,a), len = dir.length();
        const g = new THREE.CylinderGeometry(tube, tube, len, 5, 1, true);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()));
        const mid = new THREE.Vector3().addVectors(a,b).multiplyScalar(0.5);
        g.translate(mid.x, mid.y, mid.z);
        parts.push(g);
      }
      for (const v of [...top, ...bot]){
        const s = new THREE.SphereGeometry(tube*1.12, 6, 4);
        s.translate(v.x, v.y, v.z);
        parts.push(s);
      }
      const merged = mergeGeometries(parts, false);
      parts.forEach(p => p.dispose());
      return merged;
    }

    function buildMaterial(kind){
      const base = { metalness:1.0, envMapIntensity:2.0, vertexColors:true, side:THREE.DoubleSide };
      if (kind === 'chrome')
        return new THREE.MeshPhysicalMaterial({ ...base, color:0xffffff, roughness:0.06, clearcoat:1, clearcoatRoughness:0.04 });
      if (kind === 'titanium')
        return new THREE.MeshPhysicalMaterial({ ...base, color:0xc3bcb1, roughness:0.30, envMapIntensity:1.5 });
      return new THREE.MeshPhysicalMaterial({
        ...base, color:0xffffff, roughness:0.11, clearcoat:1, clearcoatRoughness:0.06,
        iridescence:1, iridescenceIOR:1.9, iridescenceThicknessRange:[120,780]
      });
    }

    /* ================================================================== *
     * Glyph sampling
     * ================================================================== */
    const WORLD_W = 30;
    function sampleText(text){
      const CW = 1400, CH = 460, STEP = 4;
      const c = document.createElement('canvas'); c.width = CW; c.height = CH;
      const ctx = c.getContext('2d', { willReadFrequently:true });
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,CW,CH);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let fs = 330;
      const font = px => `900 ${px}px "Arial Black","Helvetica Neue",Impact,system-ui,sans-serif`;
      ctx.font = font(fs);
      const maxW = CW*0.90, w = ctx.measureText(text).width || 1;
      if (w > maxW){ fs = Math.max(60, Math.floor(fs*maxW/w)); ctx.font = font(fs); }
      ctx.fillText(text, CW/2, CH/2 + fs*0.03);

      const data = ctx.getImageData(0,0,CW,CH).data;
      const on = (x,y) => (x<0||y<0||x>=CW||y>=CH) ? false : data[(y*CW+x)*4] > 128;
      const cells = [];
      for (let y = STEP; y < CH; y += STEP)
        for (let x = STEP; x < CW; x += STEP){
          if (!on(x,y)) continue;
          const edge = !(on(x-STEP,y) && on(x+STEP,y) && on(x,y-STEP) && on(x,y+STEP) && on(x-STEP,y-STEP) && on(x+STEP,y+STEP));
          cells.push({ x, y, edge });
        }
      const scale = WORLD_W / CW;
      return { cells, unit: STEP*scale, toWorld:(px,py) => [ (px-CW/2)*scale, -(py-CH/2)*scale ] };
    }

    /* ================================================================== *
     * Sculpture + per-instance animation state
     * ================================================================== */
    let mesh = null, geo = null, mat = null, geoThickness = null, N = 0;
    let A = null;                       // per-instance animation arrays
    let clockStart = performance.now(); // formation start

    const dummy = new THREE.Object3D();
    const col   = new THREE.Color();
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vP = new THREE.Vector3();
    const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion();
    const axis = new THREE.Vector3();
    const rnd = (a,b) => a + Math.random()*(b-a);

    function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } }

    function build(replay = true){
      const field = sampleText(params.text || '<HS/>');
      if (!field.cells.length) return;

      const edgeCells = field.cells.filter(c => c.edge);
      const inner     = field.cells.filter(c => !c.edge);
      shuffle(edgeCells); shuffle(inner);

      const target = params.density;
      const chosen = edgeCells.slice(0, Math.min(edgeCells.length, Math.round(target*0.55)));
      chosen.push(...inner.slice(0, Math.max(0, target - chosen.length)));
      while (chosen.length < target && field.cells.length) chosen.push(field.cells[Math.random()*field.cells.length|0]);
      N = chosen.length;

      if (!geo || geoThickness !== params.thickness){
        if (geo) geo.dispose();
        geo = buildPrismWireframe(params.thickness);
        geoThickness = params.thickness;
      }
      if (!mat || mat.userData.kind !== params.material){
        if (mat) mat.dispose();
        mat = buildMaterial(params.material);
        mat.userData.kind = params.material;
      }

      if (mesh){ sculpture.remove(mesh); mesh.dispose(); }
      mesh = new THREE.InstancedMesh(geo, mat, N);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;

      A = {
        home:    new Float32Array(N*3),
        homeQ:   new Float32Array(N*4),
        start:   new Float32Array(N*3),
        startQ:  new Float32Array(N*4),
        swirlAx: new Float32Array(N*3),
        swirl:   new Float32Array(N),
        scale:   new Float32Array(N),
        delay:   new Float32Array(N),
        dur:     new Float32Array(N),
        idleAmp: new Float32Array(N),
        idleFrq: new Float32Array(N*3),
        idlePhs: new Float32Array(N*3),
        spinAx:  new Float32Array(N*3),
        spin:    new Float32Array(N),
        base:    new Float32Array(N*3)
      };

      for (let i = 0; i < N; i++){
        const cell = chosen[i];
        const [wx, wy] = field.toWorld(cell.x, cell.y);
        const jitter = field.unit*0.42;
        const zSpread = cell.edge ? params.depth*0.42 : params.depth;

        const hx = wx + rnd(-jitter, jitter);
        const hy = wy + rnd(-jitter, jitter);
        const hz = rnd(-0.5, 0.5)*zSpread;
        A.home[i*3] = hx; A.home[i*3+1] = hy; A.home[i*3+2] = hz;

        qA.setFromEuler(new THREE.Euler(Math.random()*6.283, Math.random()*6.283, Math.random()*6.283));
        A.homeQ[i*4]=qA.x; A.homeQ[i*4+1]=qA.y; A.homeQ[i*4+2]=qA.z; A.homeQ[i*4+3]=qA.w;

        const th = Math.random()*Math.PI*2, ph = Math.acos(rnd(-1,1)), r = rnd(38, 105);
        A.start[i*3]   = Math.sin(ph)*Math.cos(th)*r;
        A.start[i*3+1] = Math.cos(ph)*r*0.6;
        A.start[i*3+2] = Math.sin(ph)*Math.sin(th)*r*0.8 + rnd(-10, 26);

        qB.setFromEuler(new THREE.Euler(Math.random()*6.283, Math.random()*6.283, Math.random()*6.283));
        A.startQ[i*4]=qB.x; A.startQ[i*4+1]=qB.y; A.startQ[i*4+2]=qB.z; A.startQ[i*4+3]=qB.w;

        axis.set(rnd(-0.35,0.35), 1, rnd(-0.35,0.35)).normalize();
        A.swirlAx[i*3]=axis.x; A.swirlAx[i*3+1]=axis.y; A.swirlAx[i*3+2]=axis.z;
        A.swirl[i] = rnd(1.6, 4.4) * (Math.random() < 0.5 ? -1 : 1);

        const variance = 0.58 + Math.random()*0.85;
        A.scale[i] = field.unit * params.size * variance * (cell.edge ? 0.72 : 1.18);

        A.delay[i] = T.emerge*Math.random() + ((hx + WORLD_W/2)/WORLD_W)*T.spread*0.55 + Math.random()*T.spread*0.45;
        A.dur[i]   = T.travel + Math.random()*T.travelVar;

        A.idleAmp[i] = field.unit * rnd(0.10, 0.42);
        for (let k = 0; k < 3; k++){
          A.idleFrq[i*3+k] = rnd(0.25, 0.95);
          A.idlePhs[i*3+k] = Math.random()*6.283;
        }
        axis.set(rnd(-1,1), rnd(-1,1), rnd(-1,1)).normalize();
        A.spinAx[i*3]=axis.x; A.spinAx[i*3+1]=axis.y; A.spinAx[i*3+2]=axis.z;
        A.spin[i] = rnd(0.03, 0.22) * (Math.random() < 0.5 ? -1 : 1);

        const hue = 0.56 + (hx/WORLD_W)*0.16 + rnd(-0.03, 0.03);
        const sat = params.material === 'titanium' ? 0.05 : 0.13;
        col.setHSL(((hue%1)+1)%1, sat, 0.72 + Math.random()*0.2);
        mesh.setColorAt(i, col);
        A.base[i*3] = col.r; A.base[i*3+1] = col.g; A.base[i*3+2] = col.b;
      }
      mesh.instanceColor.needsUpdate = true;
      sculpture.add(mesh);

      if (replay) startSequence();
    }

    /* ------------------------------------------------------------------ *
     * Free-floating orbiters
     * ------------------------------------------------------------------ */
    let orbiters = null, ORB = 40, orbData = null;
    function buildOrbiters(){
      if (orbiters){ scene.remove(orbiters); orbiters.dispose(); }
      orbiters = new THREE.InstancedMesh(geo, mat, ORB);
      orbiters.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      orbiters.frustumCulled = false;
      orbData = [];
      for (let i = 0; i < ORB; i++){
        orbData.push({
          r: rnd(19, 34), rWob: rnd(2.5, 8), rFrq: rnd(0.05, 0.16),
          speed: rnd(0.045, 0.16)*(Math.random()<0.5?-1:1),
          phase: Math.random()*6.283, tilt: rnd(-0.5, 0.5),
          y: rnd(-9, 9), yFrq: rnd(0.1, 0.35),
          s: rnd(0.30, 0.95), spin: rnd(0.15, 0.7),
          ax: new THREE.Vector3(rnd(-1,1), rnd(-1,1), rnd(-1,1)).normalize()
        });
        col.setHSL(0.58 + rnd(-0.05,0.08), 0.16, 0.78);
        orbiters.setColorAt(i, col);
      }
      orbiters.instanceColor.needsUpdate = true;
      scene.add(orbiters);
    }

    /* ------------------------------------------------------------------ *
     * Volumetric dust
     * ------------------------------------------------------------------ */
    const dustGroup = new THREE.Group();
    scene.add(dustGroup);
    {
      const M = 1100, pos = new Float32Array(M*3);
      for (let i = 0; i < M; i++){
        pos[i*3]   = rnd(-48, 48);
        pos[i*3+1] = rnd(-28, 28);
        pos[i*3+2] = rnd(-40, 40);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dust = new THREE.Points(g, new THREE.PointsMaterial({
        size:0.075, color:0x9fc0ff, transparent:true, opacity:0.5,
        blending:THREE.AdditiveBlending, depthWrite:false
      }));
      dustGroup.add(dust);
    }

    /* ================================================================== *
     * Post-processing
     * ================================================================== */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), params.bloom, 0.62, 0.72);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ================================================================== *
     * Sequence control
     * ================================================================== */
    let skipped = false;
    let formedFlag = false;
    function startSequence(){
      clockStart = performance.now();
      skipped = reduceMotion;
      formedFlag = skipped;
      controls.enabled = skipped;
      if (skipped){ controls.target.set(0,0,0); camera.position.set(0,1.4,44); controls.update(); }
    }
    const seqTime = () => (performance.now() - clockStart)/1000;

    let mouseX = 0, mouseY = 0;
    // Target rotation for smooth mouse-follow tilt
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;
    // Whether the pointer is inside the container
    let pointerInside = false;

    const onPointerMove = e => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseX = (clientX / rect.width) * 2 - 1;
      mouseY = -(clientY / rect.height) * 2 + 1;
      pointerInside = true;
      // Map mouse → sculpture tilt angles (radians)
      targetRotY =  mouseX * 0.32;   // left–right tilt
      targetRotX = -mouseY * 0.18;   // up–down tilt
    };
    const onPointerLeave = () => {
      pointerInside = false;
      targetRotX = 0;
      targetRotY = 0;
    };
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    /* camera: intro settle → imperceptible breathing orbit */
    const introFrom = { r:80, theta:1.05, phi:1.28 };
    const introTo   = { r:46,  theta:0.12, phi:1.505 };
    function updateCamera(t){
      const seq = seqTime();
      if (seq < FORM_END + 0.6 && !reduceMotion){
        const u = easeIO(clamp01(seq / (FORM_END + 0.6)));
        const r = introFrom.r + (introTo.r - introFrom.r)*u;
        const th = introFrom.theta + (introTo.theta - introFrom.theta)*u;
        const ph = introFrom.phi + (introTo.phi - introFrom.phi)*u;
        camera.position.set(
          r*Math.sin(ph)*Math.sin(th),
          r*Math.cos(ph),
          r*Math.sin(ph)*Math.cos(th)
        );
        camera.lookAt(0,0,0);
        camera.fov = 34 + (1-u)*8;
        camera.updateProjectionMatrix();
      } else {
        if (params.cameraDrift && !reduceMotion){
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.16;
          camera.fov = 34 + Math.sin(t*0.13)*0.55;          // breathing
          camera.updateProjectionMatrix();
          
          const targetX = mouseX * 2.5;
          const targetY = Math.sin(t*0.09)*0.35 + mouseY * 2.5;
          
          controls.target.x += (targetX - controls.target.x) * 0.05;
          controls.target.y += (targetY - controls.target.y) * 0.05;
        } else {
          controls.autoRotate = false;
        }
        controls.update();
      }
    }

    function updateLights(t){
      const a = t*0.06;
      key.position.set(Math.cos(a)*14, 10 + Math.sin(a*0.7)*4, Math.sin(a)*14);
      fill.position.set(Math.cos(a+2.4)*15, -6 + Math.cos(a*0.5)*3, Math.sin(a+2.4)*12);
      rim.position.set(Math.cos(a*1.3+4.1)*12, 4 + Math.sin(a)*3, Math.sin(a*1.3+4.1)*-16);
      key.intensity  = 2.6 + Math.sin(t*0.21)*0.45;
      fill.intensity = 1.9 + Math.sin(t*0.17+1.7)*0.35;
      rim.intensity  = 1.4 + Math.sin(t*0.13+3.2)*0.35;
    }

    const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
    const smoother = u => u*u*u*(u*(u*6-15)+10);
    const backOut  = x => { const c = 1.10; const p = x-1; return 1 + (c+1)*p*p*p + c*p*p; };
    const easeIO   = u => u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u+2, 3)/2;

    // ── Smooth sculpture tilt following mouse ────────────────────────────
    function updateSculptureTilt(){
      if (reduceMotion) return;
      const lerpSpeed = 0.055;
      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      sculpture.rotation.x = currentRotX;
      sculpture.rotation.y = currentRotY;
    }

    function updateInstances(t, dt){
      if (!mesh || !A) return;
      const idle = reduceMotion ? 0 : params.idle;
      const seq  = seqTime();
      const formed = seq >= FORM_END;

      // ── Vertical sweep (existing left-right formation pulse) ─────────────
      let sweepX = null, sweepW = 3.2, sweepGain = 0;
      if (seq >= FORM_END - 0.4 && seq < SEQ_END + 0.6){
        const p = clamp01((seq - (FORM_END - 0.4)) / (T.pulse + 0.6));
        sweepX = -WORLD_W*0.62 + p*WORLD_W*1.24;
        sweepGain = 1.5 * Math.sin(Math.PI*p);
        sweepW = 3.6;
      } else if (formed){
        const p = ((t*0.085) % 1);
        sweepX = -WORLD_W*0.62 + p*WORLD_W*1.24;
        sweepGain = 0.45 * idle;
        sweepW = 5.0;
      }

      // ── Diagonal shine slab — sweeps from top-left → bottom-right ────────
      // The slab normal is along (1, -1, 0) / sqrt(2).  We parameterise by how
      // far along that diagonal the slab currently sits.
      const DIAG_PERIOD  = 4.2;                // seconds per full sweep
      const DIAG_HALF    = WORLD_W * 1.4;       // total travel range along diagonal
      const diagPhase    = (t / DIAG_PERIOD) % 1;
      const diagCenter   = -DIAG_HALF + diagPhase * DIAG_HALF * 2; // -DIAG_HALF → +DIAG_HALF
      const DIAG_W       = 4.0;                 // slab half-thickness in world units
      const DIAG_GAIN    = formed ? 1.8 : 0;   // brightness multiplier

      const cArr = mesh.instanceColor.array;

      for (let i = 0; i < N; i++){
        const i3 = i*3, i4 = i*4;
        const local = clamp01((seq - A.delay[i]) / A.dur[i]);
        const s  = smoother(local);
        const e  = local >= 1 ? 1 : backOut(s);
        const iw = clamp01((local - 0.8)/0.2);          

        vB.set(A.home[i3], A.home[i3+1], A.home[i3+2]);
        if (local >= 1){
          vP.copy(vB);
        } else {
          vA.set(A.start[i3], A.start[i3+1], A.start[i3+2]);
          axis.set(A.swirlAx[i3], A.swirlAx[i3+1], A.swirlAx[i3+2]);
          qA.setFromAxisAngle(axis, A.swirl[i] * (1 - s));   
          vA.applyQuaternion(qA);
          vP.lerpVectors(vA, vB, e);
          const turb = (1 - s) * 2.2;                        
          vP.x += Math.sin(t*0.7 + A.idlePhs[i3])   * turb;
          vP.y += Math.sin(t*0.9 + A.idlePhs[i3+1]) * turb;
          vP.z += Math.sin(t*0.6 + A.idlePhs[i3+2]) * turb;
        }
        if (iw > 0 && idle > 0){
          const a = A.idleAmp[i]*idle*iw;
          vP.x += Math.sin(t*A.idleFrq[i3]   + A.idlePhs[i3])   * a;
          vP.y += Math.sin(t*A.idleFrq[i3+1] + A.idlePhs[i3+1]) * a * 1.35;
          vP.z += Math.sin(t*A.idleFrq[i3+2] + A.idlePhs[i3+2]) * a;
        }

        qA.set(A.startQ[i4], A.startQ[i4+1], A.startQ[i4+2], A.startQ[i4+3]);
        qB.set(A.homeQ[i4],  A.homeQ[i4+1],  A.homeQ[i4+2],  A.homeQ[i4+3]);
        if (local >= 1) qA.copy(qB); else qA.slerp(qB, clamp01(e));
        if (iw > 0 && idle > 0){
          axis.set(A.spinAx[i3], A.spinAx[i3+1], A.spinAx[i3+2]);
          qC.setFromAxisAngle(axis, (A.spin[i]*t*0.35 + Math.sin(t*A.idleFrq[i3]*0.8 + A.idlePhs[i3])*0.09) * idle * iw);
          qA.multiply(qC);
        }

        const born = clamp01((seq - A.delay[i] + 0.35) / 0.55);
        const sc = A.scale[i] * born * (0.9 + 0.1*e);

        dummy.position.copy(vP);
        dummy.quaternion.copy(qA);
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        let g = 1;
        if (sweepX !== null && iw > 0){
          const d = (vP.x - sweepX) / sweepW;
          g = 1 + sweepGain * Math.exp(-d*d) * iw;
        }

        // Apply diagonal shine slab
        if (DIAG_GAIN > 0 && iw > 0){
          // Project vP onto diagonal direction (1, -1) normalised → dot / sqrt(2)
          const proj = (vP.x - vP.y) * 0.7071;
          const dd = (proj - diagCenter) / DIAG_W;
          const shine = DIAG_GAIN * Math.exp(-dd * dd) * iw;
          g += shine;
        }

        cArr[i3]   = A.base[i3]   * g;
        cArr[i3+1] = A.base[i3+1] * g;
        cArr[i3+2] = A.base[i3+2] * g;
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;

      if (formed && !formedFlag) formedFlag = true;
      if (formed && !controls.enabled){ controls.target.set(0,0,0); controls.enabled = true; }
    }

    function updateOrbiters(t){
      if (!orbiters) return;
      const vis = clamp01((seqTime() - FORM_END + 1.2)/1.5);
      for (let i = 0; i < ORB; i++){
        const o = orbData[i];
        const ang = t*o.speed + o.phase;
        const r = o.r + Math.sin(t*o.rFrq + o.phase)*o.rWob;   
        dummy.position.set(
          Math.cos(ang)*r,
          o.y + Math.sin(t*o.yFrq + o.phase)*2.4,
          Math.sin(ang)*r*0.8 + Math.sin(ang*2)*o.tilt*3
        );
        dummy.rotation.set(0,0,0);
        dummy.quaternion.setFromAxisAngle(o.ax, t*o.spin);
        dummy.scale.setScalar(o.s*vis*(reduceMotion?1:1));
        dummy.updateMatrix();
        orbiters.setMatrixAt(i, dummy.matrix);
      }
      orbiters.instanceMatrix.needsUpdate = true;
    }

    let rAFId = null;
    let isVisible = true;
    const globalClock = new THREE.Clock();

    function renderLoop(){
      // A3: park the loop entirely when the hero is scrolled out of view.
      if (!isVisible) { rAFId = null; return; }
      rAFId = requestAnimationFrame(renderLoop);
      const dt = globalClock.getDelta();
      const t = globalClock.elapsedTime;

      updateCamera(t);
      updateLights(t);
      updateSculptureTilt();
      updateInstances(t, dt);
      updateOrbiters(t);

      composer.render();
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // A3: this canvas runs an EffectComposer with UnrealBloom every frame —
    // easily the most expensive loop on the page. It had no visibility gate,
    // so it kept rendering at full cost while the user read the rest of the
    // site. Resume slightly before it scrolls back in.
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && rAFId === null) {
          // Discard the accumulated pause so the animation resumes smoothly
          // instead of jumping by the full off-screen duration.
          globalClock.getDelta();
          rAFId = requestAnimationFrame(renderLoop);
        }
      },
      { threshold: 0, rootMargin: '200px 0px' },
    );
    visObserver.observe(container);

    build(true);
    buildOrbiters();
    renderLoop();

    return () => {
      cancelAnimationFrame(rAFId);
      visObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      if (renderer) renderer.dispose();
      if (composer) composer.dispose();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%', 
        height: '100%', 
        position: 'relative',
        background: 'transparent'
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 42% 34% at 50% 50%,
          rgba(6,7,12,.90) 0%,
          rgba(6,7,12,.72) 34%,
          rgba(6,7,12,.34) 58%,
          rgba(6,7,12,.10) 76%,
          rgba(6,7,12,0) 92%)`
      }} />
    </div>
  );
};

export default PrismTypography;
