import React, { useEffect, useRef } from 'react';
import './Footer.css';

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const footer = footerRef.current;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- clock ---------- */
    const clockEl = footer.querySelector('#clock');
    function tick() {
      if (clockEl) {
        clockEl.textContent =
          'IST ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
      }
    }
    tick();
    const clockInt = setInterval(tick, 1000);

    /* ---------- ticker: real content, slow ---------- */
    const feed = [
      ['b', 'Let’s build something'],
      ['i', 'React 19 / Vite / Three.js / GLSL / Framer Motion'],
      ['b', '2 slots left — Q3 2026'],
      ['i', 'Last commit: particle-morph — cone spin atlas'],
      ['b', 'Open to collaboration'],
      ['i', 'Studio Kern · Northlane · Basil & Co · Meridian Labs'],
      ['b', 'Frontend & WebGL'],
      ['i', 'Avg. response 6h · Based in Gujarat, IN'],
    ];
    const trEl = footer.querySelector('#tr');
    if (trEl) {
      trEl.innerHTML = feed.map(([t, v]) => '<' + t + '>' + v + '</' + t + '>').join('').repeat(2);
    }
    const toTopEl = footer.querySelector('#toTop');
    if (toTopEl) {
      toTopEl.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------- copy ---------- */
    const copyBtn = footer.querySelector('#copy');
    const MAIL = 'hello@harshid.dev';
    let copyTimer = null;
    if (copyBtn) {
      const copyTxt = copyBtn.querySelector('span');
      copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(MAIL);
        } catch (_) {
          const ta = document.createElement('textarea');
          ta.value = MAIL;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
          } catch (__) {}
          ta.remove();
        }
        copyBtn.classList.add('done');
        if (copyTxt) copyTxt.textContent = 'Copied';
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
          copyBtn.classList.remove('done');
          if (copyTxt) copyTxt.textContent = 'Copy';
        }, 1500);
      });
    }

    /* ---------- dismissible keyboard hint ---------- */
    const phint = footer.querySelector('#phint');
    const phintx = footer.querySelector('#phintx');
    if (phintx && phint) {
      phintx.addEventListener('click', () => phint.classList.add('hide'));
    }

    /* ---------- marks ---------- */
    const LOGOS = {
      github: { vb: [512, 512], d: 'M216.5 362.5c-66-8-112.5-55.5-112.5-117 0-25 9-52 24-70-6.5-16.5-5.5-51.5 2-66 20-2.5 47 8 63 22.5 19-6 39-9 63.5-9s44.5 3 62.5 8.5c15.5-14 43-24.5 63-22 7 13.5 8 48.5 1.5 65.5 16 19 24.5 44.5 24.5 70.5 0 61.5-46.5 108-113.5 116.5 17 11 28.5 35 28.5 62.5l0 52C323 491.5 335.5 500 350.5 494 441 459.5 512 369 512 257 512 115.5 397 0 255.5 0S0 115.5 0 257c0 111 70.5 203 165.5 237.5 13.5 5 26.5-4 26.5-17.5l0-40c-7 3-16 5-24 5-33 0-52.5-18-66.5-51.5-5.5-13.5-11.5-21.5-23-23-6-.5-8-3-8-6 0-6 10-10.5 20-10.5 14.5 0 27 9 40 27.5 10 14.5 20.5 21 33 21s20.5-4.5 32-16c8.5-8.5 15-16 21-21z' },
      linkedin: { vb: [448, 512], d: 'M416 32L31.9 32C14.3 32 0 46.5 0 64.3L0 447.7C0 465.5 14.3 480 31.9 480L416 480c17.6 0 32-14.5 32-32.3l0-383.4C448 46.5 433.6 32 416 32zM135.4 416l-66.4 0 0-213.8 66.5 0 0 213.8-.1 0zM102.2 96a38.5 38.5 0 1 1 0 77 38.5 38.5 0 1 1 0-77zM384.3 416l-66.4 0 0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2z' },
      youtube: { vb: [576, 512], d: 'M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z' },
      x: { vb: [448, 512], d: 'M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48zM332.4 421.8l39.1 0-252.4-333.8-42 0 255.3 333.8z' }
    };
    const ORDER = ['github', 'linkedin', 'youtube', 'x'];
    const LABEL = { github: 'GITHUB', linkedin: 'LINKEDIN', youtube: 'YOUTUBE', x: 'X / TWITTER' };
    const URLS = {
      github: 'https://github.com/Harshid001',
      linkedin: 'https://www.linkedin.com/in/harshid-soni-441500385/',
      youtube: 'https://www.youtube.com/@Harshid001',
      x: 'https://x.com/HarshidSoni2007'
    };

    /* ---------- cone sprite ---------- */
    function makeConeTexture(color, rot) {
      const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
      const ctx = c.getContext('2d');
      ctx.translate(S / 2, S / 2); ctx.rotate(rot || 0); ctx.translate(-S / 2, -S / 2);
      const CX = 64, RX = 33, RY = 14, BASE_Y = 92, APEX_Y = 28;
      ctx.strokeStyle = color; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.globalAlpha = .5; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(CX, BASE_Y, RX, RY, 0, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.globalAlpha = .9; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.ellipse(CX, BASE_Y, RX, RY, 0, 0, Math.PI); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.moveTo(CX - RX, BASE_Y); ctx.lineTo(CX, APEX_Y); ctx.lineTo(CX + RX, BASE_Y); ctx.stroke();
      return c;
    }
    const footerColor = getComputedStyle(footer).color || '#000';
    const TAU = Math.PI * 2, SPIN_STEPS = 24, whiteSprites = [], greySprites = [];
    for (let i = 0; i < SPIN_STEPS; i++) {
      const r = TAU * i / SPIN_STEPS;
      whiteSprites.push(makeConeTexture(footerColor, r));
      greySprites.push(makeConeTexture('#8A8A8A', r));
    }

    /* ---------- device-aware particle budget ---------- */
    const cores = navigator.hardwareConcurrency || 4;
    const small = window.innerWidth < 960;
    const COUNT = small ? (cores <= 4 ? 350 : 500) : (cores <= 4 ? 600 : cores <= 8 ? 900 : 1200);

    const stage = footer.querySelector('#stage');
    if (!stage) return;

    const SIZE = 220, TARGET = 190;
    function sampleFrom(drawFn) {
      const c = document.createElement('canvas'); c.width = c.height = SIZE;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000'; drawFn(ctx);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data, cand = [];
      for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (data[(y * SIZE + x) * 4 + 3] > 60) cand.push([x, y]);
      const pos = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const p = cand.length ? cand[(Math.random() * cand.length) | 0] : [SIZE / 2, SIZE / 2];
        pos[i * 3] = (p[0] - SIZE / 2) * .85 + (Math.random() - .5) * 2;
        pos[i * 3 + 1] = (p[1] - SIZE / 2) * .85 + (Math.random() - .5) * 2;
        pos[i * 3 + 2] = (Math.random() - .5) * 26;
      }
      return pos;
    }
    function sampleLogo(key) {
      const { vb, d } = LOGOS[key], [vw, vh] = vb, s = Math.min(TARGET / vw, TARGET / vh);
      return sampleFrom(ctx => {
        ctx.save(); ctx.translate((SIZE - vw * s) / 2, (SIZE - vh * s) / 2); ctx.scale(s, s);
        ctx.fill(new Path2D(d)); ctx.restore();
      });
    }
    const glyphCache = {};
    function sampleGlyph(ch) {
      if (glyphCache[ch]) return glyphCache[ch];
      const pos = sampleFrom(ctx => {
        ctx.font = '900 190px "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ch, SIZE / 2, SIZE / 2 + 6);
      });
      glyphCache[ch] = pos; return pos;
    }
    const shapes = ORDER.map(sampleLogo);

    const spinPhase = new Float32Array(COUNT), spinSpeed = new Float32Array(COUNT),
      sizeJit = new Float32Array(COUNT), isGrey = new Uint8Array(COUNT), delays = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      spinPhase[i] = Math.random() * TAU;
      spinSpeed[i] = (0.0004 + Math.random() * 0.0011) * (Math.random() < .5 ? -1 : 1);
      sizeJit[i] = .78 + Math.random() * .5;
      isGrey[i] = Math.random() < .3 ? 1 : 0;
      delays[i] = Math.random() * .6;
    }

    const cv = document.createElement('canvas'); stage.appendChild(cv);
    const g = cv.getContext('2d');
    const gridCv = document.createElement('canvas');
    const gridCtx = gridCv.getContext('2d');
    let W = 0, H = 0; const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let cachedFcRgb = '255,255,255';
    function resize() { 
      W = stage.clientWidth; H = stage.clientHeight; 
      cv.width = W * DPR; cv.height = H * DPR; 
      g.setTransform(DPR, 0, 0, DPR, 0, 0); 
      
      gridCv.width = W * DPR; gridCv.height = H * DPR;
      gridCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      
      const fColor = getComputedStyle(footer).color || '#000';
      if (fColor.startsWith('rgb')) {
        const m = fColor.match(/\d+,\s*\d+,\s*\d+/);
        if (m) cachedFcRgb = m[0];
      }
      gridCtx.clearRect(0, 0, W, H);
      const CELL = 62;
    }
    resize(); window.addEventListener('resize', resize);

    const rest = new Float32Array(shapes[0]), intro = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 22 + Math.random() * 34, a = Math.random() * TAU;
      intro[i * 3] = shapes[0][i * 3] + Math.cos(a) * r;
      intro[i * 3 + 1] = shapes[0][i * 3 + 1] + Math.sin(a) * r;
      intro[i * 3 + 2] = shapes[0][i * 3 + 2] + (Math.random() - .5) * 20;
    }
    if (reduce) intro.set(shapes[0]);
    const burst = new Float32Array(COUNT * 3); let burstStart = null;

    const HOLD = 2400, MORPH = 1600, HOVER_MORPH = 700, INTRO = 1500, SPREAD = .4, BURST = 1300, IDLE = 4000;
    let phase = reduce ? 'hold' : 'intro', phaseStart = performance.now();
    let restIndex = 0, from = shapes[0], to = shapes[0], introP = reduce ? 1 : 0;
    let morphMs = MORPH, displayLabel = LABEL[ORDER[0]], nextLabel = displayLabel, nextIndex = null;
    let hovering = false, openHref = URLS[ORDER[0]], stillUntil = 0;
    let lastInteract = performance.now();

    const SPRITE_PX = 10, PERSP = 300, ZOOM = 1.5;
    let scale = ZOOM, targetScale = ZOOM, rotY = 0, rotX = 0, tRotY = 0, tRotX = 0, spin = 0;
    const mouse = { x: -1e5, y: -1e5, on: false };
    const REPEL_R = 34, REPEL_S = 14;
    const curEl = footer.querySelector('#cur'), labelEl = document.createElement('div');
    const countEl = footer.querySelector('#conecount');

    function setActive(k) {
      footer.querySelectorAll('.lnk[data-key]').forEach(el => el.classList.toggle('on', el.dataset.key === k));
    }
    function morphTo(target, label, indexAfter, ms) {
      from = rest.slice(); to = target; morphMs = ms || MORPH;
      nextLabel = label; nextIndex = (indexAfter === undefined ? null : indexAfter);
      phase = 'morph'; phaseStart = performance.now();
    }

    /* ---------- preview + hover morph ---------- */
    const pvNum = footer.querySelector('#pv .pvnum'), pvTtl = footer.querySelector('#pv .pvttl'), pvSub = footer.querySelector('#pv .pvsub');
    const bars = footer.querySelectorAll('#pv .bars i');
    function rowEnter(el) {
      if (pvNum) pvNum.innerHTML = el.dataset.pvNum;
      if (pvTtl) pvTtl.innerHTML = el.dataset.pvTtl;
      if (pvSub) pvSub.innerHTML = el.dataset.pvSub;
      bars.forEach(b => { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
      stage.classList.add('preview');
      hovering = true; lastInteract = performance.now();
      openHref = el.getAttribute('href');
      if (reduce) return;
      if (el.dataset.key) morphTo(shapes[ORDER.indexOf(el.dataset.key)], LABEL[el.dataset.key], null, HOVER_MORPH);
      else if (el.dataset.glyph) morphTo(sampleGlyph(el.dataset.glyph), el.dataset.pvNum, null, HOVER_MORPH);
    }
    function rowLeave() {
      stage.classList.remove('preview');
      hovering = false; lastInteract = performance.now();
      openHref = URLS[ORDER[restIndex]];
      if (!reduce) morphTo(shapes[restIndex], LABEL[ORDER[restIndex]], null, HOVER_MORPH);
    }
    const rows = [...footer.querySelectorAll('.lnk')];
    rows.forEach(el => {
      el.addEventListener('mouseenter', () => rowEnter(el));
      el.addEventListener('focus', () => rowEnter(el));
      el.addEventListener('mouseleave', rowLeave);
      el.addEventListener('blur', rowLeave);
    });

    /* ---------- keyboard 1-5 ---------- */
    const handleKeydown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target; if (t && /input|textarea|select/i.test(t.tagName)) return;
      const row = footer.querySelector('.lnk[data-k="' + e.key + '"]');
      if (row) { e.preventDefault(); row.focus(); rowEnter(row); }
    };
    document.addEventListener('keydown', handleKeydown);

    /* ---------- pointer ---------- */
    stage.addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
      mouse.x = lx - W / 2; mouse.y = ly - H / 2; mouse.on = true;
      if (curEl) { curEl.style.left = lx + 'px'; curEl.style.top = ly + 'px'; }
      tRotY = ((lx / r.width) * 2 - 1) * .4; tRotX = -(((ly / r.height) * 2 - 1)) * .22;
      targetScale = ZOOM * 1.07; lastInteract = performance.now();
      stage.classList.add('dragged');
    });
    stage.addEventListener('mouseleave', () => { mouse.on = false; targetScale = ZOOM; tRotY = 0; tRotX = 0; lastInteract = performance.now(); });
    function scatter(power, x, y) {
      for (let i = 0; i < COUNT; i++) {
        const dx = rest[i * 3] - x, dy = rest[i * 3 + 1] - y, d = Math.hypot(dx, dy) || 1;
        const kick = (140 / (d + 30)) * (.7 + Math.random() * .6) * power;
        burst[i * 3] = dx / d * kick; burst[i * 3 + 1] = dy / d * kick; burst[i * 3 + 2] = (Math.random() - .5) * kick * .5;
      }
      burstStart = performance.now();
    }
    stage.addEventListener('click', e => {
      const r = stage.getBoundingClientRect();
      scatter(1, (e.clientX - r.left - W / 2) / scale, (e.clientY - r.top - H / 2) / scale);
      lastInteract = performance.now();
      if (phase === 'hold' && !hovering) window.open(URLS[ORDER[restIndex]], '_blank', 'noopener,noreferrer');
    });

    const easeInOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const depth = new Float32Array(COUNT), px = new Float32Array(COUNT), py = new Float32Array(COUNT), pk = new Float32Array(COUNT);
    let idx = []; for (let i = 0; i < COUNT; i++) idx.push(i);
    setActive(ORDER[0]);

    /* ---------- rAF paused when offscreen ---------- */
    let running = false;
    let rAFId;
    const io = new IntersectionObserver(([en]) => {
      const was = running; running = en.isIntersecting;
      if (running && !was) rAFId = requestAnimationFrame(frame);
    }, { threshold: 0 });
    io.observe(stage);

    let frameNo = 0, activeCount = -1;
    const prevPx = new Float32Array(COUNT), prevPy = new Float32Array(COUNT);
    function frame(now) {
      if (!running) return;
      rAFId = requestAnimationFrame(frame);
      const el = now - phaseStart;

      if (!reduce) {
        if (phase === 'intro') {
          introP = Math.min(el / INTRO, 1);
          for (let i = 0; i < COUNT; i++) {
            const e = easeOutCubic(Math.min(Math.max((introP - delays[i]) / SPREAD, 0), 1));
            for (let k = 0; k < 3; k++) { const j = i * 3 + k; rest[j] = intro[j] + (shapes[0][j] - intro[j]) * e; }
          }
          if (introP >= 1) { phase = 'hold'; phaseStart = now; }
        } else if (phase === 'hold') {
          if (!hovering && el > HOLD) {
            const ni = (restIndex + 1) % shapes.length;
            morphTo(shapes[ni], LABEL[ORDER[ni]], ni, MORPH);
          } else if (now - lastInteract > IDLE && burstStart === null) {
            scatter(.35, 0, 0); lastInteract = now + 2600;
          }
        } else if (phase === 'morph') {
          const t = Math.min(el / morphMs, 1), e = easeInOutCubic(t);
          for (let i = 0; i < rest.length; i++) rest[i] = from[i] + (to[i] - from[i]) * e;
          if (t >= 1) {
            phase = 'hold'; phaseStart = now; stillUntil = now + 600; displayLabel = nextLabel;
            if (nextIndex !== null) { restIndex = nextIndex; setActive(ORDER[restIndex]); if (!hovering) openHref = URLS[ORDER[restIndex]]; }
          }
        }
      }

      let text = displayLabel;
      if (phase === 'morph') {
        const t = Math.min(el / morphMs, 1), inten = .5 - Math.abs(t - .5);
        text = t < .5 ? displayLabel : nextLabel;
        if (inten > .28) {
          const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+><[]';
          text = text.split('').map(c => c === ' ' ? ' ' : ch[(Math.random() * ch.length) | 0]).join('');
        }
        labelEl.style.letterSpacing = (.3 + inten * .4) + 'em';
      } else labelEl.style.letterSpacing = '.3em';
      labelEl.textContent = text;

      scale += (targetScale - scale) * .08;
      rotY += (tRotY - rotY) * .06; rotX += (tRotX - rotX) * .06;
      const still = now < stillUntil, morphing = (phase === 'morph');
      const breathe = (reduce || still) ? 1 : 1 + Math.sin(now / 1400) * .015;
      const bob = (reduce || still) ? 0 : Math.sin(now / 1900) * 3;

      let env = 0;
      if (burstStart !== null) {
        const u = Math.min((now - burstStart) / BURST, 1);
        env = u < .15 ? u / .15 : Math.exp(-6.5 * (u - .15));
        if (u >= 1) burstStart = null;
      }

      const aY = rotY + spin, cy_ = Math.cos(aY), sy_ = Math.sin(aY), cx_ = Math.cos(rotX), sx_ = Math.sin(rotX);
      g.clearRect(0, 0, W, H);
      g.drawImage(gridCv, 0, 0, W, H);

      const CELL = 62;
      g.save();
      g.font = '9px "Courier New", Courier, monospace';
      
      if (mouse.on) {
        const lx = mouse.x + W / 2, ly = mouse.y + H / 2;
        g.fillStyle = `rgba(${cachedFcRgb},.06)`;
        g.fillRect((lx / CELL | 0) * CELL, (ly / CELL | 0) * CELL, CELL, CELL);
        g.strokeStyle = `rgba(${cachedFcRgb},.2)`; g.lineWidth = 1;
        g.beginPath();
        g.moveTo(Math.round(lx) + .5, 0); g.lineTo(Math.round(lx) + .5, H);
        g.moveTo(0, Math.round(ly) + .5); g.lineTo(W, Math.round(ly) + .5);
        g.stroke();
      }
      g.restore();

      const S = scale * breathe * (morphing ? 1.09 : 1);
      let act = 0;

      for (let i = 0; i < COUNT; i++) {
        let x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
        if (env > .001) { x += burst[i * 3] * env; y += burst[i * 3 + 1] * env; z += burst[i * 3 + 2] * env; }
        const x1 = x * cy_ + z * sy_, z1 = -x * sy_ + z * cy_;
        const y1 = y * cx_ - z1 * sx_, z2 = y * sx_ + z1 * cx_;
        const k = PERSP / (PERSP - z2);
        let sxp = W / 2 + x1 * k * S, syp = H / 2 + (y1 + bob) * k * S;
        if (mouse.on) {
          const dx = sxp - (W / 2 + mouse.x), dy = syp - (H / 2 + mouse.y), d = Math.hypot(dx, dy), R = REPEL_R * S;
          if (d < R && d > .001) { const f = (1 - d / R) * REPEL_S * S; sxp += dx / d * f; syp += dy / d * f; }
        }
        if (Math.abs(sxp - prevPx[i]) + Math.abs(syp - prevPy[i]) > 0.55) act++;
        prevPx[i] = sxp; prevPy[i] = syp;
        px[i] = sxp; py[i] = syp; pk[i] = k; depth[i] = z2;
      }
      idx.sort((a, b) => depth[a] - depth[b]);

      for (let n = 0; n < COUNT; n++) {
        const i = idx[n];
        if (morphing && (i % 5) < 2) continue;
        const ia = Math.min(Math.max((introP - delays[i]) / SPREAD, 0), 1);
        if (ia <= .01) continue;
        const dn = Math.min(Math.max((depth[i] + 34) / 68, 0), 1);
        g.globalAlpha = (.4 + .6 * dn) * ia;
        const s = SPRITE_PX * sizeJit[i] * pk[i] * (.35 + .65 * ia) * scale / ZOOM;
        const ang = spinPhase[i] + (reduce ? 0 : now * spinSpeed[i]);
        const step = (((ang % TAU) + TAU) % TAU / TAU * SPIN_STEPS) | 0;
        g.drawImage((isGrey[i] ? greySprites : whiteSprites)[step], px[i] - s * .5, py[i] - s * .5, s, s);
      }
      g.globalAlpha = 1;

      if ((frameNo++ % 3) === 0 && act !== activeCount) {
        activeCount = act;
        if (countEl) countEl.textContent = 'Active ' + act;
      }
    }
    const coneTotalEl = footer.querySelector('#conecount');
    if (footer.querySelector('#conetotal')) footer.querySelector('#conetotal').textContent = COUNT;
    if (coneTotalEl) coneTotalEl.textContent = 'Active ' + COUNT;
    rAFId = requestAnimationFrame(frame);

    return () => {
      clearInterval(clockInt);
      cancelAnimationFrame(rAFId);
      io.disconnect();
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', resize);
      if (cv.parentNode) cv.parentNode.removeChild(cv);
    };
  }, []);

  return (
    <footer ref={footerRef} className="brut-footer brut" id="footer">
      <div className="strip">
        <span><span className="blink"></span>Available &mdash; 2 slots left Q3 2026</span>
        <span id="clock">IST 00:00:00</span>
        <span>Est. 2007 &mdash; India</span>
      </div>

      <div className="name">
        <div className="namein"><h2 className="display"><span>Harshid Soni</span></h2></div>
        <div className="idxmark"><span>Idx 001 &mdash; Scroll &darr;</span></div>
      </div>

      <div className="slab" id="slab">
        <div className="cell">
          <div className="cap"><span>Portfolio</span><span>&middot; 05</span></div>
          <a className="lnk" data-dir="right" data-k="1" data-glyph="W" href="#work"
             data-pv-num="01 / WORK" data-pv-ttl="Case Studies" data-pv-sub="12 case studies &middot; 2019 &rarr; 2026"
             onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView(); }}>
            <span className="lhs"><span className="num">01</span><span className="txt"><span>Work</span><span className="sub">12 case studies</span></span></span>
            <span className="kbd">[1]</span><span className="arw">&#8594;</span>
          </a>
          <a className="lnk" data-dir="right" data-k="2" data-glyph="P" href="#projects"
             data-pv-num="02 / PROJECTS" data-pv-ttl="Shipped" data-pv-sub="28 projects &middot; 9 open source"
             onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView(); }}>
            <span className="lhs"><span className="num">02</span><span className="txt"><span>Projects</span><span className="sub">28 shipped &middot; 9 OSS</span></span></span>
            <span className="kbd">[2]</span><span className="arw">&#8594;</span>
          </a>
          <a className="lnk" data-dir="right" data-k="3" data-glyph="&" href="#playground"
             data-pv-num="03 / PLAYGROUND" data-pv-ttl="Experiments" data-pv-sub="WebGL &middot; shaders &middot; toys"
             onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView(); }}>
            <span className="lhs"><span className="num">03</span><span className="txt"><span>Playground</span><span className="sub">WebGL &amp; shaders</span></span></span>
            <span className="kbd">[3]</span><span className="arw">&#8594;</span>
          </a>
          <a className="lnk" data-dir="right" data-k="4" data-glyph="A" href="#about"
             data-pv-num="04 / ABOUT" data-pv-ttl="Who I Am" data-pv-sub="Frontend engineer &middot; Gujarat, IN"
             onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView(); }}>
            <span className="lhs"><span className="num">04</span><span className="txt"><span>About</span><span className="sub">Frontend engineer</span></span></span>
            <span className="kbd">[4]</span><span className="arw">&#8594;</span>
          </a>
          <a className="lnk" data-dir="down" data-k="5" data-glyph="&#8595;" href="/resume.pdf" target="_blank"
             data-pv-num="05 / RESUME" data-pv-ttl="Download" data-pv-sub="PDF &middot; 148 KB &middot; updated Jul 2026">
            <span className="lhs"><span className="num">05</span><span className="txt"><span>Resume</span><span className="sub">PDF &middot; Jul 2026</span></span></span>
            <span className="kbd">[5]</span><span className="arw">&#8595;</span>
          </a>
        </div>

        <div className="cell stagecell">
          <div className="cap mid"><span>Particle Index</span></div>
          <div id="stage">
            <i className="corner c1"></i><i className="corner c2"></i><i className="corner c3"></i><i className="corner c4"></i>
            <div id="cur"></div>
            <div id="pv">
              <div className="pvnum">01 / WORK</div>
              <div className="pvttl display">Case Studies</div>
              <div className="pvsub">12 case studies &middot; 2019 &rarr; 2026</div>
              <div className="bars"><i></i><i></i><i></i><i></i><i></i></div>
            </div>
            <div id="hint">Hover a row &mdash; the cloud becomes the mark &middot; drag to scatter</div>
          </div>
        </div>

        <div className="cell">
          <div className="cap"><span>Channels</span><span>Live</span></div>
          <a className="lnk" data-dir="up" data-key="github" href="https://github.com/Harshid001" target="_blank" rel="noopener noreferrer"
             data-pv-num="GITHUB" data-pv-ttl="@Harshid001" data-pv-sub="240 repos &middot; 1.1k contributions">
            <span className="lhs"><span className="num">01</span><span className="txt"><span>GitHub</span><span className="sub">@Harshid001 &middot; 240 repos</span></span></span><span className="arw">&#8599;</span>
          </a>
          <a className="lnk" data-dir="up" data-key="linkedin" href="https://www.linkedin.com/in/harshid-soni-441500385/" target="_blank" rel="noopener noreferrer"
             data-pv-num="LINKEDIN" data-pv-ttl="Harshid Soni" data-pv-sub="1.2k connections &middot; open to work">
            <span className="lhs"><span className="num">02</span><span className="txt"><span>LinkedIn</span><span className="sub">1.2k connections</span></span></span><span className="arw">&#8599;</span>
          </a>
          <a className="lnk" data-dir="up" data-key="youtube" href="https://www.youtube.com/@Harshid001" target="_blank" rel="noopener noreferrer"
             data-pv-num="YOUTUBE" data-pv-ttl="@Harshid001" data-pv-sub="12.4k subscribers &middot; 40 videos">
            <span className="lhs"><span className="num">03</span><span className="txt"><span>YouTube</span><span className="sub">12.4k subscribers</span></span></span><span className="arw">&#8599;</span>
          </a>
          <a className="lnk" data-dir="up" data-key="x" href="https://x.com/HarshidSoni2007" target="_blank" rel="noopener noreferrer"
             data-pv-num="X / TWITTER" data-pv-ttl="@HarshidSoni2007" data-pv-sub="860 followers &middot; build logs">
            <span className="lhs"><span className="num">04</span><span className="txt"><span>X / Twitter</span><span className="sub">@HarshidSoni2007</span></span></span><span className="arw">&#8599;</span>
          </a>
          <a className="lnk" data-dir="up" data-glyph="@" href="mailto:hello@harshid.dev"
             data-pv-num="EMAIL" data-pv-ttl="Say Hello" data-pv-sub="Replies within 24 hours">
            <span className="lhs"><span className="num">05</span><span className="txt"><span>Email</span><span className="sub">Replies in &lt; 24h</span></span></span><span className="arw">&#8599;</span>
          </a>
        </div>
      </div>

      <div className="proof">
        <span>Worked with &mdash; <b>Studio Kern</b> &middot; <b>Northlane</b> &middot; <b>Basil &amp; Co</b> &middot; <b>Meridian Labs</b></span>
        <span>Avg. response <b>6h</b> &middot; <b>4 yrs</b> shipping frontend</span>
        <span className="phint" id="phint">Press 1&ndash;5 to jump <button id="phintx" type="button" aria-label="Dismiss hint">&times;</button></span>
      </div>

      <div className="cta" id="cta">
        <span className="big display">Let&rsquo;s build something</span>
        <span className="mailwrap"><span className="arw">&rarr;</span>
          <a className="mail" href="mailto:hello@harshid.dev">hello@harshid.dev</a>
          <button className="copy" id="copy" type="button" aria-label="Copy email address"><span>Copy</span></button>
        </span>
      </div>

      <div className="mq"><div className="tr" id="tr"></div></div>

      <div className="bar">
        <span>&copy; 2026 Harshid Soni &mdash; All rights reserved</span>
        <span className="live"><span className="blink"></span>Last updated 3 days ago</span>
        <span>React / Three.js / No templates</span>
        <button className="top" id="toTop">&#8593; Back to top</button>
      </div>
    </footer>
  );
};

export default Footer;
