# UnysonPlus build conventions

The rules every UnysonPlus site/page/element should follow, whether you build by hand in the builder,
compose programmatically ([building-pages.md](building-pages.md)), or convert an existing site. They
keep output clean, accessible, on-brand, and editable. Site-agnostic — no project specifics.

## 0. Fixing ≠ redesigning — ask before altering the design or system

A **fix** removes a defect while preserving the existing design and behavior. **Altering** the
design, the interaction model, or the system architecture is a different act — and it is the user's
call, not yours. When a bug's only obvious workaround would change how something looks or behaves
(swapping a slide-out drawer for a dropdown, dropping an animation, changing a layout, removing an
option), **stop and ask first** — present the fix options and let the user choose. Do not "fix" by
quietly redesigning. Likewise, don't add a control, backdrop, or behavior the source/original didn't
have without confirming. Scope discipline: solve the reported problem with the smallest change that
keeps the intended design intact; surface anything bigger as a question. (This rule exists because a
drawer-overflow *fix* was silently turned into a dropdown *redesign* — the overflow was the bug; the
drawer was the design.)

## 1. Design tokens come from Theme Settings, elements *consume* them

UnysonPlus is **Theme-Settings-first**: colors, typography, buttons, box/card presets, and spacing
are defined once in Theme Settings and elements reference them. Don't hardcode one-off values in
child-theme CSS when a Theme Settings preset exists (or could).

- **Colors** — every element color option should use the **color-preset picker** (a preset dropdown +
  inline custom picker), not a raw color-picker, so element colors stay linked to the palette. The
  saved value is `{ predefined: 'text-…'|'bg-…', custom: '#hex' }` (preset wins), not a plain hex.
  *Exception:* the palette-definition UI itself uses a raw color-picker (you can't pick a preset to
  define a preset).
- **Typography / buttons / boxes / spacing** — prefer the Theme Settings preset pickers; if a needed
  option doesn't exist, that's a signal to add it to the framework, not to bury CSS in the theme.
- **The framework already provides a preset system for nearly everything — so child-theme CSS is a
  LAST RESORT, not the default.** There are Theme Settings presets for **colors** (palette →
  `--color-primary/secondary/accent/text/…` tokens), **boxes/cards** (`components-box` — bg / radius /
  shadow / border, consumed by a column's `border_preset`), **buttons** (`components-buttons` — styles
  like a secondary outline), **section styles** (`components-section-styles` — band tints/backgrounds),
  **image styles** (`components-image-styles` — rounded/shadowed media), **spacing**
  (`components-spacing`) and **typography**. **Header/footer bars additionally have a per-section
  `Custom Styling` block** (`{prefix}_custom_styling` on main / topbar / bottombar / pre-main-post
  footer): **Background, Typography** (family/size/weight/line-height/color), **Link Color**,
  **Padding**, **Borders**. A footer's text size/color, link color, background and padding go **there**,
  not in a `.footer .builder-text-element{font-size…}` child rule — reach for Custom Styling first when
  styling any header/footer bar. Before writing a rule in a child stylesheet, ask *"is this
  a color / card / button / section-band / image-style / spacing value?"* — if yes, it belongs in a
  **Theme Settings preset that the element consumes**, and a child `:root` that re-hardcodes brand hex
  (instead of aliasing `var(--color-*)`), a hand-rolled `.card{}`/`.btn{}`, or a hardcoded section tint
  are all shortcuts to undo. Child CSS is only for truly bespoke pixel details no preset can express —
  and even those, if recurring, are a prompt to extend the framework. **Nothing "hinders" using Theme
  Settings for these; hardcoding them is a shortcut, and it breaks rebrand-ability.**

## 2. Clean DOM is the point — don't bloat markup

UnysonPlus sells a clean, un-bloated DOM. Protect it:

- **No classes on `<p>`/`<li>`** (or other tags) inside a WYSIWYG (`text_block`). Keep editor content
  plain semantic HTML. To attach a class, use the element's **Advanced tab → CSS Class** (it lands on
  the wrapper), and use **multiple `text_block`s** when you need separately-classed wrappers.
- **To *show* markup as code** (not run it), use the `code_block` shortcode's **Render as Code**
  toggle with **raw** markup — never hand-paste entity-escaped HTML (a re-save decodes it and it then
  renders). It offers beautify + language auto-detect and is Prism-ready.

## 3. Accessibility & SEO are non-negotiable

- **Heading order — never skip a level going down.** Choose a heading's level by its position in the
  page outline, not the size you want (style with CSS instead). Footer / widget / sidebar column
  titles are `<h2>` styled small (an "eyebrow"), never `<h4>`/`<h5>` picked for the look. Elements that
  render a heading should expose a `heading_tag`/`title_tag` select and default to a level that fits
  typical placement. Verify: `curl <url> | grep -oE '<h[1-6]'` should descend without gaps.
