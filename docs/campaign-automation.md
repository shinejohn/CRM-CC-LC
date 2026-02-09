# Campaign Automation System

## Overview

The Campaign Automation System automatically executes multi-day campaign timelines for customers based on their pipeline stage. It ensures customers receive the right messages at the right time through automated action execution.

## Architecture

### Core Components

1. **CampaignTimeline** - Defines a sequence of actions over multiple days
2. **CampaignTimelineAction** - Individual actions within a timeline (email, SMS, phone, wait)
3. **CustomerTimelineProgress** - Tracks customer progress through a timeline
4. **CampaignOrchestratorService** - Executes actions and manages timeline progression
5. **CampaignActionExecutor** - Handles execution of individual actions

## Key Features

- **Multi-day Campaigns**: Define campaigns that span 90+ days
- **Conditional Execution**: Actions can skip based on customer behavior
- **Automatic Progression**: Customers advance through days automatically
- **Stage-based Assignment**: Timelines automatically assigned based on pipeline stage
- **Action Tracking**: Complete history of executed, skipped, and failed actions

## Database Schema

### campaign_timelines
- `id` - Primary key
- `name` - Timeline name
- `slug` - Unique identifier
- `pipeline_stage` - Which stage this timeline applies to
- `duration_days` - Total days in timeline
- `is_active` - Whether timeline is active
- `is_default` - Default timeline for stage

### campaign_timeline_actions
- `id` - Primary key
- `campaign_timeline_id` - Foreign key to timeline
- `day_number` - Which day this action occurs
- `channel` - email, sms, phone, wait, interaction
- `action_type` - send_email, send_sms, make_call, check_condition
- `campaign_id` - Link to campaign content
- `conditions` - JSON conditions for execution
- `delay_hours` - Hours after day starts
- `priority` - Order within same day

### customer_timeline_progress
- `id` - Primary key
- `customer_id` - Foreign key to customer
- `campaign_timeline_id` - Foreign key to timeline
- `current_day` - Current day in timeline
- `status` - active, paused, completed, stopped
- `completed_actions` - Array of completed action IDs
- `skipped_actions` - Array of skipped action IDs
- `failed_actions` - Array of failed actions with retry info

## Usage

### Starting a Timeline

```php
use App\Services\CampaignOrchestratorService;
use App\Models\Customer;
use App\Models\CampaignTimeline;

$orchestrator = app(CampaignOrchestratorService::class);
$customer = Customer::find($customerId);
$timeline = CampaignTimeline::find($timelineId);

// Start customer on timeline
$progress = $orchestrator->startTimeline($customer, $timeline);
```

### Auto-assign Timeline for Stage

```php
// Automatically assigns default timeline for customer's pipeline stage
$progress = $orchestrator->assignTimelineForStage($customer);
```

### Executing Actions

```php
// Execute today's actions for a customer
$results = $orchestrator->executeActionsForCustomer($customer);
```

## Action Conditions

Actions can have conditions that determine if they should execute:

```php
// Skip if email opened within 48 hours
'conditions' => [
    'if' => 'email_opened',
    'within_hours' => 48,
    'then' => 'skip'
]

// Skip if engagement score above threshold
'conditions' => [
    'if' => 'engagement_score_above',
    'threshold' => 50,
    'then' => 'skip'
]

// Only execute if in specific pipeline stage
'conditions' => [
    'if' => 'pipeline_stage',
    'stage' => 'hook',
    'then' => 'execute'
]
```

## Scheduled Jobs

### ProcessCampaignTimelines
Runs hourly to execute actions for all active customers.

```php
// Schedule in app/Console/Kernel.php
$schedule->job(new ProcessCampaignTimelines)->hourly();
```

### AdvanceCampaignDays
Runs daily at midnight to advance customers to next day.

```php
$schedule->job(new AdvanceCampaignDays)->daily();
```

## API Endpoints

### Start Timeline
```
POST /api/v1/customers/{id}/timelines
{
    "timeline_id": 1
}
```

### Get Timeline Progress
```
GET /api/v1/customers/{id}/timeline-progress
```

### Pause Timeline
```
POST /api/v1/customers/{id}/timeline-progress/{progressId}/pause
```

## Examples

### Creating a 90-Day Hook Timeline

```php
$timeline = CampaignTimeline::create([
    'name' => '90-Day Hook Campaign',
    'slug' => 'hook-90-day',
    'pipeline_stage' => PipelineStage::HOOK,
    'duration_days' => 90,
    'is_active' => true,
    'is_default' => true,
]);

// Day 1: Send welcome email
CampaignTimelineAction::create([
    'campaign_timeline_id' => $timeline->id,
    'day_number' => 1,
    'channel' => 'email',
    'action_type' => 'send_email',
    'campaign_id' => 'HOOK-001',
    'priority' => 0,
    'delay_hours' => 0,
]);

// Day 3: Send SMS follow-up
CampaignTimelineAction::create([
    'campaign_timeline_id' => $timeline->id,
    'day_number' => 3,
    'channel' => 'sms',
    'action_type' => 'send_sms',
    'campaign_id' => 'HOOK-002',
    'priority' => 0,
    'delay_hours' => 10, // 10 AM
]);
```

## Monitoring

### Check Timeline Status
```php
$progress = CustomerTimelineProgress::where('customer_id', $customerId)->first();
echo "Day {$progress->current_day} of {$progress->timeline->duration_days}";
echo "Progress: {$progress->getProgressPercentage()}%";
```

### View Action History
```php
$completed = $progress->completed_actions; // Array of action IDs
$skipped = $progress->skipped_actions;
$failed = $progress->failed_actions;
```

## Troubleshooting

### Actions Not Executing
1. Check if timeline is active: `$timeline->is_active`
2. Verify customer progress status: `$progress->status === 'active'`
3. Check action conditions: `$action->shouldExecute($customer)`
4. Verify delay has passed: Check `delay_hours` vs current time

### Timeline Not Starting
1. Ensure default timeline exists for pipeline stage
2. Check `is_default` flag on timeline
3. Verify customer has valid pipeline stage

## Best Practices

1. **Test Timelines**: Always test timelines with test customers before going live
2. **Monitor Progress**: Regularly check `customer_timeline_progress` table
3. **Handle Failures**: Failed actions are tracked in `failed_actions` JSON field
4. **Conditional Logic**: Use conditions to avoid sending duplicate messages
5. **Day Advancement**: Actions execute when day advances, not at exact times

