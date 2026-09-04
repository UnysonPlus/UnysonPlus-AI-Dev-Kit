# Page-builder shortcodes — node model + index

> 📖 **Human manual (live, always current):** [Shortcodes on the UnysonPlus docs](https://unysonplus.github.io/docs/shortcodes/overview) — prose, screenshots of each element's option panels, and live playgrounds. These kit files are the AI-optimized reference; the live manual is the human companion.

How to build a UnysonPlus page-builder page as **JSON**, without reading plugin source. A page is a
**JSON array of container nodes** — modern pages lead with the **flexbox "Div"** primitive; the classic
`section`/`row`/`column` Bootstrap grid is still fully supported (and auto-synthesized for classic
pages). Each file in this folder documents one shortcode's **shortcode-specific atts**. The shared
wrapper blocks (below) are carried by *every* node — the per-shortcode files don't repeat them.

## Two container models — Div-first (default) and the classic grid (legacy)

The default page-builder container is now the **`flexbox` shortcode** — the **"Div"**. In the element
picker its palette tab is **"Structure"**, and it renders three tiles under **"Layout Elements"**:
**Section** (`html_tag:section`, `display:block`), **Flexbox** (`div`, `display:flex`) and **Grid**
(`div`, `display:grid`) — the primitives you reach for to START a layout. The classic Bootstrap
`section`/`row`/`column`/`container`/`bleed-section` tiles are **demoted to a "Classic" palette tab**.

### Modern: Div-first (the default)

A Div is one `flexbox` node; its `atts.html_tag` + `atts.display` decide whether it's a Section band, a
flex row/stack, or a Grid. Children — elements **or** nested Divs — sit **directly** in `_items` (no
`row`/`column` wrapper), and **nesting is arbitrary** (Divs nest as deep as the design needs). Width is
carried by the Div's own responsive `width` att (a 12-col span); the front end emits house `fw-*`
utility classes (`fw-flex`, `fw-grid`, `fw-span-{bp}-N`, `fw-gap{bp}-*`, `fw-justify{bp}-*`,
`fw-items{bp}-*`, order/grow) — **not** Bootstrap `.fw-row`/`fw-col`. See [`flexbox.md`](flexbox.md).

```js
// A <section> band → a Grid Div → two Flexbox cells (each groups its own content).
{ type: 'flexbox', atts: { html_tag: 'section', display: 'block' }, _items: [
    { type: 'flexbox', atts: { display: 'grid', grid_columns: '2' }, _items: [
        { type: 'flexbox', atts: {}, _items: [ /* elements or more Divs */ ] },
        { type: 'flexbox', atts: {}, _items: [ /* … */ ] },
    ] },
] }

// leaf — a shortcode element (same in both models). _items is always []. `shortcode` is the tag.
{ type: 'simple', shortcode: 'special_heading', _items: [], atts: { …shortcode atts… } }
```

### Classic: the Bootstrap grid (legacy — still valid)

The older three node types build one Bootstrap row of columns. Still fully supported; classic Column
drops still force a `section → row → column → leaf` tree (the items-corrector synthesizes the `row`).
Prefer the Div model above for NEW pages.

```js
// section — one per band of the page. _items = its columns.
{ type: 'section', _items: [ /* columns */ ], atts: { …section atts… } }

// column — inside a section (or nested one level). width is a fraction slug. _items = leaves/columns.
{ type: 'column', width: '1_1', _items: [ /* leaves */ ], atts: { …column atts… } }
```

**Classic column widths:** `1_1` `1_2` `1_3` `2_3` `1_4` `3_4` `1_5` (⅕ — the ONLY fifth) `1_6` `5_6`
`5_12` `7_12` … Twelfths + the single `1_5`. Columns in a section **flex-wrap** by total width
(e.g. `7_12`+`5_12` = row 1, four `1_4` = row 2), and emit `fw-col-{bp}-N` classes. **Classic nesting is
ONE level only** — a column inside a column is fine; deeper leaks raw `[/fw_inner_*]` text. (Div nesting
has no such limit.)

## Shared wrapper blocks (every node's atts include these)

**`common`** — identity + advanced (on section/column/leaf):
```js
{ unique_id: '<32-hex>', css_id: '', css_class: '', custom_css: '', element_position: '',
  element_overflow: '', responsive_hide: [], dc_logged: '', dc_roles: [], dc_start: '',
  dc_end: '', custom_attrs: [] }
```
- `css_class` = the hook your bespoke CSS (Theme Settings → Misc → Custom CSS) targets.
- `custom_css` = per-element Advanced CSS; the keyword **`selector`** resolves to this element's
  `.u{hash}` wrapper (e.g. `'selector .btn{…}'`).

**`fx`** — effects (on every node); default all-off:
```js
{ animation: {enable:'no', yes:{effect:'',speed_preset:'',advanced_tweaks_heading:'',delay:0,
    custom_duration:0,repeat_count:1,loop_forever:'no',replay_on_scroll:'no',easing:''}},
  gsap_motion:{effect:'none'}, interaction:{effect:'none'}, interaction__2:{effect:'none'},
  interaction__3:{effect:'none'}, interaction__4:{effect:'none'}, physics:{effect:'none'},
  parallax:{effect:'none'}, marquee:{effect:'none'}, text_effect:{effect:'none'},
  scroll_reveal:{effect:'none'}, flip_card:{effect:'none'}, scroll_text_highlight:{effect:'none'} }
```
Animation Engine effects ride these slots — e.g. `gsap_motion:{effect:'reveal',reveal:{direction,style,distance,delay,start,once,run_on_mobile}}`, `interaction:{effect:'spotlight',spotlight:{…}}`, `interaction__2:{effect:'lift'}` (requires the `animation-engine` extension active).

**`spacing`** — margin/padding (on leaf & column; section uses its own):
```js
{ margin:{all:'',top:'',right:'',bottom:'',left:''}, padding:{…same…},
  advanced:{ md:{margin:{…},padding:{…}}, lg:{margin:{…},padding:{…}} } }
```
Values are **spacing-scale utility classes** (e.g. `mb-block`, `pt-section`), NOT px.

## Style with native options — never inline `style=` for layout/colour

When you author a node's `atts`, **use the shortcode's own options + Theme Settings for width, spacing,
colour, size and alignment — not hand-rolled inline CSS.** Read the shortcode's doc in this folder
*before* emitting its atts so you use the real option instead of guessing or reaching for `style=`.
The option almost always exists already:

- **Width / readability** → `text_block.max_width` (`read` ≈ 65ch, and it centres the block),
  `special_heading.block_max_width`, section container width. Not `style="max-width:…;margin:0 auto"`.
- **Spacing** → the `spacing` block (margin/padding) on any node; section `padding_*` / `gap`. Not `style="margin:…"`.
- **Colour** → `text_color` / `bg_color` / `link_color` etc., always the compact color-preset shape
  `{ predefined, custom }` tied to the palette. Not `style="color:#3a4757"` or a raw hex.
- **Size / alignment / line-height** → `font_size_preset`, `text_align`, `line_height`, `para_spacing`,
  `display_size`. Not inline font/line CSS.

Inside a `text_block`'s WYSIWYG `text`, keep the HTML semantic (`<p>`, `<ul>`/`<ol>`/`<li>`, `<a>`,
`<strong>`) with **no `class=` and no layout `style=`**. The only defensible inline `style=` is content
that truly can't be an option — an inline SVG icon glyph, or a deliberate visual **demo prop** (a box
whose whole purpose is to show an animation). A styled `<ol>`/`<div>` substituting for max-width +
margin + colour is the anti-pattern — it drifts from the theme and can't be edited in the builder.

