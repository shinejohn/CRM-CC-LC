# MODULE 1: SMB CRM - GAP ANALYSIS
## Comparison: Requirements vs. Existing Implementation

**Date:** December 2024  
**Status:** Gap Analysis Complete

---

# EXECUTIVE SUMMARY

## Overall Status: ⚠️ **PARTIAL IMPLEMENTATION**

**Completion:** ~35%  
**Critical Gaps:** 8 major features missing  
**Minor Gaps:** 12 features partially implemented

### Key Findings

1. ✅ **Customer CRUD** - Fully implemented (but uses "Customer" not "SMB")
2. ✅ **Engagement Score Calculation** - Implemented (different algorithm)
3. ❌ **Tier Management** - Not implemented
4. ❌ **Campaign Status Management** - Not implemented
5. ❌ **Community Management** - Not implemented
6. ❌ **Bulk Operations** - Not implemented
7. ❌ **Events System** - Not implemented
8. ❌ **Scheduled Jobs** - Not implemented

---

# DETAILED GAP ANALYSIS

## 1. DATA MODEL GAPS

### ✅ EXISTS: Customer Model
**Location:** `backend/app/Models/Customer.php`

**What Exists:**
- Basic customer fields (business_name, email, phone, etc.)
- AI-first CRM fields (industry_category, business_description, etc.)
- Relationships (conversations, pendingQuestions, faqs)
- UUID primary keys
- Tenant isolation

**Gap:** Model is called "Customer" not "SMB" - may need renaming or alias

### ❌ MISSING: SMB-Specific Fields

**Required Fields Not in Database:**

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `engagement_tier` | integer (1-4) | Tier level (1=Premium, 4=Passive) | ❌ Missing |
| `engagement_score` | integer (0-100) | Calculated engagement score | ❌ Missing |
| `campaign_status` | enum | 'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled' | ❌ Missing |
| `current_campaign_id` | uuid | Reference to active campaign | ❌ Missing |
| `manifest_destiny_day` | integer (1-90) | Day in 90-day campaign | ❌ Missing |
| `manifest_destiny_start_date` | date | Campaign start date | ❌ Missing |
| `next_scheduled_send` | datetime | Next campaign send time | ❌ Missing |
| `service_model` | string | Service model type | ❌ Missing |
| `services_activated` | json | Array of activated services | ❌ Missing |
| `services_approved_pending` | json | Array of pending approvals | ❌ Missing |
| `email_opted_in` | boolean | Email opt-in status | ❌ Missing |
| `sms_opted_in` | boolean | SMS opt-in status | ❌ Missing |
| `rvm_opted_in` | boolean | RVM opt-in status | ❌ Missing |
| `phone_opted_in` | boolean | Phone opt-in status | ❌ Missing |
| `do_not_contact` | boolean | DNC flag | ❌ Missing |
| `data_quality_score` | integer | Data completeness score | ❌ Missing |
| `last_email_open` | datetime | Last email open timestamp | ❌ Missing |
| `last_email_click` | datetime | Last email click timestamp | ❌ Missing |
| `last_content_view` | datetime | Last content view timestamp | ❌ Missing |
| `last_approval` | datetime | Last approval timestamp | ❌ Missing |

