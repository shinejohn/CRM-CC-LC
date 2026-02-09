# MODULE 1: SMB CRM - COMPLETE IMPLEMENTATION PLAN
## Addressing Gaps and Inconsistencies

**Date:** December 2024  
**Status:** Ready for Implementation  
**Estimated Timeline:** 2-3 weeks

---

# EXECUTIVE SUMMARY

This plan addresses all gaps identified in the gap analysis and resolves inconsistencies between the existing codebase and MODULE-1 requirements.

## Key Decisions

1. **Naming Convention:** Keep "Customer" model name (already in use), but add SMB-specific fields and methods
2. **Migration Strategy:** Add new fields via migration (non-breaking)
3. **Event System:** Build complete event/listener system for engagement tracking
4. **Service Layer:** Create dedicated services for engagement, tiers, and campaigns

---

# PHASE 1: DATABASE & MODELS (Days 1-3)

## Task 1.1: Add SMB Fields to Customers Table

**File:** `backend/database/migrations/2024_12_XX_000001_add_smb_fields_to_customers_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Engagement tracking
            $table->integer('engagement_tier')->default(4)->after('lead_score');
            $table->integer('engagement_score')->default(0)->after('engagement_tier');
            
            // Campaign tracking
            $table->enum('campaign_status', [
                'draft', 
                'scheduled', 
                'running', 
                'paused', 
                'completed', 
                'cancelled'
            ])->default('draft')->after('engagement_score');
            
            $table->uuid('current_campaign_id')->nullable()->after('campaign_status');
            $table->integer('manifest_destiny_day')->nullable()->after('current_campaign_id');
            $table->date('manifest_destiny_start_date')->nullable()->after('manifest_destiny_day');
            $table->timestamp('next_scheduled_send')->nullable()->after('manifest_destiny_start_date');
            
            // Service model
            $table->string('service_model')->nullable()->after('next_scheduled_send');
            $table->json('services_activated')->nullable()->after('service_model');
            $table->json('services_approved_pending')->nullable()->after('services_activated');
            
            // Opt-in preferences
            $table->boolean('email_opted_in')->default(true)->after('services_approved_pending');
            $table->boolean('sms_opted_in')->default(false)->after('email_opted_in');
            $table->boolean('rvm_opted_in')->default(false)->after('sms_opted_in');
            $table->boolean('phone_opted_in')->default(false)->after('rvm_opted_in');
            $table->boolean('do_not_contact')->default(false)->after('phone_opted_in');
            
            // Data quality
            $table->integer('data_quality_score')->default(0)->after('do_not_contact');
            
            // Last activity timestamps
            $table->timestamp('last_email_open')->nullable()->after('data_quality_score');
            $table->timestamp('last_email_click')->nullable()->after('last_email_open');
            $table->timestamp('last_content_view')->nullable()->after('last_email_click');
            $table->timestamp('last_approval')->nullable()->after('last_content_view');
            
            // Indexes
            $table->index('engagement_tier');
            $table->index('campaign_status');
            $table->index('manifest_destiny_day');
            $table->index(['campaign_status', 'manifest_destiny_day']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['campaign_status', 'manifest_destiny_day']);
            $table->dropIndex(['manifest_destiny_day']);
            $table->dropIndex(['campaign_status']);
            $table->dropIndex(['engagement_tier']);
            
            $table->dropColumn([
                'engagement_tier',
                'engagement_score',
                'campaign_status',
                'current_campaign_id',
                'manifest_destiny_day',
                'manifest_destiny_start_date',
                'next_scheduled_send',
                'service_model',
                'services_activated',
                'services_approved_pending',
                'email_opted_in',
                'sms_opted_in',
                'rvm_opted_in',
                'phone_opted_in',
                'do_not_contact',
                'data_quality_score',
                'last_email_open',
                'last_email_click',
                'last_content_view',
                'last_approval',
            ]);
        });
    }
};
```

## Task 1.2: Create Communities Table

**File:** `backend/database/migrations/2024_12_XX_000002_create_communities_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('communities');
    }
};
```

## Task 1.3: Add Community Relationship to Customers

**File:** `backend/database/migrations/2024_12_XX_000003_add_community_id_to_customers_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->uuid('community_id')->nullable()->after('tenant_id');
            $table->foreign('community_id')
                ->references('id')
                ->on('communities')
                ->onDelete('set null');
            $table->index('community_id');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['community_id']);
            $table->dropIndex(['community_id']);
            $table->dropColumn('community_id');
        });
    }
};
```

## Task 1.4: Update Customer Model

**File:** `backend/app/Models/Customer.php`

**Add to fillable array:**
```php
protected $fillable = [
    // ... existing fields ...
    'community_id',
    'engagement_tier',
    'engagement_score',
    'campaign_status',
    'current_campaign_id',
    'manifest_destiny_day',
    'manifest_destiny_start_date',
    'next_scheduled_send',
    'service_model',
    'services_activated',
    'services_approved_pending',
    'email_opted_in',
    'sms_opted_in',
    'rvm_opted_in',
    'phone_opted_in',
    'do_not_contact',
    'data_quality_score',
    'last_email_open',
    'last_email_click',
    'last_content_view',
    'last_approval',
];
```

**Add to casts:**
```php
protected $casts = [
    // ... existing casts ...
    'services_activated' => 'array',
    'services_approved_pending' => 'array',
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
```

