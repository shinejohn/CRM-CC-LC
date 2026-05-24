# REPORTER RESEARCH ORCHESTRATOR (RRO) — Master Spec
## Fibonacco Multisite — Day.News
### Autonomous AI Journalism System

**Monorepo root:** `/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite`

**Companion to:** `CIVIC_SOURCE_MASTER_SPEC.md` (source discovery)
**This spec:** What happens after sources are discovered — researching, verifying, contacting, and assembling stories autonomously.

---

## BUILD SEQUENCE

This is the order things get built. Each package is a standalone Cursor/Antigravity task. Do not skip ahead.

```
PACKAGE 1: Civic Source Discovery     ← CIVIC_SOURCE_MASTER_SPEC.md
           Test: Dunedin, Clearwater
           Result: Sources registered, content flowing into raw_content

PACKAGE 2: Editorial Gate + Orchestrator Core ← This spec, Part 1-3
           The editorial scoring matrix + research planning + tool dispatch
           Test: Score 100 raw_content leads from Dunedin. Verify 70%+ score 0-15.
                 Verify only 5-10% trigger research plans.

PACKAGE 3: Automated Research Tools   ← This spec, Part 4
           Document fetcher, corroboration searcher, archive searcher
           Test: Research plans produce enriched fact packages

PACKAGE 4: Contact Database           ← This spec, Part 5
           civic_contacts table, contact scraping during source discovery
           Test: Dunedin city staff directory scraped, contacts stored

PACKAGE 5: Confidence Scoring         ← This spec, Part 6
           Per-fact confidence rating, source attribution chain
           Test: Research packages have scored facts

PACKAGE 6: Research-to-Article Bridge ← This spec, Part 7
           Connect RRO output to ArticleGenerationService
           Test: Articles generated from research packages (not raw RSS alone)

PACKAGE 7: Email Reporter (Gen 2)     ← This spec, Part 8
           Outbound press inquiries, inbound response parsing
           Test: Send inquiry to Dunedin PIO, track response

PACKAGE 8: SMS Reporter (Gen 3)       ← This spec, Part 9
           Twilio text message follow-up
           Test: Text follow-up on unanswered email

PACKAGE 9: Voicemail Drop (Gen 4)     ← This spec, Part 10
           Twilio voice + AMD, TTS voicemail
           Test: Leave voicemail at Dunedin city hall

PACKAGE 10: Live AI Calls (Gen 5)     ← This spec, Part 11
            Vapi/Retell integration, conversational AI reporter
            Test: Call Dunedin PIO, ask one question, get transcript
```

**Packages 1-6 are the minimum viable autonomous journalist.**
Packages 7-10 add human outreach capabilities progressively.
Each package works without the ones after it.

---

## PART 1 — THE ORCHESTRATOR

### 1.1 What the Orchestrator Does

The RRO is an agent. It receives a lead, scores it for editorial significance, and decides how much effort to invest. Most content scores low and publishes immediately with zero research cost. The 5-10% that scores high gets the full treatment — research, corroboration, outreach, the works.

The first gate is the most important decision in the system. It is NOT a pipeline where everything gets researched. It is a triage:

```
LEAD IN
  → EDITORIAL GATE: Score the lead (0-100)
     → Score 0-15:  PUBLISH AS-IS. No research. Format and send to article generation.
     → Score 16-30: LIGHT TOUCH. Archive search for context. Publish.
     → Score 31-50: STANDARD. Corroborate + document fetch + context. Publish.
     → Score 51-70: DIG DEEPER. Full automated research plan. Publish when complete.
     → Score 71-85: GET A QUOTE. Full research + email outreach. Wait for response or deadline.
     → Score 86-100: FULL REPORTER. All tools. Escalate email → SMS → phone. Poll community.
  
  For scores 31+, the research loop activates:
  → Build research plan (scoped to the tier)
  → Execute research tools (parallel where possible)
  → Evaluate: do I have enough?
     → YES: Assemble research package → Article generation
     → NO:  What's missing?
            → Can I get it with automated tools? → Loop back to execute
            → Do I need human comment? → Outreach engine → Wait → Loop
            → Deadline hit? → Assemble what I have → Article generation
```

**This gate is what makes the system economically viable.** Without it, researching 2,000 leads/day costs $100-160. With it, researching only what matters costs ~$14/day. The gate is not optional — it IS the editor.

### 1.2 Story Types and Research Depth

Not every lead needs the same research. A library event listing needs zero research — just format and publish. A city council vote on a controversial rezoning needs extensive research. The orchestrator must know the difference.

| Story Type | Research Depth | Deadline | Outreach? | Example |
|---|---|---|---|---|
| `event_listing` | None — format and publish | Immediate | No | Library storytime, park concert |
| `calendar_item` | Minimal — verify date/location | Immediate | No | Council meeting date, school closure |
| `press_release` | Light — corroborate, add context | 2 hours | No | City announces new park |
| `arrest_report` | Light — verify charges, check records | 1 hour | No | DUI arrest from blotter |
| `meeting_coverage` | Medium — read agenda, summarize decisions | 4 hours | Maybe | Council votes on budget |
| `crime_story` | Medium — police report + victim info + context | 2 hours | Yes (PD PIO) | Armed robbery |
| `government_action` | Heavy — documents, impact analysis, quotes | 8 hours | Yes | Water rate increase |
| `development_story` | Heavy — plans, renderings, neighbor reaction | 24 hours | Yes | New apartment complex approved |
| `investigation` | Deep — multiple sources, documents, FOIA | 48 hours | Yes (multiple) | Pattern of code violations |
| `breaking_news` | Rapid — confirm, basic context, publish fast | 30 min | Try (phone) | Active shooter, major fire |
| `community_feature` | Medium — interview subject, photos, background | 24 hours | Yes (subject) | Local hero, business milestone |
| `data_story` | Medium — compile data, build narrative | 8 hours | Maybe | Crime stats trend, property values |

### 1.3 The Editorial Gate — Scoring Matrix

This is the editor's brain. Every lead gets scored before any research spend occurs. The score determines resource allocation. The scoring runs on the lead content itself — title, source type, keywords, entities detected — using a combination of rule-based signals and a single lightweight AI classification call.

#### Signal Detection (Rule-Based, Free)

| Signal | How Detected | Points |
|---|---|---|
| **Involves public money** | Keywords in title/content: "budget," "rate increase," "rate hike," "million," "tax," "bond," "contract awarded," "appropriation," "levy," "millage," "assessment," "fee increase" | +30 |
| **Involves public safety** | Source type = `law_enforcement` or `fire`; keywords: "arrest," "shooting," "crash," "fatal," "homicide," "robbery," "assault," "evacuation," "missing," "amber alert," "active shooter" | +25 |
| **Controversy / conflict** | Keywords: "opposed," "denied," "split vote," "3-2," "4-3," "residents objected," "protest," "lawsuit," "sued," "recall," "fired," "terminated," "resigned," "investigation," "audit," "violation" | +25 |
| **Named public official** | Entity extraction finds person + title pattern: "Mayor [Name]," "Chief [Name]," "Commissioner [Name]," "Superintendent [Name]," "Council member [Name]" | +20 |
| **Affects many people** | Keywords: "all residents," "district-wide," "countywide," "citywide," "closure," "mandatory," "evacuation zone," "boil water," "school closing," "road closed" | +15 |
| **High-authority source** | Source type = `government` AND content came from press release or official news section (not calendar/event) | +10 |
| **Source urgency signals** | Content has alert/emergency markers: Nixle alert, emergency broadcast, CRITICAL/URGENT in subject, all-caps title | +20 |
| **Election-related** | Keywords: "election," "ballot," "candidate," "runoff," "recount," "filing," "qualification," "referendum," "charter amendment" | +15 |
| **Development / land use** | Keywords: "rezoning," "variance," "site plan," "development," "demolition," "annexation," "comprehensive plan," "land use change" | +15 |
| **Death or injury** | Keywords: "killed," "died," "fatal," "hospitalized," "injured," "victim" | +20 |

