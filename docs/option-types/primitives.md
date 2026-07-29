# Primitives — the built-in option types

The ~20 option types the framework defines in one file (`framework/includes/option-types/simple.php`)
rather than in their own folders. They have no folder, so they are easy to miss — but they are
what most of any `options.php` is actually made of.

Two axes, both documented here: the **stored value** (what lands in the atts / settings JSON)
and the **declaration** (what you write in `options.php`). For the universal keys every field
accepts — `label`, `desc`, `help`, `value`, `attr` — see [declaring-options.md](declaring-options.md).

---

## Text-like

### `text`

The default field. Stores a **string**.

```php
'title' => [
	'type'  => 'text',
	'label' => __( 'Title', 'fw' ),
	'value' => '',
	'attr'  => [ 'placeholder' => 'https://' ],
	// 'dynamic_content' => false,   // hide the Dynamic Content picker
],
```

| Config | Default | Notes |
|---|---|---|
| `value` | `''` | |
| `dynamic_content` | `true` | The Dynamic Content picker is shown by default. Set `false` on fields where a merge tag makes no sense (a numeric setting, a CSS value). |

**Stored:** `"Some text"`

### `short-text` · `medium-text`

`text` with a narrower input. Identical value and config. Use for values that are visibly short
(a number of columns, a duration) so the form does not imply more room than the value needs.

**Stored:** a string.

### `textarea`

Multi-line plain text. Same config as `text` (including `dynamic_content`).

```php
'excerpt' => [
	'type'  => 'textarea',
	'label' => __( 'Text', 'fw' ),
	'value' => '',
],
```

**Stored:** a string, newlines preserved.

> Prefer `textarea` over `wp-editor` for anything that occupies one fixed slot in a design. A
> full editor invites pasted headings, lists and inline styles that break the layout — and
> classes on prose, which the clean-DOM convention forbids. Render it with
> `nl2br( esc_html( $v ) )`, not `wpautop()`.

### `password`

A masked input. **Stored:** a string, in plain text — masking is a UI affordance, not
encryption. Do not use it as a security measure.

### `html` · `html-fixed` · `html-full`

Not inputs. They render arbitrary markup inside the options form — a notice, an explanatory
block, a link to a settings page.

```php
'notice' => [
	'type'  => 'html',
	'label' => false,
	'html'  => '<p>' . esc_html__( 'Configure the palette in Theme Settings → Colors.', 'fw' ) . '</p>',
],
```

| Config | Default | Notes |
|---|---|---|
| `html` | `'<em>default html</em>'` | The markup to render. |
| `value` | `''` | Still stored — usually irrelevant. |

`html-fixed` and `html-full` differ only in how much of the row's width the markup gets
(`html-full` drops the label column entirely).

**Stored:** `''`. Treat these as non-storing.

### `hidden`

An input the user never sees, for a value your code sets. **Stored:** a string.

---

## Numbers

### `number`

```php
'delay' => [
	'type'         => 'number',
	'label'        => __( 'Delay', 'fw' ),
	'value'        => 0,
	'min'          => 0,
	'max'          => 5000,
	'step'         => 100,
	'numeric_type' => 'int',      // 'float' (default) | 'int'
],
```

| Config | Default |
|---|---|
| `value` | `0` |
| `min` / `max` / `step` | `null` |
| `numeric_type` | `'float'` |

**Stored:** a number.

> **The trap:** an untouched `number` field saves as `0`, not as empty. So `0` cannot be
> distinguished from "the user left it alone". Where that matters — a z-index, an override that
> should be absent when unset — treat `0` as unset in the consumer, or use a `text` field and
> validate.

For a *bounded* number prefer [`slider`](slider.md): the bounds are visible in the UI rather
than enforced after the fact.

---

## Choices

### `select`

```php
'alignment' => [
	'type'    => 'select',
	'label'   => __( 'Alignment', 'fw' ),
	'value'   => 'left',
	'choices' => [
		'left'   => __( 'Left', 'fw' ),
		'center' => __( 'Center', 'fw' ),
		'right'  => __( 'Right', 'fw' ),
	],
],
```

