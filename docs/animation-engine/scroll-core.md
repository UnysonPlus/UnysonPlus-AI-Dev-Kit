<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# scroll-core — the Animation Engine's scroll core (`upwScroll`, `upwSplit`)

The engine's own scroll motion core, in place of GSAP + ScrollTrigger + SplitText since Animation Engine 1.5.34
(Roadmap Phase 9; decision "leave-gsap-for-our-own-scroll-core"). Public docs: `/animation-engine/scroll-core`.

## Files and handles

| File | Global | Handle | Size (gz) |
| --- | --- | --- | --- |
| `framework/extensions/animation-engine/static/js/upw-scroll.js` | `window.upwScroll` | `upw-scroll-core` (depends on `upw-anim-raf`) | ~6.4 KB |
| `framework/extensions/animation-engine/static/js/upw-split.js` | `window.upwSplit` | `upw-split` | ~1 KB |

PHP: `upw_anim_scroll_handle()` registers + enqueues the core and returns its handle; `upw_anim_scroll_handle( true )`
also enqueues the splitter and returns `upw-split` (`includes/asset-loader.php`).

## What runs on it

- Scroll Motion (`modules/scroll-motion/static/js/upw-gsap.js`, handle `upw-gsap-init`): every effect + Motion Sequence.
- Motion Gallery choreography + chaining (`shortcodes/gallery-3d/static/js/gallery-3d.js`; `static.php` adds the core
  as a dependency for `scroll_choreography` or `chain = yes`).
- Scroll Ruler + Scroll Timeline read `upwScroll.getAll()` (and `ScrollTrigger.getAll()` when GSAP is present).
- **Still GSAP:** only a Scroll Motion `custom` effect (Motion Snippet: the author's GSAP code, run as
  `new Function('el','tl','gsap', code)`); GSAP + ScrollTrigger are enqueued only when `sc_gsap_used()` has `custom`.

## API (GSAP-shaped on purpose)

- `upwScroll.create(vars)`: `trigger`, `start` / `end` ("<element edge> <viewport edge>", edges `top|center|bottom|N%|Npx`;
  end may be `+=N%` of the viewport or `+=Npx`; a number or a function returning px also works), `scrub` (`true` or
  seconds of smoothing), `pin` (`true` or an element), `pinSpacing`, `once`, `toggleActions`, `animation`,
  `onEnter/onLeave/onEnterBack/onLeaveBack/onToggle/onUpdate`, `markers`. Trigger: `start`, `end` (px), `progress`,
  `direction`, `isActive`, `vars` (mutable; `refresh()` re-reads them, which is how timing overrides work),
  `getVelocity()`, `refresh()`, `kill()`.
- `upwScroll.tween(targets, from, to)`: Web Animations per target; `to.duration/delay/ease/stagger/onComplete/paused/keep/scrollTrigger`.
  Controller: `play/reverse/restart/pause/resume/reset/complete/progress(p)/kill`, `.duration` (s, incl. stagger).
  A tween whose `to` is the element's natural look removes itself when it finishes forward (`keep: true` keeps it).
- `upwScroll.value({ target, to, duration, ease, onUpdate, onComplete, scrollTrigger })`: plain-number tween on the frame loop.
- `upwScroll.timeline({ scrollTrigger, onComplete, onUpdate })`: `tl.fromTo(targets, from, to, pos)` / `tl.add(child, pos)`;
  pos = seconds | `'<'` | `'>'` | `'>-0.3'` | `'<+0.2'`. `tl.duration` is a number.
- `upwScroll.set(targets, values)`, `upwScroll.ease(name)` (GSAP-style names + CSS timing functions → fn),
  `upwScroll.cssEase(name)` (→ `linear(...)` string), `getAll()`, `refresh()`, `update()`, `kill()`, `velocity()`.
- Animatable: `x y z` (px) `xPercent yPercent scale scaleX scaleY rotation rotationX rotationY skewX skewY
  transformPerspective opacity blur`, and any CSS property by camelCase name.
- `upwSplit(el, { type: 'chars'|'words'|'lines', linesClass, onSplit })` → `{ chars, words, lines, revert() }`. Keeps
  inline markup and an `aria-label`; lines are regrouped only for plain text (callers fall back to words).

## One easing set (`window.upwEase`, Phase 11a, Animation Engine 1.5.35)

