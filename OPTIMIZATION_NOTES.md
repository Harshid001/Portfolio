# Portfolio optimization pass

Everything below is already applied to the source in this archive. No visual
changes, no redesign — same site, just far less work per frame and a much
smaller first load.

---

## 1. Removed the things that re-rendered React constantly

These were the main causes of the "not smooth" feel. All three fired
continuously and re-rendered large component trees.

| File | Problem | Fix |
|---|---|---|
| `components/Hero.jsx` | `setInterval(..., 500)` toggled state to blink the `_` caret, re-rendering the **entire hero including the WebGL widget** twice a second, forever | Pure CSS `@keyframes caret-blink` — runs off the main thread, zero React work |
| `components/Navbar.jsx` | `setNavY(0)` ran on **every scroll frame**, re-rendering a 498-line component nonstop while scrolling | `navY` is always `0`, so it's a constant now. The logo-shrink boolean is also guarded so it only re-renders when it actually flips |
| `components/GhostCursor.jsx` | Hover selector list included `p`, `span`, `li`, `h1`–`h6`, `img`, `svg` — so basically **every pixel** of the page triggered a state update on `mouseover` | Narrowed to genuinely interactive elements only |

## 2. Rewrote the custom cursor

This was the single biggest source of cursor lag.

- Dropped `framer-motion` springs and all motion values — the cursor no longer
  imports framer-motion at all.
- Everything is now one `requestAnimationFrame` loop writing `translate3d(...)`
  straight to the DOM. Moving the mouse **never re-renders React**.
- Added a settle check: once the pointer stops, the loop stops painting instead
  of burning a GPU composite every 16ms.
- Trail nodes reduced 5 → 3.

## 3. Fixed a real memory leak

`components/SmoothScroll.jsx` passed a **brand-new arrow function** to
`gsap.ticker.remove()`, so the original callback was never removed:

```js
// before — removes a function that was never added
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.remove((time) => lenis.raf(time * 1000));
```

The old callback stayed registered forever and kept driving a **destroyed**
Lenis instance every frame. Now a named `raf` reference is added and removed.

Also: `syncTouch` turned off (native touch scroll is already GPU-smooth —
syncing through JS only adds jank and battery drain), and smooth scrolling is
fully disabled for `prefers-reduced-motion` users.

## 4. Cut the initial bundle

- **Below-the-fold sections are code-split** (`MainPortfolio.jsx`): About,
  Skills, SkillsMarquee, Projects, Experience, Achievements, Contact are all
  `React.lazy`. Only the hero ships in the first chunk.
- **`ParticleMorph` is now lazy** (`Hero.jsx`). It pulls in `three`; the hero
  text and buttons are interactive long before WebGL finishes downloading.
- **`IntroAnimation` is now lazy** (`App.jsx`). It plays once then gets thrown
  away — no reason for it to sit in the main bundle.
- **`content-visibility: auto`** on each off-screen section, with
  `contain-intrinsic-size` so the scrollbar stays stable. The browser skips
  layout, style and paint entirely for sections you haven't scrolled to.
- Suspense fallbacks reserve height, so lazy loading causes **no layout shift**.

## 5. Build configuration (`vite.config.js`)

There was previously **no build config at all** — just plugins.

- `manualChunks` splits `three`, `@react-three/*`, `framer-motion`,
  React/router, and `gsap`/`lenis` into separately-cached long-lived chunks.
- `target: 'es2022'` — smaller output, no legacy transpilation.
- `drop: ['console', 'debugger']` in production.
- `assetsInlineLimit: 4096` so tiny SVGs cost zero extra requests.
- The dev-only contact-form middleware now has `apply: 'serve'` (it was being
  evaluated during builds) plus a body-size guard against unbounded memory
  growth from a malformed request.

## 6. Images — 45% smaller

Recompressed in place, **same filenames**, so no import changes anywhere.
Longest edge capped at 1600px (nothing on the site renders wider than ~1200).

```
TOTAL  3.34MB  ->  1.84MB   (saved 45%)

Logitech.png            546kb -> 110kb
hackathon2.jpg          362kb ->  88kb
hackathon3.jpg          287kb ->  71kb
smartfactory.png        245kb ->  71kb
hackathon1.jpg          278kb -> 142kb
og-image.png             44kb ->  14kb
studdy-buddy.png         85kb ->  28kb
...
```

