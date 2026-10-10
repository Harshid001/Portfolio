import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* ════════════════════════ scene constants ════════════════════════ */
const VIEW_W   = 440;
const VIEW_H   = 115;
const GROUND_Y = 100;

// Patrol limits: wide clearing between bush (ends x=96) and right tree (starts x=375)
const LEFT_X  = 145;
const RIGHT_X = 328;

/* ════════════════════════ puppet constants ═══════════════════════ */
// Large puppet proportions (as big as previous, ~52h x 78w):
// Body: 52 wide x 36 high (from x: -26 to +26, y: -52 to -16)
// Arms: 13 wide x 13 high (x: -39 to -26 and +26 to +39, y: -31 to -18)
// Legs: 4 legs, 6.5 wide x 16 high (y: -16 to 0)
// Total width: 78, Total height: 52 (aspect ratio = 1.5, exact mascot match)
const HIP_X      = [-22.75, -9.75, 9.75, 22.75]; // Centers of the 4 legs
const LEG_W      = 6.5;
const LEG_REST_H = 16;
const STRIDE     = 4.2;
const FOOT_LIFT  = 6.0;

const WALK_SPEED  = 44;   // viewBox units / sec
const GAIT_PERIOD = 0.48; // seconds per stride cycle
const BRAKE_DIST  = 26;

const WAVE_TIME   = 2.4;
const WAVE_HZ     = 2.8;
const HELLO_TIME  = 1.8;
const CHEER_TIME  = 0.85;
const JUMP_HEIGHT = 14;

const TAU = Math.PI * 2;

/* ════════════════════════ helpers ════════════════════════════════ */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const damp  = (cur, tgt, r, dt) => lerp(cur, tgt, 1 - Math.exp(-r * dt));
const f2    = (n) => Number(n).toFixed(2);

/* ════════════════════════ simulation ════════════════════════════ */
function makeSim() {
  return {
    x: LEFT_X,
    heading: 1,      // 1 = walking right, -1 = walking left
    facing: 1,       // discrete flip (+1 or -1) to prevent any scale distortion
    dir: 1,
    mode: 'wave',    // 'wave' | 'walk'
    modeT: 0,
    walkAmt: 0,
    gait: 0,
    waveAmt: 0,
    waveClock: 0,
    hello: 0,
    cheerT: -1,
    cheerP: 0,
    cheerEnv: 0,
    blinkIn: 2.2,
    blinkT: -1,
    clock: 0,
  };
}

function stepSim(s, dt) {
  s.clock += dt;
  s.modeT += dt;
  if (s.hello > 0) s.hello -= dt;

  let walkTarget = 0;
  let waveTarget = s.hello > 0 ? 1 : 0;

  if (s.mode === 'walk') {
    const rem = s.heading > 0 ? RIGHT_X - s.x : s.x - LEFT_X;
    walkTarget = clamp(rem / BRAKE_DIST, 0.25, 1);
    if (rem <= 0.4) {
      s.mode = 'wave';
      s.modeT = 0;
      s.dir = -s.heading;
    }
  } else {
    // Pauses at end of patrol to wave
    if (s.modeT > 0.15 && s.modeT < WAVE_TIME - 0.25) waveTarget = 1;
    if (s.modeT >= WAVE_TIME) {
      s.mode = 'walk';
      s.modeT = 0;
      s.heading = s.dir;
      s.facing = s.dir; // Instant clean flip, NO intermediate squish
    }
  }

  s.walkAmt = damp(s.walkAmt, walkTarget, walkTarget > s.walkAmt ? 6 : 9, dt);
  s.x       = clamp(s.x + s.heading * WALK_SPEED * s.walkAmt * dt, LEFT_X, RIGHT_X);
  s.gait   += (dt / GAIT_PERIOD) * s.walkAmt;

  s.waveAmt = damp(s.waveAmt, waveTarget, 12, dt);
  if (s.waveAmt > 0.01) s.waveClock += dt * TAU * WAVE_HZ;
  else                   s.waveClock  = 0;

  if (s.cheerT >= 0) {
    s.cheerT += dt;
    if (s.cheerT >= CHEER_TIME) s.cheerT = -1;
  }
  s.cheerP   = s.cheerT >= 0 ? s.cheerT / CHEER_TIME : 0;
  s.cheerEnv = s.cheerT >= 0 ? Math.sin(Math.PI * s.cheerP) : 0;

  if (s.blinkT >= 0) {
    s.blinkT += dt;
    if (s.blinkT > 0.14) s.blinkT = -1;
  } else {
    s.blinkIn -= dt;
    if (s.blinkIn <= 0) {
      s.blinkT = 0;
      s.blinkIn = 2.4 + Math.random() * 2.6;
    }
  }
}

