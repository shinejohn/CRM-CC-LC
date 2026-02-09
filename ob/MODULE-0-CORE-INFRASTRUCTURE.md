# MODULE 0: CORE INFRASTRUCTURE
## Foundation Layer - Must Complete First

**Owner:** Lead Agent
**Timeline:** Week 1-2
**Dependencies:** None
**Blocks:** All other modules

---

## OBJECTIVE

Set up the Laravel application foundation with all database tables, authentication, queue infrastructure, and shared contracts that all other modules will use.

---

## DELIVERABLES

### 1. Laravel Application Skeleton

```bash
# Create Laravel 11 application
composer create-project laravel/laravel fibonacco
cd fibonacco

# Install required packages
composer require laravel/horizon
composer require laravel/sanctum
composer require aws/aws-sdk-php
composer require anthropic-ai/sdk  # or HTTP client for Claude
composer require spatie/laravel-permission
composer require spatie/laravel-data
composer require spatie/laravel-query-builder

# Frontend (if needed for admin)
npm install
```

### 2. Directory Structure

```
app/
├── Console/
│   └── Commands/
├── Contracts/                    # Shared interfaces
│   ├── SMBServiceInterface.php
│   ├── CampaignServiceInterface.php
│   ├── LearningCenterServiceInterface.php
│   ├── ApprovalServiceInterface.php
│   ├── InboundServiceInterface.php
│   └── AIAccountManagerInterface.php
├── Events/                       # All events (defined here, used by modules)
├── Exceptions/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/              # API versioning
│   ├── Middleware/
│   └── Resources/               # API Resources
├── Jobs/                        # Base job classes
├── Listeners/
├── Models/
│   └── Concerns/                # Shared traits
├── Providers/
├── Services/                    # Service implementations
└── Support/                     # Helper classes

database/
├── migrations/                  # ALL migrations live here
├── factories/
└── seeders/

config/
├── services.php                 # External service config
├── fibonacco.php               # App-specific config
└── horizon.php

routes/
├── api.php                     # API routes (version namespaced)
├── web.php
└── console.php
```

### 3. All Database Migrations

Create ALL tables upfront so modules can start immediately:

