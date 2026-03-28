# COMMAND CENTER — Product Catalog System Implementation
## Antigravity Execution Spec — Read Entire File Before Starting

> **Repo:** Learning-Center (Command Center)
> **Backend:** `backend/app/`
> **Frontend:** `src/pages/`
> **Run tasks in order. Read each target file with @file before editing.**

---

## GLOBAL RULES

```
1. Backend PHP: No strict_types declaration needed (CC doesn't use it). Class naming matches existing CC conventions.
2. All models: use HasUuids trait
3. Database changes: migrations ONLY
4. Frontend: React + TypeScript + shadcn/ui (existing pattern)
5. Stripe: use existing StripeService — never call Stripe directly
6. Follow CssnSubscriptionController as the reference pattern for all subscription flows
7. Follow existing route registration in backend/routes/api.php
```

---

## PHASE 1 — PRODUCT REGISTRY + DEPENDENCY ENGINE

### Task 1.1 — Migration: Extend services table

**File:** `backend/database/migrations/2026_03_27_000001_add_product_catalog_fields_to_services.php`

Add these columns to the existing `services` table:

```php
Schema::table('services', function (Blueprint $table) {
    $table->string('product_slug')->unique()->nullable()->after('slug');
    $table->string('sold_by')->default('emma')->after('service_type'); // emma, patricia, sarah, self-serve, auto
    $table->json('requires_products')->nullable()->after('capabilities'); // array of product_slugs required to purchase
    $table->json('platform_surfaces')->nullable()->after('requires_products'); // which UI surfaces this product appears on
    $table->boolean('is_perk')->default(false)->after('is_featured'); // perks aren't sold directly
    $table->string('billing_unit')->nullable()->after('billing_period'); // per-send, per-article, per-notice, per-poll, per-listing, per-event, per-invite-batch, commission
    $table->decimal('commission_rate', 5, 2)->nullable()->after('billing_unit');
    $table->integer('max_per_community')->nullable()->after('commission_rate'); // slot limit (e.g., 1 for section sponsor, 1 for headliner per category)
});
```

---

### Task 1.2 — ProductDependencyService

**File:** `backend/app/Services/ProductDependencyService.php`

```php
<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\Log;

class ProductDependencyService
{
    /**
     * Check if a customer can purchase a product based on its dependency chain.
     * Returns ['allowed' => bool, 'missing' => [...slugs...]]
     */
    public function canPurchase(string $tenantId, string $productSlug): array
    {
        $product = Service::where('product_slug', $productSlug)->first();

        if (!$product) {
            return ['allowed' => false, 'missing' => [], 'error' => 'Product not found'];
        }

        $requires = $product->requires_products ?? [];

        if (empty($requires)) {
            return ['allowed' => true, 'missing' => []];
        }

        // Get all active subscriptions/orders for this tenant
        $activeProductSlugs = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->join('services', 'services.id', '=', 'service_subscriptions.service_id')
            ->pluck('services.product_slug')
            ->filter()
            ->toArray();

        $missing = array_diff($requires, $activeProductSlugs);

        return [
            'allowed' => empty($missing),
            'missing' => array_values($missing),
        ];
    }

    /**
     * Get all products a customer is eligible to purchase.
     */
    public function availableProducts(string $tenantId): array
    {
        $allProducts = Service::where('is_active', true)
            ->where('is_perk', false)
            ->get();

        $available = [];
        foreach ($allProducts as $product) {
            $check = $this->canPurchase($tenantId, $product->product_slug);
            $available[] = [
                'product' => $product,
                'can_purchase' => $check['allowed'],
                'missing_prerequisites' => $check['missing'],
            ];
        }

        return $available;
    }
}
```

---

### Task 1.3 — Seed All 31 Products

**File:** `backend/database/seeders/ProductCatalogSeeder.php`

Create a seeder that inserts all 31 products from the Product Matrix as `Service` records. Use `updateOrCreate` keyed on `product_slug` so it's re-runnable.

