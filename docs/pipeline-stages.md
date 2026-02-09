# Pipeline Stages System

## Overview

The Pipeline Stages System manages customer progression through sales pipeline stages (Hook, Engagement, Sales, Retention, Churned). It validates transitions, tracks history, and automatically advances customers based on engagement thresholds.

## Pipeline Stages

### Stage Definitions

1. **Hook (Trial)** - Initial stage, 90-day trial period
2. **Engagement** - Customer is actively engaging with content
3. **Sales** - Customer is in sales process
4. **Retention** - Customer has converted, focus on retention
5. **Churned** - Customer has churned (can be set from any stage)

## Architecture

### Core Components

1. **PipelineStage** - Enum defining all stages
2. **PipelineTransitionService** - Handles stage transitions
3. **HandlePipelineStageChange** - Event listener for stage changes
4. **AdvanceStageOnEngagementThreshold** - Auto-advances on threshold
5. **AdvanceStageOnTrialAcceptance** - Handles trial acceptance

## Stage Transitions

### Valid Transitions

- Hook → Engagement
- Engagement → Sales
- Sales → Retention
- Any → Churned (can churn from any stage)

### Invalid Transitions

- Hook → Sales (must go through Engagement)
- Engagement → Retention (must go through Sales)
- Retention → Sales (cannot go backwards)

## Database Schema

### customers (extended)
- `pipeline_stage` - Current pipeline stage (enum)
- `stage_entered_at` - When entered current stage
- `trial_started_at` - When trial started
- `trial_ends_at` - When trial ends
- `days_in_stage` - Days in current stage
- `stage_history` - JSON array of stage transitions
- `stage_change_trigger` - What caused last change

### pipeline_stage_history
- `id` - Primary key
- `customer_id` - Foreign key to customer
- `from_stage` - Previous stage
- `to_stage` - New stage
- `trigger` - What caused transition
- `days_in_previous_stage` - Days in previous stage
- `changed_by` - User who made change (if manual)
- `metadata` - Additional transition data

## Usage

### Manual Stage Transition

```php
use App\Services\PipelineTransitionService;
use App\Models\Customer;
use App\Enums\PipelineStage;

$service = app(PipelineTransitionService::class);
$customer = Customer::find($customerId);

// Transition to next stage
$success = $service->transition(
    $customer,
    PipelineStage::ENGAGEMENT,
    'manual'
);
```

### Check Engagement Threshold

```php
// Automatically advances if threshold met
$service->checkEngagementThreshold($customer);
```

### Handle Trial Acceptance

```php
// Starts trial and assigns timeline
$service->handleTrialAcceptance($customer);
```

## Engagement Thresholds

### Automatic Advancement

Customers automatically advance when engagement score reaches threshold:

- **Hook → Engagement**: Score ≥ 50
- **Engagement → Sales**: Score ≥ 80

### Checking Thresholds

```php
$service->checkEngagementThreshold($customer);
```

This is automatically called when:
- Engagement score is updated
- `EngagementThresholdReached` event is fired

## Trial Management

### Starting Trial

```php
$service->handleTrialAcceptance($customer);

// Sets:
// - trial_started_at = now()
// - trial_ends_at = now() + 90 days
// - trial_active = true
// - Assigns timeline for Hook stage
```

### Trial Days Remaining

```php
$customer = Customer::find($customerId);
$daysRemaining = $customer->trial_days_remaining; // Computed attribute
```

## Event Flow

1. Stage transition initiated
2. `PipelineTransitionService` validates transition
3. Customer `advanceToStage()` called
4. Stage history updated
5. `PipelineStageChanged` event fired
6. `HandlePipelineStageChange` listener processes event
7. Timeline assigned for new stage (if orchestrator available)
8. Logs transition

## API Endpoints

### Update Pipeline Stage
```
PUT /api/v1/customers/{id}/pipeline-stage
{
    "pipeline_stage": "engagement",
    "trigger": "manual"
}
```