**Add relationships:**
```php
public function community(): BelongsTo
{
    return $this->belongsTo(Community::class);
}

// Note: These relationships depend on other modules
// CampaignSend, Approval, ContentView models from other modules
public function campaignSends(): HasMany
{
    return $this->hasMany(CampaignSend::class, 'customer_id');
}

public function approvals(): HasMany
{
    return $this->hasMany(Approval::class, 'customer_id');
}

public function contentViews(): HasMany
{
    return $this->hasMany(ContentView::class, 'customer_id');
}
```

**Add scopes:**
```php
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
                 ->where('do_not_contact', false)
                 ->whereNotNull('email');
}

public function scopeCanReceiveSMS($query)
{
    return $query->where('sms_opted_in', true)
                 ->where('do_not_contact', false)
                 ->whereNotNull('phone');
}

public function scopeCanReceiveRVM($query)
{
    return $query->where('rvm_opted_in', true)
                 ->where('do_not_contact', false)
                 ->whereNotNull('phone');
}

public function scopeCanReceivePhone($query)
{
    return $query->where('phone_opted_in', true)
                 ->where('do_not_contact', false)
                 ->whereNotNull('phone');
}
```

**Add helper methods:**
```php
public function getTierName(): string
{
    $tiers = config('fibonacco.engagement.tiers', []);
    return $tiers[$this->engagement_tier]['name'] ?? 'Unknown';
}

public function isInCampaign(): bool
{
    return $this->campaign_status === 'running';
}

public function canContactViaEmail(): bool
{
    return $this->email_opted_in 
        && !$this->do_not_contact 
        && !empty($this->email);
}

public function canContactViaSMS(): bool
{
    return $this->sms_opted_in 
        && !$this->do_not_contact 
        && !empty($this->phone);
}

public function canContactViaRVM(): bool
{
    return $this->rvm_opted_in 
        && !$this->do_not_contact 
        && !empty($this->phone);
}

public function canContactViaPhone(): bool
{
    return $this->phone_opted_in 
        && !$this->do_not_contact 
        && !empty($this->phone);
}
```

## Task 1.5: Create Community Model

**File:** `backend/app/Models/Community.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Community extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($community) {
            if (empty($community->id)) {
                $community->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'community_id');
    }

    public function getActiveSMBCount(): int
    {
        return $this->customers()
            ->where('campaign_status', 'active')
            ->count();
    }

    public function getTotalSMBCount(): int
    {
        return $this->customers()->count();
    }
}
```

---

# PHASE 2: CONFIGURATION (Day 1)

## Task 2.1: Create Engagement Configuration

**File:** `backend/config/fibonacco.php`

```php
<?php

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
                'email_frequency' => 'daily',
                'content_personalization' => true,
                'rvm_enabled' => true,
            ],
            2 => [
                'name' => 'Active',
                'min_score' => 60,
                'description' => 'Regular engagement, personalized content',
                'email_frequency' => 'every_other_day',
                'content_personalization' => true,
                'rvm_enabled' => false,
            ],
            3 => [
                'name' => 'Moderate',
                'min_score' => 40,
                'description' => 'Some engagement, standard communication',
                'email_frequency' => 'weekly',
                'content_personalization' => false,
                'rvm_enabled' => false,
            ],
            4 => [
                'name' => 'Passive',
                'min_score' => 0,
                'description' => 'Low engagement, basic communication',
                'email_frequency' => 'bi_weekly',
                'content_personalization' => false,
                'rvm_enabled' => false,
            ],
        ],
    ],
];
```

---

# PHASE 3: SERVICES (Days 4-7)

## Task 3.1: Create EngagementService

**File:** `backend/app/Services/EngagementService.php`

```php
<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EngagementService
{
    /**
     * Calculate engagement score based on recent activity
     * Score range: 0-100
     */
    public function calculateScore(Customer $customer): int
    {
        $score = 0;
        $config = config('fibonacco.engagement.score_weights', [
            'email_open' => 1,
            'email_click' => 3,
            'content_view' => 2,
            'approval' => 5,
        ]);

        // Email engagement (last 30 days)
        $emailOpens = $this->countEmailOpens($customer, 30);
        $score += min($emailOpens * $config['email_open'], 25);

        $emailClicks = $this->countEmailClicks($customer, 30);
        $score += min($emailClicks * $config['email_click'], 30);

        // Content engagement (last 30 days)
        $contentViews = $this->countContentViews($customer, 30);
        $score += min($contentViews * $config['content_view'], 20);

        // Approvals (all time, weighted by recency)
        $approvalScore = $this->calculateApprovalScore($customer);
        $score += min($approvalScore, 25);

        return min($score, 100);
    }

    /**
     * Count email opens in last N days
     */
    public function countEmailOpens(Customer $customer, int $days): int
    {
        // This will query campaign_sends table (from Module 2)
        // For now, use last_email_open timestamp
        if (!$customer->last_email_open) {
            return 0;
        }

        $daysSinceLastOpen = Carbon::now()->diffInDays($customer->last_email_open);
        if ($daysSinceLastOpen > $days) {
            return 0;
        }

        // TODO: Query actual email opens from campaign_sends table
        // For now, return 1 if opened in last N days
        return 1;
    }

    /**
     * Count email clicks in last N days
     */
    public function countEmailClicks(Customer $customer, int $days): int
    {
        if (!$customer->last_email_click) {
            return 0;
        }

        $daysSinceLastClick = Carbon::now()->diffInDays($customer->last_email_click);
        if ($daysSinceLastClick > $days) {
            return 0;
        }

        // TODO: Query actual email clicks from campaign_sends table
        return 1;
    }

    /**
     * Count content views in last N days
     */
    public function countContentViews(Customer $customer, int $days): int
    {
        // Query content_views table (from Module 3)
        return DB::table('content_views')
            ->where('customer_id', $customer->id)
            ->where('viewed_at', '>=', Carbon::now()->subDays($days))
            ->count();
    }

    /**
     * Calculate approval score (weighted by recency)
     */
    public function calculateApprovalScore(Customer $customer): int
    {
        if (!$customer->last_approval) {
            return 0;
        }

        $daysSinceApproval = Carbon::now()->diffInDays($customer->last_approval);
        
        // Weight: 5 points per approval, decay by 1 point per week
        $baseScore = 5;
        $decay = (int) ($daysSinceApproval / 7);
        
        return max(0, $baseScore - $decay);
    }

    /**
     * Determine if tier should change based on score
     */
    public function evaluateTierChange(Customer $customer): ?int
    {
        $score = $customer->engagement_score;
        $currentTier = $customer->engagement_tier;
        $tiers = config('fibonacco.engagement.tiers', []);

        // Find appropriate tier based on score
        $newTier = 4; // Default to Passive
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

## Task 3.2: Create TierManager Service

**File:** `backend/app/Services/TierManager.php`

```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Events\SMB\SMBTierChanged;
use App\Jobs\SendPremiumWelcome;

