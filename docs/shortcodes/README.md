# Page-builder shortcodes — node model + index

How to build a UnysonPlus page-builder page as **JSON**, without reading plugin source. A page
is a **JSON array of `section` nodes**; each file in this folder documents one shortcode's
**shortcode-specific atts**. The shared wrapper blocks (below) are carried by *every* node — the
per-shortcode files don't repeat them.

## The three node types

```js
// section — one per band of the page. _items = its columns.
{ type: 'section', _items: [ /* columns */ ], atts: { …section atts… } }

// column — inside a section (or nested one level). width is a fraction slug. _items = leaves/columns.
{ type: 'column', width: '1_1', _items: [ /* leaves */ ], atts: { …column atts… } }

// leaf — a shortcode element. _items is always []. `shortcode` is the tag.
{ type: 'simple', shortcode: 'special_heading', _items: [], atts: { …shortcode atts… } }
```

**Column widths:** `1_1` `1_2` `1_3` `2_3` `1_4` `3_4` `1_5` (⅕ — the ONLY fifth) `1_6` `5_6`
`5_12` `7_12` … Twelfths + the single `1_5`. Columns in a section **flex-wrap** by total width
(e.g. `7_12`+`5_12` = row 1, four `1_4` = row 2). **Nesting is ONE level only** — a column inside a
column is fine; deeper leaks raw `[/fw_inner_*]` text.

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

## Build & import

```js
// tree = [ section, section, … ]  →  write JSON, then:
fw_set_db_post_option($pid, 'page-builder', ['json' => $json, 'builder_active' => true]);
$html = do_shortcode( fw()->backend->option_type('page-builder')->json_to_shortcodes($json) );
```
Set atts VERBATIM — the builder validates against `fw_get_options_values_from_input`, so every
sub-shape must be present (that's why the wrapper blocks above are always included).

## Index (this folder)

**Every shortcode has its own file here** (~76 total) — open `docs/shortcodes/<name>.md` for its
atts. Filenames are the shortcode folder name (kebab); the tag is dashes→underscores
(`call-to-action.md` → `call_to_action`). `image.md` = the `media_image` shortcode.

**Structure / layout:** `section` · `column` · `container` · `flexbox` · `bleed-section` · `masonry-section` · `divider` · `steps` · `timeline`
**Headings / text:** `special-heading` · `text-block` · `blockquote` · `highlight-text` · `animated-heading` · `text-expander` · `toc`
**CTA / actions:** `button` · `call-to-action` · `announcement-pill` · `newsletter`
**Cards / features:** `icon-box` · `feature-list` · `image-box` · `image-content` · `flip-box` · `pricing-table` · `team-member` · `testimonials` · `comparison-table` · `table`
**Media:** `image` · `media-video` · `gallery` · `carousel` · `before-after` · `image-hotspots` · `lottie` · `video-popup` · `audio-player` · `logo-grid` · `avatar` · `featured-image`
**Data / display:** `counter` · `countdown` · `progress` · `star-rating` · `calendar` · `map` · `business-info` · `tag-list`
**Interactive:** `accordion` · `tabs` · `tooltip` · `modal-popup` · `scroll-indicator` · `scroll-to-top` · `menu-toggle`
**Icons / social:** `icon` · `social-icons` · `social-share` · `notification`
**Site / dynamic:** `site-logo` · `nav-menu` · `site-search` · `widget-area` · `code-block` · `posts` · `post-carousel` · `post-title` · `post-content` · `post-excerpt` · `post-meta` · `post-author` · `post-date` · `post-terms` · `author-box`

**Colors on elements:** use the compact color-preset field (`{predefined:'text-<slug>'|'bg-<slug>',custom}`),
not raw hex — see `../option-types/compact-color.md`. **Value shapes** for option types live in
`../option-types/`. **Theme Settings** (global design) live in `../theme-settings-reference.md`.