Also added `loading="lazy"`, `decoding="async"` and explicit `width`/`height`
to the About portrait (the last `<img>` that was missing them).

## 7. Fixed `hooks/useInView.js`

It spread the whole `options` object into the observer config and listed
`options.threshold` / `options.rootMargin` as effect deps. Since callers pass an
object literal, a fresh `options` existed on every render — so the
IntersectionObserver was **torn down and rebuilt constantly**. Now the values
are read as primitives and the observer is created once per element.

## 8. Dead code moved to `_archive/`

Not deleted — moved out of `src/` so Vite, ESLint and your editor stop
processing them. Restore any of these if you still want them:

- `FrontendSingleFile.jsx` (1251 lines — an old full duplicate of the site)
- `FontExample.jsx` (never imported)
- `Hackathon1.jpeg`, `Hackathon2.jpeg`, `hackathon3.jpeg` (superseded by
  `assets/hackathon/hackathon{1,2,3}.jpg`), `hero.png`, `react.svg`, `vite.svg`

The stale `dist/` folder was removed — regenerate it with `npm run build`.

## 9. Accessibility / motion

Added a global `prefers-reduced-motion: reduce` block in `index.css` that
neutralises any animation or transition that slipped past the per-component
checks.

---

## Before you run it

`node_modules` is **not** included in this archive (it was Windows-only and
made the zip 129MB). Reinstall first:

```bash
npm install
npm run dev      # or: npm run build
```

I could not execute a build in my sandbox — it had no network access and the
bundled `node_modules` only contained the Windows `rolldown` binary. Every
modified file was instead syntax-validated with Prettier's parser, and all
relative imports across `src/` were verified to resolve. Please run
`npm run build` once locally to confirm before deploying.

---

# Round 2 — cursor & hero icon feedback

## 10. Cursor delay during the entrance animation

**Cause:** two separate things were stacking up.

1. `App.jsx` rendered `{!showIntro && <GhostCursor />}`, so the real cursor did
   not exist until the intro finished. It had to mount, attach listeners and
   spin up its rAF loop *mid-interaction*.
2. The intro's eye-box was **impersonating** the cursor. During its `tracking`
   stage it spring-chased the mouse itself (`stiffness: 120, damping: 18`) via a
   framer-motion `animate()` call fired on every single `mousemove`. A spring
   always trails its target, so it visibly lagged behind the real pointer.

**Fix:**

- `GhostCursor` is now mounted from the very first frame, intro included. It is
  warm and tracking before you ever see the intro.
- The eye-box no longer chases the mouse. It keeps its scripted fly-in, look
  around and 45° morph, then at the `tracking` stage it simply **fades out over
  250ms into the real cursor**, which is already sitting at that exact position.
  No second cursor, no hand-off gap, no spring lag.
- Its `mousemove` listener now only records a coordinate (and is `passive`),
  instead of starting two spring animations per event.
- Removed the now write-only `stageRef` left over from that logic.

As you noted, the SKIP button covers escaping the intro, and since it is a real
`<button>` it picks up the new hover state automatically.

## 11. Cursor hover reactivity

Hovering any clickable element now does three things at once:

- The solid diamond **opens into a hollow outline** (fill → transparent, 2px
  border) and scales up `1 → 1.7`.
- It **rotates 45° → 135°**, so the change reads as a deliberate state flip
  rather than a plain resize.
- A soft `gc-pulse` ring breathes outward on a 1.4s loop.
- The centre dot drops to 45% opacity so the outline is the dominant shape.
- Clicking still punches it back in (`scale: 0.68`).

**How it stays cheap:** the transform (position/scale/rotation) stays in the
single rAF loop, while fill, border and glow live in CSS on a `.is-hover`
class. The class is toggled once per hover change — not once per frame — and
the pulse animates `box-shadow` only, so it never fights the JS transform.
Still zero React re-renders. The pulse is disabled under
`prefers-reduced-motion`.

## 12. Contrast-aware hero social icons

**Cause:** the icons were hardcoded to `var(--color-paper)` with JS hover
handlers. The hero sits on an animated WebGL shader that sweeps between near-
white and near-black, so whenever a dark band passed behind them the icons lost
contrast and effectively vanished.

