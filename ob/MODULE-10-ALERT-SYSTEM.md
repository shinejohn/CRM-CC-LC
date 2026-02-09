# Module 10: Alert System

## Overview

**Owner:** Agent 10
**Timeline:** Week 3-6 (parallel development)
**Dependencies:** Module 0, 0B, 12 (Subscriber Management)
**Depended On By:** Module 8 (Analytics)

The Alert System handles breaking news distribution - time-sensitive local news that needs to reach subscribers quickly. Unlike newsletters (scheduled, batch), alerts are event-driven and prioritized for speed. Alerts can be sponsored (revenue) and sent across multiple channels (email, SMS, push).

## Core Responsibilities

- Breaking news alert creation and approval
- Multi-channel dispatch (email, SMS, push)
- Geo-targeting and community targeting
- Sponsor integration for alerts
- Real-time delivery tracking
- Alert analytics and performance

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ALERT SYSTEM                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       ALERT CREATION                                     │   │
│  │                                                                          │   │
│  │   News Desk ──► Create Alert ──► Review/Approve ──► Ready to Send       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       TARGETING ENGINE                                   │   │
│  │                                                                          │   │
│  │   Communities ◄──► Geo-Fence ◄──► Preferences ◄──► Recipient List       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      MULTI-CHANNEL DISPATCHER                            │   │
│  │                                                                          │   │
│  │   ┌─────────┐     ┌─────────┐     ┌─────────┐                           │   │
│  │   │  EMAIL  │     │   SMS   │     │  PUSH   │                           │   │
│  │   │  (P1)   │     │  (P1)   │     │  (P1)   │                           │   │
│  │   └─────────┘     └─────────┘     └─────────┘                           │   │
│  │        │               │               │                                 │   │
│  │        └───────────────┴───────────────┘                                 │   │
│  │                        │                                                 │   │
│  │                        ▼                                                 │   │
│  │              Module 0B (Communication Infrastructure)                    │   │
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
-- ALERTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    
    -- Content
    headline VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    full_content TEXT,
    category VARCHAR(50) NOT NULL,  -- breaking, weather, traffic, crime, sports, politics, business
    severity VARCHAR(20) DEFAULT 'standard',  -- critical, urgent, standard
    
    -- Source
    source_url VARCHAR(500),  -- Link to full article
    source_name VARCHAR(100),
    
    -- Media
    image_url VARCHAR(500),
    
    -- Targeting
    target_type VARCHAR(20) NOT NULL,  -- all, communities, geo
    target_community_ids BIGINT[],
    target_geo_json JSONB,  -- GeoJSON for geo-fencing
    target_radius_miles INTEGER,  -- For point + radius targeting
    
    -- Channels
    send_email BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT TRUE,
    
    -- Sponsorship
    sponsor_id BIGINT REFERENCES sponsors(id),
    sponsorship_id BIGINT REFERENCES sponsorships(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- draft, pending_approval, approved, sending, sent, cancelled
    
    -- Approval workflow
    created_by BIGINT REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Send timing
    scheduled_for TIMESTAMP,  -- NULL = send immediately on approval
    sending_started_at TIMESTAMP,
    sending_completed_at TIMESTAMP,
    
    -- Stats (denormalized)
    total_recipients INTEGER DEFAULT 0,
    email_sent INTEGER DEFAULT 0,
    email_delivered INTEGER DEFAULT 0,
    email_opened INTEGER DEFAULT 0,
    sms_sent INTEGER DEFAULT 0,
    sms_delivered INTEGER DEFAULT 0,
    push_sent INTEGER DEFAULT 0,
    push_delivered INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON alerts (status, scheduled_for) WHERE status IN ('approved', 'sending');
CREATE INDEX idx_alerts_category ON alerts (category, created_at DESC);
CREATE INDEX idx_alerts_communities ON alerts USING GIN (target_community_ids) 
    WHERE target_type = 'communities';


-- ═══════════════════════════════════════════════════════════════════════════════
-- ALERT CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE alert_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Defaults
    default_severity VARCHAR(20) DEFAULT 'standard',
    default_send_sms BOOLEAN DEFAULT FALSE,
    
    -- Subscriber preferences
    allow_opt_out BOOLEAN DEFAULT TRUE,  -- Can subscribers opt out of this category?
    
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

-- Default categories
INSERT INTO alert_categories (slug, name, default_severity, default_send_sms, allow_opt_out) VALUES
    ('breaking', 'Breaking News', 'urgent', false, false),
    ('weather', 'Weather Alerts', 'standard', true, true),
    ('traffic', 'Traffic Updates', 'standard', false, true),
    ('crime', 'Crime & Safety', 'urgent', false, true),
    ('sports', 'Sports', 'standard', false, true),
    ('politics', 'Politics', 'standard', false, true),
    ('business', 'Business', 'standard', false, true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIBER ALERT PREFERENCES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriber_alert_preferences (
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    category_slug VARCHAR(50) NOT NULL REFERENCES alert_categories(slug),
    
    -- Channel preferences for this category
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (subscriber_id, category_slug)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- ALERT SENDS (Tracking per-recipient for analytics)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE alert_sends (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES alerts(id),
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id),
    
    -- Channels used
    email_sent BOOLEAN DEFAULT FALSE,
    email_message_id BIGINT,  -- Reference to message_queue
    sms_sent BOOLEAN DEFAULT FALSE,
    sms_message_id BIGINT,
    push_sent BOOLEAN DEFAULT FALSE,
    push_message_id BIGINT,
    
    -- Engagement
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_sends_alert ON alert_sends (alert_id);
CREATE INDEX idx_alert_sends_subscriber ON alert_sends (subscriber_id, created_at DESC);
```

---

## Service Interfaces

### AlertServiceInterface

```php
<?php

namespace App\Contracts\Alert;

interface AlertServiceInterface
{
    /**
     * Create a new alert
     */
    public function create(CreateAlertRequest $request): Alert;
    
    /**
     * Submit alert for approval
     */
    public function submitForApproval(int $alertId): Alert;
    
    /**
     * Approve alert (triggers send if not scheduled)
     */
    public function approve(int $alertId, int $approvedBy): Alert;
    
    /**
     * Send alert immediately
     */
    public function send(int $alertId): SendResult;
    
    /**
     * Cancel alert
     */
    public function cancel(int $alertId): bool;
    
    /**
     * Get recipient count estimate
     */
    public function estimateRecipients(int $alertId): int;
}
```

---

## Core Services

### AlertService

```php
<?php

namespace App\Services\Alert;

use App\Contracts\Alert\AlertServiceInterface;
use App\Contracts\Communication\MessageServiceInterface;
use App\Models\Alert\Alert;

class AlertService implements AlertServiceInterface
{
    public function __construct(
        private TargetingEngine $targeting,
        private MessageServiceInterface $messages,
        private SponsorService $sponsors,
    ) {}
    
    public function create(CreateAlertRequest $request): Alert
    {
        return Alert::create([
            'headline' => $request->headline,
            'summary' => $request->summary,
            'full_content' => $request->fullContent,
            'category' => $request->category,
            'severity' => $request->severity ?? $this->getDefaultSeverity($request->category),
            'source_url' => $request->sourceUrl,
            'image_url' => $request->imageUrl,
            'target_type' => $request->targetType,
            'target_community_ids' => $request->communityIds,
            'target_geo_json' => $request->geoJson,
            'send_email' => $request->sendEmail ?? true,
            'send_sms' => $request->sendSms ?? false,
            'send_push' => $request->sendPush ?? true,
            'scheduled_for' => $request->scheduledFor,
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);
    }
    
    public function approve(int $alertId, int $approvedBy): Alert
    {
        $alert = Alert::findOrFail($alertId);
        
        if ($alert->status !== 'pending_approval') {
            throw new InvalidStateException("Alert must be pending approval");
        }
        
        $alert->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
        
        // If not scheduled for later, send immediately
        if (!$alert->scheduled_for || $alert->scheduled_for <= now()) {
            dispatch(new SendAlert($alert->id));
        }
        
        return $alert->fresh();
    }
    
    public function send(int $alertId): SendResult
    {
        $alert = Alert::findOrFail($alertId);
        
        if (!in_array($alert->status, ['approved', 'sending'])) {
            throw new InvalidStateException("Alert must be approved before sending");
        }
        
        $alert->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        // Get recipients
        $recipients = $this->targeting->getRecipients($alert);
        $alert->update(['total_recipients' => count($recipients)]);
        
        // Track sends
        $sendRecords = [];
        
        // Group by channel
        $emailRecipients = [];
        $smsRecipients = [];
        $pushRecipients = [];
        
        foreach ($recipients as $recipient) {
            $sendRecord = [
                'alert_id' => $alert->id,
                'subscriber_id' => $recipient['id'],
                'created_at' => now(),
            ];
            
            // Check subscriber preferences for this category
            $prefs = $this->getSubscriberPreferences($recipient['id'], $alert->category);
            
            if ($alert->send_email && $prefs['email'] && $recipient['email']) {
                $emailRecipients[] = $recipient;
                $sendRecord['email_sent'] = true;
            }
            
            if ($alert->send_sms && $prefs['sms'] && $recipient['phone']) {
                $smsRecipients[] = $recipient;
                $sendRecord['sms_sent'] = true;
            }
            
            if ($alert->send_push && $prefs['push'] && !empty($recipient['device_tokens'])) {
                $pushRecipients[] = $recipient;
                $sendRecord['push_sent'] = true;
            }
            
            $sendRecords[] = $sendRecord;
        }
        
        // Bulk insert send records
        AlertSend::insert($sendRecords);
        
        // Send via each channel
        $results = [];
        
        if (!empty($emailRecipients)) {
            $results['email'] = $this->sendEmail($alert, $emailRecipients);
            $alert->increment('email_sent', $results['email']->queued);
        }
        
        if (!empty($smsRecipients)) {
            $results['sms'] = $this->sendSms($alert, $smsRecipients);
            $alert->increment('sms_sent', $results['sms']->queued);
        }
        
        if (!empty($pushRecipients)) {
            $results['push'] = $this->sendPush($alert, $pushRecipients);
            $alert->increment('push_sent', $results['push']->queued);
        }
        
        // Mark as sent
        $alert->update([
            'status' => 'sent',
            'sending_completed_at' => now(),
        ]);
        
        // Record sponsor impression if applicable
        if ($alert->sponsorship_id) {
            $this->sponsors->recordImpression(
                $alert->sponsorship_id, 
                count($emailRecipients) + count($pushRecipients)
            );
        }
        
        return new SendResult(
            success: true,
            email: $results['email'] ?? null,
            sms: $results['sms'] ?? null,
            push: $results['push'] ?? null,
        );
    }
    
    private function sendEmail(Alert $alert, array $recipients): BulkMessageResult
    {
        return $this->messages->sendBulk(new BulkMessageRequest(
            channel: 'email',
            priority: 'P1',  // Alerts are high priority
            messageType: 'alert',
            recipients: collect($recipients)->map(fn($r) => [
                'id' => $r['id'],
                'type' => 'subscriber',
                'address' => $r['email'],
                'data' => ['first_name' => $r['first_name']],
            ])->toArray(),
            subject: $this->buildSubject($alert),
            template: 'alert',
            sharedData: [
                'alert_id' => $alert->id,
                'headline' => $alert->headline,
                'summary' => $alert->summary,
                'image_url' => $alert->image_url,
                'source_url' => $alert->source_url,
                'category' => $alert->category,
                'sponsor' => $alert->sponsorship_id ? $this->getSponsorData($alert) : null,
            ],
            sourceType: 'alerts',
            sourceId: $alert->id,
            ipPool: 'alerts',
        ));
    }
    
    private function sendSms(Alert $alert, array $recipients): BulkMessageResult
    {
        // SMS is expensive - limit message length
        $message = $this->buildSmsMessage($alert);
        
        return $this->messages->sendBulk(new BulkMessageRequest(
            channel: 'sms',
            priority: 'P1',
            messageType: 'alert',
            recipients: collect($recipients)->map(fn($r) => [
                'id' => $r['id'],
                'type' => 'subscriber',
                'address' => $r['phone'],
            ])->toArray(),
            body: $message,
            sourceType: 'alerts',
            sourceId: $alert->id,
        ));
    }
    
    private function sendPush(Alert $alert, array $recipients): BulkMessageResult
    {
        return $this->messages->sendBulk(new BulkMessageRequest(
            channel: 'push',
            priority: 'P1',
            messageType: 'alert',
            recipients: collect($recipients)->flatMap(function ($r) {
                // Each subscriber may have multiple device tokens
                return collect($r['device_tokens'])->map(fn($token) => [
                    'id' => $r['id'],
                    'type' => 'subscriber',
                    'address' => $token,
                ]);
            })->toArray(),
            subject: $alert->headline,
            body: $alert->summary,
            sharedData: [
                'alert_id' => $alert->id,
                'category' => $alert->category,
                'url' => $alert->source_url,
                'image' => $alert->image_url,
            ],
            sourceType: 'alerts',
            sourceId: $alert->id,
        ));
    }
    
    private function buildSubject(Alert $alert): string
    {
        $prefix = match ($alert->severity) {
            'critical' => '🚨 BREAKING: ',
            'urgent' => '⚡ ALERT: ',
            default => '',
        };
        
        return $prefix . $alert->headline;
    }
    
    private function buildSmsMessage(Alert $alert): string
    {
        // SMS limited to 160 chars for single segment
        $message = "{$alert->headline}. {$alert->summary}";
        
        if (strlen($message) > 140) {
            $message = substr($alert->headline, 0, 100) . '...';
        }
        
        // Add link (short URL would be better)
        $message .= " " . $alert->source_url;
        
        return $message;
    }
    
    public function estimateRecipients(int $alertId): int
    {
        $alert = Alert::findOrFail($alertId);
        return $this->targeting->estimateCount($alert);
    }
}
```

### TargetingEngine

```php
<?php

namespace App\Services\Alert;

class TargetingEngine
{
    public function getRecipients(Alert $alert): array
    {
        $query = Subscriber::query()
            ->where('email_opted_in', true)
            ->orWhere('sms_opted_in', true)
            ->orWhereNotNull('device_tokens');
        
        // Apply targeting
        $query = match ($alert->target_type) {
            'all' => $query,
            'communities' => $this->filterByCommunities($query, $alert->target_community_ids),
            'geo' => $this->filterByGeo($query, $alert),
            default => throw new InvalidTargetTypeException($alert->target_type),
        };
        
        // Filter by category preferences (unless category doesn't allow opt-out)
        $category = AlertCategory::where('slug', $alert->category)->first();
        if ($category && $category->allow_opt_out) {
            $query = $this->filterByPreferences($query, $alert->category);
        }
        
        return $query->get()->map(fn($s) => [
            'id' => $s->id,
            'email' => $s->email,
            'phone' => $s->phone,
            'device_tokens' => $s->device_tokens ?? [],
            'first_name' => $s->first_name,
        ])->toArray();
    }
    
    private function filterByCommunities($query, array $communityIds)
    {
        return $query->whereHas('communities', function ($q) use ($communityIds) {
            $q->whereIn('community_id', $communityIds);
        });
    }
    
    private function filterByGeo($query, Alert $alert)
    {
        if ($alert->target_geo_json) {
            // PostGIS query for GeoJSON polygon
            return $query->whereRaw(
                "ST_Contains(ST_GeomFromGeoJSON(?), location)",
                [json_encode($alert->target_geo_json)]
            );
        }
        
        return $query;
    }
    
    private function filterByPreferences($query, string $category)
    {
        // Exclude subscribers who have explicitly disabled this category
        return $query->whereDoesntHave('alertPreferences', function ($q) use ($category) {
            $q->where('category_slug', $category)
              ->where('email_enabled', false)
              ->where('sms_enabled', false)
              ->where('push_enabled', false);
        });
    }
    
    public function estimateCount(Alert $alert): int
    {
        // Same logic as getRecipients but just count
        return $this->getRecipients($alert);  // TODO: Optimize to count query
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
    // Process scheduled alerts
    $schedule->job(new ProcessScheduledAlerts)->everyMinute();
    
    // Update alert stats from delivery events
    $schedule->job(new UpdateAlertStats)->everyFiveMinutes();
    
    // Clean up old alert_sends records (keep 90 days)
    $schedule->job(new CleanupAlertSends)->dailyAt('03:00');
}
```

### ProcessScheduledAlerts

```php
<?php

namespace App\Jobs\Alert;

class ProcessScheduledAlerts implements ShouldQueue
{
    public function handle(AlertService $alerts)
    {
        $pendingAlerts = Alert::where('status', 'approved')
            ->where('scheduled_for', '<=', now())
            ->get();
        
        foreach ($pendingAlerts as $alert) {
            dispatch(new SendAlert($alert->id));
        }
    }
}
```

---

## API Endpoints

```php
<?php
// routes/api.php

Route::prefix('v1/alerts')->middleware('auth:sanctum')->group(function () {
    // Alert CRUD
    Route::get('/', [AlertController::class, 'index']);
    Route::post('/', [AlertController::class, 'create']);
    Route::get('/{id}', [AlertController::class, 'show']);
    Route::put('/{id}', [AlertController::class, 'update']);
    Route::delete('/{id}', [AlertController::class, 'destroy']);
    
    // Alert workflow
    Route::post('/{id}/submit', [AlertController::class, 'submitForApproval']);
    Route::post('/{id}/approve', [AlertController::class, 'approve']);
    Route::post('/{id}/send', [AlertController::class, 'send']);
    Route::post('/{id}/cancel', [AlertController::class, 'cancel']);
    
    // Targeting
    Route::get('/{id}/estimate', [AlertController::class, 'estimateRecipients']);
    Route::post('/{id}/test-send', [AlertController::class, 'testSend']);
    
    // Stats
    Route::get('/{id}/stats', [AlertController::class, 'stats']);
    
    // Categories
    Route::get('/categories', [AlertCategoryController::class, 'index']);
});

// Subscriber preferences (for subscribers to manage)
Route::prefix('v1/subscriber/alerts')->middleware('auth:subscriber')->group(function () {
    Route::get('/preferences', [SubscriberAlertController::class, 'getPreferences']);
    Route::put('/preferences', [SubscriberAlertController::class, 'updatePreferences']);
});

// Public tracking
Route::get('/alert/track/open/{uuid}', [AlertTrackingController::class, 'open']);
Route::get('/alert/track/click/{uuid}', [AlertTrackingController::class, 'click']);
```

---

## Events

### Emitted Events

```php
AlertCreated::class
AlertSubmittedForApproval::class
AlertApproved::class
AlertSendStarted::class
AlertSendCompleted::class
AlertCancelled::class
AlertOpened::class
AlertClicked::class
```

### Listened Events

```php
// From Module 0B
MessageDelivered::class  // Update delivery counts
MessageOpened::class     // Update open counts, mark AlertSend
MessageClicked::class    // Update click counts, mark AlertSend
```

---

## Configuration

```php
<?php
// config/alerts.php

return [
    'approval_required' => env('ALERTS_APPROVAL_REQUIRED', true),
    
    'defaults' => [
        'send_email' => true,
        'send_sms' => false,
        'send_push' => true,
    ],
    
    'sms' => [
        'enabled' => env('ALERTS_SMS_ENABLED', true),
        'max_length' => 160,
        'require_severity' => 'critical',  // Only send SMS for critical+ by default
    ],
    
    'rate_limits' => [
        'max_per_hour' => 10,      // Max alerts per hour per community
        'max_per_day' => 50,       // Max alerts per day per community
        'subscriber_cooldown' => 300,  // Min seconds between alerts to same subscriber
    ],
];
```

---

## Acceptance Criteria

### Must Have
- [ ] Alert creation with targeting (all, communities)
- [ ] Approval workflow
- [ ] Multi-channel dispatch (email, push)
- [ ] Send through Communication Infrastructure (P1 priority)
- [ ] Basic stats (sent, delivered, opened, clicked)
- [ ] Category-based subscriber preferences

### Should Have
- [ ] SMS channel support
- [ ] Geo-targeting
- [ ] Scheduled alerts
- [ ] Sponsor integration
- [ ] Rate limiting per subscriber

### Nice to Have
- [ ] AI-powered urgency detection
- [ ] A/B testing headlines
- [ ] Rich push notifications with images

---

## Notes for Agent

1. **Alerts are P1 priority** - Must send quickly, use 'alerts' IP pool
2. **SMS is expensive** - Only enable for high-severity by default
3. **Respect preferences** - Always check subscriber category preferences
4. **Rate limit** - Don't spam subscribers with too many alerts
5. **Breaking news categories can't be opted out** - Some alerts are mandatory
