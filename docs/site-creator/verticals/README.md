<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Verticals — the template format

A **vertical template** is an industry starting point: the sitemap, the section shapes, the forms and
the vocabulary a business of that kind actually needs. The person picks one and customizes it, so an
industry is a *head start*, not a separate product.

This is the generalized form of the CRM website generator's industry presets. That generator already
runs eight of these in production (salon, clinic, fitness, law firm, real estate, recruitment, home
services, venue), so the format below is **derived from something that works**, not designed from
first principles. Its CRM-specific parts are optional blocks here rather than core fields.

## The hard rule

**A vertical supplies shape. It never supplies facts.**

| Supplies | Never supplies |
| --- | --- |
| the sitemap and each page's purpose | prices, hours, team, accreditations |
| the archetypes per page and their order | testimonials, review counts, metrics |
| the forms and what they capture | the business's story or history |
| the **vocabulary** of the trade | anything specific to *this* business |

This is the input most likely to produce invented content, because it arrives already shaped like a
finished site, and a template that ships with plausible prices is the fastest route to breaking
[build rule 4](../../../skills/create-site/build-rules.md). Every slot a vertical defines but the
person has not filled goes to `missing[]` and the section is omitted.

The vocabulary is the quiet half of the value and the easiest to underrate. A salon has *stylists*,
*treatments* and *rebooking*; a law firm has *practice areas*, *matters* and *consultations*. Getting
those words right is most of what makes a template stop feeling generic.

## The shape

```js
{
  id: 'salon',
  label: 'Salon and spa',
  covers: ['hair salon', 'beauty salon', 'spa', 'barbershop', 'nail studio'],

  vocabulary: { practitioner: 'stylist', service: 'treatment', client: 'client' },

  pages: [
    { id: 'home',     title: 'Home',                purpose: '…', required: true },
    { id: 'services', title: 'Services and prices', purpose: '…', on: true },
    { id: 'bridal',   title: 'Bridal and events',   purpose: '…', audience: 'bridal' },
    …
  ],

  audience: {
    legend: 'Who you serve',
    options: [ { value: 'new', label: 'New clients', checked: true }, … ],
  },

  forms: [
    { id: 'booking', title: 'Booking request', starter: 'Booking / Appointment',
      fields: ['Name', 'Email', 'Phone', 'Service (choice)', 'Preferred date (date)'],
      where: 'Home, Services, and every service page', on: true },
    …
  ],

  asks: [ { name: 'phone', label: 'Phone number', hint: 'for click-to-call' }, … ],

  extensions: ['post-types', 'custom-fields', 'forms', 'seo'],

  // optional, for verticals that want a pipeline
  crm: { stages: ['New enquiry', 'Booked', 'Visited', 'Rebooked', 'Regular', 'Lapsed'], emails: […] },
}
```

### The fields

| Field | What it carries |
| --- | --- |
| `id`, `label` | the identity; `id` goes on the spec as `vertical` |
| `covers` | the sub-types this one serves, so "I run a nail studio" finds *salon* |
| `vocabulary` | the trade's words, substituted into generated copy and headings |
| `pages` | the sitemap. `required: true` always included; `on: true` on by default; bare entries are offered and off; `audience: '<id>'` appears only when that audience is selected |
| `audience` | who the business serves — it gates pages and forms, and is the single most useful question to ask |
| `forms` | each with `starter` (which form template), `fields`, and `where` it is placed |
| `asks` | the extra facts this industry needs that the generic intake does not cover |
| `extensions` | Unyson+ extensions to activate |
| `crm` | **optional.** Pipeline stages and lifecycle emails, for verticals that want them |

### Two conventions worth keeping from the original

**`required` / `on` / bare** is a three-state default, not a boolean. It lets a template express "every
site needs this", "most do", and "some do" — which is exactly the shape of real advice, and it means
the person deselects rather than invents.

**Pages and forms both gate on `audience`.** One answer — who do you serve — configures several parts
of the site at once. That is why it is worth asking properly instead of inferring.

## How a vertical reaches the build

The create-site flow's [vertical input](../../../skills/create-site/inputs/vertical.md) reads it:

1. the template's `pages` become the spec's `pages`, with purposes intact;
2. `forms` and any `crm` block go to the spec's optional `lead_capture` / `crm` fields — which exist
   on the [schema](../../../skills/create-site/site-spec.schema.json) for exactly this;
3. `asks` are added to the intake questions;
4. `vocabulary` informs generated headings and labels;
5. everything the person does not answer goes to `missing[]`.

**The style is chosen separately.** A vertical decides structure, not look — a salon can be `luxury` or
`monochrome`, and both are right for different salons. Keeping the two axes apart is what stops a
template library turning into a theme library.

## Writing a new one

1. **Start from a real business**, not from a category. Imaginary industries produce imaginary pages.
2. **Fewer pages than you think.** The CRM presets offer ten to twelve and default about seven on.
3. **Get the vocabulary from the trade**, not from a thesaurus.
4. **Every page needs a purpose line** — the composition guide reads it to pick a page shape, and
   writing one forces you to justify the page.
5. **No facts.** If you catch yourself writing a price, a number or a testimonial, that is the rule.

The catalogue of available verticals is [`catalogue.md`](catalogue.md).
