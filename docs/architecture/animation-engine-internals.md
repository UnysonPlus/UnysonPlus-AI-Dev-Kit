# animation-engine-internals — How the Animation Engine Is Wired

Architecture reference for the **Animation Engine** extension — the internals a builder needs when
*extending* or *debugging* it, which the per-module docs (hover, scroll-loop, scrollytelling, …)
don't cover: how modules load, how assets ship on-demand, how a module is gated on/off, how the
Lenis smooth-scroll instance is shared, and the state the Scrollytelling Stage publishes. The engine
ships **inactive by default** (the user activates it under Extensions); when active, every symbol
below exists.

## Module loading

The extension class `_init()` `require_once`s each module's PHP entry file, one per module, in order
— roughly **two dozen modules** loaded this way (hover, physics, text-effects, scroll-motion,
scroll-reveal, motion-path, parallax, marquee, flip-card, confetti, backgrounds, sticky-stack,
horizontal-scroll, scroll-loop, scroll-color-shift, scrollytelling, motion-sequence, cursor,
page-transitions, scroll-progress, preloader, smooth-scroll, …). A module exists only while the
extension is active, because nothing requires it otherwise.

The extension also adds an **"Animations" section to Theme Settings**. Two kinds of module hang off
that split:

- **(a) Per-element effect modules** inject a field into an element's **Animations** tab via the
  **`sc_animation_fields`** filter (the "Add Animation" inserter). Reference: `hover`. These attach
  to *any* element and carry no site-wide settings tab.
- **(b) Site-wide / section-behavior modules** register their **own Theme Settings tab** via the
  **`upw_anim_engine_module_tabs`** filter (Cursor, Page Transitions, Scroll Progress, Preloader,
  Smooth Scroll, the Engine tab itself). Section-only modules (scroll-loop, sticky-stack, …) instead
  hook `fw_shortcode_get_options` for `$tag === 'section'` and inject into the section's
  `tab_animation` organizer — they are neither a plain per-element field nor a settings tab.

> Do **not** register an `upw_anim_engine_module_tabs` tab merely to expose an enable/disable switch
> for a per-element module — the inserter is the control surface and assets are already on-demand, so
> such a tab is redundant. Full-config site-wide tabs (the ones above) legitimately keep their tab.

## On-demand asset loader (`includes/asset-loader.php`)

A shared per-style loader guarantees the anti-bloat contract: **a style's CSS/JS ships ONLY on pages
that actually use that style** — never a per-module bundle. `hover` is the canonical reference.

- A module **registers its asset layout once** at load time with
  **`upw_anim_register_assets( '<mod>', array( … ) )`** — pointing at `static/css/effects/<style>.css`
  partials, optional `static/js/effects/<style>.js` partials, an optional `<mod>-core.js` dispatcher
  (`base_js`), and the `js_styles` list (styles that ship JS).
- The wrapper filter (`sc_build_wrapper_attr`) calls **`upw_anim_use_asset( '<mod>', $style )`** for
  each style it actually emits. That is the trigger.
- The loader's single `wp_footer` pass enqueues `base_css` + each *used* `<style>.css`, and — only
  when a used style is in `js_styles` — that style's JS partial(s) followed by `<mod>-core.js`
  (which depends on them). **A page using only CSS styles loads zero JS.** Per-style files are
  independently cacheable and the asset-optimizer extension can concatenate them.

Modules never hand-roll a `wp_footer` enqueue and never ship a single `<mod>.css`/`<mod>.js` bundle.
Continuous loops subscribe to the shared scheduler `window.upwAnimRaf` (set `'needs_raf' => true` in
the registration) rather than starting a private `requestAnimationFrame`.

## Effects control (`includes/effects-control.php`)

Every module carries a programmatic choke point:

```php
upw_<module>_enabled();  // reads fw_get_db_settings_option('animation_<mod>')['enable'], DEFAULT 'yes'
```

Default is **enabled** — the runtime never needs UI to flip it. `effects-control.php` performs two
passes so a disabled module leaves no trace:

- **Field-hide pass** — filters `sc_animation_fields` (and the section options) to *remove* a
  disabled module's picker from the Animations tab, so it can't be added.
