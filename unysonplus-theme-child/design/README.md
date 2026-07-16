# design/design.json — the polished-chrome baseline

`functions.php` imports `design.json` **once on activation** so a new site starts
with header/footer/container ~90% right.

## How to (re)generate it
1. On a reference install, configure the chrome to parity using **native options**
   (see the kit's `docs/header-footer-reference.md`): container width, header
   (border/shadow/design/menu style/logo width), footer (columns/border/padding),
   copyright.
2. Theme Settings → **Miscellaneous → Export / Import → Export design** → save the
   downloaded `.json` here as `design.json`.
3. It is **design-only + media-stripped** (logos/menus are per-site, added after).

## Important
Import **overlays whole top-level keys** — each key in the file must carry its
FULL value (all leaves), which is exactly what Export produces. Do not hand-author
partial `header_layout`/footer values or you'll wipe the other defaults.
