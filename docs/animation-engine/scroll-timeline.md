<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# scroll-timeline — Scroll Timeline & Ruler (Animation Engine author tools)

Two **admin-only, front-end author tools** that visualise every GSAP **ScrollTrigger** on the rendered
page — the page-level view of "what pins / scrubs where" when composing scroll choreography. Both load
**only** for logged-in admins (`current_user_can('manage_options')`), on the front end (`! is_admin()`),
and stay hidden until toggled, so a visitor never loads or sees them. Neither persists anything — they
read the live `ScrollTrigger.getAll()`. Requires the `animation-engine` extension **ACTIVE**.

## Scroll Timeline (the visual editor) — module `scroll-timeline-editor`

Files: `framework/extensions/animation-engine/modules/scroll-timeline-editor/`
- `scroll-timeline-editor.php` — enqueues on `wp_enqueue_scripts` (priority 31) for front-end admins only.
- `static/js/upw-scroll-timeline.js` — the panel (no dependencies; reads `window.ScrollTrigger`).
- `static/css/upw-scroll-timeline.css` — dark, fixed, very high z-index.

A bottom-docked, video-editor-style timeline. **Toggle: `Shift+T`** or the **Timeline** button
(bottom-right). Behaviour:
- **One track per ScrollTrigger**, sorted by start. Each track's `[start,end]` is a block on a
  **0–100 % scroll axis** (`left = start/maxScroll`, `width = (end-start)/maxScroll`). Blocks carry
  `is-pin` / `is-scrub` classes; labels use the shared `describe(el)` (id, else a telling class).
- **Draggable playhead** — dragging the knob or clicking the axis calls `window.scrollTo` to
  `fraction * maxScroll`, so **scrub-linked** triggers animate live. Pointer events use
  `setPointerCapture` + window `pointermove`/`pointerup`.
- **Read-out** — header shows `Scroll <pct>% · <n> active` (active = triggers whose range contains the
  current scroll position).
- **Hover a track → `.upw-stl-hl`** teal outline on its element; **click a label/block → smooth-scroll**
  to its start.
- Open state persists in `localStorage['upwScrollTimelineOpen']`. Re-renders on resize; a short interval
  refreshes a few times after load so late-registering triggers fill in.

## Scroll Ruler (the compact read-out) — module `scroll-ruler`

Files: `framework/extensions/animation-engine/modules/scroll-ruler/`. **Toggle: `Shift+R`** or the **⟺**
button (bottom-left). A thin vertical rail down the right edge mapping every trigger's range onto the
document scroll height, with a live playhead and a list (element, raw `start–end` pixels, pin/scrub).
Read-only; click a row/bar to jump. Reports **raw scroll pixels**; the Timeline shows the same ranges as
**percentages**.

## Drag-to-retime + persistence (Phase 2)

Tracks whose trigger element has a `data-upw-g-key` — **or whose trigger sits inside a keyed wrapper**
(SplitText text reveals fire on the inner heading, so the editor and the runtime both resolve the key via
`closest('[data-upw-g-key]')`) — are editable (set `upwStlData.canEdit`). The editor lets you drag a block
to move **start** and drag the right handle to move a scrub block's **end**. Moving a block shifts its
**end by the same delta for every track** (not just scrub ones), so a near-zero-range toggle reveal can't
invert its range and drop out of the `end > start` track filter mid-drag. It converts the dragged scroll-pixel to a GSAP `top N%` string from the
element's live geometry, previews via `st.vars.start/end` + `ScrollTrigger.refresh()`, and persists.

Persistence is **additive — never the builder JSON**:
- **Key.** `scroll-motion-render.php` stamps `data-upw-g-key = sc_element_scope_class($atts)` (the
  prefix-independent `u{hash}` from the element's `unique_id`) on every Scroll Motion wrapper. Because
  Scroll Motion bakes its `data-upw-g*` attributes into stored `post_content`, **an existing page needs
  one re-save/re-render for the key to appear**; new effects get it on save.
- **Store.** `modules/scroll-timeline-editor/timing-overrides.php` — a single post meta
  `_upw_timing_overrides` = `{ u{hash}: { start, end } }` (sanitised to GSAP-safe strings). Save is
  admin AJAX `wp_ajax_upw_save_timing` (nonce `upw_timing` + `edit_post`); a reset drops the key.
- **Print.** The same file prints `window.upwTimingOverrides` in `wp_head` for **every** visitor on a
  singular page that has overrides — so a retime ships for real, not only in the editor.
- **Apply.** `upw-gsap.js` → `applyTimingOverrides()` (exposed as `window.upwApplyTimingOverrides`) sets
  each matching trigger's `vars.start/end` and refreshes, stashing `st._upwOrig` so the editor's Reset
  can revert live. It matches a trigger to an override by the trigger element's `data-upw-g-key`, falling
  back to the nearest keyed ancestor (`closest`) so inner-triggered effects (SplitText) still apply. Remember to regenerate `upw-gsap.min.js` (terser) after editing the runtime — the
  render enqueues the min via `fw_min_uri`.

Editor UX notes: the override map is updated **optimistically** (drag and reset re-render immediately,
then POST); `upwTimingOverrides` is normalised from PHP's `[]` (empty array) to `{}` so key lookups work.

## Keyframe lanes (Phase 3a — Scroll Keyframes beat positions)

Scroll Keyframes elements aren't GSAP ScrollTriggers (they ride the shared `upwAnimRaf` frame loop and
interpolate `data-upw-skf` = `{kf:[{at,v,ease}]}`), so `getAll()` never sees them. The editor surfaces
them directly, as **keyframe-lane tracks** — one diamond per beat — and lets you retime a beat's `at`.

