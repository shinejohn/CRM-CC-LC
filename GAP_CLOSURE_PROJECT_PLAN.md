# Fibonacco Platform - Comprehensive Gap Closure Project Plan
## Multi-Agent Execution Guide

**Version:** 1.0  
**Date:** January 20, 2026  
**Scope:** 8 Critical Gaps  
**Estimated Duration:** 8-10 weeks with parallel execution  
**Total Agents:** Up to 6 parallel agents

---

## PROJECT OVERVIEW

### Critical Gaps Identified

| # | Gap | Priority | Complexity | Impact | Parallelizable |
|---|-----|----------|------------|--------|----------------|
| 1 | Campaign Automation Engine | P0 | High | Critical | After Stage 1 |
| 2 | Follow-up on Unopened Emails | P0 | Medium | High | Yes |
| 3 | SMS Intent Classification & Response | P0 | Medium | High | Yes |
| 4 | Sales Pipeline Stages & Kanban | P1 | Medium | High | Yes |
| 5 | Voicemail Transcription Pipeline | P1 | Medium | Medium | Yes |
| 6 | Inbound Email Processing | P1 | High | Medium | Yes |
| 7 | AI Account Manager Contact Channels | P2 | Medium | Medium | Yes |
| 8 | Command Center SMB Dashboard | P2 | High | High | Yes |

### Dependency Graph

```
STAGE 1: Foundation (Sequential - 1 Agent)
├── 1A: Sales Pipeline Database Schema
├── 1B: Campaign Timeline Schema  
├── 1C: Event Infrastructure Extensions
├── 1D: AI AM Contact Channel Schema
└── 1E: Command Center Schema Extensions

STAGE 2: Core Services (Parallel - Up to 6 Agents)
├── Agent A: Campaign Orchestrator Service
├── Agent B: Unopened Email Follow-up System
├── Agent C: SMS Intent Classification System
├── Agent D: Voicemail Transcription Pipeline
├── Agent E: Inbound Email Processing System
└── Agent F: AI AM Contact Channel Service

STAGE 3: Integration & UI (Parallel - Up to 4 Agents)
├── Agent A: Campaign Orchestrator Jobs & Scheduling
├── Agent B: Pipeline Stage Transitions & Kanban UI
├── Agent C: Webhook Handler Updates
└── Agent D: Command Center Dashboard UI

STAGE 4: Testing & Polish (Sequential - 1-2 Agents)
├── Unit Tests
├── Integration Tests
├── E2E Tests
└── Documentation
```

---

# STAGE 1: FOUNDATION
## Timeline: Days 1-4 (Sequential)
## Agent Count: 1

This stage creates all database schemas and base infrastructure that other components depend on.

---

## Task 1A: Sales Pipeline Database Schema

### Objective
Add pipeline stage tracking to the Customer model with full history and Kanban support.

### Files to Create/Modify
```
backend/database/migrations/2026_01_20_000001_add_pipeline_stage_to_customers.php (NEW)
backend/app/Models/Customer.php (MODIFY)
backend/app/Enums/PipelineStage.php (NEW)
backend/database/migrations/2026_01_20_000002_create_pipeline_stage_history_table.php (NEW)
```

### Implementation

**1. Create Pipeline Stage Migration:**
```php
// backend/database/migrations/2026_01_20_000001_add_pipeline_stage_to_customers.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('pipeline_stage')->default('hook')->after('status');
            $table->timestamp('stage_entered_at')->nullable()->after('pipeline_stage');
            $table->timestamp('trial_started_at')->nullable()->after('stage_entered_at');
            $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
            $table->integer('days_in_stage')->default(0)->after('trial_ends_at');
            $table->json('stage_history')->nullable()->after('days_in_stage');
            $table->string('stage_change_trigger')->nullable()->after('stage_history');
            
            $table->index('pipeline_stage');
            $table->index('stage_entered_at');
            $table->index(['pipeline_stage', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['pipeline_stage', 'status']);
            $table->dropIndex(['stage_entered_at']);
            $table->dropIndex(['pipeline_stage']);
            $table->dropColumn([
                'pipeline_stage',
                'stage_entered_at', 
                'trial_started_at',
                'trial_ends_at',
                'days_in_stage',
                'stage_history',
                'stage_change_trigger'
            ]);
        });
    }
};
```

**2. Create Pipeline Stage History Table:**
```php
// backend/database/migrations/2026_01_20_000002_create_pipeline_stage_history_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipeline_stage_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->string('from_stage')->nullable();
            $table->string('to_stage');
            $table->string('trigger'); // engagement_threshold, trial_accepted, manual, etc.
            $table->integer('days_in_previous_stage')->default(0);
            $table->json('metadata')->nullable();
            $table->uuid('changed_by')->nullable(); // User who made the change
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->index('customer_id');
            $table->index('to_stage');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pipeline_stage_history');
    }
};
```

**3. Create PipelineStage Enum:**
```php
// backend/app/Enums/PipelineStage.php

<?php

namespace App\Enums;

enum PipelineStage: string
{
    case HOOK = 'hook';
    case ENGAGEMENT = 'engagement';
    case SALES = 'sales';
    case RETENTION = 'retention';
    case CHURNED = 'churned';
    
    public function label(): string
    {
        return match($this) {
            self::HOOK => 'Hook (Trial)',
            self::ENGAGEMENT => 'Engagement',
            self::SALES => 'Sales',
            self::RETENTION => 'Retention',
            self::CHURNED => 'Churned',
        };
    }
    
    public function color(): string
    {
        return match($this) {
            self::HOOK => 'blue',
            self::ENGAGEMENT => 'yellow',
            self::SALES => 'orange',
            self::RETENTION => 'green',
            self::CHURNED => 'gray',
        };
    }
    
    public function nextStage(): ?self
    {
        return match($this) {
            self::HOOK => self::ENGAGEMENT,
            self::ENGAGEMENT => self::SALES,
            self::SALES => self::RETENTION,
            self::RETENTION => null,
            self::CHURNED => null,
        };
    }
    
    public function previousStage(): ?self
    {
        return match($this) {
            self::HOOK => null,
            self::ENGAGEMENT => self::HOOK,
            self::SALES => self::ENGAGEMENT,
            self::RETENTION => self::SALES,
            self::CHURNED => null,
        };
    }
    
    public static function orderedStages(): array
    {
        return [
            self::HOOK,
            self::ENGAGEMENT,
            self::SALES,
            self::RETENTION,
        ];
    }
    
    public function isActive(): bool
    {
        return $this !== self::CHURNED;
    }
}
```

