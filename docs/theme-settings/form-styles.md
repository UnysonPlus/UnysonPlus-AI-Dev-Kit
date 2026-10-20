<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Form Styles (Components → Form Styles)


> **Since Forms 2.0.85 a preset reaches every form on the site:** the Contact Form element, the Newsletter element
> (its Design → **Form Style** option: `default` = the first preset) and Membership's login form (the default style).
> The CSS scope is `.formp-{slug} :is(.wrap-forms, .fw-nl__form, .fw-mbr-login)`; add a container with the
> `unysonplus_forms_style_targets` filter. A converted site gets its own preset from the source's field skin
> (Site Converter 1.12.11).

Reusable looks for form fields. Each preset becomes a **`.formp-{slug}`** class (slug from the name:
`On Dark` → `formp-on-dark`) that a Contact Form picks with its **`form_style`** att (Style tab → Form Style).
Edit a preset and every form wearing it changes. The submit button is not part of it: it keeps using the
**Button presets** (`button_style`). **Provided by the Forms extension** — the tab and its CSS exist only while
Forms is active (since Forms 2.0.67).

Stored under the Theme Settings key **`form_style_presets`** (an `addable-box`, theme-scoped like every
Components library; read it with `unysonplus_preset_store_get( 'form_style_presets' )`, or the class
`FW_Forms_Style_Presets::all()`). The CSS is appended to the shared `presets-{hash}.css` through the
`unysonplus_global_css` filter.

## Shipped presets

| Name | Class | Look |
|---|---|---|
| Standard | `formp-standard` | The original field look, exactly: white, 1px `#dbdfe4` border, 10px radius, 48px tall, 16px sides, dark focus with a subtle ring. **The element's default**, so existing forms are unchanged. |
| Soft | `formp-soft` | Filled light grey, no visible border, 12px radius, primary-colour focus ring. |
| Underline | `formp-underline` | Transparent, bottom border only, no side padding, small uppercase labels; text inherits the page colour. |
| Rounded | `formp-rounded` | Pill one-line fields (text boxes capped at 20px), primary-colour focus. |
| Floating Labels | `formp-floating-labels` | White, 56px tall, 10px radius; the label sits inside the field and rises when it is focused or filled (`label_position: floating`). |
| On Dark | `formp-on-dark` | For dark sections: translucent white fields, white text and labels, light error colour. |

## One preset (the addable-box row)

| key | type | what it does |
|---|---|---|
| `id` | unique | Stable id (`fsp-…`). |
| `style_name` | text | Dropdown label and class slug. |
| `field_bg` · `field_text` · `field_border` | compact colour `{predefined, custom}` | Field fill, typed text, border. `custom` may be any CSS colour incl. `rgba()`, `transparent`, `inherit`. |
| `focus_color` | compact colour | Border + ring colour while typing. |
| `placeholder_color` · `label_color` · `help_color` | compact colour | Placeholder, all labels (incl. choice labels), the help line (`.field-info`). |
| `error_color` | compact colour | Error messages (`.form-error`, `.fw-form-errors li`, written `!important` because the validation script colours them inline) and the required star. |
| `choice_color` | compact colour | `accent-color` of checkboxes / radios; the chosen rating pill. |
| `border_width` | unit-input | Border width. |
| `border_sides` | select | `all` (a box) · `bottom` (an underline). |
| `border_radius` | unit-input | Corner radius; textareas use `min(radius, 20px)`. |
| `field_height` | unit-input | One-line fields and selects. |
| `field_padding` | unit-input | Side padding (textareas get `14px` top/bottom). |
| `font_size` | unit-input | Field text size. |
| `focus_ring` | select | `none` · `subtle` (8%) · `medium` (18%) · `strong` (32%) halo in the focus colour; an underline style gets an inset underline instead. |
| `label_size` · `label_weight` · `label_case` | unit-input · select (`400`–`700`) · select (`''` / `upper`) | The field's main label (and a rating's legend). |
| `label_position` | select | `''` (above the field) · `floating` (inside text boxes and textareas, rising on focus / when filled; empty is detected with `:placeholder-shown`, so the script gives placeholder-less fields a one-space placeholder). |
| `dark_field_bg` · `dark_field_text` · `dark_field_border` · `dark_placeholder_color` · `dark_label_color` · `dark_help_color` | compact colour | Applied under `:root[data-bs-theme="dark"]` (site dark mode). Empty = keep the light colour. |
| `custom_css` | code | `{{SELECTOR}}` → `.formp-{slug}`; fields are inside `.wrap-forms`. |

## Using it

- On a Contact Form: `form_style: "formp-soft"` (or `""` = None, the stylesheet's plain look). A value that names
  no existing preset is ignored at render.
- The element's own field settings (`field_bg`, `field_text`, `field_border`, `field_focus`, `label_color`,
  `field_radius`, `field_border_width`, `field_padding`) are **this-form-only overrides** and win over the preset.
  Prefer the preset; use overrides only for a genuine one-off.
- A form on a dark section: pick **On Dark** (or a dark preset of your own). Site dark mode is handled by the
  `dark_*` colours of whichever preset the form uses.
- Programmatic setup: write the whole list with `fw_set_db_settings_option( 'form_style_presets', $list )`;
  ids must be unique; shapes as in the table.