class TierManager
{
    /**
     * Upgrade customer to higher tier
     */
    public function upgradeTier(Customer $customer, int $newTier): void
    {
        if ($newTier >= $customer->engagement_tier) {
            throw new \InvalidArgumentException("Cannot upgrade to same or lower tier");
        }

        $oldTier = $customer->engagement_tier;
        $customer->engagement_tier = $newTier;
        $customer->save();

        event(new SMBTierChanged($customer, $oldTier, $newTier, 'upgrade'));

        // Trigger tier-specific actions
        $this->onTierUpgrade($customer, $oldTier, $newTier);
    }

    /**
     * Downgrade customer to lower tier
     */
    public function downgradeTier(Customer $customer, int $newTier): void
    {
        if ($newTier <= $customer->engagement_tier) {
            throw new \InvalidArgumentException("Cannot downgrade to same or higher tier");
        }

        $oldTier = $customer->engagement_tier;
        $customer->engagement_tier = $newTier;
        $customer->save();

        event(new SMBTierChanged($customer, $oldTier, $newTier, 'downgrade'));

        // Trigger tier-specific actions
        $this->onTierDowngrade($customer, $oldTier, $newTier);
    }

    /**
     * Actions when tier upgrades
     */
    protected function onTierUpgrade(Customer $customer, int $oldTier, int $newTier): void
    {
        // Tier 4 → 3: Start more frequent communication
        if ($oldTier === 4 && $newTier === 3) {
            // Update email frequency
            // Could trigger welcome email
        }

        // Tier 3 → 2: Enable RVM, personalized content
        if ($oldTier === 3 && $newTier === 2) {
            $customer->rvm_opted_in = true;
            $customer->save();
        }

        // Tier 2 → 1: Priority everything, personal touches
        if ($oldTier === 2 && $newTier === 1) {
            // Premium tier: Send welcome email from Sarah
            SendPremiumWelcome::dispatch($customer->id);
        }
    }

    /**
     * Actions when tier downgrades
     */
    protected function onTierDowngrade(Customer $customer, int $oldTier, int $newTier): void
    {
        // Reduce communication frequency
        // Disable premium features if downgrading from tier 1
        if ($oldTier === 1 && $newTier > 1) {
            // Disable RVM if downgrading to tier 3 or 4
            if ($newTier >= 3) {
                $customer->rvm_opted_in = false;
                $customer->save();
            }
        }
    }
}
```

## Task 3.3: Create SMBCampaignService

**File:** `backend/app/Services/SMBCampaignService.php`

```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Jobs\QueueNextCampaign;

class SMBCampaignService
{
    /**
     * Start Manifest Destiny campaign for customer
     */
    public function startCampaign(Customer $customer): void
    {
        $customer->update([
            'campaign_status' => 'running',
            'manifest_destiny_day' => 1,
            'manifest_destiny_start_date' => now()->toDateString(),
            'next_scheduled_send' => now()->addDay(),
        ]);

        // Queue first campaign send
        QueueNextCampaign::dispatch($customer->id);
    }

    /**
     * Pause campaign (manual or automatic)
     */
    public function pauseCampaign(Customer $customer, string $reason): void
    {
        $metadata = $customer->metadata ?? [];
        $metadata['pause_reason'] = $reason;
        $metadata['paused_at'] = now()->toISOString();

        $customer->update([
            'campaign_status' => 'paused',
            'metadata' => $metadata,
        ]);
    }

    /**
     * Resume paused campaign
     */
    public function resumeCampaign(Customer $customer): void
    {
        $customer->update([
            'campaign_status' => 'running',
        ]);

        // Queue next campaign send
        QueueNextCampaign::dispatch($customer->id);
    }

    /**
     * Advance to next day in campaign
     */
    public function advanceDay(Customer $customer): void
    {
        $newDay = ($customer->manifest_destiny_day ?? 0) + 1;

        if ($newDay > 90) {
            $customer->update([
                'campaign_status' => 'completed',
                'manifest_destiny_day' => 90,
            ]);
        } else {
            $customer->update([
                'manifest_destiny_day' => $newDay,
                'next_scheduled_send' => now()->addDay(),
            ]);
        }
    }
}
```

## Task 3.4: Create SMBService Interface

**File:** `backend/app/Contracts/SMBServiceInterface.php`

```php
<?php