**Migration Needed:**
```php
// Create: backend/database/migrations/2024_12_XX_000001_add_smb_fields_to_customers.php
Schema::table('customers', function (Blueprint $table) {
    $table->integer('engagement_tier')->default(4)->after('lead_score');
    $table->integer('engagement_score')->default(0)->after('engagement_tier');
    $table->enum('campaign_status', ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'])->default('draft')->after('engagement_score');
    $table->uuid('current_campaign_id')->nullable()->after('campaign_status');
    $table->integer('manifest_destiny_day')->nullable()->after('current_campaign_id');
    $table->date('manifest_destiny_start_date')->nullable()->after('manifest_destiny_day');
    $table->timestamp('next_scheduled_send')->nullable()->after('manifest_destiny_start_date');
    $table->string('service_model')->nullable()->after('next_scheduled_send');
    $table->json('services_activated')->nullable()->after('service_model');
    $table->json('services_approved_pending')->nullable()->after('services_activated');
    $table->boolean('email_opted_in')->default(true)->after('services_approved_pending');
    $table->boolean('sms_opted_in')->default(false)->after('email_opted_in');
    $table->boolean('rvm_opted_in')->default(false)->after('sms_opted_in');
    $table->boolean('phone_opted_in')->default(false)->after('rvm_opted_in');
    $table->boolean('do_not_contact')->default(false)->after('phone_opted_in');
    $table->integer('data_quality_score')->default(0)->after('do_not_contact');
    $table->timestamp('last_email_open')->nullable()->after('data_quality_score');
    $table->timestamp('last_email_click')->nullable()->after('last_email_open');
    $table->timestamp('last_content_view')->nullable()->after('last_email_click');
    $table->timestamp('last_approval')->nullable()->after('last_content_view');
    
    $table->index('engagement_tier');
    $table->index('campaign_status');
    $table->index('manifest_destiny_day');
});
```

### ❌ MISSING: Community Model

**Required:** `backend/app/Models/Community.php`

**Fields Needed:**
- `id` (uuid)
- `name` (string)
- `slug` (string, unique)
- `state` (string)
- `county` (string, nullable)
- `population` (integer, nullable)
- `timezone` (string, nullable)
- `settings` (json, nullable)
- `created_at`, `updated_at`

**Migration Needed:**
```php
// Create: backend/database/migrations/2024_12_XX_000002_create_communities_table.php
Schema::create('communities', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('state', 2);
    $table->string('county')->nullable();
    $table->integer('population')->nullable();
    $table->string('timezone')->nullable();
    $table->json('settings')->nullable();
    $table->timestamps();
    
    $table->index('state');
    $table->index('slug');
});
```

**Add to Customer Migration:**
```php
$table->uuid('community_id')->nullable()->after('tenant_id');
$table->foreign('community_id')->references('id')->on('communities')->onDelete('set null');
```

---

## 2. API ENDPOINT GAPS

### ✅ EXISTS: Basic Customer CRUD

**Location:** `backend/app/Http/Controllers/Api/CustomerController.php`

**Existing Endpoints:**
- ✅ `GET /api/v1/customers` - List customers
- ✅ `POST /api/v1/customers` - Create customer
- ✅ `GET /api/v1/customers/{id}` - Get customer
- ✅ `GET /api/v1/customers/slug/{slug}` - Get by slug
- ✅ `PUT /api/v1/customers/{id}` - Update customer
- ✅ `DELETE /api/v1/customers/{id}` - Delete customer
- ✅ `PUT /api/v1/customers/{id}/business-context` - Update business context
- ✅ `GET /api/v1/customers/{id}/ai-context` - Get AI context

**Gaps:**
- ❌ Missing filters: `engagement_tier`, `campaign_status`, `service_model`
- ❌ Missing relationships: `community`, `campaign_sends`, `approvals`, `content_views`

### ❌ MISSING: Engagement Endpoints

**Required Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/smbs/{id}/engagement` | GET | Engagement history timeline | ❌ Missing |
| `/api/v1/smbs/{id}/engagement/score-history` | GET | Daily score over time | ❌ Missing |
| `/api/v1/smbs/{id}/campaigns` | GET | Campaign history | ❌ Missing |
| `/api/v1/smbs/{id}/approvals` | GET | Approval history | ❌ Missing |

### ❌ MISSING: Campaign Management Endpoints

**Required Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/smbs/{id}/campaign/start` | POST | Start Manifest Destiny campaign | ❌ Missing |
| `/api/v1/smbs/{id}/campaign/pause` | POST | Pause campaign | ❌ Missing |
| `/api/v1/smbs/{id}/campaign/resume` | POST | Resume campaign | ❌ Missing |

### ❌ MISSING: Community Endpoints

