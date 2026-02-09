# Command Center Dashboard

## Overview

The Command Center Dashboard provides SMB customers with a personalized business hub showing trial countdown, value delivered, platform status, recent content, and quick actions.

## Features

### Trial Countdown Widget
- Displays days remaining in trial
- Shows trial start and end dates
- Upgrade CTA button
- Only visible when trial is active

### Value Tracker Widget
- Shows total value delivered in USD
- Breakdown by value type (ad value, content value, etc.)
- Visual progress indicators
- Historical value tracking

### Platform Status Widget
- Shows status of all platform services:
  - Day News (active/pending/inactive)
  - DTG (active/pending/inactive)
  - GEC (active/pending/inactive)
  - AlphaSite (active/pending/inactive)
- Color-coded status indicators
- Click to view details

### Recent Content Widget
- Lists recently published content
- Shows content type and date
- Links to view content
- Filterable by content type

### Quick Actions Widget
- Common actions for SMB customers
- One-click access to key features
- Contextual actions based on customer stage

## Database Schema

### customers (extended)
- `trial_started_at` - When trial started
- `trial_active` - Whether trial is currently active
- `trial_ends_at` - When trial ends
- `value_delivered_usd` - Total value delivered
- `platform_status` - JSON object with service statuses
- `dashboard_preferences` - JSON with widget preferences

### smb_dashboard_widgets
- `id` - Primary key
- `customer_id` - Foreign key to customer
- `widget_type` - Type of widget
- `position` - Widget position (top_left, top_right, etc.)
- `order` - Display order
- `is_visible` - Whether widget is visible
- `config` - Widget-specific configuration

## Frontend Components

### CommandCenterDashboard
Main dashboard page component.

**Route**: `/command-center`

**Features**:
- Responsive grid layout
- Widget customization
- Real-time updates
- Loading states

### TrialCountdown
Displays trial countdown information.

**Props**:
- `daysRemaining`: Number of days remaining
- `trialActive`: Whether trial is active
- `trialEndsAt`: Trial end date

### ValueTracker
Displays value delivered tracking.

**Props**:
- `valueDelivered`: Total value in USD
- `breakdown`: Value breakdown by type
- `history`: Historical value data

### PlatformStatus
Shows platform service statuses.

**Props**:
- `platformStatus`: Object with service statuses
- `onServiceClick`: Handler for service clicks

### RecentContent
Lists recently published content.

**Props**:
- `content`: Array of recent content items
- `onContentClick`: Handler for content clicks

### QuickActions
Displays quick action buttons.

**Props**:
- `actions`: Array of available actions
- `onActionClick`: Handler for action clicks

## API Endpoints

### Get Dashboard Data
```
GET /api/v1/command-center/dashboard
```

**Response**:
```json
{
    "trial_info": {
        "days_remaining": 45,
        "trial_active": true,
        "trial_ends_at": "2026-04-20T00:00:00Z"
    },
    "value_delivered": {
        "total_usd": 1250.00,
        "breakdown": {
            "ad_value": 800.00,
            "content_value": 450.00
        }
    },
    "platform_status": {
        "day_news": "active",
        "dtg": "active",
        "gec": "pending",
        "alphasite": "inactive"
    },
    "recent_content": [...],
    "quick_actions": [...]
}
```

### Get Trial Info
```
GET /api/v1/command-center/trial-info
```

### Get Value Tracker
```
GET /api/v1/command-center/value-tracker
```

### Get Platform Status
```
GET /api/v1/command-center/platform-status
```

### Get Recent Content
```
GET /api/v1/command-center/recent-content?limit=10
```

## Usage

### Loading Dashboard Data

```typescript
import { commandCenterApi } from '@/services/command-center-api';

const dashboardData = await commandCenterApi.getDashboard();
```

### Updating Widget Preferences

```typescript
await commandCenterApi.updateWidgetPreferences({
    widgets: ['trial_countdown', 'value_tracker'],
    theme: 'light'
});
```

## Widget Configuration

