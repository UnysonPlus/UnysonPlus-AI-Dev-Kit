<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# interactions — Interactions (Animation Engine)

A trigger on one node plays up to **3 steps**, and each step animates a target: the node itself, nodes inside it that match a selector, or nodes anywhere on the page that match a selector. This is roadmap **I1 · Targets** (hover a card → lift it + zoom its image + slide its arrow; click → open a panel; scrolled past → change the header). The card goes on the element's Animations tab, slot **`upw_interactions`**, and is **multi** (`upw_interactions`, `upw_interactions__2`). Requires the `animation-engine` extension. Runtime: Web Animations API, no library; loads only on pages that use it.

Use this instead of adding one-off "animate another element" options to other modules.

## Value shape
```json
"upw_interactions": { "mode": "hover", "hover": { "steps": {
  "s1": { "target": "self", "selector": "", "direction": "to", "x": 0, "y": -10, "scale": 1, "rotate": 0, "opacity": 1, "blur": 0, "duration": 0.35, "delay": 0, "ease": "out", "stagger": 0.08, "start": "after" },
  "s2": { "target": "inside", "selector": ".ix-img", "direction": "to", "scale": 1.12, "duration": 0.6, "start": "with", "…": "…" },
  "s3": { "target": "none" } } } }
```
`mode`: `off` · `hover` · `click` · `load` · `view` · `past`. The value lives under the key that matches the mode.

| mode extra | values | default |
|---|---|---|
| `click.again` | `reverse` (toggle) · `replay` · `none` (once) | `reverse` |
| `view.leave` | `reverse` (plays again next time) · `keep` | `reverse` |
| `past.offset` | px from the top of the screen that the node's **bottom** must pass | `80` |

## Devices and reuse (roadmap I5) — on every trigger's options
| key | values | compiled |
|---|---|---|
| `devices` | checkboxes `{desktop, tablet, phone}` (all `true` by default) | `dev: ['d','t','p']` subset, only when not all three; none ticked = the interaction is dropped |
| `amount_tablet`, `amount_phone` | slider % (0–200, default 100) | `amt: { t: 0.6, p: 0.4 }`, only the ones ≠ 100. `valuesOf(s, a)` scales x / y / rotate / blur by `a`, scale as `1 + (sc − 1)·a`, and opacity as `1 − (1 − op)·a`. `wire()` rebuilds the group when the device's amount changes (`g.k`) |
| `scope` | `self` · `matches` | with `matches` + `scope_selector` (`.card`) → `on: '.card'` |
| `scope_selector` | CSS selector | |

