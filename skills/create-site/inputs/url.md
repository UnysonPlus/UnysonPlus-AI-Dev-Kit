<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Input: a reference URL

*"Build me something like this site."*

## This route is the Site Converter

**Do not re-implement it.** The converter is years of rules about what a captured container actually
is, and the creator's job here is to run it and then refine — not to parse HTML.

```
capture → convert → refine through composition → ship gate
```

1. **Capture first**, always: `node capture.mjs <url> capture-out/` (or the dashboard's Convert tab).
   This is a hard gate — hand-measuring before a capture exists is a protocol violation.
2. **Convert the full bundle** with `FW_Site_Converter_Bundle::import_dir( <capture-out dir> )`.
   **Never pages-only**: `import_json( pages.json )` skips the theme design and presets, so anything
   that lives in a preset renders wrong and you end up debugging the mapper for a bug that is not
   there.
3. **Refine** — the converted site is the starting point, not the output. Apply the composition rules,
   fix what the conversion report flags, and run the ship gate.

The full methodology is the converter's own:
[`site-build-protocol.md`](../../../docs/site-build-protocol.md) and
[`extensions/site-converter.md`](../../../docs/extensions/site-converter.md).

## What the spec carries on this route

Most of the spec is **read from the capture**, not asked for: the sitemap comes from the crawl, the
palette and type from the extracted design tokens, the sections from the mapping.

What you still ask:

- **Whose site is it?** If it is not the person's own, you are building something *like* it, not a copy
  of it — see below.
- **Which pages** of the capture to keep.
- **Real content** for anything being replaced.

Set `source: "url"` and record the capture folder in the spec.

## The line this route has to hold

A reference URL is a **design** reference. Reproducing someone else's structure and look as a starting
point for the person's own content is ordinary web work. Shipping their **copy, their images, their
logo or their brand** is not, and the conversion pipeline will happily carry all four, because that is
what conversion is for.

So when the source is not the person's own site:

- **Replace the content.** Their words are theirs; the layout is the thing you were asked for.
- **Never carry the logo, brand name or distinctive imagery.**
- **Say so plainly** if asked to do otherwise. This is not a technical limit, so it will not announce
  itself in a report — it is a judgement you have to make while the pipeline is doing the opposite.

When the source *is* the person's own site — a rebuild or a migration — none of this applies and the
conversion is the point.

## One correction worth knowing

If the person's site already exists and is being **restyled** rather than rebuilt, this is **not** a
conversion: no capture, no converter, no import — those would re-create the content and duplicate it.
Change the existing site's design directly instead. The tell is "use the same layout as the old site"
said about a site whose content has already moved.