`static/js/upw-raf.js` (handle `upw-anim-raf`) holds the engine's ONE set of curves: `upwEase(str)` → 0..1 fn, cached,
`null` when unknown. Accepts named curves (`none`, `power1-4` / `quad cubic quart quint strong`, `sine`, `expo`, `circ`,
`back(s)`, `elastic(a,p)`, `bounce`; `.in` / `.out` default / `.inOut`) and CSS curves (`ease*` keywords,
`cubic-bezier()`, `steps()`, `linear()` = springs). Users: `upwScroll.ease()` (delegates; unknown → `power2.out`),
Page Timelines (`upw-timeline` now depends on `upw-anim-raf`), Scroll Keyframes (`out/in/inout` = `power2.*`, `back` =
`back.out(1.70158)`, `sine` = `sine.inOut`), scroll choreography (`fw-scroll-choreo-engine` depends on it; `in/out/in-out`
= `power1.*`). **Never add a private curve table to a module: map its names onto `upwEase`.** Test:
`pw-screens/_eases.mjs` (old formulas vs. the shared set, src + min). Remaining Phase 11 steps (one frame loop, one
in-view trigger, one tween player): `/animation-engine/roadmap#phase-11`.

## The motion core (Phase 11, Animation Engine 1.5.36): use it, never a private copy

`static/js/upw-raf.js` (handle `upw-anim-raf`, `upw_anim_raf_handle()`; module asset-loader arg `'needs_raf' => true`)
is the ONE runtime every module shares. Public docs: `/animation-engine/motion-core`.

- **Frame loop** `upwAnimRaf.add(fn)` / `.remove(fn)`; `fn(timestamp)`, return `false` to unsubscribe. One rAF for the
  page, paused while the tab is hidden (cap your dt), subscribers newest-first, a throwing subscriber is dropped.
  `upwAnimRaf.scrollY` / `.vh` are read once at the top of each frame: read those, not the window. Adding / removing
  (self or others) mid-frame is safe (snapshot + remove by identity; `add()` during a tick never schedules an extra frame).
  A scroll throttle = a one-shot subscriber (a fn that returns false). Keep a plain `requestAnimationFrame` only for a
  one-frame layout wait.
- **In view** `var off = upwInView(el, cb(inView, entry), { threshold, rootMargin, once, root })`. One
  IntersectionObserver per threshold+rootMargin for the whole page. `cb` runs with the CURRENT state first (often
  `false`): never treat that first false as "left the view". No IntersectionObserver → `cb(true, null)`.
- **Curves** `upwEase(str)` (see above). **Progress** `upwScrollProgress(el)` (0 entering bottom → 1 leaving top) or
  `upwScrollProgress(wrap, { pin: true, stageH, align })`. Never assign to `window.upwScrollProgress` (it is the helper;
  the Custom scroll-progress style exposes the page value as `upwScrollProgress.value`).
- **Exceptions, on purpose:** Smooth Scroll and Scroll Loop drive Lenis on their own rAF (on the shared loop the others
  read scrollY up to 277 px stale); Viewport Units keeps a dependency-free resize throttle. The Motion Gallery funnels
  its many per-design frame calls through ONE persistent subscriber that drains a queue.
- Tests: `pw-screens/_inview.mjs`, `_raf-edge.mjs`, `_rafdup.mjs`, `_cursor-load.mjs`, `_p11-sweep.mjs [base]` (every demo
  page: errors + shared helpers present).

## Gotchas

- Pinning = `position: fixed` inside an `.upw-pin-spacer` (height = element + pin distance). A transformed / filtered /
  perspective ancestor breaks fixed positioning (same as GSAP).
- One `transform` per element: two tweens moving the same element do not add up.
- Two tweens on the same property of one element: the later Web Animation wins. Do not split one property across two
  tweens (e.g. pin fade in Scroll Motion is one onUpdate trigger, not two opacity tweens).
- Frame step is capped at 50 ms, so a smoothed scrub never jumps after the tab was idle.
- Tests: `pw-screens/_scrollcore.mjs` (22 checks on a plain page), `_sm-effects.mjs` (effects not on the demos),
  `_sm-core.mjs <url>` (a real page scrolled top to bottom), `_chain.mjs` (chained galleries).