Runtime: `wire()` resolves through `G()`. It builds the animation group only while one of the device `matchMedia` queries matches (phone `max-width: 767.98px`, tablet `768–991.98px`, desktop `min-width: 992px`, the same as the builder's `hide-xs/sm/md`), and tears it down (`a.cancel()`, timers cleared) when it stops matching. Crossing a breakpoint rebuilds it; a `load` interaction plays then and `past` re-checks. `wireAll()`: with `on`, every `document.querySelectorAll(on)` match gets its own `wire()`, so `self` / `inside` refer to that match (deduped per element + interaction object).

### Site-wide (`sitewide: 'yes'`, compiled `site: 1`; needs `scope: matches` + a selector)
`includes/interactions-sitewide.php`:
- **Collect:** `upw_ix_sitewide_collect($post_id)` runs on `added_post_meta` / `updated_post_meta` for `fw:opt:ext:pb:page-builder:json` (the backend builder, the Live Editor and the importers all write it). It walks the tree for compiled interactions with `site` + `on` and stores them in the option `upw_ix_sitewide` (`post_id => [cfg + src]`). `deleted_post` drops them.
- **Serve:** `upw_ix_sitewide_for_request()` returns every published source except the current singular post (its own markup already carries them). `wp` marks the asset as used (`upw_anim_use_asset('interactions','site')`), and `wp_footer:1` prints `window.upwIxSite=[…]`.
- **Runtime:** `init()` (document only) calls `wireAll(null, ix)` for each entry.
- **Admin:** a Theme Settings tab via `upw_anim_engine_module_tabs` → `interactions` (read-only table: selector, trigger, source page, Live Editor / Builder links).
- Switching it off and saving removes the entry.

## Step params (`s1`–`s3`)
| key | type | default | notes |
|---|---|---|---|
| `target` | select | s1 `self`, s2/s3 `none` | `self` · `inside` · `page` · `none` (s2/s3 only = unused) |
| `selector` | text | `''` | CSS selector. `inside` + empty = the node's direct children; `page` + empty = the step is skipped. `{}<>;\` are stripped |
| `direction` | select | `to` | `to`: current look → values; `from`: values → current look (a reveal; before the trigger the target waits at the values) |
| `x`, `y` | slider px | 0 | −600…600 (`translate`) |
| `scale` | slider | 1 | 0…3 (`scale`) |
| `rotate` | slider deg | 0 | −360…360 (`rotate`) |
| `opacity` | slider | 1 | 0…1 |
| `blur` | slider px | 0 | 0…30 (`filter: blur()`) |
| `duration`, `delay` | slider s | 0.5, 0 | |
| `ease` | select | `out` | `out` · `inout` · `in` · `back` (overshoot) · `linear` |
| `stagger` | slider s | 0.08 | gap between several matched targets |
| `start` | select | `after` | `after` the previous step · `with` it |

Each trigger's step 1 has its own defaults: hover = lift (y −8), click = pop (scale 1.06, back), load/view = reveal (`from`, y 30/40, opacity 0), past = page `header` scale 0.96.

## How it renders
- PHP (`modules/interactions/includes/`): `upw_interactions_compile()` reduces each instance to a compact config, and `sc_build_wrapper_attr` emits `data-upw-ix='[{"t":"hover","s":[{"tg","q","dir","x","y","sc","r","op","bl","d","dl","st","e","w"}…]}]'`. Interactions force a wrapper (`sc_needs_wrapper`). Assets go through the shared loader as module `interactions` (`static/js/upw-interactions.js`, cfg `window.upwIxCfg.reducedMotion`).
- JS: one group of WAAPI animations per interaction, built at init and paused at time 0, so `from` targets show their start values straight away. Keyframes are partial (only the end for `to`, only the start for `from`), so they start from or return to the target's underlying look, including other effects. Every animation in a group gets the same end time (padded with `endDelay`), so `reverse` mirrors the whole sequence and an interrupted hover reverses from where it was. The individual `translate`/`scale`/`rotate` properties compose with the target's `transform`. Under reduced motion all timings are 0, so steps jump. It does nothing on the Live Editor's Edit canvas (`window.upwEditCanvas`). `window.upwIx.init(root)` wires nodes added later.

## States (`upw_states`, roadmap I3)
A second card on the TARGET element: up to 3 named states (tabs `s1`–`s3`). Switched by an Interactions step whose `action` is `state_on` / `state_off` / `state_toggle`, with `state` = the name. On a state step the step's values are ignored, but its delay, stagger and start still place it on the timeline.
```json
"upw_states": { "mode": "on", "on": { "states": {
  "s1": { "name": "closed", "x": 0, "y": 24, "scale": 1, "rotate": 0, "opacity": 0, "blur": 4, "class": "",
          "duration": 0.45, "ease": "out", "start_in": "yes", "group": "", "inert": "yes" } } } }
```
| key | notes |
|---|---|
| `name` | slugged with `upw_states_name()` (`Open menu` → `open-menu`); empty = unused; s1 defaults to `open` |
| `x y scale rotate opacity blur` | the look in the state (relative, partial keyframe like `to` steps) |
| `class` | extra classes while in it (always also `upw-is-<name>`) |
| `start_in` | `yes` = applied instantly at init (before any Interaction is built) |
| `group` | same name + same group = exclusive (entering takes it off the others) |
| `inert` | `yes` = `inert` + `aria-hidden` while in it |

Runtime: `data-upw-states` (JSON) → `stOf(el)`; `setState(el, name, on)` keeps ONE WAAPI animation per state and reverses it on leave. It never plays backwards from 0, because that jumps to the end, so it pauses at 0 instead (the same guard is in `run()`). It toggles the classes, sets `data-upw-state`, and fires a bubbling `upw:state` event. A state the target doesn't define is class-only. Step acts are fired by timers at their delay, mirrored at `total - delay` when playing backwards (`on` ↔ `off`, `toggle` stays). A click Interaction with state steps and `again: reverse` keeps `aria-expanded` in sync. API: `upwIx.state(el, name[, on])`.

**Gotcha:** a "hide all, then show one" pair of steps must use **stagger 0** on the "hide all" step. Otherwise the staggered hides land after the "show one" step and hide it again.

Live Editor: `initTargetPicker()` also adds **Show this state on the canvas** after each `input.upw-st-name`. `showStateOnCanvas()` reads the tab's unsaved values, hides the modal, centres the node, and plays a temporary WAAPI animation plus the `upw-is-<name>` class. Back / Esc cancels both.

## Live Editor
Each `input.upw-ix-selector` gets a **Pick on the page** button (added by `live-editor.js` `initTargetPicker()` through a MutationObserver). `pickTarget()` hides the options modal (`body.fw-le-ix-picking`), highlights `[data-fw-item-id]` items in the canvas, and swallows clicks. `applyPickedTarget()` then works out the selector:
- the picked node's `css_id` (`#id`);
- otherwise its existing `ix-*` class;
- otherwise it appends `ix-<first 6 of unique_id>` to its `css_class` (one undo entry, re-rendered).

It also sets the step's `target` select to `self` / `inside` / `page`, depending on where the picked node sits relative to `modalItemId`.

## Gotchas
- Targets are resolved once, at init. Nodes added later need `upwIx.init()`, and page targets added later are not seen.
- `click` does not add a tabindex. For keyboard use, put it on a button or link.
- Opacity and blur override the target's own values while held. Transforms compose.
- The card costs about 190 KB of lazy schema per Animations-tab modal (5 triggers × 3 steps × 2 slots). Keep new step options inside `choices`, and keep their `desc` short; the shared help text lives in the per-trigger `note` html.
- Demo: `/animation-engine/interactions/` (`build-engine-demos.mjs` → `ixDemo`).
