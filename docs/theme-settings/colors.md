# Theme Settings — Colors (Color Presets)

The Colors tab defines the site's **Color Presets** palette — the swatches every shortcode's Styling tab (Text Color / Background Color) and the Button / Border / Table preset color fields choose from. Each preset emits a `.text-{slug}` class, a `.bg-{slug}` class, and a `--color-{slug}` CSS variable (slug = lowercased name, non-alphanumerics collapsed to `-`, trimmed).

## Color Presets

### Color Presets — `theme_colors`

- **Type**: `addable-box` — `sortable: true`, `box-duplicate: true`, `width: full`, add-button text "Add another colour", wrapper class `fw-preset-2col`, row template `<span style="background-color:{{- color}};…"></span> {{- name }}`.
- **Default**: the seeded 25-preset palette from `unysonplus_default_color_presets()` (enumerated below).
- **Choices**: not a fixed-choice control — a repeatable list of preset rows. Each row's sub-fields:

  | sub-field id | label | type | default |
  |---|---|---|---|
  | `name` | Color | `text` (`dynamic_content: false`) | `''` |
  | `color` | (none) | `color-picker` | `''` |

  Note: there is no explicit `slug`/`id` sub-field — the slug is **derived at render time** from `name` (`strtolower` → `preg_replace('/[^a-z0-9]+/','-')` → trim `-`). Rows with empty `name` or `color` are skipped.
- **Saved value shape**: array of row objects —
  ```json
  [
    { "name": "Primary", "color": "#0d6efd" },
    { "name": "Secondary", "color": "#6c757d" }
  ]
  ```
- **Notes**: Each row becomes `.text-{slug}` / `.bg-{slug}` utility classes plus a `--color-{slug}` CSS var (via css-tokens.php). Elements CONSUME these through the compact color-preset picker (`sc_color_field_compact()`), whose saved value is `{ predefined: 'text-{slug}'|'bg-{slug}', custom: '#hex' }`. The custom Bootstrap-derived semantics (`text-primary`/`bg-primary`, etc.) override Bootstrap via `:root` specificity + `!important`. Runtime lookup of slug → hex is `unysonplus_color_preset_slug_map()`; the live saved palette is read via `unysonplus_get_color_presets()` (falls back to defaults when unset).

#### Seeded default presets

Every default preset, in order (name → hex → derived slug):

| name | hex | slug |
|---|---|---|
| Primary | `#0d6efd` | `primary` |
| Secondary | `#6c757d` | `secondary` |
| Accent | `#fd7e14` | `accent` |
| Muted | `#adb5bd` | `muted` |
| Black | `#000` | `black` |
| White | `#fff` | `white` |
| Gray | `#636c72` | `gray` |
| Light Gray | `#bdbdbd` | `light-gray` |
| Red | `#dc3545` | `red` |
| Pink | `#e91e63` | `pink` |
| Purple | `#9c27b0` | `purple` |
| Deep Purple | `#673ab7` | `deep-purple` |
| Indigo | `#3f51b5` | `indigo` |
| Blue | `#286090` | `blue` |
| Light Blue | `#03a9f4` | `light-blue` |
| Cyan | `#00bcd4` | `cyan` |
| Teal | `#009688` | `teal` |
| Green | `#5cb85c` | `green` |
| Light Green | `#8bc34a` | `light-green` |
| Lime | `#cddc39` | `lime` |
| Yellow | `#ffeb3b` | `yellow` |
| Amber | `#ffc107` | `amber` |
| Orange | `#ff9800` | `orange` |
| Deep Orange | `#ff5722` | `deep-orange` |
| Brown | `#795548` | `brown` |
| Blue Gray | `#607d8b` | `blue-gray` |

Defaults are filterable via `unysonplus_default_color_presets`; the live palette via `unysonplus_color_presets`.
