# Animation Engine — effects by module

> 📖 **Human manual (live, always current):** [Animation Engine on the UnysonPlus docs](https://unysonplus.github.io/animation-engine) — module pages with live playgrounds. These kit files are the AI-optimized reference; the live manual is the human companion.

The `animation-engine` extension adds motion to elements/sections/site. **It ships INACTIVE** —
activate it in Unyson+ → Extensions before any of this renders. One file per module here; open the
one you need.

Most effects ride the shared **`fx` block** on a page-builder node (see `../shortcodes/README.md`):
a slot goes from `{effect:'none'}` to `{ <pickerKey>:'<name>', '<name>':{…params…} }`. The picker
key is usually `effect`, but some modules use `mode` or `role` (noted per file).

## fx-slot → module map (node-level)

| fx slot | picker key | module(s) |
|---|---|---|
| `gsap_motion` | `effect` | `scroll-motion.md` |
| `interaction`, `interaction__2..4` | `effect` | `hover.md` (spotlight/lift/shine/glow/tilt/magnet/border) |
| `text_effect` | `effect` | `text-effects.md` (shimmer/gradient/typewriter/scramble/wave/split/reveal/glitch) |
| `parallax` | `role` | `parallax.md` |
| `physics` | `effect` | `physics.md` |
| `marquee` | `effect` | `marquee.md` |
| `motion_path` | — | `motion-path.md` |
| `flip_card` | — | `flip-card.md` |
| `scroll_reveal` | `mode` | `scroll-reveal.md` |
| `scroll_text_highlight` | `mode` | `scroll-text-highlight.md` |
| `scrollytelling` / `sticky_stack` / `motion_sequence` | `mode` | `scrollytelling.md`, `sticky-stack.md`, `motion-sequence.md` (Section only) |

## Not on the fx block (configured elsewhere — see each file)

| module | where |
|---|---|
| `backgrounds.md` | element **Styling tab** → `bg_effect` |
| `confetti.md` | Section/element **Animations tab** → `confetti` |
| `horizontal-scroll.md`, `scroll-color-shift.md`, `scroll-loop.md` | **Section** options (Animations) |
| `cursor.md`, `page-transitions.md`, `preloader.md`, `scroll-progress.md` | **Theme Settings** (Site-wide UX / Animations) |

## All modules
`backgrounds` · `confetti` · `cursor` · `flip-card` · `horizontal-scroll` · `hover` · `marquee` ·
`motion-path` · `motion-sequence` · `page-transitions` · `parallax` · `physics` · `preloader` · `scroll-color-shift` ·
`scroll-keyframes` · `scroll-loop` · `scroll-motion` · `scroll-progress` · `scroll-reveal` · `scroll-text-highlight` ·
`scroll-var` · `scrollytelling` · `smooth-scroll` · `sticky-stack` · `text-effects` · `viewport-units`

Extension overview: `../extensions/animation-engine.md`. AE shortcodes (gallery-3d, image-sequence,
model-viewer, svg-draw, svg-morph, webgl-object) live in `../shortcodes/`.
