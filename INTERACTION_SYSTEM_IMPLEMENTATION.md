# Interaction System Implementation

## Overview

Implemented a comprehensive **Interaction/Action Item System** that automatically creates the next step in a customer relationship when an interaction is completed. This system works independently of campaigns and ensures there's always a "next step" to drive the relationship forward.

## Key Features

### 1. Automatic Next-Step Creation
- When an interaction is marked as completed, the system automatically creates the next interaction
- Works with template workflows (defined sequences)
- Falls back to default template if no workflow is active
- Creates a default follow-up if no template exists

### 2. Template-Based Workflows
- Define multi-step interaction sequences
- Each step can specify:
  - Type (phone_call, send_proposal, follow_up, email, sms, etc.)
  - Scheduled offset (days from previous completion)
  - Due date offset (deadline calculation)
  - Next step in sequence

### 3. Flexible Interaction Types
- `phone_call` - Phone call interactions
- `send_proposal` - Send proposal/document
- `follow_up` - General follow-up
- `email` - Email interaction
- `sms` - SMS interaction
- `meeting` - Meeting/demo
- `demo` - Product demo
- Custom types supported

### 4. Status Tracking
- `pending` - Not yet started
- `in_progress` - Currently being worked on
- `completed` - Finished (triggers next step)
- `cancelled` - Cancelled
- `skipped` - Skipped

### 5. Priority Levels
- `low` - Low priority
- `normal` - Normal priority
- `high` - High priority
- `urgent` - Urgent

## Database Schema

### `interactions` Table
- Stores all customer interactions/action items
- Self-referential (next_interaction_id, previous_interaction_id)
- Links to customers, templates, campaigns, conversations
- Tracks scheduling, completion, outcomes

### `interaction_templates` Table
- Defines reusable workflow templates
- Contains JSON array of steps
- Supports default templates
- Active/inactive status

## API Endpoints

### Interaction Management
- `GET /v1/interactions` - List interactions (with filters)
- `POST /v1/interactions` - Create interaction
- `GET /v1/interactions/{id}` - Get interaction details
- `PUT /v1/interactions/{id}` - Update interaction
- `POST /v1/interactions/{id}/complete` - Complete interaction (triggers next step)
- `POST /v1/interactions/{id}/cancel` - Cancel interaction

### Workflow Management
- `POST /v1/interactions/workflow/start` - Start workflow from template

### Customer-Specific Endpoints
- `GET /v1/interactions/customers/{customerId}/next` - Get next pending interaction
- `GET /v1/interactions/customers/{customerId}/pending` - Get all pending interactions
- `GET /v1/interactions/customers/{customerId}/overdue` - Get overdue interactions

### Template Management
- `GET /v1/interactions/templates` - List templates
- `POST /v1/interactions/templates` - Create template

## Usage Examples

### Example 1: Create a Simple Interaction

```php
use App\Services\InteractionService;

$service = app(InteractionService::class);

$interaction = $service->createInteraction(
    customerId: 'customer-uuid',
    type: 'phone_call',
    title: 'Call customer on Monday',
    options: [
        'scheduled_at' => now()->next('Monday'),
        'due_at' => now()->next('Monday')->endOfDay(),
        'priority' => 'high',
        'description' => 'Discuss proposal details',
    ]
);
```

### Example 2: Start a Workflow

```php
$interaction = $service->startWorkflow(
    customerId: 'customer-uuid',
    templateId: 'template-uuid',
    options: [
        'start_date' => now()->next('Monday'),
    ]
);
```

### Example 3: Complete Interaction (Auto-creates Next Step)

```php
$interaction->complete(
    outcome: 'success',
    outcomeDetails: 'Customer interested, wants proposal'
);

// Next interaction is automatically created based on template
```

### Example 4: Create a Template

```json
{
  "name": "Standard Follow-up Sequence",
  "description": "Call → Proposal → Follow-up",
  "steps": [
    {
      "step_number": 1,
      "type": "phone_call",
      "title": "Initial Phone Call",
      "description": "Make initial contact call on Monday",
      "scheduled_offset_days": 0,
      "due_offset_days": 0,
      "next_step": 2
    },
    {
      "step_number": 2,
      "type": "send_proposal",
      "title": "Send Proposal",
      "description": "Send proposal by Wednesday",
      "scheduled_offset_days": 0,
      "due_offset_days": 2,
      "next_step": 3
    },
    {
      "step_number": 3,
      "type": "follow_up",
      "title": "Follow-up",
      "description": "Follow up on proposal",
      "scheduled_offset_days": 3,
      "due_offset_days": 2,
      "next_step": null
    }
  ],
  "is_active": true,
  "is_default": true
}
```

## How It Works

### 1. Creating an Interaction
- Can be created manually via API
- Can be started from a template workflow
- Can be created automatically when previous interaction completes