namespace App\Contracts;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;

interface SMBServiceInterface
{
    public function list(array $filters = [], int $perPage = 20): Collection;
    public function find(string $id): ?Customer;
    public function findBySlug(string $slug): ?Customer;
    public function create(array $data): Customer;
    public function update(Customer $customer, array $data): Customer;
    public function delete(Customer $customer): bool;
    public function calculateEngagementScore(Customer $customer): int;
    public function updateTier(Customer $customer, int $newTier): void;
    public function startCampaign(Customer $customer): void;
    public function pauseCampaign(Customer $customer, string $reason): void;
    public function resumeCampaign(Customer $customer): void;
}
```

## Task 3.5: Create SMBService Implementation

**File:** `backend/app/Services/SMBService.php`

```php
<?php

namespace App\Services;

use App\Contracts\SMBServiceInterface;
use App\Models\Customer;
use App\Services\EngagementService;
use App\Services\TierManager;
use App\Services\SMBCampaignService;
use App\Events\SMB\SMBCreated;
use App\Events\SMB\SMBUpdated;
use Illuminate\Database\Eloquent\Collection;

class SMBService implements SMBServiceInterface
{
    public function __construct(
        private EngagementService $engagementService,
        private TierManager $tierManager,
        private SMBCampaignService $campaignService
    ) {}

    public function list(array $filters = [], int $perPage = 20): Collection
    {
        $query = Customer::query();

        if (isset($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        if (isset($filters['community_id'])) {
            $query->where('community_id', $filters['community_id']);
        }

        if (isset($filters['engagement_tier'])) {
            $query->where('engagement_tier', $filters['engagement_tier']);
        }

        if (isset($filters['campaign_status'])) {
            $query->where('campaign_status', $filters['campaign_status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function find(string $id): ?Customer
    {
        return Customer::find($id);
    }

    public function findBySlug(string $slug): ?Customer
    {
        return Customer::where('slug', $slug)->first();
    }

    public function create(array $data): Customer
    {
        $customer = Customer::create($data);

        // Initialize engagement score
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);

        // Set initial tier (4 - Passive)
        $customer->update(['engagement_tier' => 4]);

        event(new SMBCreated($customer));

        return $customer->fresh();
    }

    public function update(Customer $customer, array $data): Customer
    {
        $changedFields = array_keys(array_diff_assoc($data, $customer->getAttributes()));
        
        $customer->update($data);

        // Recalculate data quality score
        $this->recalculateDataQuality($customer);

        event(new SMBUpdated($customer, $changedFields));

        return $customer->fresh();
    }

    public function delete(Customer $customer): bool
    {
        // Soft delete
        return $customer->delete();
    }

    public function calculateEngagementScore(Customer $customer): int
    {
        $score = $this->engagementService->calculateScore($customer);
        $oldScore = $customer->engagement_score;

        $customer->update(['engagement_score' => $score]);

        // Check if tier should change
        $newTier = $this->engagementService->evaluateTierChange($customer);
        if ($newTier !== null) {
            if ($newTier < $customer->engagement_tier) {
                $this->tierManager->upgradeTier($customer, $newTier);
            } else {
                $this->tierManager->downgradeTier($customer, $newTier);
            }
        }

        // Emit engagement changed event if significant change
        if (abs($score - $oldScore) > 10) {
            event(new \App\Events\SMB\SMBEngagementChanged($customer, $oldScore, $score));
        }

        return $score;
    }

    public function updateTier(Customer $customer, int $newTier): void
    {
        if ($newTier < $customer->engagement_tier) {
            $this->tierManager->upgradeTier($customer, $newTier);
        } else {
            $this->tierManager->downgradeTier($customer, $newTier);
        }
    }

    public function startCampaign(Customer $customer): void
    {
        $this->campaignService->startCampaign($customer);
    }

    public function pauseCampaign(Customer $customer, string $reason): void
    {
        $this->campaignService->pauseCampaign($customer, $reason);
    }

    public function resumeCampaign(Customer $customer): void
    {
        $this->campaignService->resumeCampaign($customer);
    }

    private function recalculateDataQuality(Customer $customer): void
    {
        $score = 0;
        $maxScore = 100;
        $fields = [
            'business_name' => 10,
            'email' => 15,
            'phone' => 15,
            'address_line1' => 10,
            'city' => 10,
            'state' => 10,
            'industry_category' => 10,
            'business_description' => 10,
            'products_services' => 10,
        ];

        foreach ($fields as $field => $points) {
            if (!empty($customer->$field)) {
                $score += $points;
            }
        }

        $customer->update(['data_quality_score' => min($score, $maxScore)]);
    }
}
```

---

# PHASE 4: EVENTS & LISTENERS (Days 8-9)

## Task 4.1: Create SMB Events

**File:** `backend/app/Events/SMB/SMBCreated.php`

```php
<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer
    ) {}
}
```

**File:** `backend/app/Events/SMB/SMBUpdated.php`

```php
<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public array $changedFields
    ) {}
}
```

**File:** `backend/app/Events/SMB/SMBEngagementChanged.php`

```php
<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBEngagementChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $oldScore,
        public int $newScore
    ) {}
}
```

**File:** `backend/app/Events/SMB/SMBTierChanged.php`

```php
<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBTierChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $oldTier,
        public int $newTier,
        public string $direction // 'upgrade' or 'downgrade'
    ) {}
}
```

## Task 4.2: Create Event Listeners

**File:** `backend/app/Listeners/UpdateEngagementOnEmailOpen.php`

```php
<?php

