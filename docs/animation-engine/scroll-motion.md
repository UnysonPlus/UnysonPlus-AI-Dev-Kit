# scroll-motion — Scroll Motion (Animation Engine)

GSAP entrance + scroll-scrubbed motion on any page-builder node (section, column, leaf). Rides the
node `fx` **`gsap_motion`** slot (picker key `effect`, off = `none`). Requires the `animation-engine`
extension to be **ACTIVE** — the `fx` block is always present, but effects are ignored when inactive.

## Effects / styles

Grouped in the picker: **Reveal & Wipe** — `reveal` · `clip` · `mask_wipe` · `blur` · `expand` ·
`zoom`. **3D & Rotate** — `flip` · `rotate` · `scroll_spin` · `tilt_scrub` · `skew`. **Scrub &
Parallax** — `scrub` · `parallax` · `pin` · `velocity_skew` · `color_scrub`. **Text & Count** —
`counter` · `splittext` · `stagger`.

Shared **timing tail** on entrance effects: `delay` (0), `start` (`top 85%`), `once` (`yes`),
`run_on_mobile` (`yes`). Shared `style` presets: `subtle`/`standard`/`dramatic`/`bounce`/`elastic`.
Shared 9-way `direction`: `up`/`down`/`left`/`right`/`up_left`/`up_right`/`down_left`/`down_right`/`none`.

## Value shape

```json
"gsap_motion": { "effect": "reveal", "reveal": {
  "direction": "up", "style": "standard", "distance": 50,
  "delay": 0, "start": "top 85%", "once": "yes", "run_on_mobile": "yes" } }
```

## Advanced tier (power users)

`reveal` · `stagger` · `parallax` · `pin` · `scrub` additionally expose an **inline multi-picker**
`advanced` that collapses to a single "Default" row. Value shape:

```json
"advanced": { "mode": "custom", "custom": {
  "ease": "expo.out",          // curated GSAP ease, or "custom" → use ease_custom
  "ease_custom": "",           // free-text GSAP ease; regex-validated, invalid = ignored
  "scrub_smooth": 0.4,         // scrub-family only. 0 = scrub:true; >0 = scrub:<seconds>
  "markers": "no"              // ScrollTrigger markers; only stamped for edit_theme_options users
} }
```

`{"mode":"default"}` (or omitting `advanced` entirely) stamps **nothing** — identical rendering to
pre-1.2.38 saves. Curated eases: `none` `power1.out` `power2.out` `power3.out` `expo.out`
`back.out(1.7)` `elastic.out(1,0.5)` `circ.out` `sine.inOut`.

**In a Motion Sequence (v1.2.44).** `reveal` and `stagger` also carry a `seq_pos` select
(`gsap_motion.<effect>.seq_pos`): `after` (default) or `with`. It only matters when the element's
parent Section is a **Motion Sequence** (see `motion-sequence.md`) — `with` starts the step at the
previous step's start (`"<"`) so a pair enters together; `after` plays in turn using the Section's
Overlap. Ignored outside a sequence.

Those same five effects also carry a **read-only "Show generated GSAP" panel** (v1.2.39) — a
`gsap-code-preview` option type that prints the actual GSAP the current settings generate and updates
live. Value-less (stores nothing); it's a learning/teaching aid, not part of the saved value shape.

## Motion Snippet — the `custom` effect (v1.2.41)

A **Custom Code** effect (`effect: "custom"`) turns the element into author-written GSAP. Value shape:

```json
"gsap_motion": { "effect": "custom", "custom": {
  "code": "tl.from(el, { y: 60, opacity: 0 }).from(el.querySelectorAll('.card'), { scale: 0.8, stagger: 0.1 }, '<')"
} }
```

The runtime runs the code as `new Function('el','tl','gsap', code)`, where **`el`** = this element,
**`tl`** = a `gsap.timeline()` already tied to `scrollTrigger:{trigger:el, start:'top 80%'}`, and
**`gsap`** is the library. Add tweens to `tl` (they choreograph) or use `gsap` for your own triggers.

