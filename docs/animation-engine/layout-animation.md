<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# layout-animation — Layout Animation (Animation Engine)

Per-element / column / section card (`upw_layout`, Animations tab). When the layout inside the node changes, its
items glide from their old places to their new ones; optionally the node's own height glides. Roadmap 6d.

## Value shape
```json
"upw_layout": { "mode": "on", "on": { "what": "items", "items": ".card", "duration": 0.45, "ease": "soft_land", "enter": "yes" } }
```

## Params
| key | type | default | notes |
|---|---|---|---|
| `what` | select | `items` | `items` (children glide) · `height` (its own height glides) · `both` |
| `items` | text | `''` | CSS selector inside the node; empty = the children of the first descendant level with 2+ children (single-child wrappers are walked down, up to 8 levels) |
| `duration` | slider s | `0.45` | 0.1–1.5 |
| `ease` | `easing-picker` | `soft_land` | any shared easing key or a custom `cubic-bezier(…)` (compiled with `upw_interactions_ease_css`) |
| `enter` | switch | `yes` | newly visible items fade (opacity, replaced) and grow from 0.92 (additive) |

## How it renders
- PHP (`modules/layout-animation/layout-animation.php`): `upw_layout_compile()` → `data-upw-layout='{"w","q","d","e","n"}'`
  on the wrapper; forces a wrapper; enqueues `static/js/upw-layout.js` through the shared loader (module
  `layout-animation`, style `on`, cfg `window.upwLayoutCfg.reducedMotion`).
- JS: positions = the offset chain (transform-free), kept RELATIVE to the node. A MutationObserver (childList,
  subtree, `class` / `hidden` / `open` / `aria-expanded`) and a ResizeObserver (the node + each item) feed ONE global
  scheduler that runs in a microtask (after layout, before paint), innermost nodes first. Moved items get
  `translate(dx,dy) → 0` with `composite: 'add'`; an item mid-glide restarts from its on-screen rect. Height: WAAPI
  `height: from → natural` with `overflow: hidden`, the node marked `data-upw-layout-busy` meanwhile; an ancestor
  layout node only re-measures while a descendant is busy (it follows the reflow), and the node's own RO entries are
  ignored while its height anim runs (they are its own frames). Re-measure without animating on window resize, before
  `document.readyState === 'complete'`, and under reduced motion. `window.upwLayout.init(root)` for late markup.

## Gotchas
- Pair with Interactions **Set** steps (show / hide / class) for filters and accordions; give a hide/show step
  **stagger 0**, otherwise the reverse (mirrored stagger) brings the first item back last.
- Inline-style-only changes are caught only through the size changes they cause (RO); a move with no resize and no
  class change is invisible to it.
- Demo: `/animation-engine/interactions/` → *Layout Animation* (`build-engine-demos.mjs` → `layoutDemo`).
