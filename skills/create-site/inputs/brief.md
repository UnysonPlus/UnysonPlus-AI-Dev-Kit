<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Input: a brief

*"A barber shop, warm and dark, booking-led."*

The fresh-build path, and **the only route that skips capture** — there is nothing to reproduce. It is
also the route where [rule 4](../build-rules.md) is most at risk, because a short brief leaves a lot of
slots empty and every one of them is easy to fill with something plausible.

## The job

Turn the sentence into a [site spec](../site-spec.schema.json), agree it, then build.

## Intake

Ask for what you cannot infer, in one round rather than an interrogation. Six things decide the site:

1. **The business** — name, what it does, where. Without a name there is no site; everything else can
   be `null` and listed in `missing`.
2. **The pages** — propose a sitemap from the business type and let them cut it. Propose **fewer**
   pages than you think: five real pages beat nine with two padded.
3. **The style** — offer the [library](../../../docs/site-creator/styles/README.md) as a short
   enumerated list with a describe-your-own option. Read the brief's adjectives first: "warm and dark"
   is already most of a choice.
4. **The one action** — what should a visitor do? Book, call, enquire, buy. It decides every CTA and
   the header button.
5. **Real content** — any copy, photos, logo, testimonials they already have. **Ask explicitly for
   testimonials and numbers**, because their absence is what decides whether a proof band exists.
6. **Where it is built** — which install.

Anything they do not answer goes in `missing[]`. Do not re-ask twice; record and move on.

## Inferring well

From a business type you may reasonably infer the **page shapes** and the **archetypes** — a barber
shop wants services with prices, a law firm wants practice areas and credentials. That is pattern
knowledge, and it is what the person is paying for.

What you may **not** infer is any **fact about this business**: its hours, its prices, its history, its
clients. The line is simple — *shape, yes; facts, never*.

## Choosing the style

Map the brief's adjectives onto the library:

| The brief says | Likely style |
| --- | --- |
| clean, editorial, understated | `monochrome` |
| technical, developer, tooling | `modern-dark` or `terminal` |
| raw, bold, confident | `brutalist` |
| premium, calm, considered | `luxury` |
| precise, structured, design-led | `swiss` |
| long-form, publication, archive | `newsprint` |

Offer the match **and one alternative**, with one line each on what it would cost. "Warm and dark"
points at `modern-dark`, but if the brief also says *barber shop* the answer may be `luxury` with a
dark surface — the style library is a starting point, not a lookup table.

Where nothing fits, take the describe-your-own path and record it in `brand.style_notes`.

## Then

Hand the spec to the main flow: design system → chrome → pages → motion → ship gate. The brief itself
is not consulted again; **the spec is the source of truth**, which is the whole point of writing one.