**4. Update Customer Model:**
```php
// backend/app/Models/Customer.php - ADD these sections

use App\Enums\PipelineStage;
use App\Models\PipelineStageHistory;

// Add to $casts array:
protected $casts = [
    // ... existing casts
    'pipeline_stage' => PipelineStage::class,
    'stage_entered_at' => 'datetime',
    'trial_started_at' => 'datetime',
    'trial_ends_at' => 'datetime',
    'stage_history' => 'array',
];

// Add to $fillable array:
'pipeline_stage',
'stage_entered_at',
'trial_started_at',
'trial_ends_at',
'days_in_stage',
'stage_history',
'stage_change_trigger',

// Add relationship:
public function pipelineStageHistory(): HasMany
{
    return $this->hasMany(PipelineStageHistory::class);
}

// Add methods:
public function advanceToStage(PipelineStage $newStage, string $trigger = 'manual', ?string $changedBy = null): void
{
    $oldStage = $this->pipeline_stage;
    $daysInPrevious = $this->days_in_stage;
    
    $history = $this->stage_history ?? [];
    $history[] = [
        'from' => $oldStage?->value,
        'to' => $newStage->value,
        'at' => now()->toISOString(),
        'days_in_previous' => $daysInPrevious,
        'trigger' => $trigger,
    ];
    
    // Record in history table
    PipelineStageHistory::create([
        'customer_id' => $this->id,
        'from_stage' => $oldStage?->value,
        'to_stage' => $newStage->value,
        'trigger' => $trigger,
        'days_in_previous_stage' => $daysInPrevious,
        'changed_by' => $changedBy,
    ]);
    
    $this->update([
        'pipeline_stage' => $newStage,
        'stage_entered_at' => now(),
        'days_in_stage' => 0,
        'stage_history' => $history,
        'stage_change_trigger' => $trigger,
    ]);
}

public function getDaysInCurrentStageAttribute(): int
{
    if (!$this->stage_entered_at) {
        return 0;
    }
    return $this->stage_entered_at->diffInDays(now());
}

public function getTrialDaysRemainingAttribute(): ?int
{
    if (!$this->trial_ends_at) {
        return null;
    }
    $remaining = now()->diffInDays($this->trial_ends_at, false);
    return max(0, $remaining);
}

public function isInTrial(): bool
{
    return $this->pipeline_stage === PipelineStage::HOOK 
        && $this->trial_ends_at 
        && $this->trial_ends_at->isFuture();
}

public function canAdvanceTo(PipelineStage $stage): bool
{
    if ($stage === PipelineStage::CHURNED) {
        return true; // Can always churn
    }
    
    $nextStage = $this->pipeline_stage?->nextStage();
    return $nextStage === $stage;
}
```

**5. Create PipelineStageHistory Model:**
```php
// backend/app/Models/PipelineStageHistory.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PipelineStageHistory extends Model
{
    protected $table = 'pipeline_stage_history';
    
    protected $fillable = [
        'customer_id',
        'from_stage',
        'to_stage',
        'trigger',
        'days_in_previous_stage',
        'metadata',
        'changed_by',
    ];
    
    protected $casts = [
        'metadata' => 'array',
    ];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
```

### Acceptance Criteria
- [ ] Migration runs without errors
- [ ] Customer model has pipeline_stage field with enum casting
- [ ] advanceToStage() method works and records history in both JSON and table
- [ ] Trial days calculation works correctly
- [ ] PipelineStageHistory relationship works
- [ ] canAdvanceTo() validates transitions correctly

---

## Task 1B: Campaign Timeline Schema

### Objective
Create schema for defining campaign timelines (what happens on each day) with full action tracking.

### Files to Create
```
backend/database/migrations/2026_01_20_000003_create_campaign_timelines.php (NEW)
backend/app/Models/CampaignTimeline.php (NEW)
backend/app/Models/CampaignTimelineAction.php (NEW)
backend/app/Models/CustomerTimelineProgress.php (NEW)
```

### Implementation

**1. Create Migration:**
```php
// backend/database/migrations/2026_01_20_000003_create_campaign_timelines.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Campaign Timeline definitions
        Schema::create('campaign_timelines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('pipeline_stage'); // Which stage this timeline applies to
            $table->integer('duration_days')->default(90);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false); // Default timeline for stage
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('pipeline_stage');
            $table->index('is_active');
            $table->index(['pipeline_stage', 'is_default']);
        });
        
        // Individual actions within a timeline
        Schema::create('campaign_timeline_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_timeline_id')->constrained()->onDelete('cascade');
            $table->integer('day_number'); // Day 1, 2, 3, etc.
            $table->string('channel'); // email, sms, phone, wait, interaction
            $table->string('action_type'); // send_email, send_sms, make_call, check_condition, create_interaction
            $table->string('template_type')->nullable(); // Reference to email/sms template
            $table->string('campaign_id', 50)->nullable(); // Link to campaign content
            $table->json('conditions')->nullable(); // e.g., {"if": "email_opened", "then": "skip"}
            $table->json('parameters')->nullable(); // Additional action parameters
            $table->integer('delay_hours')->default(0); // Hours after day starts
            $table->integer('priority')->default(0); // Order within same day
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('set null');
            $table->index(['campaign_timeline_id', 'day_number']);
            $table->index(['campaign_timeline_id', 'day_number', 'priority']);
            $table->index('channel');
        });
        
        // Track customer progress through timelines
        Schema::create('customer_timeline_progress', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->foreignId('campaign_timeline_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(1);
            $table->timestamp('started_at');
            $table->timestamp('last_action_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->string('status')->default('active'); // active, paused, completed, stopped
            $table->json('completed_actions')->nullable(); // Array of completed action IDs
            $table->json('skipped_actions')->nullable(); // Array of skipped action IDs
            $table->json('failed_actions')->nullable(); // Array of failed action IDs with retry info
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->unique(['customer_id', 'campaign_timeline_id']);
            $table->index('status');
            $table->index('current_day');
            $table->index(['status', 'current_day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_timeline_progress');
        Schema::dropIfExists('campaign_timeline_actions');
        Schema::dropIfExists('campaign_timelines');
    }
};
```

**2. Create Models:**
```php
// backend/app/Models/CampaignTimeline.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\PipelineStage;

class CampaignTimeline extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'pipeline_stage',
        'duration_days',
        'is_active',
        'is_default',
        'metadata',
    ];
    
    protected $casts = [
        'pipeline_stage' => PipelineStage::class,
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'metadata' => 'array',
    ];
    
    public function actions(): HasMany
    {
        return $this->hasMany(CampaignTimelineAction::class)
            ->orderBy('day_number')
            ->orderBy('priority');
    }
    
    public function customerProgress(): HasMany
    {
        return $this->hasMany(CustomerTimelineProgress::class);
    }
    
    public function getActionsForDay(int $day): \Illuminate\Database\Eloquent\Collection
    {
        return $this->actions()
            ->where('day_number', $day)
            ->where('is_active', true)
            ->orderBy('priority')
            ->get();
    }
    
    public static function getActiveForStage(PipelineStage $stage): ?self
    {
        return static::where('pipeline_stage', $stage)
            ->where('is_active', true)
            ->where('is_default', true)
            ->first();
    }
    
    public function getTotalActionsCount(): int
    {
        return $this->actions()->where('is_active', true)->count();
    }
}
```

```php
// backend/app/Models/CampaignTimelineAction.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignTimelineAction extends Model
{
    protected $fillable = [
        'campaign_timeline_id',
        'day_number',
        'channel',
        'action_type',
        'template_type',
        'campaign_id',
        'conditions',
        'parameters',
        'delay_hours',
        'priority',
        'is_active',
        'description',
    ];
    
    protected $casts = [
        'conditions' => 'array',
        'parameters' => 'array',
        'is_active' => 'boolean',
    ];
    
    public function timeline(): BelongsTo
    {
        return $this->belongsTo(CampaignTimeline::class, 'campaign_timeline_id');
    }
    
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }
    
    public function shouldExecute(\App\Models\Customer $customer): bool
    {
        if (!$this->conditions) {
            return true;
        }
        
        return $this->evaluateConditions($customer);
    }
    
    protected function evaluateConditions(\App\Models\Customer $customer): bool
    {
        $conditions = $this->conditions;
        
        // Example: {"if": "email_opened", "within_hours": 48, "then": "skip"}
        if (isset($conditions['if'])) {
            switch ($conditions['if']) {
                case 'email_opened':
                    $hours = $conditions['within_hours'] ?? 48;
                    $recentOpen = $customer->last_email_open && 
                        $customer->last_email_open->diffInHours(now()) <= $hours;
                    
                    if ($recentOpen && ($conditions['then'] ?? '') === 'skip') {
                        return false;
                    }
                    break;
                    
                case 'engagement_score_above':
                    $threshold = $conditions['threshold'] ?? 50;
                    if ($customer->engagement_score >= $threshold && 
                        ($conditions['then'] ?? '') === 'skip') {
                        return false;
                    }
                    break;
                    
                case 'pipeline_stage':
                    $requiredStage = $conditions['stage'] ?? null;
                    if ($customer->pipeline_stage?->value !== $requiredStage) {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }
    
    public function getExecutionTime(\App\Models\CustomerTimelineProgress $progress): \Carbon\Carbon
    {
        $dayStarted = $progress->started_at->copy()->addDays($progress->current_day - 1);
        return $dayStarted->copy()->addHours($this->delay_hours);
    }
}
```