**Fix:** a new `.social-icon` class gives each icon its own **frosted plate** —
`color-mix(... var(--color-paper) 90%)` plus `backdrop-filter: blur(8px)
saturate(140%)`. The ink glyph is therefore always sitting on its own
contrasting backdrop, whatever the shader is doing behind it. Because the plate
uses theme variables, it flips correctly in dark mode too, and there is a
`@supports not (backdrop-filter)` fallback to a fully opaque plate.

Bonus: this replaced three inline style writes per pointer event (which forced
a style recalc on every hover) with a plain CSS transition, and each icon now
has a proper `aria-label` and a stable React `key` instead of an array index.

---

## Round 3 — WebGL loop, scroll sources, pointer layout reads

> **Measurement status — read this first.**
> These changes were made in a Linux sandbox with **no GPU and no Chrome DevTools**.
> I could not capture Performance traces, FPS numbers, or Lighthouse scores, and
> `npm run build` could not run because the bundled `node_modules` was packed on
> Windows (`@rolldown/binding-win32-x64-msvc` is present, the Linux binding is not).
>
> **Every "expected" figure below is a prediction, not a measurement.** Do not
> treat this section as satisfying the "no change goes in without a measured
> improvement" gate until the before/after traces are attached.
>
> Verified gates that *did* run:
> - `eslint src/` → **58 problems, identical to the pre-change baseline** (0 new).
> - No parse errors in any edited file.

### 3.1 Navbar: removed the second scroll source — `src/components/Navbar.jsx:88-112` (old)

**Wrong:** the component added its own `window.addEventListener('scroll', …)`
with a private rAF throttle, on top of framer-motion's shared `scrollY` (which
Lenis already drives). Inside that handler it called `getBoundingClientRect()`
on up to **six** elements — five nav sections plus the footer — forcing a
synchronous layout on every scroll frame. This is a B1 and a B3 violation in
one place, and it was the only true second rAF source in the app.

**Changed:**
- All navbar scroll state (`isScrolled`, `isScrolledLogo`, `activeSection`,
  `isAtFooter`) now rides the single existing `useMotionValueEvent(scrollY)`.
- Section offsets are measured **once** into `offsetsRef` in document space and
  refreshed on a 150 ms-debounced `resize` plus a `ResizeObserver` on `body`
  (sections mount lazily, so document height keeps changing after first paint).
- Active-section math became `documentTop - scrollY <= 120`, algebraically
  identical to the old `rect.top <= 120` but with zero layout reads.
- Every `setState` is now equality-guarded, so scrolling no longer re-renders
  the navbar on frames where nothing actually changed.
- Theme bootstrap was split into its own `[]` effect. Previously it lived in the
  scroll effect keyed on `[isHome, isGridTransitioning]`, so it tore down and
  re-subscribed the scroll listener whenever either flag flipped.

**Expected:** largest single win in this round. Removes 6 forced layouts per
scroll frame and one redundant rAF driver.

### 3.2 DotShaderBackground — `src/components/DotShaderBackground.jsx`

**Wrong / changed:**
- **B3:** the pointer handler called `getBoundingClientRect()` inside its rAF on
  every cursor frame. Now the box is cached in document space and the viewport
  position is derived with scroll math; refreshed on debounced resize +
  `ResizeObserver`.
- **A9:** the handler allocated `new THREE.Vector2(…)` *and* a `{ uv }` wrapper
  object per pointer frame. Both are hoisted to module scope.
  Safety verified against drei rather than assumed: `TrailTexture.js:145` is
  `onMove = e => trail.addTouch(e.uv)` and `addTouch()` (`:100-103`) copies
  `point.x` / `point.y` into a fresh record. It never retains the vector, so
  reusing one instance is safe.
- **A3:** off-screen `frameloop` went `'demand'` → `'never'`. `'demand'` still
  renders on every `invalidate()`; `'never'` fully parks the loop. Added
  `rootMargin: '200px 0px'` so it resumes just before entering view.
- **A1:** DPR ceiling now derives from the shared GPU tier, and can only lower
  the existing 1.5 cap.
- **A4/A5/A7:** added `<AdaptiveDpr pixelated />`, `<AdaptiveEvents />`,
  `<Preload all />`, and `<PerformanceMonitor bounds={() => [50, 55]}
  flipflops={3} … />` — the 50/55 fps hysteresis the brief asked for, with
  drei's flipflop guard so a marginal GPU can't oscillate between resolutions.