```php
// database/migrations/2026_01_01_000001_create_communities_table.php
Schema::create('communities', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('state', 2);
    $table->string('county')->nullable();
    $table->integer('population')->nullable();
    $table->string('timezone', 50)->default('America/New_York');
    $table->jsonb('settings')->default('{}');
    $table->timestamps();
    
    $table->index('state');
    $table->index('slug');
});

// database/migrations/2026_01_01_000002_create_smbs_table.php
Schema::create('smbs', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('community_id')->constrained();
    
    // Identity
    $table->string('business_name');
    $table->string('dba_name')->nullable();
    $table->string('business_type', 100)->nullable();
    $table->string('category', 100)->nullable();
    
    // Contact
    $table->string('primary_contact_name')->nullable();
    $table->string('primary_email')->nullable();
    $table->string('primary_phone', 50)->nullable();
    $table->jsonb('secondary_contacts')->default('[]');
    
    // Location
    $table->string('address')->nullable();
    $table->string('city', 100)->nullable();
    $table->string('state', 2)->nullable();
    $table->string('zip', 10)->nullable();
    $table->point('coordinates')->nullable();
    
    // Engagement
    $table->tinyInteger('engagement_tier')->default(4);
    $table->integer('engagement_score')->default(0);
    $table->timestamp('last_email_open')->nullable();
    $table->timestamp('last_email_click')->nullable();
    $table->timestamp('last_content_view')->nullable();
    $table->timestamp('last_approval')->nullable();
    $table->integer('total_approvals')->default(0);
    $table->integer('total_meetings')->default(0);
    
    // Campaign
    $table->string('campaign_status', 50)->default('pending');
    $table->string('current_campaign_id', 50)->nullable();
    $table->integer('manifest_destiny_day')->default(0);
    $table->date('manifest_destiny_start_date')->nullable();
    $table->timestamp('next_scheduled_send')->nullable();
    
    // Service
    $table->string('service_model', 50)->nullable();
    $table->string('subscription_tier', 50)->default('free');
    $table->jsonb('services_activated')->default('[]');
    $table->jsonb('services_approved_pending')->default('[]');
    
    // Communication preferences
    $table->boolean('email_opted_in')->default(true);
    $table->boolean('sms_opted_in')->default(false);
    $table->boolean('rvm_opted_in')->default(true);
    $table->boolean('phone_opted_in')->default(false);
    $table->boolean('do_not_contact')->default(false);
    
    // Metadata
    $table->string('source', 50)->nullable();
    $table->integer('data_quality_score')->default(0);
    $table->jsonb('metadata')->default('{}');
    $table->timestamps();
    $table->softDeletes();
    
    // Indexes
    $table->index('community_id');
    $table->index('primary_email');
    $table->index('primary_phone');
    $table->index('campaign_status');
    $table->index('engagement_tier');
    $table->index(['campaign_status', 'manifest_destiny_day']);
});

// database/migrations/2026_01_01_000003_create_campaigns_table.php
Schema::create('campaigns', function (Blueprint $table) {
    $table->string('id', 50)->primary();  // e.g., 'HOWTO-001'
    $table->string('type', 50);
    $table->integer('week');
    $table->integer('day');
    $table->string('title');
    $table->string('subject');
    $table->string('slug');
    $table->string('service_type', 100)->nullable();
    
    $table->string('landing_page_slug')->nullable();
    $table->string('email_template_id', 100)->nullable();
    
    $table->string('approval_button_text')->nullable();
    $table->jsonb('approval_config')->default('{}');
    
    $table->text('rvm_script')->nullable();
    $table->jsonb('rvm_config')->default('{}');
    
    $table->jsonb('upsell_services')->default('[]');
    $table->string('meeting_topic')->nullable();
    
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// database/migrations/2026_01_01_000004_create_campaign_sends_table.php
Schema::create('campaign_sends', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('smb_id')->constrained();
    $table->string('campaign_id', 50);
    
    $table->string('email');
    $table->string('subject')->nullable();
    $table->timestamp('scheduled_for')->nullable();
    $table->timestamp('sent_at')->nullable();
    
    $table->string('message_id')->nullable();  // SES message ID
    $table->string('status', 50)->default('queued');
    
    $table->timestamp('delivered_at')->nullable();
    $table->timestamp('opened_at')->nullable();
    $table->timestamp('clicked_at')->nullable();
    $table->timestamp('bounced_at')->nullable();
    $table->timestamp('complained_at')->nullable();
    
    $table->boolean('rvm_triggered')->default(false);
    $table->foreignId('rvm_drop_id')->nullable();
    
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('campaign_id');
    $table->index('status');
    $table->index(['status', 'scheduled_for']);
    $table->index(['status', 'sent_at', 'opened_at']);
    
    $table->foreign('campaign_id')->references('id')->on('campaigns');
});

// database/migrations/2026_01_01_000005_create_rvm_drops_table.php
Schema::create('rvm_drops', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('smb_id')->constrained();
    $table->foreignId('campaign_send_id')->nullable()->constrained();
    
    $table->string('phone', 50);
    $table->text('script')->nullable();
    $table->string('voice_persona', 50)->default('sarah');
    
    $table->timestamp('scheduled_for')->nullable();
    $table->timestamp('sent_at')->nullable();
    
    $table->string('provider', 50)->default('drop_cowboy');
    $table->string('provider_message_id')->nullable();
    $table->string('status', 50)->default('queued');
    
    $table->timestamp('delivered_at')->nullable();
    $table->string('delivery_status', 50)->nullable();
    
    $table->boolean('callback_received')->default(false);
    $table->timestamp('callback_at')->nullable();
    $table->foreignId('callback_id')->nullable();
    
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index(['status', 'scheduled_for']);
});

// database/migrations/2026_01_01_000006_create_approvals_table.php
Schema::create('approvals', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('smb_id')->constrained();
    
    $table->string('service_type', 100);
    $table->foreignId('task_id')->nullable();
    
    $table->string('approver_name');
    $table->string('approver_email');
    $table->string('approver_phone', 50)->nullable();
    $table->string('approver_role', 100)->nullable();
    
    $table->string('source_type', 50);
    $table->string('source_id', 100)->nullable();
    $table->text('source_url')->nullable();
    
    $table->boolean('contact_consent')->default(false);
    $table->string('status', 50)->default('pending');
    
    $table->timestamp('approved_at');
    $table->timestamp('provisioning_started_at')->nullable();
    $table->timestamp('provisioned_at')->nullable();
    
    $table->jsonb('metadata')->default('{}');
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('service_type');
    $table->index('status');
});

// database/migrations/2026_01_01_000007_create_approval_upsells_table.php
Schema::create('approval_upsells', function (Blueprint $table) {
    $table->id();
    $table->foreignId('approval_id')->constrained();
    $table->string('upsell_service_type', 100);
    
    $table->timestamp('offered_at');
    $table->boolean('accepted')->nullable();
    $table->timestamp('accepted_at')->nullable();
    $table->timestamp('declined_at')->nullable();
    
    $table->foreignId('resulting_approval_id')->nullable()->constrained('approvals');
    
    $table->index('approval_id');
});

// database/migrations/2026_01_01_000008_create_provisioning_tasks_table.php
Schema::create('provisioning_tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('approval_id')->constrained();
    $table->foreignId('smb_id')->constrained();
    
    $table->string('service_type', 100);
    $table->string('status', 50)->default('queued');
    $table->integer('priority')->default(5);
    
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamp('failed_at')->nullable();
    $table->text('failure_reason')->nullable();
    
    $table->jsonb('result_data')->default('{}');
    $table->timestamps();
    
    $table->index(['status', 'priority']);
});

// database/migrations/2026_01_01_000009_create_content_table.php
Schema::create('content', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->string('type', 50);  // 'edu', 'hook', 'howto', 'article'
    $table->string('title');
    $table->string('campaign_id', 50)->nullable();
    
    $table->jsonb('slides')->default('[]');
    $table->text('article_body')->nullable();
    $table->string('audio_base_url')->nullable();
    
    $table->integer('duration_seconds')->default(60);
    $table->string('service_type', 100)->nullable();
    $table->string('approval_button_text')->nullable();
    
    $table->jsonb('personalization_fields')->default('[]');
    $table->jsonb('metadata')->default('{}');
    
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('campaign_id')->references('id')->on('campaigns');
});

// database/migrations/2026_01_01_000010_create_content_views_table.php
Schema::create('content_views', function (Blueprint $table) {
    $table->id();
    $table->foreignId('smb_id')->nullable()->constrained();
    $table->string('content_slug');
    
    $table->timestamp('started_at');
    $table->timestamp('completed_at')->nullable();
    $table->integer('completion_percentage')->default(0);
    
    $table->string('source_campaign_id', 50)->nullable();
    $table->text('source_url')->nullable();
    
    $table->integer('time_on_page_seconds')->nullable();
    $table->jsonb('slides_viewed')->default('[]');
    
    $table->boolean('approval_clicked')->default(false);
    $table->boolean('downloaded_pdf')->default(false);
    $table->boolean('shared')->default(false);
    
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('content_slug');
});

// database/migrations/2026_01_01_000011_create_callbacks_table.php
Schema::create('callbacks', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('smb_id')->nullable()->constrained();
    $table->foreignId('rvm_drop_id')->nullable()->constrained();
    
    $table->string('caller_phone', 50);
    $table->string('called_number', 50);
    $table->timestamp('started_at');
    $table->timestamp('ended_at')->nullable();
    $table->integer('duration_seconds')->nullable();
    
    $table->text('transcript')->nullable();
    $table->text('summary')->nullable();
    
    $table->string('intent_detected', 100)->nullable();
    $table->jsonb('actions_taken')->default('[]');
    
    $table->boolean('followup_email_sent')->default(false);
    $table->timestamp('followup_email_sent_at')->nullable();
    
    $table->jsonb('metadata')->default('{}');
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('caller_phone');
});

// database/migrations/2026_01_01_000012_create_email_events_table.php
Schema::create('email_events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('campaign_send_id')->constrained();
    
    $table->string('event_type', 50);
    $table->timestamp('event_at');
    
    $table->text('link_clicked')->nullable();
    $table->string('bounce_type', 50)->nullable();
    
    $table->ipAddress('ip_address')->nullable();
    $table->text('user_agent')->nullable();
    
    $table->jsonb('raw_event')->nullable();
    $table->timestamps();
    
    $table->index('campaign_send_id');
    $table->index('event_type');
    $table->index('event_at');
});

// database/migrations/2026_01_01_000013_create_email_conversations_table.php
Schema::create('email_conversations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('smb_id')->nullable()->constrained();
    
    $table->string('direction', 10);  // 'inbound', 'outbound'
    $table->string('from_email');
    $table->string('to_email');
    $table->string('subject')->nullable();
    $table->text('body');
    $table->text('body_html')->nullable();
    
    $table->string('in_reply_to')->nullable();
    $table->foreignId('campaign_send_id')->nullable()->constrained();
    
    $table->string('intent', 100)->nullable();
    $table->string('sentiment', 50)->nullable();
    
    $table->boolean('ai_responded')->default(false);
    $table->text('ai_response')->nullable();
    
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('direction');
});

// database/migrations/2026_01_01_000014_create_chat_messages_table.php
Schema::create('chat_messages', function (Blueprint $table) {
    $table->id();
    $table->uuid('session_id');
    $table->foreignId('smb_id')->nullable()->constrained();
    
    $table->string('role', 20);  // 'user', 'assistant'
    $table->text('content');
    
    $table->string('intent', 100)->nullable();
    $table->jsonb('actions_taken')->default('[]');
    
    $table->timestamps();
    
    $table->index('session_id');
    $table->index('smb_id');
});

// database/migrations/2026_01_01_000015_create_ai_tasks_table.php
Schema::create('ai_tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('smb_id')->constrained();
    
    $table->string('task_type', 100);
    $table->string('status', 50)->default('pending');
    
    $table->jsonb('input_data')->default('{}');
    $table->jsonb('output_data')->default('{}');
    
    $table->timestamp('suggested_at');
    $table->timestamp('approved_at')->nullable();
    $table->timestamp('executed_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    
    $table->timestamps();
    
    $table->index('smb_id');
    $table->index('status');
});

// database/migrations/2026_01_01_000016_create_analytics_events_table.php
Schema::create('analytics_events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('smb_id')->nullable()->constrained();
    $table->foreignId('community_id')->nullable()->constrained();
    
    $table->string('event_type', 100);
    $table->string('event_category', 50)->nullable();
    
    $table->jsonb('properties')->default('{}');
    
    $table->timestamp('occurred_at');
    $table->timestamps();
    
    $table->index(['event_type', 'occurred_at']);
    $table->index('smb_id');
});
```