Each product needs: `name`, `product_slug`, `service_type`, `service_tier`, `is_subscription`, `billing_period`, `billing_unit`, `price` (low end of range), `compare_at_price` (high end), `sold_by`, `requires_products` (from dependency tree), `is_perk`, `max_per_community`, `features` (from matrix), `is_active` = true.

Products to seed (use these exact slugs):

```
VISIBILITY & LISTING:
headliner              | $75-800/mo  | monthly    | emma       | requires: []
priority-listing       | included    | —          | auto       | is_perk: true
premium-listing        | $29-199/mo  | monthly    | emma       | requires: []
awards-achievements    | free        | —          | auto       | is_perk: true

DISPLAY ADVERTISING:
display-ads            | $50-500/mo  | monthly    | emma       | requires: []
email-ads              | $25-300     | per-send   | emma       | requires: ['display-ads']
newsletter-sponsor     | $100-300    | per-send   | emma       | requires: ['display-ads']

CONTENT & SPONSORSHIP:
article-companion      | $50-150     | per-article| emma       | requires: []
section-sponsor        | $300-2000/mo| monthly    | emma       | requires: [] | max_per_community: 1 per section
content-posting        | $0-50       | per-use    | self-serve | requires: ['premium-listing'] (for volume)
legal-notices          | $25-200     | per-notice | self-serve | requires: []

POLLS:
poll-participation     | $0-149      | per-poll   | auto       | requires: []
poll-sponsor           | $100-500    | per-poll   | emma       | requires: ['display-ads'] (or section-sponsor)

TRANSACTIONS:
booking-system         | $49/mo+comm | monthly    | emma       | requires: ['premium-listing'] | commission_rate: 3.00
ticket-sales           | 1-5% comm   | commission | self-serve | requires: [] | commission_rate: 5.00
marketplace            | 5-15% comm  | commission | self-serve | requires: [] | commission_rate: 10.00
classifieds            | $5-50       | per-listing| self-serve | requires: []
coupons-deals          | $0-25       | per-use    | self-serve | requires: ['premium-listing']

NOTIFICATIONS:
event-reminders        | $5-25       | per-event  | self-serve | requires: ['premium-listing']
ticket-reminders       | included    | —          | auto       | is_perk: true | requires: ['ticket-sales']
since-youre-going-to   | $25-100     | per-event  | emma       | requires: ['event-reminders']

SUBSCRIPTIONS:
calendar-follower-sub  | $19-49/mo   | monthly    | self-serve | requires: ['premium-listing']
community-influencer-sub| $29-99/mo  | monthly    | patricia   | requires: []
friend-calendar-invite | $1-5        | per-batch  | self-serve | requires: ['calendar-follower-sub']

AI SERVICES:
ai-personal-assistant  | $99-499/mo  | monthly    | self-serve | requires: []
ai-4-calls             | $49-199/mo  | monthly    | emma       | requires: ['ai-personal-assistant']
ai-email-response      | $29-99/mo   | monthly    | self-serve | requires: ['ai-personal-assistant']
ai-chatbot             | $49-149/mo  | monthly    | self-serve | requires: ['ai-personal-assistant']

DISTRIBUTION:
social-syndication     | $29-99/mo   | monthly    | self-serve | requires: ['content-posting']
daynews-cross-post     | $25-100     | per-post   | emma       | requires: ['premium-listing']

SPONSOR CREDITS:
community-sponsor-credit| included   | —          | patricia   | is_perk: true
```

Also seed the 4 subscription bundles from the Master Catalog:

```
community-influencer   | $300/mo     | monthly    | sarah/emma | requires: []
community-expert       | $100/mo     | monthly    | sarah/emma | requires: ['community-influencer']
community-sponsor      | $300+section| monthly    | sarah/emma | requires: []
community-reporter     | $100/mo     | monthly    | self-serve | requires: []
```

Run: `php artisan db:seed --class=ProductCatalogSeeder`

---

### Task 1.4 — Product Catalog API Controller

**File:** `backend/app/Http/Controllers/Api/ProductCatalogController.php`

