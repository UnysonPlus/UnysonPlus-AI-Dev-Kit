<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical catalogue

The industry starting points available today. Format: [`README.md`](README.md).

## Available now — through the CRM website generator

Nine verticals run in production in the **CRM website generator**, which emits a spec the create-site
flow reads. These are not prototypes: they carry real sitemaps, forms, pipelines and trade vocabulary,
and they are the proof the vertical pattern works.

| Vertical | Covers |
| --- | --- |
| **Salon and spa** | hair salons, beauty salons, spas, barbershops, nail studios |
| **Dental or medical clinic** | dental practices, GP and specialist clinics, allied health |
| **Fitness studio or gym** | gyms, studios, personal trainers, classes |
| **Home services** | trades, maintenance, cleaning, installers |
| **Law firm** | practices by area, consultations, matters |
| **Real estate** | agencies, listings, valuations |
| **Recruitment agency** | vacancies, candidates, employers |
| **Event venue and weddings** | venues, packages, viewings |
| **Any business** | the generic fallback when none of the above fits |

**For a CRM-shaped site today, use the generator** rather than re-deriving a sitemap from memory. It is
better than anything improvised, and what it emits is a spec this flow already understands.

> **"Any business" is the one to notice.** Its presence is the honest admission that a template library
> never covers everything — and it is a deliberately *thin* template rather than a kitchen sink, which
> is the right failure mode. A generic starting point that tries to serve every industry serves none.

## Written for the creator

Four templates in [the format](README.md), covering the gaps the CRM set does not:

| Vertical | Covers | The thing it must not invent |
| --- | --- | --- |
| [Local business](local-business.md) | shops, cafés, studios, garages — anywhere with an address | the address and hours; a wrong one in LocalBusiness schema is machine-readable misinformation |
| [Professional service](professional-service.md) | consultancies, accountants, architects, agencies — **shipped**, as a CRM industry | credentials and case studies — both are checkable claims, and a client usually has to agree to be named |
| [Ecommerce](ecommerce.md) | shops on WooCommerce | delivery costs, returns terms and stock — the first two are consumer-law problems, not copy problems |
| [SaaS / product](saas.md) | apps, developer tools, plugins | prices — a plausible figure on a pricing page will be quoted back at the business |

**Professional service is live.** It shipped as the ninth CRM industry at
`create.unysonplus.com/crm/professional-service/`, built from the template above. That is the route for
any vertical whose business has an enquiry-to-client pipeline: the generator’s engine is CRM-shaped, so
such a vertical becomes an INDUSTRY inside the CRM family rather than a family of its own. Ecommerce and
SaaS cannot take that route — they need their own form — which is what makes them real future families.

Ecommerce is the odd one out: it is not just a sitemap. It activates WooCommerce and inherits a
product, cart and checkout surface the creator styles but does not own.


## What a vertical is worth, honestly

A template saves the *structural* thinking — which pages, which forms, what the trade calls things —
and that is genuinely most of the tedium in starting a site.

It saves none of the content work. Every price, hour, person and claim still comes from the owner, and
the sections whose facts never arrive are **omitted**, not filled. A vertical that appears to produce a
finished site straight away has either been given a lot of facts or has invented some.

That is the measure to apply when adding one: does it make the structure obvious, or does it make the
emptiness easy to hide?