## Build & import

**Use the helper — don't store the value by hand.** [`tools/upw-build-pages.php`](../../tools/upw-build-pages.php)
(`upw_build_page($idOrSlug, $title, $tree)`) writes the builder value correctly and leaves the page
editable in the visual builder. Full recipe + the storage rules: [`docs/building-pages.md`](../building-pages.md).

```php
require __DIR__ . '/../../tools/upw-build-pages.php';
// Modern Div-first (default): a <section> band holding one Flexbox with a heading.
$tree = array( upw_div_section(array( upw_flexbox(array(
  upw_element('special_heading', array('title'=>'Hi','heading'=>'h2')),
)))) );
echo upw_build_page('my-page', 'My Page', $tree);   // slug (created if missing) or numeric ID
// Classic Bootstrap grid (still supported): upw_section( upw_column('1_1', [ … ]) ).
```

> ⚠️ **Do NOT use `fw_set_db_post_option($pid, 'page-builder', …)` to store the tree** — its input
> sanitizer empties the value (the page then renders nothing). The reliable path (encoded in the
> helper): delete the builder meta first, then write the flat `fw:opt:ext:pb:page-builder:json`
> **and** `builder_active` keys **and** the `fw_options['page-builder']` aggregate; update the post row
> with `$wpdb` (not `wp_update_post`, which re-syncs on `save_post`); and don't render at build time.
> See [`docs/building-pages.md`](../building-pages.md) for why.

