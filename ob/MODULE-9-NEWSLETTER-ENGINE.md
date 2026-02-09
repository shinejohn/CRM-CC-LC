# Module 9: Newsletter Engine

## Overview

**Owner:** Agent 9
**Timeline:** Week 3-6 (parallel development)
**Dependencies:** Module 0, 0B, 12 (Subscriber Management)
**Depended On By:** Module 8 (Analytics)

The Newsletter Engine handles scheduled community newsletters - daily and weekly digests of local news, events, and sponsored content. This is a primary revenue driver through advertising/sponsorships.

## Core Responsibilities

- Newsletter content aggregation and curation
- Sponsor/ad insertion and tracking
- Community-level batch scheduling
- A/B testing subject lines and content
- Send orchestration through Communication Infrastructure
- Open/click/conversion tracking
- Sponsor performance reporting

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          NEWSLETTER ENGINE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      CONTENT AGGREGATION                                 │   │
│  │                                                                          │   │
│  │   News Feed ──► Story Selector ──► Content Ranker ──► Layout Engine     │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       SPONSOR INSERTION                                  │   │
│  │                                                                          │   │
│  │   Active Sponsors ──► Placement Rules ──► Ad Selection ──► Insertion    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      NEWSLETTER BUILDER                                  │   │
│  │                                                                          │   │
│  │   Template ──► Content Slots ──► Personalization ──► HTML Generation    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      SEND ORCHESTRATOR                                   │   │
│  │                                                                          │   │
│  │   Scheduler ──► Recipient Lists ──► MessageService (Module 0B)          │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Tables

### Owned by This Module

