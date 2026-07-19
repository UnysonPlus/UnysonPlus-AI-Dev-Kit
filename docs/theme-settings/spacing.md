# Theme Settings → Components → Spacing

Defines the spacing scale, gap scale, and site-wide default gaps that back UnysonPlus's Bootstrap-style utility classes — this is how an agent sets section padding, column gaps, and element margins (pick a slug like `pt-10`).

## Options

### Spacing Scale — `spacing_scale`

- **Type:** `addable-box` (sortable, duplicatable; add button "Add spacer")
- **Default:** the full default spacing scale below (`unysonplus_default_spacing_scale()`).
- **Choices:** N/A — freeform addable rows. Each row has two text fields:

  | Field | Label | Type | Notes |
  |---|---|---|---|
  | `name` | Name | text | Becomes the slot suffix (e.g. `3` → `.m-3` / `.p-3`). Avoid Bootstrap-reserved names: `sm md lg xl xxl n1 n2 n3 n4 n5 auto`. |
  | `size` | Value | text | Any CSS length: `0.5rem`, `8px`, `calc(1rem + 2px)`… |

- **Saved value shape:** array of `{ name, size }` entries, e.g. `[ { "name": "3", "size": "1rem" }, … ]`.
- **Notes:** Each entry produces a complete set of utilities (`.m-NAME`, `.p-NAME`, `.mt-NAME`, `.mx-NAME`, etc.) plus a `--spacer-NAME` CSS var. Theme Settings override takes precedence over plugin defaults.

### Gap Scale — `gap_scale`

- **Type:** `addable-box` (sortable, duplicatable; add button "Add gap"). Lives in the "Gaps" group.
- **Default:** the default gap scale below (`unysonplus_default_gap_scale()`).
- **Choices:** N/A — freeform addable rows:

  | Field | Label | Type | Notes |
  |---|---|---|---|
  | `name` | Name | text | Slug suffix (e.g. `3` → `.g-3`). |
  | `size` | Value | text | Any CSS length: `0.5rem`, `8px`, `1.25rem`… |

- **Saved value shape:** array of `{ name, size }` entries.
- **Notes:** Values available in every column-gap dropdown (Default Gap below and the per-section Gap field on the Section shortcode). Each slug emits `.g-{slug}` / `.gx-{slug}` / `.gy-{slug}`, `--gap-{slug}`, and `.section--gap-{slug}`.

### Default Gap — `default_gap`

- **Type:** `short-select`
- **Default:** `''`
- **Choices:**

  | Value | Label |
  |---|---|
  | `''` | None (use Bootstrap default — 1.5rem horizontal, 0 vertical) |
  | *(one entry per gap-scale slug)* | the gap-scale names (`0`, `1`, `2`, `3`, `4`, `5`, plus any added) |

- **Notes:** Sets both horizontal and vertical gap on every Bootstrap row site-wide.

### Default Gap X — `default_gap_x`

- **Type:** `short-select`
- **Default:** `''`
- **Choices:**

  | Value | Label |
  |---|---|
  | `''` | Use Default Gap |
  | *(one entry per gap-scale slug)* | the gap-scale names (`0`, `1`, `2`, `3`, `4`, `5`, plus any added) |

- **Notes:** Overrides Default Gap on the horizontal axis only. Honoured even when Default Gap is blank.

### Default Gap Y — `default_gap_y`

- **Type:** `short-select`
- **Default:** `''`
- **Choices:**

  | Value | Label |
  |---|---|
  | `''` | Use Default Gap |
  | *(one entry per gap-scale slug)* | the gap-scale names (`0`, `1`, `2`, `3`, `4`, `5`, plus any added) |

- **Notes:** Overrides Default Gap on the vertical axis only.

## Reference — Default Spacing Scale

Every default slug → size, and the utility classes each slug generates. Utilities: `.pt-{n}`, `.pb-{n}`, `.ps-{n}` / `.pe-{n}` / `.px-{n}`, `.py-{n}`, `.p-{n}`, `.mt-{n}`, `.mb-{n}`, `.mx-{n}`, `.my-{n}`, `.m-{n}` — plus responsive infixes (`.pt-sm-{n}`, `.pt-md-{n}`, `.pt-lg-{n}`, `.pt-xl-{n}`, `.pt-xxl-{n}`, and the same for every prefix) — plus the CSS var `--spacer-{n}`.