### Widget Types
- `trial_countdown` - Trial countdown widget
- `value_tracker` - Value delivered tracker
- `platform_status` - Platform status indicators
- `recent_content` - Recent content list
- `quick_actions` - Quick action buttons

### Widget Positions
- `top_left` - Top left quadrant
- `top_right` - Top right quadrant
- `bottom_left` - Bottom left quadrant
- `bottom_right` - Bottom right quadrant
- `main` - Main content area

## Examples

### Displaying Trial Countdown

```typescript
import { TrialCountdown } from '@/components/CommandCenter/TrialCountdown';

<TrialCountdown 
    daysRemaining={45}
    trialActive={true}
    trialEndsAt="2026-04-20T00:00:00Z"
/>
```

### Showing Platform Status

```typescript
import { PlatformStatus } from '@/components/CommandCenter/PlatformStatus';

<PlatformStatus 
    platformStatus={{
        day_news: 'active',
        dtg: 'active',
        gec: 'pending',
        alphasite: 'inactive'
    }}
    onServiceClick={(service) => {
        // Handle service click
    }}
/>
```

## Value Tracking

### Recording Value Delivered

```php
use App\Models\Customer;

$customer = Customer::find($customerId);
$customer->increment('value_delivered_usd', 100.00);

// Or update with breakdown
$customer->update([
    'value_delivered_usd' => 1250.00,
    'metadata' => array_merge($customer->metadata ?? [], [
        'value_breakdown' => [
            'ad_value' => 800.00,
            'content_value' => 450.00,
        ]
    ])
]);
```

## Platform Status Updates

### Updating Platform Status

```php
$customer = Customer::find($customerId);
$customer->update([
    'platform_status' => [
        'day_news' => 'active',
        'dtg' => 'active',
        'gec' => 'pending',
        'alphasite' => 'inactive',
    ]
]);
```

## Customization

### Widget Preferences

Customers can customize their dashboard:

```php
$customer->update([
    'dashboard_preferences' => [
        'widgets' => ['trial_countdown', 'value_tracker', 'recent_content'],
        'theme' => 'light',
        'layout' => 'grid',
    ]
]);
```

## Testing

### Component Tests
```bash
npm test -- TrialCountdown.test.tsx
npm test -- ValueTracker.test.tsx
```

## Troubleshooting

### Widget Not Displaying
1. Check widget is in `dashboard_preferences['widgets']`
2. Verify `is_visible` flag in `smb_dashboard_widgets` table
3. Check widget component is imported correctly
4. Review widget configuration

### Trial Countdown Not Showing
1. Verify `trial_active` is true
2. Check `trial_ends_at` is set
3. Ensure customer is in Hook stage
4. Review trial calculation logic

### Value Not Updating
1. Check `value_delivered_usd` field is being updated
2. Verify value breakdown in metadata
3. Review value tracking code
4. Check database field type (decimal)

## Best Practices

1. **Real-time Updates**: Use WebSockets or polling for live updates
2. **Widget Performance**: Lazy load widgets for better performance
3. **Customization**: Allow customers to customize widget layout
4. **Value Tracking**: Track value delivered for all customer interactions
5. **Platform Status**: Update status in real-time as services change
6. **Mobile Responsive**: Ensure dashboard works on mobile devices

## API Reference

### Get Dashboard
```typescript
commandCenterApi.getDashboard(): Promise<DashboardData>
```

### Get Trial Info
```typescript
commandCenterApi.getTrialInfo(): Promise<TrialInfo>
```

### Get Value Tracker
```typescript
commandCenterApi.getValueTracker(): Promise<ValueTrackerData>
```

### Get Platform Status
```typescript
commandCenterApi.getPlatformStatus(): Promise<PlatformStatus>
```

### Get Recent Content
```typescript
commandCenterApi.getRecentContent(limit?: number): Promise<Content[]>
```

### Update Widget Preferences
```typescript
commandCenterApi.updateWidgetPreferences(
    preferences: WidgetPreferences
): Promise<void>
```

