# MODULE 6: COMMAND CENTER
## DIY Self-Service Interface

**Owner:** Agent 6
**Timeline:** Week 4-7
**Dependencies:** Module 0, Module 1 (SMB CRM), Module 4 (Approvals)
**Blocks:** None

---

## OBJECTIVE

Build the Command Center - a self-service dashboard where SMB owners can manage their marketing, scheduling, reviews, and operations without needing the AI Account Manager.

---

## TABLES OWNED

This module primarily uses tables from other modules via their service interfaces. It may create:
- `command_center_settings` (optional, for UI preferences)

---

## ARCHITECTURE

```
COMMAND CENTER STRUCTURE:
─────────────────────────────────────────────────────────────────────────────────

Frontend: Vue 3 + Tailwind + Headless UI
Backend: Laravel API endpoints under /api/v1/command-center/

┌─────────────────────────────────────────────────────────────────────────────┐
│                              COMMAND CENTER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dashboard  │  │   Profile   │  │  Marketing  │  │ Reputation  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Scheduling │  │  Invoicing  │  │  Customers  │  │  Automation │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐                                           │
│  │  Analytics  │  │  Settings   │                                           │
│  └─────────────┘  └─────────────┘                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## FEATURES TO BUILD

### 1. Dashboard

```php
// app/Http/Controllers/Api/V1/CommandCenter/DashboardController.php

class DashboardController extends Controller
{
    // GET /api/v1/command-center/dashboard
    public function index(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'overview' => [
                'engagement_score' => $smb->engagement_score,
                'tier' => $smb->getTierName(),
                'services_active' => count($smb->services_activated ?? []),
                'pending_approvals' => count($smb->services_approved_pending ?? []),
            ],
            'metrics' => $this->getMetrics($smb),
            'recent_activity' => $this->getRecentActivity($smb),
            'action_items' => $this->getActionItems($smb),
            'quick_actions' => $this->getQuickActions($smb),
        ];
    }
    
    protected function getMetrics(SMB $smb): array
    {
        $thirtyDaysAgo = now()->subDays(30);
        
        return [
            'views_30d' => $this->getProfileViews($smb, $thirtyDaysAgo),
            'views_change' => $this->getViewsChange($smb),
            'reviews_30d' => $this->getReviewCount($smb, $thirtyDaysAgo),
            'avg_rating' => $this->getAverageRating($smb),
            'bookings_30d' => $this->getBookingCount($smb, $thirtyDaysAgo),
            'revenue_30d' => $this->getRevenue($smb, $thirtyDaysAgo),
        ];
    }
    
    protected function getRecentActivity(SMB $smb): array
    {
        // Combine activities from different sources
        $activities = collect();
        
        // Recent approvals
        $approvals = Approval::where('smb_id', $smb->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'type' => 'approval',
                'title' => "Approved: {$a->service_type}",
                'timestamp' => $a->approved_at,
            ]);
        $activities = $activities->merge($approvals);
        
        // Recent content views
        $views = ContentView::where('smb_id', $smb->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($v) => [
                'type' => 'content_view',
                'title' => "Viewed: {$v->content_slug}",
                'timestamp' => $v->started_at,
            ]);
        $activities = $activities->merge($views);
        
        return $activities->sortByDesc('timestamp')->take(10)->values()->toArray();
    }
    
    protected function getActionItems(SMB $smb): array
    {
        $items = [];
        
        // Incomplete profile
        if (!$smb->address || !$smb->primary_phone) {
            $items[] = [
                'type' => 'complete_profile',
                'priority' => 'high',
                'title' => 'Complete your business profile',
                'description' => 'Add missing information to improve visibility',
                'action_url' => '/command-center/profile',
            ];
        }
        
        // No reviews
        if ($this->getReviewCount($smb, now()->subYear()) === 0) {
            $items[] = [
                'type' => 'get_reviews',
                'priority' => 'medium',
                'title' => 'Start collecting reviews',
                'description' => 'Set up automated review requests',
                'action_url' => '/command-center/reputation',
            ];
        }
        
        // Pending services
        foreach ($smb->services_approved_pending ?? [] as $service) {
            $items[] = [
                'type' => 'pending_service',
                'priority' => 'medium',
                'title' => "Complete setup: {$service}",
                'description' => 'Finish configuring your approved service',
                'action_url' => "/command-center/services/{$service}",
            ];
        }
        
        return $items;
    }
    
    protected function getQuickActions(SMB $smb): array
    {
        return [
            ['id' => 'post_update', 'label' => 'Post Update', 'icon' => 'megaphone'],
            ['id' => 'request_review', 'label' => 'Request Review', 'icon' => 'star'],
            ['id' => 'create_coupon', 'label' => 'Create Coupon', 'icon' => 'ticket'],
            ['id' => 'schedule_post', 'label' => 'Schedule Post', 'icon' => 'calendar'],
        ];
    }
}
```

### 2. Profile Management

```php
// app/Http/Controllers/Api/V1/CommandCenter/ProfileController.php