```php
// backend/app/Models/CustomerTimelineProgress.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerTimelineProgress extends Model
{
    protected $table = 'customer_timeline_progress';
    
    protected $fillable = [
        'customer_id',
        'campaign_timeline_id',
        'current_day',
        'started_at',
        'last_action_at',
        'completed_at',
        'paused_at',
        'status',
        'completed_actions',
        'skipped_actions',
        'failed_actions',
        'metadata',
    ];
    
    protected $casts = [
        'started_at' => 'datetime',
        'last_action_at' => 'datetime',
        'completed_at' => 'datetime',
        'paused_at' => 'datetime',
        'completed_actions' => 'array',
        'skipped_actions' => 'array',
        'failed_actions' => 'array',
        'metadata' => 'array',
    ];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function timeline(): BelongsTo
    {
        return $this->belongsTo(CampaignTimeline::class, 'campaign_timeline_id');
    }
    
    public function markActionCompleted(int $actionId): void
    {
        $completed = $this->completed_actions ?? [];
        if (!in_array($actionId, $completed)) {
            $completed[] = $actionId;
            $this->update([
                'completed_actions' => $completed,
                'last_action_at' => now(),
            ]);
        }
    }
    
    public function markActionSkipped(int $actionId, string $reason = ''): void
    {
        $skipped = $this->skipped_actions ?? [];
        if (!in_array($actionId, $skipped)) {
            $skipped[] = $actionId;
            $this->update([
                'skipped_actions' => $skipped,
                'metadata' => array_merge($this->metadata ?? [], [
                    'skip_reasons' => array_merge($this->metadata['skip_reasons'] ?? [], [
                        $actionId => $reason
                    ])
                ])
            ]);
        }
    }
    
    public function markActionFailed(int $actionId, string $error): void
    {
        $failed = $this->failed_actions ?? [];
        $failedInfo = $this->failed_actions ?? [];
        
        if (!isset($failedInfo[$actionId])) {
            $failedInfo[$actionId] = [
                'error' => $error,
                'failed_at' => now()->toISOString(),
                'retry_count' => 0,
            ];
            $failed[] = $actionId;
            
            $this->update([
                'failed_actions' => $failedInfo,
            ]);
        }
    }
    
    public function advanceDay(): void
    {
        $newDay = $this->current_day + 1;
        
        if ($newDay > $this->timeline->duration_days) {
            $this->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } else {
            $this->update(['current_day' => $newDay]);
        }
    }
    
    public function isActionCompleted(int $actionId): bool
    {
        return in_array($actionId, $this->completed_actions ?? []);
    }
    
    public function isActionSkipped(int $actionId): bool
    {
        return in_array($actionId, $this->skipped_actions ?? []);
    }
    
    public function getProgressPercentage(): float
    {
        $totalActions = $this->timeline->getTotalActionsCount();
        $completed = count($this->completed_actions ?? []);
        
        if ($totalActions === 0) {
            return 0;
        }
        
        return round(($completed / $totalActions) * 100, 2);
    }
}
```

### Acceptance Criteria
- [ ] All three tables created successfully
- [ ] Models have proper relationships
- [ ] Condition evaluation works for email_opened, engagement_score, and pipeline_stage
- [ ] Progress tracking advances correctly
- [ ] Failed actions are tracked with retry info
- [ ] Progress percentage calculation works

---

## Task 1C: Event Infrastructure Extensions

### Objective
Add new events for the automation system.

### Files to Create
```
backend/app/Events/EmailNotOpened.php (NEW)
backend/app/Events/SMSReceived.php (NEW)
backend/app/Events/FormSubmitted.php (NEW)
backend/app/Events/EngagementThresholdReached.php (NEW)
backend/app/Events/PipelineStageChanged.php (NEW)
backend/app/Events/VoicemailReceived.php (NEW)
backend/app/Events/InboundEmailReceived.php (NEW)
backend/app/Events/TrialAccepted.php (NEW)
backend/app/Providers/EventServiceProvider.php (MODIFY)
```

### Implementation

**1. Create Events:**

```php
// backend/app/Events/EmailNotOpened.php

<?php

namespace App\Events;

use App\Models\Customer;
use App\Models\CampaignSend;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailNotOpened
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public CampaignSend $campaignSend,
        public int $hoursSinceSent
    ) {}
}
```

```php
// backend/app/Events/SMSReceived.php

<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMSReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromNumber,
        public string $message,
        public ?string $classifiedIntent = null,
        public ?float $intentConfidence = null,
        public ?string $sentiment = null
    ) {}
}
```

```php
// backend/app/Events/FormSubmitted.php

<?php

namespace App\Events;

use App\Models\Customer;
use App\Models\CampaignLandingPage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FormSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public CampaignLandingPage $landingPage,
        public array $formData,
        public ?string $utmSource = null,
        public ?string $utmCampaign = null
    ) {}
}
```

```php
// backend/app/Events/EngagementThresholdReached.php

<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EngagementThresholdReached
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $previousScore,
        public int $newScore,
        public string $thresholdType // 'high', 'medium', 'low'
    ) {}
}
```

```php
// backend/app/Events/PipelineStageChanged.php

<?php

namespace App\Events;

use App\Models\Customer;
use App\Enums\PipelineStage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PipelineStageChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public ?PipelineStage $previousStage,
        public PipelineStage $newStage,
        public string $trigger // What caused the change
    ) {}
}
```

```php
// backend/app/Events/VoicemailReceived.php

<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoicemailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromNumber,
        public string $recordingUrl,
        public ?string $transcription = null,
        public ?int $durationSeconds = null,
        public ?string $urgency = null // low, medium, high
    ) {}
}
```

```php
// backend/app/Events/InboundEmailReceived.php

<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InboundEmailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromEmail,
        public string $subject,
        public string $body,
        public ?string $messageId = null,
        public ?string $inReplyTo = null,
        public ?string $sentiment = null,
        public ?string $classifiedIntent = null
    ) {}
}
```

```php
// backend/app/Events/TrialAccepted.php

<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TrialAccepted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $trialDurationDays = 90
    ) {}
}
```

**2. Register Events in EventServiceProvider:**
```php
// backend/app/Providers/EventServiceProvider.php - ADD to $listen array

use App\Events\EmailNotOpened;
use App\Events\SMSReceived;
use App\Events\FormSubmitted;
use App\Events\EngagementThresholdReached;
use App\Events\PipelineStageChanged;
use App\Events\VoicemailReceived;
use App\Events\InboundEmailReceived;
use App\Events\TrialAccepted;

use App\Listeners\HandleEmailNotOpened;
use App\Listeners\HandleSMSReceived;
use App\Listeners\HandleFormSubmitted;
use App\Listeners\HandleEngagementThreshold;
use App\Listeners\HandlePipelineStageChange;
use App\Listeners\HandleVoicemailReceived;
use App\Listeners\HandleInboundEmailReceived;
use App\Listeners\HandleTrialAccepted;

protected $listen = [
    // ... existing events ...
    
    EmailNotOpened::class => [
        HandleEmailNotOpened::class,
    ],
    
    SMSReceived::class => [
        HandleSMSReceived::class,
    ],
    
    FormSubmitted::class => [
        HandleFormSubmitted::class,
    ],
    
    EngagementThresholdReached::class => [
        HandleEngagementThreshold::class,
    ],
    
    PipelineStageChanged::class => [
        HandlePipelineStageChange::class,
    ],
    
    VoicemailReceived::class => [
        HandleVoicemailReceived::class,
    ],
    
    InboundEmailReceived::class => [
        HandleInboundEmailReceived::class,
    ],
    
    TrialAccepted::class => [
        HandleTrialAccepted::class,
    ],
];
```

