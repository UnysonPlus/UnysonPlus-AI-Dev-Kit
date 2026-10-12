<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Editing an element's options — the operations playbook

> **Read this before you change any element value** — whether you edit the builder data programmatically
> (`wp eval-file` / a script) or drive the visual builder. It is the *mechanical* "how to make a change
> actually land, show in the builder, and render" layer. It does **not** restate each option's value shape
> — those live in [`option-types/`](option-types/) and [`shortcodes/`](shortcodes/); this is the workflow
> and the recurring traps that waste a session when skipped.

---

## 0. The order that saves you

Do these **in order**, every time, before writing a value:

1. **Look up the value shape FIRST.** Open the option's doc — [`option-types/<type>.md`](option-types/),
   the shortcode's [`shortcodes/<name>.md`](shortcodes/), or the option type's own `AGENTS.md` in the
   plugin. **Never guess a format.** Most wasted time comes from writing a plausible-looking value the
   option doesn't accept (see §4).
2. **Prefer the NATIVE option over CSS.** The hierarchy is
   **native option → Theme Settings preset → scoped `custom_css` (`{{SELECTOR}}`) → theme Misc → Custom CSS → sandbox hook.**
   Reach for CSS only when no native option expresses the change. (This is the kit's standing rule — see
   [`conventions.md`](conventions.md) and the protocol; it is the single most common thing to get wrong.)
3. **Use a value the UI can show.** A value that renders on the front end but **isn't one of the option's
   dropdown choices will appear "Default"/unset in the builder** — it looks broken even though it works.
   Match the choices the option actually offers (§4).

---

## 1. How a page renders — so your edit lands

- **The builder and the front end render from the page-builder VALUE (post meta
  `fw:opt:ext:pb:page-builder:json`), not from `post_content`.** `post_content` is a *derived* copy
  (pre-rendered HTML the importer also stores); it can lag and does **not** drive the visual output. If
  you patch `post_content` alone, nothing changes on screen.
- **To change an element programmatically:**
  1. Load the value: `$v = fw_get_db_post_option($post_id, 'page-builder'); $tree = json_decode($v['json'], true);`
  2. Walk the tree to the node (match `$node['shortcode']`), edit `['atts'][<key>]` **using the correct shape** (§4).
  3. Store it back the way the builder does:
     `fw_set_db_post_option($post_id, 'page-builder', array('json' => json_encode($tree), 'builder_active' => true));`
  4. Re-render the derived copy: `$html = do_shortcode($ot->json_to_shortcodes($json)); wp_update_post(['ID'=>$post_id,'post_content'=>$html]);`
  5. Re-fingerprint so the importer's manual-edit guard stays correct: `update_post_meta($post_id, '_upw_import_hash', md5($json));`
  6. If the page is importer-managed, **sync the source JSON** to match (§5).
- Bootstrap WP from a script with `require 'D:/.../wp-load.php';` and `wp_set_current_user()` an admin, so
  `unfiltered_html` is allowed (otherwise `<form>`/`<svg>`/inline style in the output is kses-stripped).

---

## 2. After a CSS or markup change — purge the caches that hide it

A change can be correct in the data yet invisible because an old asset is served:

```
wp cache flush
rm wp-content/uploads/unysonplus/asset-optimizer/combined-*.css   # a stale combine omits new rules
```

Then **hard-refresh** (Ctrl+F5) — the admin builder CSS/JS is browser-cached. The front end is admin-side
unaffected, but a combined-CSS cache will silently drop new shortcode / `custom_css` rules until purged.

---

## 3. Verify — measure, don't hope

Data-correct ≠ render-correct. After any visual change, **measure the computed value and look at the
pixels**: `getComputedStyle(el).<prop>` for the exact property you changed, plus a screenshot. "I set the
option" is not verification; "the element computes `padding-top: 40px` and the gap is visibly there" is.
Use the kit's `tools/measure/` lenses rather than a hand-rolled script.

---

## 4. Value-format traps (the ones that cost real time)

Full shapes live in [`option-types/`](option-types/). These are the formats that *look* obvious and aren't:

- **`spacing` (Margin & Padding): values are utility SLUGS, not raw CSS lengths.**
  - Shape: base layer `margin` / `padding` = `{all,top,right,bottom,left}`, each a slug like `pt-4`,
    `m-3`, `mt-2`. Per-device overrides live under `advanced.md` / `advanced.lg` / `advanced.xl` and carry
    the breakpoint infix (`pt-lg-4`, mobile-first: a value set on Desktop only applies ≥992px).
  - **Only slugs in the option's scale render as a dropdown choice.** A raw `2.5rem` is sanitized to a
    junk class (`25rem`) and does nothing. An arbitrary bracket value (`pt-[40px]`) *renders* on the front
    end (the token CSS exists) but **is not a dropdown choice, so the builder shows "Default"** — the exact
    disconnect where a value "works on the front end but looks unset in the backend".
  - The widget **auto-unlinks** (shows the four per-side selects) when any per-side value is set; linked
    mode shows only the single "All" field.
  - Default scale: `0`=0, `1`=.25rem, `2`=.5rem, `3`=1rem, `4`=1.5rem, `5`=3rem, `6`=3.5rem … (plus any
    project brackets like `[32px]`, `[40px]` the converter emits). See the spacing option type's
    `AGENTS.md` for the authoritative list and the `fw_option_type_spacing_scale` filter.
- **Color fields are objects, not strings:** `{ 'predefined' => '<preset-slug>', 'custom' => '#hex' }` —
  a bare `#hex` string is wrong.
- **Button / box skins live on the PRESET, not the shortcode.** The resting + hover look belongs in the
  Theme Settings preset's Custom CSS, not the element's own Custom CSS — see
  [`extensions/site-converter.md`](extensions/site-converter.md) → Notes/gotchas.
- When in doubt, **export one element you set by hand in the builder** and read its JSON — it is the
  ground-truth shape the option produces (this is how the `spacing` slug/device-layer shape is confirmed).

---

## 5. Editing a LIVE page without clobbering hand edits

- **An open builder won't see a DB write you make.** The editor holds its own in-memory copy of the page
  until reload; a programmatic change to the meta is invisible there until the editor page is reloaded —
  and **saving from a stale panel overwrites your write** with the old value. After a programmatic edit,
  reload the editor before touching it.
- **The importer skips hand-edited pages.** `import.php` fingerprints the builder JSON it writes
  (`_upw_import_hash`) and SKIPs a page whose current JSON diverges (= edited since). Before overwriting a
  page the user may have changed, **pull DB → source** (write the live `fw_get_db_post_option(...)['json']`
  back into the page's source JSON), so the source matches what they built and a later import can't revert
  it. Only then re-fingerprint.

---

## 6. When the native option genuinely can't express it

Fall down the hierarchy **in order**, never past the first rung that works:

**native option → Theme Settings preset → scoped `custom_css` (`{{SELECTOR}}`-scoped to the element) →
theme Misc → Custom CSS → a sandbox hook.**

`custom_css` is collected at render and aggregated into the combined stylesheet — so purge
`asset-optimizer/combined-*.css` (§2) after setting it, and prefer it over editing a theme file for a
single element's one-off tweak.