class ProfileController extends Controller
{
    // GET /api/v1/command-center/profile
    public function show(Request $request)
    {
        $smb = $request->user()->smb->load('community');
        
        return [
            'business' => [
                'name' => $smb->business_name,
                'dba_name' => $smb->dba_name,
                'category' => $smb->category,
                'business_type' => $smb->business_type,
                'description' => $smb->metadata['description'] ?? '',
            ],
            'contact' => [
                'primary_name' => $smb->primary_contact_name,
                'primary_email' => $smb->primary_email,
                'primary_phone' => $smb->primary_phone,
                'website' => $smb->metadata['website'] ?? '',
            ],
            'location' => [
                'address' => $smb->address,
                'city' => $smb->city,
                'state' => $smb->state,
                'zip' => $smb->zip,
                'community' => $smb->community->name,
            ],
            'hours' => $smb->metadata['hours'] ?? $this->getDefaultHours(),
            'photos' => $smb->metadata['photos'] ?? [],
            'social_links' => $smb->metadata['social_links'] ?? [],
            'completeness' => $this->calculateCompleteness($smb),
        ];
    }
    
    // PUT /api/v1/command-center/profile
    public function update(Request $request)
    {
        $request->validate([
            'business.name' => 'sometimes|string|max:255',
            'business.description' => 'sometimes|string|max:1000',
            'contact.primary_email' => 'sometimes|email',
            'contact.primary_phone' => 'sometimes|string|max:20',
            'location.address' => 'sometimes|string|max:255',
            'hours' => 'sometimes|array',
        ]);
        
        $smb = $request->user()->smb;
        
        // Update main fields
        $smb->update([
            'business_name' => $request->input('business.name', $smb->business_name),
            'primary_email' => $request->input('contact.primary_email', $smb->primary_email),
            'primary_phone' => $request->input('contact.primary_phone', $smb->primary_phone),
            'address' => $request->input('location.address', $smb->address),
            'city' => $request->input('location.city', $smb->city),
            'state' => $request->input('location.state', $smb->state),
            'zip' => $request->input('location.zip', $smb->zip),
        ]);
        
        // Update metadata
        $metadata = $smb->metadata ?? [];
        if ($request->has('business.description')) {
            $metadata['description'] = $request->input('business.description');
        }
        if ($request->has('hours')) {
            $metadata['hours'] = $request->input('hours');
        }
        if ($request->has('contact.website')) {
            $metadata['website'] = $request->input('contact.website');
        }
        $smb->update(['metadata' => $metadata]);
        
        return $this->show($request);
    }
    
    // POST /api/v1/command-center/profile/photos
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // 5MB max
            'type' => 'required|in:logo,cover,gallery',
        ]);
        
        $smb = $request->user()->smb;
        $path = $request->file('photo')->store("smbs/{$smb->id}/photos", 's3');
        
        $metadata = $smb->metadata ?? [];
        $photos = $metadata['photos'] ?? [];
        $photos[] = [
            'url' => Storage::disk('s3')->url($path),
            'type' => $request->type,
            'uploaded_at' => now()->toISOString(),
        ];
        $metadata['photos'] = $photos;
        $smb->update(['metadata' => $metadata]);
        
        return response()->json(['url' => Storage::disk('s3')->url($path)]);
    }
}
```

### 3. Marketing Module

```php
// app/Http/Controllers/Api/V1/CommandCenter/MarketingController.php

class MarketingController extends Controller
{
    // GET /api/v1/command-center/marketing/posts
    public function getPosts(Request $request)
    {
        $smb = $request->user()->smb;
        
        // Return scheduled and published posts
        return [
            'scheduled' => $this->getScheduledPosts($smb),
            'published' => $this->getPublishedPosts($smb),
            'drafts' => $this->getDraftPosts($smb),
        ];
    }
    
