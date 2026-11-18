<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Container types — `box`, `group`, `tab`, `column`, `popup`

Containers hold other options. They are **layout only**: with one exception noted below, a
container does **not** appear in the saved value, so the stored options are **flat**.

```php
'tab_content' => [ 'type' => 'tab', 'options' => [
	'group_main' => [ 'type' => 'group', 'options' => [
		'title' => [ 'type' => 'text' ],
	] ],
] ],
```

stores `{"title": "…"}` — **not** `{"tab_content": {"group_main": {"title": "…"}}}`.

Two consequences worth internalising:

- **Adding, removing, renaming or re-nesting a container never loses data.** Leaf ids are the
  only thing that identifies a value. Restructure a settings page freely.
- **Leaf ids must be unique across the whole options array**, not just within their container.
  Two fields called `title` in different tabs are the same value.

The container id (`group_main` above) is a key for the array only — it is never stored and
never appears in markup you care about. Give containers descriptive ids anyway; they are how
you talk about sections of the form.

> **The exception:** [`multi-picker`](multi-picker.md) *does* nest into the value — that is its
> whole purpose. It is an option type, not a container type, but it is easy to mistake for one.

---

## `tab`

Top-level sections of an options form, rendered as horizontal tabs.

```php
'tab_style' => [
	'type'    => 'tab',
	'title'   => __( 'Style', 'fw' ),
	'options' => [ /* groups */ ],
],
```

| Config | Default |
|---|---|
| `title` | `''` |

**For page-builder elements the tab set is conventional, and the order matters** — users learn
it once and expect it everywhere:

`Content` · `Design` · `Style` · `Animations` · `Advanced`

The last two are framework-supplied. Never hand-roll them:

```php
'tab_animation' => [
	'title'   => __( 'Animations', 'fw' ),
	'type'    => 'tab',
	'options' => sc_get_animation_fields(),
],
'tab_advanced' => [
	'title'   => __( 'Advanced', 'fw' ),
	'type'    => 'tab',
	'options' => [
		'advanced_settings' => [ 'type' => 'group', 'options' => sc_get_advanced_tab() ],
	],
],
```

---

## `group`

A border-less wrapper. Its only job is to make the fields inside read as one block, with no
dividing lines between rows.

```php
'group_colors' => [
	'type'    => 'group',
	'options' => [ /* leaf fields */ ],
],
```

No config keys.

**Use one inside every `box` and every `tab`.** A `box` whose fields are not wrapped in a
`group` renders with a border between each row, which reads as several unrelated settings
rather than one section. This is the single most common cosmetic defect in a hand-written
options page.

---

## `box`

Renders as a WordPress **postbox** — a bordered card with a title bar and a collapse handle,
inside a `.fw-backend-postboxes.metabox-holder` wrapper. This is the standard look of a
settings page.

```php
'general_box' => [
	'type'    => 'box',
	'title'   => __( 'General', 'fw' ),
	'options' => [
		'group_general' => [ 'type' => 'group', 'options' => [ /* fields */ ] ],
	],
],
```

| Config | Default |
|---|---|
| `title` | `''` |

- `'title' => ''` renders a thin bare header bar and effectively does not collapse. That is
  expected, not a bug — it is how you get a single un-titled card.
- Use a **unique group id per box** (`group_general`, `group_labels`, …).
- Apply the box → group pattern to **every** box in an array. One un-grouped box among grouped
  ones is immediately visible.

### Where `box` belongs

| Context | Use `box`? |
|---|---|
| An extension's `settings-options.php` | **Yes** — this is the canonical layout |
| A custom admin page built from option arrays | **Yes** — see below |
| A page-builder element's edit modal | **No** — use `tab` → `group` |
| A bespoke management dashboard (card grids, install panels) | **No** — see the exception below |

**Custom admin pages must not hand-roll `<div class="postbox"><div class="inside">`.** Let the
`box` container produce the metabox-holder instead: keep `get_page_options()` returning the raw
leaf options, add a `get_page_boxes()` that wraps them in `box` → `group`, and in
`render_page()` call `fw()->backend->render_options( $this->get_page_boxes(), $values )`. Leaf
ids are unchanged, so saving (`fw_get_options_values_from_input`) and static enqueueing
(`enqueue_options_static`) keep calling `get_page_options()` untouched.

