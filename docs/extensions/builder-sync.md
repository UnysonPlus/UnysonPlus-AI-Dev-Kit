<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# builder-sync extension

Keeps the site design in step between Unyson+ Theme Settings and another page builder's global settings on the same site — edit either side and the other follows. First provider: Elementor (the active Site Kit). **Active by default:** no — the Site Converter activates it on the first conversion into Elementor. Version: 1.0.0.

## Provides

- **Settings:** one box, **Design Sync → Direction** (`mode`): `both` (default, two-way) · `to_builder` (Theme Settings → builder only) · `off`.
- **What syncs** (through the neutral design model `FW_Builder_Sync_Design`):

  | Unyson+ Theme Settings | Elementor Site Kit |
  |---|---|
  | Color Presets `theme_colors` — Primary / Secondary / Accent | `system_colors` primary / secondary / accent |
  | the other Color Presets | `custom_colors` |
  | body text colour `typography.body.color` | `system_colors` text + `body_color` |
  | `typography.heading_font.family` | `system_typography` primary (family) |
  | `typography.body` (family, weight, size, line height, letter spacing) | `system_typography` text + `body_typography_*` |
  | `typography.h1` … `h6` | `h1_typography_*` … `h6_typography_*`, `h1_color` … |
  | `typography.body_link` / `body_link_hover` | `link_normal_color` / `link_hover_color` |
  | `layout_container_width` lg / md | `container_width` / `container_width_tablet` |
  | `site_background` colour layer | `body_background_background` classic + `body_background_color` |
  | the primary Button Preset (`role`/slug `primary`, else the first) — text, background, border, hover | `button_text_color`, `button_background_*`, `button_border_*`, `button_hover_*` |
  | Text Styles `font_sizes` | `custom_typography` |

- **Public API:** `fw_ext( 'builder-sync' )->push( $slug = '' )` (Theme Settings → builder now), `->pull( $slug )` (builder → Theme Settings now), `->get_providers()`, `->mode()`.
- **Filters:** `fw_builder_sync_providers` — register a provider (`FW_Builder_Sync_Provider` subclass: `slug`, `label`, `is_available`, `push( $design )`, `pull()`, `listen( $on_saved )`).

## Notes / gotchas

- **Triggers:** Theme Settings saved (`fw_settings_form_saved`) → push; the active kit saved in Elementor (`elementor/document/after_save`) → pull. A static busy flag blocks the echo; a push writes the kit meta directly and a pull writes Theme Settings directly, so neither fires the other's save event anyway.
- **The kit is written as one meta update + `files_manager->clear_cache()`** — what `Kit::save()` does — not through `Document::update_settings()`, whose `array_replace_recursive()` merges lists by index and would leave a deleted colour behind.
- **Renames survive:** Unyson+ derives a colour's slug from its name, Elementor keeps a stable `_id`. The identity map (`fw_builder_sync_ids_elementor` option: slug → kit id, for colours and Text Styles) lets a colour renamed in Elementor rename the Unyson+ preset **in place** and keep its kit id on the next push. New kit ids are `substr( md5( 'upw-c-' . slug ), 0, 7 )`.
- **Lossy by design, never destructive:** a field one side cannot express is left untouched on the other (Text Style colour / custom CSS / class have no Elementor equivalent; Elementor's per-device sizes have no Unyson+ field). A colour deleted in Elementor is **not** deleted from Unyson+ (elements reference presets by slug); Elementor colours / typographies the user added themselves (ids not in the map) are kept on push.
- **Raw reads:** Theme Settings are read straight from `fw_theme_settings_options:<theme>` (like the preset store), so a sync inside a save hook never re-enters the option schema. Colour Presets and Text Styles write through `unysonplus_preset_store_set()`.
- **Known gap:** both sides may enqueue the same Google font (Elementor for its global typography, the theme for Theme Settings) — a double download, not a visual difference.
- **Editor caching:** an open Elementor editor shows the old kit until it is reloaded.