**Required Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/communities` | GET | List communities | ❌ Missing |
| `/api/v1/communities` | POST | Create community | ❌ Missing |
| `/api/v1/communities/{id}` | GET | Get community | ❌ Missing |
| `/api/v1/communities/{id}` | PUT | Update community | ❌ Missing |
| `/api/v1/communities/{id}/smbs` | GET | Community SMBs | ❌ Missing |
| `/api/v1/communities/{id}/stats` | GET | Community stats | ❌ Missing |

### ❌ MISSING: Bulk Operations Endpoints

**Required Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/smbs/import` | POST | Bulk import (CSV/JSON) | ❌ Missing |
| `/api/v1/smbs/import/{jobId}/status` | GET | Import status | ❌ Missing |
| `/api/v1/smbs/bulk-update` | POST | Bulk update multiple SMBs | ❌ Missing |

**Note:** Bulk import exists for FAQs (`/learning/faqs/bulk-import`) but not for customers/SMBs.

---

## 3. SERVICE LAYER GAPS

### ✅ EXISTS: Engagement Score Calculation

**Location:** `backend/app/Services/CrmAdvancedAnalyticsService.php`

**What Exists:**
- `calculateEngagementScore()` method
- Factors: conversations, duration, questions, recent activity
- Score range: 0-100

**Gap:** Algorithm differs from spec:
- **Spec requires:** Email opens/clicks, content views, approvals (weighted)
- **Current implementation:** Conversations, duration, questions only

**Required Changes:**
```php
// Current: Uses conversations only
// Required: Use email opens/clicks, content views, approvals

public function calculateScore(SMB $smb): int
{
    $score = 0;
    $config = config('fibonacco.engagement.score_weights');
    
    // Email engagement (last 30 days) - MISSING
    $emailOpens = $this->countEmailOpens($smb, 30);
    $score += min($emailOpens * $config['email_open'], 25);
    
    $emailClicks = $this->countEmailClicks($smb, 30);
    $score += min($emailClicks * $config['email_click'], 30);
    
    // Content engagement (last 30 days) - MISSING
    $contentViews = $this->countContentViews($smb, 30);
    $score += min($contentViews * $config['content_view'], 20);
    
    // Approvals (all time, weighted by recency) - MISSING
    $approvalScore = $this->calculateApprovalScore($smb);
    $score += min($approvalScore, 25);
    
    return min($score, 100);
}
```

### ❌ MISSING: EngagementService

**Required:** `backend/app/Services/EngagementService.php`

**Methods Needed:**
- `calculateScore(SMB $smb): int`
- `evaluateTierChange(SMB $smb): ?int`
- `countEmailOpens(SMB $smb, int $days): int`
- `countEmailClicks(SMB $smb, int $days): int`
- `countContentViews(SMB $smb, int $days): int`
- `calculateApprovalScore(SMB $smb): int`

### ❌ MISSING: TierManager Service

**Required:** `backend/app/Services/TierManager.php`

**Methods Needed:**
- `upgradeTier(SMB $smb, int $newTier): void`
- `downgradeTier(SMB $smb, int $newTier): void`
- `onTierUpgrade(SMB $smb, int $oldTier, int $newTier): void`
- `onTierDowngrade(SMB $smb, int $oldTier, int $newTier): void`

### ❌ MISSING: SMBCampaignService

**Required:** `backend/app/Services/SMBCampaignService.php`

**Methods Needed:**
- `startCampaign(SMB $smb): void`
- `pauseCampaign(SMB $smb, string $reason): void`
- `resumeCampaign(SMB $smb): void`
- `advanceDay(SMB $smb): void`

### ❌ MISSING: SMBService Interface & Implementation

**Required:** 
- `backend/app/Contracts/SMBServiceInterface.php`
- `backend/app/Services/SMBService.php`

**Interface Methods Needed:**
- All CRUD operations
- Engagement score calculation
- Tier management
- Campaign management
- Bulk operations

---

## 4. MODEL GAPS

