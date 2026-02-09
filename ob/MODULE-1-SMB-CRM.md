# MODULE 1: SMB CRM
## Customer Relationship Management

**Owner:** Agent 1
**Timeline:** Week 3-5
**Dependencies:** Module 0 (Core Infrastructure)
**Blocks:** Modules 6, 7

---

## OBJECTIVE

Build the complete SMB (Small/Medium Business) customer database with engagement tracking, tier management, and lifecycle automation.

---

## TABLES OWNED

- `smbs` (created by Module 0, managed by this module)
- `communities` (created by Module 0, managed by this module)
- `contacts` (if extended beyond secondary_contacts JSON)

---

## INTERFACE TO IMPLEMENT

```php
// Implement: App\Contracts\SMBServiceInterface

namespace App\Services;

use App\Contracts\SMBServiceInterface;
use App\Models\SMB;
use App\Events\SMB\{SMBCreated, SMBUpdated, SMBEngagementChanged, SMBTierChanged};

class SMBService implements SMBServiceInterface
{
    // Implement all methods from interface
}
```

---

## FEATURES TO BUILD

### 1. SMB CRUD Operations

```php
// app/Http/Controllers/Api/V1/SMBController.php

class SMBController extends Controller
{
    // GET /api/v1/smbs
    public function index(Request $request)
    {
        // Paginated list with filters:
        // - community_id
        // - engagement_tier
        // - campaign_status
        // - search (name, email, phone)
        // - service_model
        // - subscription_tier
    }
    
    // GET /api/v1/smbs/{id}
    public function show(SMB $smb)
    {
        // Return full SMB with:
        // - community relationship
        // - recent campaign sends
        // - recent approvals
        // - engagement history
    }
    
    // POST /api/v1/smbs
    public function store(StoreSMBRequest $request)
    {
        // Create SMB
        // Emit SMBCreated event
        // Initialize engagement score
        // Set initial tier (4 - Passive)
    }
    
    // PUT /api/v1/smbs/{id}
    public function update(UpdateSMBRequest $request, SMB $smb)
    {
        // Update SMB
        // Emit SMBUpdated event
        // Recalculate data quality score
    }
    
    // DELETE /api/v1/smbs/{id}
    public function destroy(SMB $smb)
    {
        // Soft delete
        // Cancel any pending campaigns
        // Emit event
    }
}
```

### 2. Engagement Score Calculation

```php
// app/Services/EngagementService.php

class EngagementService
{
    /**
     * Calculate engagement score based on recent activity
     * Score range: 0-100
     */
    public function calculateScore(SMB $smb): int
    {
        $score = 0;
        $config = config('fibonacco.engagement.score_weights');
        
        // Email engagement (last 30 days)
        $emailOpens = $this->countEmailOpens($smb, 30);
        $score += min($emailOpens * $config['email_open'], 25);
        
        $emailClicks = $this->countEmailClicks($smb, 30);
        $score += min($emailClicks * $config['email_click'], 30);
        
        // Content engagement (last 30 days)
        $contentViews = $this->countContentViews($smb, 30);
        $score += min($contentViews * $config['content_view'], 20);
        
        // Approvals (all time, weighted by recency)
        $approvalScore = $this->calculateApprovalScore($smb);
        $score += min($approvalScore, 25);
        
        return min($score, 100);
    }
    
    /**
     * Determine if tier should change based on score
     */
    public function evaluateTierChange(SMB $smb): ?int
    {
        $score = $smb->engagement_score;
        $currentTier = $smb->engagement_tier;
        $tiers = config('fibonacco.engagement.tiers');
        
        // Find appropriate tier based on score
        $newTier = 4;
        foreach ($tiers as $tier => $config) {
            if ($score >= $config['min_score']) {
                $newTier = $tier;
                break;
            }
        }
        
        // Only return if changed
        return ($newTier !== $currentTier) ? $newTier : null;
    }
}
```

### 3. Tier Management

