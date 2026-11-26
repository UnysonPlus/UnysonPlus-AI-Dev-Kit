<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# live-editor extension

Front-end inline editing of page-builder pages — an Avada/Elementor-style visual editor layered over the existing Page Builder: hover sections/columns/elements to select them, edit their options in place, add/move/delete items, and save back to the same builder JSON. **Active by default:** yes. Version: 0.2.83.

## Provides

- **Shortcodes:** none — it is an editor over the existing Page Builder, not an element.
- **Entry points:** the **"Edit Live"** button in the admin bar (front end AND the wp-admin post-edit screen), a button in the post-edit **Publish** box (`post_submitbox_misc_actions`), and a hover **row action** in the Pages/Posts list tables (like "Edit with Elementor").
- **Architecture:** an ISOLATED IFRAME canvas. Visiting a builder page with `?fw-live-editor=1` swaps the theme template for a minimal editor **shell** (`views/editor-shell.php` — toolbar + canvas chrome) that embeds the same page in an `<iframe>` loaded with `?fw-live-editor-frame=1`; the two documents talk over `postMessage`, so editor CSS/JS never collide with theme CSS/JS. The data model is the EXISTING page-builder post option — the live editor and the classic backend builder are two front-ends over one source of truth.
- **Editing / saving (AJAX endpoints in `class-fw-extension-live-editor.php`):** load an item's options (`_item_options`), render a single item (`_render_item`) or the whole page (`_render_page`), create a new item / section / column / **Div structure** (`_new_item` / `_new_section` / `_new_column` / `_new_flexbox`), **save** (`_ajax_save`, writes back via `fw_set_db_post_option`), and an **opcache flush** helper.
- **Structure picker + section-encapsulation:** the in-canvas "+ Add Section" bar / empty state opens a **structure picker** with four tiles — **Section · Block · Flexbox · Grid** (the flexbox kinds). The live editor is **section-based at the root**: picking Section drops a root section (a full-width band by default); picking Block/Flexbox/Grid **nests it into the last section**, or creates a section to hold it if the page has none — so a bare Div is never orphaned at the root. (The backend builder keeps Divs root-capable; this is a live-editor-only rule — see the decision *"Why the live editor wraps Flexbox/Grid/Block in a Section"*.) Canvas item badges report the real kind (Section / Block / Flexbox / Grid).
- **Autosave + revision history:** a background recovery **autosave** (post meta `_fw_le_autosave`, cleared on real save) plus a shared **revision history** (index meta `_fw_le_rev_index` + one meta per revision, capped at **20**, oldest trimmed, deduped). Revisions are snapshotted on the `fw_post_options_update` hook, so BOTH the live editor's save AND the classic backend builder feed the same history.
- **Edit / Preview modes** (toolbar switch `#fw-le-modes`, shell `setMode()`). **Edit** = the normal editing canvas (`?fw-live-editor-frame=1`): motion is held at its FINAL state — the runtimes that check `window.self !== window.top` (sc-animations entrances/exits, Scroll Motion `upw-gsap`, Smooth Scroll, Scroll Loop) stand down, the Motion Gallery freezes (`IN_EDITOR`), and `live-editor-frame.css` forces `.sc-anim-pending` / `.sc-anim-gone` visible so re-rendered items never come back hidden. **Preview** = the shell POSTs `{json: model, nonce}` into the iframe (`target="fw-le-frame"`) at `cfg.previewUrl` (`?fw-le-motion-preview=1`); `motion_preview_model()` checks the nonce (`fw-live-editor:<id>`) + `edit_post`, and `_filter_motion_preview_content` (the_content, priority −1) swaps the posted model in as the page content (`json_to_shortcodes`). It is NOT a frame request — no stamping, no editor bridge, no admin bar, `nocache_headers()` + `X-Robots-Tag: noindex` — and the four iframe-gated runtimes skip their stand-down when the URL carries `fw-le-motion-preview=`, so the page plays exactly as for a visitor. Back to Edit reloads `cfg.frameUrl`; `onFrameReady` sees `returningFromPreview` and, when dirty, re-renders the unsaved model (`renderPageToCanvas`). **Edit holds EVERY module still** (0.3.8): `_action_edit_canvas_hold_motion` prints, as the first thing in `<head>` of the editing canvas only, a shim that answers `matchMedia('(prefers-reduced-motion: reduce)')` with `matches:true` and sets `window.upwEditCanvas = true` — every Animation Engine module already has a reduced-motion path (static, fully visible end state), so they all settle without per-module code. A sweep of all 30 module demo pages in the editing canvas, after scrolling each top to bottom: 0 invisible builder items and 0 moving elements (the same sensor catches the marquee and motion path moving on the visitor page). Limit: modules gate that path on Theme Settings → Animation Engine → `respect_reduced_motion`; with it off, the canvas-drawn ones (backgrounds, physics, confetti, cursor) keep moving in Edit — check `window.upwEditCanvas` if a module must always settle. A new module is covered automatically as long as it honours reduced motion. **Play in Edit = Replay in place** (0.3.9, `replayInPlace()`): instead of a per-module re-init hook, the shell instant-scrolls the selected element to the canvas centre (an element with an Exit enters only when its middle is in the 38–72% band), POSTs the model + `focus` into a second iframe `fw-le-replay-frame` at `cfg.replayUrl` (`?fw-le-motion-preview=replay`), laid over the Edit iframe (`#fw-le-replay`, same rect) and clip-pathed to the top-level `[data-fw-item-id]` ancestor's visible rect. The server (`is_replay_request()`, `model_has_id()`) renders only the top-level item holding `focus`, wrapped in `<div data-fw-le-replay-root style="padding:calc(100vh + 200px) 0 100vh">` so nothing is in view until the shell (`alignReplay()`) scrolls the section to the Edit canvas's spot (translateY when the scroll is clamped), hides fixed/sticky elements outside the root, and shows it — entrance / gallery / hover / loop motion then starts through the modules' own code. `upw-smooth.js` skips this frame (its check matches `fw-le-motion-preview=1` only). Closed by Done, Esc (capture listener on shell, Edit and replay windows), an Edit-canvas scroll (baseline taken at align time — the canvas may still be gliding before), a wheel over the replay (forwarded to the Edit canvas), resize, or a mode change. Scroll-driven motion (Scroll Motion, pins, stacks, exits) needs **Full preview** (`playFullPreview()`, the note's button) — the original Play: Preview with the selected `unique_id` POSTed as `focus`; the server forces that element's wrapper (`sc_needs_wrapper`) and stamps `data-fw-le-focus` on it (`_filter_mark_preview_focus`); on the canvas `load` the shell (same-origin) scrolls it just below the viewport, then smooth-scrolls it to the middle so a scroll-into-view entrance plays; Back to Edit re-selects it (`lastPlayId`).
- **Settings/options:** none of its own — it reuses each element's existing option schema, rendered in place.
- **Public hooks/filters:** consumes `fw_post_options_update` (revision snapshots) and force-renders wrapper-less leaves in edit mode; otherwise self-contained (drives the page-builder it augments).

