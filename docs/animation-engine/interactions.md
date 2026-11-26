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
`mode`: `off` · `hover` · `click` · `load` · `start` · `view` · `past` · `mouse` · `component`. The value lives under the key that matches the mode. `start` (roadmap 8c) plays the instant it is wired (page still parsing) — same options as `load`, no extra keys. `component` (roadmap 8b) fires on another component's event.

| mode extra | values | default |
|---|---|---|
| `click.again` | `reverse` (toggle) · `replay` · `none` (once) | `reverse` |
| `view.leave` | `reverse` (plays again next time) · `keep` | `reverse` |
| `past.offset` | px from the top of the screen that the node's **bottom** must pass | `80` |
| `mouse.area` | `element` · `page` (compiled `area`) | `element` |
| `mouse.smooth` | 0–98 % (compiled `smooth` 0–0.98, the lerp keeps `1 − smooth` per frame) | `85` |
| `mouse.leave` | `rest` (glide back) · `stay` (compiled `leave`) | `rest` |
| `component.event` | `open` (forwards on open, reverse on close) · `close` (the mirror) · `tab` (replay on tab change) · `slide` (replay on slide change) → compiled `ev` | `open` |
| `component.component` | CSS selector for the component to watch → compiled `cmp`; empty = this element | — |

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
| `more` | multi-picker | `{ mode: 'off' }` | **More properties** (roadmap 6a), see below |
| `action` | select | `animate` | `animate` · `state_on` / `state_off` / `state_toggle` (+ `state`) · `set` (+ `set`, `set_value`) · `lottie` (+ `lottie`, `lottie_from`, `lottie_to`) · `rive` (+ `rive`, `rive_name`, `rive_value`) · `burst` (+ `burst`, `burst_count`, `burst_size`, `burst_colour`); see *Set / Lottie / Rive steps* |
| `duration`, `delay` | slider s | 0.5, 0 | |
| `ease` | `easing-picker` | `classic_out` | any key of the shared easing set (`shortcodes/includes/easing-defs.php`): the **Motion design** curves from Kinetic Scenes (`soft_land`, `snap_settle`, `glide`, `whip`, `pop_over`, `crash_in`, `bounce_hard`, `cruise`, `soft_in_out`, `gentle_in`, `leave`, `crash_out`), `spring_*`, the anime.js families (`out_back`, `in_out_expo`…), **Classic** (`classic_out`, `classic_in_out`, `classic_in`, `classic_back`, `linear`), or a custom `cubic-bezier(x1,y1,x2,y2)`. Older saves `out` / `inout` / `in` / `back` still work (exact curves; `sc_easing_normalize()` shows them as the Classic keys) |
| `stagger` | slider s | 0.08 | gap between several matched targets |
| `start` | select | `after` | `after` the previous step · `with` it |

### Repeat / back and forth (roadmap 6g)
On hover / click / load / start / view / component: `repeat` (`1` · `2` · `3` · `5` · `-1` forever) → compiled `rep` (only when ≠ 1),
`yoyo` yes → `yo: 1`. Runtime `loop(g)`: a timer at `g.total + 30` ms replays (or, with `yo`, runs the other way,
state `yo` while backwards); with `yo` one time = there and back (stops after `rep × 2` plays, at rest). `back()`,
`replay()` and `teardown()` clear it; triggers treat state `yo` as playing.