/* ════════════════════════ component ════════════════════════════ */
export default function ClaudeAgentPuppet() {
  const reduceMotion = useReducedMotion();
  const [heart, setHeart] = useState(null);
  const heartTimer = useRef(null);

  const sim = useRef(null);
  if (!sim.current) sim.current = makeSim();

  // Direct DOM refs — zero React re-renders per frame
  const rootRef     = useRef(null);
  const bodyRef     = useRef(null);
  const eyeLRef     = useRef(null);
  const eyeRRef     = useRef(null);
  const armRGRef    = useRef(null);
  const armLGRef    = useRef(null);
  const legRectRefs = useRef([]); // 4 leg rects

  useEffect(() => {
    const s   = sim.current;
    const set = (el, attr, v) => el && el.setAttribute(attr, v);

    const apply = () => {
      const w   = s.walkAmt;
      const c   = s.gait;
      const cp  = s.cheerP;
      const env = s.cheerEnv;

      /* ── Root position + jump ─────────────────────────────────── */
      const jump = JUMP_HEIGHT * 4 * cp * (1 - cp);
      set(rootRef.current, 'transform',
        `translate(${f2(s.x)} ${f2(GROUND_Y - jump)}) scale(${s.facing} 1)`
      );

      /* ── Body bob (pure vertical, zero rotation to prevent tilt distortion) ── */
      const bob = Math.abs(Math.sin(TAU * c)) * 2.2 * w;
      const breathe = (1 - w) * 0.6 * (0.5 + 0.5 * Math.sin(s.clock * 2.4));
      const bodyY = -(bob + breathe);
      set(bodyRef.current, 'transform', `translate(0 ${f2(bodyY)})`);

      /* ── Legs: 4 crisp stepping rectangles (no polygon shear, no rotation distortion) ── */
      // Leg pairs: [0, 2] step together, [1, 3] step together
      const LEG_PHASE = [0, 0.5, 0, 0.5];
      const hipTop = -16 + bodyY; // Top of legs anchored to bottom of torso

      for (let i = 0; i < 4; i += 1) {
        const u = (((c + LEG_PHASE[i]) % 1) + 1) % 1;
        let dx = 0;
        let lift = 0;

        if (w > 0.02) {
          if (u < 0.52) {
            // Stance: foot planted on ground, pushing back
            const p = u / 0.52;
            dx = -STRIDE * (2 * p - 1) * w;
            lift = 0;
          } else {
            // Swing: foot lifts off ground and swings forward
            const p = (u - 0.52) / 0.48;
            dx = STRIDE * (2 * p - 1) * w;
            lift = Math.sin(Math.PI * p) * FOOT_LIFT * w;
          }
        }

        // Mid-jump foot tuck
        if (env > 0) lift = Math.max(lift, env * 4.5);

        const footY = -lift;
        const legH = footY - hipTop;

        const el = legRectRefs.current[i];
        if (el) {
          el.setAttribute('x', f2(HIP_X[i] - LEG_W / 2 + dx));
          el.setAttribute('y', f2(hipTop));
          el.setAttribute('height', f2(Math.max(3, legH)));
        }
      }

      /* ── Arms: horizontal in rest, right arm waves, both flap on cheer ── */
      let angR = 0;
      let angL = 0;

      if (s.waveAmt > 0.01) {
        // Right arm waves
        const wave = -66 + 22 * Math.sin(s.waveClock);
        angR = lerp(0, wave, s.waveAmt);
      }

      if (env > 0) {
        // Cheering: both arms raise up with excited flap
        const flap = 18 * Math.sin(TAU * 5 * s.cheerT);
        angR = lerp(angR, -80 + flap, env);
        angL = lerp(angL, -80 - flap, env);
      }

      set(armRGRef.current, 'transform', `translate(26 -24.5) rotate(${f2(angR)} 0 0)`);
      set(armLGRef.current, 'transform', `translate(-26 -24.5) rotate(${f2(-angL)} 0 0)`);

      /* ── Eyes: blink and squint ─────────────────────────────── */
      const open = lerp(s.blinkT >= 0 ? 0.16 : 1, 0.22, env);
      const eh = 7.5 * open;
      const ey = -39 - eh / 2;
      set(eyeLRef.current, 'y', f2(ey));
      set(eyeLRef.current, 'height', f2(eh));
      set(eyeRRef.current, 'y', f2(ey));
      set(eyeRRef.current, 'height', f2(eh));
    };

    if (reduceMotion) {
      s.x = (LEFT_X + RIGHT_X) / 2;
      s.mode = 'still';
      apply();
      return undefined;
    }

    apply();
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepSim(s, dt);
      apply();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  useEffect(() => () => clearTimeout(heartTimer.current), []);

  const handleClick = () => {
    const s = sim.current;
    if (!reduceMotion) {
      if (s.cheerT >= 0) return;
      s.cheerT = 0;
    }
    setHeart({ id: Date.now(), x: s.x });
    clearTimeout(heartTimer.current);
    heartTimer.current = setTimeout(() => setHeart(null), 850);
  };

  const handleHover = () => {
    if (!reduceMotion) sim.current.hello = HELLO_TIME;
  };

  return (
    <div
      onClick={handleClick}
      onPointerEnter={handleHover}
      className="relative w-full cursor-pointer select-none"
      title="Clawd walking in nature (hover to wave, click to cheer!)"
      data-no-shader-action="true"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto overflow-visible"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* ══ 1. BASE LAND (Crisp ground line along the title) ══ */}
        <line
          x1="4"
          y1={GROUND_Y}
          x2="436"
          y2={GROUND_Y}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          opacity="0.85"
        />
        {/* Ground sub-layer dashes */}
        <line
          x1="10"
          y1={GROUND_Y + 3.5}
          x2="430"
          y2={GROUND_Y + 3.5}
          stroke="var(--color-ink)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.3"
        />
        {/* Subterranean soil dots */}
        <g fill="var(--color-ink)" opacity="0.25">
          <rect x="30"  y={GROUND_Y + 7} width="3" height="2" />
          <rect x="95"  y={GROUND_Y + 7} width="2" height="2" />
          <rect x="170" y={GROUND_Y + 8} width="3" height="2" />
          <rect x="245" y={GROUND_Y + 7} width="2" height="2" />
          <rect x="320" y={GROUND_Y + 8} width="3" height="2" />
          <rect x="395" y={GROUND_Y + 7} width="2" height="2" />
        </g>
        {/* Grass tufts along the base land */}
        <g fill="var(--color-ink)" opacity="0.55">
          <rect x="65"  y={GROUND_Y - 4} width="2" height="4" />
          <rect x="68"  y={GROUND_Y - 7} width="2" height="7" />
          <rect x="170" y={GROUND_Y - 4} width="2" height="4" />
          <rect x="173" y={GROUND_Y - 7} width="2" height="7" />
          <rect x="255" y={GROUND_Y - 4} width="2" height="4" />
          <rect x="258" y={GROUND_Y - 8} width="2" height="8" />
          <rect x="335" y={GROUND_Y - 4} width="2" height="4" />
          <rect x="338" y={GROUND_Y - 7} width="2" height="7" />
        </g>

        {/* ══ 2. TREE 1 (Left Pine Tree — enlarged, rich CLI style) ══ */}
        <g fill="var(--color-ink)" opacity="0.85">
          <rect x="26" y="12" width="8"  height="8"  />
          <rect x="21" y="20" width="18" height="10" />
          <rect x="15" y="30" width="30" height="13" />
          <rect x="9"  y="43" width="42" height="15" />
          <rect x="3"  y="58" width="54" height="17" />
          {/* Trunk */}
          <rect x="25" y="75" width="10" height={GROUND_Y - 75} opacity="0.65" />
        </g>

        {/* ══ 3. BUSH (Nestled at foot of left tree, ends at x=96) ══ */}
        <g fill="var(--color-ink)" opacity="0.75">
          <rect x="68" y={GROUND_Y - 22} width="18" height="6" />
          <rect x="63" y={GROUND_Y - 16} width="28" height="7" />
          <rect x="58" y={GROUND_Y - 9}  width="38" height="9" />
          {/* Subtle cutout highlight */}
          <rect x="73" y={GROUND_Y - 15} width="5"  height="4" fill="var(--color-paper)" opacity="0.7" />
        </g>

        {/* ══ 4. TREE 2 (Right Pine Tree — enlarged, rich CLI style) ══ */}
        <g fill="var(--color-ink)" opacity="0.85">
          <rect x="398" y="8"  width="8"  height="8"  />
          <rect x="393" y="16" width="18" height="10" />
          <rect x="387" y="26" width="30" height="13" />
          <rect x="381" y="39" width="42" height="15" />
          <rect x="375" y="54" width="54" height="18" />
          {/* Trunk */}
          <rect x="397" y="72" width="10" height={GROUND_Y - 72} opacity="0.65" />
        </g>

        {/* ══ 5. CLAWD PUPPET (Origin 0,0 is ground contact point) ══ */}
        <g ref={rootRef} transform={`translate(${LEFT_X} ${GROUND_Y})`}>
          {/* 4 Stepping Legs: pure rectangles, zero distortion, zero shear */}
          {HIP_X.map((hx, i) => (
            <rect
              key={hx}
              ref={(el) => { legRectRefs.current[i] = el; }}
              x={hx - LEG_W / 2}
              y={-LEG_REST_H}
              width={LEG_W}
              height={LEG_REST_H}
              fill="var(--color-ink)"
            />
          ))}

          {/* Upper Body (Bobs smoothly, zero rotational tilt) */}
          <g ref={bodyRef} transform="translate(0 0)">
            {/* Head & Torso: 52 wide x 36 high (from x: -26 to +26, y: -52 to -16) */}
            <rect x="-26" y="-52" width="52" height="36" fill="var(--color-ink)" />

            {/* Left Arm: 13 wide x 13 high */}
            <g ref={armLGRef} transform="translate(-26 -24.5)">
              <rect x="-13" y="-6.5" width="13" height="13" fill="var(--color-ink)" />
            </g>

            {/* Right Arm: 13 wide x 13 high (waving arm) */}
            <g ref={armRGRef} transform="translate(26 -24.5)">
              <rect x="0" y="-6.5" width="13" height="13" fill="var(--color-ink)" />
            </g>

            {/* Eyes: two square eyes matching the mascot */}
            <rect
              ref={eyeLRef}
              x="-18"
              y="-42.75"
              width="7.5"
              height="7.5"
              fill="var(--color-paper)"
            />
            <rect
              ref={eyeRRef}
              x="10.5"
              y="-42.75"
              width="7.5"
              height="7.5"
              fill="var(--color-paper)"
            />
          </g>
        </g>
      </svg>

      {/* ♥ Pop on click, spawned above wherever Clawd is */}
      <AnimatePresence>
        {heart && (
          <motion.span
            key={heart.id}
            initial={{ opacity: 0, x: '-50%', y: 0,   scale: 0.6 }}
            animate={{ opacity: 1, x: '-50%', y: -36,  scale: 1.25 }}
            exit   ={{ opacity: 0, x: '-50%', y: -48,  scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute text-base font-bold text-red-500 pointer-events-none font-mono"
            style={{
              left: `${(heart.x / VIEW_W) * 100}%`,
              top:  `${((GROUND_Y - 65) / VIEW_H) * 100}%`,
            }}
          >
            ♥
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
