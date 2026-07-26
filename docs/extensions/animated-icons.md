# animated-icons extension

Adds an **"Animated"** tab to the icon picker so any icon option (`icon` / `icon-v2` / `icon-v3`) can use an animated icon alongside font glyphs, SVGs, emoji and images. **Active by default:** no (ships INACTIVE — activate it under Extensions). Version: 1.0.4.

## Provides

- **Shortcodes:** none — it augments the shared icon option type, so every element that already has an icon field gains the animated kinds.
- **Settings/options:** **Theme Settings → Icons → Animated** (a sub-tab beside Library / Browse / Upload). Four per-technology on/off toggles (leaf ids `animated_lottie`, `animated_rive`, `animated_svg`, `animated_raster`), read via `fw_get_db_settings_option()`.
- **Public hooks/filters:** it flips the core gate filters — `fw_icon_lottie_enabled`, `fw_icon_rive_enabled`, `fw_icon_svg_animation_enabled`, `fw_icon_raster_enabled` (all default `false`; the Animated tab derives from `fw_icon_animated_enabled()` = lottie **or** rive). It also injects its Settings tab via `unysonplus_icons_animated_settings`.

## The four technologies

| Technology | Toggle default | Value type it produces | Notes |
|---|---|---|---|
| **Lottie** (`.json`) | on | `{type:'lottie', src, trigger, speed}` | Bundled `lottie-web` SVG player (~168 KB, lazy). URL or `.json` upload. |
| **Rive** (`.riv`) | **off** | `{type:'rive', src, trigger}` | Bundled `@rive-app/canvas` runtime (~2 MB WASM, lazy) — interactive/state-machine, so OFF by default. URL or `.riv` upload. When both Lottie and Rive are on, the Animated tab shows a selector to switch panels. |
| **Animated SVG (SMIL)** | on | `{type:'svg', markup}` (existing) | No new value type — the SVG sanitizer just KEEPS SMIL tags (`<animate>`, `<animateTransform>`, …) when enabled, so a pasted/uploaded animated SVG plays. SMIL only; CSS-`<style>` keyframes are not preserved. Scripts/handlers/foreignObject still stripped. |
| **Animated raster** (GIF/APNG/WebP) | on | `{type:'custom-upload', url, attachment-id}` (existing) | No new value type — these already animate as an `<img>`; the toggle just surfaces a Custom-tab hint. |

## Notes / gotchas

- **Opt-in, and per-technology.** With the extension inactive, the icon picker shows the plain tabs (Icons / Emoji / Custom / Favorites), no Animated tab, and no animation runtime loads in admin. Rive is additionally off-by-default even when the extension is active (its 2 MB runtime).
- **Front-end render is NOT gated.** `sc_icon_render()` renders a stored `lottie`/`rive`/animated-`svg` value regardless of the extension's state, so activating/deactivating it never breaks pages that already use an animated icon.
- **Upload endpoints:** `wp_ajax_fw_icon_lottie_upload` (validates Bodymovin `v`+`layers`) and `wp_ajax_fw_icon_rive_upload` (validates the `RIVE` file fingerprint) — capability + nonce gated, and only when the matching technology is enabled. Files land under `uploads/unysonplus/lottie/` and `uploads/unysonplus/rive/`.
- **Which vs why for `.lottie`/CSS-SVG:** the extension ships Lottie **JSON** only (a `.lottie` is a zipped JSON — a delivery optimization, not a render one) and animated SVG via **SMIL** only. Both are deliberate scope calls (see the Design Decisions log), not gaps.
- Standalone, displayed extension card with a `thumbnail.svg` icon; requires the `shortcodes` extension (the frontend render lives there).