Endpoints:
- `GET /v1/products` — list all active products with dependency status for the authenticated tenant
- `GET /v1/products/{slug}` — single product detail
- `GET /v1/products/{slug}/can-purchase` — dependency check for a specific product

Uses `ProductDependencyService`.

**Routes** (add to `backend/routes/api.php` inside the `auth:sanctum` middleware group):

```php
Route::prefix('products')->group(function () {
    Route::get('/', [ProductCatalogController::class, 'index']);
    Route::get('/{slug}', [ProductCatalogController::class, 'show']);
    Route::get('/{slug}/can-purchase', [ProductCatalogController::class, 'canPurchase']);
});
```

---

## PHASE 2 — COMMUNITY INFLUENCER SUBSCRIPTION

### Task 2.1 — Migration: community_subscriptions table

**File:** `backend/database/migrations/2026_03_27_000002_create_community_subscriptions_table.php`

```php
Schema::create('community_subscriptions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('customer_id');
    $table->uuid('community_id');
    $table->string('product_slug'); // community-influencer, community-expert, community-sponsor, community-reporter
    $table->string('tier')->default('influencer'); // influencer, expert, sponsor, reporter
    $table->string('status')->default('pending'); // pending, active, paused, cancelled, expired
    
    // Billing
    $table->decimal('monthly_rate', 10, 2);
    $table->string('stripe_subscription_id')->nullable();
    $table->string('stripe_customer_id')->nullable();
    
    // Commitment
    $table->integer('commitment_months')->default(12);
    $table->timestamp('commitment_starts_at')->nullable();
    $table->timestamp('commitment_ends_at')->nullable();
    $table->integer('bonus_months')->default(3);
    $table->timestamp('bonus_starts_at')->nullable();
    $table->timestamp('bonus_ends_at')->nullable();
    $table->timestamp('next_renewal_at')->nullable(); // month 15 for standard
    
    // Founder pricing
    $table->boolean('is_founder_pricing')->default(false);
    $table->timestamp('founder_lock_expires_at')->nullable(); // 3 years from signup
    
    // Slot tracking
    $table->string('category_group')->nullable();
    $table->string('category_subtype')->nullable();
    
    // Expert-specific
    $table->string('expert_column_name')->nullable();
    $table->string('expert_column_slug')->nullable();
    
    // Sponsor-specific
    $table->string('sponsored_section')->nullable();
    $table->decimal('section_price', 10, 2)->nullable();
    
    // Cancellation
    $table->timestamp('cancelled_at')->nullable();
    $table->string('cancellation_reason')->nullable();
    $table->decimal('early_termination_balance', 10, 2)->nullable();
    
    $table->timestamps();
    
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->foreign('community_id')->references('id')->on('communities');
    $table->index(['community_id', 'product_slug', 'status']);
    $table->index(['customer_id', 'status']);
    $table->index(['community_id', 'category_group', 'category_subtype']);
});
```

---

### Task 2.2 — CommunitySubscription Model

**File:** `backend/app/Models/CommunitySubscription.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunitySubscription extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id', 'community_id', 'product_slug', 'tier', 'status',
        'monthly_rate', 'stripe_subscription_id', 'stripe_customer_id',
        'commitment_months', 'commitment_starts_at', 'commitment_ends_at',
        'bonus_months', 'bonus_starts_at', 'bonus_ends_at', 'next_renewal_at',
        'is_founder_pricing', 'founder_lock_expires_at',
        'category_group', 'category_subtype',
        'expert_column_name', 'expert_column_slug',
        'sponsored_section', 'section_price',
        'cancelled_at', 'cancellation_reason', 'early_termination_balance',
    ];

    protected function casts(): array
    {
        return [
            'monthly_rate' => 'decimal:2',
            'section_price' => 'decimal:2',
            'early_termination_balance' => 'decimal:2',
            'commitment_starts_at' => 'datetime',
            'commitment_ends_at' => 'datetime',
            'bonus_starts_at' => 'datetime',
            'bonus_ends_at' => 'datetime',
            'next_renewal_at' => 'datetime',
            'founder_lock_expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'is_founder_pricing' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isInBonusPeriod(): bool
    {
        if (!$this->bonus_starts_at || !$this->bonus_ends_at) {
            return false;
        }
        return now()->between($this->bonus_starts_at, $this->bonus_ends_at);
    }

    public function isFounderPricing(): bool
    {
        return $this->is_founder_pricing && $this->founder_lock_expires_at?->isFuture();
    }

    public function monthsRemaining(): int
    {
        if (!$this->commitment_ends_at) return 0;
        return max(0, now()->diffInMonths($this->commitment_ends_at, false));
    }
}
```