    // POST /api/v1/command-center/marketing/posts
    public function createPost(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'platforms' => 'required|array',
            'platforms.*' => 'in:facebook,instagram,twitter,google',
            'scheduled_for' => 'nullable|date|after:now',
            'image_url' => 'nullable|url',
        ]);
        
        $smb = $request->user()->smb;
        
        // Create post (actual implementation would integrate with social APIs)
        $post = [
            'id' => Str::uuid(),
            'content' => $request->content,
            'platforms' => $request->platforms,
            'scheduled_for' => $request->scheduled_for,
            'image_url' => $request->image_url,
            'status' => $request->scheduled_for ? 'scheduled' : 'published',
            'created_at' => now(),
        ];
        
        // Store in SMB metadata or separate table
        $this->storePost($smb, $post);
        
        return response()->json($post, 201);
    }
    
    // GET /api/v1/command-center/marketing/coupons
    public function getCoupons(Request $request)
    {
        $smb = $request->user()->smb;
        return $this->getSMBCoupons($smb);
    }
    
    // POST /api/v1/command-center/marketing/coupons
    public function createCoupon(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'code' => 'nullable|string|max:20',
            'expires_at' => 'nullable|date|after:now',
            'max_uses' => 'nullable|integer|min:1',
        ]);
        
        // Create coupon
        $coupon = [
            'id' => Str::uuid(),
            'title' => $request->title,
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'code' => $request->code ?? strtoupper(Str::random(8)),
            'expires_at' => $request->expires_at,
            'max_uses' => $request->max_uses,
            'uses' => 0,
            'is_active' => true,
            'created_at' => now(),
        ];
        
        $smb = $request->user()->smb;
        $this->storeCoupon($smb, $coupon);
        
        return response()->json($coupon, 201);
    }
}
```

### 4. Reputation Module

```php
// app/Http/Controllers/Api/V1/CommandCenter/ReputationController.php

class ReputationController extends Controller
{
    // GET /api/v1/command-center/reputation
    public function index(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'summary' => [
                'average_rating' => $this->getAverageRating($smb),
                'total_reviews' => $this->getTotalReviews($smb),
                'reviews_this_month' => $this->getReviewsThisMonth($smb),
                'response_rate' => $this->getResponseRate($smb),
            ],
            'rating_distribution' => $this->getRatingDistribution($smb),
            'recent_reviews' => $this->getRecentReviews($smb, 10),
            'pending_responses' => $this->getPendingResponses($smb),
        ];
    }
    
    // GET /api/v1/command-center/reputation/reviews
    public function reviews(Request $request)
    {
        $smb = $request->user()->smb;
        
        return $this->getReviews($smb, [
            'status' => $request->get('status'), // all, responded, pending
            'rating' => $request->get('rating'), // 1-5
            'source' => $request->get('source'), // google, yelp, facebook
            'page' => $request->get('page', 1),
        ]);
    }
    
    // POST /api/v1/command-center/reputation/reviews/{id}/respond
    public function respondToReview(Request $request, string $reviewId)
    {
        $request->validate([
            'response' => 'required|string|max:1000',
        ]);
        
        // Store response (would integrate with review platforms)
        $this->storeReviewResponse($reviewId, $request->response);
        
        return response()->json(['success' => true]);
    }
    
    // POST /api/v1/command-center/reputation/request-reviews
    public function sendReviewRequests(Request $request)
    {
        $request->validate([
            'customer_emails' => 'required|array|max:50',
            'customer_emails.*' => 'email',
            'template_id' => 'nullable|string',
        ]);
        
        $smb = $request->user()->smb;
        
        foreach ($request->customer_emails as $email) {
            dispatch(new SendReviewRequest($smb->id, $email, $request->template_id));
        }
        
        return response()->json([
            'success' => true,
            'count' => count($request->customer_emails),
        ]);
    }
    
    // GET /api/v1/command-center/reputation/settings
    public function getSettings(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'auto_request' => [
                'enabled' => $smb->metadata['review_auto_request'] ?? false,
                'delay_days' => $smb->metadata['review_delay_days'] ?? 3,
                'template_id' => $smb->metadata['review_template_id'] ?? 'default',
            ],
            'notification_settings' => [
                'new_review' => $smb->metadata['notify_new_review'] ?? true,
                'negative_review' => $smb->metadata['notify_negative_review'] ?? true,
            ],
            'review_links' => [
                'google' => $smb->metadata['google_review_link'] ?? null,
                'yelp' => $smb->metadata['yelp_review_link'] ?? null,
                'facebook' => $smb->metadata['facebook_review_link'] ?? null,
            ],
        ];
    }
    
    // PUT /api/v1/command-center/reputation/settings
    public function updateSettings(Request $request)
    {
        $smb = $request->user()->smb;
        $metadata = $smb->metadata ?? [];
        
        if ($request->has('auto_request')) {
            $metadata['review_auto_request'] = $request->input('auto_request.enabled');
            $metadata['review_delay_days'] = $request->input('auto_request.delay_days');
            $metadata['review_template_id'] = $request->input('auto_request.template_id');
        }
        
        if ($request->has('review_links')) {
            $metadata['google_review_link'] = $request->input('review_links.google');
            $metadata['yelp_review_link'] = $request->input('review_links.yelp');
            $metadata['facebook_review_link'] = $request->input('review_links.facebook');
        }
        
        $smb->update(['metadata' => $metadata]);
        
        return $this->getSettings($request);
    }
}
```

### 5. Scheduling Module

```php
// app/Http/Controllers/Api/V1/CommandCenter/SchedulingController.php

