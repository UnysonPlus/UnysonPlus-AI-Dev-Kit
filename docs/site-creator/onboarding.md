<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Getting started

How to build a site with the creator, written for someone who has not used an AI coding agent before.

There is no app to sign up for. The creator runs **inside your own agent** — Claude Code, Cursor or
similar — using the AI Dev Kit as its instructions. That means it runs on your machine, against your
WordPress, and nothing is uploaded anywhere.

## What you need

1. **A WordPress site you can log into.** A local one is ideal while you are learning; a live site works
   but read the warning below first.
2. **The Unyson+ plugin and theme** installed and active on it.
3. **An AI coding agent** — Claude Code is the one these instructions assume.
4. **The AI Dev Kit**, downloaded to your computer.

## The three steps

### 1 · Point your agent at the kit

Open your agent in the folder where the kit lives. That is the whole setup: the kit is instructions and
tools, so an agent working in that folder can read them.

If you are not sure it worked, ask it: *"what skills do you have?"* It should mention `create-site`.

### 2 · Tell it where your WordPress is

It needs the path to the WordPress install — for a local one, the folder; for a hosted one, however you
normally reach it.

> **Start on a local site.** Not because the creator is unsafe, but because a first run is where you
> learn what you actually want, and iterating is free when nothing is public. Everything it builds is a
> draft, but a draft on a live site is still one keystroke from being published by someone else.

### 3 · Say what you want

Plain language is the interface. Any of these work:

- *"Build me a site for a barber shop in Brighton — warm and dark, booking-led."*
- *"Build something like example.com but for my accountancy practice."*
- *"Here's a screenshot of a design I like — build my site in that style."*
- *"Start from a template for a dental clinic."*

Those are the [four routes](../../skills/create-site/SKILL.md), and you do not need to know which one
you picked.

## What happens next

**It will ask you questions, and the questions are the point.** Your business name, what pages you
want, which style, what you want visitors to do, and — importantly — what real content you have:
photos, copy, a logo, testimonials, prices.

**Then it shows you a spec before building.** A short, structured description of the site. Read it: it
is far cheaper to change a line here than to rebuild afterwards.

**Then it builds** — design system, header and footer, pages, motion — and runs its own checks.

**Then it tells you what it left out.** This is the part most worth your attention.

## The thing that surprises people

**It will not invent content**, and that is deliberate.

If you have no testimonials, your site has no testimonials section. If you have not given it prices,
there is no pricing table. It will list what is missing and tell you.

This can look like it did less than you expected. The alternative is a site containing a quote from a
customer who does not exist, a statistic nobody measured, and opening hours that send someone to a
closed door — all of which look great in a screenshot and are your problem afterwards.

**Give it the real facts and the sections appear.** That is usually a five-minute conversation and it
is the difference between a demo and a site.

## What you get

A normal WordPress site. The pages open in the Unyson+ builder; the colours and fonts are in Theme
Settings. You can edit all of it without the agent, and so can anyone you hire later.

Nothing is published until you ask.

## When you are ready for more

- **Add a page or a post later:** the [content flow](../../skills/create-site/content.md) — it researches,
  shows you a plan, waits, drafts, and waits again before publishing.
- **Change the look:** pick another [style](styles/README.md). Because the design lives in Theme
  Settings rather than on each element, restyling is a change to the design system, not a rebuild.
- **See the styles first:** the [gallery](gallery.md).

## If something looks wrong

The most common one, and the least obvious: **the colours are wrong and look like a default theme.**
That is the generated preset CSS not having been rebuilt — the site has your palette stored and is
serving Bootstrap's. Say *"the button colours did not apply"* and the agent knows the fix.