### Acceptance Criteria
- [ ] All 8 events created
- [ ] Events registered in EventServiceProvider
- [ ] Events can be dispatched without errors
- [ ] Event properties are properly typed

---

## Task 1D: AI Account Manager Contact Channel Schema

### Objective
Add dedicated contact channels (phone, email, SMS) to AI Personality model.

### Files to Create/Modify
```
backend/database/migrations/2026_01_20_000004_add_contact_channels_to_ai_personalities.php (NEW)
backend/app/Models/AiPersonality.php (MODIFY)
```

### Implementation

**1. Create Migration:**
```php
// backend/database/migrations/2026_01_20_000004_add_contact_channels_to_ai_personalities.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_personalities', function (Blueprint $table) {
            $table->string('phone_number')->nullable()->after('name');
            $table->string('email_address')->nullable()->after('phone_number');
            $table->string('sms_number')->nullable()->after('email_address');
            $table->text('voicemail_greeting')->nullable()->after('sms_number');
            $table->json('contact_preferences')->nullable()->after('voicemail_greeting');
            // e.g., {"preferred_channel": "email", "business_hours": "9-5", "timezone": "America/New_York"}
            
            $table->index('phone_number');
            $table->index('email_address');
        });
    }

    public function down(): void
    {
        Schema::table('ai_personalities', function (Blueprint $table) {
            $table->dropIndex(['email_address']);
            $table->dropIndex(['phone_number']);
            $table->dropColumn([
                'phone_number',
                'email_address',
                'sms_number',
                'voicemail_greeting',
                'contact_preferences',
            ]);
        });
    }
};
```

**2. Update AiPersonality Model:**
```php
// backend/app/Models/AiPersonality.php - ADD

protected $fillable = [
    // ... existing fields ...
    'phone_number',
    'email_address',
    'sms_number',
    'voicemail_greeting',
    'contact_preferences',
];

protected $casts = [
    // ... existing casts ...
    'contact_preferences' => 'array',
];

public function hasPhoneChannel(): bool
{
    return !empty($this->phone_number);
}

public function hasEmailChannel(): bool
{
    return !empty($this->email_address);
}

public function hasSMSChannel(): bool
{
    return !empty($this->sms_number);
}
```

### Acceptance Criteria
- [ ] Migration runs successfully
- [ ] AiPersonality model has contact channel fields
- [ ] Helper methods work correctly

---

## Task 1E: Command Center Schema Extensions

### Objective
Add schema for SMB dashboard features (trial countdown, value tracking, etc.).

### Files to Create
```
backend/database/migrations/2026_01_20_000005_add_command_center_fields_to_customers.php (NEW)
backend/database/migrations/2026_01_20_000006_create_smb_dashboard_widgets_table.php (NEW)
```

### Implementation

**1. Add Command Center Fields:**
```php
// backend/database/migrations/2026_01_20_000005_add_command_center_fields_to_customers.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Trial tracking
            $table->timestamp('trial_started_at')->nullable()->after('trial_ends_at');
            $table->boolean('trial_active')->default(false)->after('trial_started_at');
            
            // Value delivered tracking
            $table->decimal('value_delivered_usd', 10, 2)->default(0)->after('trial_active');
            // e.g., $500 in ad value, $200 in content value
            
            // Platform status
            $table->json('platform_status')->nullable()->after('value_delivered_usd');
            // e.g., {"day_news": "active", "dtg": "active", "gec": "pending", "alphasite": "inactive"}
            
            // Dashboard preferences
            $table->json('dashboard_preferences')->nullable()->after('platform_status');
            // e.g., {"widgets": ["trial_countdown", "value_tracker", "recent_content"], "theme": "light"}
            
            $table->index('trial_active');
            $table->index('trial_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['trial_ends_at']);
            $table->dropIndex(['trial_active']);
            $table->dropColumn([
                'trial_started_at',
                'trial_active',
                'value_delivered_usd',
                'platform_status',
                'dashboard_preferences',
            ]);
        });
    }
};
```

**2. Create Dashboard Widgets Table:**
```php
// backend/database/migrations/2026_01_20_000006_create_smb_dashboard_widgets_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('smb_dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->string('widget_type'); // trial_countdown, value_tracker, recent_content, platform_status, etc.
            $table->string('position'); // top_left, top_right, bottom_left, bottom_right, main
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('config')->nullable(); // Widget-specific configuration
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->index(['customer_id', 'is_visible']);
            $table->index(['customer_id', 'position', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('smb_dashboard_widgets');
    }
};
```

### Acceptance Criteria
- [ ] Migrations run successfully
- [ ] Customer model has command center fields
- [ ] Dashboard widgets table created
- [ ] Indexes are properly created

---

# STAGE 2: CORE SERVICES
## Timeline: Days 5-18 (Parallel)
## Agent Count: Up to 6

These tasks can be executed in parallel by different agents.

---

## AGENT A: Campaign Orchestrator Service

### Objective
Build the "brain" that executes campaign timelines for customers automatically.

### Files to Create
```
backend/app/Services/CampaignOrchestratorService.php (NEW)
backend/app/Services/CampaignActionExecutor.php (NEW)
backend/app/Contracts/CampaignOrchestratorInterface.php (NEW)
```

### Implementation

**See attached file for full implementation** - This matches the example plan exactly:
- CampaignOrchestratorInterface contract
- CampaignOrchestratorService with timeline execution
- CampaignActionExecutor with action handlers
- Service provider registration

### Acceptance Criteria
- [ ] CampaignOrchestratorService can start a customer on a timeline
- [ ] Actions execute in correct order based on day_number and priority
- [ ] Conditions are evaluated correctly
- [ ] Day advancement works when all actions complete
- [ ] Pausing and resuming timelines works

---

## AGENT B: Unopened Email Follow-up System

### Objective
Build automated follow-up for emails not opened within X hours.

### Files to Create
```
backend/app/Jobs/CheckUnopenedEmails.php (NEW)
backend/app/Listeners/HandleEmailNotOpened.php (NEW)
backend/app/Services/EmailFollowupService.php (NEW)
backend/database/migrations/2026_01_20_000007_add_followup_triggered_at_to_campaign_sends.php (NEW)
```

### Implementation

**See attached file for full implementation** - This matches the example plan exactly:
- CheckUnopenedEmails job
- HandleEmailNotOpened listener
- EmailFollowupService with strategy logic
- Migration for followup_triggered_at

### Acceptance Criteria
- [ ] CheckUnopenedEmails job finds emails not opened in 48 hours
- [ ] EmailNotOpened event fires correctly
- [ ] Follow-up strategy logic considers engagement score
- [ ] Email resend, SMS, and call scheduling all work
- [ ] Escalation triggers after 2 failed follow-ups

---

## AGENT C: SMS Intent Classification System

### Objective
Build NLP-based SMS response handler that classifies intent and responds appropriately.

