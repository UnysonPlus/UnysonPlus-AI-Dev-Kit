<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical: professional service

Consultancies, accountants, architects, agencies, independent specialists — businesses sold on
**judgement**, where the buyer is choosing a person or a firm rather than a product.

Format: [`README.md`](README.md).

```js
{
  id: 'professional-service',
  label: 'Professional service',
  covers: ['consultancy', 'accountant', 'architect', 'agency', 'engineer', 'advisor', 'studio'],

  vocabulary: { practitioner: 'consultant', service: 'service', client: 'client', engagement: 'engagement' },

  pages: [
    { id: 'home',     title: 'Home',        purpose: 'What the firm does, for whom, and the one next step. Credibility before detail.', required: true },
    { id: 'services', title: 'Services',    purpose: 'Each service as its own section or page: the problem it solves, how the engagement runs, what it costs to start.', required: true },
    { id: 'approach', title: 'How we work', purpose: 'The method. The page that separates a firm with a process from one with a rate card.', on: true },
    { id: 'work',     title: 'Work',        purpose: 'Case studies or sectors served — ONLY where the client agreed to be named.', on: true },
    { id: 'team',     title: 'Team',        purpose: 'The people, with the qualifications that matter in this field.', on: true },
    { id: 'insights', title: 'Insights',    purpose: 'Articles. The long game for a service sold on expertise.', on: true },
    { id: 'contact',  title: 'Contact',     purpose: 'Enquiry form, direct contacts, offices.', required: true },
    { id: 'privacy',  title: 'Privacy policy', purpose: 'How enquiry and client data is handled.', required: true },
  ],

  audience: {
    legend: 'Who you work with',
    options: [
      { value: 'smb',       label: 'Small and medium businesses', checked: true },
      { value: 'corporate', label: 'Corporate or enterprise' },
      { value: 'public',    label: 'Public sector' },
      { value: 'private',   label: 'Private individuals' },
    ],
  },

  forms: [
    { id: 'enquiry', title: 'Enquiry', starter: 'Contact',
      fields: ['Name', 'Email', 'Phone', 'Organisation', 'What you need help with'],
      where: 'Contact page, every service page, and the footer', required: true },
    { id: 'consult', title: 'Book a consultation', starter: 'Booking / Appointment',
      fields: ['Name', 'Email', 'Phone', 'Organisation', 'Preferred time', 'Context'],
      where: 'Home and Services', on: true },
    { id: 'insights', title: 'Insights signup', starter: 'Newsletter signup',
      fields: ['Name', 'Email', 'Consent to receive emails'], where: 'Footer and Insights' },
  ],

  asks: [
    { name: 'credentials', label: 'Qualifications, memberships, registrations', hint: 'only ones that are current' },
    { name: 'sectors',     label: 'Sectors you serve' },
    { name: 'pricing',     label: 'How you price', hint: 'fixed, day rate, retainer — or "on application"' },
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'seo', 'blog'],
}
```

## The two traps specific to this vertical

**Credentials.** Accreditations, registrations and memberships are checkable claims and often
regulated. Every one comes from the owner, and a lapsed membership stated as current is a real problem,
not a typo. If they are not supplied, there is no credentials block.

**Case studies.** The strongest page this vertical has, and the one most often filled with invention. A
case study names a client, a situation and a result — all three are facts, and the client usually has
to **agree to be named**. No supplied case studies means no Work page; an anonymised "a leading
retailer" is only acceptable if the owner wrote it.

## Style

`monochrome` and `swiss` suit firms selling precision; `luxury` suits advisory work where the client is
buying discretion. `modern-dark` fits technical consultancies. The deciding question is whether the
buyer wants to feel *reassured* or *impressed* — this vertical more than any other.