```sql
-- ═══════════════════════════════════════════════════════════════════════════════
-- NEWSLETTERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE newsletters (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    community_id BIGINT NOT NULL REFERENCES communities(id),
    
    -- Type and scheduling
    newsletter_type VARCHAR(20) NOT NULL,  -- daily, weekly, special
    issue_date DATE NOT NULL,
    scheduled_for TIMESTAMP,
    
    -- Content
    subject VARCHAR(255) NOT NULL,
    subject_b VARCHAR(255),  -- For A/B testing
    preheader VARCHAR(255),
    content_json JSONB NOT NULL,  -- Structured content
    content_html TEXT,  -- Rendered HTML (cached)
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- draft, scheduled, building, sending, sent, failed
    
    -- A/B test config
    ab_test_enabled BOOLEAN DEFAULT FALSE,
    ab_test_percentage INTEGER DEFAULT 10,  -- % to send variant B
    ab_test_winner VARCHAR(1),  -- 'a' or 'b' after test
    ab_test_decided_at TIMESTAMP,
    
    -- Stats (denormalized for quick access)
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    unique_open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    unique_click_count INTEGER DEFAULT 0,
    unsubscribe_count INTEGER DEFAULT 0,
    
    -- Revenue tracking
    sponsor_revenue_cents INTEGER DEFAULT 0,
    
    -- Timestamps
    building_started_at TIMESTAMP,
    sending_started_at TIMESTAMP,
    sending_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (community_id, newsletter_type, issue_date)
);

CREATE INDEX idx_newsletters_schedule ON newsletters (scheduled_for, status) 
    WHERE status = 'scheduled';
CREATE INDEX idx_newsletters_community ON newsletters (community_id, issue_date DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- NEWSLETTER CONTENT ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE newsletter_content_items (
    id BIGSERIAL PRIMARY KEY,
    newsletter_id BIGINT NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    
    -- Content reference
    content_type VARCHAR(50) NOT NULL,  -- article, event, sponsor, announcement
    content_id BIGINT,  -- Reference to source content
    
    -- Display
    position INTEGER NOT NULL,  -- Order in newsletter
    section VARCHAR(50),  -- top_stories, events, sponsor_spotlight, etc.
    
    -- Inline content (if not referencing external)
    headline VARCHAR(255),
    summary TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    
    -- Tracking
    click_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nl_content_newsletter ON newsletter_content_items (newsletter_id, position);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SPONSORS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sponsors (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    
    -- Identity
    name VARCHAR(255) NOT NULL,
    smb_id BIGINT REFERENCES smbs(id),  -- If sponsor is also an SMB
    
    -- Display
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    tagline VARCHAR(255),
    
    -- Contact
    contact_email VARCHAR(255),
    contact_name VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SPONSORSHIPS (Campaigns)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sponsorships (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    sponsor_id BIGINT NOT NULL REFERENCES sponsors(id),
    
    -- Scope
    sponsorship_type VARCHAR(50) NOT NULL,  -- newsletter_header, newsletter_section, alert_sponsor
    community_id BIGINT REFERENCES communities(id),  -- NULL = all communities
    
    -- Campaign dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Inventory
    impressions_purchased INTEGER NOT NULL,
    impressions_delivered INTEGER DEFAULT 0,
    
    -- Creative
    creative_json JSONB,  -- Ad content: headline, image, cta, etc.
    
    -- Pricing
    rate_type VARCHAR(20) NOT NULL,  -- cpm, flat, cpc
    rate_cents INTEGER NOT NULL,  -- CPM rate or flat fee
    total_value_cents INTEGER NOT NULL,  -- Total contract value
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, paused, completed, cancelled
    
    -- Performance (denormalized)
    click_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sponsorships_active ON sponsorships (start_date, end_date, status) 
    WHERE status = 'active';
CREATE INDEX idx_sponsorships_sponsor ON sponsorships (sponsor_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- NEWSLETTER TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE newsletter_templates (
    id SERIAL PRIMARY KEY,
    
    -- Identity
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Type
    newsletter_type VARCHAR(20) NOT NULL,  -- daily, weekly
    
    -- Template
    structure_json JSONB NOT NULL,  -- Section definitions
    html_template TEXT NOT NULL,  -- Handlebars/Blade template
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- NEWSLETTER SCHEDULES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE newsletter_schedules (
    id SERIAL PRIMARY KEY,
    community_id BIGINT UNIQUE NOT NULL REFERENCES communities(id),
    
    -- Daily newsletter
    daily_enabled BOOLEAN DEFAULT TRUE,
    daily_send_time TIME DEFAULT '06:00:00',  -- Local time
    daily_template_id INTEGER REFERENCES newsletter_templates(id),
    
    -- Weekly newsletter
    weekly_enabled BOOLEAN DEFAULT TRUE,
    weekly_send_day INTEGER DEFAULT 0,  -- 0=Sunday, 6=Saturday
    weekly_send_time TIME DEFAULT '08:00:00',
    weekly_template_id INTEGER REFERENCES newsletter_templates(id),
    
    -- Timezone
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Service Interfaces

### NewsletterServiceInterface

```php
<?php

namespace App\Contracts\Newsletter;

interface NewsletterServiceInterface
{
    /**
     * Create a new newsletter
     */
    public function create(CreateNewsletterRequest $request): Newsletter;
    
    /**
     * Build newsletter content from sources
     */
    public function build(int $newsletterId): Newsletter;
    
    /**
     * Schedule newsletter for sending
     */
    public function schedule(int $newsletterId, Carbon $sendAt): Newsletter;
    
    /**
     * Send newsletter immediately
     */
    public function send(int $newsletterId): SendResult;
    
    /**
     * Get newsletter with stats
     */
    public function getWithStats(int $newsletterId): Newsletter;
    
    /**
     * Cancel scheduled newsletter
     */
    public function cancel(int $newsletterId): bool;
}
```

### SponsorServiceInterface

```php
<?php

namespace App\Contracts\Newsletter;

interface SponsorServiceInterface
{
    /**
     * Get active sponsorships for a community and type
     */
    public function getActive(int $communityId, string $type): Collection;
    
    /**
     * Select sponsor for placement (respects inventory)
     */
    public function selectForPlacement(int $communityId, string $type): ?Sponsorship;
    
    /**
     * Record impression delivery
     */
    public function recordImpression(int $sponsorshipId, int $count = 1): void;
    
    /**
     * Record click
     */
    public function recordClick(int $sponsorshipId): void;
    