### 4. Shared Contracts (Interfaces)

```php
// app/Contracts/SMBServiceInterface.php
<?php

namespace App\Contracts;

use App\Models\SMB;
use Illuminate\Pagination\LengthAwarePaginator;

interface SMBServiceInterface
{
    public function find(int $id): ?SMB;
    public function findByUuid(string $uuid): ?SMB;
    public function findByEmail(string $email): ?SMB;
    public function findByPhone(string $phone): ?SMB;
    
    public function create(array $data): SMB;
    public function update(int $id, array $data): SMB;
    
    public function updateEngagement(int $smbId, array $data): void;
    public function calculateEngagementScore(int $smbId): int;
    public function evaluateTierChange(int $smbId): ?int;
    public function upgradeTier(int $smbId, int $newTier): void;
    public function downgradeTier(int $smbId, int $newTier): void;
    
    public function getForCampaign(string $status, int $day): LengthAwarePaginator;
    public function advanceManifestDestinyDay(int $smbId): void;
}

// app/Contracts/CampaignServiceInterface.php
<?php

namespace App\Contracts;

use App\Models\Campaign;
use App\Models\CampaignSend;
use App\Models\SMB;

interface CampaignServiceInterface
{
    public function getCampaign(string $id): ?Campaign;
    public function getNextCampaignForSMB(SMB $smb): ?Campaign;
    public function getCampaignForDay(int $day): ?Campaign;
    
    public function queueSend(int $smbId, string $campaignId, ?\DateTime $scheduledFor = null): CampaignSend;
    public function processSend(int $campaignSendId): void;
    public function recordEmailEvent(int $campaignSendId, string $eventType, array $data): void;
    
    public function shouldTriggerRVM(int $campaignSendId): bool;
    public function triggerRVM(int $campaignSendId): void;
    public function processRVMDrop(int $rvmDropId): void;
}

// app/Contracts/LearningCenterServiceInterface.php
<?php

namespace App\Contracts;

use App\Models\Content;
use App\Models\SMB;

interface LearningCenterServiceInterface
{
    public function getContent(string $slug): ?Content;
    public function getContentByCampaign(string $campaignId): ?Content;
    
    public function personalize(Content $content, SMB $smb): array;
    
    public function trackViewStart(int $smbId, string $slug, array $context): int;
    public function trackSlideView(int $viewId, int $slideNumber): void;
    public function trackViewComplete(int $viewId): void;
    public function trackApprovalClick(int $viewId): void;
    public function trackDownload(int $viewId): void;
}

// app/Contracts/ApprovalServiceInterface.php
<?php

namespace App\Contracts;

use App\Models\Approval;

interface ApprovalServiceInterface
{
    public function validateToken(string $token): ?array;
    public function generateToken(int $smbId, string $serviceType, string $sourceId): string;
    
    public function create(array $data): Approval;
    public function process(int $approvalId): void;
    
    public function getUpsellOffers(string $serviceType): array;
    public function recordUpsellOffer(int $approvalId, string $upsellType): void;
    public function acceptUpsell(int $approvalId, string $upsellType): Approval;
    
    public function startProvisioning(int $approvalId): void;
    public function completeProvisioning(int $approvalId, array $resultData): void;
    public function failProvisioning(int $approvalId, string $reason): void;
}

// app/Contracts/InboundServiceInterface.php
<?php

namespace App\Contracts;

interface InboundServiceInterface
{
    public function parseInboundEmail(array $rawEmail): array;
    public function classifyEmailIntent(string $body): string;
    public function generateEmailResponse(int $smbId, string $intent, string $body): string;
    public function sendEmailResponse(int $smbId, string $response, string $inReplyTo): void;
    
    public function handleCallback(array $callData): void;
    public function transcribeCall(string $audioUrl): string;
    public function generateCallSummary(string $transcript): string;
    
    public function handleChatMessage(string $sessionId, ?int $smbId, string $message): string;
}

// app/Contracts/AIAccountManagerInterface.php
<?php

namespace App\Contracts;

use App\Models\SMB;

interface AIAccountManagerInterface
{
    public function generateResponse(string $systemContext, string $userInput, array $history = []): string;
    
    public function suggestNextTask(SMB $smb): ?array;
    public function generateTaskContent(int $smbId, string $taskType): array;
    public function executeTask(int $taskId): void;
    
    public function generateProactiveOutreach(int $smbId, string $outreachType): array;
    public function personalizeRVMScript(int $smbId, string $baseScript): string;
    
    public function analyzeEngagement(int $smbId): array;
    public function recommendUpsells(int $smbId): array;
}
```