namespace App\Listeners;

use App\Events\EmailOpened;
use App\Services\EngagementService;
use App\Models\Customer;

class UpdateEngagementOnEmailOpen
{
    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(EmailOpened $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Update last email open timestamp
        $customer->update(['last_email_open' => now()]);

        // Recalculate engagement score
        $this->engagementService->calculateScore($customer);
    }
}
```

**Similar listeners needed for:**
- `UpdateEngagementOnEmailClick.php`
- `UpdateEngagementOnRVM.php`
- `UpdateEngagementOnContentView.php`
- `UpdateEngagementOnContentComplete.php`
- `UpdateEngagementOnApproval.php`
- `UpdateEngagementOnCallback.php`

## Task 4.3: Register Events & Listeners

**File:** `backend/app/Providers/EventServiceProvider.php`

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // SMB Events
        \App\Events\SMB\SMBCreated::class => [],
        \App\Events\SMB\SMBUpdated::class => [],
        \App\Events\SMB\SMBEngagementChanged::class => [],
        \App\Events\SMB\SMBTierChanged::class => [],

        // Engagement tracking (from other modules)
        \App\Events\EmailOpened::class => [
            \App\Listeners\UpdateEngagementOnEmailOpen::class,
        ],
        \App\Events\EmailClicked::class => [
            \App\Listeners\UpdateEngagementOnEmailClick::class,
        ],
        \App\Events\RVMDelivered::class => [
            \App\Listeners\UpdateEngagementOnRVM::class,
        ],
        \App\Events\ContentViewed::class => [
            \App\Listeners\UpdateEngagementOnContentView::class,
        ],
        \App\Events\ContentCompleted::class => [
            \App\Listeners\UpdateEngagementOnContentComplete::class,
        ],
        \App\Events\ApprovalSubmitted::class => [
            \App\Listeners\UpdateEngagementOnApproval::class,
        ],
        \App\Events\CallbackReceived::class => [
            \App\Listeners\UpdateEngagementOnCallback::class,
        ],
    ];
}
```

---

# PHASE 5: CONTROLLERS (Days 10-12)

## Task 5.1: Update CustomerController

**File:** `backend/app/Http/Controllers/Api/CustomerController.php`

**Add new methods:**

```php
/**
 * Get customer engagement history
 */
public function engagementHistory(Request $request, string $id): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

    // Get engagement timeline
    $timeline = [
        'email_opens' => $this->getEmailOpens($customer, $request),
        'email_clicks' => $this->getEmailClicks($customer, $request),
        'content_views' => $this->getContentViews($customer, $request),
        'approvals' => $this->getApprovals($customer, $request),
        'tier_changes' => $this->getTierChanges($customer, $request),
    ];

    return response()->json(['data' => $timeline]);
}

/**
 * Get engagement score history
 */
public function scoreHistory(Request $request, string $id): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

    // Query engagement_score_history table (if exists)
    // For now, return current score
    return response()->json([
        'data' => [
            'current_score' => $customer->engagement_score,
            'current_tier' => $customer->engagement_tier,
        ],
    ]);
}

/**
 * Start campaign
 */
public function startCampaign(Request $request, string $id): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

    $service = app(\App\Services\SMBCampaignService::class);
    $service->startCampaign($customer);

    return response()->json([
        'data' => $customer->fresh(),
        'message' => 'Campaign started successfully',
    ]);
}

/**
 * Pause campaign
 */
public function pauseCampaign(Request $request, string $id): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

    $validated = $request->validate([
        'reason' => 'required|string|max:255',
    ]);

    $service = app(\App\Services\SMBCampaignService::class);
    $service->pauseCampaign($customer, $validated['reason']);

    return response()->json([
        'data' => $customer->fresh(),
        'message' => 'Campaign paused successfully',
    ]);
}

/**
 * Resume campaign
 */
public function resumeCampaign(Request $request, string $id): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

    $service = app(\App\Services\SMBCampaignService::class);
    $service->resumeCampaign($customer);

    return response()->json([
        'data' => $customer->fresh(),
        'message' => 'Campaign resumed successfully',
    ]);
}
```

**Update index method to include new filters:**

```php
public function index(Request $request): JsonResponse
{
    $tenantId = $this->getTenantId($request);
    
    $query = Customer::where('tenant_id', $tenantId);
    
    // Existing filters...
    if ($request->has('engagement_tier')) {
        $query->where('engagement_tier', $request->input('engagement_tier'));
    }
    
    if ($request->has('campaign_status')) {
        $query->where('campaign_status', $request->input('campaign_status'));
    }
    
    if ($request->has('service_model')) {
        $query->where('service_model', $request->input('service_model'));
    }
    
    // ... rest of method
}
```

## Task 5.2: Create CommunityController