## Notes / gotchas

- **Requires `page-builder`** (which pulls in `builder` + `shortcodes`) and framework **≥ 2.1.19** — it only makes sense on top of the builder it augments.
- Editing happens on the live front end (not the wp-admin builder canvas); changes save back to the same builder JSON, so a page edited live and a page edited in the classic builder stay in sync (and share one revision history).
- The `_render_item`/`_render_page` filters register unconditionally and self-gate via `is_edit_render()` — they act inside the iframe (frame request) AND under `admin-ajax` (single-item render), where `is_admin()` is true.
- Still pre-1.0 (`0.2.x`). Standalone, displayed extension with a `thumbnail.svg` icon; its own repo `UnysonPlus-Live-Editor-Extension` with the framework auto-updater (a top-level extension, like Forms).

## Interaction timeline (roadmap I4) — `static/js/live-editor-ixtl.js`
A separate script (handle `fw-live-editor-ixtl`, depends on `fw-live-editor`) that extends `window.fwLiveEditor` as `app.ixTimeline`.
- **Pill:** `#fw-le-ixtl-btn`, top right of `#fw-le-canvas`. It is shown in Edit while the selected node has an active `upw_interactions` / `__2`; `tl.pill()` runs from wrapped `onSelect` / `setMode` / `refreshUndoRedo`.
- **Panel:** `#fw-le-ixtl`, absolute at the bottom of the canvas (max 46%).
- **`plan()`** mirrors the runtime's `build()` timing: start = (`with` ? previous start : timeline end) + delay; a step's span = (n − 1)·stagger + duration; state steps have duration 0. Targets are resolved in the Edit canvas from the item's `[data-upw-ix]` wrapper.
- **Drag:** mutates `node.atts[key][mode].steps[sN].delay | duration` live (snap 0.05), then on release runs `recordHistory(pre)`, `markDirty()`, `syncFrameModel()` and `renderItem()`, and rebuilds the preview after the re-render.
- **Preview:** paused WAAPI animations on the real canvas targets (shared end time via `endDelay`, the same keyframes as the runtime). `seek()` sets `currentTime`; Play uses requestAnimationFrame. Close or re-render cancels them. State steps are not previewed (diamond markers only).
- The Scroll Ruler / Scroll Timeline pills (`.upw-sruler-btn`, `.upw-stl-btn`) are hidden while the panel is open (`body.fw-le-ixtl-open`).