class SchedulingController extends Controller
{
    // GET /api/v1/command-center/scheduling/appointments
    public function getAppointments(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'upcoming' => $this->getUpcomingAppointments($smb),
            'today' => $this->getTodayAppointments($smb),
            'pending_confirmation' => $this->getPendingAppointments($smb),
        ];
    }
    
    // GET /api/v1/command-center/scheduling/calendar
    public function getCalendar(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after:start',
        ]);
        
        $smb = $request->user()->smb;
        
        return $this->getCalendarEvents($smb, $request->start, $request->end);
    }
    
    // PUT /api/v1/command-center/scheduling/availability
    public function updateAvailability(Request $request)
    {
        $request->validate([
            'availability' => 'required|array',
            'availability.*.day' => 'required|integer|between:0,6',
            'availability.*.slots' => 'required|array',
            'availability.*.slots.*.start' => 'required|date_format:H:i',
            'availability.*.slots.*.end' => 'required|date_format:H:i',
        ]);
        
        $smb = $request->user()->smb;
        $metadata = $smb->metadata ?? [];
        $metadata['availability'] = $request->availability;
        $smb->update(['metadata' => $metadata]);
        
        return response()->json(['success' => true]);
    }
    
    // GET /api/v1/command-center/scheduling/widget
    public function getWidget(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'embed_code' => $this->generateWidgetCode($smb),
            'direct_link' => url("/book/{$smb->uuid}"),
            'settings' => [
                'buffer_time' => $smb->metadata['booking_buffer'] ?? 15,
                'advance_booking_days' => $smb->metadata['advance_booking'] ?? 30,
                'confirmation_required' => $smb->metadata['booking_confirmation'] ?? false,
            ],
        ];
    }
}
```

### 6. Settings Module

```php
// app/Http/Controllers/Api/V1/CommandCenter/SettingsController.php

class SettingsController extends Controller
{
    // GET /api/v1/command-center/settings
    public function index(Request $request)
    {
        $smb = $request->user()->smb;
        
        return [
            'account' => [
                'email' => $smb->primary_email,
                'phone' => $smb->primary_phone,
                'timezone' => $smb->community->timezone,
            ],
            'notifications' => [
                'email_notifications' => $smb->metadata['email_notifications'] ?? true,
                'sms_notifications' => $smb->metadata['sms_notifications'] ?? false,
                'notification_types' => $smb->metadata['notification_types'] ?? ['bookings', 'reviews', 'messages'],
            ],
            'communication' => [
                'email_opted_in' => $smb->email_opted_in,
                'sms_opted_in' => $smb->sms_opted_in,
                'rvm_opted_in' => $smb->rvm_opted_in,
            ],
            'subscription' => [
                'tier' => $smb->subscription_tier,
                'service_model' => $smb->service_model,
                'services_activated' => $smb->services_activated,
            ],
            'integrations' => $this->getIntegrations($smb),
        ];
    }
    