```php
// Tier transition rules

class TierManager
{
    /**
     * Upgrade SMB to higher tier
     */
    public function upgradeTier(SMB $smb, int $newTier): void
    {
        if ($newTier >= $smb->engagement_tier) {
            throw new InvalidTierTransition("Cannot upgrade to same or lower tier");
        }
        
        $oldTier = $smb->engagement_tier;
        $smb->engagement_tier = $newTier;
        $smb->save();
        
        event(new SMBTierChanged($smb, $oldTier, $newTier, 'upgrade'));
        
        // Trigger tier-specific actions
        $this->onTierUpgrade($smb, $oldTier, $newTier);
    }
    
    /**
     * Actions when tier upgrades
     */
    protected function onTierUpgrade(SMB $smb, int $oldTier, int $newTier): void
    {
        // Tier 4 → 3: Start more frequent communication
        // Tier 3 → 2: Enable RVM, personalized content
        // Tier 2 → 1: Priority everything, personal touches
        
        if ($newTier === 1) {
            // Premium tier: Send welcome email from Sarah
            dispatch(new SendPremiumWelcome($smb->id));
        }
    }
    
    /**
     * Downgrade SMB to lower tier
     */
    public function downgradeTier(SMB $smb, int $newTier): void
    {
        // Similar logic with downgrade actions
    }
}
```

### 4. Community Management

```php
// app/Http/Controllers/Api/V1/CommunityController.php

class CommunityController extends Controller
{
    // GET /api/v1/communities
    public function index(Request $request)
    {
        // List communities with:
        // - SMB count
        // - Active campaign count
        // - Engagement stats
    }
    
    // GET /api/v1/communities/{id}
    public function show(Community $community)
    {
        // Community details with stats
    }
    
    // GET /api/v1/communities/{id}/smbs
    public function smbs(Community $community, Request $request)
    {
        // Paginated SMBs in community
    }
    
    // POST /api/v1/communities
    public function store(StoreCommunityRequest $request)
    {
        // Create community
    }
    
    // PUT /api/v1/communities/{id}
    public function update(UpdateCommunityRequest $request, Community $community)
    {
        // Update community
    }
}
```

### 5. Bulk Operations

```php
// app/Http/Controllers/Api/V1/SMBBulkController.php

class SMBBulkController extends Controller
{
    // POST /api/v1/smbs/import
    public function import(ImportSMBsRequest $request)
    {
        // CSV/JSON import
        // Validate data
        // Queue import job
        // Return job ID for status tracking
    }
    
    // GET /api/v1/smbs/import/{jobId}/status
    public function importStatus(string $jobId)
    {
        // Return import progress
    }
    
    // POST /api/v1/smbs/bulk-update
    public function bulkUpdate(BulkUpdateRequest $request)
    {
        // Update multiple SMBs
        // Filters: by community, tier, campaign_status
        // Actions: update fields, change tier, opt out
    }
}
```

### 6. Engagement History

```php
// GET /api/v1/smbs/{id}/engagement
public function engagementHistory(SMB $smb, Request $request)
{
    // Return engagement timeline:
    // - Email opens/clicks
    // - Content views
    // - Approvals
    // - Tier changes
    // - RVM deliveries
    // - Callbacks
    
    // Filterable by date range
    // Paginated
}

// GET /api/v1/smbs/{id}/engagement/score-history
public function scoreHistory(SMB $smb)
{
    // Daily engagement score over time
    // For charts/graphs
}
```

### 7. Campaign Status Management

```php
// app/Services/SMBCampaignService.php

class SMBCampaignService
{
    /**
     * Start Manifest Destiny campaign for SMB
     */
    public function startCampaign(SMB $smb): void
    {
        $smb->update([
            'campaign_status' => 'active',
            'manifest_destiny_day' => 1,
            'manifest_destiny_start_date' => now()->toDateString(),
        ]);
        
        // Queue first campaign send
        dispatch(new QueueNextCampaign($smb->id));
    }
    
    /**
     * Pause campaign (manual or automatic)
     */
    public function pauseCampaign(SMB $smb, string $reason): void
    {
        $smb->update([
            'campaign_status' => 'paused',
            'metadata->pause_reason' => $reason,
            'metadata->paused_at' => now()->toISOString(),
        ]);
    }
    
    /**
     * Resume paused campaign
     */
    public function resumeCampaign(SMB $smb): void
    {
        $smb->update([
            'campaign_status' => 'active',
        ]);
        
        dispatch(new QueueNextCampaign($smb->id));
    }
    
    /**
     * Advance to next day in campaign
     */
    public function advanceDay(SMB $smb): void
    {
        $newDay = $smb->manifest_destiny_day + 1;
        
        if ($newDay > 90) {
            $smb->update([
                'campaign_status' => 'completed',
                'manifest_destiny_day' => 90,
            ]);
        } else {
            $smb->update([
                'manifest_destiny_day' => $newDay,
            ]);
        }
    }
}
```

