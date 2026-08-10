# Porting a standalone component into a shortcode

The procedure for turning a CodePen, a demo page, or a bought HTML template into a UnysonPlus
page-builder element.

A standalone demo and a page-builder element are built on opposite assumptions. The demo owns
the whole document, has one instance, hardcodes its content, and is never edited by anyone but
its author. An element is a guest on someone else's page, may appear twice, gets its content
from a non-technical user, and must survive being dropped somewhere the original author never
imagined.

**Porting is not copying. It is a translation, and it is mostly about deleting assumptions.**

---

## Before you start — decide the HOME + how it ships (ask if unclear)

The porting steps below are the same wherever the shortcode ends up — but decide the destination **first**,
because reuse-scope and *distribution intent* are separate questions. When the task doesn't make it obvious,
**ASK the user once:** ship it in the **core plugin** (auto-updates for every site), inside **this site's
child theme** (an uploadable theme `.zip`), or as a **standalone extension** (its own distributable module,
activatable in Extensions, that they can hand out independently)? A *reusable* shortcode the user wants to
**distribute as their own add-on** goes in a standalone extension, not the framework. Full decision table
(all four loader homes + version markers): **`docs/extending.md` → "Deciding the home"**. Only the
destination folder + version marker change; everything below is identical.

---

## Step 0 — When the source is a LIVE site: CAPTURE → REPLICA → PORT

If you are reproducing a component from a live URL (cloning a site), **do not hand-build it from
screenshots and measurements** — that produces an approximation, and it will be wrong in ways you
won't see until someone else does. **Capture the real markup first; it IS the design.** This
three-step flow gives a pixel-faithful result:

1. **Capture** — render the source in headless Chromium and grab the component's `outerHTML` plus
   the computed styles of any custom-shaped nodes. If the source is **Tailwind** (most modern sites
   are), the class list *is* the design spec — arbitrary values (`bg-[#ff6b8b]`, `rounded-[40px]`,
   `space-y-[-40px]`) and all. Note the **behaviour** too (what changes on select / hover).
   - Text-match traps: labels are often mixed-case with a CSS `uppercase` transform, so search
     **case-insensitively** (a node reads "Live Preview", not "LIVE PREVIEW").
2. **Standalone replica** — drop the captured markup into a self-contained
   `test-sites/<name>/index.html` with the **Tailwind Play CDN** (`https://cdn.tailwindcss.com`),
   the source's webfonts, and any custom utilities it used (a `text-shadow` class, a keyframe).
   **Screenshot it against the source and iterate until they match.** The design is now locked in a
   file with no framework in the way. (CDN Tailwind is fine *here* — this is a design reference, not
   the shipped element.)
3. **Port** the verified replica into the element:
   - **Tailwind → scoped CSS**: reproduce each class's value under the element's root class
     (`rounded-[40px]` → `border-radius:40px`; `bg-pink-300` → `#f9a8d4`; `space-y-[-40px]` →
     `margin-top:-40px` on the stacked children; `opacity-90` fill layer under a `z-10` text layer).
     Keep the **exact markup structure**.
   - **Hardcoded content → options** (repeaters for the repeated cards).
   - **Behaviour → `data-*` + a small root-scoped JS** (no CDN, no inline script).
   - **Screenshot the shipped element against the replica** — they must match.

This is the difference between an "unsatisfactory" hand-built result and a faithful one: on the
pinky-bites cupcake builder the captured markup revealed the frosting was a **white-bordered ellipse
over a rounded-bottom base, overlapping by 40px, with white text** — none of which my measurements
had produced. Steps 1–5 below still apply (they are the *translation*); Step 0 is how you get a
correct thing to translate.

### Step 0.9 — CLOSE THE LOOP: teach the converter about your new shortcode (REUSABLE ones only)

> **This is the step that makes "never hand-build again" actually true** (site-build-protocol.md Rule 0).
> The converter emitted a **`code_block`** for this widget because it didn't recognise it. If you swap
> the code_block for your shortcode and stop there, the **next** conversion of a similar block will fall
> back to a `code_block` too — and you'll hand-swap it *forever*. Close the loop:

