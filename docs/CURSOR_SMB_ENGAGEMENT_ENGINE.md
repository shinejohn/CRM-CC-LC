# COMMAND CENTER — SMB Engagement Engine: Bridge, Manifest Destiny, ROI
## Antigravity Execution Spec — Read Entire File Before Starting
## Drop this file at: /Users/johnshine/Dropbox/Fibonacco/Learning-Center/CURSOR_SMB_ENGAGEMENT_ENGINE.md

> **Repo:** Learning-Center (Command Center)
> **Backend:** `backend/app/`
> **Frontend:** `src/pages/`
> **Run tasks in order. Read each target file with @file before editing.**

---

## WHAT THIS SPEC FIXES

Three critical gaps that block the SMB lifecycle:

1. **Gap 1 — Reverse Bridge (Multisite → CC):** When the publishing platform discovers 2,500 businesses during community rollout, those businesses need to appear as CRM leads in the Command Center. Currently nothing syncs them. The rollout pipeline is a fire hose pointed at nothing.

2. **Gap 2 — Manifest Destiny Engine:** The infrastructure is 80% built but nothing actually fires. `SMBCampaignService` tracks day counters, `CampaignOrchestratorService` processes timelines, `CampaignActionExecutor` has action types — but the executor methods are all stubs that log and return `dispatched: false`. No timeline data is seeded. The daily `AdvanceManifestDestinyDay` job runs and increments counters, but no emails or SMS actually go out.

3. **Gap 5 — Subscriber ROI Dashboard:** No unified view showing an SMB what their subscription bought them. Story mentions, ad impressions, coupon redemptions, listing views — all tracked in different systems, never consolidated.

---

## GLOBAL RULES

```
1. Follow existing CC conventions (no strict_types — CC doesn't use it)
2. All new models: use HasUuids trait
3. Migrations only for DB changes
4. Frontend: React + TypeScript + shadcn/ui
5. Use existing services — StripeService, EmailDispatchService, SMSService, EngagementService, CampaignOrchestratorService
6. New API endpoints go in backend/routes/api.php inside the v1 prefix
```

---

## PHASE 1 — REVERSE BRIDGE: MULTISITE → CC BUSINESS INGEST

The publishing platform's community rollout pipeline discovers businesses via Google Places, enriches them with website scanning, and stores them in Multisite's `businesses` table. Those records need to flow into the CC's `customers` table as CRM leads so that outreach campaigns can begin.

### Task 1.1 — BusinessIngestController

**File:** `backend/app/Http/Controllers/Api/BusinessIngestController.php`