    /**
     * Get sponsor performance report
     */
    public function getPerformance(int $sponsorId, Carbon $start, Carbon $end): SponsorReport;
}
```

---

## Core Services

### NewsletterService

```php
<?php

namespace App\Services\Newsletter;

use App\Contracts\Newsletter\NewsletterServiceInterface;
use App\Contracts\Communication\MessageServiceInterface;
use App\Models\Newsletter\Newsletter;
use App\Jobs\Newsletter\BuildNewsletter;
use App\Jobs\Newsletter\SendNewsletter;

class NewsletterService implements NewsletterServiceInterface
{
    public function __construct(
        private ContentAggregator $aggregator,
        private SponsorService $sponsors,
        private NewsletterBuilder $builder,
        private MessageServiceInterface $messages,
    ) {}
    
    public function create(CreateNewsletterRequest $request): Newsletter
    {
        return Newsletter::create([
            'community_id' => $request->communityId,
            'newsletter_type' => $request->type,
            'issue_date' => $request->issueDate,
            'subject' => $request->subject,
            'subject_b' => $request->subjectB,
            'preheader' => $request->preheader,
            'content_json' => [],
            'status' => 'draft',
            'ab_test_enabled' => $request->abTestEnabled,
        ]);
    }
    
    public function build(int $newsletterId): Newsletter
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        $newsletter->update([
            'status' => 'building',
            'building_started_at' => now(),
        ]);
        
        try {
            // 1. Aggregate content
            $content = $this->aggregator->aggregate(
                $newsletter->community_id,
                $newsletter->newsletter_type,
                $newsletter->issue_date
            );
            
            // 2. Select and insert sponsors
            $content = $this->sponsors->insertSponsors($content, $newsletter);
            
            // 3. Build HTML
            $html = $this->builder->build($newsletter, $content);
            
            // 4. Update newsletter
            $newsletter->update([
                'content_json' => $content,
                'content_html' => $html,
                'status' => 'scheduled',
            ]);
            
            // 5. Save content items
            $this->saveContentItems($newsletter, $content);
            
            return $newsletter->fresh();
        } catch (\Exception $e) {
            $newsletter->update(['status' => 'failed']);
            throw $e;
        }
    }
    
    public function send(int $newsletterId): SendResult
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        if ($newsletter->status !== 'scheduled') {
            throw new InvalidStateException("Newsletter must be scheduled before sending");
        }
        
        $newsletter->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        // Get recipient list
        $recipients = $this->getRecipients($newsletter);
        $newsletter->update(['recipient_count' => count($recipients)]);
        
        // Handle A/B testing
        if ($newsletter->ab_test_enabled) {
            return $this->sendWithAbTest($newsletter, $recipients);
        }
        
        // Send via Communication Infrastructure
        $result = $this->messages->sendBulk(new BulkMessageRequest(
            channel: 'email',
            priority: 'P2',
            messageType: 'newsletter',
            recipients: $recipients,
            subject: $newsletter->subject,
            template: 'newsletter',
            sharedData: [
                'newsletter_id' => $newsletter->id,
                'content_html' => $newsletter->content_html,
            ],
            sourceType: 'newsletters',
            sourceId: $newsletter->id,
            ipPool: 'newsletters',
        ));
        
        $newsletter->update([
            'status' => 'sent',
            'sent_count' => $result->queued,
            'sending_completed_at' => now(),
        ]);
        
        // Record sponsor impressions
        $this->recordSponsorImpressions($newsletter, $result->queued);
        
        return new SendResult(
            success: true,
            queued: $result->queued,
            suppressed: $result->suppressed,
        );
    }
    
    private function sendWithAbTest(Newsletter $newsletter, array $recipients): SendResult
    {
        $testSize = (int) (count($recipients) * ($newsletter->ab_test_percentage / 100));
        $testSize = max($testSize, 100); // Minimum test size
        
        // Split recipients
        shuffle($recipients);
        $testA = array_slice($recipients, 0, $testSize / 2);
        $testB = array_slice($recipients, $testSize / 2, $testSize / 2);
        $remainder = array_slice($recipients, $testSize);
        
        // Send test variants
        $this->sendVariant($newsletter, $testA, 'a', $newsletter->subject);
        $this->sendVariant($newsletter, $testB, 'b', $newsletter->subject_b);
        
        // Schedule winner decision (wait 2 hours, then send to remainder)
        dispatch(new DecideAbTestWinner($newsletter->id, $remainder))
            ->delay(now()->addHours(2));
        
        return new SendResult(
            success: true,
            queued: count($testA) + count($testB),
            suppressed: 0,
            note: 'A/B test in progress, remainder will be sent after 2 hours',
        );
    }
    
    private function getRecipients(Newsletter $newsletter): array
    {
        return Subscriber::whereHas('communities', function ($q) use ($newsletter) {
                $q->where('community_id', $newsletter->community_id);
            })
            ->where('email_opted_in', true)
            ->where(function ($q) use ($newsletter) {
                if ($newsletter->newsletter_type === 'daily') {
                    $q->where('newsletter_frequency', 'daily');
                } else {
                    $q->whereIn('newsletter_frequency', ['daily', 'weekly']);
                }
            })
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'type' => 'subscriber',
                'address' => $s->email,
                'data' => [
                    'first_name' => $s->first_name,
                ],
            ])
            ->toArray();
    }
    
    private function recordSponsorImpressions(Newsletter $newsletter, int $impressions): void
    {
        $sponsorItems = NewsletterContentItem::where('newsletter_id', $newsletter->id)
            ->where('content_type', 'sponsor')
            ->get();
        
        foreach ($sponsorItems as $item) {
            if ($item->content_id) {
                $this->sponsors->recordImpression($item->content_id, $impressions);
            }
        }
    }
}
```

### ContentAggregator

```php
<?php