### 5. Event Definitions

```php
// app/Events/SMB/SMBCreated.php
<?php

namespace App\Events\SMB;

use App\Models\SMB;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public SMB $smb) {}
}

// Create similar events for:
// - SMBUpdated
// - SMBEngagementChanged
// - SMBTierChanged

// app/Events/Campaign/CampaignSendQueued.php
class CampaignSendQueued
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $campaignSendId,
        public int $smbId,
        public string $campaignId
    ) {}
}

// Create similar events for:
// - CampaignSendCompleted
// - EmailOpened
// - EmailClicked
// - EmailBounced
// - RVMDropQueued
// - RVMDropDelivered
// - CallbackReceived

// app/Events/Approval/ApprovalSubmitted.php
class ApprovalSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $approvalId,
        public int $smbId,
        public string $serviceType
    ) {}
}

// Create similar events for:
// - ApprovalProvisioned
// - UpsellOffered
// - UpsellAccepted

// app/Events/Content/ContentViewed.php
class ContentViewed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $viewId,
        public int $smbId,
        public string $contentSlug
    ) {}
}

// Create similar events for:
// - ContentCompleted

// app/Events/Inbound/InboundEmailReceived.php
class InboundEmailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $conversationId,
        public ?int $smbId,
        public string $intent
    ) {}
}

// Create similar events for:
// - CallbackReceived
// - ChatMessageReceived
```