---

### Task 2.3 — CommunitySubscriptionService

**File:** `backend/app/Services/CommunitySubscriptionService.php`

Key methods:

- `subscribe(Customer $customer, string $communityId, string $productSlug, string $paymentMethodId, ?string $categoryGroup, ?string $categorySubtype): CommunitySubscription`
  - Check slot availability via SlotEnforcementService (Phase 3)
  - Determine if founder pricing applies (community launch_date + 90 days)
  - Create Stripe customer if needed
  - Create Stripe subscription at correct rate
  - Set commitment_starts_at = now, commitment_ends_at = now + 12 months
  - Set bonus_starts_at = commitment_ends_at, bonus_ends_at = commitment_ends_at + 3 months
  - Set next_renewal_at = bonus_ends_at (month 15)
  - If founder pricing: set is_founder_pricing = true, founder_lock_expires_at = now + 3 years
  - Reserve slot via SlotEnforcementService

- `cancel(CommunitySubscription $sub, string $reason): void`
  - Calculate early_termination_balance if within commitment period
  - Cancel Stripe subscription
  - Release slot via SlotEnforcementService
  - Set status = cancelled, cancelled_at = now

- `checkFounderEligibility(string $communityId): array`
  - Query community launch_date
  - Return ['eligible' => bool, 'days_remaining' => int, 'window_closes_at' => datetime]

Follow `CssnSubscriptionController` pattern for Stripe interaction — create customer → create subscription → write local record.

---

### Task 2.4 — CommunitySubscriptionController

**File:** `backend/app/Http/Controllers/Api/CommunitySubscriptionController.php`

Endpoints:
- `POST /v1/community-subscriptions` — create subscription (validate product_slug, community_id, payment_method_id, category)
- `GET /v1/community-subscriptions` — list active subscriptions for authenticated customer
- `GET /v1/community-subscriptions/{id}` — show detail
- `DELETE /v1/community-subscriptions/{id}` — cancel
- `GET /v1/community-subscriptions/founder-check/{communityId}` — check founder pricing eligibility
- `GET /v1/community-subscriptions/slot-availability/{communityId}` — check available slots by category

**Routes** (add to `backend/routes/api.php` inside `auth:sanctum`):

```php
Route::prefix('community-subscriptions')->group(function () {
    Route::get('/', [CommunitySubscriptionController::class, 'index']);
    Route::post('/', [CommunitySubscriptionController::class, 'store']);
    Route::get('/founder-check/{communityId}', [CommunitySubscriptionController::class, 'founderCheck']);
    Route::get('/slot-availability/{communityId}', [CommunitySubscriptionController::class, 'slotAvailability']);
    Route::get('/{id}', [CommunitySubscriptionController::class, 'show']);
    Route::delete('/{id}', [CommunitySubscriptionController::class, 'destroy']);
});
```

---

## PHASE 3 — SLOT LIMITS + WAITLIST

### Task 3.1 — Migration: community_slot_limits + influencer_waitlist

**File:** `backend/database/migrations/2026_03_27_000003_create_slot_system_tables.php`