---

## API ENDPOINTS

```
GET    /api/v1/smbs                           # List SMBs
POST   /api/v1/smbs                           # Create SMB
GET    /api/v1/smbs/{id}                      # Get SMB
PUT    /api/v1/smbs/{id}                      # Update SMB
DELETE /api/v1/smbs/{id}                      # Delete SMB

GET    /api/v1/smbs/{id}/engagement           # Engagement history
GET    /api/v1/smbs/{id}/engagement/score     # Score history
GET    /api/v1/smbs/{id}/campaigns            # Campaign history
GET    /api/v1/smbs/{id}/approvals            # Approval history

POST   /api/v1/smbs/{id}/campaign/start       # Start campaign
POST   /api/v1/smbs/{id}/campaign/pause       # Pause campaign
POST   /api/v1/smbs/{id}/campaign/resume      # Resume campaign

POST   /api/v1/smbs/import                    # Bulk import
GET    /api/v1/smbs/import/{jobId}/status     # Import status
POST   /api/v1/smbs/bulk-update               # Bulk update

GET    /api/v1/communities                    # List communities
POST   /api/v1/communities                    # Create community
GET    /api/v1/communities/{id}               # Get community
PUT    /api/v1/communities/{id}               # Update community
GET    /api/v1/communities/{id}/smbs          # Community SMBs
GET    /api/v1/communities/{id}/stats         # Community stats
```

---

## EVENTS TO EMIT

```php
// When SMB is created
event(new SMBCreated($smb));

// When SMB is updated
event(new SMBUpdated($smb, $changedFields));

// When engagement score changes significantly (>10 points)
event(new SMBEngagementChanged($smb, $oldScore, $newScore));

// When tier changes
event(new SMBTierChanged($smb, $oldTier, $newTier, $direction));
```

---

## EVENTS TO LISTEN FOR

```php
// Listen for events from other modules to update engagement

// From Module 2 (Campaign Engine)
EmailOpened::class => UpdateEngagementOnEmailOpen::class
EmailClicked::class => UpdateEngagementOnEmailClick::class
RVMDelivered::class => UpdateEngagementOnRVM::class

// From Module 3 (Learning Center)
ContentViewed::class => UpdateEngagementOnContentView::class
ContentCompleted::class => UpdateEngagementOnContentComplete::class

// From Module 4 (Approval System)
ApprovalSubmitted::class => UpdateEngagementOnApproval::class

// From Module 5 (Inbound Engine)
CallbackReceived::class => UpdateEngagementOnCallback::class
```

---

## SCHEDULED JOBS

```php
// app/Console/Kernel.php

// Daily: Recalculate all engagement scores
$schedule->job(new RecalculateEngagementScores)->dailyAt('02:00');

// Daily: Evaluate tier transitions
$schedule->job(new EvaluateTierTransitions)->dailyAt('03:00');

// Daily: Advance manifest destiny day for active SMBs
$schedule->job(new AdvanceManifestDestinyDay)->dailyAt('00:01');

// Weekly: Clean up soft-deleted SMBs older than 90 days
$schedule->job(new CleanupDeletedSMBs)->weekly();

// Weekly: Data quality score recalculation
$schedule->job(new RecalculateDataQuality)->weeklyOn(0, '04:00');
```

---

## MODELS