## Animate: page timelines (Animation Creator A1–A5) — `static/js/live-editor-anim.js`
The Live Editor's second workspace. Public guide: docs site `/animation-engine/page-timelines` (+ the Live Editor page's
"Animate: page timelines" section). Enqueued (handle `fw-live-editor-anim`) when `upw_page_timelines_save()` exists
(the Animation Engine's page-timelines module). Kinetic Scenes' page mode and `live-editor-animate.js` are retired
(A4): nothing opens another window.

- **Config** (`_fwLiveEditor`): `pageUrl`, `pageTitle`, `pageTimelines` (the page's saved list, cleaned),
  `canTimelines`, `animCurves` (`sc_easing_defs()` → `[ { key, label, group } ]`, Steps left out), `easeCss`
  (key → CSS, springs as `linear()`).
- **Switch:** `#fw-le-workspace` (Design | Animate) is prepended to the centre toolbar group. Animate adds body classes
  `fw-le-anim` + `fw-le-nav-open` (the Navigator), hides `#fw-le-modes`, Add, Templates, History and the Interaction
  timeline, and builds `#fw-le-anim-bar` (timeline picker, New, start, Play, time, Preview, Scroll tools),
  `#fw-le-anim-panel` (right, 300 px) and `#fw-le-anim-dock` (bottom, 230 px; the canvas gets matching padding).
  `app.setMode('preview')` leaves Animate; `app.onFrameReady` re-sends the state after a canvas reload.
- **Canvas:** `toFrame('set-animate', { on })` → the frame adds `html.fw-le-animating` and ignores dblclick editing,
  drag, Delete and the context menu (`live-editor-frame.js`, `this.animating`); frame CSS hides the selection tag's
  buttons, the resize handle and the add-column / add-section zones. Timelines play through
  `toFrame('upw-timeline', { op: update | seek | play | arm | stop | clear })` → `window.upwTimeline.command()`.
- **Panel (contextual):** nothing selected → the timeline's settings (Plays on + options, Length, Loop / Back and
  forth, Runs on, Pin + screens for scroll, Import / Export, Delete); an element not in the timeline → Animate this
  element / Animate every ".class" (its `atts.css_class`, minus `upw- fw- sc-` prefixes) / Starts the timeline /
  tracks *Not on this page* to retarget; an element in it (or with a class that has a track: `A.trackFor()`) → its
  values at the playhead (`setAt()`: keys at the playhead; a property keyed for the first time later than 0 also gets
  its rest value at 0), class Stagger + Order; a keyframe (`A.kf = { target, i }`) → time, values (empty = not set),
  the curve (`ease` key from `animCurves`) with a canvas plot, Delete.
- **Dock:** rows = tracks (`data-target`), diamonds `.fw-le-anim-dock__kf` (drag to retime, snapped 0.05 s, Shift
  free; one undo entry per drag), playhead measured with `getBoundingClientRect` (lane vs inner), ruler drag scrubs,
  zoom 1–8×, collapse (`fw-le-anim-dock-min`). Class tracks draw a faint `.fw-le-anim-dock__ghost` bar per extra
  element.
- **Undo / Save:** timeline changes push `{ __tl: JSON }` snapshots onto `app.undoStack`; `app.undo` / `app.redo` are
  wrapped to swap them. `app.saveExtras` (an array of functions) adds `timelines` to the page Save when they changed
  (`A.tlDirty`); `_ajax_save` stores them with `upw_page_timelines_save()` and returns them; `app.afterSaveHooks`.
- **Keys** (capture listener): Space plays; Delete / Backspace removes the selected keyframe and never reaches the
  element-delete handlers in Animate.
- **Curves:** a keyframe's `ease` is a shared-list key (`soft_land`, `pop_over`; older camelCase names are converted)
  and `e` its CSS, written by `forSave()`.
- **Files:** JSON `{ format: 'unysonplus-page-timelines', version: 1, page, timelines }`; CSV columns `timeline_id,
  timeline, plays_on, length, started_by, once, leave, toggle, threshold, delay, pin, screens, repeat, yoyo, runs_on,
  element, element_name, track_curve, stagger, order, t, x, y, scale, rotate, opacity, blur, curve` (round-trips;
  imports add timelines, ids made unique, Undo takes an import back).
- **Scroll tools (A5):** the bar's *Scroll tools* sets `app.scrollTools` and opens Preview; `postPreview` posts
  `scroll_tools=1`; `fw_live_editor_scroll_tools()` (global; `is_scroll_tools_request()`) is true only for that
  request, and is the ONLY place the Scroll Ruler and the Scroll Timeline (animation-engine `scroll-ruler.php`,
  `scroll-timeline-editor.php`) enqueue. Their admin-bar entries are gone; their floating toggles are the way in.
- Tests: `pw-screens/_a2-animate.mjs` (workspace, undo, save), `_a2-io.mjs` (Import / Export, Preview),
  `_a3-class.mjs` (class targets; pass a URL for the visitor half only), `_a5-scroll.mjs` (scroll pin, tools gate).

- **Adding keyframes:** `A.addKeyAt( track, t )` holds the track's values at t (no jump) and opens the keyframe;
  reached from the panel's *Add a keyframe at … s*, the dock's ◆+ (`[data-addkf]`), a double-click on a row's lane,
  and K (shell keydown, or forwarded from the canvas as shortcut `anim-key`; Space = `anim-play`).
- **Follow the page:** `A.follow()` on the canvas window's scroll (debounced 180 ms): for each timeline, its tracks'
  elements' sections (`closest('section, .upw-section')`); the one with ≥ 60% of the section (or of the viewport) in
  view becomes active via `A.switchTo()` (ties keep the current one); skipped while playing, previewing or dragging.
  Selecting an element only another timeline moves switches to it (`A.trackIn()`).
- **5g presets:** `STARTS` (11 built-in starting points, curve keys from the shared list) + the site library
  (`cfg.timelinePresets`, option `upw_page_timeline_presets`, AJAX `fw_live_editor_timeline_presets` = the whole list,
  stored at once, `upw_timeline_presets_clean()`); *Start with* (`[data-start]`), *Replace its moves with*
  (`[data-replace]`), *Save these moves as a preset*. "All (JSON)" exports `presets`; an import adds new ids.
- **5h site-wide:** `tl.site` (only when every track is a class track; `cfg.canSite` = `edit_theme_options`); the page
  Save sends `site_timelines`, stored as option `upw_site_timelines` (`upw_site_timelines_save()`, class tracks only)
  and merged after the page's own on every front-end request (the runtime then loads on every page).
- **AI tools** (animation-engine `includes/ai-abilities.php`): `page-timelines` (read: page + site timelines,
  presets, curve keys, the format) and `page-timelines-save` (merge by id / replace; optional site list; curve keys
  baked to `e`; `FW_AI_Toolkit::snapshot()` first, so `undo_change` reverts).

- **Toolbar width:** in Animate the zoom, status pill, backend and open-page buttons are hidden; below 1500 px Edit /
  Preview / Play, Add / Structure / Templates / History and Animate's Preview become icon-only (their label is the
  tooltip) and the page title is hidden, so both workspaces fit 1366 px.