- **Descriptive link text — no bare "Read more" / "Click here".** Fold context into the link. Keep the
  visible label short by adding **visually-hidden text inside the `<a>`** (`about <title>`), which
  crawlers and screen readers read but sighted users don't see — this satisfies both the SEO
  link-text audit and a11y. Use `aria-label` only for icon-only links (no visible text).
- **External links open in a new tab.** Any link to a different host gets `target="_blank"` **and**
  `rel="noopener noreferrer"`. Internal/relative links stay in the same tab. Detect off-site by
  comparing the link host to the site host, so it's automatic (don't hardcode `target` per call site).
- **Contrast ≥ 4.5:1, don't convey meaning by color alone, provide `alt`, add structured data** where
  relevant. A converted palette is the user's brand — detect low-contrast pairs and *ask*, don't
  silently change their colors.

## 4. Every media/content element must be user-replaceable

Converted sites, demos, and starter pages exist so a user can swap in their own content **through the
builder UI**. So:

- Every image/video is an **editable element or option value** (an `image`/`image_box`/`media_video`
  element, an upload option, or a background layer) — sideload demo media into the Media Library so the
  normal "Replace image" flow works.
- **Never** bury media in hardcoded theme-asset URLs, `code_block` `<img>` markup, or a text-only URL
  field as the *only* path. A URL/pattern field is fine as an *advanced* option, but an upload-based
  alternative must exist.

## 5. Option-value shapes (the ones people get wrong)

- **`multi-picker`** — the label placement depends on mode:
  - **Inline** (non-popover): label/desc/help live on the **picker sub-option**; the top-level
    multi-picker is `label:false, desc:false`. Default via the top-level `value => ['<picker_id>' =>
    '<choice>']`. Choice keys must be **non-empty** strings (use `'auto'`, not `''`).
  - **Popover** (`'popover' => true`): the OPPOSITE — the visible label lives on the **top-level**
    multi-picker and the picker sub-option is `label:false`.
  - Saved shape: `{ '<picker_id>': '<choice>', '<choice>': { …sub-option values… } }`.
  - Converting an existing scalar option to a multi-picker is a **breaking value-shape change** — add a
    migration (and, for builder items, a JS-side migrator) so old saves don't error on edit.
- **Column widths** — twelfths (`1_1`,`1_2`,`1_3`,`1_4`,`1_6`,`2_3`,`3_4`,`5_6`,`5_12`,`7_12`,…) plus
  **one fifth: `1_5`** (20%). There is no `2_5`/`3_5`/`4_5`. Don't fake equal columns with
  `width:"auto"` (the column wrapper gets dropped).

## 6. Admin/settings-page layout

- Settings pages built from option arrays use the **metabox-holder + `box` → `group`** pattern: each
  section is a `box` (a WordPress postbox card), and its fields are wrapped in a border-less `group`
  so they read as one cohesive group. Apply it to every box for consistency.
- Tabs use **native `nav-tab-wrapper`**, not hand-rolled pill/button tabs.
- **Exception:** a bespoke management dashboard (custom HTML/CSS/JS, e.g. a searchable card grid) is
  exempt — don't wrap it in redundant postbox chrome.

## 7. Verify before calling it done

- Front end: the page renders, effects animate, no console errors, no PHP notices.
- A11y/SEO: heading outline descends, links are descriptive, contrast passes, images have `alt`.
- Editability: the page opens in the visual builder; every image/text is replaceable.

## Admin control heights (WordPress 7+)

WordPress 7.0 raised `select` and `.button` to a **40px minimum height** (a touch-target
change) while text inputs stayed at **30px**, so any admin row mixing them renders ragged —
a text field beside a dropdown, or a select beside a submit button.

The plugin ships `framework/static/css/admin-controls.css`, enqueued on every admin page
from `FW_Backend::_action_admin_enqueue_scripts()`, which pins select, button and text
input to a single **30px** height.

- It is **scoped** to Unyson+ surfaces — our own screens (`.wrap[class*="fw-"]`), the
  Extensions manager, and anything the options framework renders (`.fw-backend-option`,
  the builder, the options modal, which also appear on post/term/theme screens). Core
  WordPress screens and other plugins keep WordPress's own sizing on purpose: overriding
  an accessibility decision site-wide is not the plugin's call.
- `select[multiple]`, `select[size]`, `.button-large` and `.button-hero` are exempt by
  design, and `textarea` is untouched.
- When adding a new admin screen, wrap it in `<div class="wrap fw-…">` and the heights
  come out right automatically.
