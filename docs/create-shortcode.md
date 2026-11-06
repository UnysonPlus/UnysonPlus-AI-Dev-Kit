# Create shortcode — a snippet compiled into a shortcode

The dashboard tool at **`http://localhost:4600/#pen`** (named *Pen → Shortcode* until kit 1.13.9).
Paste HTML/CSS/JS, get an installable UnysonPlus shortcode `.zip`. This file is the reference for how
it is built; the manual page for users is
**https://unysonplus.github.io/docs/extensions/site-converter/create-shortcode**.

## The division that matters

This tool is the worked example of the kit's standing pattern: **AI at the front, deterministic at the
back.**

| Deterministic, always | AI, optional |
|---|---|
| Rendering the snippet in real Chrome and reading the DOM | Naming each option for its role |
| Deciding which nodes are editable slots | Naming the shortcode |
| Scoping every CSS rule under the root class | Judging which slots are decoration |
| Generating `config.php`, `options.php`, `views/view.php`, `static.php` | — |
| Packaging the zip | — |

The AI **never writes code**. It renames and hides. Pull the AI out and you get the same package with
worse labels — which is exactly what happens when it is off, fails or returns nonsense.

## Where the pieces live

Under `assembled/UnysonPlus-Capture-Service/tools/design-capture/`:

| File | What it holds |
|---|---|
| `pen-shortcode.mjs` | The whole compiler. **Contains no AI and must not.** `extractSlots()` renders and finds the slots; the rest is codegen. |
| `to-ai.mjs` | `namePenOptions({ name, texts, images })` — the judgement pass. Returns `{ title, texts: { KEY: { label, skip } }, images: { KEY: { label } } }`, or `null`. |
| `serve.mjs` | `POST /pen-shortcode`. Takes `ai_assist`; injects `namePenOptions` as the `nameSlots` callback when AI is ready. |
| `dashboard/index.html` | The view, the **Let AI name the options** checkbox, and `penLabelsHtml()` which lists what the options ended up called. |

## How the two halves meet

`generatePenShortcode()` takes an optional **`nameSlots` callback**. It is injected, not imported, so
the compiler has no idea AI exists and stays testable without it:

```js
const nameSlots = useAi ? async (slots) => namePenOptions(slots) : null;
const out = await generatePenShortcode({ title, html, css, js, externals, nameSlots });
```

The callback is called once, between extraction and codegen, with the slots that render found. If it
throws or returns nothing, `named` stays null and the deterministic labels are used. **One render
either way** — do not add a second pass to get the slots for naming.

### Rules that must not drift

- **A skipped slot still renders.** It loses its option but keeps a substitution line with the original
  text (`'{{TEXT_4}}' => esc_html( '→' )`), so the markup is byte-identical whether or not naming ran.
  Dropping the line instead would leave a literal `{{TEXT_4}}` on the page.
- **Nothing from the model is trusted.** `namePenOptions` keeps only keys that were actually sent,
  bounds every string, and coerces `skip` to a strict `true`. A model that invents `TEXT_99` is ignored.
- **The input is capped** — 60 text slots, 30 images, 120 chars of each sample. A long snippet has
  hundreds of slots and the naming only needs a sample.
- **Labels are shown back to the person** before they install. Naming is a judgement call, so it is
  reviewable, not a black box discovered later in the builder.

## Known limits (unchanged by the AI pass)

- Text + image options only; no repeaters, colour or size options yet.
- Only pure-text leaf elements become slots (`el.children.length === 0`), so nested markup survives.
  The selector list in `extractSlots` omits some tags — `<small>`, for one.
- `scopeCss()` is a brace walk, not a CSS parser; comma-separated selectors inside `:is()` / `:not()`
  can mis-split.