### Saved Interactions (`mode: 'saved'`, roadmap 6g) — `includes/interactions-presets.php`
Option `upw_ix_presets` = `[ id => [ name, value (a full upw_interactions value), updated ] ]`, id = `sanitize_title( name )`.
`upw_interactions_compile( { mode: 'saved', saved: { preset: id } } )` compiles the preset's value (live-linked; a
preset can't be `saved` itself; a missing preset → null). `upw_ix_preset_clean()` only accepts a value that compiles.
- AJAX (nonce `upw_ix_presets`): `upw_ix_preset_save` (`edit_pages`; name + value JSON; used by the Live Editor
  timeline's **Save as preset**, `_fwLiveEditor.ixPresetNonce`), `upw_ix_preset_delete`, `upw_ix_presets_export`
  (`format=json|csv`, GET) and `upw_ix_presets_import` (file; JSON `{ type, version, presets }` or CSV
  `id,name,trigger,steps,value`, the value column = the full JSON) — all `edit_theme_options` except save.
- Theme Settings → Site-wide UX → Interactions → **Saved Interactions** box (`upw_anim_engine_module_tabs`, priority
  20). The tab's HTML is injected lazily, so its buttons are wired by ONE delegated listener printed in `admin_footer`
  on `page=fw-settings` (an inline script there would not run, and `document.currentScript` would be null).

### Mouse move (`mouse`, roadmap 6f)
`wireMouse()` replaces the timeline: on `pointermove` (mouse / pen only; skipped unless `(hover: hover) and (pointer: fine)`,
and under reduced motion) over the node (`area: element`, rect-relative) or the window (`area: page`), px / py ∈ −1…1
and d = min(1, √(px²+py²)) are smoothed in a rAF loop. Each animate step (`a` absent) holds two WAAPI animations per
target — values (replace) and tilt / skew (`composite: 'add'`) — created `duration: 1, fill: forwards`, then
**`finish()` + `persist()`** (otherwise a 1 ms run can sit at its start, and the browser auto-removes a finished filling
animation it thinks is overridden), and each frame `effect.setKeyframes()` with the step scaled: x, r, ry, skx × px;
y, rx, sky × py; scale / opacity / blur / br / ct / sa / gs by d; × the device amount. Leaving (`pointerleave`, or the
document's `mouseleave` for `page`) glides to 0 unless `leave: stay`.

### Page starts loading (`start`, roadmap 8c)
`wire()` case `start`: `window.requestAnimationFrame( on( play ) )` the moment the interaction is wired — the runtime
`init()` runs on `DOMContentLoaded` (or at once if already past), so the steps play while the page is still parsing,
before images and fonts, unlike `load` which waits for `window.load`. On a breakpoint change that makes it allowed it
plays then too (shared with `load`). Everything else (steps, repeat, devices, amount, reuse, reduced motion) is the
same as any timed trigger.

### Component events (`component`, roadmap 8b)
`wire()` case `component` → `wireComponent( el, ix, G )` (returns early — no pre-built timeline, built lazily by `G()`
on the first event). Watches the component(s) named by `ix.cmp` (`q(document, cmp)`), or `[el]` when empty; a named
selector that hasn't mounted yet is retried (~5 s, `setTimeout` 200 ms × 25, for a slider that builds on load). One
`MutationObserver` per root (`attributes` + `subtree` + `childList`, filter `class`, `aria-expanded`, `aria-selected`,
`aria-hidden`, `aria-current`), coalesced through one `requestAnimationFrame`. It reads the components' **own** signals —
nothing is added to them:

- **open / close** (`ev: open|close`): `isOpen(root)` = `root[aria-expanded]` else an `is-open|open|show|is-flyout-open|menu-drawer-open`
  class on root, else `aria-hidden="false"`, else a descendant `[aria-expanded="true"]` / `.is-open,.open,.show`. `open`
  plays forwards when it opens and `back()` when it closes (a toggle, like hover); `close` is the mirror. Covers the
  Mega Menu item (`.menu-item-has-mega-menu.is-open`, trigger `aria-expanded`), the theme mobile drawer
  (`#primary-navigation-drawer.is-open`, `aria-hidden`) and any `aria-expanded` dropdown.
- **tab** (`ev: tab`): `tabKey(root)` from the first `[aria-selected="true"]` / `.nav-link.active` / `[role=tab].active` /
  `.ui-tabs-active` (its id / `aria-controls` / `href` / index); `replay()` on change. Covers the Tabs element
  (`.nav-link.active` + `aria-selected`).
- **slide** (`ev: slide`): `slideKey(root)` from `.splide__slide.is-active` / `.swiper-slide-active` / `.slick-active` /
  `[aria-current="true"]` (its `aria-label` / id / index); `replay()` on change. Covers the Carousel element (Splide
  `.is-active`).

### Easing (roadmap 5a)
`upw_interactions_ease_css( $key )` → the CSS timing function: the four legacy keys keep their exact `cubic-bezier`;
everything else goes through `sc_easing_css()` (springs and the Motion design curves are `linear(…)`, 49 points,
sampled from the same functions as Kinetic Scenes' `packages/player/src/eases.ts`, so a curve looks the same in a
scene and on a page); unknown / `default` → Smooth stop. The runtime's `ez()` swaps a `linear()` for the nearest
`cubic-bezier` where `CSS.supports('transition-timing-function','linear(0, 1)')` is false (an overshoot when any
point passes 1). Regenerate the curves + thumbnails with the generator noted in `easing-defs.php`'s header.

### Set / Lottie / Rive steps (roadmap 6c, 6b)
`upw_interactions_action_compile( $action, $st )` (`interactions-more.php`) → merged into the step with `a` = the
action and `d: 0`; a step with nothing usable is dropped (empty class, a segment without `lottie_to`, a Rive
trigger / input without a name, an input value that is neither a number nor true / false).

| action | compiled | runtime (fired by timer at its delay, like a state step; `rev` = played backwards) |
|---|---|---|
| `set` | `sk` (`show hide class_add class_remove class_toggle z_index pointer_off pointer_on`), `sv` (classes, or the z-index int) | `doSet()`: inline `display` / classes / `z-index` (+ `position: relative` if static) / `pointer-events`; the previous inline values are kept in `node.__upwSet` and restored on `rev` |
| `lottie` | `lo` (`play reverse pause stop frame segment`), `lf`, `lt` | `doLottie()` via `node.fwLottie` (or a `[data-lottie]` inside); `rev`: play ↔ reverse, pause → play, frame → the remembered frame, segment → `lt → lf`; reduced motion jumps to the end frame |
| `burst` | `bk` (`mix ring sparks lines confetti`), `bn` (3–60), `br` (px), `bc` (colour) | `doBurst()` → `window.upwBurst()` (Confetti module, retried ~5 s while it loads); `rev` and reduced motion do nothing; dropped at compile when Confetti is off |
| `rive` | `ro` (`play pause trigger input`), `rn`, `rv` | `doRive()` via `node.fwRive` (or a `.fw-rive` inside); `rev`: play ↔ pause, input → its remembered value, trigger → nothing |

Both players load async: `withPlayer()` retries every 200 ms for ~5 s. The Live Editor timeline shows these
steps as markers (`isState` covers `set|lottie|rive`).

### More properties (`more`, roadmap 6a)
An inline multi-picker (`mode: off|on`, values under `on`), so the fields stay in the form while hidden and
switching to `off` keeps them. `upw_interactions_more_compile()` (`interactions-more.php`) merges only what changes
something into the compiled step / state:

| key | compiled | runtime |
|---|---|---|
| `width`, `height`, `radius` | `w`, `h`, `rad` (px, 0 = unchanged) | `width` / `height` / `borderRadius` in the main keyframe |
| `skew_x`, `skew_y`, `rotate_x`, `rotate_y` | `skx`, `sky`, `rx`, `ry` (deg) | a SECOND animation, `transform: perspective(900px) rotateX() rotateY() skew()`, `composite: 'add'`, so it stacks on the target's own transform |
| `background`, `color`, `border_color` | `bg`, `fg`, `bc` (CSS colour; `upw_interactions_colour()` allows hex, rgb[a], hsl[a], `transparent`, `var(--x)`) | `backgroundColor` / `color` / `borderColor` |
| `brightness`, `contrast`, `saturate` (%, 100 = as is), `grayscale` (%) | `br`, `ct`, `sa`, `gs` | appended to `filter` after `blur()` |
| `clip` (`left/right/top/bottom/circle`), `clip_amount` (%) | `cs` (`l r t b c`), `ca` | a THIRD animation with an explicit pair: open `inset(-30%…)` / `circle(100%)` ↔ clipped (clip-path cannot ease from `none`) |

`amt` (Amount on tablet / phone) scales skew, tilt, the filters and the clip; size, radius and colours are absolute.
`animate(node, s, a, from, timing)` returns the 1–3 animations, each paused at 0; `build()` and `setState()` (one
array per state) both use it. The Live Editor mirrors the same maths in `app.ixCompact()` / `app.ixAnimate()` /
`app.ixEase()` (live-editor.js), used by the Interaction timeline and *Show this state*; its curves come from
`_fwLiveEditor.easeCss` (every shared key → CSS).

Each trigger's step 1 has its own defaults: hover = lift (y −8), click = pop (scale 1.06, back), load/view = reveal (`from`, y 30/40, opacity 0), start = reveal (`from`, y 24, opacity 0), component = reveal (`from`, y 16, opacity 0), past = page `header` scale 0.96.

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
| `more`, `ease` | as on a step (More properties; the shared easing picker) |
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
- Opacity, filters, colours, size, radius and clip override the target's own values while held. Transforms (incl. the additive skew / tilt) compose.
- Width / height animate layout (the page reflows); prefer Scale unless the size itself must change.
- A step's filter list replaces the target's CSS `filter`; lists with different functions don't interpolate (discrete swap at 50 %). Don't animate filters on a target that has its own CSS filter.
- Chrome's IntersectionObserver applies the target's own `clip-path`: a fully clipped `self` target is never intersecting. `wire()` therefore observes `el.parentElement` for a `view` interaction whose step clips `self`.
- The card renders ≈ 1.7 MB of lazy schema (7 triggers incl. `mouse` and `saved`; 6 × 3 step tabs, each with More properties and the Set / Lottie / Rive / Burst fields). Keep new step options few; consider sharing one step editor if it grows further. Keep new step options inside `choices`, and keep their `desc` short; the shared help text lives in the per-trigger `note` html.
- Demo: `/animation-engine/interactions/` (`build-engine-demos.mjs` → `ixDemo`).