**Security (execution gate, not a UI gate):** the code is base64-stamped into post_content as
`data-upw-snip` and only *executes* when the page author has `unfiltered_html` (a per-request footer
flag `window.upwSnippetsOK`). The `custom` choice is always offered (gating the choice made the saved
value fragile — it got reset by `json_to_shortcodes` re-validation); safety is entirely at execution.
Honours reduce-motion (skipped). It's the lossless fallback: styling → Custom CSS, motion → Motion Snippet.

## Params (per effect; key = default)

| Effect | Params |
|---|---|
| `reveal` | `direction` up, `style` standard, `distance` 50 + timing tail |
| `stagger` | `scope` auto `[auto/direct]`, `direction` up, `style` standard, `distance` 50, `stagger_each` 0.12, `stagger_from` start `[start/end/center/edges]` + `delay`/`start`/`run_on_mobile` |
| `splittext` | `split_by` chars `[chars/words/lines]`, `target` headings `[headings/paragraphs/all]`, `style` standard, `split_anim` slide `[slide/flip3d/scale/blur/rotate/random]`, `stagger_each` 0.03, `direction` up `[up/down]`, `start` top 85%, `run_on_mobile` yes |
| `parallax` | `axis` vertical `[vertical/horizontal]`, `speed` 20, `pmotion` none `[none/rotate/scale]`, `pfade` no, `run_on_mobile` no |
| `pin` | `pin_length` 100, `pin_fade` no, `run_on_mobile` no |
| `scrub` | `scrub_kind` fade `[fade/scale/rotate/slide/blur/skew]`, `intensity` 20, `start` top 85%, `run_on_mobile` yes |
| `zoom` | `zdir` in `[in/out]`, `scale` 0.6 + timing tail |
| `rotate` | `rotate` 8, `direction` left `[left=CCW/right=CW]` + timing tail |
| `blur` | `blur` 12 + timing tail |
| `skew` | `axis` vertical `[vertical/horizontal]`, `skew` 8, `distance` 40 + timing tail |
| `flip` | `axis` y `[y/x]`, `direction` left `[left/right]`, `deg` 90 + timing tail |
| `expand` | `axis` x `[x/y]`, `origin` left `[left/center/right/top/bottom]` + timing tail |
| `clip` | `direction` up `[up/down/left/right/iris/diagonal/rounded]` + timing tail |
| `mask_wipe` | `direction` left `[left/right/up/down]`, `soft` 25 + timing tail |
| `counter` | `cstyle` count `[count/odometer]`, `duration` 2, `from` 0, `prefix` "", `suffix` "", `sep` no, `start` top 85%, `once` yes, `run_on_mobile` yes |
| `velocity_skew` | `max` 20, `axis` y `[y/x]`, `run_on_mobile` no *(no tail)* |
| `tilt_scrub` | `axis` y `[y/x]`, `deg` 12, `run_on_mobile` no *(no tail)* |
| `scroll_spin` | `turns` 1, `dir` cw `[cw/ccw]`, `run_on_mobile` yes *(no tail)* |
| `color_scrub` | `ctarget` text `[text/bg]`, **`c1` COLOR** `#888888`, **`c2` COLOR** `#2f74e6`, `run_on_mobile` yes *(no tail)* |

## Notes

- Powered by GSAP + ScrollTrigger (+ SplitText for `splittext`); enqueued only when a `gsap_motion`
  effect actually renders. Independent of the core Entrance (Animate.css) animation.
- Sub-options live under `gsap_motion.choices[<effect>]` inside a `group_gsap_<effect>` wrapper
  (container id only — not stored); switching effects never loses the others' values.
- `counter` goes on a text/number node. `color_scrub` COLORs use the compact `{predefined,custom}`
  shape. The runtime overwrites the node `transform`, so a scroll-motion effect and a physics/parallax
  transform on the SAME element don't compose.
