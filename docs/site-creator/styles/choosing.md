<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Choosing a style

Thirty directions exist in [`prompts/`](prompts/README.md) and all thirty apply cleanly. That is the
problem this file solves: **nothing downstream can tell you a plausible style is the wrong one.** The
build applies what the spec says, the ship gate measures contrast and Lighthouse, and a site can pass
every gate while looking like the wrong business entirely.

A style is not a coat of paint. It is **a claim about what kind of organisation this is**, made before
the visitor reads a word. Get it wrong and every later decision inherits the error.

> **Read this at step 1 of [`create-site`](../../skills/create-site/SKILL.md), with the spec — not
> after building.** Styles differ in their section treatments, so changing one after the pages exist
> means rebuilding the pages, not repainting them.

## Do not route on the industry

The obvious table — *law firm to professional, gym to bold* — is the one to resist. Industry is a weak
proxy. A car-finance broker and a dental practice are in unrelated trades and have the **same** design
problem: a stranger is being asked to trust them with something consequential, so the site has to read
as careful. A tattoo studio and a record label are equally unrelated and share the opposite problem:
nobody doubts they can do the work, so the site has to be *interesting* or it has failed.

Route on the job the page is doing. Four questions, in order.

### 1 · What is the visitor risking? (the deciding question)

| Stake | What the design must do | Register |
| --- | --- | --- |
| Money, health, legal standing, their home | Look like it will still be here next year. Legible, unhurried, conventional where convention aids comprehension | **Conservative** |
| A booking, a purchase, a subscription | Look competent and current. Personality is allowed, confusion is not | **Contemporary** |
| Their time and attention only | Be worth looking at. A forgettable page has already lost | **Expressive** |

The failure runs one way far more often than the other. **An expressive style on a high-stake business
reads as inexperience**, which is the most expensive impression a site can make. The reverse — a
conservative style on a creative business — reads as dull, which costs less and is easier to fix.

### 2 · What shape is the content?

| Content | Wants | Avoid |
| --- | --- | --- |
| Long-form text, many pages, articles | `professional`, `academia`, `newsprint`, `monochrome` | Poster styles — nowhere to put 600 words |
| Photography-led, few words | `luxury`, `botanical`, `organic`, `monochrome`, `minimal-dark` | Loud surfaces that compete with the picture |
| Product, data, dashboards, features | `modern-dark`, `enterprise`, `saas`, `flat-design`, `material-design` | Textured and ornamental styles |
| One short page, a single message | `bold-typography`, `kinetic`, `neo-brutalism`, `swiss` | Dense editorial styles |
| Irregular — sections with no shared rhythm | `saas`, `enterprise`, `material-design`, `modern-dark` | **`swiss`** — see the traps |

### 3 · Who is the audience, in their own register?

Consumers, businesses, developers and collectors are four different rooms. `terminal` and `web3` are
fluent to one audience and illegible to the rest. `claymorphism` and `playful-geometric` read as
friendly to consumers and as unserious to a procurement committee.

### 4 · How much theatre has the brief earned?

[Build rule 11](../../skills/create-site/build-rules.md). Quiet / Measured / Full — the bar does not
move between levels, the available moves do. **Default to Measured.**

> **Measured is not undecorated, and this file has already caused that mistake once.** Routing a
> car-finance brief to a conservative style at Measured produced a page of flat rectangles — correct
> by every rule here, and generic. The level governs *how many* ideas, never *whether* the build uses
> the framework at all.
>
> At **Measured**, a site still gets: its surfaces chosen rather than defaulted, one band with a real
> texture, one considered edge where two very different bands meet, box and button presets edited
> rather than accepted, and **exactly one signature moment**. That is the floor, not the ceiling.
> [`recipes/components.md`](../recipes/components.md) is the inventory, and the
> [ship gate](../ship-gate.md)'s check 5 is what asks for the receipt.
>
> **Quiet** drops the texture and the edge and keeps everything else. Even Quiet chooses its presets.
> A level is a budget for spectacle; it was never permission to leave the library unopened.

