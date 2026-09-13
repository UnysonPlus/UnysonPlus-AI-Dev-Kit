<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Theme Settings — Components → Hover Animations (`hover_animations`)

ONE shared library of hover effects, consumed by every element that can animate on hover. Theme Settings → Components → **Hover Animations** — the tab sits right after Section Styles and before Box Presets (hover starts at the box, then the button; a section never hovers).

Two things feed every hover picker in the framework:

1. the **built-in effects** — the `.btnfx-*` classes shipped in `shortcodes/button/static/css/hover-fx.css` (Lift, Grow, Shine sweep, Glow pulse, Tilt, 3D push, Fill: slide right, …; motion-only, they never set colours), and
2. this **user library** — CSS entries saved here, each emitting `.btnfx-c-{slug}`.

Both appear, together, in the Button shortcode's **Hover Animation** picker and in a Box Preset's **Hover Animation** field (Theme Settings → Components → Box Presets). Add or edit an entry once and both pickers update — the same one-library / many-consumers model as Color Presets.

## `hover_animations`

- **Type**: `addable-box` (sortable; add-button text "Add Animation"; row template `<span class="btn btn-primary btnfx-preview-{{id}}">{{name}}</span>`).
- **Default**: the 5 seeded samples from `unysonplus_default_custom_hover_animations()` (Pulse Ring, Swing, Rubber Band, Squeeze, Raise & Glow).
- **Storage key**: `hover_animations` (theme-scoped preset store). The legacy key `button_animations` — the list this library grew out of, when it lived under the Buttons tab — is still read as a fallback by `unysonplus_get_custom_hover_animations()`, so a site saved before the move keeps its entries.
- **Choices**: none fixed — user-defined. Per-row sub-fields:

| box-option | type | details | default |
| --- | --- | --- | --- |
| `id` | unique | (auto) | auto |
| `name` | text | → slug (`-2`/`-3` dedupe via `unysonplus_custom_hover_animation_slug_map()`) | `""` |
| `css` | code-editor | mode `css`, height 160; tokens `{{SELECTOR}}` = the element the animation is applied to (a button **or** a box), `{{ANIM}}` = a unique @keyframes name. `{{BTN}}` is accepted as a legacy alias of `{{SELECTOR}}`. | placeholder scale-pulse snippet |

- **Saved value shape**:

```json
{ "id": "0000020001", "name": "Pulse Ring", "css": "{{SELECTOR}}:hover { animation: {{ANIM}} 1.1s ease infinite; }\n@keyframes {{ANIM}} { … }" }
```

## How each consumer applies an entry

| consumer | what it stores | what renders |
| --- | --- | --- |
| Button shortcode `hover_animation` (and the header CTA) | the class, e.g. `btnfx-lift` or `btnfx-c-pulse-ring` | the class is appended to the `<a class="btn …">`; built-ins come from `hover-fx.css`, customs from the presets stylesheet as `.btnfx-c-{slug}` (`{{SELECTOR}}` → `.btnfx-c-{slug}`, `{{ANIM}}` → `btnfxc-{slug}`). |
| Box Preset `hover_animation` | the same class | **no extra class on the element** — the preset stylesheet re-emits the effect onto the preset's own `.boxp-{slug}`: a built-in is cloned from `hover-fx.css` (every rule naming the effect class, that class swapped for `.boxp-{slug}`, plus the `@keyframes` those rules animate, plus a `prefers-reduced-motion` guard); a custom entry is re-rendered with `{{SELECTOR}}` = `.boxp-{slug}`. Helper: `unysonplus_hover_fx_css_for( $fx, $target )` in `framework/includes/css-tokens.php`. |

The picker itself is the `button-hover-animation` option type (a 3-column grid of live previews; `fx_css` loads `hover-fx.css` in the options form so previews animate). A Box Preset also keeps its older **Extra Hover Effects** multi-select (`hover_fx`: lift / zoom media / tilt / glow / shine — box-specific composites) alongside the library field.

## Converter

The Site Converter fingerprints a captured element's hover onto this library: for a button, `translateY(-N)` → Lift, `scale(1.0x)` → Grow, shadow-only → Glow pulse, a `::before` fill → Fill: slide …; for a card, a lift → Lift and a grow → Grow on the Box Preset's `hover_animation`. A **fidelity guard** applies to both: an effect that forces a hover box-shadow (Lift, Long shadow, 3D push, Tilt, Expanding ring, Inset press, Neon glow, Offset shadow) is used only when the source has no resting shadow to lose or its hover also changes the shadow — otherwise the preset keeps the source's exact transform (button: preset Custom CSS; box: the plain `hover_fx` lift), so the library never adds chrome the source lacks.

## Test

`framework/tests/hover-animations-test.php` (run via `wp-cli eval-file` inside a WP install) proves the shared key, the legacy fallback, the picker choices, and the `.boxp-{slug}` emission for a built-in and a custom entry.