namespace App\Services\Newsletter;

class ContentAggregator
{
    public function aggregate(int $communityId, string $type, Carbon $date): array
    {
        $content = [
            'sections' => [],
        ];
        
        // Top Stories
        $content['sections']['top_stories'] = $this->getTopStories($communityId, $date, limit: 5);
        
        // Local News
        $content['sections']['local_news'] = $this->getLocalNews($communityId, $date, limit: 8);
        
        // Events (if weekly or has events)
        if ($type === 'weekly' || $this->hasUpcomingEvents($communityId)) {
            $content['sections']['events'] = $this->getUpcomingEvents($communityId, limit: 5);
        }
        
        // Business Spotlight (weekly only)
        if ($type === 'weekly') {
            $content['sections']['business_spotlight'] = $this->getBusinessSpotlight($communityId);
        }
        
        // Weather
        $content['sections']['weather'] = $this->getWeather($communityId);
        
        return $content;
    }
    
    private function getTopStories(int $communityId, Carbon $date, int $limit): array
    {
        return Article::where('community_id', $communityId)
            ->where('published_at', '>=', $date->copy()->subDay())
            ->where('is_featured', true)
            ->orderByDesc('engagement_score')
            ->limit($limit)
            ->get()
            ->map(fn($a) => [
                'type' => 'article',
                'id' => $a->id,
                'headline' => $a->title,
                'summary' => $a->excerpt,
                'image_url' => $a->featured_image,
                'link_url' => $a->url,
                'author' => $a->author_name,
                'published_at' => $a->published_at->toIso8601String(),
            ])
            ->toArray();
    }
    
    // ... other aggregation methods
}
```

### SponsorService

```php
<?php

namespace App\Services\Newsletter;

use App\Contracts\Newsletter\SponsorServiceInterface;

class SponsorService implements SponsorServiceInterface
{
    public function selectForPlacement(int $communityId, string $type): ?Sponsorship
    {
        return Sponsorship::where('sponsorship_type', $type)
            ->where(function ($q) use ($communityId) {
                $q->whereNull('community_id')
                  ->orWhere('community_id', $communityId);
            })
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereRaw('impressions_delivered < impressions_purchased')
            ->orderByRaw('impressions_delivered::float / impressions_purchased ASC')  // Prioritize under-delivered
            ->first();
    }
    
