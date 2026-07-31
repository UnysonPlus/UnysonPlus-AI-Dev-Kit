# `row` — grid row (structural, **auto-synthesized** — you don't author it)

The middle layer of the page-builder hierarchy: **`section` → `row` → `column` → leaf shortcodes.** A
row is one Bootstrap row of columns. It is **invisible in the editor** (no Layout-Elements thumbnail)
and has **no user options** — it exists only to wrap columns.

## You do NOT emit `row` nodes — put columns directly in a section

When authoring builder JSON (e.g. a `build-<slug>.mjs` factory or `upw-build-pages.php`), a section's
`_items` holds **columns directly**; the page-builder **items corrector auto-wraps adjacent columns
into a synthesized row** at save time. Columns flex-wrap by total width (`7_12`+`5_12` → one row; four
`1_4` → two rows). See [`column.md`](column.md) for the width slugs and column atts, and
[`README.md`](README.md) for the node model.

```js
// CORRECT — columns go straight into the section; the row is synthesized for you:
{ type: 'section', _items: [
    { type: 'column', width: '1_2', _items: [ /* leaves */ ], atts: {…} },
    { type: 'column', width: '1_2', _items: [ /* leaves */ ], atts: {…} },
], atts: {…} }
// Do NOT hand-wrap them in a { type:'row', … } node — the corrector handles grouping.
```

## Node shape (for reading exported JSON only)

In already-saved / exported builder JSON you WILL see the wrapper:

```js
{ type: 'row', _items: [ /* columns */ ], atts: { …common… } }
```

It carries only the shared **`common`** block (identity + advanced — see [`README.md`](README.md));
there are no row-specific options. Row-level layout (vertical alignment of columns, gaps) is expressed
on the **section** (`content_valign`, `gap`/`gap_y`) and on each **column** (`align_self`,
`content_gap`), not on the row.

## Registration (reference)

`class-fw-shortcode-row.php` (`FW_Shortcode_Row`) registers the `Page_Builder_Row_Item` for the editor
only. It is **not** `section_like` (rows sit inside sections, never at root), returns no thumbnails, and
exposes no options to the frontend collector. The items corrector enforces the
`section → row → column → leaf` nesting automatically; **nesting is one level only** for columns.