```php
// app/Models/SMB.php

class SMB extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $table = 'smbs';
    
    protected $fillable = [
        'community_id',
        'business_name',
        'dba_name',
        'business_type',
        'category',
        'primary_contact_name',
        'primary_email',
        'primary_phone',
        'secondary_contacts',
        'address',
        'city',
        'state',
        'zip',
        'engagement_tier',
        'engagement_score',
        'campaign_status',
        'current_campaign_id',
        'manifest_destiny_day',
        'manifest_destiny_start_date',
        'next_scheduled_send',
        'service_model',
        'subscription_tier',
        'services_activated',
        'services_approved_pending',
        'email_opted_in',
        'sms_opted_in',
        'rvm_opted_in',
        'phone_opted_in',
        'do_not_contact',
        'source',
        'data_quality_score',
        'metadata',
    ];
    
    protected $casts = [
        'secondary_contacts' => 'array',
        'services_activated' => 'array',
        'services_approved_pending' => 'array',
        'metadata' => 'array',
        'manifest_destiny_start_date' => 'date',
        'next_scheduled_send' => 'datetime',
        'last_email_open' => 'datetime',
        'last_email_click' => 'datetime',
        'last_content_view' => 'datetime',
        'last_approval' => 'datetime',
        'email_opted_in' => 'boolean',
        'sms_opted_in' => 'boolean',
        'rvm_opted_in' => 'boolean',
        'phone_opted_in' => 'boolean',
        'do_not_contact' => 'boolean',
    ];
    
    // Relationships
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
    
    public function campaignSends(): HasMany
    {
        return $this->hasMany(CampaignSend::class);
    }
    
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }
    
    public function contentViews(): HasMany
    {
        return $this->hasMany(ContentView::class);
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('campaign_status', 'active');
    }
    
    public function scopeInTier($query, int $tier)
    {
        return $query->where('engagement_tier', $tier);
    }
    
    public function scopeCanReceiveEmail($query)
    {
        return $query->where('email_opted_in', true)
                     ->where('do_not_contact', false);
    }
    
    public function scopeCanReceiveRVM($query)
    {
        return $query->where('rvm_opted_in', true)
                     ->where('do_not_contact', false)
                     ->whereNotNull('primary_phone');
    }
    
    // Helpers
    public function getTierName(): string
    {
        return config("fibonacco.engagement.tiers.{$this->engagement_tier}.name");
    }
    
    public function isInCampaign(): bool
    {
        return $this->campaign_status === 'active';
    }
    
    public function canContactViaEmail(): bool
    {
        return $this->email_opted_in && !$this->do_not_contact && $this->primary_email;
    }
    
    public function canContactViaRVM(): bool
    {
        return $this->rvm_opted_in && !$this->do_not_contact && $this->primary_phone;
    }
}

// app/Models/Community.php

class Community extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'slug',
        'state',
        'county',
        'population',
        'timezone',
        'settings',
    ];
    
    protected $casts = [
        'settings' => 'array',
    ];
    
    public function smbs(): HasMany
    {
        return $this->hasMany(SMB::class);
    }
    
    public function getActiveSMBCount(): int
    {
        return $this->smbs()->active()->count();
    }
}
```

---

## ACCEPTANCE CRITERIA

- [ ] SMB CRUD operations working via API
- [ ] Community CRUD operations working via API
- [ ] Engagement score calculation implemented
- [ ] Tier transition logic working
- [ ] Bulk import working (CSV + JSON)
- [ ] All event emitters in place
- [ ] All event listeners registered
- [ ] Scheduled jobs configured
- [ ] API documentation complete
- [ ] Unit tests: 80% coverage
- [ ] Integration tests for tier transitions

---

## TESTING

```php
// tests/Feature/SMBTest.php

class SMBTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_can_create_smb()
    {
        $response = $this->postJson('/api/v1/smbs', [
            'business_name' => 'Test Business',
            'primary_email' => 'test@example.com',
            'community_id' => $this->community->id,
        ]);
        
        $response->assertStatus(201);
        $this->assertDatabaseHas('smbs', ['business_name' => 'Test Business']);
    }
    
    public function test_engagement_score_increases_on_email_open()
    {
        $smb = SMB::factory()->create(['engagement_score' => 0]);
        
        event(new EmailOpened($smb->id, 'campaign-1'));
        
        $smb->refresh();
        $this->assertGreaterThan(0, $smb->engagement_score);
    }
    
    public function test_tier_upgrades_when_score_threshold_met()
    {
        $smb = SMB::factory()->create([
            'engagement_tier' => 4,
            'engagement_score' => 45,
        ]);
        
        // Trigger score update that pushes over tier 3 threshold
        $service = app(EngagementService::class);
        $smb->update(['engagement_score' => 55]);
        
        $newTier = $service->evaluateTierChange($smb);
        $this->assertEquals(3, $newTier);
    }
}
```

---

## DEPENDENCIES ON OTHER MODULES

**Reads from:**
- None (this is a core module)

**Provides to:**
- All other modules use SMB data
- Module 2 reads SMBs for campaign targeting
- Module 4 reads SMBs for approval context
- Module 6 uses SMB data for Command Center
- Module 7 uses SMB data for AI personalization