- **Is the shortcode REUSABLE (generic — e.g. `product_configurator`, `badge`) or a genuine ONE-OFF
  (`cupcake_builder`, built for one site's source)?**
  - **Reusable → add a converter recognizer** so the source pattern auto-maps to your shortcode next
    time (no more code_block, no more hand-swap). This is a **contributor task** (needs the converter
    repos, must be upstreamed, and mirrored across **both** paths):
    - **PHP** (`UnysonPlus-Site-Converter-Extension`): a `_Stitch` **recognizer** (a `match_*` at a
      priority above the verbatim fallback) + a `register_builder` → **`n_<name>()`** mapper in `_Mapper`
      that emits `{ shortcode:'<name>', atts:{…} }` with your options. **Copy the `badge` pair as the
      template** — `announcement_pill` recognizer (priority 76) + `n_announcement_pill()`.
    - **JS** (`UnysonPlus-Capture-Service` `capture-extract`/`to-pages`): the matching recognizer, kept
      **in sync** with the PHP (the JS↔PHP parity check catches drift).
    - Then re-run the conversion → the block now arrives as your shortcode, options pre-filled.
  - **One-off → do NOT add a recognizer** (it would never recur; a recognizer for it is dead weight).
    The `code_block` → hand-swap is correct *once*. But still **flag it** in the conversion report if the
    *category* of widget ("interactive product builder") looks like it could recur — the maintainer
    decides whether it graduates to a reusable shortcode + recognizer.
- **Site-builder (no converter repos)?** You can't add the recognizer — so **flag the systematic miss**
  (Rule −1: `--share` / the Gmail report form) with `element → got code_block / expected <name>`, and the
  maintainer adds the recognizer. Your one site still gets the shortcode by hand-swapping this once.

So the bespoke protocol is now complete: **capture → replica → port → (reusable?) teach the converter.**
Without Step 0.9 the converter never gets smarter about bespoke widgets, which is the gap that keeps
forcing hand-swaps.

---

## Step 1 — Audit the source before writing anything

Read the source HTML, CSS and JS and write down every line that assumes it owns the page.
This is the whole job; do it first and the rest is mechanical.

| In the source | Why it breaks | What it becomes |
|---|---|---|
| `* { margin: 0 }`, `body { … }`, `:root { … }` | Resets the host theme site-wide | **Delete.** Scope every rule under the element's root class. |
| `.container`, `.item`, `.content`, `.name` | Generic names collide with the theme and other elements | Prefix every class with the element's root name |
| `#slider`, `getElementById` | Ids must be unique; two instances collide | Classes, and JS scoped to each root |
| `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)` on the root | Assumes it is alone on the page; will overlap the user's content | A normal in-flow block. Position freely *inside*. |
| `<link href="…cdn…">`, `<script src="…cdn…">` | An external request, a privacy leak, and a dependency you do not control | Framework icons; or vendor the library and enqueue it |
| Hardcoded image URLs | The user cannot change them from the builder, and the site hot-links a third party | An `upload` option (Media Library) |
| Hardcoded repetition (six copies of the same block) | Freezes the count and the content | An `addable-popup` repeater |
| Hardcoded text | Not editable | `text` / `textarea` options |
| Magic numbers (`1000px`, `220px`, `#eee`) | Not configurable, and not tied to the site's design system | `unit-input` options; colours via the compact colour-preset field |
| `document.querySelector('.next')` | Finds the **first** match on the page — with two instances, one element's buttons drive the other | Query from the instance root |
| `<button>` that navigates | Wrong element: cannot be opened in a new tab, wrong role for assistive tech | A real `<a>` |
| `outline: none` with no replacement | Keyboard users cannot see focus | A visible `:focus-visible` style |
| No `prefers-reduced-motion` handling | Motion that can cause physical symptoms | A `@media (prefers-reduced-motion: reduce)` block |
| No media queries | Will be dropped into a narrow column | Responsive rules, or intrinsic sizing |

Then ask the two structural questions:

- **Leaf or section-like?** A self-contained visual component is a leaf. See `README.md`.
- **One layout or several?** Several *structurally different* layouts justify the designs layer
  (`views/designs/`). Colour and spacing variants do not — those are Style-tab options.

---

## Step 2 — Decide what becomes an option

The test: **would a user reasonably want this different?** If yes, it is an option. If it is
internal to how the effect works, it stays in the CSS.

Every option costs something — a control the user must understand, a value to validate, a line
in the contract. A component with sixty options is not more powerful than one with twelve; it
is harder to use and harder to maintain. Prefer a sensible default over a control.

Work out what the magic numbers are *made of* before exposing them. A demo whose cards sit at
`left: 220px` and `left: 440px` does not need two position options — 220 is *card width + gap*,
so exposing width and gap and computing the offsets in `calc()` gives the user two meaningful
controls instead of two arbitrary ones, and the layout stays correct when they change either.

Three things are **not** negotiable, because they are what makes the element usable at all:

- **Every image and video must be user-replaceable** from the builder, via a Media Library
  upload. This is the entire point of a ported component: someone takes it as a starting point
  and swaps in their own content. Media buried in theme assets, in `code_block` HTML, or behind
  a URL-only text field fails that. A URL/pattern field is acceptable as an *advanced* extra —
  never as the only path.
- **Any heading needs a `heading_tag` option.** The right level depends on where the element is
  dropped, which only the user knows.
- **Colours use the compact colour-preset field**, never a raw `color-picker`, so the element
  follows the site palette instead of freezing a hex.

---

## Step 3 — Build it

Copy the template folder, rename it, and work in this order. Each step is verifiable, which is
the reason for the order — do not write all four files and then debug.

1. **`config.php`** — the tile and the canvas preview. Confirm the element appears in the
   picker and drops onto the canvas.
2. **`options.php`** — the fields. Confirm the modal opens, every tab renders, and values save
   and survive a reload. Do this before writing any markup: it is the contract, and changing it
   later means migrating saved data.
3. **`views/view.php`** — the markup. Confirm the front end renders, then confirm **two
   instances** on one page.
4. **`static/css` + `static/js`** — styling and behaviour last.

Then the checks in `README.md` → *Verify before calling it done*.

---

## Step 4 — What to keep from the original

Porting is not a rewrite. Keep the technique — it is why you chose this component.

Some effects are worth understanding rather than replacing. For instance, a common slider
pattern positions children by `:nth-child()` and puts the `transition` on the child itself, so
that simply **moving a node in the DOM** animates every other node into its new slot. The JS is
two lines and sets no styles at all. Ported carefully that is elegant; "improved" into a
JS-driven position calculator it becomes worse in every way.

So: keep the mechanism, translate the assumptions around it. The parts to change are the ones
in the Step 1 table — none of which are the technique.

---

## Step 5 — Before you ship

- **Delete the scaffolding.** The reference blocks at the bottom of each template file, this
  file, and `README.md` should not ship inside a real element.
- **Fill in `AGENTS.md`.** Its options table is the contract an AI generator reads to emit
  valid page-builder JSON. A stale table means generated JSON is rejected on import.
- **Bump the extension's version.**
- **Check the accessibility basics:** heading order descends without gaps, links have
  descriptive accessible names, images have `alt`, text over an image clears 4.5:1 contrast,
  focus is visible, and motion respects `prefers-reduced-motion`.

---

## A note on licensing

A CodePen or a template is someone else's work. Check its licence before shipping it in a
product. Reimplementing a *technique* from a demo is normal engineering; copying a distinctive
design or a substantial block of source is a licensing question, and "it was on the internet"
is not an answer to it. When the licence is unclear, treat the demo as a description of an
effect and write the implementation.