### 2. Completing an Interaction
When `complete()` is called:
1. Interaction status → `completed`
2. `completed_at` timestamp set
3. Outcome recorded
4. System checks for next step:
   - If part of template workflow → creates next step from template
   - If default template exists → starts default workflow
   - Otherwise → creates default follow-up interaction

### 3. Next Step Calculation
- Uses `scheduled_offset_days` from template step
- Calculates `scheduled_at` = completion time + offset
- Calculates `due_at` = scheduled_at + due_offset_days
- Links interactions via `next_interaction_id` and `previous_interaction_id`

## Frontend Integration

### TypeScript API Client
Created `src/services/learning/interaction-api.ts` with:
- Full TypeScript types
- All API methods
- Promise-based async/await

### Usage in React Components
```typescript
import { interactionApi } from '@/services/learning/interaction-api';

// Get next pending interaction
const nextInteraction = await interactionApi.getNextPending(customerId);

// Complete interaction (auto-creates next)
const result = await interactionApi.completeInteraction(
  interactionId,
  'success',
  'Customer interested'
);

// Start workflow
const firstInteraction = await interactionApi.startWorkflow({
  customer_id: customerId,
  template_id: templateId,
  start_date: '2026-01-22',
});
```

## Default Templates

### Standard Follow-up Sequence
1. **Step 1:** Phone Call (Monday)
2. **Step 2:** Send Proposal (by Wednesday)
3. **Step 3:** Follow-up (3 days after proposal)

### Quick Outreach Sequence
1. **Step 1:** Initial Email
2. **Step 2:** Follow-up Call (next day)
3. **Step 3:** Final Follow-up (2 days later)

## Integration Points

### With Campaigns
- Interactions can be linked to campaigns via `campaign_id`
- Campaigns can trigger interaction workflows
- Campaign performance can include interaction metrics

### With Conversations
- Interactions can be linked to conversations via `conversation_id`
- Conversations can trigger interaction creation
- Interaction outcomes can update conversation status

### With Customers
- Customer model has `interactions()` relationship
- Can query all interactions for a customer
- Can get next pending interaction
- Can get overdue interactions

## Benefits

1. **Always Forward Motion** - Always have a next step, even without campaigns
2. **Automated Workflows** - Define once, execute automatically
3. **Flexible** - Works with or without templates
4. **Campaign-Independent** - Maintains relationships outside campaigns
5. **Trackable** - Full history of interactions and outcomes
6. **Prioritizable** - Priority levels for urgent items
7. **Overdue Tracking** - Automatic detection of overdue items

## Files Created

### Backend
- `backend/database/migrations/2026_01_19_000003_create_interactions_table.php`
- `backend/app/Models/Interaction.php`
- `backend/app/Models/InteractionTemplate.php`
- `backend/app/Services/InteractionService.php`
- `backend/app/Http/Controllers/Api/InteractionController.php`
- `backend/database/seeders/InteractionTemplateSeeder.php`

### Frontend
- `src/services/learning/interaction-api.ts`

### Updated Files
- `backend/app/Models/Customer.php` - Added `interactions()` relationship
- `backend/routes/api.php` - Added interaction routes

## Next Steps (Optional Enhancements)

1. **Frontend UI Components**
   - Interaction list view
   - Interaction detail/edit form
   - Template builder UI
   - Calendar view for scheduled interactions

2. **Notifications**
   - Email/SMS reminders for due interactions
   - Overdue alerts
   - Completion notifications

3. **Analytics**
   - Interaction completion rates
   - Time-to-completion metrics
   - Outcome analysis
   - Template performance

4. **AI Integration**
   - AI-suggested next steps
   - Outcome prediction
   - Optimal timing suggestions

5. **Bulk Operations**
   - Bulk create interactions
   - Bulk complete
   - Bulk reschedule

## Testing

To test the system:

```bash
# Run migrations
php artisan migrate

# Seed default templates (optional)
php artisan db:seed --class=InteractionTemplateSeeder

# Test via API
curl -X POST http://localhost/api/v1/interactions \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: your-tenant-id" \
  -d '{
    "customer_id": "customer-uuid",
    "type": "phone_call",
    "title": "Call on Monday",
    "scheduled_at": "2026-01-22 10:00:00",
    "due_at": "2026-01-22 17:00:00"
  }'

# Complete interaction (triggers next step)
curl -X POST http://localhost/api/v1/interactions/{id}/complete \
  -H "X-Tenant-ID: your-tenant-id" \
  -d '{"outcome": "success"}'
```

## Summary

The Interaction System is now fully implemented and ready to use. It provides:

✅ Automatic next-step creation  
✅ Template-based workflows  
✅ Campaign-independent operation  
✅ Full API coverage  
✅ Frontend TypeScript client  
✅ Default templates included  
✅ Overdue tracking  
✅ Priority management  

The system ensures there's always a "next step" in every customer relationship, driving continuous engagement and forward motion.