    // PUT /api/v1/command-center/settings
    public function update(Request $request)
    {
        $smb = $request->user()->smb;
        
        // Update communication preferences
        if ($request->has('communication')) {
            $smb->update([
                'email_opted_in' => $request->input('communication.email_opted_in', $smb->email_opted_in),
                'sms_opted_in' => $request->input('communication.sms_opted_in', $smb->sms_opted_in),
                'rvm_opted_in' => $request->input('communication.rvm_opted_in', $smb->rvm_opted_in),
            ]);
        }
        
        // Update notification settings
        if ($request->has('notifications')) {
            $metadata = $smb->metadata ?? [];
            $metadata['email_notifications'] = $request->input('notifications.email_notifications');
            $metadata['sms_notifications'] = $request->input('notifications.sms_notifications');
            $metadata['notification_types'] = $request->input('notifications.notification_types');
            $smb->update(['metadata' => $metadata]);
        }
        
        return $this->index($request);
    }
}
```

---

## API ENDPOINTS

```
# Dashboard
GET    /api/v1/command-center/dashboard

# Profile
GET    /api/v1/command-center/profile
PUT    /api/v1/command-center/profile
POST   /api/v1/command-center/profile/photos

# Marketing
GET    /api/v1/command-center/marketing/posts
POST   /api/v1/command-center/marketing/posts
PUT    /api/v1/command-center/marketing/posts/{id}
DELETE /api/v1/command-center/marketing/posts/{id}
GET    /api/v1/command-center/marketing/coupons
POST   /api/v1/command-center/marketing/coupons
PUT    /api/v1/command-center/marketing/coupons/{id}

# Reputation
GET    /api/v1/command-center/reputation
GET    /api/v1/command-center/reputation/reviews
POST   /api/v1/command-center/reputation/reviews/{id}/respond
POST   /api/v1/command-center/reputation/request-reviews
GET    /api/v1/command-center/reputation/settings
PUT    /api/v1/command-center/reputation/settings

# Scheduling
GET    /api/v1/command-center/scheduling/appointments
GET    /api/v1/command-center/scheduling/calendar
PUT    /api/v1/command-center/scheduling/availability
GET    /api/v1/command-center/scheduling/widget
PUT    /api/v1/command-center/scheduling/settings

# Customers (basic CRM)
GET    /api/v1/command-center/customers
POST   /api/v1/command-center/customers
GET    /api/v1/command-center/customers/{id}
PUT    /api/v1/command-center/customers/{id}

# Settings
GET    /api/v1/command-center/settings
PUT    /api/v1/command-center/settings

# Services
GET    /api/v1/command-center/services
GET    /api/v1/command-center/services/{type}
PUT    /api/v1/command-center/services/{type}/settings
```

---

## FRONTEND COMPONENTS

```
Vue Components Structure:
─────────────────────────────────────────────────────────────────────────────────

src/
├── views/
│   └── command-center/
│       ├── Dashboard.vue
│       ├── Profile.vue
│       ├── Marketing/
│       │   ├── Index.vue
│       │   ├── Posts.vue
│       │   ├── Coupons.vue
│       │   └── Calendar.vue
│       ├── Reputation/
│       │   ├── Index.vue
│       │   ├── Reviews.vue
│       │   └── Settings.vue
│       ├── Scheduling/
│       │   ├── Index.vue
│       │   ├── Calendar.vue
│       │   └── Settings.vue
│       ├── Customers/
│       │   ├── Index.vue
│       │   └── Detail.vue
│       └── Settings/
│           ├── Index.vue
│           ├── Notifications.vue
│           └── Integrations.vue
├── components/
│   └── command-center/
│       ├── Sidebar.vue
│       ├── Header.vue
│       ├── MetricCard.vue
│       ├── ActivityFeed.vue
│       ├── QuickAction.vue
│       └── ...
└── stores/
    └── commandCenter.js
```

---

## ACCEPTANCE CRITERIA

- [ ] Dashboard with metrics and activity
- [ ] Profile management (CRUD + photos)
- [ ] Marketing posts and coupons
- [ ] Reputation dashboard and review responses
- [ ] Scheduling calendar and availability
- [ ] Settings management
- [ ] All API endpoints functional
- [ ] Vue frontend components
- [ ] Responsive design (mobile-friendly)
- [ ] Unit tests: 80% coverage
