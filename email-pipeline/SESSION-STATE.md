# SESSION STATE — Manifest Destiny Email Overhaul (handoff for reboot)

**Purpose:** everything a fresh session needs to continue the campaign-email rewrite without re-deriving it.
**Date of this snapshot:** 2026-06/07. **Repo:** `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/`.

---

## 1. What we're doing (the mission)
Rewriting the **entire Manifest Destiny email campaign** from feature/IT-buyer copy into **trust-first, audience-anchored** copy that builds a real relationship with local business owners — then shipping it so it reaches the ~385K enrolled customers (who today still receive the OLD, weaker copy).

## 2. The decisions already made (do not relitigate)
- **JSON is canonical.** `content/campaign_*_complete.json` (the `emails.*` objects) is the source of truth. The hardcoded `backend/database/seeders/ManifestDestinyEmailTemplateSeeder.php` (`email_templates` table) is what currently SENDS but is older/weaker/97% divergent — it will be REPLACED by a generator built from the JSON.
- **Audience** = busy, NON-technical main-street owners (restaurants, bars, bowling lanes, attorneys, accountants, plumbers, landscapers, salons, shops). No systems/IT/jargon. They care about a fuller house, the phone ringing, full lanes, a booked season, time back, pride, and a community worth living in. See `AUDIENCE.md`.
- **Vision / voice** = "the neighbor who started the town paper because they love the place." Give-to-get: give value for ~3 weeks before any paid ask. Mission line: *a community that gets its fun, its suppliers, its wisdom, its help from the people next door.* See `VISION.md`.
- **Money rule (corrected twice):** NEVER "all free forever." Some things genuinely free & stay free (listing, being in the paper, posting events, a story). Paid = **one simple, fair, bundled monthly subscription**, affordable **because we run it for thousands of communities at once (shared cost)** — lead with value/fairness/community, price in the P.S. Model = opening **Email 8**.
- **Exclusivity is the strongest honest scarcity** (real finite inventory): the **columns** (Expert+column = local doctor/attorney authors the health/law column), the **sections** (Sponsor+section = funeral home owns the obituary section), **category-search** top spots (limited), ~37 marquee slots/community. See `EXCLUSIVITY.md` + `exclusive-offers.md`. Counts must come from LIVE inventory via a `[X spots left in [Community Name]]` token — NEVER invented.
- **No fabrication.** THIN emails (no real story/number) get framing translation only + a `[NEEDS REAL MATERIAL: ...]` flag. Do not invent stories/stats/testimonials.

## 3. Artifacts in `email-pipeline/` (all written this session)
- `AUDIENCE.md` — who we write to (governing).
- `VISION.md` — why + trust-first thesis.
- `EXCLUSIVITY.md` — the honest-scarcity lever + product mapping.
- `RUBRIC.md` — 0–5 scoring + audience-fit test + THIN flag.
- `REWRITE-BRIEF.md` — the Pass-2 rewrite instructions (used by all rewrite agents).
- `CONTENT_PLAN.md` — the 4 buckets (A keep / B polish / C translate / D re-conceive) + campaign-level gaps.
- `EMAIL_INVENTORY.md` (89 emails) · `EMAIL_REWRITE_AUDIT.md` (audience-anchored worst-first).
- `opening-sequence.md` — **THE VOICE BENCHMARK**: the new 8-email trust-first opening (Days 1–21), avg 4.25/5. Emails 1–8, fully drafted & approved (Email 8 = "Priced for Main Street", value/fairness/scale).
- `exclusive-offers.md` — 3 category exemplars (the column / the obituary section / category search).
- `<CID>/<key>.email.md` — original extracted emails (89).
- `<CID>/<key>.diagnosis.md` — Pass-1 structural diagnosis (89).
- `<CID>/<key>.rescore.md` — audience re-anchored diagnosis w/ per-email REFRAME (89).
- `<CID>/<key>.rewrite.md` — **the trust-first rewrites (82)** — HOOK-004..015, all EDU (30), all HOWTO (30), all CONV (4). Paid HOOK + all CONV also have the exclusivity angle woven in.
- `_new_opening/NEW-0X.email.md` — the 8 opening emails as standalone files (for scoring).

## 4. Scoring journey (independently scored by Opus, same rubric throughout)
- Original campaign, audience-anchored: **2.61/5 avg** (33% "talks to an IT buyer who doesn't exist").
- New opening (8): **4.25/5**. Hardest-case rewrite sample: **4.0/5**. Whole campaign now ≈ **4.0**.
- The ~25 `[NEEDS REAL MATERIAL]` emails are the ceiling on going higher (need real local stories).

## 5. THE PLAN — real remaining work (in priority order)
1. **Ship the new copy (highest value):** write approved rewrites into `content/campaign_*_complete.json` (`emails.*`), then build a **generator** that produces the live `email_templates` from the JSON (translating `[Bracket]`→`{{brace}}` tokens; mapping the 60 campaign_id↔slug pairs — the map is derivable from `ManifestDestinyTimelineSeeder.php`), replacing the hardcoded seeder. Until this, customers still get the old copy.
2. **Resolve the two-email-systems split** — JSON canonical + generator (unlocks #1). Note token-syntax difference: JSON uses `[First Name]`/`[CLAIM →]`; live templates use `{{customer_name}}`.
3. **Gather ~25 real customer stories/numbers** — see all `[NEEDS REAL MATERIAL]` flags (grep them). All 4 CONV closes need one. One good story seeds many.
4. **Wire exclusivity inventory** — expose live per-category slot counts as a merge token (`[X spots left ...]`); the ~37-slot model exists in the product but confirm it's queryable for merge.
5. **Two honesty confirmations** — HOOK-015 "someone nominated you" (real mechanism or soften); HOWTO-010 "post once, everywhere" (confirm capability).
6. Optional: verify/score all 90 rewrites (not just sample); fix any below 4.

## 6. Repo / deploy state
- The Phase 1–4 build roadmap (subscriptions, dunning, CRM UI, coupons, onboarding, invoice PDF, A/B, auth, etc.) is **fully built, tested, and pushed** — the recurring "assessment" claiming these are missing is STALE. Evidence: 15 feat commits `db38e21e..4d6bdffa`, 14 feature test files, `origin/main`.
- `origin/main` = `55cfc605`. 1 unpushed local commit (`27775863`, the Bible + CLAUDE.md pointer — docs only).
- The email-pipeline work (this session) is committed as of this snapshot (see the commit that adds SESSION-STATE.md).
- NOT deployed: none of the email COPY changes ship until Plan #1 is done (rewrites are in `email-pipeline/`, not yet in `content/*.json` or the seeder).

## 7. How to resume (first moves for the rebooted session)
1. Read this file, then `AUDIENCE.md`, `VISION.md`, `EXCLUSIVITY.md`, `opening-sequence.md` (voice benchmark).
2. Decide with the user: start Plan #1 (write-back + generator) OR gather customer stories (Plan #3) first.
3. Reminder: this repo has `docs/Fibonacco-Command-Center-Bible.md` (source of truth) and `CLAUDE.md` (rules). Read LIVE files, never `/mnt/project/`.