### 6. Base Configuration

```php
// config/fibonacco.php
<?php

return [
    'manifest_destiny' => [
        'total_days' => 90,
        'campaigns_per_day' => [
            1 => 'HOOK',
            2 => 'EDU',
            4 => 'HOWTO',
            6 => 'HOWTO',
        ],
    ],
    
    'engagement' => [
        'tiers' => [
            1 => ['name' => 'Premium', 'min_score' => 80],
            2 => ['name' => 'Engaged', 'min_score' => 50],
            3 => ['name' => 'Active', 'min_score' => 20],
            4 => ['name' => 'Passive', 'min_score' => 0],
        ],
        'score_weights' => [
            'email_open' => 5,
            'email_click' => 10,
            'content_view' => 8,
            'content_complete' => 15,
            'approval' => 25,
            'meeting_scheduled' => 30,
            'callback' => 20,
        ],
    ],
    
    'rvm' => [
        'provider' => env('RVM_PROVIDER', 'drop_cowboy'),
        'trigger_after_hours' => 24,
        'send_time_local' => '10:00',
        'followup_email_delay_minutes' => 5,
        'monthly_limits' => [
            1 => 4,  // Premium tier
            2 => 2,  // Engaged tier
            3 => 1,  // Active tier
            4 => 0,  // Passive tier (quarterly only)
        ],
    ],
    
    'ai' => [
        'persona' => 'sarah',
        'model' => env('AI_MODEL', 'claude-sonnet-4-20250514'),
        'max_tokens' => 1024,
    ],
    
    'email' => [
        'from_name' => 'Sarah',
        'from_email' => env('MAIL_FROM_ADDRESS', 'sarah@fibonacco.com'),
        'reply_to' => env('MAIL_REPLY_TO', 'reply@fibonacco.com'),
    ],
];
```

