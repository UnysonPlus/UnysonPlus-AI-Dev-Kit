# Imagery

Where a built site's pictures come from. Without this, a build that has been told not to invent
content and given no source will ship text only — which reads as unfinished however well the type is
set, and is the single most common reason a generated site fails the jury on Design.

## A photograph is not an invented fact

This is the distinction that matters, and it is easy to get backwards.

**Inventing content** means asserting something about the business that nobody told you: a
testimonial, a rating, a years-in-business figure, a client count, an opening time, a price. Those
are claims. They stay out, and they go in `missing[]`.

**A photograph of the subject matter is not a claim about the business.** A picture of car keys
changing hands on a car-finance site does not assert that it is *this* broker's customer, any more
than a stock photograph of a desk asserts whose desk it is. It is illustration. Shipping without it
is not integrity, it is an unfinished page.

The two rules live together: **no invented facts, and no bare text where a picture belongs.**

## Where they come from

The kit's stock search, which is already configured with keys and prints each result's licence:

```
node studio-cli.mjs stock "<words>" --photo --limit 8
```

Pixabay and Pexels, plus NASA and Openverse. Prefer sources needing no credit. Where a credit is
required, put it in the page footer and say so in the hand-over.

Download the chosen file, then put it in the Media Library with `upload_media` and reference it by
its **`attachment_id`** on the target install. A URL to somebody else's host, or an attachment id
from another install, renders nothing (build rule: images re-resolve from `attachment_id`).

Always write alt text. A decorative band may take `alt=""`; anything carrying meaning may not.

## Checking a pick before you use it

Look at the image. Do not place one you have not opened.

- **No visible trademarks** — a badge on a car, a logo on a shirt, an app icon on a phone, a number
  plate. Pixabay's licence explicitly does not cover shown trademarks, so a branded pick is not
  usable even though the photograph is free.
- **No recognisable faces as the subject** where the page implies the person is a customer or staff
  member — that edges back into claiming something.
- **It has to match the copy.** A generic office stock photo under a paragraph about car finance is
  worse than no photo: it reads as filler and tells the viewer nobody looked.

## How many, and where

Per the archetypes in the other recipes, a site of six pages wants roughly:

| Slot | What it is |
| --- | --- |
| Hero | One strong image, the subject of the business, cropped hard. The page's one big picture. |
| A mid-page band | One supporting photograph, offset against text, not centred under a heading. |
| Per-service or per-step | Icons, not photographs — a grid of six stock photos looks like a catalogue. |
| Proof band | Only if the proof itself exists. No testimonials means no band, picture or not. |
| Footer / CTA | Usually none. A colour band does the work. |

Two to three real photographs across a site is the target. More than that and they stop being
deliberate. A band with no picture needs a reason, and "I had no source" is not one — the source is
one command away.
