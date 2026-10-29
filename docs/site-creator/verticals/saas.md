<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical: SaaS / product

A software product sold by subscription or licence. The most **page-shaped** vertical in the set —
there is a well-worn structure here and deviating from it rarely helps the buyer.

Format: [`README.md`](README.md).

```js
{
  id: 'saas',
  label: 'SaaS / product',
  covers: ['saas', 'web app', 'mobile app', 'developer tool', 'plugin or extension'],

  vocabulary: { service: 'feature', client: 'customer', engagement: 'plan' },

  pages: [
    { id: 'home',     title: 'Home',      purpose: 'What it does, who for, the proof, and one action. The single most important page.', required: true },
    { id: 'features', title: 'Features',  purpose: 'Capabilities grouped by the job they do — never an undifferentiated list.', on: true },
    { id: 'pricing',  title: 'Pricing',   purpose: 'Plans and what separates them. Second most-visited page after the home page.', required: true },
    { id: 'usecases', title: 'Use cases', purpose: 'One page per audience, each reading like their home page.', audience: 'segments' },
    { id: 'docs',     title: 'Docs',      purpose: 'Where the documentation lives — often another system entirely; link it rather than fake it.' },
    { id: 'changelog',title: 'Changelog', purpose: 'What shipped. Quiet proof the product is alive.' },
    { id: 'about',    title: 'About',     purpose: 'Who builds it. Matters more for small products than large ones.', on: true },
    { id: 'contact',  title: 'Contact',   purpose: 'Sales and support, clearly separated.', required: true },
    { id: 'terms',    title: 'Terms',     purpose: 'Terms of service.', required: true },
    { id: 'privacy',  title: 'Privacy policy', purpose: 'Data handling, sub-processors, retention.', required: true },
  ],

  audience: {
    legend: 'Who it is for',
    options: [
      { value: 'developers', label: 'Developers', checked: true },
      { value: 'smb',        label: 'Small businesses' },
      { value: 'enterprise', label: 'Enterprise buyers' },
      { value: 'segments',   label: 'Several distinct segments' },
    ],
  },

  forms: [
    { id: 'contact', title: 'Contact sales', starter: 'Contact',
      fields: ['Name', 'Work email', 'Company', 'Team size', 'What you are trying to do'],
      where: 'Contact page and the enterprise plan', required: true },
    { id: 'trial',   title: 'Start a trial', starter: 'Contact',
      fields: ['Name', 'Work email', 'Company'], where: 'Home and Pricing', on: true },
    { id: 'updates', title: 'Product updates', starter: 'Newsletter signup',
      fields: ['Email', 'Consent to receive emails'], where: 'Footer and Changelog' },
  ],

  asks: [
    { name: 'plans',      label: 'Plans, prices and billing period', hint: 'exact figures, or "contact us" for enterprise' },
    { name: 'trial',      label: 'Is there a free trial or tier, and what are its limits' },
    { name: 'signup_url', label: 'Where sign-up actually happens', hint: 'usually the app, not this site' },
    { name: 'docs_url',   label: 'Where the documentation lives' },
  ],

  extensions: ['post-types', 'custom-fields', 'forms', 'seo', 'blog'],
}
```

## Pricing is the page that decides this vertical

It is the second most-visited page and the one buyers screenshot and forward. So:

- **Exact figures or nothing.** A plausible price on a pricing page is the worst invention in this
  whole library — it will be quoted back at the business.
- **The shape comes from the offer**, not from a default. Tiers with feature lists are the pricing
  table's **grid**; usage-based or per-service pricing is its **list**. Reading the shape off the offer
  rather than defaulting to cards is the same lesson the converter learned the hard way.
- **If prices are not supplied**, the page exists with the plan names and "contact us", and `missing[]`
  carries the rest. Do not invent a middle tier to make three columns look balanced.

## The home page is most of the work

More than in any other vertical, the home page has to do the whole job: what it does, who for, proof,
and one action. The [composition guide's](../composition.md) home shape applies, with the usual
caution — a proof band only exists if real proof was supplied. "Trusted by 500+ teams" invented for a
layout is a fabricated claim with a number attached.

## Style

`modern-dark` is the register most of this category uses, and it is a real fit rather than a cliché for
developer tools. `terminal` suits CLIs and infrastructure. `swiss` is the strongest alternative for a
product that wants to look considered rather than current — and it ages far better.