- **Key.** `scroll-keyframes.php` now stamps the same `data-upw-g-key` (`sc_element_scope_class($atts)`)
  on the Scroll Keyframes wrapper, in both the `keyframes` and `pin_choreo` branches (guarded by
  `empty($attr['data-upw-g-key'])` so a co-located Scroll Motion effect doesn't double-stamp). Because the
  attribute bakes into `post_content` / the builder render, **an existing element needs one re-save** for
  the key to appear.
- **Store.** The same `_upw_timing_overrides` meta gains a `kf` field: a monotonic list of 2–8 floats in
  `[0,1]` (`upw_timing_sanitize_kf()` in `timing-overrides.php`, accepting an array or `"0,0.35,1"`). A row
  can hold `start`/`end` (GSAP) and/or `kf` (Scroll Keyframes) independently.
- **Apply.** `scroll-keyframes.js` → `setup()` resolves the key (`closest('[data-upw-g-key]')`), keeps
  `el.__skfBaseAt`, registers `el` in `REG[key]` (exposed as `window.upwSkfReg`), and applies any
  `upwTimingOverrides[key].kf` via `applyKfAt()` (clamped + kept non-decreasing). It stashes `el.__skfKf`
  (the live kf array) and `el.__skfTick`, and tracks progress through `el.__skfLastP` so a retime can force
  a re-tick. Hooks: `window.upwSkfRetime(key, atArr)` (live) and `window.upwSkfReset(key)` (revert to base).
- **Editor.** `collectKf()` scans `.sc-scroll-kf[data-upw-skf]`; `skfRange(el)` maps the element's scroll
  range to document pixels (the pinned sticky-runway span for Pin · Hold · Exit, else the viewport-travel
  range), and `skfAts(el)` reads the live beats (`el.__skfKf`, else decodes the attr). `render()` draws a
  faint range backdrop (`.is-kf`) plus a `.upw-stl-kfdot` per beat; interior beats (`.is-move`) drag via
  `startMarkerDrag()`, which clamps the new `at` strictly between its neighbours, previews with
  `upwSkfRetime`, and persists `{kf:r.ats.join(',')}` through the shared `postOverride()`. The endpoints
  (`.is-edge`) are fixed. Reset routes through `upwSkfReset` + a reset POST.

This retimes **when** each beat lands. Editing **what** each beat looks like is Phase 3b, below.

## Beat states (Phase 3b — Scroll Keyframes beat values)

**Click a beat** (any diamond, endpoints included) to open the inline **beat-state editor**: the eight
animatable props (`x, y, scale, rotation, rotationX, rotationY, opacity, blur`) + the `ease`. On open the
editor seeks the page to that beat (`scrollTo(start + at*(end-start))`) so the live element shows the pose
being edited; every input previews live and persists as a **diff from the authored values**.

- **Store.** The `_upw_timing_overrides` row gains a `kfs` field alongside `kf`: a length-N list of
  `{ v:{changed props}, ease? } | null` (`upw_timing_sanitize_kfs()` — array **or** JSON string; each `v`
  prop range-clamped, `ease` whitelisted). A row can carry `start`/`end` (GSAP), `kf` (positions) and `kfs`
  (states) independently.
- **Apply.** `scroll-keyframes.js` → `setup()` snapshots `el.__skfBaseV` / `el.__skfBaseEase`, then applies
  `ov.kf` (positions) and `ov.kfs` (states) via `applyKfState()` (merges `v`/`ease` into each beat). Hooks:
  `upwSkfSetState(key, i, vPartial, ease)` (live), `upwSkfResetBeat(key, i)`, and `upwSkfReset(key)` (now
  reverts positions **and** states/eases to base).
- **Editor.** Clicking an interior diamond without dragging — or any endpoint — calls `openBeatEditor(r,i)`.
  `buildKfs(r)` diffs each beat's live `v`/`ease` against `el.__skfBaseV`/`__skfBaseEase` and emits only the
  changes; `saveKfTrack(r)` sends `kf` (positions, if moved) and/or `kfs` (states JSON), or a **reset** when
  nothing differs from the authored timeline. State edits save through a 300 ms debounce and a **`quiet`**
  `postOverride` (no re-render) so the open popover never flickers; `render()` runs on close. An edited beat
  gets `.is-edited` (white ring); `describe()` ignores the editor's own `upw-stl-*` classes so a highlighted
  track keeps its real name.

The per-page override **is** the compile target — there is no stored Kinetic Scenes scene to keep in sync
(Design Decisions: "keyframe-lane-native-editor"). The Kinetic Scenes keyframe editor stays the richer
surface for full scenes.

## Roadmap position

Phase 1 (timeline surface + live scrub), **Phase 2 (drag-to-retime start/end)**, **Phase 3a (keyframe lanes —
beat positions)** and **Phase 3b (beat states)** all ship — **item 1b is complete**. See the public docs
`3d-motion-roadmap/roadmap.md` and `animation-engine/scroll-timeline`.

## Gotchas

- Front-end only: these never appear in `wp-admin`, and the Timeline needs a page that actually has
  ScrollTriggers (Scroll Motion / Scroll Keyframes / Motion Sequence / Motion Gallery choreography /
  scrollytelling / pinned sections) — otherwise it shows an empty-state hint.
- The buttons are intentionally on opposite corners (Timeline bottom-right, Ruler bottom-left) so both
  can be open at once.
