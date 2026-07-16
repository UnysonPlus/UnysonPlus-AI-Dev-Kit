# PLAYBOOK — building a UnysonPlus site/demo from a mockup

The process that gets a mockup **right on the first pass**. Build **outside-in**,
**measure** at every step, and **configure with native options** before writing CSS.

Prereq: run `pwsh assemble.ps1` so `unysonplus/` + `unysonplus-theme/` + the two
conversion repos are populated. Options reference: `docs/header-footer-reference.md`.
Metrics + tolerances: `design-parity-checklist.md`.

---

## Phase 0 — Read the mockup's OUTER layers first

Before anything, open the mockup HTML/CSS and extract the **frame tokens** (write
them down — they are the spec you build to):

- **Container**: `max-width` of the main content wrapper, side gutter.
- **Header**: bar height, logo box (w×h) + top/bottom gap, background, border/shadow,
  nav alignment + item style (plain / pill / underline), whether it's a card/pill.
- **Footer**: number of columns + ratio, background, border, padding, what's in each column.
- **Type**: h1/h2/body font-family + sizes; **Color tokens** (primary, accent, text, bg).
- **Spacing**: section padding top/bottom, row gaps.

Do **not** start with the logo or a hero graphic. Start with the frame.

## Phase 1 — Lock the CHROME + CONTAINER to parity (native options only)

This is the phase that makes "header and footer already perfect" true. Nothing else
happens until this passes the parity check.

1. **Child theme**: copy `unysonplus-theme-child/` → rename to the site slug; activate
   it. Its `design/design.json` auto-imports a polished-chrome baseline, so you start
   ~90% there — you're re-skinning, not building from zero.
2. **Container width** (General → Layout) to match the mockup's `max-width`.
3. **Header** — from `header-layout.php` / `header-menu.php` / `header-identity.php`:
   set `container`, `min_height`, `header_border`/`header_shadow`/`header_glass`,
   `header_design` (classic/pill/card/centered), `header_valign`, `header_element_gap`,
   `menu_item_style`, menu colours, and the **logo width** (`logo_type[simple][width]`).
   Use options — see the reference's "use the option, not CSS" table.
4. **Footer** — set `footer_background`, `footer_border_*`, `footer_padding_*`, the
   `main_footer_columns` count/ratio, and fill columns with **elements** (footer_logo,
   menu_area, custom_html, text, social_icons). Set `copyright_settings`.
5. **Measure**: run `node tools/measure/measure.mjs <mockupUrl> <devUrl>`. Fix every
   metric outside ±2px / tolerance. Only after container + header + footer **pass** do
   you move on. CSS in the child `assets/chrome.css` is a **last resort** for things no
   option covers — log each as an enhancement candidate.

## Phase 2 — Section / row skeleton

Build the page structure before content, in the page builder (or via the builder JSON):

1. One **section per band** of the mockup, in order. Set section `is_fullwidth`,
   `container_width`, `background`, `padding_top/bottom`, and (via the section's
   `css_class` Advanced field) a hook for any bespoke CSS.
2. Inside each section, the **columns** with the right widths (`1_1`, `2_3`+`1_3`, etc.)
   and gaps — match the mockup's grid (e.g. main table + sidebar = `2_3` + `1_3`).
3. **Measure** section paddings + column widths against the mockup. Get the skeleton
   right with empty/placeholder columns before filling them.

## Phase 3 — Fill elements (hard ones as placeholders first)

1. Drop in the simple elements (special_heading, text_block, image, button, accordion).
2. **A hard element** (e.g. a reviews-table, a bespoke comparison grid) goes in as a
   **`code_block` placeholder** — paste the mockup's static HTML for that band with
   `render_as_code=false` so it renders as real markup and the layout keeps moving.
   Swap it for the real shortcode once the surrounding page is right. This keeps a
   difficult element from blocking the whole build.
3. **Measure** again; polish element spacing/typography last.

## Rules

- **Native options before CSS.** If it's in `docs/header-footer-reference.md`, use it.
- **Measure, don't eyeball.** Run the harness after each phase; never "looks right".
- **Outside-in.** Frame → sections → elements. Never patch an inner element before the
  frame passes parity.
- **Placeholders unblock.** A `code_block` of the mockup's HTML is a legitimate interim
  for any element that's slow to build natively.
- Anything you had to solve with child CSS that *should* be an option → note it in the
  build's report as an **enhancement candidate** for the parent theme.

## Relationship to the automated pipeline

`UnysonPlus-HTML-to-Wordpress-Conversion` (capture service) and
`UnysonPlus-Site-Converter-Extension` do this **automatically** (URL/file → sections →
shortcodes + presets). This manual playbook and those tools must share the **same
standards** — colors/typography/buttons/boxes as Theme-Settings presets that elements
consume, clean DOM, chrome via options. When you improve a mapping here, mirror it there
(and vice-versa); see the converter's `docs/site-conversion-playbook.md`.
