<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Input: a vertical template

*"Start from something for my industry."*

An industry starting point — the sitemap, the section shapes, the forms and the vocabulary a business
of that kind actually needs — which the person then customizes. No capture; this is a fresh build with
a head start.

## Where the pattern comes from

The **CRM website generator** already does this for nine verticals (salon, clinic, fitness, law firm,
real estate, recruitment, home services, venue, and a generic “any business”). Its presets carry exactly
the right things: the business types and their vocabulary, the pages, the forms, the pipeline stages, and
what the site ships with.

The generalized format is [verticals/README.md](../../../docs/site-creator/verticals/README.md), derived
from those presets rather than designed from scratch; the available set is in
[catalogue.md](../../../docs/site-creator/verticals/catalogue.md).

**For a CRM-shaped site, use the generator**: it is better than anything improvised and it emits a spec
this skill already reads. The format exists so further verticals do not have to be CRM-shaped.

## What a vertical supplies, and what it never does

**Supplies** — shape:

- the sitemap and each page's purpose;
- the archetypes per page, and the section order;
- the forms and what they must capture;
- the vocabulary (a salon has *stylists* and *treatments*; a law firm has *practice areas* and
  *matters*), which is most of what makes a generic template feel wrong.

**Never supplies** — facts. A template cannot know the prices, hours, team, accreditations or
testimonials, and a template that ships with plausible ones is the fastest route to breaking
[rule 4](../build-rules.md). Every slot a vertical defines but the person has not filled is `missing[]`,
and the section is omitted.

This is the trap worth naming: a vertical template is the input **most likely** to produce invented
content, because it arrives already shaped like a finished site. The shape is the gift; the emptiness
is honest and must stay.

## The job

1. **Pick the vertical** with the person, from the available list. Offer the nearest when none matches
   exactly, and say what differs.
2. **Take its shape** into the spec — pages, sections, forms, vocabulary.
3. **Fill the facts from the person**, slot by slot. This is the bulk of the work and it is the part
   that makes it their site rather than a template with their name on it.
4. **Pick a style** separately. A vertical decides structure, not look — a salon can be `luxury` or
   `monochrome` and both are right for different salons.
5. **List what is missing**, omit those sections, and build.

## Set on the spec

`source: "vertical"` and `vertical: "<id>"`. Where the vertical carries CRM-shaped blocks, they go in
the optional `lead_capture` and `crm` fields, which exist on the schema for exactly this.