    public function insertSponsors(array $content, Newsletter $newsletter): array
    {
        $communityId = $newsletter->community_id;
        
        // Header sponsor
        $headerSponsor = $this->selectForPlacement($communityId, 'newsletter_header');
        if ($headerSponsor) {
            $content['header_sponsor'] = [
                'type' => 'sponsor',
                'id' => $headerSponsor->id,
                'sponsor_name' => $headerSponsor->sponsor->name,
                'creative' => $headerSponsor->creative_json,
            ];
        }
        
        // Mid-content sponsor
        $midSponsor = $this->selectForPlacement($communityId, 'newsletter_section');
        if ($midSponsor) {
            $content['sections']['sponsor_spotlight'] = [[
                'type' => 'sponsor',
                'id' => $midSponsor->id,
                'sponsor_name' => $midSponsor->sponsor->name,
                'creative' => $midSponsor->creative_json,
            ]];
        }
        
        // Calculate revenue
        $revenue = 0;
        if ($headerSponsor && $headerSponsor->rate_type === 'cpm') {
            $revenue += $headerSponsor->rate_cents;  // Will multiply by impressions later
        }
        if ($midSponsor && $midSponsor->rate_type === 'cpm') {
            $revenue += $midSponsor->rate_cents;
        }
        
        $content['sponsor_revenue_estimate_cpm'] = $revenue;
        
        return $content;
    }
    
    public function recordImpression(int $sponsorshipId, int $count = 1): void
    {
        DB::transaction(function () use ($sponsorshipId, $count) {
            Sponsorship::where('id', $sponsorshipId)
                ->increment('impressions_delivered', $count);
            
            // Check if campaign is now completed
            $sponsorship = Sponsorship::find($sponsorshipId);
            if ($sponsorship->impressions_delivered >= $sponsorship->impressions_purchased) {
                $sponsorship->update(['status' => 'completed']);
            }
        });
    }
    
    public function recordClick(int $sponsorshipId): void
    {
        Sponsorship::where('id', $sponsorshipId)->increment('click_count');
    }
    
    public function getPerformance(int $sponsorId, Carbon $start, Carbon $end): SponsorReport
    {
        $sponsorships = Sponsorship::where('sponsor_id', $sponsorId)
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->get();
        
        $totalImpressions = $sponsorships->sum('impressions_delivered');
        $totalClicks = $sponsorships->sum('click_count');
        $totalSpend = $sponsorships->sum('total_value_cents');
        
        return new SponsorReport(
            sponsorId: $sponsorId,
            period: [$start, $end],
            campaigns: $sponsorships->count(),
            impressions: $totalImpressions,
            clicks: $totalClicks,
            ctr: $totalImpressions > 0 ? ($totalClicks / $totalImpressions) * 100 : 0,
            spend: $totalSpend,
            cpm: $totalImpressions > 0 ? ($totalSpend / $totalImpressions) * 1000 : 0,
            cpc: $totalClicks > 0 ? $totalSpend / $totalClicks : 0,
        );
    }
}
```

### NewsletterBuilder

```php
<?php

namespace App\Services\Newsletter;

class NewsletterBuilder
{
    public function build(Newsletter $newsletter, array $content): string
    {
        // Get template
        $schedule = NewsletterSchedule::where('community_id', $newsletter->community_id)->first();
        $templateId = $newsletter->newsletter_type === 'daily' 
            ? $schedule->daily_template_id 
            : $schedule->weekly_template_id;
        
        $template = NewsletterTemplate::find($templateId) 
            ?? NewsletterTemplate::where('is_default', true)
                ->where('newsletter_type', $newsletter->newsletter_type)
                ->first();
        
        // Get community info
        $community = Community::find($newsletter->community_id);
        
        // Build data for template
        $data = [
            'newsletter' => $newsletter,
            'community' => $community,
            'content' => $content,
            'date' => $newsletter->issue_date->format('F j, Y'),
            'unsubscribe_url' => $this->getUnsubscribeUrl($newsletter),
            'web_view_url' => $this->getWebViewUrl($newsletter),
            'tracking_pixel' => $this->getTrackingPixel($newsletter),
        ];
        
        // Render template
        return view('newsletters.templates.' . $template->slug, $data)->render();
    }
    