| Config | Default |
|---|---|
| `value` | `''` |
| `choices` | `[]` — `'key' => 'Label'` |

**Stored:** the choice **key**, as a string.

Three rules that come up constantly:

- **Never use integer or boolean array keys.** PHP silently casts `'1'` to `1`, and the
  comparison against the saved string then fails. Keys must be non-empty strings.
- `''` is a legitimate key when the choice means "none / inherit" — but only as an *explicit*
  choice. Do not rely on it as a fallback.
- **A choice key can be the CSS class you emit.** `'text-center' => __( 'Center' )` lets the
  view echo the value directly, which removes a mapping array and a whole class of bugs. Many
  shipped elements do exactly this.

### `short-select` · `medium-select`

`select` with a narrower control. Identical value and config.

### `select-multiple`

A multi-select. **Stored:** an **array of keys** (default `[]`).

See also [multi-select.md](multi-select.md) for the richer tag-style control.

### `radio`

Same shape as `select`, rendered as radio buttons. Adds `inline` (default `false`) to lay the
options out in a row.

```php
'style' => [
	'type'    => 'radio',
	'label'   => __( 'Style', 'fw' ),
	'value'   => 'solid',
	'inline'  => true,
	'choices' => [ 'solid' => __( 'Solid', 'fw' ), 'outline' => __( 'Outline', 'fw' ) ],
],
```

**Stored:** the choice key, as a string.

Use `radio` over `select` when there are 2–4 choices and seeing them all at once helps. Beyond
that, a select. For visual variants, [`image-picker`](image-picker.md) beats both.

### `checkbox`

A single on/off box.

| Config | Default |
|---|---|
| `value` | `false` |
| `text` | `__( 'Yes' )` — the label beside the box |

**Stored:** a **boolean**.

> ⚠️ **`checkbox` and `switch` are not interchangeable.** `checkbox` stores a real boolean;
> [`switch`](switch.md) stores the **strings** `'yes'` / `'no'`. Mixing them up produces code
> that is wrong only in the falsy case, which is exactly the case nobody tests. **Element
> options should use `switch`** — it is what every shipped element uses, so consumers can rely
> on `=== 'yes'` everywhere.

### `checkboxes`

Several independent boxes.

| Config | Default |
|---|---|
| `value` | `[]` |
| `choices` | `[]` — `'key' => 'Label'` |
| `inline` | `false` |

**Stored:** a **map of every choice to a boolean** — `{"a": true, "b": false}` — not a list of
the checked ones. Read it with `! empty( $v['a'] )`.

---

## Special

### `unique`

Generates and stores an identifier the user never edits — used where markup needs a stable
per-instance id.

| Config | Default |
|---|---|
| `value` | `''` |
| `length` | `0` (unlimited) |
| `prefix` | `''` |

**Stored:** a string.

> For page-builder elements you rarely need this: the wrapper already gets a per-instance unique
> class from `sc_build_wrapper_attr()`. Reach for it only when something outside the wrapper
> needs to reference the instance.

### `gmap-key`

A `text` subclass for the Google Maps API key. Stored in a **WordPress option**, not in the
containing options set — so the key is entered once and shared, rather than duplicated into
every element that renders a map.

---

## Quick reference

| Type | Stored | Empty / default |
|---|---|---|
| `text` `short-text` `medium-text` | string | `''` |
| `textarea` | string | `''` |
| `password` | string (plain) | `''` |
| `hidden` | string | `''` |
| `html` `html-fixed` `html-full` | — (display only) | `''` |
| `number` | number | `0` |
| `select` `short-select` `medium-select` | choice key (string) | `''` |
| `select-multiple` | array of keys | `[]` |
| `radio` | choice key (string) | `''` |
| `checkbox` | **boolean** | `false` |
| `checkboxes` | `{key: bool}` for every choice | `[]` |
| `unique` | string | `''` |

See also: [containers.md](containers.md) (`box`, `group`, `tab`, `popup`) and
[declaring-options.md](declaring-options.md).
