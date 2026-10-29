<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical: ecommerce

A shop. **Unlike every other vertical, this one is not just a sitemap** — it activates WooCommerce and
inherits a whole product, cart, checkout and account surface that the creator does not own.

Format: [`README.md`](README.md).

```js
{
  id: 'ecommerce',
  label: 'Ecommerce',
  covers: ['online shop', 'direct-to-consumer brand', 'retailer with a catalogue'],

  vocabulary: { service: 'product', client: 'customer', collection: 'collection' },

  pages: [
    { id: 'home',      title: 'Home',        purpose: 'The proposition, featured products or collections, and one route into the catalogue.', required: true },
    { id: 'shop',      title: 'Shop',        purpose: 'The catalogue. WooCommerce owns this page — the creator styles it, it does not rebuild it.', required: true },
    { id: 'about',     title: 'About',       purpose: 'Who makes it and why. Does disproportionate work for a small brand.', on: true },
    { id: 'delivery',  title: 'Delivery and returns', purpose: 'Costs, timescales, returns window. The most-visited page before a first purchase.', required: true },
    { id: 'faq',       title: 'FAQ',         purpose: 'Sizing, materials, care, stock.', on: true },
    { id: 'contact',   title: 'Contact',     purpose: 'Form, email, and a real response time.', required: true },
    { id: 'terms',     title: 'Terms',       purpose: 'Terms of sale.', required: true },
    { id: 'privacy',   title: 'Privacy policy', purpose: 'How customer and order data is handled.', required: true },
  ],

  audience: {
    legend: 'Who buys',
    options: [
      { value: 'direct',    label: 'Consumers direct', checked: true },
      { value: 'trade',     label: 'Trade or wholesale' },
      { value: 'subscribe', label: 'Subscription customers' },
    ],
  },

  forms: [
    { id: 'contact', title: 'Contact', starter: 'Contact',
      fields: ['Name', 'Email', 'Order number (optional)', 'Message'], where: 'Contact page and footer', required: true },
    { id: 'wholesale', title: 'Wholesale enquiry', starter: 'Quote request',
      fields: ['Name', 'Email', 'Business name', 'What you stock', 'Volume'], where: 'A wholesale page', audience: 'trade' },
    { id: 'news', title: 'Newsletter', starter: 'Newsletter signup',
      fields: ['Email', 'Consent to receive emails'], where: 'Footer', on: true },
  ],

  asks: [
    { name: 'shipping',  label: 'Delivery costs and timescales', hint: 'per region if they differ' },
    { name: 'returns',   label: 'Returns window and conditions' },
    { name: 'payments',  label: 'Payment methods accepted' },
    { name: 'catalogue', label: 'How many products, and do they exist yet' },
  ],

  extensions: ['woocommerce', 'post-types', 'custom-fields', 'forms', 'seo'],
}
```

## What the creator does and does not own

**Owns**: the home page, the content pages, the design system, the chrome, and the *styling* of the
WooCommerce templates.

**Does not own**: product, cart, checkout, account. Those are WooCommerce's, they are heavily
customized by plugins in the wild, and rebuilding them as builder pages breaks every integration the
shop will later want. Style them; do not replace them.

## Three things this vertical must not invent

- **Delivery costs and timescales.** A wrong figure here is a consumer-law problem, not a copy problem.
- **Returns terms.** Jurisdiction-dependent and legally binding.
- **Stock and product data.** If the catalogue does not exist yet, the shop page is empty and the build
  says so. A demo filled with placeholder products is a shop that cannot be launched without someone
  finding and deleting them all.

All four `asks` above go to `missing[]` when unanswered, and the pages that depend on them are omitted
rather than guessed. Delivery and Terms are marked `required` precisely so their absence is visible.

## Style

Product photography carries the page, so the style must get out of its way: `monochrome` and `luxury`
both do. Avoid `terminal` and `brutalist` — they fight the imagery. `modern-dark` works for technical
products and badly for anything soft or edible.