## The routing table

Primary first; alternates are equally defensible. *Avoid* names the style most likely to be reached for
wrongly, with the reason. Those entries are what earns this file its place.

### Conservative — something consequential is at stake

| Business | Primary | Alternates | Avoid, and why |
| --- | --- | --- | --- |
| Finance, lending, broking | `enterprise` | `saas`, `professional`, `modern-dark` | `swiss` — the content is irregular, so it reads as an unstyled wireframe |
| Law firm, chambers, notary | `professional` | `academia`, `monochrome` | `neo-brutalism`, `sketch` — informality reads as inexperience where it costs most |
| Accountancy, audit, consultancy | `enterprise` | `swiss` *(only if the sections share a rhythm)*, `professional` | The expressive set entire |
| Medical, dental, clinic, therapy | `material-design` | `enterprise`, `botanical`, `organic` | Dark styles — clinical content on near-black reads as a nightclub |
| Estate agency, property, lettings | `luxury` | `professional`, `monochrome` | `retro`, `vaporwave` |
| Recruitment, HR, staffing | `enterprise` | `saas`, `flat-design` | `terminal`, unless the desk is genuinely developers-only |
| Trades, home services, contractors | `industrial` | `flat-design`, `enterprise` | `luxury` — it misprices the business before a quote is given |
| Insurance, pensions, wealth | `professional` | `enterprise`, `monochrome` | Everything expressive |

### Contemporary — a booking, a purchase, a subscription

| Business | Primary | Alternates | Avoid, and why |
| --- | --- | --- | --- |
| SaaS, B2B software, API product | `modern-dark` | `enterprise`, `saas`, `minimal-dark` | `academia`, `newsprint` |
| Developer tool, CLI, infrastructure | `terminal` | `modern-dark`, `minimal-dark` | Friendly consumer styles — the audience reads them as a toy |
| Crypto, on-chain, wallets | `web3` | `modern-dark`, `cyberpunk` | Light conservative styles |
| Ecommerce, DTC brand | `flat-design` | `material-design`, `saas`, `organic` | `terminal`, `academia` |
| Restaurant, café, food | `organic` | `botanical`, `luxury`, `newsprint` | `enterprise` — a procurement look on a dinner booking |
| Hotel, travel, hospitality | `luxury` | `botanical`, `monochrome` | `neo-brutalism`, `industrial` |
| Gym, fitness, sport | `bold-typography` | `neo-brutalism`, `industrial`, `modern-dark` | `academia`, `botanical` |
| Salon, spa, beauty | `luxury` | `organic`, `botanical` | `terminal`, `industrial` |
| Education, courses, schools | `academia` | `material-design`, `professional` | `cyberpunk`, `vaporwave` |
| Children, family, play | `playful-geometric` | `claymorphism`, `material-design` | The conservative set entire |
| Nonprofit, charity, campaign | `organic` | `flat-design`, `newsprint`, `bold-typography` | `luxury` — it contradicts the ask |
| Venue, events, conferences | `kinetic` | `bold-typography`, `swiss`, `art-deco` | `neumorphism` |

### Expressive — only attention is at stake

| Business | Primary | Alternates | Avoid, and why |
| --- | --- | --- | --- |
| Design studio, agency | `swiss` | `monochrome`, `bauhaus`, `bold-typography` | `material-design` — a framework default reads as having no opinion |
| Portfolio, photographer, artist | `monochrome` | `luxury`, `minimal-dark`, `botanical` | Anything with loud surfaces |
| Architecture, interiors | `swiss` | `monochrome`, `luxury` | Decorative styles |
| Magazine, news, publishing | `newsprint` | `professional`, `academia`, `monochrome` | `kinetic` — see the naming note |
| Music, festival, nightlife | `kinetic` | `maximalism`, `vaporwave`, `neo-brutalism` | Conservative styles |
| Gaming, esports | `cyberpunk` | `neo-brutalism`, `web3`, `vaporwave` | `professional`, `academia` |
| Craft, maker, handmade | `sketch` | `organic`, `botanical` | `enterprise` |
| Museum, gallery, culture | `monochrome` | `academia`, `art-deco`, `swiss` | `claymorphism` |
| Fashion, luxury goods | `luxury` | `monochrome`, `art-deco` | `flat-design` |
| Retro and nostalgia brands | `retro` | `vaporwave`, `bauhaus` | — |