### Keeping front-end tools off the Live Editor (Animation Creator A1)
- `fw_live_editor_is_canvas()` (global): true while rendering the Live Editor's screen, its Edit canvas or its
  Preview canvas (`FW_Extension_Live_Editor::is_canvas_request()`; reliable from the `wp` action on).
- Used by the Chat extension's `should_render()` and the AI Assistant's visitor widget. Any front-end overlay must
  check it and stay off the editor.

### Page timelines: data, runtime, storage (Animation Engine `modules/page-timelines/`)
- Data: `{ id, name, duration, repeat, yoyo, runsOn?, trigger: { type: load|in-view|hover|click|scroll, target?,
  once?, leave?, toggle?, threshold?, delay?, pin?, length? }, tracks: [ { target, label?, ease?, stagger?, order?,
  frames: [ { t, x?, y?, scale?, rotate?, opacity?, blur?, ease?, e? } ] } ] }`. `target` = a builder key or a class
  (`.pt-tile`); `stagger` (0–5 s) / `order` (first | last | center | random) only on class tracks; `pin` / `length`
  (0.5–10 screen heights) only on scroll.
- Storage: post meta `_upw_page_timelines` (JSON string), never in the builder JSON. Every write goes through
  `upw_page_timelines_clean()` (`upw_page_timelines_target()` = key or class). REST: `meta._upw_page_timelines` on
  pages / posts (write needs `edit_post`; same cleaning). Max 50 timelines × 100 tracks × 200 frames, 400 KB.