This endpoint is called by the Multisite publishing platform (not by the frontend) when businesses are discovered during community rollout. Authenticated via the same bridge API key used in `CURSOR_PRODUCT_CATALOG_SYSTEM.md` (Phase 4).

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Community;
use App\Services\BusinessIngestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusinessIngestController extends Controller
{
    public function __construct(
        private BusinessIngestService $ingestService
    ) {}

    /**
     * Ingest a single business from the publishing platform.
     * Called after Google Places discovery + enrichment.
     */
    public function ingest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'external_id' => 'required|string|max:255',
            'community_id' => 'required|uuid',
            'business_name' => 'required|string|max:255',
            'dba_name' => 'nullable|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'sub_category' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:500',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:20',
            'coordinates' => 'nullable|array',
            'google_rating' => 'nullable|numeric|min:0|max:5',
            'google_review_count' => 'nullable|integer|min:0',
            'hours' => 'nullable|array',
            'enrichment_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->ingestService->ingestBusiness($validator->validated());

        return response()->json([
            'message' => $result['created'] ? 'Business imported as new lead' : 'Business updated',
            'customer_id' => $result['customer_id'],
            'pipeline_stage' => $result['pipeline_stage'],
        ], $result['created'] ? 201 : 200);
    }

    /**
     * Batch ingest multiple businesses.
     * Called after a community rollout phase completes.
     */
    public function batchIngest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'community_id' => 'required|uuid',
            'businesses' => 'required|array|min:1|max:500',
            'businesses.*.external_id' => 'required|string|max:255',
            'businesses.*.business_name' => 'required|string|max:255',
            'businesses.*.category' => 'nullable|string|max:100',
            'businesses.*.email' => 'nullable|email|max:255',
            'businesses.*.phone' => 'nullable|string|max:50',
            'businesses.*.website' => 'nullable|url|max:500',
            'businesses.*.address' => 'nullable|string|max:500',
            'businesses.*.city' => 'nullable|string|max:100',
            'businesses.*.state' => 'nullable|string|max:50',
            'businesses.*.zip' => 'nullable|string|max:20',
            'businesses.*.google_rating' => 'nullable|numeric',
            'businesses.*.google_review_count' => 'nullable|integer',
            'businesses.*.enrichment_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $results = $this->ingestService->batchIngest(
            $request->input('community_id'),
            $request->input('businesses')
        );

        return response()->json([
            'message' => "Processed {$results['total']} businesses",
            'created' => $results['created'],
            'updated' => $results['updated'],
            'skipped' => $results['skipped'],
        ]);
    }

    /**
     * Report enrichment data back for an existing customer.
     * Called when Multisite finishes website scanning / SERP enrichment.
     */
    public function enrichmentUpdate(Request $request, string $externalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'community_id' => 'required|uuid',
            'enrichment_data' => 'required|array',
            'enrichment_data.website_pages' => 'nullable|array',
            'enrichment_data.has_events' => 'nullable|boolean',
            'enrichment_data.has_menu' => 'nullable|boolean',
            'enrichment_data.has_booking' => 'nullable|boolean',
            'enrichment_data.social_profiles' => 'nullable|array',
            'enrichment_data.employee_count_estimate' => 'nullable|integer',
            'enrichment_data.services_detected' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->ingestService->updateEnrichment($externalId, $validator->validated());

        return response()->json([
            'message' => 'Enrichment data updated',
            'customer_id' => $result['customer_id'],
            'data_quality_score' => $result['data_quality_score'],
        ]);
    }
}
```

**Routes** (add to `backend/routes/api.php` — inside the bridge auth middleware group from the product catalog spec, or create a new bridge group):

```php
Route::prefix('bridge')->middleware('bridge.auth')->group(function () {
    // ... existing bridge routes from CURSOR_PRODUCT_CATALOG_SYSTEM.md ...

    // Business ingest (Multisite → CC)
    Route::post('/business-ingest', [BusinessIngestController::class, 'ingest']);
    Route::post('/business-ingest/batch', [BusinessIngestController::class, 'batchIngest']);
    Route::patch('/business-ingest/{externalId}/enrichment', [BusinessIngestController::class, 'enrichmentUpdate']);
});
```

---

### Task 1.2 — BusinessIngestService

**File:** `backend/app/Services/BusinessIngestService.php`

```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Community;
use App\Enums\PipelineStage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BusinessIngestService
{
    public function ingestBusiness(array $data): array
    {
        $communityId = $data['community_id'];
        $externalId = $data['external_id'];

        // Check if already imported (by external_id)
        $existing = Customer::where('external_id', $externalId)
            ->where('community_id', $communityId)
            ->first();

        if ($existing) {
            // Update with any new data (don't overwrite existing enrichment)
            $updates = array_filter([
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'website' => $data['website'] ?? null,
                'google_rating' => $data['google_rating'] ?? null,
                'google_review_count' => $data['google_review_count'] ?? null,
            ], fn($v) => $v !== null);

            if (!empty($updates)) {
                $existing->update($updates);
            }

            return [
                'created' => false,
                'customer_id' => $existing->id,
                'pipeline_stage' => $existing->pipeline_stage?->value ?? 'hook',
            ];
        }

        // Determine initial data quality score
        $qualityScore = $this->calculateInitialQuality($data);

        // Determine lead score based on enrichment indicators
        $leadScore = $this->calculateInitialLeadScore($data);

        $customer = Customer::create([
            'tenant_id' => $this->getSystemTenantId(),
            'community_id' => $communityId,
            'external_id' => $externalId,
            'slug' => Str::slug($data['business_name']) . '-' . Str::random(6),
            'business_name' => $data['business_name'],
            'dba_name' => $data['dba_name'] ?? null,
            'business_type' => $data['business_type'] ?? null,
            'category' => $data['category'] ?? null,
            'sub_category' => $data['sub_category'] ?? null,
            'owner_name' => $data['owner_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'website' => $data['website'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'zip' => $data['zip'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
            'google_rating' => $data['google_rating'] ?? null,
            'google_review_count' => $data['google_review_count'] ?? null,
            'hours' => $data['hours'] ?? null,
            'lead_source' => 'community_rollout',
            'lead_score' => $leadScore,
            'data_quality_score' => $qualityScore,
            'pipeline_stage' => PipelineStage::HOOK,
            'stage_entered_at' => now(),
            'engagement_tier' => 4, // Passive — no interaction yet
            'engagement_score' => 0,
            'email_opted_in' => !empty($data['email']), // Can receive email if we have an address
            'sms_opted_in' => false,
            'rvm_opted_in' => false,
            'phone_opted_in' => false,
            'do_not_contact' => false,
            'customer_intelligence' => $data['enrichment_data'] ?? null,
            'data_sources' => ['google_places', 'community_rollout'],
        ]);

        Log::info("Business ingested from rollout", [
            'customer_id' => $customer->id,
            'external_id' => $externalId,
            'community_id' => $communityId,
            'business_name' => $data['business_name'],
            'quality_score' => $qualityScore,
        ]);

        return [
            'created' => true,
            'customer_id' => $customer->id,
            'pipeline_stage' => 'hook',
        ];
    }

    public function batchIngest(string $communityId, array $businesses): array
    {
        $created = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($communityId, $businesses, &$created, &$updated, &$skipped) {
            foreach ($businesses as $biz) {
                $biz['community_id'] = $communityId;
                try {
                    $result = $this->ingestBusiness($biz);
                    if ($result['created']) {
                        $created++;
                    } else {
                        $updated++;
                    }
                } catch (\Exception $e) {
                    Log::warning("Skipped business during batch ingest", [
                        'business_name' => $biz['business_name'] ?? 'unknown',
                        'error' => $e->getMessage(),
                    ]);
                    $skipped++;
                }
            }
        });

        return [
            'total' => count($businesses),
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }

    public function updateEnrichment(string $externalId, array $data): array
    {
        $customer = Customer::where('external_id', $externalId)
            ->where('community_id', $data['community_id'])
            ->firstOrFail();

        // Merge enrichment data with existing intelligence
        $existingIntel = $customer->customer_intelligence ?? [];
        $newIntel = array_merge($existingIntel, $data['enrichment_data']);

        $customer->update([
            'customer_intelligence' => $newIntel,
            'last_enriched_at' => now(),
            'data_sources' => array_unique(array_merge(
                $customer->data_sources ?? [],
                ['website_scan', 'enrichment_pipeline']
            )),
        ]);

        // Recalculate data quality score
        $qualityScore = $this->calculateQualityFromFields($customer->fresh());
        $customer->update(['data_quality_score' => $qualityScore]);

        return [
            'customer_id' => $customer->id,
            'data_quality_score' => $qualityScore,
        ];
    }

    private function calculateInitialQuality(array $data): int
    {
        $score = 0;
        if (!empty($data['business_name'])) $score += 10;
        if (!empty($data['email'])) $score += 25;
        if (!empty($data['phone'])) $score += 20;
        if (!empty($data['website'])) $score += 15;
        if (!empty($data['address'])) $score += 10;
        if (!empty($data['category'])) $score += 10;
        if (($data['google_rating'] ?? 0) > 0) $score += 5;
        if (($data['google_review_count'] ?? 0) > 0) $score += 5;
        return min($score, 100);
    }

    private function calculateInitialLeadScore(array $data): int
    {
        $score = 50; // Base score for any discovered business
        if (($data['google_rating'] ?? 0) >= 4.0) $score += 15;
        if (($data['google_review_count'] ?? 0) >= 50) $score += 10;
        if (!empty($data['website'])) $score += 10;
        if (!empty($data['email'])) $score += 15;
        return min($score, 100);
    }

    private function calculateQualityFromFields(Customer $customer): int
    {
        $score = 0;
        if ($customer->business_name) $score += 10;
        if ($customer->email) $score += 25;
        if ($customer->phone) $score += 20;
        if ($customer->website) $score += 15;
        if ($customer->address) $score += 10;
        if ($customer->category) $score += 10;
        if ($customer->google_rating) $score += 5;
        if (!empty($customer->customer_intelligence)) $score += 5;
        return min($score, 100);
    }

    private function getSystemTenantId(): string
    {
        // Use a system-level tenant for platform-imported businesses
        // This should be a config value or constant
        return config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');
    }
}
```

---

## PHASE 2 — MANIFEST DESTINY: WIRE THE ENGINE

The orchestration framework exists. The gap is that `CampaignActionExecutor` methods are stubs, and no timeline data is seeded. This phase connects the executor to real email/SMS services and seeds the Manifest Destiny campaign timeline.

### Task 2.1 — Wire CampaignActionExecutor to real services

**File:** `backend/app/Services/CampaignActionExecutor.php`

Read the existing file first. The `sendEmail`, `sendSMS`, and `makeCall` methods all log but return `dispatched: false`. Wire them to real services:

**For `sendEmail()`:**
Read `backend/app/Services/Email/EmailDispatchService.php`. The email platform has an 8-step dispatch pipeline. Wire the executor to create an `OutboundCampaign` record and `CampaignRecipient` for the customer, then dispatch via the existing outbound email flow. Alternatively, for simpler one-off sends, use `EmailDispatchService::dispatch()` directly with the appropriate `EmailClient`.

The key integration:
1. Look up or create the customer's email address
2. Check `$customer->canContactViaEmail()` — respect opt-outs
3. Resolve the email template from `$action->template_type` — query `EmailTemplate` model
4. Build the email payload with the template + customer merge fields (business_name, city, community name, etc.)
5. Dispatch via the existing email infrastructure
6. Return `dispatched: true` with the message ID

**For `sendSMS()`:**
Read `backend/app/Services/SMSService.php`. Wire to existing SMS service:
1. Check `$customer->canContactViaSMS()`
2. Resolve SMS template from `$action->parameters['template_id']`
3. Dispatch via SMSService
4. Return `dispatched: true`

**For `makeCall()`:**
Read `backend/app/Services/PhoneService.php`. Wire similarly:
1. Check `$customer->canContactViaPhone()`
2. Resolve phone script from `$action->parameters['script_id']`
3. Dispatch via PhoneService
4. Return `dispatched: true`

**Critical: Do NOT rewrite the entire CampaignActionExecutor.** Only replace the stub implementations of `sendEmail()`, `sendSMS()`, and `makeCall()`. Leave all other methods (`scheduleFollowup`, `updateStage`, `checkEngagement`, `sendNotification`) as-is — they work.

---

### Task 2.2 — Seed Manifest Destiny Campaign Timeline

**File:** `backend/database/seeders/ManifestDestinyTimelineSeeder.php`

This seeder creates the campaign timeline that runs when a new SMB lead enters the system from community rollout. It maps to the `CampaignTimeline` and `CampaignTimelineAction` models.

Create a timeline for the HOOK pipeline stage, 30 days duration:

```php
$timeline = CampaignTimeline::updateOrCreate(
    ['slug' => 'manifest-destiny-hook'],
    [
        'name' => 'Manifest Destiny — Hook Stage',
        'description' => 'Initial 30-day outreach sequence for newly discovered businesses during community rollout',
        'pipeline_stage' => PipelineStage::HOOK,
        'duration_days' => 30,
        'is_active' => true,
    ]
);
```

Then seed actions. These are the specific touchpoints — the actual email/SMS content will be in templates, not hardcoded here. The actions define WHEN and WHAT TYPE, not the copy itself.

```
Day 1:  send_email — template_type: 'welcome_community_launch' — "Your community just got its own news platform"
Day 1:  send_notification — notify internal team of new lead batch

Day 3:  send_email — template_type: 'your_business_featured' — "We already wrote about your business"
         conditions: { if: 'email_opened', within_hours: 48, then: 'proceed' } (only if day 1 was opened)

Day 5:  check_engagement — threshold: 10 — if score >= 10, skip to faster cadence

Day 7:  send_email — template_type: 'free_listing_claim' — "Claim your free business listing"

Day 10: send_sms — template_type: 'listing_reminder_sms' — "Your free Day.News listing is waiting"
         conditions: { if: 'email_opened', within_hours: 72, then: 'skip' } (don't SMS if they're reading emails)

Day 14: send_email — template_type: 'community_influencer_intro' — "See how [competitor] is using Day.News"
         conditions: { if: 'engagement_score_above', threshold: 30, then: 'skip' } (already engaged, don't oversell)

Day 18: send_email — template_type: 'coupon_feature_offer' — "Post a free coupon to reach your neighbors"

Day 21: check_engagement — threshold: 20 — evaluate tier change

Day 24: send_email — template_type: 'founder_pricing_urgency' — "X days left to lock in founder pricing"
         conditions: founder window must still be open (check community launched_at + 90 days)

Day 28: send_email — template_type: 'last_chance_founder' — "Final notice: founder pricing closes in X days"

Day 30: update_stage — new_stage: 'engagement' — advance to engagement pipeline regardless of response
```

Each action uses the existing `CampaignTimelineAction` model fields: `day_number`, `channel`, `action_type`, `template_type`, `conditions`, `parameters`, `delay_hours`, `priority`, `is_active`.

Run: `php artisan db:seed --class=ManifestDestinyTimelineSeeder`

---

### Task 2.3 — Auto-assign timeline on business ingest

**File:** `backend/app/Services/BusinessIngestService.php`

After creating a new Customer in `ingestBusiness()`, add at the end before the return:

```php
// Auto-assign Manifest Destiny campaign timeline
try {
    $orchestrator = app(\App\Contracts\CampaignOrchestratorInterface::class);
    $orchestrator->assignTimelineForStage($customer);
} catch (\Exception $e) {
    Log::warning("Failed to assign timeline for customer {$customer->id}: " . $e->getMessage());
}
```

This connects business discovery → CRM lead → automatic campaign enrollment in a single flow.

---

### Task 2.4 — Create email templates for Manifest Destiny

**File:** `backend/database/seeders/ManifestDestinyEmailTemplateSeeder.php`

Seed `EmailTemplate` records for each template_type referenced in the timeline actions. Each template needs: `name`, `slug` (matching the template_type), `subject`, `body_html`, `body_text`, `merge_fields` (array of available variables like `{{business_name}}`, `{{community_name}}`, `{{founder_days_remaining}}`).

Templates to create:
```
welcome_community_launch
your_business_featured
free_listing_claim
listing_reminder_sms (SMS template, not email)
community_influencer_intro
coupon_feature_offer
founder_pricing_urgency
last_chance_founder
```

The body copy should be professional, warm, and focused on the value prop — "your community just got its own daily news platform and your business is already part of it." Do NOT use hard-sell language. Reference Day.News by name.

---

## PHASE 3 — ENGAGEMENT SCORING: WIRE TO REAL DATA

### Task 3.1 — Fix EngagementService to use real campaign_sends data

**File:** `backend/app/Services/EngagementService.php`

Read the existing file first. The `countEmailOpens()` and `countEmailClicks()` methods both have TODO comments saying "Query actual email opens from campaign_sends table when Module 2 is ready."

The data IS ready. Read these models to understand the tracking data available:
- `backend/app/Models/CampaignSend.php` (if it exists)
- `backend/app/Models/EmailMessage.php`
- `backend/app/Models/EmailDeliveryEvent.php`

Replace the placeholder implementations:

**`countEmailOpens()`** — query `email_delivery_events` (or `campaign_sends`) where `customer_id` matches AND `event_type = 'open'` AND within the last N days. Return the actual count, not just 0 or 1.

**`countEmailClicks()`** — same pattern, `event_type = 'click'`.

**`countContentViews()`** — check if `content_views` table exists (it should from the Learning Center module). If so, query actual view counts.

**`calculateApprovalScore()`** — the current implementation uses `last_approval` timestamp with decay. Improve it to count actual approvals from the `approvals` table: `Approval::where('customer_id', $customer->id)->count()` weighted by recency.

Also add a new signal:

**`countWebsiteVisits()`** — if the publishing platform tracks business profile page views via the bridge, incorporate that signal. For now, check if there's an `analytics_events` or similar table. If not, skip this and add it later when the bridge reports back.

### Task 3.2 — Wire engagement scoring to outbound email tracking

Read `backend/app/Models/EmailDeliveryEvent.php` (or similar). The Postal webhook handler in `backend/app/Http/Controllers/Api/PostalWebhookController.php` receives delivery events. Ensure that when an event comes in for a customer, the customer's `last_email_open` / `last_email_click` / `last_content_view` timestamps are updated.

Check `backend/app/Http/Controllers/Api/StripeWebhookController.php` and the newsletter tracking controllers — when a newsletter open/click is tracked, ensure it flows back to update the customer record.

The goal: every time a business owner opens an email, clicks a link, or views content, the `EngagementService::calculateScore()` returns a higher number, and the nightly `EvaluateTierTransitions` job promotes them from Tier 4 (Passive) → Tier 3 → Tier 2 → Tier 1.

---

## PHASE 4 — SUBSCRIBER ROI DASHBOARD

### Task 4.1 — SubscriberROIService

**File:** `backend/app/Services/SubscriberROIService.php`

This service queries both local CC data AND the publishing platform bridge to build a consolidated ROI report for a subscriber.

```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CommunitySubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SubscriberROIService
{
    /**
     * Generate monthly ROI report for a subscriber.
     * Pulls data from CC (billing, campaigns, engagement) + Publishing Platform bridge (mentions, impressions, redemptions).
     */
    public function generateReport(string $customerId, string $yearMonth): array
    {
        $customer = Customer::findOrFail($customerId);
        $subscription = CommunitySubscription::where('customer_id', $customerId)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return ['error' => 'No active subscription'];
        }

        // Local CC data
        $billingData = $this->getBillingData($customer, $subscription, $yearMonth);
        $engagementData = $this->getEngagementData($customer, $yearMonth);
        $campaignData = $this->getCampaignData($customer, $yearMonth);

        // Publishing platform data via bridge
        $publishingData = $this->getPublishingData($customer->external_id, $subscription->community_id, $yearMonth);

        return [
            'customer_id' => $customerId,
            'business_name' => $customer->business_name,
            'month' => $yearMonth,
            'subscription' => [
                'tier' => $subscription->tier,
                'monthly_rate' => $subscription->monthly_rate,
                'is_founder_pricing' => $subscription->is_founder_pricing,
                'months_active' => $subscription->commitment_starts_at
                    ? $subscription->commitment_starts_at->diffInMonths(now()) + 1
                    : 0,
            ],
            'content_delivery' => [
                'story_mentions' => $publishingData['story_mentions'] ?? 0,
                'story_mention_target' => $publishingData['story_mention_target'] ?? 17,
                'articles_featuring_business' => $publishingData['articles_count'] ?? 0,
            ],
            'advertising' => [
                'ad_impressions' => $publishingData['ad_impressions'] ?? 0,
                'ad_clicks' => $publishingData['ad_clicks'] ?? 0,
                'ad_ctr' => $publishingData['ad_ctr'] ?? 0,
                'newsletter_impressions' => $publishingData['newsletter_impressions'] ?? 0,
            ],
            'listing_performance' => [
                'profile_views' => $publishingData['profile_views'] ?? 0,
                'search_appearances' => $publishingData['search_appearances'] ?? 0,
                'website_clicks' => $publishingData['website_clicks'] ?? 0,
                'phone_clicks' => $publishingData['phone_clicks'] ?? 0,
                'direction_requests' => $publishingData['direction_requests'] ?? 0,
            ],
            'commerce' => [
                'coupons_created' => $publishingData['coupons_created'] ?? 0,
                'coupons_claimed' => $publishingData['coupons_claimed'] ?? 0,
                'coupon_redemptions' => $publishingData['coupon_redemptions'] ?? 0,
                'events_promoted' => $publishingData['events_promoted'] ?? 0,
                'tickets_sold' => $publishingData['tickets_sold'] ?? 0,
            ],
            'engagement' => [
                'engagement_score' => $customer->engagement_score,
                'engagement_tier' => $customer->engagement_tier,
                'emails_sent' => $campaignData['emails_sent'],
                'emails_opened' => $campaignData['emails_opened'],
                'email_open_rate' => $campaignData['email_open_rate'],
            ],
            'estimated_value' => $this->calculateEstimatedValue($publishingData),
        ];
    }

    private function getBillingData(Customer $customer, CommunitySubscription $sub, string $yearMonth): array
    {
        return [
            'amount_charged' => $sub->monthly_rate,
            'payment_status' => 'paid', // TODO: check actual Stripe status
        ];
    }

    private function getEngagementData(Customer $customer, string $yearMonth): array
    {
        return [
            'score' => $customer->engagement_score,
            'tier' => $customer->engagement_tier,
            'tier_name' => $customer->getTierName(),
        ];
    }

    private function getCampaignData(Customer $customer, string $yearMonth): array
    {
        // Query campaign sends for this customer in this month
        // TODO: Adapt to actual campaign_sends/email_messages table structure
        $sent = 0;
        $opened = 0;

        return [
            'emails_sent' => $sent,
            'emails_opened' => $opened,
            'email_open_rate' => $sent > 0 ? round(($opened / $sent) * 100, 1) : 0,
        ];
    }

    private function getPublishingData(string $externalId, string $communityId, string $yearMonth): array
    {
        $bridgeUrl = config('services.publishing_bridge.base_url');
        $bridgeKey = config('services.publishing_bridge.api_key');

        if (!$bridgeUrl || !$bridgeKey) {
            return [];
        }

        $cacheKey = "roi:{$externalId}:{$communityId}:{$yearMonth}";

        return Cache::remember($cacheKey, now()->addHours(1), function () use ($bridgeUrl, $bridgeKey, $externalId, $communityId, $yearMonth) {
            try {
                $response = Http::withToken($bridgeKey)
                    ->timeout(10)
                    ->get("{$bridgeUrl}/api/v1/bridge/subscriber-roi/{$externalId}/{$communityId}", [
                        'month' => $yearMonth,
                    ]);

                return $response->successful() ? ($response->json('data') ?? []) : [];
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    private function calculateEstimatedValue(array $publishingData): array
    {
        // Estimate the value of what the subscriber received
        $storyMentionValue = ($publishingData['story_mentions'] ?? 0) * 50; // ~$50 per organic mention
        $adImpressionValue = (($publishingData['ad_impressions'] ?? 0) / 1000) * 15; // $15 CPM equivalent
        $profileViewValue = ($publishingData['profile_views'] ?? 0) * 0.50; // $0.50 per view
        $couponRedemptionValue = ($publishingData['coupon_redemptions'] ?? 0) * 10; // $10 per redemption

        $total = $storyMentionValue + $adImpressionValue + $profileViewValue + $couponRedemptionValue;

        return [
            'total_estimated_value' => round($total, 2),
            'breakdown' => [
                'story_mentions' => round($storyMentionValue, 2),
                'ad_impressions' => round($adImpressionValue, 2),
                'profile_views' => round($profileViewValue, 2),
                'coupon_redemptions' => round($couponRedemptionValue, 2),
            ],
        ];
    }
}
```

### Task 4.2 — SubscriberROIController

**File:** `backend/app/Http/Controllers/Api/SubscriberROIController.php`

Endpoints:
- `GET /v1/subscriber-roi/{customerId}` — current month report
- `GET /v1/subscriber-roi/{customerId}/{yearMonth}` — specific month report
- `GET /v1/subscriber-roi/{customerId}/summary` — 12-month summary with trends

Routes (inside `auth:sanctum`):
```php
Route::prefix('subscriber-roi')->group(function () {
    Route::get('/{customerId}', [SubscriberROIController::class, 'currentMonth']);
    Route::get('/{customerId}/{yearMonth}', [SubscriberROIController::class, 'monthReport']);
    Route::get('/{customerId}/summary', [SubscriberROIController::class, 'summary']);
});
```

### Task 4.3 — ROI Dashboard Frontend Page

**File:** `src/pages/Business/ROIDashboardPage.tsx`

New page showing the subscriber's monthly ROI. Calls `GET /v1/subscriber-roi/{customerId}`.

Layout:
1. **Header:** Business name, subscription tier, monthly rate, months active, founder pricing badge
2. **Value Score Card:** "Your $300/month subscription delivered an estimated $X,XXX in value this month" with a circular progress indicator
3. **Content Delivery:** Story mentions (actual vs target bar chart), articles featuring business
4. **Advertising Performance:** Impressions, clicks, CTR in a compact stat row
5. **Listing Performance:** Profile views, search appearances, website clicks, phone clicks, direction requests — each with month-over-month trend arrows
6. **Commerce:** Coupons created/claimed/redeemed, events promoted, tickets sold
7. **Engagement:** Engagement score gauge, tier badge, email open rate

Use `recharts` for charts (it's in the CC's package.json already). Use shadcn/ui Card components for each section.

Add route to `src/AppRouter.tsx`.

---

## PHASE 5 — PUBLISHING PLATFORM BRIDGE: ROI DATA ENDPOINT

This task goes in the **Multisite** spec (`CURSOR_PUBLISHING_PRODUCT_DELIVERY.md`, **Phase 7**) but is documented here for completeness since the ROI dashboard depends on it.

**Status (Multisite repo):** Implemented — `GET /api/v1/bridge/subscriber-roi/{externalId}/{communityId}` with Bearer `PUBLISHING_BRIDGE_API_KEY`. See Phase 7 in `docs/CURSOR_PUBLISHING_PRODUCT_DELIVERY.md`.

The Multisite publishing platform exposes the endpoint that the CC's `SubscriberROIService` calls:

`GET /api/v1/bridge/subscriber-roi/{externalId}/{communityId}?month=2026-03`

Returns:
```json
{
    "data": {
        "story_mentions": 14,
        "story_mention_target": 17,
        "articles_count": 3,
        "ad_impressions": 12450,
        "ad_clicks": 187,
        "ad_ctr": 1.5,
        "newsletter_impressions": 4200,
        "profile_views": 892,
        "search_appearances": 3400,
        "website_clicks": 145,
        "phone_clicks": 23,
        "direction_requests": 67,
        "coupons_created": 3,
        "coupons_claimed": 89,
        "coupon_redemptions": 34,
        "events_promoted": 2,
        "tickets_sold": 45
    }
}
```

This queries: `BusinessMention` (story mentions), `AdImpression`/`AdClick` (ad stats), `CouponClaim`/`CouponUsage` (coupon stats), `EventPromotion` (events), `TicketOrder` (tickets), and page view tracking (profile views, search appearances). Some of these counters may not exist yet — return 0 for anything not tracked.

**Add this note to the Multisite CURSOR_PRODUCT_DELIVERY_SYSTEM.md as a Phase 7 task.**

---

## VERIFICATION CHECKLIST

```
Phase 1 — Reverse Bridge:
1. POST /v1/bridge/business-ingest with valid business data creates a Customer record
2. POST /v1/bridge/business-ingest/batch with 10 businesses creates 10 Customer records
3. Duplicate external_id + community_id updates instead of creating
4. PATCH /v1/bridge/business-ingest/{externalId}/enrichment updates customer_intelligence
5. New customers have pipeline_stage = 'hook', engagement_tier = 4, lead_source = 'community_rollout'

Phase 2 — Manifest Destiny:
6. php artisan db:seed --class=ManifestDestinyTimelineSeeder creates timeline + actions
7. php artisan db:seed --class=ManifestDestinyEmailTemplateSeeder creates email templates
8. New ingested business is auto-assigned to the Manifest Destiny timeline
9. ProcessCampaignTimelines job (runs hourly) executes Day 1 email for new leads
10. CampaignActionExecutor::sendEmail() actually dispatches via EmailDispatchService (not a stub)
11. Customers who open emails get their last_email_open timestamp updated
12. After 30 days, customer advances from HOOK to ENGAGEMENT pipeline stage

Phase 3 — Engagement Scoring:
13. EngagementService::countEmailOpens() queries actual delivery events, not just timestamps
14. RecalculateEngagementScores job produces non-zero scores for customers with email activity
15. EvaluateTierTransitions job promotes active customers from Tier 4 to Tier 3
16. Customer with 5+ email opens, 2+ clicks, 1+ content view scores above 50

Phase 4 — ROI Dashboard:
17. GET /v1/subscriber-roi/{customerId} returns complete report structure
18. Report includes both CC data (billing, engagement) and publishing data (mentions, impressions)
19. Estimated value calculation returns reasonable numbers
20. ROIDashboardPage renders with charts and stat cards
21. Month-over-month summary shows trends
```