- **A8:** added `stencil: false`, `preserveDrawingBuffer: false`.
- **B5:** `contain: layout paint style` on the canvas wrapper.

### 3.3 ParticleMorph — `src/components/ParticleMorph.jsx:26`

**Wrong:** `antialias: true` on a scene made entirely of soft alpha-blended
point sprites. There are no hard geometry edges for MSAA to resolve, so it was
paying for a multisampled backbuffer that changes nothing visible — and it
directly contradicted the brief's own item A8.

**Changed:** `antialias: false`, plus `powerPreference: 'high-performance'`,
`stencil: false`, `preserveDrawingBuffer: false`. Pixel ratio now also tightens
on low-tier GPUs via `loadGpuTier()`, never rising above the existing 1.25 cap.

### 3.4 PostFX — `src/components/transition/scene/PostFX.jsx:94`

**Wrong:** `offset={new THREE.Vector2(0.0003, 0.0003)}` was constructed inline
in JSX, allocating a new instance on every render. `useFrame` mutates the live
instance through `caRef.current.offset`, so the inline value was never even the
one being animated.

**Changed:** hoisted to a module-level `CA_OFFSET`.

> Note: `ParticleField.jsx:17-18` already hoists its `Object3D` and `Color`.
> The rest of `transition/scene/*` was audited for per-frame allocation and was
> already clean — A9 was largely done before this round.

### 3.5 PortalCanvas — `src/components/transition/PortalCanvas.jsx`