    private function getTrackingPixel(Newsletter $newsletter): string
    {
        $url = route('newsletter.track.open', ['uuid' => $newsletter->uuid]);
        return '<img src="' . $url . '" width="1" height="1" alt="" />';
    }
    
    private function getUnsubscribeUrl(Newsletter $newsletter): string
    {
        return route('newsletter.unsubscribe', [
            'community' => $newsletter->community_id,
            'token' => '{{unsubscribe_token}}',  // Replaced per-recipient
        ]);
    }
}
```

---

## Scheduled Jobs

```php
<?php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Generate and schedule daily newsletters
    // Runs at midnight, schedules for each community's preferred time
    $schedule->job(new ScheduleDailyNewsletters)->dailyAt('00:05');
    
    // Generate and schedule weekly newsletters
    // Runs Sunday at midnight, schedules for each community's preferred day/time
    $schedule->job(new ScheduleWeeklyNewsletters)->weeklyOn(0, '00:10');
    
    // Process scheduled newsletters (check every minute)
    $schedule->job(new ProcessScheduledNewsletters)->everyMinute();
    
    // Update newsletter stats from delivery events
    $schedule->job(new UpdateNewsletterStats)->everyFiveMinutes();
    
    // Check sponsorship inventory and alert if low
    $schedule->job(new CheckSponsorshipInventory)->dailyAt('09:00');
}
```

### ScheduleDailyNewsletters Job

```php
<?php

namespace App\Jobs\Newsletter;

class ScheduleDailyNewsletters implements ShouldQueue
{
    public function handle(NewsletterService $newsletters)
    {
        $schedules = NewsletterSchedule::where('daily_enabled', true)->get();
        
        foreach ($schedules as $schedule) {
            // Calculate send time in community's timezone
            $sendTime = now($schedule->timezone)
                ->setTimeFromTimeString($schedule->daily_send_time)
                ->setTimezone('UTC');
            
            // If send time has passed for today, skip
            if ($sendTime->isPast()) {
                continue;
            }
            
            // Check if newsletter already exists for today
            $exists = Newsletter::where('community_id', $schedule->community_id)
                ->where('newsletter_type', 'daily')
                ->where('issue_date', today())
                ->exists();
            
            if ($exists) {
                continue;
            }
            
            // Create newsletter
            $newsletter = $newsletters->create(new CreateNewsletterRequest(
                communityId: $schedule->community_id,
                type: 'daily',
                issueDate: today(),
                subject: $this->generateSubject($schedule->community_id, 'daily'),
            ));
            
            // Build content
            $newsletters->build($newsletter->id);
            
            // Schedule send
            $newsletters->schedule($newsletter->id, $sendTime);
        }
    }
    
    private function generateSubject(int $communityId, string $type): string
    {
        $community = Community::find($communityId);
        $date = now()->format('M j');
        
        return "{$community->name} Daily - {$date}";
    }
}
```

---

## API Endpoints

```php
<?php
// routes/api.php

Route::prefix('v1/newsletters')->middleware('auth:sanctum')->group(function () {
    // Newsletter CRUD
    Route::get('/', [NewsletterController::class, 'index']);
    Route::post('/', [NewsletterController::class, 'create']);
    Route::get('/{id}', [NewsletterController::class, 'show']);
    Route::put('/{id}', [NewsletterController::class, 'update']);
    Route::delete('/{id}', [NewsletterController::class, 'destroy']);
    
    // Newsletter actions
    Route::post('/{id}/build', [NewsletterController::class, 'build']);
    Route::post('/{id}/schedule', [NewsletterController::class, 'schedule']);
    Route::post('/{id}/send', [NewsletterController::class, 'send']);
    Route::post('/{id}/cancel', [NewsletterController::class, 'cancel']);
    
    // Preview
    Route::get('/{id}/preview', [NewsletterController::class, 'preview']);
    Route::post('/{id}/test-send', [NewsletterController::class, 'testSend']);
    
    // Stats
    Route::get('/{id}/stats', [NewsletterController::class, 'stats']);
    
    // Templates
    Route::get('/templates', [NewsletterTemplateController::class, 'index']);
    Route::get('/templates/{id}', [NewsletterTemplateController::class, 'show']);
    
    // Schedules
    Route::get('/schedules', [NewsletterScheduleController::class, 'index']);
    Route::put('/schedules/{communityId}', [NewsletterScheduleController::class, 'update']);
});