- **Runtime-gate pass** — strips the module's `data-*` attributes from already-saved elements when
  the module is disabled, so nothing runs even on content authored earlier.

Per-element and site-wide modules differ here: per-element modules are gated at the inserter-field +
element-data level (above); a **site-wide** module is gated where its own settings/enqueue live (its
Theme Settings tab governs it), so effects-control's field-hide pass doesn't apply to it. The file
also strips any stray enable-only tabs left over from older module versions.

## The Lenis singleton — `window.__upwLenis`

Two modules use Lenis: **smooth-scroll** (site-wide momentum wheel/trackpad smoothing) and
**scroll-loop** (terminal infinite section loop). They must never create two Lenis instances — a
double instance would double-drive ScrollTrigger and fight over the scroll position. The contract:

- **`window.__upwLenis`** holds the single instance. **Whichever module boots first creates it; the
  other reuses it.** Both guard on this global before constructing.
- **`window.__upwLenisBridged`** guards a **one-time drive bridge**, set up once by whichever module
  wins:
  - if **GSAP is present**, `gsap.ticker` drives `lenis.raf` and
    `lenis.on('scroll', ScrollTrigger.update)` — so ScrollTrigger-based effects (Scroll Motion,
    Parallax) read the *smoothed* scroll;
  - else a **private rAF** loop drives `lenis.raf`.

```js
// shared, set once by whichever module boots first:
window.__upwLenis         // the single Lenis instance (smooth-scroll ⟷ scroll-loop)
window.__upwLenisBridged  // true once the ticker/scroll bridge is wired — never wired twice
```

Because Lenis moves the **real** scroll position (not a fake transform), anything that reads
`getBoundingClientRect()` per frame rides the smoothed scroll **automatically** — including the
**Scrollytelling Stage**. No module-to-module coupling is needed for that. **Programmatic** scene
jumps must route through **`__upwLenis.scrollTo(...)`** (not `window.scrollTo`) so Lenis stays the
authority on position; scroll-loop's wrap-around likewise uses `__upwLenis.scrollTo`.

Guards/bails (either module): in-builder, `prefers-reduced-motion` (when the engine's
`respect_reduced_motion` is on), touch/mobile opt-out, or Lenis missing → **native scroll**, no
instance created.

## Scrollytelling Stage — published state (internals)

Usage lives in the `scrollytelling.md` module doc; this is the wiring a *child* element or debugger
needs. The Stage (Full-screen Stage layout) **pins**, treats each column as a full-viewport scene
played in order, and publishes per-scene state directly **on the stage element** each frame:

```js
el.__beatIndex      // integer index of the current scene / story beat
el.__storyProgress  // 0..1 global progress across the whole pinned story
                    // (story beats array is published alongside)
```

- It reads `getBoundingClientRect()` each frame (so it rides Lenis smoothing for free, per above) and
  supports a **scrubbed Backdrop Motion** (uploaded frame set / numbered image-sequence pattern /
  video / fixed image) driven by `__storyProgress`.
- A **child element** (e.g. a nested 3D gallery or image sequence) can **remap the story's global
  progress to its own scene slice** — reading the parent's `__storyProgress` and normalizing it to
  the `[beatIndex, beatIndex]` window of the scene it lives in — so the child scrubs only while its
  own scene is on screen. This is how nested motion stays in sync with the camera-ride without each
  child owning a scroll listener.

## Where to extend vs. debug

- **Add a per-element effect** → new module PHP `require_once`'d in `_init()`, field appended on
  `sc_animation_fields`, assets registered with `upw_anim_register_assets` + emitted via
  `upw_anim_use_asset`. Keep `upw_<mod>_enabled()` (default `yes`).
- **Add a site-wide behavior** → register a tab via `upw_anim_engine_module_tabs`; own your
  `wp_enqueue_scripts`; add `upw_anim_raf_handle()` as a script dep if you run a continuous loop.
- **"Effect missing on the front end"** → check the module is enabled (`upw_<module>_enabled()`),
  that the wrapper actually called `upw_anim_use_asset` (else no CSS/JS is enqueued), and that
  effects-control didn't strip the data-attrs (module disabled).
- **"Scroll jitters / two smooth-scrolls"** → verify only one `window.__upwLenis` exists and
  `window.__upwLenisBridged` is set exactly once.