### Files to Create
```
backend/app/Services/SMSIntentClassifier.php (NEW)
backend/app/Services/SMSResponseHandler.php (NEW)
backend/app/Listeners/HandleSMSReceived.php (NEW)
backend/app/Http/Controllers/Api/TwilioSMSWebhookController.php (NEW)
```

### Implementation

**See attached file for full implementation** - This matches the example plan exactly:
- SMSIntentClassifier with pattern matching and AI fallback
- SMSResponseHandler with intent-based responses
- HandleSMSReceived listener
- TwilioSMSWebhookController

### Acceptance Criteria
- [ ] SMS intent classifier correctly identifies yes/no/question/call_request
- [ ] Pattern matching works for common responses
- [ ] AI fallback works for ambiguous messages
- [ ] YES response sends landing page link and updates CRM
- [ ] NO response handles opt-out gracefully
- [ ] Questions trigger AI-generated answers
- [ ] Engagement score updates on SMS interaction

---

## AGENT D: Voicemail Transcription Pipeline

### Objective
Build automated voicemail transcription and processing.

### Files to Create
```
backend/app/Services/VoicemailTranscriptionService.php (NEW)
backend/app/Jobs/ProcessVoicemail.php (NEW)
backend/app/Listeners/HandleVoicemailReceived.php (NEW)
backend/app/Http/Controllers/Api/TwilioVoicemailWebhookController.php (NEW)
```

### Implementation

**See attached file for full implementation** - This matches the example plan exactly:
- VoicemailTranscriptionService with OpenAI Whisper integration
- ProcessVoicemail job
- HandleVoicemailReceived listener
- TwilioVoicemailWebhookController

### Acceptance Criteria
- [ ] Voicemail recording is downloaded and transcribed
- [ ] Transcription is analyzed for urgency, intent, and action items
- [ ] Urgent voicemails trigger immediate callback scheduling
- [ ] Acknowledgment SMS is sent for all voicemails
- [ ] Interactions are logged with full metadata

---

## AGENT E: Inbound Email Processing System

### Objective
Build complete inbound email processing with sentiment analysis and intent classification.

### Files to Create
```
backend/app/Services/InboundEmailService.php (NEW)
backend/app/Services/EmailIntentClassifier.php (NEW)
backend/app/Services/EmailSentimentAnalyzer.php (NEW)
backend/app/Listeners/HandleInboundEmailReceived.php (NEW)
backend/app/Http/Controllers/Api/InboundEmailWebhookController.php (NEW)
```

### Implementation

```php
// backend/app/Services/InboundEmailService.php

<?php

namespace App\Services;

use App\Models\Customer;
use App\Events\InboundEmailReceived;
use App\Models\Conversation;
use Illuminate\Support\Facades\Log;

class InboundEmailService
{
    public function __construct(
        protected EmailIntentClassifier $intentClassifier,
        protected EmailSentimentAnalyzer $sentimentAnalyzer
    ) {}
    
    /**
     * Process an inbound email.
     */
    public function process(
        Customer $customer,
        string $fromEmail,
        string $subject,
        string $body,
        ?string $messageId = null,
        ?string $inReplyTo = null
    ): array {
        // Classify intent
        $intent = $this->intentClassifier->classify($subject, $body);
        
        // Analyze sentiment
        $sentiment = $this->sentimentAnalyzer->analyze($body);
        
        // Log conversation
        $conversation = $this->logConversation($customer, $subject, $body, $intent, $sentiment, $inReplyTo);
        
        // Fire event
        event(new InboundEmailReceived(
            customer: $customer,
            fromEmail: $fromEmail,
            subject: $subject,
            body: $body,
            messageId: $messageId,
            inReplyTo: $inReplyTo,
            sentiment: $sentiment,
            classifiedIntent: $intent['intent']
        ));
        
        return [
            'conversation_id' => $conversation->id,
            'intent' => $intent,
            'sentiment' => $sentiment,
        ];
    }
    
    protected function logConversation(
        Customer $customer,
        string $subject,
        string $body,
        array $intent,
        string $sentiment,
        ?string $inReplyTo
    ): Conversation {
        return Conversation::create([
            'customer_id' => $customer->id,
            'entry_point' => 'email',
            'subject' => $subject,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $body,
                    'timestamp' => now()->toISOString(),
                ]
            ],
            'sentiment_trajectory' => [$sentiment],
            'outcome' => $intent['intent'],
            'metadata' => [
                'intent' => $intent,
                'in_reply_to' => $inReplyTo,
            ],
        ]);
    }
}
```

```php
// backend/app/Services/EmailIntentClassifier.php

<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailIntentClassifier
{
    protected array $intentPatterns = [
        'question' => ['?', 'what', 'how', 'when', 'where', 'why', 'can you', 'could you', 'explain', 'help'],
        'complaint' => ['problem', 'issue', 'broken', 'not working', 'error', 'bug', 'disappointed', 'unhappy'],
        'request' => ['please', 'can you', 'would you', 'need', 'want', 'request'],
        'appointment' => ['schedule', 'meeting', 'call', 'appointment', 'book', 'calendar', 'available'],
        'support' => ['help', 'support', 'assistance', 'troubleshoot', 'fix'],
        'pricing' => ['price', 'cost', 'pricing', 'how much', 'expensive', 'budget'],
    ];
    
    public function classify(string $subject, string $body): array
    {
        $text = strtolower($subject . ' ' . $body);
        $scores = [];
        
        // Pattern matching
        foreach ($this->intentPatterns as $intent => $patterns) {
            $score = $this->calculatePatternScore($text, $patterns);
            if ($score > 0) {
                $scores[$intent] = $score;
            }
        }
        
        // If high confidence pattern match, use it
        if (!empty($scores)) {
            arsort($scores);
            $topIntent = array_key_first($scores);
            $confidence = $scores[$topIntent];
            
            if ($confidence >= 0.7) {
                return [
                    'intent' => $topIntent,
                    'confidence' => $confidence,
                    'method' => 'pattern',
                ];
            }
        }
        
        // Use AI for complex classification
        return $this->classifyWithAI($text, $scores);
    }
    
    protected function calculatePatternScore(string $text, array $patterns): float
    {
        $score = 0;
        foreach ($patterns as $pattern) {
            if (str_contains($text, $pattern)) {
                $score += 0.3;
            }
        }
        return min(1.0, $score);
    }
    
    protected function classifyWithAI(string $text, array $existingScores): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Classify email intent: question, complaint, request, appointment, support, pricing, other. Respond JSON: {"intent": "...", "confidence": 0.0-1.0}'
                    ],
                    ['role' => 'user', 'content' => substr($text, 0, 1000)]
                ],
                'max_tokens' => 50,
            ]);
            
            $content = $response->json('choices.0.message.content') ?? '{}';
            $parsed = json_decode($content, true);
            
            return [
                'intent' => $parsed['intent'] ?? 'other',
                'confidence' => $parsed['confidence'] ?? 0.5,
                'method' => 'ai',
            ];
            
        } catch (\Exception $e) {
            Log::error("AI email intent classification failed: " . $e->getMessage());
            
            return [
                'intent' => !empty($existingScores) ? array_key_first($existingScores) : 'other',
                'confidence' => !empty($existingScores) ? reset($existingScores) : 0.3,
                'method' => 'fallback',
            ];
        }
    }
}
```