**The exception — bespoke management UIs.** An admin screen that is a hand-built dashboard with
its own HTML/CSS/JS (a searchable card grid modelled on the Plugins screen, say) is exempt.
Wrapping it in postbox chrome adds a bordered card around a grid of bordered cards and fights
its own CSS. The rule applies to pages built from option arrays, not to every admin page.

---

## `column`

Lays options out side by side. **Adjacent** `column` containers render as ONE row (the renderer hands
same-type containers that sit next to each other to one render call, as it does for `box`). Still flat:
wrapping options in columns, or unwrapping them, never changes the saved value.

```php
'design_main' => [
	'type'    => 'column',
	'width'   => '3/5',
	'options' => [ /* the controls */ ],
],
'design_side' => [
	'type'        => 'column',
	'width'       => '2/5',
	'sticky'      => true,
	'stack_first' => true,
	'options'     => [ /* e.g. a live preview */ ],
],
```

| Config | Default | Notes |
|---|---|---|
| `width` | `''` | `"n/d"` share of the row (the `column-split` fraction strings). Empty = share the rest equally. |
| `sticky` | `false` | Pinned while the row scrolls; side by side only unless also `stack_first`. |
| `stack_first` | `false` | First when stacked (and pinned there if `sticky`). |
| `stack_below` | `960` | Read from the row's FIRST column: the row's own width (px) under which it stacks. |
| `attr` | `[]` | Wrapper attributes; `class` is appended. |

How it renders: `.fw-backend-columns` (a CSS container, `container: fw-columns / inline-size`) →
`.fw-backend-columns__row` (flex, stacked by default) → one `.fw-backend-column` per column, its share in
`--fw-col-flex`. Each row emits a small scoped `<style>` with `@container fw-columns (min-width: <stack_below>px)`
that turns it into side-by-side columns and pins the sticky one — scoped per row because a container query
can't read a CSS variable. Because it measures the row, not the window, the same form stacks in a narrow
modal or the Live Editor's side panel and splits in the `full` popup. Class:
`framework/includes/container-types/column/class-fw-container-type-column.php`; styles at the end of
`framework/static/css/backend-options.css`.

Use it with the **`full`** shortcode popup size (`config.php` → `'popup_size' => 'full'`), which otherwise
stretches every option across the window. Reference use: the Motion Gallery's Design tab
(`animation-engine/shortcodes/gallery-3d/options.php` → `design_main` / `design_side`).

---

## `popup`

Puts its options behind a button that opens a modal. Use it to keep an advanced or rarely-touched
cluster out of the main form.

```php
'advanced_popup' => [
	'type'       => 'popup',
	'title'      => __( 'Advanced', 'fw' ),
	'modal-size' => 'medium',      // small | medium | large | full
	'desc'       => __( 'Rarely-needed settings.', 'fw' ),
	'options'    => [ /* fields */ ],
],
```

| Config | Default |
|---|---|
| `modal-size` | `'small'` |
| `desc` | `''` |

Still flat: the fields inside store exactly as if they were on the main form.

> Not to be confused with [`popup`-suffixed option types](addable-popup.md) —
> `addable-popup` is a repeater whose rows open in a modal, and it **does** store its rows as an
> array.

---

## Tabs on admin pages — use native WordPress markup

For an extension's own admin page, tabs are **native `nav-tab-wrapper`** markup, not a
hand-rolled pill/button UI:

```html
<h2 class="nav-tab-wrapper fw-myext-tabs">
	<a href="#general" class="nav-tab nav-tab-active" data-tab="general">General</a>
	<a href="#advanced" class="nav-tab" data-tab="advanced">Advanced</a>
</h2>
```

…one panel `<div>` per tab, toggled by a small script that moves `nav-tab-active` and
shows/hides the matching panel. CSS is minimal:
`.fw-myext-tabs .nav-tab { border-radius: .25rem .25rem 0 0 }`.

- When a tab's body is **option-array** content, render it through
  `fw()->backend->render_options()` so each `box` becomes a real postbox.
- When a tab's body is a **bespoke UI**, you may still frame its sections as postboxes by hand —
  `metabox-holder` → `.postbox` → `.postbox-header > h2.hndle` + `.handlediv` → `.inside` —
  then add core's `postbox` script as a dependency and call
  `postboxes.add_postbox_toggles( pagenow )` so the collapse arrows work natively.

See also: [declaring-options.md](declaring-options.md) · [primitives.md](primitives.md) ·
[multi-picker.md](multi-picker.md)