- Visitors (singular page with timelines): `data-upw-tl="<key>"` stamped on key targets (classes find their own
  elements); first-moment CSS in `wp_head` under `.upw-tl-on` (class selectors for class tracks; inside the `runsOn`
  media queries and `prefers-reduced-motion: no-preference`), removed by the runtime once it has rendered (4 s
  fallback); `script.upw-timelines` + the runtime in the footer; `window.upwTimelineCfg.reducedMotion`.
- Runtime `upw-timeline.js` (~4 KB gz): `load / update / seek / play / arm / stop / clear / command`. Class tracks:
  `elsOf()` + `delaysOf()` (rank × stagger; seeded shuffle for random). Scroll: progress = element crossing the
  screen, or with `pin` a `.upw-tl-pin` wrapper (element `position: sticky; top: 0`, wrapper height = element +
  length × viewport); never pinned while `editing`. Skips its visitor boot when `window.upwEditCanvas`.
- Demo: `unysonplus-website/wordpress/demos/build-engine-demos.mjs` → `page-timelines` (fixed keys `ptKey()`;
  `animation-engine/page-timelines.timelines.json`); live at demos.unysonplus.com/animation-engine/page-timelines/
  (page 14283, timelines set through the REST field).

## Save as image (roadmap 7f, Live Editor 0.3.31)

Canvas right-click menu → **Save as image…** (`openImageExport( id )` in `static/js/live-editor-frame.js`): PNG at
1x / 2x / 3x or SVG of any item, optionally with a transparent background (otherwise the nearest ancestor's background
colour, `backdropOf()`). Rendered in the browser by the vendored **modern-screenshot 4.6.0** (MIT,
`static/vendor/modern-screenshot/`, URL passed to the canvas as `_fwLiveEditorFrame.shotLib`, loaded on first use only).
During the capture the body classes `fw-live-editor-frame-active` / `fw-le-wireframe` and the item state classes
(`fw-le-empty-col`, `fw-le-collapsed`, …) are removed and restored, and editor UI nodes (`fw-le-*` without
`data-fw-item-id`) are filtered out, so the file shows the page as visitors see it. Nothing is stored server-side.
Public docs: `/extensions/live-editor#save-as-image`.

## AI layout: make responsive / design variations (roadmap 7e, Live Editor 0.3.33 + AI Assistant 1.0.64)
- Right-click menu items **Make responsive with AI…** and **Design variations with AI…** on a section / flexbox / container / row, shown only after the frame gets `ai-ready`. Frame → shell message `ai-layout` `{id, kind}` → `fwLiveEditor.aiLayout(id, kind)`.
- The shell calls `window.upwAiAssistant.proposeLayout(kind, node, parentType, onStatus)` (AI Assistant `panel.js`), which resolves `{ proposals: [{label, why, node}], dropped: [reason] }`.
- Preview = `fw_live_editor_render_item` of the proposal node → frame `replace` on the current DOM id (`_aiLay.domId`, which changes when a variation brings new ids). The model and history are NOT touched while previewing. **Keep** = `recordHistory()` + splice the node into `index[id].siblings` + `rebuildIndex / markDirty / syncFrameModel / refreshNavigator` (one undo step). **Cancel / Esc** re-renders the original over the preview. `aiLayoutPreview(i)` (`-1` = original), `aiLayoutClose(keep)`.
- Responsive switches the canvas to tablet on open and restores the device on close; the picker has its own Desktop / Tablet / Phone buttons.
- Picker CSS: `.fw-le-ailay*` in `live-editor.css`.
- Server side and checks: [`ai-assistant.md`](ai-assistant.md) → AI layout.