### ✅ EXISTS: Customer Model

**Location:** `backend/app/Models/Customer.php`

**What Exists:**
- Basic relationships (conversations, pendingQuestions, faqs)
- UUID primary keys
- Fillable fields
- Casts for JSON fields

**Missing Relationships:**
```php
// Required relationships:
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
```

**Missing Scopes:**
```php
// Required scopes:
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
```

**Missing Helper Methods:**
```php
// Required helpers:
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
    return $this->email_opted_in && !$this->do_not_contact && $this->email;
}

public function canContactViaRVM(): bool
{
    return $this->rvm_opted_in && !$this->do_not_contact && $this->phone;
}
```

### ❌ MISSING: Community Model

**Required:** `backend/app/Models/Community.php`

**Full Implementation Needed:**
```php
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
        return $this->hasMany(Customer::class, 'community_id');
    }
    
    public function getActiveSMBCount(): int
    {
        return $this->smbs()->where('campaign_status', 'active')->count();
    }
}
```

---

## 5. EVENT SYSTEM GAPS

### ❌ MISSING: All Events

**Required Events:**

| Event | Purpose | Status |
|-------|---------|--------|
| `SMBCreated` | Emit when SMB created | ❌ Missing |
| `SMBUpdated` | Emit when SMB updated | ❌ Missing |
| `SMBEngagementChanged` | Emit when score changes >10 points | ❌ Missing |
| `SMBTierChanged` | Emit when tier changes | ❌ Missing |

**Required Files:**
- `backend/app/Events/SMB/SMBCreated.php`
- `backend/app/Events/SMB/SMBUpdated.php`
- `backend/app/Events/SMB/SMBEngagementChanged.php`
- `backend/app/Events/SMB/SMBTierChanged.php`

### ❌ MISSING: Event Listeners

**Required Listeners:**

