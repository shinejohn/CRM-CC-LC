# PASS 2 — Rewrite Brief (trust-first, audience-anchored)

You are rewriting Day.News campaign emails so the WHOLE journey matches the trust-first opening we just built.

## Read first, in this order (governing):
1. `AUDIENCE.md` — who the reader is (busy, NON-technical local owner: restaurants, bars, bowling lanes, attorneys, accountants, plumbers, landscapers, salons, shops). The Translation Rule + banned-jargon list are mandatory.
2. `VISION.md` — why we exist + the give-to-get / trust-first thesis.
3. `opening-sequence.md` — **THE VOICE BENCHMARK.** These 8 emails (avg 4.25/5) are the gold standard. Match this voice, warmth, concreteness, and quality exactly. Study Email 8 for how we handle money (value/fairness/the scale story), and the P.S. reply-hook pattern.
4. `RUBRIC.md` — the bar (audience-fit test, 0–5, THIN flag).

## For each email in your batch
Read BOTH `email-pipeline/<CID>/<key>.email.md` (original) and `email-pipeline/<CID>/<key>.rescore.md` (its audience diagnosis — the **REFRAME line is your angle**). Then write a rewrite to `email-pipeline/<CID>/<key>.rewrite.md`.

## The rules (non-negotiable)
- **Talk to the reader, never an IT buyer.** Translate every system/feature line into their world: a fuller house, the phone ringing, full lanes, a booked tax season, time back, pride, a town worth living in. No jargon (platform, dashboard, CRM, integration, automation, optimize, leverage, seamless, onboarding…).
- **Give-to-get.** Most emails give value; asks are earned and SINGLE. Roughly 3–4 gives per ask across the journey.
- **Community chord.** Strike it wherever honest — a town that gets its fun, its suppliers, its wisdom, its help from the people next door. This is our strongest, most honest angle.
- **Money (critical).** NEVER imply "all free forever." The basics stay free (listing, being in the town's paper, posting events/specials, a story about them). The paid side is **one simple, fair, bundled monthly subscription**, affordable **because we run it for thousands of communities at once — the cost is shared**, so a single town gets what would cost a fortune to build alone. Lead every paid ask with **value + fairness + community**, light on price. Model: opening Email 8.
- **Structure.** Subject ≤ ~35 chars, opens a curiosity loop, no spam triggers (free/act now/limited time/buy now/ALL CAPS/emoji), human (a line only a real person would write), not AI-generic. Preview does a SECOND job (don't repeat the subject — finish the sentence, flip, or diagnose-then-promise). ONE primary CTA. Concrete scene opening, not "Hi [Name], here's how to…" throat-clearing. Reader is the hero, not the product.
- **THIN emails** (flagged in `.rescore.md` — no real story/number/customer result): re-aim the framing only. **DO NOT invent stories, stats, names, or testimonials.** If it needs real material to be great, write the best honest structural version AND add a final line `[NEEDS REAL MATERIAL: <exactly what — e.g. "a real local customer result with a number">]`.
- Keep merge tokens verbatim: `[First Name]` `[Business Name]` `[Community Name]` `[Category]` `[AM Name]`. CTA marker style `[LABEL →]`. Keep `\n` paragraph breaks.

## Output per email (`<CID>/<key>.rewrite.md`):
```
# <CID>/<key> — Rewrite
SUBJECT: ...
PREVIEW: ...
BODY:
<the email>
---
CHANGED: <one line on the core reframe you made>
NEEDS_MATERIAL: <none | what real material a human must supply>
```

## Journey context (where your batch sits)
The reader has (in the new design) just spent ~3 weeks receiving GIVES and earned trust (the opening, Days 1–21).
- **HOOK-004…015** = the "earned ask" stretch (Days 24–90): the first real offers, now trust-backed. Lead with value/fairness/the simple fair subscription; one ask each; never revert to feature-dump.
- **EDU** = the nurture track for the not-yet-converted: teach something a plumber/bar owner actually cares about, in their language, with the community chord — then a soft ask. Most were abstract tech-trend think-pieces; make them concrete and local.
- **HOWTO** = for subscribers: help them WIN with what they bought (a fuller house, time back, looking sharp), NOT "configure a feature." These were the worst IT-buyer-speak — translate hardest.
- **CONV** = the close: value + honest proof + a fair offer + real (community-slot) scarcity, never abstract pricing/positions. The weakest set — rebuild them.
