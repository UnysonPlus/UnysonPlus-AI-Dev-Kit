# Theme Settings — Social

The **Social** tab holds site-wide social profiles (consumed by the header Social Icons element and the footer) plus their global icon styling. Each option is enumerated with all valid values.

Compact color controls (`sc_color_field_compact`) save as `{ predefined: '<text-slug>|<bg-slug>', custom: '#hex' }`; empty = inherit/transparent. Preset slugs come from the live palette (see the Colors doc).

---

# Social Icon Presets — `social_presets`
- **Type**: preset-loader (targets `preset_group: social_style`)
- **Notes**: not a stored value — clicking a preset writes the `social_style` leaves below. Choices are the registered `social_style` presets.

---

# Social Icon Style — `social_style`

Global look of the icons. Stored under the `social_style` multi key (group `group_social_style`).

### Icon Style — `social_icon_style`
- **Type**: image-picker · **Default**: `bare`
- **Choices**:

| value | label |
|---|---|
| bare | Bare |
| circle | Circle |
| circle-outline | Circle Outline |
| rounded | Rounded |
| square | Square |
| square-outline | Square Outline |

- **Notes**: Bare shows just the glyph; the others draw a shaped chip behind it.

### Icon Size — `social_icon_size`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'2.25', unit:'rem' }` · min 0
- **Notes**: chip diameter (or glyph size for Bare).

### Gap Between Icons — `social_icon_gap`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'0.5', unit:'rem' }` · min 0

### Use Brand Colors — `social_icon_brand`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | On |
| no | Off |

- **Notes**: colors each icon with its network's brand color; overrides Icon/Background colors below.

### Icon Color — `social_icon_color`
- **Type**: compact color (kind text) · **Default**: empty (inherit surrounding text color) · **Saved shape**: `{ predefined, custom }`

### Background — `social_icon_bg`
- **Type**: compact color (kind bg) · **Default**: empty (transparent) · **Saved shape**: `{ predefined, custom }`
- **Notes**: chip background (filled styles).

### Icon Hover Color — `social_icon_hover_color`
- **Type**: compact color (kind text) · **Default**: empty · **Saved shape**: `{ predefined, custom }`

### Background Hover — `social_icon_hover_bg`
- **Type**: compact color (kind bg) · **Default**: empty · **Saved shape**: `{ predefined, custom }`

### Hover Effect — `social_icon_hover_fx`
- **Type**: select · **Default**: `none`
- **Choices**:

| value | label |
|---|---|
| none | None |
| lift | Lift |
| scale | Scale up |
| fill | Fill (fade background in) |

---

# Social Profiles — `social_profiles`

The list of profile links. Stored under the `social_profiles` key.

- **Type**: addable-box (repeatable)
- **Default value**: three rows — Facebook (`https://facebook.com/`, `fab fa-facebook-f`), X (`https://x.com/`, `fab fa-x-twitter`), Instagram (`https://instagram.com/`, `fab fa-instagram`); all `new_tab: 'yes'`.
- **Saved value shape**: array of `{ name, link, icon, new_tab }` objects.
- **Row template**: `<p><strong>{{name}}</strong><br>{{link}}</p>`

Per-row box-options:

### Name — `name`
- **Type**: text · **Default**: `''`
- **Notes**: network name (link label / aria-label). Brand color matched by name (facebook, x, instagram, youtube, linkedin, …).

### URL — `link`
- **Type**: text · **Default**: `''`
- **Notes**: full profile URL including `https://`.

### Icon — `icon`
- **Type**: icon-v2 (preview_size medium, modal_size medium)
- **Saved value shape**: `{ type:'icon-font', 'icon-class':'fab fa-…', 'icon-class-without-root':'fa-…', 'pack-name':'font-awesome' }` (icon-v2 value object).

### Open in New Tab — `new_tab`
- **Type**: switch · **Default**: `yes`
- **Choices**:

| value | label |
|---|---|
| yes | Yes |
| no | No |
