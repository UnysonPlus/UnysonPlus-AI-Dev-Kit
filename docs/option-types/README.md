# Option types — stored value shapes

The reusable **value shapes** behind Theme Settings options and shortcode atts. When a reference
says an option is type `compact color` or `multi-picker`, this folder tells you the exact JSON to
store. One file per type.

**Every option type has its own file here (52 total)** — `docs/option-types/<type>.md`. Highlights:

| File | Stored shape (short) |
|---|---|
| `compact-color.md` | `{predefined:'text-<slug>'\|'bg-<slug>'\|'', custom:'#hex'\|''}` (preset wins) |
| `unit-input.md` | `{value:'<num-string>', unit:'<unit>'}` |
| `responsive.md` | `{base:{value,unit}, md:{…}, lg:{…}}` (mobile-first) |
| `typography.md` | `{family, variation, size, 'line-height', 'letter-spacing', color}` |
| `multi-picker.md` | `{'<picker_id>':'<choice>', '<choice>':{…revealed…}}` |
| `background-pro.md` | color / gradient / image / video layers |
| `image-picker.md` | single → `'<choice>'`; `multiple:true` → `['<choice>',…]` |
| `icon-v2.md` / `icon-v3.md` | `{type:'svg','svg-source':'library','svg-id':'lucide/<name>'}` (typed object) |
| `gradient-v2.md` `box-shadow.md` `position-box.md` `spacing.md` `map.md` `split-slider.md` `column-split.md` | see each file |

### Name aliases (docs call the same type different things)
- **`color-preset`** / **`compact color`** → `compact-color.md`
- **`typography-v2`** → `typography.md` (identical shape; `typography-v2.md` is a pointer)
- **`predefined-colors-color-picker-compact`** → `compact-color.md`
- **any `*-preset` / `*-style-picker`** (button/border/box/table style) → stores a **choice-key
  class string** (see `button-style-picker.md`, `border-style-picker.md`, …)

### Primitives (also have files, but trivial)
**switch** → `'yes'`/`'no'` (never boolean `true` — the check is `=== 'yes'`). **select/radio/radio-text** →
a choice-key string. **checkboxes** → `{'<choice>':true|false}`. **slider/range-slider** → number(s).
**text/short-text** → string. **wp-editor** → HTML string. **upload** → `{attachment_id,url}`.
**Container types** (`multi`, `multi-inline`, `popover`, `popup`) store their inner-options' flattened values.

See also: `../theme-settings/README.md` (which option uses which type) and `../shortcodes/`
(shortcode atts).
