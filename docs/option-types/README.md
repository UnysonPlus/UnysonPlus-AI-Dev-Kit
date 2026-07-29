# Option types — stored value shapes

> 📖 **Human manual (live, always current):** [Option types on the UnysonPlus docs](https://unysonplus.github.io/docs/options/option-types). These kit files are the AI-optimized reference; the live manual is the human companion.

The reusable **value shapes** behind Theme Settings options and shortcode atts. When a reference
says an option is type `compact color` or `multi-picker`, this folder tells you the exact JSON to
store.

> **Two directions, two entry points.** These files are written from the *reading* side — what
> an option **stores**, which is what you need to generate a page. If you are **writing** an
> options array (a new shortcode, an extension settings page, a Theme Settings section), start
> at **[declaring-options.md](declaring-options.md)** instead: it covers the keys every field
> accepts, how to pick a type, and the conventions that are not optional.

**Most option types have their own file** — `docs/option-types/<type>.md`. The ~20 built-in
primitives and the 4 container types are grouped rather than given a file each:

| Grouped file | Covers |
|---|---|
| **[primitives.md](primitives.md)** | `text` `short-text` `medium-text` `textarea` `password` `hidden` `number` `select` `short-select` `medium-select` `select-multiple` `radio` `checkbox` `checkboxes` `html` `html-fixed` `html-full` `unique` `gmap-key` |
| **[containers.md](containers.md)** | `box` `group` `tab` `popup` — layout only, **not stored** |
| **[declaring-options.md](declaring-options.md)** | The authoring side: universal keys, type selection, required conventions, migrations |

Highlights from the per-type files:

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

### Primitives — quick reference (full detail in [primitives.md](primitives.md))
**switch** → `'yes'`/`'no'` (never boolean `true` — the check is `=== 'yes'`). **checkbox** → a real
boolean `true`/`false` (**not** interchangeable with `switch`). **select/radio/radio-text** → a
choice-key string. **checkboxes** → `{'<choice>':true|false}` for *every* choice, not just the
checked ones. **slider/range-slider** → number(s). **number** → number (an untouched field saves
as `0`, not empty). **text/short-text/textarea** → string. **wp-editor** → HTML string.
**upload** → `{attachment_id,url}`, or `''` when empty. **html** → display only, stores `''`.
**Wrapping types** (`multi`, `multi-inline`, `popover`, `popup`) store their inner options'
flattened values.

See also: `../theme-settings/README.md` (which option uses which type) and `../shortcodes/`
(shortcode atts).
