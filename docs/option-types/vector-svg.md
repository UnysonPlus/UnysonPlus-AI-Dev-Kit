<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# vector-svg

A drawing field: preview + **Draw / edit shape** (full-screen vector editor on paper.js 0.12.18, loaded on first open) + an **SVG code** textarea. Class `FW_Option_Type_Vector_Svg`, `framework/includes/option-types/vector-svg/`. Used by the `vector_shape` element.

## Stored value shape
A **string** of sanitised SVG markup, or `''`:
```json
"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"300 149.63 500 270\"><path d=\"M700,149.63l100,180h-150z\" fill=\"#00b295\"/></svg>"
```

## Declaring
```php
'badge_shape' => array( 'type' => 'vector-svg', 'label' => __( 'Badge shape', 'fw' ), 'value' => '' ),
```

## Notes / gotchas
- `_get_value_from_input` runs `fw_upw_sanitize_svg()`; input without `<svg` → `''`. Same stored shape as `svg-code`, so switching between the two needs no migration.
- The editor exports each item as its own element with its own `fill` / `stroke` / `fill-rule`; the viewBox comes from the drawing's stroke bounds. On import it flattens groups and skips clip masks.
- Editor features: tools select (V), points (A), pen (P), rectangle (R), ellipse (E), polygon (G), star (S); Union / Subtract / Intersect / Exclude (bottom shape is the base); fill / none / stroke / width; forward / backward / delete; undo / redo (Ctrl+Z / Ctrl+Shift+Z, 80 steps); arrow-key nudge (Shift = 10).
- JS entry point: `window.fwVectorSvg.open( svgString, function onSave( svg ) {} )`.
- Recolour like an icon with CSS: `[fill]:not([fill="none"]) { fill: currentColor }`.
- Public doc: `docs/options/option-types/vector-svg` on docs.unysonplus.com.
