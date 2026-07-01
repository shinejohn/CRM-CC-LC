# Pass-1 Diagnosis Rubric (from the "Million Dollar Emails" framework)

Score each email **0–5** on overall quality, and answer each diagnostic below. Do NOT rewrite — diagnose only.

## READ `email-pipeline/AUDIENCE.md` FIRST — it governs everything here.
The reader is a **busy, non-technical** small-business owner / nonprofit / community / government leader. They do
NOT care about systems, IT, integrations, dashboards, or "features." They care about happy customers, more sales,
less wasted time, pride in their org, and **building a community/world they want to live in.** Judge every email
against that reader first.

## Context for these emails
These are B2B local-marketing emails from **Day.News** (a hyperlocal community news + business-services platform) to small businesses, nonprofits, and civic orgs. They run on automated timelines (Hook = free-listing/claim offers; EDU = educational nurture; HOWTO = feature adoption for subscribers; CONV = conversion; INTRO = intro). Merge tokens like `[First Name]`, `[Community Name]`, `[Category]`, `[AM Name]`, `[X]`, and CTA markers like `[CLAIM YOUR LISTING →]` are intentional — judge them as filled-in, don't penalize the token itself.

## AUDIENCE-FIT TEST (the most important diagnostic — answer it explicitly)
Does this email speak to a busy, non-technical owner/leader about **their customers, their sales, their time, and
their community** — or does it talk **systems / features / IT** to a buyer who doesn't exist? Flag every line that
sells the system instead of the outcome (e.g. "integrate your CRM", "analytics dashboard", "automation"). Note
whether it strikes the **community chord** (a thriving local scene, a town worth living in) where it honestly could.
An email can be structurally competent and still FAIL here — say so, and cap its score at 3 if it's talking to the
wrong person.

## The framework's core tests
1. **One email, one lesson, one ask.** Is there a single clear ask? Exactly one primary CTA? (Multiple competing CTAs = a flaw — note how many.)
2. **The lesson.** Is there one useful takeaway the reader walks away with? State it. Does it work on two levels (useful on the surface + a subtle nudge toward what Day.News sells)?
3. **Story / interest.** Is there a story or a genuinely interesting angle, or is it flat "here's a feature, here's a button"? A-to-B (predictable) or A-to-Z (unexpected)? Most of these will be feature/offer emails — judge whether they still earn attention or read as a faceless brand blast.
4. **The opening.** Does line 1 drop into something concrete/specific, or is it throat-clearing ("Hi [Name], your business is…")? The framework wants concrete-from-the-first-word; flag generic openers.
5. **Subject line.** Does it open a curiosity loop or just describe? Char count (target ≤~35 / 3–7 words; flag long ones). Any spam triggers (free, act now, click here, limited time, buy now, ALL CAPS, emoji)? Is it a line "only a human could write," or AI-generic?
6. **Preview text.** Does it do a *second* job (deepen the subject, finish the sentence, flip the angle, diagnose-then-promise) — or does it repeat the subject / give the game away / waste the slot?
7. **Hold something back.** Does the email give so much away there's no reason to click, or does it leave the reader "slightly hungry"? (Click-driver test.)
8. **Customer as hero.** Is the reader/their business the hero, or is Day.News/the product the hero? Is it "taker" copy (only asks) vs "give-to-get" (gives value first)?
9. **Voice.** Human and direct, or corporate ("We are delighted to…", hedgy, generic)?
10. **Objections (for offer/conversion emails).** Does it address time/money/fit/trust where relevant? Any real proof/specifics, or vague claims?

## THIN flag (critical — prevents fabrication later)
Mark **THIN** if the email has **no real raw material** to work with — no genuine story, customer result, specific number, or concrete hook to shape. THIN emails can only get structural fixes (subject/preview/CTA/opening tightening); they must NOT have stories or specifics invented in a later rewrite. If it's THIN, say so and say what real material it would need.

## Output per email — write `email-pipeline/<CID>/<key>.diagnosis.md`:
```
# <CID> / <key> — Diagnosis
SCORE: N/5
THIN: yes/no
Ask (single? what is it): ...
Lesson (present? state it): ...
Story/angle: A-to-B | A-to-Z | none ...
Opening: concrete | throat-clearing — quote line 1
Subject verdict: <chars> chars; loop|describe; spam flags; human|generic
Preview verdict: second-job | repeats | gives-away | wasted
CTA count: N (flag if >1)
Hold-back / click-driver: ok | gives-too-much
Hero: reader | product
Voice: human | corporate
Top 3 problems to fix (specific, actionable): 1) ... 2) ... 3) ...
One-line overall:
```

## Scoring guide (0–5)
- **5** — nails it: curiosity subject+preview as a unit, concrete opening, one ask, clear two-level lesson, reader is hero, human voice, leaves them hungry.
- **4** — strong, minor fixes.
- **3** — functional but generic; describes rather than hooks; fixable.
- **2** — multiple core problems (weak subject + flat opening + product-hero + gives too much away).
- **1** — broken on most axes; faceless-brand blast.
- **0** — no ask/no point, or pure spam-shaped.
Be a tough, specific critic. The point is an honest worst-first triage, not encouragement.