### The naming trap: kinetic is a poster, not an editorial

`kinetic` sounds like it belongs to magazines, and it does not. It is a full page style — it has a
preset and a specimen page — but its register is the one its own brief names: *"festival graphics,
protest posters, underground zines"*, at an 8–10× ratio between headline and body, uppercase at
`line-height: 0.82`, acid yellow on rich black. That is a poster. Give it a news site and the headline
fills the screen with nowhere to put the article.

**Magazines and news are `newsprint`** — print journalism, visible grid, high information density — or
`professional` / `academia` for the long-read register.

Separately, *kinetic typography* as **motion** (animated lettering, lyric-video text) is a Kinetic
Scenes job, not a site style. Two different things share the word; only the page style belongs here.

## The traps

Styles that apply perfectly and are usually the wrong answer. Each is listed because the mistake is
easy to make and the failure is invisible until someone looks at the result.

| Style | Only correct when | Why it goes wrong |
| --- | --- | --- |
| **`swiss`** | The content is genuinely regular — every section on the same tracks — **and** there is real white space | Its own file: *"squeezed, it reads as plain rather than as composed."* On ordinary marketing content it produces a wireframe. It also needs a Primary section preset created by hand, or the CTA silently lands on near-black and it has quietly become a different style |
| **`terminal`** | The audience is developers and the subject is a shell, server or CLI | Elsewhere it is a costume, and monospace at body length is slower to read |
| **`neumorphism`** | Almost never on a public site | One surface colour, with shape from light alone — contrast is low **by construction**, so it fights build rule 10 at every control. Expect to fail the ship gate honestly |
| **`cyberpunk`, `vaporwave`, `maximalism`** | Entertainment, music, gaming, nightlife | Saturation and glow read as atmosphere to the designer and as noise to everyone else. None of them survives a form |
| **`neo-brutalism`** | The brand is deliberately anti-corporate | On a professional service it reads as an unfinished site rather than a decision |
| **`sketch`, `claymorphism`** | Children, education, crafts, informal consumer | Hand-drawn wobble beside a price or a legal term undercuts both |
| **`kinetic`, `bold-typography`** | Few words, one message, a short page | Poster scale needs almost no copy; hand either a 600-word page and the layout stops working |
| **`retro`** | Nostalgia is the actual product | Otherwise visitors read it as a broken stylesheet |
| **`luxury`** | The prices really are high | Expensive restraint on a budget service opens a gap between the page and the quote, and the quote loses |

## When the person has already chosen

**Their choice wins.** They can see their business and you cannot.

State the cost once, in one line, then build what they asked for:

> *Swiss over six pages of finance copy will read as plain rather than composed — its own brief warns
> about exactly this. Building it; say the word and I'll put it on Enterprise instead.*

Do not substitute silently, and do not argue twice. A style the person chose after a warning is a
decision. A style you swapped behind their back is a defect.

## Recording the choice

The spec carries the result, and the reason travels with it so a later session does not re-litigate it:

```json
"brand": {
  "style": "enterprise",
  "style_reason": "High-stake purchase, irregular content across six pages, consumer audience."
}
```

Say the style, the register and the reason in one line before building, the same way
[build rule 11](../../skills/create-site/build-rules.md) makes you name the theatre level:

> *Enterprise, Measured — a car-loan broker is a trust purchase, so the budget goes into the rate
> explainer, not the hero.*