### 7. Queue Configuration (Horizon)

```php
// config/horizon.php
'environments' => [
    'production' => [
        'supervisor-email' => [
            'connection' => 'redis',
            'queue' => ['emails', 'email-high'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 20,
            'tries' => 3,
            'timeout' => 300,
        ],
        'supervisor-rvm' => [
            'connection' => 'redis',
            'queue' => ['rvm'],
            'balance' => 'auto',
            'minProcesses' => 2,
            'maxProcesses' => 10,
            'tries' => 3,
            'timeout' => 120,
        ],
        'supervisor-ai' => [
            'connection' => 'redis',
            'queue' => ['ai', 'ai-high'],
            'balance' => 'auto',
            'minProcesses' => 3,
            'maxProcesses' => 15,
            'tries' => 2,
            'timeout' => 60,
        ],
        'supervisor-default' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'minProcesses' => 2,
            'maxProcesses' => 10,
            'tries' => 3,
            'timeout' => 60,
        ],
    ],
],
```

### 8. API Routing Structure

```php
// routes/api.php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Module 1: SMB CRM
    Route::prefix('smbs')->group(function () {
        // Defined by Module 1
    });
    
    // Module 2: Campaign Engine
    Route::prefix('campaigns')->group(function () {
        // Defined by Module 2
    });
    
    // Module 3: Learning Center
    Route::prefix('content')->group(function () {
        // Defined by Module 3
    });
    
    // Module 4: Approval System
    Route::prefix('approvals')->group(function () {
        // Defined by Module 4
    });
    
    // Module 5: Inbound Engine
    Route::prefix('inbound')->group(function () {
        // Defined by Module 5
    });
    
    // Module 6: Command Center
    Route::prefix('command-center')->group(function () {
        // Defined by Module 6
    });
    
    // Module 7: AI Account Manager
    Route::prefix('ai')->group(function () {
        // Defined by Module 7
    });
    
    // Module 8: Analytics
    Route::prefix('analytics')->group(function () {
        // Defined by Module 8
    });
});

// Webhooks (outside versioned API)
Route::prefix('webhooks')->group(function () {
    Route::post('ses', [WebhookController::class, 'ses']);
    Route::post('rvm', [WebhookController::class, 'rvm']);
    Route::post('twilio', [WebhookController::class, 'twilio']);
});
```

---

## ACCEPTANCE CRITERIA

- [ ] Laravel 11 application scaffolded
- [ ] All 16 database migrations created and run successfully
- [ ] All service interfaces defined in `app/Contracts/`
- [ ] All events defined in `app/Events/`
- [ ] Horizon configured and running
- [ ] Redis connected and working
- [ ] API route structure in place
- [ ] Config files created (`fibonacco.php`)
- [ ] Basic test suite passing
- [ ] `.env.example` with all required variables
- [ ] README with setup instructions

---

## HANDOFF TO OTHER MODULES

Once this module is complete:

1. Merge to `develop` branch
2. Other agents can branch from `develop`
3. All migrations will be available
4. All interfaces will be defined
5. Event structure will be in place

Other modules implement the interfaces and register their routes in the appropriate namespace.
