# Module 12: Subscriber Management

## Overview

**Owner:** Agent 12
**Timeline:** Week 3-5 (parallel development)
**Dependencies:** Module 0 (Core Infrastructure)
**Depended On By:** Module 9 (Newsletter), Module 10 (Alert), Module 11 (Emergency)

The Subscriber Management module handles the B2C side of the platform - people who subscribe to receive newsletters, alerts, and emergency broadcasts. This is separate from the SMB database (Module 1) and serves as the audience for all consumer-facing communications.

## Core Responsibilities

- Subscriber registration and authentication
- Community subscriptions (which communities they follow)
- Channel preferences (email, SMS, push)
- Newsletter frequency preferences
- Alert category opt-ins/opt-outs
- Device token management (push notifications)
- Unsubscribe handling
- List hygiene (bounce management, engagement tracking)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIBER MANAGEMENT                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      SUBSCRIBER REGISTRATION                             │   │
│  │                                                                          │   │
│  │   Email Signup ──► Verification ──► Community Selection ──► Preferences │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      PREFERENCE CENTER                                   │   │
│  │                                                                          │   │
│  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │   │   Communities   │  │    Channels     │  │   Alert Cats    │        │   │
│  │   │   (follow)      │  │  (email/sms/    │  │   (breaking,    │        │   │
│  │   │                 │  │   push)         │  │    weather...)  │        │   │
│  │   └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      LIST MANAGEMENT                                     │   │
│  │                                                                          │   │
│  │   Compiled Lists ──► Hygiene ──► Engagement Scoring ──► Segmentation   │   │
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
-- SUBSCRIBERS (B2C Users)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscribers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    
    -- Identity
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    phone VARCHAR(50),
    phone_verified_at TIMESTAMP,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    zip_code VARCHAR(20),
    
    -- Location (for geo-targeting)
    location GEOGRAPHY(POINT, 4326),  -- PostGIS point
    location_source VARCHAR(20),  -- ip, manual, gps
    
    -- Channel opt-ins
    email_opted_in BOOLEAN DEFAULT TRUE,
    email_opted_in_at TIMESTAMP,
    sms_opted_in BOOLEAN DEFAULT FALSE,
    sms_opted_in_at TIMESTAMP,
    push_opted_in BOOLEAN DEFAULT FALSE,
    
    -- Newsletter preferences
    newsletter_frequency VARCHAR(20) DEFAULT 'daily',  -- daily, weekly, none
    
    -- Alert preferences (default all on)
    alerts_enabled BOOLEAN DEFAULT TRUE,
    
    -- Push notification tokens (array for multiple devices)
    device_tokens JSONB DEFAULT '[]',
    
    -- Engagement tracking
    last_email_sent_at TIMESTAMP,
    last_email_opened_at TIMESTAMP,
    last_email_clicked_at TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Engagement score (0-100, calculated)
    engagement_score INTEGER DEFAULT 50,
    engagement_calculated_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- pending, active, unsubscribed, bounced, complained
    unsubscribed_at TIMESTAMP,
    unsubscribe_reason VARCHAR(255),
    
    -- Authentication
    password_hash VARCHAR(255),
    remember_token VARCHAR(100),
    
    -- Source tracking
    source VARCHAR(50),  -- website, app, import, api
    source_detail VARCHAR(255),  -- Campaign ID, referrer, etc.
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers (email);
CREATE INDEX idx_subscribers_phone ON subscribers (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_subscribers_status ON subscribers (status) WHERE status = 'active';
CREATE INDEX idx_subscribers_location ON subscribers USING GIST (location);
CREATE INDEX idx_subscribers_engagement ON subscribers (engagement_score DESC) WHERE status = 'active';


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIBER COMMUNITIES (Many-to-Many)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriber_communities (
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    
    -- Subscription details
    subscribed_at TIMESTAMP DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE,  -- Their "home" community
    
    -- Notification preferences for this community
    newsletters_enabled BOOLEAN DEFAULT TRUE,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    
    PRIMARY KEY (subscriber_id, community_id)
);

CREATE INDEX idx_sub_comm_community ON subscriber_communities (community_id);
CREATE INDEX idx_sub_comm_subscriber ON subscriber_communities (subscriber_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIBER ALERT PREFERENCES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriber_alert_preferences (
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    category_slug VARCHAR(50) NOT NULL,  -- breaking, weather, traffic, etc.
    
    -- Channel preferences for this category
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (subscriber_id, category_slug)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMUNITY EMAIL LISTS (Pre-compiled for fast sending)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE community_email_lists (
    community_id BIGINT PRIMARY KEY REFERENCES communities(id),
    
    -- Pre-compiled email arrays (rebuilt nightly or on significant changes)
    daily_newsletter_emails TEXT[],      -- Subscribers who want daily
    weekly_newsletter_emails TEXT[],     -- Subscribers who want weekly (includes daily)
    alert_emails TEXT[],                 -- Subscribers who want alerts
    emergency_emails TEXT[],             -- ALL subscribers (no opt-out)
    
    -- Counts
    daily_count INTEGER DEFAULT 0,
    weekly_count INTEGER DEFAULT 0,
    alert_count INTEGER DEFAULT 0,
    emergency_count INTEGER DEFAULT 0,
    
    compiled_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMUNITY SMS LISTS (Pre-compiled)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE community_sms_lists (
    community_id BIGINT PRIMARY KEY REFERENCES communities(id),
    
    alert_phones TEXT[],      -- Subscribers opted into SMS alerts
    emergency_phones TEXT[],  -- ALL subscribers with phones
    
    alert_count INTEGER DEFAULT 0,
    emergency_count INTEGER DEFAULT 0,
    
    compiled_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- EMAIL VERIFICATION TOKENS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE email_verifications (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    
    token VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,  -- Email being verified (may differ from current)
    
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verify_token ON email_verifications (token) WHERE verified_at IS NULL;


-- ═══════════════════════════════════════════════════════════════════════════════
-- UNSUBSCRIBE TOKENS (One-click unsubscribe)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE unsubscribe_tokens (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    
    token VARCHAR(100) UNIQUE NOT NULL,
    
    -- Scope
    scope VARCHAR(50) NOT NULL,  -- all, community, newsletter, alerts
    scope_id BIGINT,  -- community_id if scope is community
    
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP
);

CREATE INDEX idx_unsub_token ON unsubscribe_tokens (token);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIBER EVENTS (Activity Log)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriber_events (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id BIGINT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,  -- signup, verify, login, open, click, unsubscribe
    event_data JSONB,
    
    -- Context
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sub_events_subscriber ON subscriber_events (subscriber_id, created_at DESC);
CREATE INDEX idx_sub_events_type ON subscriber_events (event_type, created_at DESC);
```

---

## Service Interfaces

### SubscriberServiceInterface

```php
<?php

namespace App\Contracts\Subscriber;

interface SubscriberServiceInterface
{
    /**
     * Register new subscriber
     */
    public function register(RegisterRequest $request): Subscriber;
    
    /**
     * Verify email address
     */
    public function verifyEmail(string $token): Subscriber;
    
    /**
     * Update subscriber profile
     */
    public function updateProfile(int $subscriberId, UpdateProfileRequest $request): Subscriber;
    
    /**
     * Update channel preferences
     */
    public function updatePreferences(int $subscriberId, PreferencesRequest $request): Subscriber;
    
    /**
     * Subscribe to community
     */
    public function subscribeToCommunity(int $subscriberId, int $communityId): void;
    
    /**
     * Unsubscribe from community
     */
    public function unsubscribeFromCommunity(int $subscriberId, int $communityId): void;
    
    /**
     * Handle one-click unsubscribe
     */
    public function unsubscribe(string $token): UnsubscribeResult;
    
    /**
     * Get subscriber with all preferences
     */
    public function getWithPreferences(int $subscriberId): Subscriber;
}
```

### ListServiceInterface

```php
<?php

namespace App\Contracts\Subscriber;

interface ListServiceInterface
{
    /**
     * Get subscribers for newsletter send
     */
    public function getNewsletterRecipients(int $communityId, string $frequency): array;
    
    /**
     * Get subscribers for alert send
     */
    public function getAlertRecipients(int $communityId, string $category): array;
    
    /**
     * Get subscribers for emergency broadcast
     */
    public function getEmergencyRecipients(array $communityIds): array;
    
    /**
     * Compile and cache community lists
     */
    public function compileLists(int $communityId): void;
    
    /**
     * Compile all community lists
     */
    public function compileAllLists(): void;
}
```

---

## Core Services

### SubscriberService

```php
<?php

namespace App\Services\Subscriber;

use App\Contracts\Subscriber\SubscriberServiceInterface;
use App\Models\Subscriber\Subscriber;
use App\Events\Subscriber\SubscriberRegistered;
use App\Events\Subscriber\SubscriberVerified;
use Illuminate\Support\Str;

class SubscriberService implements SubscriberServiceInterface
{
    public function register(RegisterRequest $request): Subscriber
    {
        // Check for existing subscriber
        $existing = Subscriber::where('email', $request->email)->first();
        
        if ($existing) {
            if ($existing->status === 'active') {
                throw new DuplicateSubscriberException("Email already subscribed");
            }
            
            // Reactivate if previously unsubscribed
            if ($existing->status === 'unsubscribed') {
                $existing->update([
                    'status' => 'pending',
                    'unsubscribed_at' => null,
                ]);
                $this->sendVerificationEmail($existing);
                return $existing;
            }
        }
        
        // Create new subscriber
        $subscriber = Subscriber::create([
            'email' => $request->email,
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'phone' => $request->phone,
            'zip_code' => $request->zipCode,
            'newsletter_frequency' => $request->newsletterFrequency ?? 'daily',
            'source' => $request->source ?? 'website',
            'source_detail' => $request->sourceDetail,
            'status' => 'pending',
        ]);
        
        // Subscribe to communities
        if (!empty($request->communityIds)) {
            foreach ($request->communityIds as $index => $communityId) {
                $subscriber->communities()->attach($communityId, [
                    'is_primary' => $index === 0,
                    'subscribed_at' => now(),
                ]);
            }
        }
        
        // Set default alert preferences (all enabled)
        $this->setDefaultAlertPreferences($subscriber);
        
        // Send verification email
        $this->sendVerificationEmail($subscriber);
        
        // Log event
        $this->logEvent($subscriber, 'signup', [
            'communities' => $request->communityIds,
        ]);
        
        event(new SubscriberRegistered($subscriber));
        
        return $subscriber;
    }
    
    public function verifyEmail(string $token): Subscriber
    {
        $verification = EmailVerification::where('token', $token)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();
        
        if (!$verification) {
            throw new InvalidTokenException("Invalid or expired verification token");
        }
        
        $subscriber = $verification->subscriber;
        
        // Update subscriber
        $subscriber->update([
            'email' => $verification->email,
            'email_verified_at' => now(),
            'email_opted_in' => true,
            'email_opted_in_at' => now(),
            'status' => 'active',
        ]);
        
        // Mark token as used
        $verification->update(['verified_at' => now()]);
        
        // Log event
        $this->logEvent($subscriber, 'verify');
        
        event(new SubscriberVerified($subscriber));
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return $subscriber;
    }
    
    public function updatePreferences(int $subscriberId, PreferencesRequest $request): Subscriber
    {
        $subscriber = Subscriber::findOrFail($subscriberId);
        
        $updates = [];
        
        // Channel preferences
        if (isset($request->emailOptedIn)) {
            $updates['email_opted_in'] = $request->emailOptedIn;
            if ($request->emailOptedIn) {
                $updates['email_opted_in_at'] = now();
            }
        }
        
        if (isset($request->smsOptedIn)) {
            $updates['sms_opted_in'] = $request->smsOptedIn;
            if ($request->smsOptedIn) {
                $updates['sms_opted_in_at'] = now();
            }
        }
        
        // Newsletter frequency
        if (isset($request->newsletterFrequency)) {
            $updates['newsletter_frequency'] = $request->newsletterFrequency;
        }
        
        // Alerts
        if (isset($request->alertsEnabled)) {
            $updates['alerts_enabled'] = $request->alertsEnabled;
        }
        
        $subscriber->update($updates);
        
        // Update alert category preferences
        if (!empty($request->alertPreferences)) {
            foreach ($request->alertPreferences as $category => $prefs) {
                SubscriberAlertPreference::updateOrCreate(
                    [
                        'subscriber_id' => $subscriber->id,
                        'category_slug' => $category,
                    ],
                    [
                        'email_enabled' => $prefs['email'] ?? true,
                        'sms_enabled' => $prefs['sms'] ?? false,
                        'push_enabled' => $prefs['push'] ?? true,
                    ]
                );
            }
        }
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return $subscriber->fresh();
    }
    
    public function unsubscribe(string $token): UnsubscribeResult
    {
        $unsubToken = UnsubscribeToken::where('token', $token)
            ->whereNull('used_at')
            ->first();
        
        if (!$unsubToken) {
            throw new InvalidTokenException("Invalid unsubscribe token");
        }
        
        $subscriber = $unsubToken->subscriber;
        
        switch ($unsubToken->scope) {
            case 'all':
                // Full unsubscribe
                $subscriber->update([
                    'email_opted_in' => false,
                    'sms_opted_in' => false,
                    'push_opted_in' => false,
                    'status' => 'unsubscribed',
                    'unsubscribed_at' => now(),
                ]);
                break;
                
            case 'community':
                // Unsubscribe from specific community
                $subscriber->communities()
                    ->updateExistingPivot($unsubToken->scope_id, [
                        'newsletters_enabled' => false,
                        'alerts_enabled' => false,
                    ]);
                break;
                
            case 'newsletter':
                $subscriber->update(['newsletter_frequency' => 'none']);
                break;
                
            case 'alerts':
                $subscriber->update(['alerts_enabled' => false]);
                break;
        }
        
        // Mark token as used
        $unsubToken->update(['used_at' => now()]);
        
        // Log event
        $this->logEvent($subscriber, 'unsubscribe', [
            'scope' => $unsubToken->scope,
            'scope_id' => $unsubToken->scope_id,
        ]);
        
        // Trigger list recompilation
        dispatch(new RecompileSubscriberLists($subscriber->id));
        
        return new UnsubscribeResult(
            success: true,
            scope: $unsubToken->scope,
            message: $this->getUnsubscribeMessage($unsubToken->scope),
        );
    }
    
    private function sendVerificationEmail(Subscriber $subscriber): void
    {
        $token = Str::random(64);
        
        EmailVerification::create([
            'subscriber_id' => $subscriber->id,
            'token' => $token,
            'email' => $subscriber->email,
            'expires_at' => now()->addHours(24),
        ]);
        
        // Send via Communication Infrastructure
        app(MessageServiceInterface::class)->send(new MessageRequest(
            channel: 'email',
            priority: 'P4',
            messageType: 'transactional',
            recipientAddress: $subscriber->email,
            template: 'subscriber_verification',
            subject: 'Verify your email to complete signup',
            data: [
                'first_name' => $subscriber->first_name,
                'verification_url' => route('subscriber.verify', ['token' => $token]),
            ],
            ipPool: 'transactional',
        ));
    }
    
    private function setDefaultAlertPreferences(Subscriber $subscriber): void
    {
        $categories = AlertCategory::where('allow_opt_out', true)->pluck('slug');
        
        foreach ($categories as $category) {
            SubscriberAlertPreference::create([
                'subscriber_id' => $subscriber->id,
                'category_slug' => $category,
                'email_enabled' => true,
                'sms_enabled' => false,
                'push_enabled' => true,
            ]);
        }
    }
    
    private function logEvent(Subscriber $subscriber, string $type, array $data = []): void
    {
        SubscriberEvent::create([
            'subscriber_id' => $subscriber->id,
            'event_type' => $type,
            'event_data' => $data,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
```

### ListService

```php
<?php

namespace App\Services\Subscriber;

use App\Contracts\Subscriber\ListServiceInterface;

class ListService implements ListServiceInterface
{
    public function getNewsletterRecipients(int $communityId, string $frequency): array
    {
        // Try cached list first
        $cached = CommunityEmailList::find($communityId);
        
        if ($cached && $cached->compiled_at > now()->subHours(1)) {
            return $frequency === 'daily' 
                ? $cached->daily_newsletter_emails 
                : $cached->weekly_newsletter_emails;
        }
        
        // Fall back to query
        return $this->queryNewsletterRecipients($communityId, $frequency);
    }
    
    public function getAlertRecipients(int $communityId, string $category): array
    {
        return Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->leftJoin('subscriber_alert_preferences', function ($join) use ($category) {
                $join->on('subscribers.id', '=', 'subscriber_alert_preferences.subscriber_id')
                     ->where('subscriber_alert_preferences.category_slug', '=', $category);
            })
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.alerts_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.alerts_enabled', true)
            ->where(function ($q) {
                // Email recipients
                $q->where(function ($q2) {
                    $q2->where('subscribers.email_opted_in', true)
                       ->where(function ($q3) {
                           $q3->whereNull('subscriber_alert_preferences.email_enabled')
                              ->orWhere('subscriber_alert_preferences.email_enabled', true);
                       });
                });
            })
            ->select([
                'subscribers.id',
                'subscribers.email',
                'subscribers.phone',
                'subscribers.device_tokens',
                'subscribers.first_name',
                'subscriber_alert_preferences.email_enabled',
                'subscriber_alert_preferences.sms_enabled',
                'subscriber_alert_preferences.push_enabled',
            ])
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email_enabled !== false ? $s->email : null,
                'phone' => $s->sms_enabled ? $s->phone : null,
                'device_tokens' => $s->push_enabled !== false ? ($s->device_tokens ?? []) : [],
                'first_name' => $s->first_name,
            ])
            ->toArray();
    }
    
    public function getEmergencyRecipients(array $communityIds): array
    {
        // Emergency broadcasts go to EVERYONE - no preference filtering
        return Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->whereIn('subscriber_communities.community_id', $communityIds)
            ->where('subscribers.status', 'active')
            ->select([
                'subscribers.id',
                'subscribers.email',
                'subscribers.phone',
                'subscribers.device_tokens',
                'subscribers.first_name',
            ])
            ->distinct()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email,
                'phone' => $s->phone,
                'device_tokens' => $s->device_tokens ?? [],
                'first_name' => $s->first_name,
            ])
            ->toArray();
    }
    
    public function compileLists(int $communityId): void
    {
        // Daily newsletter subscribers
        $daily = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.newsletters_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.newsletter_frequency', 'daily')
            ->pluck('subscribers.email')
            ->toArray();
        
        // Weekly newsletter subscribers (includes daily)
        $weekly = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.newsletters_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->whereIn('subscribers.newsletter_frequency', ['daily', 'weekly'])
            ->pluck('subscribers.email')
            ->toArray();
        
        // Alert subscribers
        $alerts = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.alerts_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.alerts_enabled', true)
            ->pluck('subscribers.email')
            ->toArray();
        
        // Emergency subscribers (all active)
        $emergency = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->pluck('subscribers.email')
            ->toArray();
        
        // Update or create list
        CommunityEmailList::updateOrCreate(
            ['community_id' => $communityId],
            [
                'daily_newsletter_emails' => $daily,
                'weekly_newsletter_emails' => $weekly,
                'alert_emails' => $alerts,
                'emergency_emails' => $emergency,
                'daily_count' => count($daily),
                'weekly_count' => count($weekly),
                'alert_count' => count($alerts),
                'emergency_count' => count($emergency),
                'compiled_at' => now(),
            ]
        );
        
        // Compile SMS lists too
        $alertPhones = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->where('subscribers.sms_opted_in', true)
            ->where('subscribers.alerts_enabled', true)
            ->whereNotNull('subscribers.phone')
            ->pluck('subscribers.phone')
            ->toArray();
        
        $emergencyPhones = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->whereNotNull('subscribers.phone')
            ->pluck('subscribers.phone')
            ->toArray();
        
        CommunitySmsLists::updateOrCreate(
            ['community_id' => $communityId],
            [
                'alert_phones' => $alertPhones,
                'emergency_phones' => $emergencyPhones,
                'alert_count' => count($alertPhones),
                'emergency_count' => count($emergencyPhones),
                'compiled_at' => now(),
            ]
        );
    }
    
    public function compileAllLists(): void
    {
        $communities = Community::where('is_active', true)->pluck('id');
        
        foreach ($communities as $communityId) {
            $this->compileLists($communityId);
        }
    }
}
```

### EngagementService

```php
<?php

namespace App\Services\Subscriber;

class EngagementService
{
    /**
     * Calculate engagement score for subscriber
     * Score 0-100 based on recent activity
     */
    public function calculateScore(Subscriber $subscriber): int
    {
        $score = 50; // Base score
        
        // Email engagement (last 30 days)
        $recentOpens = $this->getRecentOpens($subscriber->id, 30);
        $recentClicks = $this->getRecentClicks($subscriber->id, 30);
        $recentSends = $this->getRecentSends($subscriber->id, 30);
        
        if ($recentSends > 0) {
            $openRate = $recentOpens / $recentSends;
            $clickRate = $recentClicks / $recentSends;
            
            // Open rate contribution (max +25)
            $score += min(25, $openRate * 50);
            
            // Click rate contribution (max +25)
            $score += min(25, $clickRate * 100);
        }
        
        // Recency bonus
        if ($subscriber->last_email_opened_at) {
            $daysSinceOpen = $subscriber->last_email_opened_at->diffInDays(now());
            if ($daysSinceOpen < 7) {
                $score += 10;
            } elseif ($daysSinceOpen < 30) {
                $score += 5;
            } elseif ($daysSinceOpen > 90) {
                $score -= 15;
            }
        }
        
        // Login bonus
        if ($subscriber->last_login_at && $subscriber->last_login_at->diffInDays(now()) < 30) {
            $score += 10;
        }
        
        // Tenure bonus (longer = more valuable)
        $monthsSubscribed = $subscriber->created_at->diffInMonths(now());
        $score += min(10, $monthsSubscribed);
        
        // Cap at 0-100
        return max(0, min(100, $score));
    }
    
    /**
     * Update all subscriber engagement scores
     */
    public function updateAllScores(): void
    {
        Subscriber::where('status', 'active')
            ->chunk(1000, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    $score = $this->calculateScore($subscriber);
                    $subscriber->update([
                        'engagement_score' => $score,
                        'engagement_calculated_at' => now(),
                    ]);
                }
            });
    }
    
    /**
     * Identify disengaged subscribers for re-engagement or cleanup
     */
    public function getDisengaged(int $daysSinceActivity = 90): Collection
    {
        return Subscriber::where('status', 'active')
            ->where('engagement_score', '<', 20)
            ->where(function ($q) use ($daysSinceActivity) {
                $q->whereNull('last_email_opened_at')
                  ->orWhere('last_email_opened_at', '<', now()->subDays($daysSinceActivity));
            })
            ->get();
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
    // Compile email lists nightly
    $schedule->job(new CompileAllEmailLists)->dailyAt('02:00');
    
    // Update engagement scores weekly
    $schedule->job(new UpdateEngagementScores)->weeklyOn(1, '03:00');
    
    // Clean up expired verification tokens
    $schedule->job(new CleanupExpiredTokens)->dailyAt('04:00');
    
    // Process bounces and update subscriber status
    $schedule->job(new ProcessBounces)->everyFifteenMinutes();
    
    // Send re-engagement campaign to disengaged subscribers
    $schedule->job(new SendReengagementCampaign)->monthlyOn(1, '10:00');
}
```

---

## API Endpoints

```php
<?php
// routes/api.php

// Public subscription endpoints
Route::prefix('v1/subscribe')->group(function () {
    Route::post('/', [SubscriptionController::class, 'register']);
    Route::get('/verify/{token}', [SubscriptionController::class, 'verify']);
    Route::get('/unsubscribe/{token}', [SubscriptionController::class, 'unsubscribe']);
});

// Authenticated subscriber endpoints
Route::prefix('v1/subscriber')->middleware('auth:subscriber')->group(function () {
    // Profile
    Route::get('/profile', [SubscriberController::class, 'profile']);
    Route::put('/profile', [SubscriberController::class, 'updateProfile']);
    
    // Preferences
    Route::get('/preferences', [SubscriberController::class, 'getPreferences']);
    Route::put('/preferences', [SubscriberController::class, 'updatePreferences']);
    
    // Communities
    Route::get('/communities', [SubscriberController::class, 'getCommunities']);
    Route::post('/communities/{id}', [SubscriberController::class, 'subscribeToCommunity']);
    Route::delete('/communities/{id}', [SubscriberController::class, 'unsubscribeFromCommunity']);
    
    // Alert preferences
    Route::get('/alerts/preferences', [SubscriberController::class, 'getAlertPreferences']);
    Route::put('/alerts/preferences', [SubscriberController::class, 'updateAlertPreferences']);
    
    // Device tokens (for push)
    Route::post('/devices', [SubscriberController::class, 'registerDevice']);
    Route::delete('/devices/{token}', [SubscriberController::class, 'unregisterDevice']);
});

// Admin endpoints
Route::prefix('v1/admin/subscribers')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [AdminSubscriberController::class, 'index']);
    Route::get('/stats', [AdminSubscriberController::class, 'stats']);
    Route::get('/export', [AdminSubscriberController::class, 'export']);
    Route::get('/{id}', [AdminSubscriberController::class, 'show']);
    Route::put('/{id}/status', [AdminSubscriberController::class, 'updateStatus']);
});
```

---

## Events

### Emitted Events

```php
SubscriberRegistered::class
SubscriberVerified::class
SubscriberUpdated::class
SubscriberUnsubscribed::class
SubscriberReactivated::class
SubscriberBounced::class
CommunitySubscribed::class
CommunityUnsubscribed::class
DeviceRegistered::class
```

### Listened Events

```php
// From Module 0B (Communication Infrastructure)
MessageDelivered::class    // Update last_email_sent_at
MessageOpened::class       // Update last_email_opened_at
MessageClicked::class      // Update last_email_clicked_at
MessageBounced::class      // Handle bounce
MessageComplained::class   // Handle spam complaint
```

---

## Configuration

```php
<?php
// config/subscribers.php

return [
    'verification' => [
        'required' => true,
        'expires_hours' => 24,
    ],
    
    'defaults' => [
        'newsletter_frequency' => 'daily',
        'alerts_enabled' => true,
        'email_opted_in' => true,
        'sms_opted_in' => false,
    ],
    
    'engagement' => [
        'score_refresh_days' => 7,
        'disengaged_threshold' => 20,
        'disengaged_days' => 90,
    ],
    
    'lists' => [
        'compile_frequency' => 'daily',
        'cache_hours' => 1,
    ],
    
    'cleanup' => [
        'unverified_days' => 7,      // Delete unverified after 7 days
        'bounced_reactivate_days' => 30,  // Allow bounce reactivation after 30 days
    ],
];
```

---

## Scope and Boundaries

### In Scope

- B2C subscriber identity, preferences, and authentication.
- Community subscription membership and per-community notification preferences.
- Channel opt-ins (email, SMS, push) with one-click unsubscribe tokens.
- Alert category preferences and default alert opt-ins.
- Device token registration and hygiene for push notifications.
- Engagement tracking, scoring, and list hygiene (bounces/complaints).
- Pre-compiled lists for newsletter, alert, and emergency delivery.

### Out of Scope

- SMB/business contacts and CRM data (Module 1).
- Message rendering, delivery, and bounce webhooks (Module 0B/0C).
- Preference center UI/UX (tracked as a future deliverable).

---

## Domain Model and Relationships

- **Subscriber** has many **Communities** (through `subscriber_communities`).
- **Subscriber** has many **Alert Preferences** (by alert category slug).
- **Subscriber** has many **Events** (activity log).
- **Subscriber** has many **Email Verifications** and **Unsubscribe Tokens**.
- **Community** is owned by Module 0 and referenced by this module.

Key invariants:
- Email is unique and required for registration; unverified emails are never used for send lists.
- A subscriber can belong to multiple communities with a single `is_primary` community.
- Emergency communications include all active subscribers regardless of opt-out.

---

## Lifecycle Flows

### Registration and Verification

1. Create subscriber in `pending` status with requested communities.
2. Create email verification token and send transactional email.
3. On verification:
   - Mark email verified.
   - Set `status=active`, `email_opted_in=true`.
   - Log verification event.
   - Trigger list recompilation for affected communities.

### Preference Updates

- Channel opt-ins update `*_opted_in` and `*_opted_in_at`.
- Newsletter frequency updates `newsletter_frequency`.
- Alert preferences update `subscriber_alert_preferences` by category.
- Any preference change triggers list recompilation.

### Unsubscribe (One-click)

- Token scope supports:
  - `all` (global unsubscribe + status update),
  - `community` (disable newsletters/alerts for community),
  - `newsletter` (set frequency to `none`),
  - `alerts` (disable alerts).
- Token is single-use and recorded in activity log.

### Bounce and Complaint Handling

- Bounce/complaint events from Module 0B mark status:
  - `bounced` for hard bounces.
  - `complained` for spam complaints.
- Status updates remove subscriber from all compiled lists.
- Reactivation path requires re-verification after `bounced_reactivate_days`.

---

## API Contracts (High-Level)

### Public

- `POST /v1/subscribe`
  - Body: `email`, optional `first_name`, `last_name`, `phone`, `zip_code`,
    `community_ids[]`, `newsletter_frequency`, `source`, `source_detail`.
  - Returns: subscriber summary + verification required flag.

- `GET /v1/subscribe/verify/{token}`
  - Activates subscriber, returns subscriber summary.

- `GET /v1/subscribe/unsubscribe/{token}`
  - Executes scoped unsubscribe, returns confirmation message.

### Authenticated Subscriber

- `GET /v1/subscriber/profile`
- `PUT /v1/subscriber/profile`
- `GET /v1/subscriber/preferences`
- `PUT /v1/subscriber/preferences`
- `GET /v1/subscriber/communities`
- `POST /v1/subscriber/communities/{id}`
- `DELETE /v1/subscriber/communities/{id}`
- `GET /v1/subscriber/alerts/preferences`
- `PUT /v1/subscriber/alerts/preferences`
- `POST /v1/subscriber/devices`
- `DELETE /v1/subscriber/devices/{token}`

### Admin

- `GET /v1/admin/subscribers`
- `GET /v1/admin/subscribers/stats`
- `GET /v1/admin/subscribers/export`
- `GET /v1/admin/subscribers/{id}`
- `PUT /v1/admin/subscribers/{id}/status`

---

## Validation Rules

- **Email**: required, valid RFC email format, unique in `subscribers`.
- **Phone**: optional, E.164 format; required for SMS opt-in.
- **Zip**: optional, max 20 chars; no normalization required.
- **Community IDs**: must exist and be active.
- **Newsletter Frequency**: `daily|weekly|none`.
- **Alert Categories**: must exist in `alert_categories` and allow opt-out.
- **Device Tokens**: required for registration, unique per subscriber.

---

## Security, Privacy, and Compliance

- Store PII with least privilege access; admin endpoints require `admin` middleware.
- Avoid sending to unverified or unsubscribed recipients.
- Track all opt-in/out and unsubscribe actions in `subscriber_events` for compliance.
- Store IP address and user agent for auditability.
- Export endpoint must redact or exclude sensitive fields by role.

---

## List Compilation Strategy

- Compiled lists are rebuilt nightly and on high-impact changes:
  - verification, preference updates, community changes, status changes.
- Cache freshness target: `lists.cache_hours` (default 1 hour).
- Emergency lists ignore opt-outs and include all active subscribers.
- SMS lists include only phone numbers with `sms_opted_in=true`.

---

## Observability

### Metrics

- New subscribers per day (verified vs pending).
- Unsubscribe rate by scope.
- Bounce/complaint rate.
- Engagement score distribution.
- Compiled list size by community.

### Logs

- Subscriber events (signup, verify, unsubscribe, bounce, complaint).
- List compilation job duration and result counts.

---

## Failure Modes and Recovery

- **Expired verification tokens**: return 410/expired and require re-send.
- **Duplicate email**: return conflict with status-aware messaging.
- **List compilation failures**: retry via queue; fall back to query-based list.
- **Device token churn**: de-duplicate and purge invalid tokens on push failures.

---

## Testing Strategy

- Unit tests: preference updates, list compilation filters, engagement scoring.
- Feature tests: registration + verification flow, unsubscribe scopes.
- Integration tests: bounce/complaint event handling and status updates.

---

## Dependencies and Integration Points

- **Module 0**: Communities table, queue infrastructure.
- **Module 0B**: Delivery events (delivered/opened/clicked/bounced/complained).
- **Module 9/10/11**: Consumption of compiled lists for sending.

---

## Acceptance Criteria

### Must Have
- [ ] Subscriber registration with email verification
- [ ] Community subscription management
- [ ] Channel preferences (email, SMS, push)
- [ ] Newsletter frequency preferences
- [ ] One-click unsubscribe with token
- [ ] List compilation for newsletters/alerts/emergency
- [ ] Bounce handling and status updates

### Should Have
- [ ] Alert category preferences
- [ ] Push notification device token management
- [ ] Engagement scoring
- [ ] Admin subscriber management
- [ ] Subscriber export

### Nice to Have
- [ ] Phone verification (SMS)
- [ ] Social login (Google, Apple)
- [ ] Re-engagement campaigns
- [ ] Preference center web UI

---

## Notes for Agent

1. **Emergency broadcasts have no opt-out** - Always include all active subscribers
2. **Compile lists for speed** - Pre-compile rather than query at send time
3. **Email verification is required** - Don't send to unverified addresses
4. **Track engagement** - Score determines email priority and cleanup
5. **Respect preferences** - But log everything for compliance