### Get Customers by Stage
```
GET /api/v1/customers?pipeline_stage=hook
```

## Frontend Integration

### Kanban Board

The Kanban board displays customers by stage:

- **Route**: `/crm/pipeline`
- **Component**: `KanbanBoard.tsx`
- **Features**:
  - Drag-and-drop between stages
  - Stage counts
  - Customer cards with key info
  - Manual stage changes via dropdown

### Pipeline Stage Card

Displays customer info in card format:
- Business name and owner
- Contact information
- Days in stage
- Engagement score
- Trial countdown (if in Hook stage)
- Stage dropdown selector

## Examples

### Transitioning Customer

```php
use App\Services\PipelineTransitionService;
use App\Enums\PipelineStage;

$service = app(PipelineTransitionService::class);
$customer = Customer::find($customerId);

// Valid transition
$service->transition($customer, PipelineStage::ENGAGEMENT, 'manual');

// Invalid transition (will return false)
$service->transition($customer, PipelineStage::SALES, 'manual'); // Fails
```

### Checking Stage History

```php
$customer = Customer::find($customerId);
$history = $customer->stage_history;

foreach ($history as $transition) {
    echo "From: {$transition['from']}";
    echo "To: {$transition['to']}";
    echo "At: {$transition['at']}";
    echo "Trigger: {$transition['trigger']}";
    echo "Days in previous: {$transition['days_in_previous']}";
}
```

## Monitoring

### Stage Distribution
```php
$distribution = Customer::select('pipeline_stage', DB::raw('count(*) as count'))
    ->groupBy('pipeline_stage')
    ->get();
```

### Average Days in Stage
```php
$avgDays = Customer::where('pipeline_stage', PipelineStage::ENGAGEMENT)
    ->avg('days_in_stage');
```

### Stage Transition Rate
```php
$transitions = PipelineStageHistory::where('to_stage', PipelineStage::SALES)
    ->where('created_at', '>=', now()->subDays(30))
    ->count();
```

## Testing

### Unit Tests
```bash
php artisan test --filter PipelineTransitionServiceTest
```

### Integration Tests
```bash
php artisan test --filter PipelineStageTransitionTest
```

## Troubleshooting

### Invalid Transition Errors
1. Check current stage vs target stage
2. Verify transition is valid (use `isValidTransition()`)
3. Review stage history for previous transitions
4. Check if trying to skip stages

### Engagement Threshold Not Triggering
1. Verify engagement score is above threshold
2. Check `checkEngagementThreshold()` is being called
3. Ensure customer has valid pipeline stage
4. Review threshold values (50 for Hook, 80 for Engagement)

### Trial Not Starting
1. Verify customer is in Hook stage
2. Check `handleTrialAcceptance()` is called
3. Ensure timeline exists for Hook stage
4. Review trial dates are set correctly

## Best Practices

1. **Validate Transitions**: Always use `PipelineTransitionService` for transitions
2. **Track History**: Stage history provides valuable analytics
3. **Use Triggers**: Record what caused each transition (manual, engagement_threshold, conversion)
4. **Monitor Thresholds**: Review and adjust engagement thresholds based on data
5. **Trial Management**: Always start trial when customer accepts
6. **Timeline Assignment**: Assign timelines when stage changes

## API Reference

### Transition Customer
```php
PipelineTransitionService::transition(
    Customer $customer,
    PipelineStage $newStage,
    string $trigger
): bool
```

Returns: true if successful, false if invalid transition

### Check Engagement Threshold
```php
PipelineTransitionService::checkEngagementThreshold(
    Customer $customer
): void
```

Automatically advances if threshold met.

### Handle Trial Acceptance
```php
PipelineTransitionService::handleTrialAcceptance(
    Customer $customer
): void
```

Starts trial and assigns timeline.

### Handle Conversion
```php
PipelineTransitionService::handleConversion(
    Customer $customer
): void
```

Transitions Sales → Retention.

