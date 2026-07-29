# motion-sequence — Motion Sequence (Animation Engine)

Choreography **without code**. Turn a Section into a Motion Sequence and its child elements' Scroll
Motion **Reveal / Stagger** animations play as ONE `gsap.timeline()` on a single trigger, in
document order — instead of each firing independently as it scrolls into view. The timeline concept
translated into a builder option: the *steps are the children*, and one **Overlap** knob tunes how
they flow one into the next. Rides the Section's **`fx.motion_sequence`** slot (picker key **`mode`**;
"off" value `off`). **Section only** — injected into the Section's Animations tab (inside the
animation-stack organizer). Requires the **animation-engine extension ACTIVE**; global on/off in
Theme Settings → Animations → Effects.

## How to use

1. Give the Section's children (heading, text, button, cards…) a **Scroll Motion → Reveal** (or
   Stagger) each — Animations tab on every child.
2. On the **Section's** Animations tab, set **Motion Sequence → On**.
3. The children now play as one sequence when the Section scrolls in (or scrub through them).

Other Scroll Motion effects inside the Section (parallax, pin, scrub, the one-shots) keep firing
independently — only Reveal/Stagger are choreographed into the timeline.

## Value shape

```json
"motion_sequence": { "mode": "sequence", "sequence": {
  "trigger": "view",       // "view" (play once) | "scrub" (scrub with scroll, pins the Section)
  "overlap": 0.35,         // seconds each step starts BEFORE the previous ends (0 = strictly sequential)
  "start": "top 80%",      // ScrollTrigger start (view only)
  "run_on_mobile": "yes"   // "no" → children animate independently on phones (lighter fallback)
} }
```

`{ "mode": "off" }` (or omitting it) stamps nothing — the children animate independently, exactly as
before.

## Params

| Param | Type | Default | Notes |
|---|---|---|---|
| `trigger` | select | `'view'` | `view` = one ScrollTrigger with toggleActions; `scrub` = `scrub:true` + the Section pins. |
| `overlap` | slider | `0.35` (0–1.5) | Position of each step = `">-<overlap>"` — that many seconds before the previous tween ends. |
| `start` | select | `'top 80%'` | `top 85%` / `top 100%` / `top 80%` / `top center`. View trigger only. |
| `run_on_mobile` | switch | `'yes'` | `no` → the sequence is skipped < 768px and children fall back to standalone. |

## Notes

- **Reuses the Scroll Motion runtime** (`upw-gsap.js`) — no separate front-end asset. The controller
  runs before the standard scan, **claims** its Reveal/Stagger steps (so they don't self-trigger),
  and assembles them with the runtime's own `compound()` config builder — so a step looks identical
  whether it's standalone or sequenced (same direction/distance/style/ease, incl. the Advanced ease).
- Steps are collected in **document order** (DOM order = builder order).
- **Per-element position (v1.2.44):** each Reveal/Stagger child has an "In a Motion Sequence" option
  (`gsap_motion.<effect>.seq_pos`): `after` (default — plays in turn using the Section's Overlap) or
  `with` (starts at `"<"`, the previous step's start, so a pair enters together). Stamped as
  `data-upw-seq-pos="with"`; ignored outside a sequence.
- Honours "reduce motion" (via the shared runtime) and the mobile opt-out.