Route::prefix('v1/sponsors')->middleware('auth:sanctum')->group(function () {
    // Sponsor management
    Route::get('/', [SponsorController::class, 'index']);
    Route::post('/', [SponsorController::class, 'create']);
    Route::get('/{id}', [SponsorController::class, 'show']);
    Route::put('/{id}', [SponsorController::class, 'update']);
    
    // Sponsorships (campaigns)
    Route::get('/{id}/sponsorships', [SponsorController::class, 'sponsorships']);
    Route::post('/{id}/sponsorships', [SponsorController::class, 'createSponsorship']);
    
    // Performance
    Route::get('/{id}/performance', [SponsorController::class, 'performance']);
});

// Public tracking endpoints (no auth)
Route::get('/newsletter/track/open/{uuid}', [NewsletterTrackingController::class, 'open']);
Route::get('/newsletter/track/click/{uuid}/{itemId}', [NewsletterTrackingController::class, 'click']);
Route::get('/newsletter/view/{uuid}', [NewsletterController::class, 'webView']);
Route::get('/newsletter/unsubscribe/{community}/{token}', [NewsletterController::class, 'unsubscribe']);
```

---

## Events

### Emitted Events

```php
NewsletterCreated::class
NewsletterBuilt::class
NewsletterScheduled::class
NewsletterSendStarted::class
NewsletterSendCompleted::class
NewsletterOpened::class
NewsletterClicked::class
NewsletterUnsubscribed::class

SponsorshipCreated::class
SponsorshipCompleted::class  // Inventory exhausted
SponsorImpressionRecorded::class
SponsorClickRecorded::class
```

### Listened Events

```php
// From Module 0B (Communication Infrastructure)
MessageDelivered::class  // Update delivered_count
MessageOpened::class     // Update open_count
MessageClicked::class    // Update click_count, record item clicks
MessageBounced::class    // Track bounces
```

---

## Configuration

```php
<?php
// config/newsletter.php

return [
    'defaults' => [
        'daily_send_time' => '06:00:00',
        'weekly_send_day' => 0,  // Sunday
        'weekly_send_time' => '08:00:00',
        'timezone' => 'America/New_York',
    ],
    
    'ab_testing' => [
        'enabled' => true,
        'default_percentage' => 10,
        'minimum_test_size' => 100,
        'decision_delay_hours' => 2,
        'winner_metric' => 'open_rate',  // open_rate, click_rate
    ],
    
    'content' => [
        'max_top_stories' => 5,
        'max_local_news' => 8,
        'max_events' => 5,
        'story_age_hours' => 48,
    ],
    
    'sponsors' => [
        'header_enabled' => true,
        'mid_content_enabled' => true,
        'footer_enabled' => true,
    ],
];
```

---

## Acceptance Criteria

### Must Have
- [ ] Daily newsletter generation and scheduling
- [ ] Weekly newsletter generation and scheduling
- [ ] Sponsor insertion with inventory tracking
- [ ] Send through Communication Infrastructure (Module 0B)
- [ ] Open/click tracking
- [ ] Basic stats (sent, delivered, opened, clicked)
- [ ] Web view of newsletter
- [ ] Unsubscribe handling

### Should Have
- [ ] A/B testing subject lines
- [ ] Multiple template support
- [ ] Sponsor performance reports
- [ ] Community-specific scheduling

### Nice to Have
- [ ] AI-powered subject line generation
- [ ] Content personalization
- [ ] Engagement-based send time optimization

---

## Notes for Agent

1. **Use Module 0B for all sending** - Never send directly via SES/Postal
2. **Sponsor inventory is critical** - Never over-deliver on impressions
3. **Track everything** - Revenue depends on accurate impression/click counts
4. **A/B tests need sufficient sample size** - Don't split test with 10 subscribers
5. **Timezone handling** - All schedule times are local to community, convert to UTC for storage
