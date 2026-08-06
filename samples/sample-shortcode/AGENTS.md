---
type: shortcode
name: sample_shortcode
provides: leaf
---

# Sample Shortcode

<!--
	============================================================================
	THIS IS A TEMPLATE. Fill it in for your element and delete these comments.
	============================================================================

	Write a sibling AGENTS.md for every element you create. It is not
	documentation for its own sake — the options table below is the CONTRACT an
	AI generator reads to emit valid page-builder JSON for this element. If it
	drifts from options.php, generated atts are invalid and the server rejects
	them on import.

	Keep it accurate in the same commit that changes options.php. Not later.
-->

One paragraph: what this element renders, and what makes it distinct from the elements a
reader might otherwise reach for. Name the closest alternative and say when to choose this one
instead — that is the sentence that actually gets read.

**Node shape:** `{ type: 'simple', shortcode: 'sample_shortcode', _items: [], atts: { … } }`,
plus the shared wrapper blocks (`common`, `fx`, `spacing`) every node carries.

<!-- Section-like elements say instead:
	provides: section-like (in the frontmatter)
	**Node shape:** `{ type: 'sample_shortcode', _items: [ …columns… ], atts: { … } }`
	This element follows the section-like recipe — see the shortcodes extension's own AGENTS.md.
-->

## Options schema (atts)

<!--
	One row per LEAF option. Omit tab and group containers — they are layout
	only and do not appear in the saved value.

	`value shape` must be the EXACT stored JSON, not a description of the UI.
	This is the column people get wrong: a `switch` stores the string 'yes',
	not `true`; an `upload` stores `''` when empty, not `{}`.
-->

| Att | Type | Default | Value shape / choices | What it does |
|---|---|---|---|---|
| `title` | text | `''` | string | The element heading. |
| `text` | textarea | `''` | string (newlines become `<br>`) | Supporting copy. |
| `heading_tag` | select | `'h2'` | `'h2'` `'h3'` `'h4'` `'div'` | Heading level. Chosen by outline position, not by size. |
| `alignment` | select | `'left'` | `'left'` `'center'` `'right'` | Horizontal alignment. |
| `text_color` | compact color | `{predefined:'',custom:''}` | `{predefined:'text-<slug>'\|'', custom:'#hex'\|''}` | Text colour on the wrapper. **Reserved id** — applied by the framework. |
| `bg_color` | compact color | `{predefined:'',custom:''}` | `{predefined:'bg-<slug>'\|'', custom:'#hex'\|''}` | Background colour. **Reserved id.** |
| `title_color` | compact color | `{predefined:'',custom:''}` | same shape | Overrides `text_color` for the heading only. Resolved in the view. |
| `spacing` | spacing | see option-types doc | margin/padding utility classes | Margin and padding. **Reserved id.** |

## Ready-to-use example

<!--
	A complete, valid atts object a generator can copy. Include EVERY option —
	the builder validates each item against the full schema, so a partial
	object is rejected. This block is the fastest way for a reader to get the
	shape right, and the fastest way for you to spot that the table above has
	drifted.
-->

```json
{
  "title": "Section heading",
  "text": "One or two supporting sentences.",
  "heading_tag": "h2",
  "alignment": "left",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" }
}
```

## Rendering

<!--
	What the markup looks like, and which classes matter. A reader writing
	custom CSS against this element should not have to open view.php.
-->

Outputs a single wrapper carrying the element's base class plus everything
`sc_build_wrapper_attr()` folds in (unique class, Advanced-tab settings, spacing utilities,
Animation Engine hooks):

```html
<div class="sample-shortcode is-align-left ss-abc12345">
	<h2 class="sample-shortcode__title">…</h2>
	<p class="sample-shortcode__text">…</p>
</div>
```

- `.sample-shortcode__title` — the heading; its tag comes from `heading_tag`.
- `.sample-shortcode__text` — the prose. Carries no other classes, by convention.
- `.is-align-{left|center|right}` — the alignment modifier.

## Pitfalls

<!--
	Only what is surprising about THIS element. Do not restate the general
	conventions — link to them. If there is nothing surprising, say so; an
	empty section is more useful than a padded one.
-->

- Nothing renders when both `title` and `text` are empty — the view returns early rather than
  emitting an empty wrapper.
- `heading_tag` is whitelisted in the view; an unrecognised value silently falls back to `h2`.

## Verification

<!-- Anything specific to this element, beyond the generic checklist in README.md. -->

Beyond the standard checks: set `heading_tag` to each choice and confirm the rendered tag
changes, and place two instances on one page with different alignments.

## Files

- `config.php` — builder tile + canvas preview
- `options.php` — the atts contract
- `static.php` — enqueues + render helpers
- `views/view.php` — front-end markup
- `static/css/styles.css` · `static/js/scripts.js` · `static/img/page_builder.svg`