```php
// backend/app/Services/EmailSentimentAnalyzer.php

<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailSentimentAnalyzer
{
    protected array $positiveWords = [
        'thanks', 'thank you', 'great', 'awesome', 'love', 'excellent', 'perfect', 
        'wonderful', 'amazing', 'happy', 'excited', 'pleased', 'satisfied'
    ];
    
    protected array $negativeWords = [
        'terrible', 'awful', 'hate', 'angry', 'frustrated', 'annoyed', 'disappointed',
        'worst', 'horrible', 'bad', 'unhappy', 'upset', 'furious'
    ];
    
    public function analyze(string $body): string
    {
        $text = strtolower($body);
        
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($this->positiveWords as $word) {
            if (str_contains($text, $word)) $positiveCount++;
        }
        
        foreach ($this->negativeWords as $word) {
            if (str_contains($text, $word)) $negativeCount++;
        }
        
        // Simple rule-based analysis
        if ($positiveCount > $negativeCount && $positiveCount > 0) {
            return 'positive';
        }
        
        if ($negativeCount > $positiveCount && $negativeCount > 0) {
            return 'negative';
        }
        
        // For more nuanced analysis, use AI
        return $this->analyzeWithAI($body);
    }
    
    protected function analyzeWithAI(string $body): string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openrouter.api_key'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Analyze sentiment: positive, neutral, negative. Respond JSON: {"sentiment": "..."}'
                    ],
                    ['role' => 'user', 'content' => substr($body, 0, 1000)]
                ],
                'max_tokens' => 20,
            ]);
            
            $content = $response->json('choices.0.message.content') ?? '{}';
            $parsed = json_decode($content, true);
            
            return $parsed['sentiment'] ?? 'neutral';
            
        } catch (\Exception $e) {
            Log::error("AI sentiment analysis failed: " . $e->getMessage());
            return 'neutral';
        }
    }
}
```

```php
// backend/app/Listeners/HandleInboundEmailReceived.php

<?php

namespace App\Listeners;

use App\Events\InboundEmailReceived;
use App\Services\InboundEmailRoutingService;
use Illuminate\Contracts\Queue\ShouldQueue;

class HandleInboundEmailReceived implements ShouldQueue
{
    public function __construct(
        protected InboundEmailRoutingService $routingService
    ) {}

    public function handle(InboundEmailReceived $event): void
    {
        $this->routingService->route($event);
    }
}
```

```php
// backend/app/Services/InboundEmailRoutingService.php

<?php

namespace App\Services;

use App\Events\InboundEmailReceived;
use App\Models\Interaction;
use App\Jobs\SendEmailCampaign;
use Illuminate\Support\Facades\Log;

class InboundEmailRoutingService
{
    /**
     * Route inbound email based on intent and sentiment.
     */
    public function route(InboundEmailReceived $event): void
    {
        $intent = $event->classifiedIntent;
        $sentiment = $event->sentiment;
        
        match($intent) {
            'question' => $this->handleQuestion($event),
            'complaint' => $this->handleComplaint($event),
            'request' => $this->handleRequest($event),
            'appointment' => $this->handleAppointment($event),
            'support' => $this->handleSupport($event),
            'pricing' => $this->handlePricing($event),
            default => $this->handleOther($event),
        };
        
        // If negative sentiment, escalate
        if ($sentiment === 'negative') {
            $this->escalateToHuman($event);
        }
    }
    
    protected function handleQuestion(InboundEmailReceived $event): void
    {
        // Generate AI answer and send response
        // TODO: Integrate with AI service
        Log::info("Handling question from customer {$event->customer->id}");
    }
    
    protected function handleComplaint(InboundEmailReceived $event): void
    {
        // High priority - create interaction and notify team
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'complaint',
            'channel' => 'email',
            'status' => 'pending',
            'priority' => 'high',
            'notes' => "Complaint: {$event->subject}",
            'metadata' => [
                'sentiment' => $event->sentiment,
                'message_id' => $event->messageId,
            ],
        ]);
    }
    
    protected function handleRequest(InboundEmailReceived $event): void
    {
        // Create interaction for request fulfillment
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'request',
            'channel' => 'email',
            'status' => 'pending',
            'notes' => $event->subject,
        ]);
    }
    
    protected function handleAppointment(InboundEmailReceived $event): void
    {
        // Schedule appointment
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'appointment_request',
            'channel' => 'email',
            'status' => 'pending',
            'notes' => "Appointment request: {$event->subject}",
        ]);
    }
    
    protected function handleSupport(InboundEmailReceived $event): void
    {
        // Route to support team
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'support_request',
            'channel' => 'email',
            'status' => 'pending',
            'priority' => 'normal',
            'notes' => $event->body,
        ]);
    }
    
    protected function handlePricing(InboundEmailReceived $event): void
    {
        // Send pricing information
        SendEmailCampaign::dispatch($event->customer, null, 'pricing_info', []);
    }
    
    protected function handleOther(InboundEmailReceived $event): void
    {
        // Flag for human review
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'email_needs_review',
            'channel' => 'email',
            'status' => 'pending',
            'notes' => "Unclassified email: {$event->subject}",
        ]);
    }
    
    protected function escalateToHuman(InboundEmailReceived $event): void
    {
        Interaction::create([
            'customer_id' => $event->customer->id,
            'type' => 'human_escalation',
            'channel' => 'email',
            'status' => 'pending',
            'priority' => 'high',
            'notes' => "Negative sentiment detected: {$event->subject}",
        ]);
    }
}
```

### Acceptance Criteria
- [ ] Inbound emails are received and parsed
- [ ] Intent classification works (question, complaint, request, etc.)
- [ ] Sentiment analysis works (positive, neutral, negative)
- [ ] Emails are routed to appropriate handlers
- [ ] Negative sentiment triggers escalation
- [ ] Conversations are logged correctly

---

## AGENT F: AI Account Manager Contact Channel Service

### Objective
Enable AI Account Managers to proactively initiate contact via dedicated channels.

### Files to Create
```
backend/app/Services/AiAccountManagerContactService.php (NEW)
backend/app/Jobs/ProactiveAMContact.php (NEW)
```

### Implementation

