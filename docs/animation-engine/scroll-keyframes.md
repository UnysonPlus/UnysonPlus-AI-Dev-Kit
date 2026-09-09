# scroll-keyframes — Scroll Keyframes (Animation Engine)

The builder's **motion timeline**: an element interpolates between a **Start**, an optional **Middle**
and an **End** state (transform / opacity / blur) as you scroll — a mini keyframed scrub. The progress
source is automatic: **inside a Scroll Story** stage it scrubs across THAT scene's beat slice (reusing
the story's published progress), so it plays across the pinned range; **anywhere else** it scrubs as the
element travels the viewport (the shared `upwScrollProgress` helper). **Per-element**: attaches from every
element's **Animations** tab through the **"Add Animation" inserter** (key **`scroll_keyframes`**, category
"Scroll"). Rides the shared frame loop, honours reduce-motion + mobile, and loads only on pages that use
it. Requires the `animation-engine` extension **ACTIVE**. No GSAP.

## Field (Animations → Add Animation → "Scroll Keyframes")

A **popover multi-picker** (picker id `mode`, default `none`) with **two tiles** — so it sits in the
inserter collapsed until added, like every other per-element animation:

- **`keyframes`** — a free **Start → Middle → End** timeline (plays as the element passes the viewport, or across its Scroll Story scene).
- **`pin_choreo`** — **Pin · Hold · Exit**: one-click scroll choreography. The element pins to the screen for a chosen number of scroll-heights, appears, holds, then leaves. It **generates the keyframes for you** (no hand-combining with a Scroll Story).

### Scroll Keyframes (`mode: keyframes`)

Reveals a group (`group_scroll_keyframes`). The **Start / Middle / End** states are a **`tabs` option**
(see `option-types/tabs.md`) stored under `keyframes.states` — each state a tab of the same 8 animatable
props (unprefixed inside its tab; identity defaults, so an unset prop simply doesn't move):

| Param (per state) | Default | Range / step | Notes |
|---|---|---|---|
| `x` | `0` | −300…300, step 5 | translate X (px) |
| `y` | start `40`, else `0` | −300…300, step 5 | translate Y (px) |
| `scale` | `1` | 0…3, step 0.05 | scale |
| `rotation` | `0` | −360…360, step 1 | rotate (deg) |
| `rotationX` | `0` | −180…180, step 1 | rotateX (deg) |
| `rotationY` | `0` | −180…180, step 1 | rotateY (deg) |
| `opacity` | start `0`, else `1` | 0…1, step 0.05 | opacity |
| `blur` | `0` | 0…40, step 1 | blur (px) |

The **Middle** tab adds `enable` (`no` — add a third state), `at` (`50`, 5…95 — where it sits, % of range)
and `ease`; the **End** tab adds `ease`. Ease choices: `linear`, `out` (default), `in`, `inout`, `back`
(Overshoot), `sine`. `run_on_mobile` (`yes`) sits outside the tabs. **Default preset = a fade-up** (Start:
`y 40`, `opacity 0` → End: natural), so enabling it does something useful immediately.

### Pin · Hold · Exit (`mode: pin_choreo`)

The runtime wraps the element in a **sticky runway** of height `pin_length × 100vh` and scrubs a generated
appear → hold → exit across it — one-click scroll choreography for *any* element.

| Param | Default | Choices / range | Notes |
|---|---|---|---|
| `pin_length` | `2` | 1…8 | screen-heights the element stays pinned |
| `pin_from` | `fade` | `fade`/`up`/`down`/`left`/`right`/`scale`/`none` | how it appears as it pins |
| `pin_hold` | `60` | 5…100 | hold until this % of the pin, then exit |
| `pin_to` | `left` | `left`/`right`/`up`/`down`/`fade`/`scale`/`none` (`none` = stay to the end) | how it leaves after the hold |
| `run_on_mobile` | `yes` | switch | run on mobile |

## Value shape

```json
"scroll_keyframes": {
  "mode": "keyframes",
  "keyframes": {
    "states": {
      "start": { "x": 0, "y": 40, "scale": 1, "rotation": 0, "rotationX": 0, "rotationY": 0, "opacity": 0, "blur": 0 },
      "mid":   { "enable": "no", "at": 50, "ease": "out", "x": 0, "y": 0, "scale": 1, "rotation": 0, "rotationX": 0, "rotationY": 0, "opacity": 1, "blur": 0 },
      "end":   { "ease": "out", "x": 0, "y": 0, "scale": 1, "rotation": 0, "rotationX": 0, "rotationY": 0, "opacity": 1, "blur": 0 }
    },
    "run_on_mobile": "yes"
  }
}
```
Pin · Hold · Exit stores instead:
```json
"scroll_keyframes": {
  "mode": "pin_choreo",
  "pin_choreo": { "pin_length": 2, "pin_from": "fade", "pin_hold": 60, "pin_to": "left", "run_on_mobile": "yes" }
}
```

`mode: "none"` (the default) = not added. The Middle-tab props are ignored unless `states.mid.enable` is `"yes"`.

## What it emits / how it runs

- When active (and the start state actually differs from the end, or a middle keyframe is enabled), the
  element wrapper gains the class **`sc-scroll-kf`** plus **`data-upw-skf`** = base64-encoded JSON
  `{ "kf": [ { "at", "v": { x, y, scale, rotation, rotationX, rotationY, opacity, blur }, "ease" }, … ] }`
  — a `start` keyframe at `at:0`, an optional `mid` at `mid_at/100`, and an `end` at `at:1`. When
  `run_on_mobile` is `no`, `data-upw-skf-mobile="0"` is also stamped. A wrapper is forced to exist
  (`sc_needs_wrapper`) when Scroll Keyframes is the only non-default animation setting.
- **Pin · Hold · Exit** (`mode: pin_choreo`) bakes an appear → hold → exit keyframe set the same way, plus
  the class **`sc-scroll-kf--pin`** and **`data-upw-skf-pin="<pin_length>"`**. The runtime then wraps the
  element in a `position:sticky` runway of that many screen-heights and drives progress from the runway
  (`pinProgress`) instead of viewport travel — so the element enters, holds, and exits as you scroll the pin.
- **Nothing is stamped** when there's no middle keyframe and the Start state equals the End state (no
  motion to run).
- Runtime (`static/js/scroll-keyframes.js`) enqueues **only on pages that render at least one** such
  element (flagged in `wp_footer`). It rides the shared frame scheduler (`window.upwAnimRaf` +
  `upwScrollProgress` + `upwReduceMotion` + `upwIsMobile`) and interpolates the transform/opacity/blur
  between keyframes per the element's scroll progress. Honours reduced motion (config
  `window.upwSkfCfg.reducedMotion`, from Theme Settings → Animation Engine → *Respect reduced motion*).
- **Global master switch:** Theme Settings option `animation_scroll_keyframes` `{ enable: 'yes'|'no' }`
  (defaults to enabled, like every module).
