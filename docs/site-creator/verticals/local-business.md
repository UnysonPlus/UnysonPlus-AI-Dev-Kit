<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical: local business

A business with a storefront and an address — a shop, café, studio, bakery, garage, florist. The
broadest real gap under the generic *any business* fallback, and the one where **being found** matters
more than anything else on the page.

Format: [`README.md`](README.md).

```js
{
  id: 'local-business',
  label: 'Local business',
  covers: ['shop', 'café', 'restaurant', 'bakery', 'studio', 'garage', 'florist', 'workshop'],

  vocabulary: { practitioner: 'team member', service: 'what we offer', client: 'customer' },

  pages: [
    { id: 'home',    title: 'Home',        purpose: 'What this place is, where it is, when it is open, and one clear next step.', required: true },
    { id: 'offer',   title: 'What we do',  purpose: 'Products or services, grouped, with prices where they are fixed.', on: true },
    { id: 'visit',   title: 'Visit us',    purpose: 'Address, map, parking, access, and what to expect on arrival.', on: true },
    { id: 'about',   title: 'About',       purpose: 'Who runs it and why it exists. The page that makes a local business a place rather than a unit.', on: true },
    { id: 'gallery', title: 'Gallery',     purpose: 'Photos of the place and the work.' },
    { id: 'events',  title: 'Events',      purpose: 'Classes, tastings, markets.', audience: 'events' },
    { id: 'contact', title: 'Contact',     purpose: 'Form, phone, email, hours and map.', required: true },
    { id: 'privacy', title: 'Privacy policy', purpose: 'How customer data is handled.', required: true },
  ],

  audience: {
    legend: 'Who comes in',
    options: [
      { value: 'locals',   label: 'Regular locals', checked: true },
      { value: 'visitors', label: 'Visitors and tourists' },
      { value: 'trade',    label: 'Trade or wholesale' },
      { value: 'events',   label: 'People booking events or classes' },
    ],
  },

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact',
      fields: ['Name', 'Email', 'Phone', 'Message'], where: 'Contact page and footer', required: true },
    { id: 'enquiry', title: 'Enquiry', starter: 'Quote request',
      fields: ['Name', 'Email', 'Phone', 'What you need', 'When'], where: 'What we do page', on: true },
    { id: 'event',   title: 'Event or class booking', starter: 'Booking / Appointment',
      fields: ['Name', 'Email', 'Phone', 'Which event', 'Number of people'], where: 'Events page', audience: 'events' },
  ],

  asks: [
    { name: 'address', label: 'Full address', hint: 'the one Google should show' },
    { name: 'hours',   label: 'Opening hours', hint: 'including the days you are closed' },
    { name: 'parking', label: 'Parking and access', hint: 'optional, but the most-asked question' },
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'seo'],
}
```

## What this vertical is really for

**Local SEO**, more than layout. Set `seo.schema_type` to `LocalBusiness` and fill it from the real
address and hours — and from nothing else. An invented address in structured data is worse than no
structured data: it is machine-readable misinformation about a real place, and it will be believed.

Three facts carry most of the value and all three come from the owner: **address, hours, phone**. If
hours are missing they go in `missing[]` and no hours block is rendered — a plausible "Mon–Fri 9–5" is
exactly the kind of invention that sends someone to a closed door.

## Style

Usually warm rather than severe: `luxury` for a considered boutique, `newsprint` for somewhere with a
story, `monochrome` for a design-led studio. `terminal` and `brutalist` almost never fit a place people
physically walk into.
