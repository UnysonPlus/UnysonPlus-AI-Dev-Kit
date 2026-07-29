# smooth-scroll — Smooth (Inertia) Scroll (Animation Engine)

Site-wide momentum wheel/trackpad smoothing (powered by **Lenis**) across the whole page. A
**page-level behavior**, configured in **Theme Settings → Animations → Smooth Scroll** (its own tab) —
NOT a per-element or per-section effect, so it has no node `fx` slot and no Animations-tab field.
Distinct from the theme's "Smooth Scroll for Anchor Links" (a CSS `scroll-behavior` toggle that only
eases jumps to `#anchors`); this adds real inertial smoothing to ordinary scrolling. Requires the
`animation-engine` extension to be **ACTIVE**.

## Enable

Theme Settings → Animations → **Smooth Scroll** → *Smooth (inertia) scrolling* switch (default
**off**). Front end only; automatically disabled for visitors who prefer reduced motion.

## Settings

| Setting | Key | Default | Notes |
|---|---|---|---|
| Smooth (inertia) scrolling | `animation_smoothscroll.enable` | `no` | master on/off (switch) |
| Smoothness | `ss_smoothness` | `50` | 0 = snappy (near-native) … 100 = floaty; maps to Lenis `lerp` 0.14 → 0.04 |
| Scroll speed (%) | `ss_speed` | `100` | wheel travel per notch, 50–200; maps to Lenis `wheelMultiplier` 0.5 → 2.0 |
| Enable on touch devices | `ss_touch` | `no` | phones/tablets keep native scroll unless on (switch) |

## Notes

- **Single Lenis instance.** Shares the `window.__upwLenis` singleton with the Scroll Loop module —
  whichever boots first owns the one instance; enabling both never spawns two. The vendored Lenis lib
  loads once under the shared `upw-lenis` script handle. Config is passed as `window.upwSmoothScrollCfg`.
- **Drive bridge.** When GSAP is present its ticker drives `lenis.raf` and
  `lenis.on('scroll', ScrollTrigger.update)` keeps ScrollTrigger in lockstep (Scroll Motion pages stay
  synced); otherwise a private rAF loop drives it (flagged once by `window.__upwLenisBridged`).
- **Scrollytelling Stage rides it for free.** Lenis moves the *real* scroll position, so pinned Stages
  and scroll-scrubbed effects — which read `getBoundingClientRect()` each frame — follow the smoothed
  scroll automatically; programmatic scene jumps route through `__upwLenis.scrollTo`.
- **Bails to native scroll** for reduced-motion visitors, on touch devices unless opted in, and if the
  Lenis library is missing.