Maximum raw score from signals alone: theoretically 200+, but typical leads hit 2-3 signals. Score is capped at 100.

#### Pattern Detection (Database Query, Free)

| Signal | How Detected | Points |
|---|---|---|
| **Same topic trending across communities** | Query `raw_content` for similar titles/topics from other communities in last 30 days; 3+ matches = trend | +20 |
| **Competing media already covered it** | Quick SERP check: `"{topic}" "{community}" site:tampabay.com OR site:fox13news.com` (local outlets only, 1 query) | +15 |
| **We covered this topic before** | Query `day_news_posts` for same topic in same community in last 365 days | +10 (context exists, worth referencing) |
| **Source has been unreliable** | `NewsSource.health_score < 50` | -10 (discount unreliable sources) |
| **Duplicate / already researched** | Another `research_plan` exists for the same topic in the same community in the last 48 hours | -100 (kill it, don't double-research) |

#### AI Classification (One PrismAI Call, ~$0.005, Only When Score 20-40)

For leads in the ambiguous zone (score 20-40 after rule-based signals), one AI call resolves whether to research or publish as-is:

```
You are a local news editor deciding whether this story needs deeper research 
or can publish as-is.

Lead: {title}
Source: {source_name} ({source_type})
Content: {first_500_chars}
Community: {community_name}, {state}

Current signals detected: {signals_list}
Current score: {score}

Answer these questions:
1. Is this routine/procedural or genuinely newsworthy? (routine | newsworthy | potentially_significant)
2. Would a reader want to know more than what's in this lead? (yes | no)
3. Does this need an official comment to be credible? (yes | no | optional)
4. Score adjustment: -20 to +30

Respond in JSON: {"assessment": "...", "reader_interest": "...", "needs_comment": "...", "score_adjustment": N, "reasoning": "one sentence"}
```

#### Score-to-Action Mapping

| Score | Editorial Decision | Research Tier | Tools Used | Cost |
|---|---|---|---|---|
| **0-15** | **PUBLISH AS-IS.** Event listing, meeting date, routine announcement. Format and publish. Zero research. | `none` | None | $0.00 |
| **16-30** | **LIGHT TOUCH.** Worth a sentence of context. Check our archives for prior coverage, add one line of background. | `light` | Archive search only | $0.00 |
| **31-50** | **STANDARD RESEARCH.** Confirm key facts. One SERP search, fetch the source document if one is linked, add historical context. | `standard` | Archive + SERP + document fetch | ~$0.02 |
| **51-70** | **DIG DEEPER.** Full research plan. Fetch all documents, compare to other cities/communities, check competing coverage, pull enrichment data. | `deep` | Full automated research | ~$0.05-0.10 |
| **71-85** | **GET A QUOTE.** Everything above PLUS contact relevant official for comment via email. Story is important enough that "declined to comment" is itself newsworthy. | `outreach` | Full research + email outreach | ~$0.10-0.15 |
| **86-100** | **FULL REPORTER.** Breaking or high-impact. All available tools. Escalate through email → SMS → phone. Generate community poll. This is the lead story. | `full` | Everything including voice | ~$0.20-0.50 |

#### Expected Distribution at Scale

At ~2,000 content items per day across 10,500 communities:

| Tier | % of Leads | Count/Day | Cost/Item | Daily Cost |
|---|---|---|---|---|
| Publish as-is (0-15) | 70% | ~1,400 | $0.00 | $0.00 |
| Light touch (16-30) | 15% | ~300 | $0.00 | $0.00 |
| Standard (31-50) | 10% | ~200 | $0.02 | $4.00 |
| Dig deeper (51-70) | 3.5% | ~70 | $0.075 | $5.25 |
| Get a quote (71-85) | 1.2% | ~25 | $0.125 | $3.13 |
| Full reporter (86-100) | 0.3% | ~5 | $0.35 | $1.75 |
| **TOTAL** | | **~2,000** | | **~$14.13/day** |

**~$425/month for autonomous research across all 10,500 communities.** That's the budget for an AI newsroom that would require thousands of human reporters to replicate.

#### Implementation: The EditorialGate Service

```
app/Services/Research/EditorialGate.php

Methods:
  scoreLead(RawContent $lead): EditorialScore
  applySignalRules(RawContent $lead): array    // Returns detected signals + points
  applyPatternRules(RawContent $lead): array   // Returns pattern signals + points
  requestAiClassification(RawContent $lead, int $currentScore): int  // Score adjustment
  determineResearchTier(int $score): string     // none | light | standard | deep | outreach | full
  shouldResearch(RawContent $lead): bool        // Quick check: score > 15?
  
class EditorialScore {
    public int $score;
    public string $tier;           // none, light, standard, deep, outreach, full
    public array $signals;         // Which signals fired and their points
    public ?string $aiAssessment;  // AI classification if triggered
    public bool $requiresResearch; // score > 15
    public bool $requiresOutreach; // score > 70
}
```

The orchestrator calls `EditorialGate::scoreLead()` FIRST. If the result is `tier = 'none'`, the lead bypasses the RRO entirely and goes straight to `ArticleGenerationService` as it does today. Only leads scoring 16+ enter the research pipeline, and their research plan is scoped to their tier — a `standard` tier lead never triggers outreach tools, a `light` tier lead never triggers SERP.

### 1.4 Research Plan Structure

A research plan is a JSON document that the orchestrator builds per-lead:

```json
{
    "lead_id": "raw_content_uuid",
    "story_type": "government_action",
    "headline_hypothesis": "Clearwater City Council Approves 15% Water Rate Increase",
    "deadline": "2026-05-24T02:00:00Z",
    "priority": "high",
    "research_tasks": [
        {
            "task_id": "rt_001",
            "tool": "document_fetcher",
            "action": "fetch_agenda_packet",
            "target": "https://myclearwater.com/AgendaCenter/ViewFile/Agenda/12345",
            "purpose": "Get the actual rate numbers and effective date",
            "status": "pending",
            "required": true
        },
        {
            "task_id": "rt_002",
            "tool": "archive_searcher",
            "action": "search_own_coverage",
            "query": "Clearwater water rate",
            "purpose": "Find our previous coverage of water rates for context",
            "status": "pending",
            "required": false
        },
        {
            "task_id": "rt_003",
            "tool": "corroboration_searcher",
            "action": "serp_search",
            "query": "Clearwater water rate increase 2026",
            "purpose": "Check if other media covered this",
            "status": "pending",
            "required": false
        },
        {
            "task_id": "rt_004",
            "tool": "data_enricher",
            "action": "compare_regional_rates",
            "query": "water utility rates Pinellas County cities",
            "purpose": "How does this compare to neighboring cities",
            "status": "pending",
            "required": false
        },
        {
            "task_id": "rt_005",
            "tool": "outreach_engine",
            "action": "request_comment",
            "contact_role": "public_works_director",
            "question": "What drove the rate increase and when does it take effect?",
            "purpose": "Official comment for the article",
            "status": "pending",
            "required": false,
            "escalation": ["email", "sms", "voicemail", "call"]
        }
    ],
    "minimum_facts_required": [
        "new_rate_amount",
        "old_rate_amount",
        "effective_date",
        "vote_count"
    ],
    "nice_to_have_facts": [
        "reason_for_increase",
        "comparison_to_other_cities",
        "public_comment_summary",
        "official_quote"
    ]
}
```

### 1.5 The Orchestrator as a Service

```
app/Services/Research/ReporterResearchOrchestrator.php

Methods:
  // THE GATE — first call on every lead
  triageLead(RawContent $lead): EditorialScore
  
  // Only called if EditorialScore.requiresResearch == true
  assessLead(RawContent $lead, EditorialScore $score): ResearchPlan
  executeResearchPlan(ResearchPlan $plan): ResearchPackage
  evaluateCompleteness(ResearchPackage $package): GapAnalysis
  assembleForPublication(ResearchPackage $package): ArticleResearchBundle
  
  // Tool dispatch — only dispatches tools allowed by the tier
  dispatchTask(ResearchTask $task): TaskResult
  dispatchParallelTasks(array $tasks): array
  
  // Deadline management
  checkDeadline(ResearchPlan $plan): bool
  extendDeadline(ResearchPlan $plan, string $reason): void
  forceAssembly(ResearchPlan $plan): ArticleResearchBundle
```

### 1.6 The Research Plan Builder

This is where AI does the thinking. PrismAiService receives the lead content and the story type taxonomy, and generates the research plan.

```
You are a news editor assigning research tasks to an AI reporter.

Given this lead:
- Source: {source_name} ({source_type})
- Title: {title}
- Content: {content}
- Community: {community_name}, {state}
- Category: {category}

Determine:
1. Story type (from the taxonomy: event_listing, press_release, government_action, etc.)
2. Research tasks needed (from available tools: document_fetcher, corroboration_searcher, archive_searcher, data_enricher, outreach_engine)
3. Minimum facts required to publish
4. Deadline based on story type and urgency
5. Whether human outreach is needed and to whom

Available contacts for this community:
{contacts_json}

Respond in the ResearchPlan JSON schema.
```

---

## PART 2 — THE RESEARCH PACKAGE

### 2.1 What a Research Package Contains

The research package is the output of the orchestrator — everything article generation needs.

```json
{
    "lead_id": "raw_content_uuid",
    "story_type": "government_action",
    "research_completed_at": "2026-05-23T22:45:00Z",
    "deadline_met": true,
    
    "facts": [
        {
            "fact_id": "f_001",
            "statement": "Clearwater City Council voted 4-1 to approve a 15% water rate increase",
            "confidence": "confirmed",
            "sources": [
                {"type": "document", "name": "Council Meeting Minutes 5/23/2026", "url": "..."},
                {"type": "media", "name": "Tampa Bay Times", "url": "..."}
            ],
            "category": "primary_event"
        },
        {
            "fact_id": "f_002",
            "statement": "The new rate takes effect August 1, 2026",
            "confidence": "confirmed",
            "sources": [
                {"type": "document", "name": "Resolution 2026-42", "url": "..."}
            ],
            "category": "detail"
        },
        {
            "fact_id": "f_003",
            "statement": "Council member Rodriguez cast the sole dissenting vote",
            "confidence": "confirmed",
            "sources": [
                {"type": "document", "name": "Council Meeting Minutes", "url": "..."}
            ],
            "category": "detail"
        },
        {
            "fact_id": "f_004",
            "statement": "The average residential water bill will increase from $45 to $52 per month",
            "confidence": "likely",
            "sources": [
                {"type": "document", "name": "Rate Study Presentation", "url": "..."}
            ],
            "category": "impact"
        },
        {
            "fact_id": "f_005",
            "statement": "Clearwater's new rate is still below the Pinellas County average of $58/month",
            "confidence": "likely",
            "sources": [
                {"type": "data", "name": "Regional utility rate comparison", "url": "..."}
            ],
            "category": "context"
        }
    ],
    
    "quotes": [
        {
            "quote_id": "q_001",
            "speaker": "Public Works Director James Chen",
            "text": "The rate adjustment reflects increased costs for water treatment chemicals and infrastructure maintenance that we can no longer absorb.",
            "obtained_via": "email_response",
            "timestamp": "2026-05-23T20:15:00Z",
            "verified": true
        }
    ],
    
    "outreach_log": [
        {
            "contact": "James Chen, Public Works Director",
            "method": "email",
            "sent_at": "2026-05-23T18:30:00Z",
            "responded_at": "2026-05-23T20:15:00Z",
            "response_type": "quote_provided"
        },
        {
            "contact": "Mayor's Office",
            "method": "email",
            "sent_at": "2026-05-23T18:30:00Z",
            "responded_at": null,
            "response_type": "no_response",
            "publish_as": "The Mayor's office did not respond to a request for comment."
        }
    ],
    
    "historical_context": [
        {
            "reference": "Day.News article from March 2023",
            "summary": "Council previously raised water rates by 12% in March 2023, citing aging infrastructure",
            "article_id": "day_news_post_uuid"
        }
    ],
    
    "competing_coverage": [
        {
            "outlet": "Tampa Bay Times",
            "headline": "Clearwater approves water rate hike despite resident pushback",
            "url": "https://...",
            "published_at": "2026-05-23T21:00:00Z"
        }
    ],
    
    "community_data": {
        "poll_available": true,
        "suggested_poll_question": "Do you support the 15% water rate increase approved by Clearwater City Council?",
        "suggested_poll_options": ["Yes, infrastructure needs investment", "No, rates are already too high", "Need more information"]
    },
    
    "confidence_summary": {
        "confirmed_facts": 3,
        "likely_facts": 2,
        "unverified_facts": 0,
        "denied_facts": 0,
        "overall_confidence": "high",
        "publishable": true
    },
    
    "editorial_notes": [
        "Strong story — confirmed vote, confirmed rate numbers, official quote obtained",
        "Mayor's office non-response noted for transparency",
        "Consider follow-up story on infrastructure project specifics",
        "Poll recommended to gauge community reaction"
    ]
}
```

### 2.2 Confidence Levels

Every fact in the research package gets a confidence rating:

| Level | Meaning | Requires | Use in Article |
|---|---|---|---|
| `confirmed` | Verified by 2+ independent sources | Two sources agree | State as fact |
| `likely` | Single authoritative source | Official document, named official | State as fact, cite source |
| `unverified` | Single non-authoritative source | Social media, anonymous tip, single media report | "According to..." or "Reports indicate..." |
| `disputed` | Sources disagree | Conflicting information | Present both sides |
| `denied` | Official denial received | Named official denies | "X denied reports that..." |
| `unable_to_verify` | Couldn't confirm or deny | Research attempted, inconclusive | Omit or flag as unconfirmed |

Article generation MUST use these levels to determine language. A `confirmed` fact is "The council voted 4-1." An `unverified` fact is "According to social media posts, residents expressed frustration." This is not optional — it's editorial integrity.

---

## PART 3 — RESEARCH JOBS AND QUEUING

### 3.1 Job Structure

```
app/Jobs/Research/ExecuteResearchPlanJob.php
  — Receives a ResearchPlan, dispatches individual tasks
  — Runs on queue: 'research' (new Horizon queue)
  — Timeout: varies by story type (30 min for breaking, 8 hours for investigation)

app/Jobs/Research/ExecuteResearchTaskJob.php
  — Executes a single research task (one tool call)
  — Runs on queue: 'research-tasks'
  — Timeout: 120 seconds per task (some tools are slow)
  — Retries: 2

app/Jobs/Research/CheckResearchDeadlineJob.php
  — Scheduled check: has the deadline passed?
  — If yes and research still pending, force assembly
  — Runs on queue: 'research'
  — Scheduled: every 5 minutes

app/Jobs/Research/ProcessOutreachResponseJob.php
  — Triggered by inbound email/SMS webhook
  — Matches response to active research plan
  — Updates research package with new quote/info
  — Re-evaluates completeness
  — Runs on queue: 'research'
```

### 3.2 Horizon Queue Config

```php
// Add to config/horizon.php supervisors
'research' => [
    'connection' => 'redis',
    'queue' => ['research', 'research-tasks'],
    'balance' => 'auto',
    'minProcesses' => 1,
    'maxProcesses' => 5,
    'tries' => 3,
    'timeout' => 600,
],
```

### 3.3 Database Tables

#### research_plans

```php
Schema::create('research_plans', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('raw_content_id')->nullable();       // The lead that triggered this
    $table->uuid('community_id');
    $table->uuid('region_id')->nullable();
    
    $table->string('story_type', 50);                  // From taxonomy
    $table->string('headline_hypothesis');              // Working headline
    $table->string('status', 20)->default('planning');  // planning, researching, awaiting_response, assembling, completed, failed
    $table->string('priority', 20)->default('normal');  // breaking, high, normal, low
    
    // Editorial Gate output
    $table->integer('editorial_score')->default(0);     // 0-100 from EditorialGate
    $table->string('research_tier', 20);                // none, light, standard, deep, outreach, full
    $table->json('editorial_signals')->nullable();      // Which signals fired and their points
    
    $table->json('research_tasks');                     // Array of task definitions
    $table->json('minimum_facts_required')->nullable();
    $table->json('nice_to_have_facts')->nullable();
    
    $table->timestamp('deadline_at');
    $table->timestamp('research_started_at')->nullable();
    $table->timestamp('research_completed_at')->nullable();
    $table->boolean('deadline_met')->nullable();
    
    $table->json('research_package')->nullable();       // The complete output (Part 2)
    $table->uuid('article_id')->nullable();             // Generated article, if any
    
    $table->integer('tasks_total')->default(0);
    $table->integer('tasks_completed')->default(0);
    $table->integer('tasks_failed')->default(0);
    
    $table->text('editorial_notes')->nullable();
    $table->string('overall_confidence', 20)->nullable();
    $table->boolean('publishable')->nullable();
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['community_id', 'status']);
    $table->index(['status', 'deadline_at']);
    $table->index('raw_content_id');
});
```

#### research_tasks

```php
Schema::create('research_tasks', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('research_plan_id');
    
    $table->string('tool', 50);            // document_fetcher, corroboration_searcher, etc.
    $table->string('action', 50);          // fetch_agenda_packet, serp_search, etc.
    $table->json('parameters');             // Tool-specific parameters
    $table->string('purpose');              // Why this task exists
    $table->boolean('required')->default(false);
    
    $table->string('status', 20)->default('pending');  // pending, running, completed, failed, skipped
    $table->json('result')->nullable();                // Tool output
    $table->json('extracted_facts')->nullable();       // Facts pulled from result
    $table->text('error')->nullable();
    
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->integer('duration_ms')->nullable();
    $table->decimal('cost', 8, 4)->default(0);         // API cost tracking
    
    $table->timestamps();
    
    $table->index(['research_plan_id', 'status']);
    $table->foreign('research_plan_id')->references('id')->on('research_plans')->cascadeOnDelete();
});
```

#### civic_contacts

```php
Schema::create('civic_contacts', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('community_id')->nullable();
    $table->uuid('region_id')->nullable();
    $table->uuid('civic_entity_id')->nullable();       // Link to civic_entities if applicable
    $table->uuid('news_source_id')->nullable();         // Link to news_sources if applicable
    
    $table->string('name');
    $table->string('title')->nullable();                // "Public Works Director"
    $table->string('role', 50)->nullable();             // pio, director, chief, mayor, clerk, etc.
    $table->string('department', 50)->nullable();       // police, fire, library, council, etc.
    $table->string('organization')->nullable();         // "City of Clearwater"
    
    $table->string('email')->nullable();
    $table->string('phone')->nullable();                // Office phone
    $table->string('mobile')->nullable();               // If publicly listed
    $table->string('preferred_contact_method', 20)->nullable();  // email, phone, text
    
    // Response tracking
    $table->integer('times_contacted')->default(0);
    $table->integer('times_responded')->default(0);
    $table->integer('response_rate')->default(0);       // Calculated: (responded/contacted) * 100
    $table->integer('avg_response_minutes')->nullable();
    $table->timestamp('last_contacted_at')->nullable();
    $table->timestamp('last_responded_at')->nullable();
    
    // Quality
    $table->boolean('is_verified')->default(false);
    $table->string('source', 50)->nullable();           // website_scrape, email_response, manual, google_places
    $table->timestamp('verified_at')->nullable();
    $table->text('notes')->nullable();                  // "Prefers email", "Never answers phone"
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['community_id', 'department']);
    $table->index(['role']);
    $table->index('civic_entity_id');
    $table->index('news_source_id');
});
```

#### outreach_attempts

```php
Schema::create('outreach_attempts', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('research_plan_id');
    $table->uuid('civic_contact_id');
    $table->uuid('research_task_id')->nullable();
    
    $table->string('method', 20);          // email, sms, voicemail, call
    $table->string('status', 20);          // sent, delivered, opened, responded, no_response, bounced, failed
    
    // Outbound
    $table->text('message_sent')->nullable();            // What we sent/said
    $table->string('question')->nullable();              // The specific question asked
    $table->timestamp('sent_at')->nullable();
    $table->timestamp('delivered_at')->nullable();
    
    // Inbound response
    $table->text('response_text')->nullable();           // What they said back
    $table->string('response_type', 30)->nullable();     // quote_provided, no_comment, referred_elsewhere, declined, not_available
    $table->timestamp('responded_at')->nullable();
    
    // For phone calls
    $table->string('call_sid')->nullable();              // Twilio/Vapi call ID
    $table->integer('call_duration_seconds')->nullable();
    $table->text('call_transcript')->nullable();
    $table->string('call_recording_url')->nullable();
    
    // For email
    $table->string('email_message_id')->nullable();      // SendGrid message ID
    $table->boolean('email_opened')->default(false);
    $table->timestamp('email_opened_at')->nullable();
    
    $table->decimal('cost', 8, 4)->default(0);
    $table->timestamps();
    
    $table->index(['research_plan_id', 'status']);
    $table->index(['civic_contact_id', 'sent_at']);
    $table->foreign('research_plan_id')->references('id')->on('research_plans')->cascadeOnDelete();
    $table->foreign('civic_contact_id')->references('id')->on('civic_contacts');
});
```

---

## PART 4 — AUTOMATED RESEARCH TOOLS (Gen 1)

These are the tools available to the orchestrator from day one. No human outreach, no phone calls — just automated web research.

### 4.1 DocumentFetcher

Fetches and extracts content from linked documents — PDFs, agenda packets, resolutions, reports.

```
app/Services/Research/Tools/DocumentFetcher.php

Methods:
  fetchDocument(string $url): DocumentContent
  fetchPdf(string $url): ExtractedText
  fetchAgendaPacket(string $url, string $platform): AgendaContent
  
Uses:
  - HTTP client for direct downloads
  - ScrapingBee for WAF-protected pages
  - PDF text extraction (pdftotext or similar)
  - PrismAiService for summarizing long documents ("Extract the key decisions from these council minutes")
```

### 4.2 CorroborationSearcher

Searches the public web for the same story from other sources.

```
app/Services/Research/Tools/CorroborationSearcher.php

Methods:
  searchForStory(string $headline, string $community, string $state): array
  searchCompetingCoverage(string $topic, string $location): array
  verifyFact(string $claim, string $context): VerificationResult
  
Uses:
  - SERP API (primary — targeted queries)
  - Google News RSS (free — "site:news.google.com {topic} {location}")
  - ScrapingBee to fetch full article text from found URLs
  - PrismAiService to compare found articles against our facts
```

### 4.3 ArchiveSearcher

Searches our own published articles and raw_content for historical context.

```
app/Services/Research/Tools/ArchiveSearcher.php

Methods:
  searchOwnCoverage(string $topic, int $communityId, int $daysBack = 365): array
  findPriorArticles(string $subject, int $communityId): array
  getHistoricalContext(string $topic, int $communityId): string
  
Uses:
  - Direct DB queries on day_news_posts (full-text search on title, content)
  - Direct DB queries on raw_content (same)
  - PrismAiService to summarize relevant prior coverage into a context paragraph
```

### 4.4 DataEnricher

Pulls structured data from third-party sources to add depth.

```
app/Services/Research/Tools/DataEnricher.php

Methods:
  getPropertyData(string $address, string $county): PropertyInfo
  getBusinessFilings(string $businessName, string $state): FilingInfo
  getWeatherContext(float $lat, float $lng, string $date): WeatherInfo
  getCrimeStats(string $community, string $state, string $period): CrimeStats
  getPopulationData(string $community, string $state): CensusInfo
  compareRegionalData(string $metric, string $community, string $county): ComparisonData
  
Uses:
  - NOAA API (weather — free)
  - Census Bureau API (demographics — free)
  - State business filing APIs (varies by state — FL: sunbiz.org)
  - County property appraiser websites (scraping)
  - FBI UCR / NIBRS (crime stats — free API)
  - BLS (employment data — free API)
```

### 4.5 SocialMonitor

Checks public social media for community reaction and additional leads.

```
app/Services/Research/Tools/SocialMonitor.php

Methods:
  checkPublicFacebookPage(string $pageUrl, string $topic): array
  checkAgencyNextdoor(string $agencyUrl): array
  searchPublicPosts(string $topic, string $location): array
  
Uses:
  - ScrapingBee for public Facebook page posts (no API needed for public pages)
  - Public agency Nextdoor feeds (if accessible)
  - NOTE: This is the weakest tool — social API access is limited
  - Primary value: checking if the city/PD/library posted about the topic on their Facebook
```

### 4.6 PerplexityResearcher

AI-powered web research for synthesis and gap-filling. Last resort, not first.

```
app/Services/Research/Tools/PerplexityResearcher.php

Methods:
  researchTopic(string $question, string $context): ResearchResult
  findExpertContext(string $topic): string
  
Uses:
  - Perplexity Sonar API
  - Gated by SerpGateService — only fires when cheaper tools didn't get enough
  - Best for: "What is the typical water rate increase percentage nationally?" 
    (context that no local source will have)
  - NOT for: finding local facts (SERP + scraping is better for that)
```

### 4.7 Tool Registry

The orchestrator doesn't hardcode tools. It has a registry:

```php
// config/research-tools.php

return [
    'tools' => [
        'document_fetcher' => [
            'class' => \App\Services\Research\Tools\DocumentFetcher::class,
            'enabled' => true,
            'cost_per_use' => 0.005,  // ScrapingBee credit
            'timeout_seconds' => 60,
            'gen' => 1,
        ],
        'corroboration_searcher' => [
            'class' => \App\Services\Research\Tools\CorroborationSearcher::class,
            'enabled' => true,
            'cost_per_use' => 0.01,   // SERP API
            'timeout_seconds' => 30,
            'gen' => 1,
        ],
        'archive_searcher' => [
            'class' => \App\Services\Research\Tools\ArchiveSearcher::class,
            'enabled' => true,
            'cost_per_use' => 0.0,    // Internal DB query
            'timeout_seconds' => 10,
            'gen' => 1,
        ],
        'data_enricher' => [
            'class' => \App\Services\Research\Tools\DataEnricher::class,
            'enabled' => true,
            'cost_per_use' => 0.0,    // Mostly free APIs
            'timeout_seconds' => 30,
            'gen' => 1,
        ],
        'social_monitor' => [
            'class' => \App\Services\Research\Tools\SocialMonitor::class,
            'enabled' => true,
            'cost_per_use' => 0.005,
            'timeout_seconds' => 30,
            'gen' => 1,
        ],
        'perplexity_researcher' => [
            'class' => \App\Services\Research\Tools\PerplexityResearcher::class,
            'enabled' => true,
            'cost_per_use' => 0.02,
            'timeout_seconds' => 45,
            'gen' => 1,
            'gated' => true,          // Requires SerpGateService approval
        ],
        'email_outreach' => [
            'class' => \App\Services\Research\Tools\EmailOutreach::class,
            'enabled' => false,        // Gen 2 — enable when ready
            'cost_per_use' => 0.001,
            'timeout_seconds' => 10,   // Sending is fast; response is async
            'gen' => 2,
        ],
        'sms_outreach' => [
            'class' => \App\Services\Research\Tools\SmsOutreach::class,
            'enabled' => false,        // Gen 3
            'cost_per_use' => 0.01,
            'timeout_seconds' => 10,
            'gen' => 3,
        ],
        'voicemail_drop' => [
            'class' => \App\Services\Research\Tools\VoicemailDrop::class,
            'enabled' => false,        // Gen 4
            'cost_per_use' => 0.03,
            'timeout_seconds' => 30,
            'gen' => 4,
        ],
        'live_call_agent' => [
            'class' => \App\Services\Research\Tools\LiveCallAgent::class,
            'enabled' => false,        // Gen 5
            'cost_per_use' => 0.50,
            'timeout_seconds' => 180,
            'gen' => 5,
        ],
    ],
    
    'budget' => [
        'max_cost_per_story' => 0.50,        // Don't spend more than $0.50 researching one story
        'max_cost_per_community_per_day' => 5.00,
        'max_outreach_attempts_per_contact_per_week' => 3,
    ],
];
```

---

## PART 5 — CONTACT DATABASE

### 5.1 Contact Discovery (runs during civic source discovery)

When the `CivicDiscoveryService` from the Civic Source Master Spec scans a city website, it also scrapes staff directories.

**Common staff directory URL patterns:**
```
{base_url}/staff
{base_url}/staff-directory
{base_url}/directory
{base_url}/contact-us
{base_url}/departments
{base_url}/government/departments
{base_url}/your-government/staff
{dept_url}/staff
{dept_url}/contact
{dept_url}/about
```

**AI extraction prompt for staff pages:**
```
Extract all staff/official contacts from this government webpage.

For each person, extract:
- name (full name)
- title (job title)
- department (which department they work in)
- role (classify as: mayor, council_member, city_manager, director, chief, 
       pio, clerk, assistant, coordinator, officer, other)
- email (if listed)
- phone (if listed)

Respond in JSON array format.

HTML content:
{html_content}
```

### 5.2 Contact Enrichment Over Time

Contacts get richer with every interaction:

- First discovery: name + title + email from website scrape
- First email sent: track delivery status
- First response received: mark as verified, record response time, note communication style
- Subsequent interactions: update response_rate, avg_response_minutes
- Non-response patterns: "This person never responds to email but answers phone" → update preferred_contact_method

### 5.3 Contact Priority for Outreach

When the orchestrator needs a comment, it picks the best contact:

```
Priority order:
1. PIO (Public Information Officer) — this is literally their job
2. Department director/chief — authoritative for their department
3. City Manager — speaks for administration
4. Mayor — highest authority but hardest to reach
5. Individual council members — for political stories
6. Department staff — for specific operational questions
```

---

## PART 6 — CONFIDENCE SCORING

### 6.1 How Facts Get Scored

```
app/Services/Research/ConfidenceScorer.php

Rules:
  - Fact appears in official government document → confirmed
  - Fact stated by named official in response to inquiry → confirmed
  - Fact appears in 2+ independent media reports → confirmed
  - Fact appears in 1 authoritative source (official website, press release) → likely
  - Fact appears in 1 media report only → unverified
  - Fact from social media only → unverified
  - Fact from anonymous tip only → unverified
  - Official denies the fact → denied
  - Conflicting sources → disputed
  - Research attempted but no confirmation found → unable_to_verify
```

### 6.2 Publishability Rules

```
A story is publishable when:
  - All "required" research tasks completed (or timed out)
  - At least 1 fact is "confirmed" or "likely"
  - No "denied" facts are central to the headline
  - Overall confidence >= "likely"
  
A story is NOT publishable when:
  - All facts are "unverified" — needs more research
  - Central claim is "denied" with no counter-evidence
  - Zero sources confirm the lead
  - Research tasks all failed (technical failure, not editorial)
```

---

## PART 7 — RESEARCH-TO-ARTICLE BRIDGE

### 7.1 How Research Packages Feed Article Generation

Currently, `ArticleGenerationService` receives a `RawContent` record and writes from that alone. With the RRO, it receives a full `ArticleResearchBundle`:

```php
class ArticleResearchBundle
{
    public RawContent $lead;              // Original lead
    public ResearchPlan $plan;            // What research was done
    public array $confirmedFacts;         // Facts rated confirmed/likely
    public array $quotes;                 // Obtained quotes with attribution
    public array $outreachLog;            // Who was contacted, who responded
    public array $historicalContext;       // Prior coverage references
    public array $competingCoverage;      // What other outlets said
    public array $dataPoints;             // Enrichment data
    public array $editorialNotes;         // Orchestrator's notes for the writer
    public string $overallConfidence;     // high/medium/low
    public ?array $suggestedPoll;         // Community poll suggestion
}
```

### 7.2 Article Generation Prompt Enhancement

The AI article writer receives the bundle and uses it:

```
You are writing a news article for Day.News, the local news source for {community_name}.

LEAD: {lead_title}
{lead_content}

CONFIRMED FACTS:
{confirmed_facts_formatted}

QUOTES OBTAINED:
{quotes_formatted}

CONTACTS WHO DID NOT RESPOND:
{non_responses_formatted}
(Include "X did not respond to a request for comment" where editorially appropriate)

HISTORICAL CONTEXT:
{context_formatted}

COMPETING COVERAGE:
{competing_formatted}
(Do NOT copy their language. Use for fact verification only.)

DATA POINTS:
{data_formatted}

EDITORIAL NOTES:
{notes_formatted}

CONFIDENCE: {overall_confidence}

Write the article following Day.News editorial standards:
- Lead with the most newsworthy fact
- Attribute every claim to its source
- Use "unverified" language for unverified facts
- Include the non-response disclosure
- Add historical context naturally
- Keep it local — this matters to {community_name} residents
- Include a suggested headline
```

---

## PART 8 — EMAIL REPORTER (Gen 2)

### 8.1 Sending Infrastructure

**Provider:** SendGrid (or Postmark — verify which is in the current stack)

**Sending domain:** `reporter@day.news` (or `press@day.news`)
- Must have SPF, DKIM, DMARC configured
- Must have a real reply-to address
- Must build sender reputation gradually (start with 10-20 emails/day, ramp up)

**Email template:**

```
Subject: Day.News Press Inquiry — {topic_short}

Dear {name},

I'm reaching out on behalf of Day.News regarding {topic_description}.

{specific_question}

We plan to publish our coverage by {deadline_human_readable}. If you 
would like to provide a statement or comment, please reply to this 
email or call/text {reporter_phone_number}.

If we do not hear back, we will note that {organization} was contacted 
but did not respond.

Thank you for your time.

Day.News Reporting
{community_name} Local Coverage
reporter@day.news
{reporter_phone_number}

---
Day.News is an AI-assisted local news service covering {community_name} 
and surrounding communities. Our reporting combines automated source 
monitoring with human editorial oversight. Learn more at day.news.
```

### 8.2 Inbound Response Handling

**SendGrid Inbound Parse** or **Postmark Inbound Webhooks** receive replies.

```
Route: POST /webhooks/inbound-email

Processing:
1. Parse sender email address
2. Match to outreach_attempts record (by email_message_id or sender + subject)
3. Extract response text (strip signatures, quoted text)
4. Update outreach_attempt: status = 'responded', response_text = extracted text
5. Use PrismAiService to classify response:
   - quote_provided: Extract the quotable statement
   - no_comment: Note the explicit no-comment
   - referred_elsewhere: Note the referral, create new outreach task
   - declined: Note the decline
   - not_available: Note unavailability, suggest callback time if mentioned
6. Update research package with new information
7. Re-evaluate completeness — if this was the missing piece, trigger article generation
```

---

## PART 9 — SMS REPORTER (Gen 3)

### 9.1 Twilio Integration

```
Provider: Twilio
Number: Dedicated local number per market (or toll-free)
Cost: ~$0.0079/outbound SMS, ~$0.0079/inbound SMS
```

**SMS template (160 char limit per segment):**
```
Day.News press inquiry: We're covering {topic_short}. 
Can you comment? Reply here or email reporter@day.news. 
Story publishes by {time}. -Day.News {community}
```

**Inbound SMS webhook:** Same processing logic as email, but simpler (no signature stripping needed).

### 9.2 When SMS Fires

SMS is not the first contact method. It fires when:
1. Email was sent 4+ hours ago with no response AND story deadline is within 8 hours
2. OR story is breaking news (deadline < 2 hours) and email likely too slow
3. AND contact has a phone number on file
4. AND we haven't texted this contact in the last 48 hours (anti-harassment)

---

## PART 10 — VOICEMAIL DROP (Gen 4)

### 10.1 Twilio Voice Integration

```php
// Outbound call flow:
// 1. Initiate call to contact's office phone
// 2. AMD (Answering Machine Detection) determines: human or voicemail?
// 3a. If voicemail: Play TTS message, hang up
// 3b. If human: Play TTS message with response option

$call = $twilio->calls->create(
    $contactPhone,                    // To
    $reporterPhone,                   // From (our Twilio number)
    [
        'url' => route('twilio.voice-script', ['attempt_id' => $attempt->id]),
        'machineDetection' => 'DetectMessageEnd',  // Wait for beep
        'asyncAmd' => true,
        'statusCallback' => route('twilio.call-status', ['attempt_id' => $attempt->id]),
    ]
);
```

**TwiML script (voicemail):**
```xml
<Response>
    <Say voice="Polly.Matthew">
        Hello, this is the Day News automated reporting service. 
        We are working on a story about {topic} and would like to 
        include a comment from {organization}. 
        You can respond by calling or texting us back at this number, 
        or by emailing reporter at day dot news. 
        Our story is scheduled to publish by {deadline_time}. 
        Thank you.
    </Say>
</Response>
```

**TwiML script (human answers):**
```xml
<Response>
    <Say voice="Polly.Matthew">
        Hello, this is the Day News automated reporting service calling 
        about a story we are covering. This call may be recorded for 
        publication purposes.
    </Say>
    <Gather input="speech" action="{response_url}" timeout="10" speechTimeout="auto">
        <Say voice="Polly.Matthew">
            We are working on a story about {topic} and would like to ask: 
            {specific_question}
            Please provide your response after the tone, or say 
            no comment if you prefer not to respond.
        </Say>
    </Gather>
    <Say voice="Polly.Matthew">
        We did not receive a response. You can call or text us back at 
        this number. Thank you.
    </Say>
</Response>
```

### 10.2 When Voicemail Fires

1. Email sent 8+ hours ago, no response
2. SMS sent 4+ hours ago, no response (if SMS was sent)
3. Story deadline is within 12 hours
4. Contact has a phone number
5. We haven't called this contact in the last 7 days

---

## PART 11 — LIVE AI CALLS (Gen 5)

### 11.1 Vapi Integration

**Vapi** (vapi.ai) is the recommended provider. It handles:
- Outbound call initiation
- Real-time TTS/STT conversation
- Interruption handling (the human can interrupt the AI mid-sentence)
- Transcript generation
- Recording
- Webhook callbacks

```php
// app/Services/Research/Tools/LiveCallAgent.php

class LiveCallAgent implements ResearchTool
{
    private string $vapiApiKey;
    private string $vapiAssistantId;  // Pre-configured AI assistant
    
    public function execute(ResearchTask $task): TaskResult
    {
        $contact = CivicContact::find($task->parameters['contact_id']);
        
        $call = Http::withToken($this->vapiApiKey)
            ->post('https://api.vapi.ai/call/phone', [
                'assistantId' => $this->vapiAssistantId,
                'phoneNumberId' => config('vapi.phone_number_id'),
                'customer' => [
                    'number' => $contact->phone,
                ],
                'assistantOverrides' => [
                    'firstMessage' => $this->buildOpeningMessage($task, $contact),
                    'model' => [
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $this->buildSystemPrompt($task, $contact),
                            ]
                        ]
                    ]
                ],
                'metadata' => [
                    'research_plan_id' => $task->research_plan_id,
                    'task_id' => $task->id,
                    'contact_id' => $contact->id,
                ],
            ]);
            
        return new TaskResult(
            status: 'initiated',
            data: ['call_id' => $call['id']],
            note: 'Call initiated, transcript will arrive via webhook'
        );
    }
    
    private function buildSystemPrompt(ResearchTask $task, CivicContact $contact): string
    {
        $state = $contact->community->state ?? 'unknown';
        $consentRequired = $this->isTwoPartyConsentState($state);
        
        return <<<PROMPT
        You are an AI reporter for Day.News, a local community news service.
        You are calling {$contact->name}, {$contact->title} at {$contact->organization}.
        
        CRITICAL RULES:
        1. Immediately identify yourself as "the Day News automated reporting service"
        2. State: "This call may be recorded for publication purposes. Is that okay?"
        3. If they say no to recording, say "I understand" and still ask the question 
           but note their response cannot be directly quoted
        4. Ask this specific question: "{$task->parameters['question']}"
        5. Listen to their response. Ask ONE follow-up if their answer is unclear.
        6. Thank them and end the call.
        7. Do NOT engage in extended conversation. You have ONE question.
        8. If they say "no comment" — accept it gracefully and end the call.
        9. If they say "call back later" — ask when and note it.
        10. If they say "talk to someone else" — ask for that person's name and number.
        11. If you reach a receptionist, ask to be connected to {$contact->name} or 
            the {$contact->role} regarding a press inquiry.
        
        CONTEXT: {$task->purpose}
        TOPIC: {$task->parameters['topic']}
        COMMUNITY: {$contact->community->name}
        
        Keep the call under 2 minutes. Be professional, brief, and respectful.
        PROMPT;
    }
}
```

### 11.2 Vapi Webhook Handler

```
Route: POST /webhooks/vapi/call-complete

Processing:
1. Receive call completion webhook with transcript and recording URL
2. Match to outreach_attempt via metadata.task_id
3. Use PrismAiService to extract from transcript:
   - Did they provide a quote? → Extract it
   - Did they say no comment? → Note it
   - Did they refer to someone else? → Create new contact + outreach task
   - Did they ask for callback? → Schedule callback
   - Did they consent to recording? → Flag for direct quote eligibility
4. Update outreach_attempt with transcript, recording URL, extracted data
5. Update research package
6. Re-evaluate completeness
```

### 11.3 When Live Calls Fire

1. All other methods exhausted (email → SMS → voicemail) with no response
2. OR breaking news where time doesn't permit the escalation ladder
3. Story is HIGH or CRITICAL priority
4. Contact has a phone number
5. Current time is business hours (8 AM - 6 PM local time)
6. We haven't called this contact live in the last 14 days
7. Budget allows (live calls are expensive)

---

## PART 12 — LEGAL COMPLIANCE

### 12.1 Recording Consent by State

```php
// config/legal-compliance.php

return [
    'two_party_consent_states' => [
        'CA', 'CT', 'FL', 'IL', 'MD', 'MA', 'MI', 'MT', 'NV', 
        'NH', 'OR', 'PA', 'WA',
    ],
    // All other states are one-party consent
    
    'recording_disclosure' => [
        'two_party' => 'This call may be recorded for publication purposes. Is that okay with you?',
        'one_party' => 'This call may be recorded for publication purposes.',
    ],
    
    'ai_identification' => 'This is the Day News automated reporting service.',
    // Required in many jurisdictions — always identify as AI/automated
    
    'business_hours' => [
        'start' => '08:00',
        'end' => '18:00',
        'timezone' => 'local',  // Use contact's timezone
    ],
    
    'anti_harassment' => [
        'max_emails_per_contact_per_week' => 3,
        'max_texts_per_contact_per_week' => 2,
        'max_voicemails_per_contact_per_month' => 2,
        'max_live_calls_per_contact_per_month' => 1,
        'cooldown_after_no_comment_days' => 30,  // If they said "no comment," back off
        'cooldown_after_decline_days' => 90,     // If they said "don't contact me," long cooldown
        'permanent_block_on_request' => true,    // If they say "never contact me again," honor it permanently
    ],
];
```

### 12.2 Opt-Out Handling

If a contact says "don't contact me" or "remove me from your list":

```php
$contact->update([
    'notes' => $contact->notes . "\nOPT-OUT: Requested no further contact on {$date}",
    'preferred_contact_method' => 'do_not_contact',
]);
```

The orchestrator checks `preferred_contact_method === 'do_not_contact'` before any outreach and skips that contact permanently.

---

## PART 13 — COST TRACKING AND BUDGETS

### 13.1 Per-Story Cost Tracking

Every research task logs its cost. The orchestrator tracks cumulative cost per story:

```php
// In ReporterResearchOrchestrator::dispatchTask()
$result = $tool->execute($task);

$task->update([
    'cost' => $result->cost,
    'completed_at' => now(),
]);

$plan = $task->researchPlan;
$totalCost = $plan->tasks()->sum('cost');

if ($totalCost > config('research-tools.budget.max_cost_per_story')) {
    Log::warning('Research budget exceeded', [
        'plan_id' => $plan->id,
        'total_cost' => $totalCost,
        'limit' => config('research-tools.budget.max_cost_per_story'),
    ]);
    // Don't dispatch more paid tasks — use free tools only
}
```

### 13.2 Budget Projections (With Editorial Gate)

The Editorial Gate (Part 1.3) means only 15% of leads enter the research pipeline at all. The remaining 85% publish with zero research cost.

**Daily breakdown at ~2,000 leads/day:**

| Research Tier | % of Leads | Count/Day | Avg Cost/Item | Daily Cost |
|---|---|---|---|---|
| Publish as-is (score 0-15) | 70% | ~1,400 | $0.00 | $0.00 |
| Light touch (score 16-30) | 15% | ~300 | $0.00 | $0.00 |
| Standard research (score 31-50) | 10% | ~200 | $0.02 | $4.00 |
| Dig deeper (score 51-70) | 3.5% | ~70 | $0.075 | $5.25 |
| Get a quote (score 71-85) | 1.2% | ~25 | $0.125 | $3.13 |
| Full reporter (score 86-100) | 0.3% | ~5 | $0.35 | $1.75 |
| **TOTAL** | | **~2,000** | | **~$14.13/day** |

**Monthly: ~$425.** Not $3,000-5,000.

The gate doesn't reduce quality — it focuses quality. The 5 full-reporter stories per day are the front-page pieces that drive readership, get shared, and make Day.News feel like a real newspaper. The 1,400 that publish as-is are the comprehensive local coverage that makes Day.News useful every day. Both are essential. But you don't hire a private investigator to confirm a library storytime announcement.

**As outreach tools come online (Gen 2-5), costs increase marginally:**

| Addition | Applies To | Count/Day | Extra Cost/Day |
|---|---|---|---|
| Email outreach (Gen 2) | Score 71+ leads | ~30 emails | ~$0.03 |
| SMS follow-up (Gen 3) | Non-responsive email contacts | ~10 texts | ~$0.08 |
| Voicemail drop (Gen 4) | Non-responsive text contacts | ~5 calls | ~$0.15 |
| Live AI calls (Gen 5) | Breaking news + exhausted escalation | ~2 calls | ~$1.00 |
| **Total outreach overhead** | | | **~$1.26/day** |

**Full system at Gen 5: ~$15.40/day. ~$465/month.** For autonomous journalism across 10,500 communities.

---

## PART 14 — INTEGRATION WITH EXISTING PIPELINE

### 14.1 Where RRO Plugs In

Currently the article pipeline is:
```
RawContent → ContentClassification → Shortlisting → Scoring → 
FactChecking → Selection → Generation → Publishing
```

With RRO, it becomes:
```
RawContent → ContentClassification → Shortlisting → Scoring →
  ↓
  EDITORIAL GATE (score 0-100)
  ↓                                    ↓
  Score 0-30:                          Score 31+:
  Skip RRO entirely                    RRO activates (scoped to tier)
  ↓                                    ↓
  ArticleGeneration                    Research Plan → Execute → Gap Analysis →
  (from RawContent alone,                [Outreach if tier allows] → Assembly
   as it works today)                  ↓
  ↓                                    ArticleGeneration
  Publishing                           (with full ResearchBundle)
                                       ↓
                                       Publishing
```

The RRO replaces the current `FactCheckingService` and `Selection` phases — or more accurately, it subsumes them. Fact-checking IS research. Selection IS confidence scoring. The RRO does both better because it has more tools.

### 14.2 Feature Flags

```php
// config/features.php
'rro_enabled' => env('RRO_ENABLED', false),
'rro_gen' => env('RRO_GEN', 1),  // Which generation of tools to enable
'rro_outreach_enabled' => env('RRO_OUTREACH_ENABLED', false),
'rro_voice_enabled' => env('RRO_VOICE_ENABLED', false),
```

When `rro_enabled` is false, the existing pipeline runs unchanged. When true, raw_content items that score above a threshold get routed through the RRO before article generation. Low-value items (event listings, calendar items) skip the RRO and go straight to generation.

---

## PART 15 — POLL INTEGRATION

### 15.1 Auto-Generated Polls

The orchestrator can suggest a poll for any story that involves a community decision or controversy:

```php
// In ResearchAssembler::assemblePoll()
if ($this->isControversialOrDecision($plan)) {
    $pollSuggestion = $this->prismAi->chat(
        "Given this story about '{$plan->headline_hypothesis}' in {$community->name}, " .
        "suggest a community poll question with 3-4 answer options. " .
        "The question should be neutral and allow residents to express their view. " .
        "Format: {question: '...', options: ['...', '...', '...']}",
        'poll_generation'
    );
    
    $package->community_data['suggested_poll'] = json_decode($pollSuggestion);
}
```

The poll gets created alongside the article and embedded in it. Results feed back into future coverage: "In a Day.News poll, 67% of Clearwater residents opposed the rate increase."

### 15.2 Poll Results as News Source

Poll results with sufficient responses (50+) become their own `RawContent` item:

```
Title: "Day.News Poll: 67% of Clearwater Residents Oppose Water Rate Increase"
Content: "In a community poll conducted by Day.News following the May 23 vote, 
          67% of respondents opposed the 15% water rate increase..."
Source: "Day.News Community Poll (N=342)"
```

This creates a feedback loop: news → poll → poll results → news about poll results.

---

## FILE MAP

### New Files

```
app/Services/Research/
├── EditorialGate.php                     — Scoring matrix and triage (Part 1.3)
├── ReporterResearchOrchestrator.php      — Main orchestrator (Part 1)
├── ResearchPlanBuilder.php               — AI-powered plan generation (Part 1.6)
├── ResearchAssembler.php                 — Assembles research packages (Part 2)
├── ConfidenceScorer.php                  — Fact confidence scoring (Part 6)
├── ArticleResearchBundle.php             — DTO for article generation (Part 7)
├── CostTracker.php                       — Per-story budget tracking (Part 13)
├── Tools/
│   ├── ResearchToolInterface.php         — Interface all tools implement
│   ├── DocumentFetcher.php               — Fetch/extract documents (Part 4.1)
│   ├── CorroborationSearcher.php         — Web search for verification (Part 4.2)
│   ├── ArchiveSearcher.php               — Search own coverage (Part 4.3)
│   ├── DataEnricher.php                  — Third-party data APIs (Part 4.4)
│   ├── SocialMonitor.php                 — Public social media (Part 4.5)
│   ├── PerplexityResearcher.php          — AI research (Part 4.6)
│   ├── EmailOutreach.php                 — Gen 2 email reporter (Part 8)
│   ├── SmsOutreach.php                   — Gen 3 SMS reporter (Part 9)
│   ├── VoicemailDrop.php                 — Gen 4 voicemail (Part 10)
│   └── LiveCallAgent.php                 — Gen 5 AI phone calls (Part 11)
├── Outreach/
│   ├── OutreachManager.php               — Manages escalation ladder
│   ├── ResponseMatcher.php               — Matches inbound responses to plans
│   └── ContactSelector.php               — Picks best contact for outreach

app/Jobs/Research/
├── ExecuteResearchPlanJob.php
├── ExecuteResearchTaskJob.php
├── CheckResearchDeadlineJob.php
├── ProcessOutreachResponseJob.php

app/Console/Commands/Research/
├── ResearchStatusCommand.php             — Show active research plans
├── ResearchCostReportCommand.php         — Daily cost report

app/Models/
├── ResearchPlan.php
├── ResearchTask.php
├── CivicContact.php
├── OutreachAttempt.php
├── EditorialScore.php                    — Value object for gate output

app/Http/Controllers/Webhooks/
├── InboundEmailController.php            — SendGrid/Postmark inbound
├── InboundSmsController.php              — Twilio SMS webhook
├── TwilioVoiceController.php             — Twilio voice/AMD webhook
├── VapiCallController.php                — Vapi call completion webhook

database/migrations/
├── xxxx_create_research_plans_table.php
├── xxxx_create_research_tasks_table.php
├── xxxx_create_civic_contacts_table.php
├── xxxx_create_outreach_attempts_table.php

config/
├── research-tools.php                    — Tool registry and budgets
├── editorial-gate.php                    — Scoring signals, thresholds, AI classification toggle
├── legal-compliance.php                  — Recording consent, anti-harassment

routes/
├── webhooks.php                          — Webhook routes for inbound email/SMS/voice
```

### Files to Modify

```
app/Services/News/ArticleGenerationService.php  — Accept ArticleResearchBundle
config/horizon.php                               — Add research queues
config/features.php                              — Add RRO feature flags
routes/console.php                               — Add research scheduler entries
```

---

## MANDATORY PRE-READ

Before writing ANY code from this spec:

```bash
# Current article generation — understand what we're enhancing
cat app/Services/News/ArticleGenerationService.php
cat app/Services/News/PrismAiService.php
cat app/Services/News/FactCheckingService.php
cat app/Services/News/ContentCurationService.php

# Current collection — understand the ingest side
cat app/Services/Newsroom/RssCollectionService.php
cat app/Services/Newsroom/WebScrapingService.php
cat app/Services/Newsroom/ContentClassificationService.php

# Current civic services — don't duplicate
cat app/Services/Civic/CivicSourceCollectionService.php
cat app/Services/Civic/PerplexityDiscoveryService.php

# Models — verify actual column names
cat app/Models/RawContent.php
cat app/Models/NewsSource.php
cat app/Models/CollectionMethod.php
cat app/Models/Community.php
cat app/Models/Region.php

# Existing queue config
cat config/horizon.php

# Existing feature flags
cat config/features.php 2>/dev/null || echo "File may not exist yet"

# Existing webhook routes
cat routes/api.php | grep -i webhook
```

**DO NOT assume column names, method signatures, or service class names from this spec. Read the actual files. The spec describes intent — the code files are truth.**

---

## THE VISION IN ONE PARAGRAPH

Day.News doesn't employ reporters. It employs an autonomous research orchestrator with editorial judgment — a system that monitors every civic institution in every community in America, detects newsworthy events, scores each one for significance, and invests research resources proportionally. A library storytime publishes in seconds for free. A city council vote to raise taxes gets full research, document analysis, official quotes, and a community poll — for $0.35. Legacy newspapers need 20 reporters to cover one county at $100,000+/year each. Day.News needs one system at $465/month to cover all of them. The technology exists today. The editorial gate makes it economically rational. This spec is the build plan.