Added `<Preload all />` (A7 — warms shaders during the mount frame so the first
dive frame doesn't pay a compile hitch), `<AdaptiveDpr pixelated />` and
`<AdaptiveEvents />` (A4), and `stencil: false` / `preserveDrawingBuffer: false`
(A8).

### 3.6 New: shared GPU tier — `src/lib/gpuTier.js`

One memoised detection for the whole app, consumed by both r3f canvases and the
hand-rolled renderers. Caps DPR at `min(devicePixelRatio, 2)` always, and at
1.25 on tier ≤ 1. Exposes `particleScale` (0.5 on low tier) which is **wired up
but not yet consumed** — see open items.

`detect-gpu` is imported dynamically and is already on disk as a
`@react-three/drei` dependency, so it adds no new top-level package. **If you
want this to survive a clean `npm install`, add `detect-gpu` to `dependencies`
explicitly** rather than relying on drei's transitive copy.

---

## Round 3 — items deliberately NOT done, and why

- **A2 / A3 / A4 / A5 on three of five canvases.** The brief assumes five r3f
  canvases. Only two are: `DotShaderBackground.jsx:227` and
  `transition/PortalCanvas.jsx:35`. `ParticleMorph.jsx:26`,
  `PrismTypography.jsx:42` and `ShaderBackground.jsx:99` each construct
  `new THREE.WebGLRenderer` by hand with their own rAF loop. `frameloop`,
  `AdaptiveDpr`, `AdaptiveEvents` and `PerformanceMonitor` are r3f/drei
  primitives and cannot be applied to them without porting each to r3f — that is
  a rewrite with real visual-regression risk, not a tweak. **Recommend doing
  this, but as its own scoped task with traces on either side.**
- **D1 / D2 (GLTF, Draco, Meshopt, KTX2) are inapplicable.** There is no `.glb`,
  `.gltf`, or `.ktx2` anywhere in `src/` or `public/`. All 3D here is procedural
  shader work, so there are no model or texture assets to compress.
- **D4 (`import * as THREE` → named imports).** Left alone deliberately. Rollup
  and rolldown both tree-shake namespace imports fine when member access is
  static, which it is in all eight files. Churning ~200 call sites for a likely
  0 KB delta is not worth the regression risk — revisit only if
  `build:analyze` actually shows dead three code in the chunk.
- **A6 (instancing).** `ParticleField` already uses a single instanced draw.
  `ParticleMorph` is a `THREE.Points` cloud with one material, which is already
  the cheap path — converting it to `InstancedBufferGeometry` would likely be
  slower, not faster.
- **PrismTypography `antialias: true` + `preserveDrawingBuffer: true`
  (`:42`).** Both contradict A8 and `preserveDrawingBuffer` in particular is a
  real cost. I did not change them this round because that canvas runs an
  `EffectComposer` with `UnrealBloomPass`, and dropping MSAA there **will**
  visibly alter edge quality on the hero glyph unless an `SMAAPass` is added to
  compensate. That is a visible change, so it needs your sign-off against hard
  constraint #1.
- **`ShaderBackground.jsx:122`** still calls `getBoundingClientRect()` inside
  its `mousemove` handler, and `:104` hardcodes a pixel ratio that never updates
  on resize or monitor change. Same fix pattern as 3.2; not applied yet.
- **C1 (`React.memo` around canvases).** Now much less urgent: the navbar scroll
  flag that was the suspected re-render trigger no longer fires on every frame
  (see 3.1). Worth re-measuring before adding memo boilerplate.

### 3.7 PrismTypography — `src/components/PrismTypography.jsx:42`

This was originally deferred out of Round 3 on the assumption that dropping
MSAA would visibly soften the hero glyph and would need an `SMAAPass` to
compensate. **That assumption was wrong**, and the correction is worth
recording because it inverts the tradeoff.

**Wrong:**

```js
new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true,
                          preserveDrawingBuffer: true, ... })
```

- `antialias: true` was **already a no-op**. The scene is rendered through
  `EffectComposer` (`:318`, drawn via `composer.render()` at `:565`), which
  renders into its own `WebGLRenderTarget`s. The renderer's `antialias` flag
  applies only to the **default framebuffer**, which in this component never
  receives the scene. So it was allocating a multisampled backbuffer that was
  never drawn into — pure VRAM and context cost, zero pixels affected.
- `preserveDrawingBuffer: true` was equally unused. Nothing in the file calls
  `toDataURL`, `toBlob`, or `readPixels` (verified by grep). Its only effect was
  to stop the driver taking the fast-clear path between frames.

**Changed:** `antialias: false`, `preserveDrawingBuffer: false`,
`stencil: false`.

**No `SMAAPass` was added, deliberately.** Since MSAA was never actually
resolving anything on this canvas, edge quality *today* is whatever the
composer's non-multisampled targets produce — and that is exactly what it will
be after this change. Adding SMAA would have *changed* the look (arguably
improved it) at the cost of an extra fullscreen pass, which would violate hard
constraint #1 rather than satisfy it.

**If you ever do want cleaner edges here**, the correct and much cheaper lever
is native multisampling on the composer's own target:

```js
composer.renderTarget1.samples = 4;
composer.renderTarget2.samples = 4;
```

That is real MSAA inside the post chain, not a morphological approximation, and
it costs far less than an added SMAA pass. Treat it as a visual change and get
sign-off before shipping it.

**Expected:** removes one multisampled framebuffer allocation at context
creation and restores fast-clear on every frame of the hero animation. Should
show up as a small, consistent gain in the hero's steady-state frame time and a
lower GPU memory floor — not a headline fps jump.

---

## Round 4 — pointer layout thrash, idle loops, off-screen bloom

> Same measurement caveat as Round 3: no GPU, no DevTools, no build in this
> environment. Deltas below are **predictions, not measurements.**
> Verified gate: `eslint src/` went **58 → 57 problems** (one *fewer*; the dead
> `cx`/`cy` locals in ParticleMorph's `onClick` disappeared). Zero new errors.

### 4.1 ShaderBackground — `src/components/ShaderBackground.jsx:122, 104`

**Wrong:** `onMouseMove` called `container.getBoundingClientRect()` on every
mousemove event — a forced synchronous layout per pointer event. Separately,
`setPixelRatio` was hardcoded and never revisited.

**Changed:** box cached in **document space** (`measureBox()`), refreshed via
the existing `onResize` plus a `ResizeObserver` on the container; viewport
position derived with `box.left - window.scrollX` so scrolling never
invalidates the cache. DPR now starts at the existing 1.25 cap and is lowered
further by `loadGpuTier()` on weak hardware (never raised).

### 4.2 ParticleMorph — `:307, :332, :342, :378`

**Wrong:** **four** handlers (`onMouseMove`, `onTouchStart`, `onTouchMove`,
`onClick`) each called `getBoundingClientRect()` per event.

**Changed:** one shared document-space box + `ResizeObserver`, plus `ndcX()` /
`ndcY()` helpers so all four handlers do pure arithmetic. This also deleted two
now-dead locals, which is why total lint count dropped.

### 4.3 ParticleMorph raycast guard — `:578`

**Wrong:** `_raycaster.setFromCamera()` plus the ray-plane intersection ran on
**every frame**, including when the pointer was nowhere near the canvas.

**Changed:** verified first that `_cursorWorld` is consumed *only* by the
hover-repel term at `:605-607`, then gated the whole raycast behind
`if (isHovering)`. Safe because `hasCursor` stays `false` otherwise, which is
exactly the branch the repel code already handles.

### 4.4 PrismTypography visibility gate — `:565`

**Wrong:** no `IntersectionObserver` at all. This is the single most expensive
loop on the page — `EffectComposer` + `UnrealBloomPass` + instanced updates —
and it kept rendering at full cost the entire time the user read the rest of
the site.

**Changed:** added a visibility observer (`rootMargin: '200px 0px'`) that lets
`renderLoop` return without re-arming when off-screen. **Important detail:** on
resume it calls `globalClock.getDelta()` once and discards the result, so the
accumulated off-screen time doesn't get applied as one huge `dt` and make the
animation jump.

> Expected to be the biggest win of Round 4 for anyone who scrolls past the hero.

### 4.5 GhostCursor idle loop — `:163-167`

**Wrong:** the settle threshold was `0.1px`, below one CSS pixel. Sub-pixel
drift meant `settled` rarely latched — and even when it did, `render()`
re-armed `requestAnimationFrame` unconditionally on its first line, so the loop
never actually stopped. It just early-returned 60 times a second, forever.

**Changed:** threshold raised to `0.5px`, must hold for **3 consecutive frames**
(dead zone against a single jittery frame), and the loop now **truly stops** —
`render()` sets `frame = null` and returns *without* re-arming. A new `wake()`
helper restarts it from every input path (`show`, `mousemove`, `mousedown`, the
click-release timeout, and hover changes). All former `dirty = true` sites now
call `wake()`, so there is no path that dirties state without restarting.

---

## Round 4 — corrections to the review that prompted it

Two items in the incoming report were **already done** and were verified before
any code was touched:

- **"ShaderBackground is missing an IntersectionObserver to park the rAF loop."**
  Incorrect — one exists at `ShaderBackground.jsx:186` and has since before
  Round 3. It cancels the rAF and nulls `animationId` on exit.
- **"ParticleMorph … onPointerMove at line 361."** There is no `onPointerMove`
  in that file. The real offenders were `onMouseMove` (`:307`), `onTouchStart`
  (`:332`), `onTouchMove` (`:342`) and `onClick` (`:378`) — four sites, not one,
  and ParticleMorph already had its own IntersectionObserver at `:276`.

Also noted: **"PostFX `multisampling={0}` already done"** is correct, but that
was pre-existing, not a Round 3 change. Round 3's PostFX fix was hoisting the
per-render `THREE.Vector2` allocation.

## Round 4 — still outstanding

Deliberately **not** attempted, in rough priority order:

1. **Item 5 — ProjectShowcase inline hover → CSS classes.** Legitimate, but it
   touches visual hover states across tags, overlay buttons and nav items. Needs
   a careful pass so the rendered result is pixel-identical (hard constraint #1).
2. **Item 6 — Navbar mobile-menu inline colour writes.** Same class of fix.
3. **Item 4 — Projects auto-rotation.** Wants an IntersectionObserver guard so
   the 4s interval doesn't re-render an off-screen carousel.
4. **Items 2b / 3b — chunked `build()`.** Splitting geometry from instance data
   across frames is the right idea, but `build()` is load-bearing for the intro
   sequence; doing it wrong causes a visible pop. Needs the IntroAnimation
   `formedFlag` coordination described in item 3 to land at the same time.
5. **Item 2c — `isPointOnLogo()` 7x7 kernel.** Runs on *click only*, not per
   frame. Genuinely low priority despite being listed under a P0 heading.
6. **Item 9 — vite.config.js.** `vite-plugin-compression` is a **new
   dependency** (constraint #2) and is likely redundant: Vercel already serves
   brotli at the edge automatically, so the plugin would mostly add build time.
   The `manualChunks` entry for postprocessing and `cssMinify: 'lightningcss'`
   are both reasonable — but **all of it is unverifiable here** because the
   build cannot run.
7. **Items 8 / 11 — preload hints and font self-hosting.** Straightforward and
   safe; both need a real Lighthouse run to confirm they help rather than
   compete for bandwidth with the LCP image.