**File:** `backend/app/Http/Controllers/Api/CommunityController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommunityController extends Controller
{
    /**
     * List communities
     */
    public function index(Request $request): JsonResponse
    {
        $query = Community::query();

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
        }

        $communities = $query->withCount('customers')->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $communities->items(),
            'meta' => [
                'current_page' => $communities->currentPage(),
                'last_page' => $communities->lastPage(),
                'per_page' => $communities->perPage(),
                'total' => $communities->total(),
            ],
        ]);
    }

    /**
     * Get community
     */
    public function show(string $id): JsonResponse
    {
        $community = Community::withCount('customers')->findOrFail($id);

        return response()->json(['data' => $community]);
    }

    /**
     * Create community
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:communities,slug',
            'state' => 'required|string|size:2',
            'county' => 'nullable|string',
            'population' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $community = Community::create($validated);

        return response()->json([
            'data' => $community,
            'message' => 'Community created successfully',
        ], 201);
    }

    /**
     * Update community
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $community = Community::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('communities')->ignore($community->id)],
            'state' => 'sometimes|string|size:2',
            'county' => 'nullable|string',
            'population' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $community->update($validated);

        return response()->json([
            'data' => $community->fresh(),
            'message' => 'Community updated successfully',
        ]);
    }

    /**
     * Get SMBs in community
     */
    public function smbs(Request $request, string $id): JsonResponse
    {
        $community = Community::findOrFail($id);
        
        $query = $community->customers();

        // Apply filters
        if ($request->has('engagement_tier')) {
            $query->where('engagement_tier', $request->input('engagement_tier'));
        }

        if ($request->has('campaign_status')) {
            $query->where('campaign_status', $request->input('campaign_status'));
        }

        $customers = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    /**
     * Get community stats
     */
    public function stats(string $id): JsonResponse
    {
        $community = Community::findOrFail($id);

        $stats = [
            'total_smbs' => $community->customers()->count(),
            'active_campaigns' => $community->customers()->where('campaign_status', 'running')->count(),
            'by_tier' => $community->customers()
                ->selectRaw('engagement_tier, count(*) as count')
                ->groupBy('engagement_tier')
                ->pluck('count', 'engagement_tier'),
        ];

        return response()->json(['data' => $stats]);
    }
}
```

## Task 5.3: Create SMBBulkController

**File:** `backend/app/Http/Controllers/Api/SMBBulkController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ImportSMBs;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Bus;

class SMBBulkController extends Controller
{
    /**
     * Bulk import SMBs
     */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt,json',
            'tenant_id' => 'required|uuid',
            'community_id' => 'nullable|uuid',
            'options' => 'nullable|array',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        $job = new ImportSMBs(
            $path,
            $validated['tenant_id'],
            $validated['community_id'] ?? null,
            $validated['options'] ?? []
        );

        $batch = Bus::batch([$job])->dispatch();

        return response()->json([
            'data' => [
                'job_id' => $batch->id,
                'status' => 'queued',
            ],
            'message' => 'Import job queued successfully',
        ], 202);
    }

    /**
     * Get import status
     */
    public function importStatus(string $jobId): JsonResponse
    {
        $batch = Bus::findBatch($jobId);

        if (!$batch) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        return response()->json([
            'data' => [
                'job_id' => $batch->id,
                'status' => $batch->finished() ? 'completed' : 'processing',
                'total_jobs' => $batch->totalJobs,
                'pending_jobs' => $batch->pendingJobs,
                'failed_jobs' => $batch->failedJobs,
                'processed_jobs' => $batch->processedJobs(),
            ],
        ]);
    }

    /**
     * Bulk update SMBs
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|uuid',
            'filters' => 'required|array',
            'updates' => 'required|array',
        ]);

        $query = Customer::where('tenant_id', $validated['tenant_id']);

        // Apply filters
        if (isset($validated['filters']['community_id'])) {
            $query->where('community_id', $validated['filters']['community_id']);
        }

        if (isset($validated['filters']['engagement_tier'])) {
            $query->where('engagement_tier', $validated['filters']['engagement_tier']);
        }

        if (isset($validated['filters']['campaign_status'])) {
            $query->where('campaign_status', $validated['filters']['campaign_status']);
        }

        $count = $query->update($validated['updates']);

        return response()->json([
            'data' => [
                'updated_count' => $count,
            ],
            'message' => "Updated {$count} SMBs successfully",
        ]);
    }
}
```

## Task 5.4: Update API Routes

**File:** `backend/routes/api.php`

**Add new routes:**

```php
// SMB/Customer routes (update existing)
Route::prefix('customers')->group(function () {
    // ... existing routes ...
    
    // New engagement routes
    Route::get('/{id}/engagement', [CustomerController::class, 'engagementHistory']);
    Route::get('/{id}/engagement/score-history', [CustomerController::class, 'scoreHistory']);
    Route::get('/{id}/campaigns', [CustomerController::class, 'campaignHistory']);
    Route::get('/{id}/approvals', [CustomerController::class, 'approvalHistory']);
    
    // Campaign management
    Route::post('/{id}/campaign/start', [CustomerController::class, 'startCampaign']);
    Route::post('/{id}/campaign/pause', [CustomerController::class, 'pauseCampaign']);
    Route::post('/{id}/campaign/resume', [CustomerController::class, 'resumeCampaign']);
});

// Community routes
Route::prefix('communities')->group(function () {
    Route::get('/', [CommunityController::class, 'index']);
    Route::post('/', [CommunityController::class, 'store']);
    Route::get('/{id}', [CommunityController::class, 'show']);
    Route::put('/{id}', [CommunityController::class, 'update']);
    Route::get('/{id}/smbs', [CommunityController::class, 'smbs']);
    Route::get('/{id}/stats', [CommunityController::class, 'stats']);
});

// Bulk operations
Route::prefix('smbs')->group(function () {
    Route::post('/import', [SMBBulkController::class, 'import']);
    Route::get('/import/{jobId}/status', [SMBBulkController::class, 'importStatus']);
    Route::post('/bulk-update', [SMBBulkController::class, 'bulkUpdate']);
});
```

---

# PHASE 6: JOBS (Days 13-14)

## Task 6.1: Create Scheduled Jobs