Set atts VERBATIM — the builder validates each item against `fw_get_options_values_from_input`, so
every sub-shape must be present (that's why the wrapper blocks above are always included).

## Index (this folder)

**Every shortcode has its own file here** (~90 total) — open `docs/shortcodes/<name>.md` for its
atts. Filenames are the shortcode folder name (kebab); the tag is dashes→underscores
(`call-to-action.md` → `call_to_action`). `image.md` = the `media_image` shortcode.

**Structure / layout:** `flexbox` (the **Div** — default container) · `section` · `row` · `column` · `container` · `bleed-section` *(the last four are the classic/legacy Bootstrap grid)* · `masonry-section` · `divider` · `steps` · `timeline`
**Headings / text:** `special-heading` · `text-block` · `blockquote` · `highlight-text` · `animated-heading` · `text-expander` · `toc`
**CTA / actions:** `button` · `call-to-action` · `badge` · `newsletter`
**Cards / features:** `icon-box` · `feature-list` · `image-box` · `image-content` · `flip-box` · `pricing-table` · `team-member` · `testimonials` · `comparison-table` · `table`
**Media:** `image` · `media-video` · `gallery` · `carousel` · `before-after` · `image-hotspots` · `lottie` · `video-popup` · `audio-player` · `logo-grid` · `avatar` · `featured-image`
**Data / display:** `counter` · `countdown` · `progress` · `star-rating` · `calendar` · `map` · `business-info` · `tag-list`
**Interactive:** `accordion` · `tabs` · `tooltip` · `modal-popup` · `scroll-indicator` · `scroll-to-top` · `menu-toggle`
**Icons / social:** `icon` · `social-icons` · `social-share` · `notification`
**Site / dynamic:** `site-logo` · `nav-menu` · `site-search` · `widget-area` · `code-block` · `posts` · `post-carousel` · `post-title` · `post-content` · `post-excerpt` · `post-meta` · `post-author` · `post-date` · `post-terms` · `author-box`
**Extension-sourced (portfolio / forms / animation-engine):** `contact-form` · `portfolio` · `project-details` · `project-gallery` · `project-nav` · `project-results` · `project-testimonial` · `related-projects` · `gallery-3d` · `model-viewer` · `webgl-object` · `image-sequence` · `svg-draw` · `svg-morph`  *(WooCommerce elements — `wc_products`, `wc_mini_cart`, `wc_cart_link`, … — are in [`../extensions/woocommerce.md`](../extensions/woocommerce.md).)*

**Colors on elements:** use the compact color-preset field (`{predefined:'text-<slug>'|'bg-<slug>',custom}`),
not raw hex — see `../option-types/compact-color.md`. **Value shapes** for option types live in
`../option-types/`. **Theme Settings** (global design) live in `../theme-settings/README.md`.
