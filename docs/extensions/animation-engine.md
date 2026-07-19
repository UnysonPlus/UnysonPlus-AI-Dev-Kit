# animation-engine extension

The home for UnysonPlus's animation capabilities — WebGL objects, scroll motion, hover/physics interactions, text effects, backgrounds, cursors, page transitions and a seamless-scroll loop. **Active by default:** no (ships INACTIVE — activate it under Extensions). Version: 1.2.27.

## Provides

- **Shortcodes (6):** `gallery-3d`, `image-sequence`, `model-viewer`, `svg-draw`, `svg-morph`, `webgl-object` → see `../shortcodes/` for each element's atts.
- **Effects/modules:** dozens of effect families attached via the element **Animations** tab, to Sections, or site-wide (hover, physics, text-effects, scroll-motion, scroll-reveal, motion-path, scroll-text-highlight, parallax, marquee, and more) → see `../animation-engine/` for the full inventory.
- **Settings/options:** adds a **Site-wide UX** section to Theme Settings (WebGL/background/cursor/page-transition/scroll-loop toggles). Per-element effects are configured on each element's Animations tab (image-picker style pickers).
- **Public hooks/filters:** on-demand CSS/JS partials cooperate with the asset-optimizer combine API (its `css_exclude_handles` filter keeps used-only styles from being double-absorbed). — otherwise mostly self-contained.

## Notes / gotchas

- **Ships inactive by default** — the user activates it in Extensions; nothing renders until then.
- **On-demand loading:** a page ships only the styles/scripts for effects it actually uses ("ship only used styles" contract).
- Requires the `shortcodes` loader + `page-builder` (to surface the 6 elements).
- Repo is **flattened** (`UnysonPlus-Animation-Engine-Extension`, root = the extension folder).
- The authoritative capability inventory is the extension's own `CATALOG.md` — check it before proposing a new module/effect so it stays genuinely distinct.
- Animations/effect pickers use the **popover image-picker multi-picker** shape (label on the top level — see the workspace multi-picker rule).