```php
// backend/app/Services/AiAccountManagerContactService.php

<?php

namespace App\Services;

use App\Models\AiPersonality;
use App\Models\Customer;
use App\Jobs\SendEmailCampaign;
use App\Jobs\SendSMS;
use App\Jobs\MakePhoneCall;
use Illuminate\Support\Facades\Log;

class AiAccountManagerContactService
{
    /**
     * Initiate proactive contact from AM to customer.
     */
    public function initiateContact(
        AiPersonality $personality,
        Customer $customer,
        string $channel, // email, sms, phone
        string $reason, // check_in, follow_up, value_delivery, etc.
        array $options = []
    ): array {
        if (!$this->canContactViaChannel($personality, $channel)) {
            throw new \InvalidArgumentException("Personality {$personality->id} cannot contact via {$channel}");
        }
        
        return match($channel) {
            'email' => $this->sendEmail($personality, $customer, $reason, $options),
            'sms' => $this->sendSMS($personality, $customer, $reason, $options),
            'phone' => $this->makeCall($personality, $customer, $reason, $options),
            default => throw new \InvalidArgumentException("Unknown channel: {$channel}"),
        };
    }
    
    protected function canContactViaChannel(AiPersonality $personality, string $channel): bool
    {
        return match($channel) {
            'email' => $personality->hasEmailChannel(),
            'sms' => $personality->hasSMSChannel(),
            'phone' => $personality->hasPhoneChannel(),
            default => false,
        };
    }
    
    protected function sendEmail(AiPersonality $personality, Customer $customer, string $reason, array $options): array
    {
        $template = $this->getEmailTemplate($reason, $options);
        
        SendEmailCampaign::dispatch($customer, null, $template, [
            'from_email' => $personality->email_address,
            'from_name' => $personality->name,
            'reason' => $reason,
        ]);
        
        Log::info("AM {$personality->id} sent email to customer {$customer->id} for reason: {$reason}");
        
        return ['channel' => 'email', 'dispatched' => true];
    }
    
    protected function sendSMS(AiPersonality $personality, Customer $customer, string $reason, array $options): array
    {
        $message = $this->getSMSMessage($reason, $customer, $options);
        
        SendSMS::dispatch($customer, $message, null, [
            'from_number' => $personality->sms_number,
            'reason' => $reason,
        ]);
        
        Log::info("AM {$personality->id} sent SMS to customer {$customer->id} for reason: {$reason}");
        
        return ['channel' => 'sms', 'dispatched' => true];
    }
    
    protected function makeCall(AiPersonality $personality, Customer $customer, string $reason, array $options): array
    {
        $scriptId = $options['script_id'] ?? $this->getScriptForReason($reason);
        
        MakePhoneCall::dispatch($customer, $scriptId, [
            'from_number' => $personality->phone_number,
            'reason' => $reason,
        ]);
        
        Log::info("AM {$personality->id} initiated call to customer {$customer->id} for reason: {$reason}");
        
        return ['channel' => 'phone', 'dispatched' => true];
    }
    
    protected function getEmailTemplate(string $reason, array $options): string
    {
        return match($reason) {
            'check_in' => 'am_check_in',
            'follow_up' => 'am_follow_up',
            'value_delivery' => 'am_value_delivery',
            'trial_reminder' => 'am_trial_reminder',
            default => 'am_general',
        };
    }
    
    protected function getSMSMessage(string $reason, Customer $customer, array $options): string
    {
        $name = $customer->contact_name ?? 'there';
        
        return match($reason) {
            'check_in' => "Hi {$name}! Just checking in - how's everything going? Reply if you need anything!",
            'follow_up' => "Hey {$name}, following up on our last conversation. Any questions?",
            'value_delivery' => "Hi {$name}! I just published something new for you. Check it out: [link]",
            'trial_reminder' => "Hi {$name}! Your trial ends in {$options['days']} days. Want to chat about continuing?",
            default => "Hi {$name}! Just wanted to touch base. How can I help?",
        };
    }
    
    protected function getScriptForReason(string $reason): ?string
    {
        return match($reason) {
            'check_in' => 'am_check_in_script',
            'follow_up' => 'am_follow_up_script',
            'trial_reminder' => 'am_trial_reminder_script',
            default => null,
        };
    }
}
```

### Acceptance Criteria
- [ ] AM can initiate email contact
- [ ] AM can initiate SMS contact
- [ ] AM can initiate phone calls
- [ ] Channel availability is checked before contact
- [ ] Contacts are logged as interactions

---

# STAGE 3: INTEGRATION & UI
## Timeline: Days 19-28 (Parallel)
## Agent Count: Up to 4

---

## AGENT A: Campaign Orchestrator Jobs & Scheduling

### Files to Create/Modify
```
backend/app/Jobs/ProcessCampaignTimelines.php (NEW)
backend/app/Jobs/AdvanceCampaignDays.php (NEW)
backend/app/Console/Kernel.php (MODIFY)
backend/app/Console/Commands/SeedDefaultTimeline.php (NEW)
```

### Implementation

**See attached file for full implementation** - Matches example plan exactly.

### Acceptance Criteria
- [ ] ProcessCampaignTimelines job runs hourly
- [ ] AdvanceCampaignDays job advances customers daily
- [ ] Default 90-day timeline seeded correctly
- [ ] Jobs registered in Kernel

---

## AGENT B: Pipeline Stage Transitions & Kanban UI

### Files to Create
```
backend/app/Services/PipelineTransitionService.php (NEW)
backend/app/Listeners/HandlePipelineStageChange.php (NEW)
backend/app/Listeners/AdvanceStageOnEngagementThreshold.php (NEW)
backend/app/Listeners/AdvanceStageOnTrialAcceptance.php (NEW)
src/pages/CRM/Pipeline/KanbanBoard.tsx (NEW)
src/components/CRM/PipelineStageCard.tsx (NEW)
```

### Implementation

**Backend Services:**

```php
// backend/app/Services/PipelineTransitionService.php

<?php

namespace App\Services;

use App\Models\Customer;
use App\Enums\PipelineStage;
use App\Events\PipelineStageChanged;
use App\Services\CampaignOrchestratorService;
use Illuminate\Support\Facades\Log;

class PipelineTransitionService
{
    public function __construct(
        protected CampaignOrchestratorService $orchestrator
    ) {}
    
    public function transition(Customer $customer, PipelineStage $newStage, string $trigger): bool
    {
        $currentStage = $customer->pipeline_stage;
        
        if (!$this->isValidTransition($currentStage, $newStage)) {
            Log::warning("Invalid pipeline transition attempted", [
                'customer_id' => $customer->id,
                'from' => $currentStage?->value,
                'to' => $newStage->value,
            ]);
            return false;
        }
        
        $customer->advanceToStage($newStage, $trigger);
        
        event(new PipelineStageChanged($customer, $currentStage, $newStage, $trigger));
        
        Log::info("Customer {$customer->id} transitioned from {$currentStage?->value} to {$newStage->value}");
        
        return true;
    }
    
    protected function isValidTransition(?PipelineStage $from, PipelineStage $to): bool
    {
        if ($to === PipelineStage::CHURNED) {
            return true;
        }
        
        if ($from === null) {
            return true;
        }
        
        $validNext = $from->nextStage();
        return $validNext === $to;
    }
    
    public function checkEngagementThreshold(Customer $customer): void
    {
        $score = $customer->engagement_score;
        $stage = $customer->pipeline_stage;
        
        $thresholds = [
            PipelineStage::HOOK->value => 50,
            PipelineStage::ENGAGEMENT->value => 80,
        ];
        
        $threshold = $thresholds[$stage->value] ?? null;
        
        if ($threshold && $score >= $threshold) {
            $nextStage = $stage->nextStage();
            if ($nextStage) {
                $this->transition($customer, $nextStage, 'engagement_threshold');
            }
        }
    }
    
    public function handleTrialAcceptance(Customer $customer): void
    {
        if ($customer->pipeline_stage !== PipelineStage::HOOK) {
            return;
        }
        
        $customer->update([
            'trial_started_at' => now(),
            'trial_ends_at' => now()->addDays(90),
            'trial_active' => true,
        ]);
        
        $this->orchestrator->assignTimelineForStage($customer);
        
        Log::info("Trial started for customer {$customer->id}");
    }
    
    public function handleConversion(Customer $customer): void
    {
        if ($customer->pipeline_stage === PipelineStage::SALES) {
            $this->transition($customer, PipelineStage::RETENTION, 'conversion');
        }
    }
}
```

**Frontend Kanban Board:**