| Slug (`n`) | Size | Example classes | CSS var |
|---|---|---|---|
| `0` | `0` | `.pt-0 .pb-0 .mt-0 .mb-0 .p-0 .m-0 .py-0 .px-0` (+ `.pt-lg-0` …) | `--spacer-0` |
| `1` | `0.25rem` | `.pt-1 .pb-1 .mt-1 .mb-1 .p-1 .m-1 .py-1 .px-1` (+ `.pt-lg-1` …) | `--spacer-1` |
| `2` | `0.5rem` | `.pt-2 .pb-2 .mt-2 .mb-2 .p-2 .m-2 .py-2 .px-2` (+ `.pt-lg-2` …) | `--spacer-2` |
| `3` | `1rem` | `.pt-3 .pb-3 .mt-3 .mb-3 .p-3 .m-3 .py-3 .px-3` (+ `.pt-lg-3` …) | `--spacer-3` |
| `4` | `1.5rem` | `.pt-4 .pb-4 .mt-4 .mb-4 .p-4 .m-4 .py-4 .px-4` (+ `.pt-lg-4` …) | `--spacer-4` |
| `5` | `3rem` | `.pt-5 .pb-5 .mt-5 .mb-5 .p-5 .m-5 .py-5 .px-5` (+ `.pt-lg-5` …) | `--spacer-5` |
| `6` | `3.5rem` | `.pt-6 .pb-6 .mt-6 .mb-6 .p-6 .m-6 .py-6 .px-6` (+ `.pt-lg-6` …) | `--spacer-6` |
| `7` | `4rem` | `.pt-7 .pb-7 .mt-7 .mb-7 .p-7 .m-7 .py-7 .px-7` (+ `.pt-lg-7` …) | `--spacer-7` |
| `8` | `4.5rem` | `.pt-8 .pb-8 .mt-8 .mb-8 .p-8 .m-8 .py-8 .px-8` (+ `.pt-lg-8` …) | `--spacer-8` |
| `9` | `5rem` | `.pt-9 .pb-9 .mt-9 .mb-9 .p-9 .m-9 .py-9 .px-9` (+ `.pt-lg-9` …) | `--spacer-9` |
| `10` | `6rem` | `.pt-10 .pb-10 .mt-10 .mb-10 .p-10 .m-10 .py-10 .px-10` (+ `.pt-lg-10` …) | `--spacer-10` |
| `11` | `7rem` | `.pt-11 .pb-11 .mt-11 .mb-11 .p-11 .m-11 .py-11 .px-11` (+ `.pt-lg-11` …) | `--spacer-11` |
| `12` | `8rem` | `.pt-12 .pb-12 .mt-12 .mb-12 .p-12 .m-12 .py-12 .px-12` (+ `.pt-lg-12` …) | `--spacer-12` |

Responsive infixes are `sm` `md` `lg` `xl` `xxl` — e.g. `.pt-lg-{n}`, `.mb-md-{n}`, `.px-xxl-{n}`.

## Reference — Default Gap Scale

Every default gap slug → size, and the classes/vars each generates. Utilities: `.g-{n}` (both axes), `.gx-{n}` (horizontal), `.gy-{n}` (vertical), the section modifier `.section--gap-{n}`, and the CSS var `--gap-{n}`.

| Slug (`n`) | Size | Classes | CSS var |
|---|---|---|---|
| `0` | `0` | `.g-0 .gx-0 .gy-0 .section--gap-0` | `--gap-0` |
| `1` | `0.25rem` | `.g-1 .gx-1 .gy-1 .section--gap-1` | `--gap-1` |
| `2` | `0.5rem` | `.g-2 .gx-2 .gy-2 .section--gap-2` | `--gap-2` |
| `3` | `1rem` | `.g-3 .gx-3 .gy-3 .section--gap-3` | `--gap-3` |
| `4` | `1.5rem` | `.g-4 .gx-4 .gy-4 .section--gap-4` | `--gap-4` |
| `5` | `3rem` | `.g-5 .gx-5 .gy-5 .section--gap-5` | `--gap-5` |

The gap scale caps at `3rem` by design — anything larger is section-level spacing, use the spacing scale instead. Both scales are extendable via Theme Settings; overrides win over these defaults.