```php
Schema::create('community_slot_limits', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('community_id');
    $table->string('category_group'); // restaurants, real_estate, attorneys, auto_services, home_services, medical, financial, retail, personal_services
    $table->string('category_subtype')->nullable(); // cuisine type, legal specialty, etc.
    $table->integer('max_influencer_slots');
    $table->integer('max_expert_slots')->default(1);
    $table->integer('current_influencer_count')->default(0);
    $table->integer('current_expert_count')->default(0);
    $table->timestamps();
    
    $table->unique(['community_id', 'category_group', 'category_subtype'], 'slot_limit_unique');
    $table->foreign('community_id')->references('id')->on('communities');
});

Schema::create('influencer_waitlist', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('community_id');
    $table->uuid('customer_id');
    $table->string('category_group');
    $table->string('category_subtype')->nullable();
    $table->string('product_slug'); // community-influencer or community-expert
    $table->integer('position');
    $table->timestamp('requested_at');
    $table->timestamp('notified_at')->nullable();
    $table->timestamp('expires_at')->nullable(); // notification expires after 72 hours
    $table->string('status')->default('waiting'); // waiting, notified, claimed, expired, cancelled
    $table->timestamps();
    
    $table->foreign('community_id')->references('id')->on('communities');
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->index(['community_id', 'category_group', 'status']);
});
```

---

### Task 3.2 — SlotEnforcementService

**File:** `backend/app/Services/SlotEnforcementService.php`

Key methods:

- `checkAvailability(string $communityId, string $categoryGroup, ?string $categorySubtype, string $productSlug): array`
  - Returns `['available' => bool, 'slots_remaining' => int, 'total_slots' => int, 'total_community_count' => int, 'community_ceiling' => 37]`
  - Check both per-category limit AND 37-slot community ceiling

- `reserveSlot(string $communityId, string $categoryGroup, ?string $categorySubtype, string $productSlug): void`
  - Increment current count. Throw if at limit.
  - Use DB transaction with locking to prevent race conditions.

- `releaseSlot(string $communityId, string $categoryGroup, ?string $categorySubtype, string $productSlug): void`
  - Decrement current count.
  - Check waitlist for this category — notify first in queue.

- `getAvailabilityOverview(string $communityId): array`
  - Returns all categories with slots filled/remaining for Sarah's sales view.

---

### Task 3.3 — Seed Default Slot Limits

**File:** `backend/database/seeders/SlotLimitSeeder.php`

Seed per the Master Catalog Part 7:

```
restaurants (per cuisine):     4 influencer, 1 expert
real_estate:                   4 influencer, 1 expert
attorneys (per specialty):     2 influencer, 1 expert
auto_services:                 3 influencer, 1 expert
home_services (per sub):       2 influencer, 1 expert
medical (per specialty):       3 influencer, 1 expert
financial (per type):          2 influencer, 1 expert
retail (per type):             5 influencer, 1 expert
personal_services:             4 influencer, 1 expert
```

These are templates — when a community is created, copy these defaults into `community_slot_limits` for that community.

---

### Task 3.4 — Add launch_date to communities table

**File:** `backend/database/migrations/2026_03_27_000004_add_launch_date_to_communities.php`

```php
Schema::table('communities', function (Blueprint $table) {
    $table->timestamp('launched_at')->nullable()->after('name');
    $table->integer('founder_window_days')->default(90)->after('launched_at');
});
```

---

## PHASE 4 — PUBLISHING PLATFORM API (for Multisite to call)

### Task 4.1 — PublishingBridgeController

**File:** `backend/app/Http/Controllers/Api/PublishingBridgeController.php`

These endpoints are called by the Multisite publishing platform to determine what a business has paid for. Authenticated via a shared API key in the `Authorization` header.

Endpoints:

- `GET /v1/bridge/subscription-status/{businessExternalId}/{communityId}` — returns subscription details (tier, is_active, is_founder, badge_type, content_quotas, section_sponsorship)
- `GET /v1/bridge/community-sponsors/{communityId}` — returns all active section sponsorships for a community (section → business mapping with logos/taglines)
- `GET /v1/bridge/story-mention-quota/{businessExternalId}/{communityId}` — returns monthly quota and current usage
- `GET /v1/bridge/active-influencers/{communityId}` — returns all active Influencer businesses for carousel/badge rendering
- `GET /v1/bridge/slot-availability/{communityId}` — returns slot availability overview (for Sarah's outreach)

**Routes** (add outside the `auth:sanctum` group, with bridge auth middleware):

```php
Route::prefix('bridge')->middleware('bridge.auth')->group(function () {
    Route::get('/subscription-status/{externalId}/{communityId}', [PublishingBridgeController::class, 'subscriptionStatus']);
    Route::get('/community-sponsors/{communityId}', [PublishingBridgeController::class, 'communitySponsors']);
    Route::get('/story-mention-quota/{externalId}/{communityId}', [PublishingBridgeController::class, 'storyMentionQuota']);
    Route::get('/active-influencers/{communityId}', [PublishingBridgeController::class, 'activeInfluencers']);
    Route::get('/slot-availability/{communityId}', [PublishingBridgeController::class, 'slotAvailability']);
});
```

### Task 4.2 — Bridge Auth Middleware

**File:** `backend/app/Http/Middleware/BridgeAuthMiddleware.php`

Simple shared-secret middleware. Checks `Authorization: Bearer {BRIDGE_API_KEY}` against `config('services.publishing_bridge.api_key')`.

Register as `bridge.auth` in the HTTP kernel or bootstrap.

---

## PHASE 5 — FRONTEND: SUBSCRIPTION PURCHASE FLOW

### Task 5.1 — Community Influencer Signup Page

**File:** `src/pages/Marketing/CommunityInfluencerSignupPage.tsx`

Replace the current mock-data `CommunityInfluencerPage.tsx` with a real signup flow:

1. Community selector (dropdown of available communities)
2. Category selector (shows available slots via `/v1/community-subscriptions/slot-availability/{communityId}`)
3. Founder pricing banner (shows days remaining if eligible via `/v1/community-subscriptions/founder-check/{communityId}`)
4. Pricing card ($300/month, 12-month commitment, 3 months free bonus)
5. Stripe Elements payment form
6. Submit → calls `POST /v1/community-subscriptions`
7. Confirmation with subscription details

### Task 5.2 — Subscriptions Management Page

**File:** `src/pages/Business/SubscriptionsPage.tsx`

Replace the Coming Soon stub with a real page:

1. List all active community subscriptions via `GET /v1/community-subscriptions`
2. Show tier, community, monthly rate, commitment progress, founder pricing lock status
3. Cancel button with confirmation dialog showing early termination balance
4. Upgrade prompt (Influencer → Expert, Influencer → Sponsor)

### Task 5.3 — Product Catalog Browse Page

**File:** `src/pages/Marketing/ProductCatalogPage.tsx`

New page showing all 31 products from `GET /v1/products`:

1. Grouped by category (Visibility, Display Advertising, Content, Polls, Transactions, etc.)
2. Each card shows: name, price range, sold_by, prerequisites (greyed out if not met)
3. "Purchase" button enabled only when `can_purchase` is true
4. Prerequisites show as linked items ("Requires: Premium Listing")

---

## VERIFICATION CHECKLIST

After all phases, verify:

1. `php artisan db:seed --class=ProductCatalogSeeder` runs without error
2. `GET /v1/products` returns all 31 products + 4 bundles
3. `GET /v1/products/email-ads/can-purchase` returns `allowed: false, missing: ['display-ads']` for a tenant with no subscriptions
4. `POST /v1/community-subscriptions` creates a Stripe subscription and local record
5. `GET /v1/community-subscriptions/founder-check/{communityId}` returns correct eligibility
6. `GET /v1/community-subscriptions/slot-availability/{communityId}` returns correct counts
7. `GET /v1/bridge/subscription-status/{externalId}/{communityId}` returns correct data
8. `GET /v1/bridge/active-influencers/{communityId}` returns active businesses
9. Cancelling a subscription releases the slot and notifies waitlist
10. Stripe webhook `customer.subscription.deleted` marks community subscription as cancelled