**File:** `backend/app/Jobs/RecalculateEngagementScores.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateEngagementScores implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EngagementService $service): void
    {
        Customer::chunk(100, function ($customers) use ($service) {
            foreach ($customers as $customer) {
                $score = $service->calculateScore($customer);
                $customer->update(['engagement_score' => $score]);
            }
        });
    }
}
```

**File:** `backend/app/Jobs/EvaluateTierTransitions.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use App\Services\TierManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EvaluateTierTransitions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EngagementService $engagementService, TierManager $tierManager): void
    {
        Customer::chunk(100, function ($customers) use ($engagementService, $tierManager) {
            foreach ($customers as $customer) {
                $newTier = $engagementService->evaluateTierChange($customer);
                
                if ($newTier !== null) {
                    if ($newTier < $customer->engagement_tier) {
                        $tierManager->upgradeTier($customer, $newTier);
                    } else {
                        $tierManager->downgradeTier($customer, $newTier);
                    }
                }
            }
        });
    }
}
```

**File:** `backend/app/Jobs/AdvanceManifestDestinyDay.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\SMBCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AdvanceManifestDestinyDay implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(SMBCampaignService $service): void
    {
        Customer::where('campaign_status', 'running')
            ->whereNotNull('manifest_destiny_day')
            ->chunk(100, function ($customers) use ($service) {
                foreach ($customers as $customer) {
                    $service->advanceDay($customer);
                }
            });
    }
}
```

**File:** `backend/app/Jobs/CleanupDeletedSMBs.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class CleanupDeletedSMBs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $cutoffDate = Carbon::now()->subDays(90);

        Customer::onlyTrashed()
            ->where('deleted_at', '<', $cutoffDate)
            ->forceDelete();
    }
}
```

**File:** `backend/app/Jobs/RecalculateDataQuality.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateDataQuality implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Customer::chunk(100, function ($customers) {
            foreach ($customers as $customer) {
                $score = $this->calculateDataQuality($customer);
                $customer->update(['data_quality_score' => $score]);
            }
        });
    }

    private function calculateDataQuality(Customer $customer): int
    {
        $score = 0;
        $fields = [
            'business_name' => 10,
            'email' => 15,
            'phone' => 15,
            'address_line1' => 10,
            'city' => 10,
            'state' => 10,
            'industry_category' => 10,
            'business_description' => 10,
            'products_services' => 10,
        ];

        foreach ($fields as $field => $points) {
            if (!empty($customer->$field)) {
                $score += $points;
            }
        }

        return min($score, 100);
    }
}
```

**File:** `backend/app/Jobs/ImportSMBs.php`

```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\Community;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportSMBs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $filePath,
        public string $tenantId,
        public ?string $communityId = null,
        public array $options = []
    ) {}

    public function handle(): void
    {
        $file = Storage::get($this->filePath);
        $extension = pathinfo($this->filePath, PATHINFO_EXTENSION);

        if ($extension === 'json') {
            $data = json_decode($file, true);
            $this->importFromJson($data);
        } else {
            $this->importFromCsv($file);
        }

        // Clean up file
        Storage::delete($this->filePath);
    }

    private function importFromJson(array $data): void
    {
        foreach ($data as $row) {
            $this->createCustomer($row);
        }
    }

    private function importFromCsv(string $file): void
    {
        $lines = explode("\n", $file);
        $headers = str_getcsv(array_shift($lines));

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            $values = str_getcsv($line);
            $row = array_combine($headers, $values);
            $this->createCustomer($row);
        }
    }

    private function createCustomer(array $row): void
    {
        Customer::create([
            'tenant_id' => $this->tenantId,
            'community_id' => $this->communityId,
            'business_name' => $row['business_name'] ?? '',
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'address_line1' => $row['address'] ?? null,
            'city' => $row['city'] ?? null,
            'state' => $row['state'] ?? null,
            'zip' => $row['zip'] ?? null,
            'industry_category' => $row['industry'] ?? null,
            'engagement_tier' => 4,
            'engagement_score' => 0,
            'campaign_status' => 'draft',
        ]);
    }
}
```

## Task 6.2: Register Scheduled Jobs

**File:** `backend/app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule): void
{
    // Existing scheduled tasks...
    
    // Daily: Recalculate all engagement scores
    $schedule->job(new \App\Jobs\RecalculateEngagementScores)->dailyAt('02:00');
    
    // Daily: Evaluate tier transitions
    $schedule->job(new \App\Jobs\EvaluateTierTransitions)->dailyAt('03:00');
    
    // Daily: Advance manifest destiny day for active SMBs
    $schedule->job(new \App\Jobs\AdvanceManifestDestinyDay)->dailyAt('00:01');
    
    // Weekly: Clean up soft-deleted SMBs older than 90 days
    $schedule->job(new \App\Jobs\CleanupDeletedSMBs)->weekly();
    
    // Weekly: Data quality score recalculation
    $schedule->job(new \App\Jobs\RecalculateDataQuality)->weeklyOn(0, '04:00');
}
```

---

# PHASE 7: TESTING (Days 15-17)

## Task 7.1: Create Feature Tests