| Listener | Listens To | Purpose | Status |
|----------|------------|---------|--------|
| `UpdateEngagementOnEmailOpen` | `EmailOpened` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnEmailClick` | `EmailClicked` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnRVM` | `RVMDelivered` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnContentView` | `ContentViewed` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnContentComplete` | `ContentCompleted` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnApproval` | `ApprovalSubmitted` | Update engagement score | ❌ Missing |
| `UpdateEngagementOnCallback` | `CallbackReceived` | Update engagement score | ❌ Missing |

**Note:** These events come from other modules (Module 2, 3, 4, 5) - listeners need to be registered in `EventServiceProvider`.

---

## 6. SCHEDULED JOBS GAPS

### ❌ MISSING: All Scheduled Jobs

**Required Jobs:**

| Job | Schedule | Purpose | Status |
|-----|----------|---------|--------|
| `RecalculateEngagementScores` | Daily at 02:00 | Recalculate all engagement scores | ❌ Missing |
| `EvaluateTierTransitions` | Daily at 03:00 | Evaluate tier changes | ❌ Missing |
| `AdvanceManifestDestinyDay` | Daily at 00:01 | Advance campaign day | ❌ Missing |
| `CleanupDeletedSMBs` | Weekly | Clean up soft-deleted SMBs | ❌ Missing |
| `RecalculateDataQuality` | Weekly Sunday 04:00 | Recalculate data quality scores | ❌ Missing |

**Required Files:**
- `backend/app/Jobs/RecalculateEngagementScores.php`
- `backend/app/Jobs/EvaluateTierTransitions.php`
- `backend/app/Jobs/AdvanceManifestDestinyDay.php`
- `backend/app/Jobs/CleanupDeletedSMBs.php`
- `backend/app/Jobs/RecalculateDataQuality.php`

**Kernel Registration Needed:**
```php
// backend/app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
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
}
```

---

## 7. CONFIGURATION GAPS

### ❌ MISSING: Engagement Configuration

**Required:** `backend/config/fibonacco.php`

```php
return [
    'engagement' => [
        'score_weights' => [
            'email_open' => 1,
            'email_click' => 3,
            'content_view' => 2,
            'approval' => 5,
        ],
        'tiers' => [
            1 => [
                'name' => 'Premium',
                'min_score' => 80,
                'description' => 'Highly engaged, priority treatment',
            ],
            2 => [
                'name' => 'Active',
                'min_score' => 60,
                'description' => 'Regular engagement, personalized content',
            ],
            3 => [
                'name' => 'Moderate',
                'min_score' => 40,
                'description' => 'Some engagement, standard communication',
            ],
            4 => [
                'name' => 'Passive',
                'min_score' => 0,
                'description' => 'Low engagement, basic communication',
            ],
        ],
    ],
];
```

---

## 8. TESTING GAPS

### ⚠️ PARTIAL: Customer Tests

**Existing:** `backend/tests/Feature/CustomerApiTest.php` (assumed)

**Missing Tests:**
- ❌ Engagement score calculation tests
- ❌ Tier transition tests
- ❌ Campaign management tests
- ❌ Bulk import tests
- ❌ Community tests
- ❌ Event listener tests
- ❌ Scheduled job tests

---

## 9. FRONTEND GAPS

### ❌ MISSING: SMB Management UI

**Required Pages:**
- SMB list page with filters (tier, campaign_status, community)
- SMB detail page with engagement history
- Community management pages
- Bulk import UI
- Campaign management UI

**Note:** Frontend has CRM pages but may need updates for SMB-specific features.

---

# IMPLEMENTATION PRIORITY

## 🔴 Critical (Must Have)

1. **Add SMB fields to Customer model** (migration)
2. **Create Community model** (migration + model)
3. **Implement EngagementService** (service)
4. **Implement TierManager** (service)
5. **Implement SMBCampaignService** (service)
6. **Add missing API endpoints** (controllers)
7. **Create event system** (events + listeners)
8. **Create scheduled jobs** (jobs + kernel)

## 🟡 High Priority (Should Have)

9. **Bulk import/update** (controllers + jobs)
10. **Engagement history endpoints** (controllers)
11. **Update Customer model** (relationships + scopes)
12. **Configuration file** (config/fibonacco.php)

## 🟢 Medium Priority (Nice to Have)

13. **Frontend UI updates** (React components)
14. **Additional tests** (test files)
15. **API documentation** (Swagger/OpenAPI)

---

# ESTIMATED EFFORT

| Component | Estimated Hours | Priority |
|-----------|----------------|----------|
| Database migrations | 4 hours | 🔴 Critical |
| Models (Community, Customer updates) | 4 hours | 🔴 Critical |
| Services (Engagement, Tier, Campaign) | 12 hours | 🔴 Critical |
| Controllers (new endpoints) | 8 hours | 🔴 Critical |
| Events & Listeners | 6 hours | 🔴 Critical |
| Scheduled Jobs | 6 hours | 🔴 Critical |
| Bulk Operations | 8 hours | 🟡 High |
| Configuration | 2 hours | 🟡 High |
| Tests | 16 hours | 🟡 High |
| Frontend Updates | 12 hours | 🟢 Medium |
| **TOTAL** | **78 hours** | |

**Estimated Timeline:** 2-3 weeks (1 developer)

---

# RECOMMENDATIONS

1. **Rename or Alias:** Decide if "Customer" should be renamed to "SMB" or create an alias
2. **Migration Strategy:** Create new migration to add SMB fields (don't modify existing)
3. **Event Integration:** Coordinate with other modules for event definitions
4. **Testing:** Write tests as you build (TDD approach)
5. **Documentation:** Update API docs as endpoints are added

---

# CONCLUSION

The existing Customer model and controller provide a **solid foundation** (~35% complete), but significant work is needed to meet MODULE-1 requirements:

- **8 critical features** need full implementation
- **12 features** need updates/extensions
- **Database schema** needs significant additions
- **Event system** needs to be built from scratch

**Recommendation:** Start with database migrations and models, then build services, then controllers, then events/jobs.