## Freeform editing (roadmap 7h, Live Editor 0.3.34)
- Frame: a capture `pointerdown` on an item whose parent is `.fw-free` and NOT stacked at the current width (`freeCanvasOf`: parent display ≠ flex) starts `startFreeDrag(e, el, 'move')`; drag begins after 4px, sets the CSS vars live (`applyFreeBox`), snaps (6px) the box's left/centre/right and top/middle/bottom to the canvas and sibling edges (Alt = off), draws `.fw-le-free-guide` lines + `.fw-le-free-tip`. The column-resize grip doubles as the freeform width grip (`updateResizeHandle`). Arrow keys nudge (`nudgeFree`, committed after 400ms). Context menu: Bring to front / forward, Send backward / to back (`freeLayer`, renumbers z 1..n).
- Commit: frame → shell `free-boxes {items:[{id, box}]}` → `setFreeBoxes()` writes `atts.free_box` (JSON string) for all of them as ONE `recordHistory()` step + `markDirty()`; no re-render (the canvas already shows it). The click right after a drag is swallowed (`_freeNoClick`).

## Working together (roadmap 7i, Live Editor 0.3.35)
Server: `includes/class-fw-le-collab.php` (`FW_LE_Collab`, init from `_init()`), one AJAX action **`fw_le_collab`** with `op`, same nonce (`fw-live-editor:<post>`) and `edit_post` check as the editor. Shell: `static/js/live-editor-collab.js` (config `_fwLeCollab`: `me {id,name,color}`, `interval` 8000, `saved`, `staging` / `copies`, `moderate`); exposes `window.fwLeCollab` (`onFrame`, `refreshPins`, `state`).
- **Presence**: `op=pulse {item, device, dirty, leave?}` every 8 s (and 0.5 s after a selection change; `sendBeacon` leave on `pagehide`). Stored in transient `fw_le_presence_<post>` (45 s TTL). Answer `{others:[{id,name,avatar,color,item,device,dirty,ago}], saved:{t,u,name}, comments:<md5 of threads>}`; a changed hash reloads the comments; `saved.u ≠ me` after load shows the "X saved this page" notice. `_fw_le_saved` meta is written on `fw_post_options_update`.
- **Comments**: post meta `_fw_le_comments` = `[{id, item, label, user, name, t, text, resolved, replies:[{id,user,name,t,text}]}]` (max 300 threads, 2000 chars, ids mixed-case alnum: do NOT sanitize_key them). Ops `comments`, `comment_add {text, item+label | parent}`, `comment_resolve {id, resolved}`, `comment_delete {id}` (author or `edit_others_posts`). Mail via `wp_mail` to the thread's people / the page author (filter `fw_le_comment_emails`). Frame: context-menu **Comment…** → `collab-comment`; pins + other people's outlines drawn in `#fw-le-overlay .fw-le-collab` from `collab-pins` / `collab-presence` messages; a pin click → `collab-open-thread`. The panel re-render keeps half-typed replies.
- **Staging**: `stage_create` (draft copy, all meta except per-post keys, `_fw_staging_of` = original), `stage_share {off?}` (token `_fw_stage_token`; review URL `?page_id=<copy>&fw-review=<token>` works logged out via a `posts_results` filter, `X-Robots-Tag` + `wp_robots` noindex at priority 1000, after the SEO extension's 999), `stage_publish {copy:'keep'?}` (snapshots the original into its revision history, copies content + meta, re-saves `page-builder` through `fw_set_db_post_option`, fires `fw_le_staging_published`, trashes the copy), `stage_discard`.
