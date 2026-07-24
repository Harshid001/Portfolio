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
