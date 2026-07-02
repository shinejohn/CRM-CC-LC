# Manifest Destiny Email — Content Plan (audience-anchored)

Built from the Pass-1 diagnosis + the audience re-anchor of all 89 emails against `AUDIENCE.md`.
Governing reader: a busy, **non-technical** main-street owner/leader (restaurant, bar, bowling lanes, attorney,
accountant, plumber, landscaper, salon, shop) who cares about a **fuller house, the phone ringing, time back,
pride, and a community worth living in** — not systems, features, or dashboards.

## The headline finding

| | |
|---|---|
| Audience-anchored average | **2.61 / 5** (was 2.84 on structure alone) |
| **Talks to an IT buyer who doesn't exist** | **29 emails (33%)** |
| Mixed (good instinct, slips into feature-speak) | 40 (45%) |
| Actually speaks to the reader | **20 (22%)** |
| Strikes the community chord | present **15**, possible 36, **absent 38** |

**The core problem is not weak subject lines. It's that ~78% of the campaign is written to the wrong person** —
it sells the machine (CRM, dashboard, automation, "the network," "positions/slots," price-per-month) to people who
just want a busy Tuesday. The fix for most of it is **translation, not invention**: every feature line already has
a real owner-outcome hiding inside it.

## The four buckets (this is the plan)

### A — Keep / light polish (6) — *the voice benchmark*
Already speak to the reader; use these as the tone north-star for everything else.
`EDU-004/email_1` (neighbor recommendation > ads), `EDU-014/email_1` (every unanswered message = a job walking
next door), `HOOK-011/email_hook` (be the name your town calls first), `HOWTO-002` (your shop's story in the town
paper), `HOWTO-003` (empty room vs full house on event night), `HOWTO-006` (you have news worth telling the town).
→ **Action:** lock these as `VOICE_BENCHMARK`. Polish subjects/previews only.

### B — On-target, needs structural polish (15)
Right reader, right outcome — but loose structure (describe-subject, preview repeats, gives too much away, 2 CTAs).
→ **Action:** standard Pass-2 rewrite. No reframing needed; fix structure, keep the angle.

### C — Mis-aimed but has real material → TRANSLATE (35)
The biggest group and the highest ROI. These have a genuine hook buried under system/feature framing. The reframe
is already written per-email in the `.rescore.md` files (REFRAME line).
→ **Action:** Pass-2 rewrite driven by the per-email REFRAME + the AUDIENCE Translation Rule. "Connect your CRM" →
"never lose a customer who reaches out"; "analytics dashboard" → "see at a glance it's working"; "positions/slots"
→ "the local customers a competitor will get instead." Strike the community chord where it's `possible`.

### D — Mis-aimed AND thin → RE-CONCEIVE + needs real material (33)
Talks to an IT buyer **and** has no genuine story/number/customer result to shape. We can re-aim the framing
(that's translation, allowed) but they will stay generic until fed **real raw material** — and the framework's
hard rule is **do not fabricate**.
→ **Action:** translate the framing now, but flag each as **needs-human-material**. The single highest-value
project input: **3–6 real local customer stories with specifics** (a named bar that filled a slow Tuesday, a
plumber whose phone rang, real numbers). One good story can seed a dozen of these.

## Two campaign-level gaps (bigger than any single email)

1. **The CONV (conversion) emails are the weakest set and the most mis-aimed** (avg ~1.75; all talk inventory and
   pricing, none put a skeptical owner in a win-scene or handle the money/trust objection with proof of *customers*).
   These are where the money is closed — they need the most work and the real proof.
2. **The community chord is the single most underused asset** — absent in 38 emails, *possible* in 36. Day.News
   literally **is** the town's newspaper; "your business in the community's own news, helping the town thrive" is
   the strongest, most honest, most on-brand angle, and most emails never strike it.

## Recommended build sequence

1. **Lock the voice benchmark** (bucket A) — the tone everything else matches.
2. **Translate bucket C (35)** — highest ROI, no new material needed; per-email REFRAMEs already exist.
3. **Polish bucket B (15)** — quick structural wins.
4. **Re-conceive bucket D (33)** — framing now; hold for real customer stories before they can be great.
5. **Rebuild CONV (4)** with real proof + a concrete win-scene + honest community-slot urgency.
6. Run each through Pass-3 verify (must pass the audience-fit test to "win") → write back to `content/*.json` →
   later, generate the live templates from the approved JSON (replaces the seeder).

**The one thing to gather in parallel:** real local customer stories with specifics. That's the bottleneck on
bucket D and the CONV rebuild — everything else is translation we can do now.