```typescript
// src/pages/CRM/Pipeline/KanbanBoard.tsx

import React, { useState, useEffect } from 'react';
import { PipelineStageCard } from '@/components/CRM/PipelineStageCard';
import { PipelineStage } from '@/types/crm';
import { customerApi } from '@/services/crm/customer-api';

export const KanbanBoard: React.FC = () => {
  const [customers, setCustomers] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const stages = ['hook', 'engagement', 'sales', 'retention'];
    const stageCustomers: Record<string, any[]> = {};

    for (const stage of stages) {
      const response = await customerApi.getCustomersByStage(stage);
      stageCustomers[stage] = response.data;
    }

    setCustomers(stageCustomers);
    setLoading(false);
  };

  const handleStageChange = async (customerId: string, newStage: PipelineStage) => {
    await customerApi.updatePipelineStage(customerId, newStage);
    await loadCustomers(); // Reload
  };

  if (loading) {
    return <div>Loading pipeline...</div>;
  }

  return (
    <div className="pipeline-kanban">
      <div className="kanban-header">
        <h1>Sales Pipeline</h1>
      </div>
      <div className="kanban-columns">
        {PipelineStage.orderedStages().map((stage) => (
          <div key={stage} className="kanban-column">
            <div className="column-header">
              <h2>{PipelineStage.label(stage)}</h2>
              <span className="count">({customers[stage]?.length || 0})</span>
            </div>
            <div className="column-cards">
              {customers[stage]?.map((customer) => (
                <PipelineStageCard
                  key={customer.id}
                  customer={customer}
                  onStageChange={(newStage) => handleStageChange(customer.id, newStage)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Acceptance Criteria
- [ ] Customers can transition between stages
- [ ] Invalid transitions are blocked
- [ ] Stage changes trigger new timeline assignment
- [ ] Engagement threshold advancement works
- [ ] Trial acceptance starts timeline
- [ ] Kanban board displays customers by stage
- [ ] Drag-and-drop stage changes work

---

## AGENT C: Webhook Handler Updates

### Files to Modify
```
backend/app/Http/Controllers/Api/WebhookController.php (MODIFY)
backend/routes/api.php (MODIFY)
```

### Implementation

**See attached file for full implementation** - Matches example plan exactly.

### Acceptance Criteria
- [ ] SMS webhook routes to SMSReceived event
- [ ] Voicemail webhook routes to VoicemailReceived event
- [ ] Email open tracking fires EmailOpened event
- [ ] Inbound email webhook processes correctly
- [ ] All webhooks return appropriate responses

---

## AGENT D: Command Center Dashboard UI

### Files to Create
```
src/pages/CommandCenter/Index.tsx (NEW)
src/components/CommandCenter/TrialCountdown.tsx (NEW)
src/components/CommandCenter/ValueTracker.tsx (NEW)
src/components/CommandCenter/PlatformStatus.tsx (NEW)
src/components/CommandCenter/RecentContent.tsx (NEW)
src/components/CommandCenter/QuickActions.tsx (NEW)
src/services/command-center-api.ts (NEW)
```

### Implementation

```typescript
// src/pages/CommandCenter/Index.tsx

import React from 'react';
import { TrialCountdown } from '@/components/CommandCenter/TrialCountdown';
import { ValueTracker } from '@/components/CommandCenter/ValueTracker';
import { PlatformStatus } from '@/components/CommandCenter/PlatformStatus';
import { RecentContent } from '@/components/CommandCenter/RecentContent';
import { QuickActions } from '@/components/CommandCenter/QuickActions';

export const CommandCenterDashboard: React.FC = () => {
  return (
    <div className="command-center-dashboard">
      <div className="dashboard-header">
        <h1>Command Center</h1>
        <p>Your business hub</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="widget-trial">
          <TrialCountdown />
        </div>
        
        <div className="widget-value">
          <ValueTracker />
        </div>
        
        <div className="widget-platform">
          <PlatformStatus />
        </div>
        
        <div className="widget-content">
          <RecentContent />
        </div>
        
        <div className="widget-actions">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
```

```typescript
// src/components/CommandCenter/TrialCountdown.tsx

import React, { useState, useEffect } from 'react';
import { commandCenterApi } from '@/services/command-center-api';

export const TrialCountdown: React.FC = () => {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    loadTrialInfo();
  }, []);

  const loadTrialInfo = async () => {
    const info = await commandCenterApi.getTrialInfo();
    setDaysRemaining(info.days_remaining);
    setTrialActive(info.trial_active);
  };

  if (!trialActive) {
    return null;
  }

  return (
    <div className="trial-countdown-widget">
      <h3>Trial Countdown</h3>
      <div className="countdown-display">
        <span className="days">{daysRemaining}</span>
        <span className="label">days remaining</span>
      </div>
      <button className="upgrade-button">Upgrade Now</button>
    </div>
  );
};
```

### Acceptance Criteria
- [ ] Dashboard displays trial countdown
- [ ] Value tracker shows delivered value
- [ ] Platform status indicators work
- [ ] Recent content displays correctly
- [ ] Quick actions are functional
- [ ] Widgets are customizable

---

# STAGE 4: TESTING & DOCUMENTATION
## Timeline: Days 29-35
## Agent Count: 1-2

---

## Task 4A: Unit Tests

### Files to Create
```
backend/tests/Unit/Services/CampaignOrchestratorServiceTest.php
backend/tests/Unit/Services/SMSIntentClassifierTest.php
backend/tests/Unit/Services/EmailFollowupServiceTest.php
backend/tests/Unit/Services/VoicemailTranscriptionServiceTest.php
backend/tests/Unit/Services/PipelineTransitionServiceTest.php
backend/tests/Unit/Services/InboundEmailServiceTest.php
```

### Acceptance Criteria
- [ ] All services have unit tests
- [ ] Test coverage > 80%
- [ ] All tests pass

---

## Task 4B: Integration Tests

### Files to Create
```
backend/tests/Feature/CampaignTimelineExecutionTest.php
backend/tests/Feature/SMSWebhookTest.php
backend/tests/Feature/EmailFollowupTest.php
backend/tests/Feature/PipelineStageTransitionTest.php
```

### Acceptance Criteria
- [ ] End-to-end workflows tested
- [ ] Webhook integrations tested
- [ ] All integration tests pass

---

## Task 4C: Documentation

### Files to Create
```
docs/campaign-automation.md
docs/sms-handling.md
docs/email-followup.md
docs/voicemail-transcription.md
docs/pipeline-stages.md
docs/inbound-email-processing.md
docs/command-center.md
```

### Acceptance Criteria
- [ ] All features documented
- [ ] API endpoints documented
- [ ] Usage examples provided

---

# EXECUTION CHECKLIST

## Pre-Flight
- [ ] Review existing codebase structure
- [ ] Confirm database connection
- [ ] Verify API keys (OpenAI, OpenRouter, Twilio, Postal)
- [ ] Set up development environment

## Stage 1 (Days 1-4) - 1 Agent
- [ ] Run all migrations
- [ ] Create all event classes
- [ ] Register events in EventServiceProvider
- [ ] Test migrations rollback/forward
- [ ] Verify enum casting works

## Stage 2 (Days 5-18) - 6 Agents Parallel
- [ ] **Agent A:** CampaignOrchestratorService + CampaignActionExecutor
- [ ] **Agent B:** EmailFollowupService + CheckUnopenedEmails job
- [ ] **Agent C:** SMSIntentClassifier + SMSResponseHandler
- [ ] **Agent D:** VoicemailTranscriptionService + ProcessVoicemail job
- [ ] **Agent E:** InboundEmailService + EmailIntentClassifier + EmailSentimentAnalyzer
- [ ] **Agent F:** AiAccountManagerContactService

## Stage 3 (Days 19-28) - 4 Agents Parallel
- [ ] **Agent A:** ProcessCampaignTimelines job + SeedDefaultTimeline command
- [ ] **Agent B:** PipelineTransitionService + Kanban UI
- [ ] **Agent C:** Webhook handler updates + route registration
- [ ] **Agent D:** Command Center Dashboard UI

## Stage 4 (Days 29-35) - 1-2 Agents
- [ ] Write unit tests for all new services
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Document all new features
- [ ] Update API documentation

## Post-Flight
- [ ] Run full test suite
- [ ] Deploy to staging
- [ ] Run seed command for default timeline
- [ ] Verify scheduled jobs are registered
- [ ] Test end-to-end with test customer
- [ ] Performance testing
- [ ] Security review

---

**Project Plan v1.0 - Generated January 20, 2026**