**File:** `backend/tests/Feature/SMBTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Community;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SMBTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_smb()
    {
        $community = Community::factory()->create();
        
        $response = $this->postJson('/api/v1/customers', [
            'business_name' => 'Test Business',
            'primary_email' => 'test@example.com',
            'community_id' => $community->id,
            'tenant_id' => 'test-tenant-id',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('customers', [
            'business_name' => 'Test Business',
            'engagement_tier' => 4,
            'campaign_status' => 'draft',
        ]);
    }

    public function test_engagement_score_increases_on_email_open()
    {
        $customer = Customer::factory()->create([
            'engagement_score' => 0,
            'tenant_id' => 'test-tenant-id',
        ]);

        // Simulate email open
        event(new \App\Events\EmailOpened($customer->id, 'campaign-1'));

        $customer->refresh();
        $this->assertGreaterThan(0, $customer->engagement_score);
    }

    public function test_tier_upgrades_when_score_threshold_met()
    {
        $customer = Customer::factory()->create([
            'engagement_tier' => 4,
            'engagement_score' => 45,
            'tenant_id' => 'test-tenant-id',
        ]);

        // Update score to push over tier 3 threshold (60)
        $customer->update(['engagement_score' => 65]);

        $service = app(\App\Services\EngagementService::class);
        $newTier = $service->evaluateTierChange($customer);
        
        $this->assertEquals(3, $newTier);
    }

    public function test_can_start_campaign()
    {
        $customer = Customer::factory()->create([
            'campaign_status' => 'draft',
            'tenant_id' => 'test-tenant-id',
        ]);

        $response = $this->postJson("/api/v1/customers/{$customer->id}/campaign/start", [
            'tenant_id' => 'test-tenant-id',
        ]);

        $response->assertStatus(200);
        $customer->refresh();
        $this->assertEquals('running', $customer->campaign_status);
        $this->assertEquals(1, $customer->manifest_destiny_day);
    }
}
```

## Task 7.2: Create Unit Tests

**File:** `backend/tests/Unit/Services/EngagementServiceTest.php`

```php
<?php

namespace Tests\Unit\Services;

use App\Models\Customer;
use App\Services\EngagementService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EngagementServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_calculates_engagement_score()
    {
        $customer = Customer::factory()->create([
            'last_email_open' => now()->subDays(5),
            'last_email_click' => now()->subDays(3),
        ]);

        $service = app(EngagementService::class);
        $score = $service->calculateScore($customer);

        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_evaluates_tier_change()
    {
        $customer = Customer::factory()->create([
            'engagement_tier' => 4,
            'engagement_score' => 75,
        ]);

        $service = app(EngagementService::class);
        $newTier = $service->evaluateTierChange($customer);

        $this->assertEquals(2, $newTier); // Score 75 = Tier 2
    }
}
```

---

# PHASE 8: DOCUMENTATION (Day 18)

## Task 8.1: Update API Documentation

Create/update Swagger/OpenAPI documentation for all new endpoints.

## Task 8.2: Create Module Documentation

**File:** `docs/MODULE-1-SMB-CRM.md`

Document:
- Architecture overview
- API endpoints
- Event system
- Scheduled jobs
- Usage examples

---

# IMPLEMENTATION CHECKLIST

## Phase 1: Database & Models
- [ ] Migration: Add SMB fields to customers table
- [ ] Migration: Create communities table
- [ ] Migration: Add community_id to customers
- [ ] Update Customer model (fillable, casts, relationships, scopes, helpers)
- [ ] Create Community model

## Phase 2: Configuration
- [ ] Create config/fibonacco.php with engagement settings

## Phase 3: Services
- [ ] Create EngagementService
- [ ] Create TierManager
- [ ] Create SMBCampaignService
- [ ] Create SMBServiceInterface
- [ ] Create SMBService implementation

## Phase 4: Events & Listeners
- [ ] Create SMBCreated event
- [ ] Create SMBUpdated event
- [ ] Create SMBEngagementChanged event
- [ ] Create SMBTierChanged event
- [ ] Create 7 engagement listeners
- [ ] Register events/listeners in EventServiceProvider

## Phase 5: Controllers
- [ ] Update CustomerController (add new methods, update filters)
- [ ] Create CommunityController
- [ ] Create SMBBulkController
- [ ] Update API routes

## Phase 6: Jobs
- [ ] Create RecalculateEngagementScores job
- [ ] Create EvaluateTierTransitions job
- [ ] Create AdvanceManifestDestinyDay job
- [ ] Create CleanupDeletedSMBs job
- [ ] Create RecalculateDataQuality job
- [ ] Create ImportSMBs job
- [ ] Register scheduled jobs in Kernel

## Phase 7: Testing
- [ ] Create SMBTest feature tests
- [ ] Create EngagementServiceTest unit tests
- [ ] Create TierManagerTest unit tests
- [ ] Create SMBCampaignServiceTest unit tests
- [ ] Create CommunityTest feature tests
- [ ] Create SMBBulkTest feature tests

## Phase 8: Documentation
- [ ] Update API documentation
- [ ] Create module documentation
- [ ] Update README

---

# ACCEPTANCE CRITERIA

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

# NOTES

1. **Naming:** Using "Customer" model name (not "SMB") to maintain consistency with existing codebase
2. **Dependencies:** Some features depend on other modules (campaign_sends, approvals, content_views tables)
3. **Events:** Event definitions from other modules need to be coordinated
4. **Testing:** Use factories for all models in tests
5. **Performance:** Consider caching for engagement scores if needed

---

# ESTIMATED TIMELINE

- **Days 1-3:** Database & Models
- **Day 1:** Configuration
- **Days 4-7:** Services
- **Days 8-9:** Events & Listeners
- **Days 10-12:** Controllers
- **Days 13-14:** Jobs
- **Days 15-17:** Testing
- **Day 18:** Documentation

**Total: 18 days (3.5 weeks)**



