# FIBONACCO OPERATIONS PLATFORM
## Cursor Instructions - Laravel + Inertia + React

**Stack:** Laravel + Inertia.js + React + TypeScript + Tailwind CSS  
**Matches:** Existing content platform architecture  
**Date:** December 4, 2025

---

# OVERVIEW

Build Operations platform using the **exact same stack** as the content platforms:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   HIS CONTENT PLATFORMS              YOUR OPERATIONS PLATFORM                   │
│   ─────────────────────              ────────────────────────                   │
│                                                                                  │
│   Laravel + Inertia + React    ===   Laravel + Inertia + React                 │
│   Horizon (queues)             ===   Horizon (queues)                          │
│   Scheduler (cron)             ===   Scheduler (cron)                          │
│   Inertia SSR                  ===   Inertia SSR                               │
│   PostgreSQL                   ===   PostgreSQL                                │
│   Valkey (Redis)               ===   Valkey (Redis)                            │
│                                                                                  │
│   GoEventCity                        SMB Portal (fibonacco.com)                │
│   Day.News                           Admin Portal (admin.fibonacco.com)         │
│   DowntownGuide                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE 1: CREATE LARAVEL PROJECT WITH REACT STARTER

## Step 1.1: Create Project

```bash
# Create Laravel project with React + Inertia starter kit
composer create-project laravel/laravel fibonacco-operations

cd fibonacco-operations

# Install the official React starter kit
composer require laravel/breeze --dev

# Install Breeze with React + TypeScript + SSR
php artisan breeze:install react --typescript --ssr

# Install dependencies
npm install

# Build assets
npm run build
```

## Step 1.2: Install Additional Packages

```bash
# Laravel Horizon (queue management - matches his setup)
composer require laravel/horizon
php artisan horizon:install

# Laravel Sanctum (API tokens - already included with Breeze)
# composer require laravel/sanctum

# Stripe
composer require stripe/stripe-php

# AWS SDK (for SES email)
composer require aws/aws-sdk-php

# Twilio
composer require twilio/sdk

# Additional utilities
composer require spatie/laravel-data
composer require spatie/laravel-typescript-transformer
```

## Step 1.3: Install Frontend Dependencies

```bash
# Headless UI for React (accessible components)
npm install @headlessui/react

# Heroicons
npm install @heroicons/react

# React Hook Form (form handling)
npm install react-hook-form @hookform/resolvers zod

# Date handling
npm install date-fns

# Charts (for dashboards)
npm install recharts

# Tanstack Table (data tables)
npm install @tanstack/react-table

# clsx + tailwind-merge (className utilities)
npm install clsx tailwind-merge
```

---

# PHASE 2: PROJECT STRUCTURE

## Step 2.1: Laravel Backend Structure

```
fibonacco-operations/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/                    # Admin portal controllers
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── BusinessController.php
│   │   │   │   ├── CampaignController.php
│   │   │   │   ├── CommunityController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── ReportController.php
│   │   │   ├── SMB/                      # SMB portal controllers
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── BusinessController.php
│   │   │   │   ├── ArticleController.php
│   │   │   │   ├── EventController.php
│   │   │   │   ├── CouponController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CheckoutController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   ├── AiConfigController.php
│   │   │   │   └── AnalyticsController.php
│   │   │   ├── Public/                   # Public pages (no auth)
│   │   │   │   ├── HomeController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── PresentationController.php
│   │   │   │   └── ClaimController.php
│   │   │   ├── Api/                      # API endpoints (for webhooks, etc)
│   │   │   │   ├── WebhookController.php
│   │   │   │   ├── TrackingController.php
│   │   │   │   └── ChatController.php
│   │   │   └── Auth/                     # Auth controllers (from Breeze)
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   └── SMBMiddleware.php
│   │   └── Requests/                     # Form requests
│   ├── Models/
│   │   ├── User.php
│   │   ├── Community.php
│   │   ├── Industry.php
│   │   ├── Business.php
│   │   ├── Person.php
│   │   ├── Product.php
│   │   ├── Inventory.php
│   │   ├── Subscription.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── CampaignSequence.php
│   │   ├── CampaignStep.php
│   │   ├── EmailTemplate.php
│   │   ├── SendLog.php
│   │   ├── Activity.php
│   │   ├── Conversation.php
│   │   ├── BusinessAiConfig.php
│   │   ├── BusinessFaq.php
│   │   ├── BusinessService.php
│   │   ├── Article.php
│   │   ├── Event.php
│   │   ├── Coupon.php
│   │   ├── Announcement.php
│   │   ├── Task.php
│   │   ├── Note.php
│   │   ├── Tag.php
│   │   └── Presentation.php
│   ├── Jobs/
│   │   ├── SendCampaignEmail.php
│   │   ├── SendSMS.php
│   │   ├── GenerateVoiceAudio.php
│   │   ├── ProcessStripeWebhook.php
│   │   ├── CalculateLeadScore.php
│   │   └── SyncToContentPlatform.php
│   ├── Services/
│   │   ├── Email/
│   │   │   └── SESService.php
│   │   ├── SMS/
│   │   │   └── TwilioService.php
│   │   ├── Voice/
│   │   │   └── ElevenLabsService.php
│   │   ├── Payment/
│   │   │   └── StripeService.php
│   │   ├── Campaign/
│   │   │   └── CampaignProcessor.php
│   │   └── AI/
│   │       └── ChatService.php
│   └── Console/
│       └── Commands/
│           ├── ProcessEmailQueue.php
│           ├── ProcessSMSQueue.php
│           ├── RecalculateLeadScores.php
│           └── CleanupOldActivities.php
├── resources/
│   └── js/                               # React frontend (see below)
├── routes/
│   ├── web.php                           # Inertia routes
│   ├── api.php                           # API routes (webhooks, tracking)
│   └── console.php                       # Scheduled commands
├── database/
│   ├── migrations/
│   └── seeders/
└── config/
```

## Step 2.2: React Frontend Structure

```
resources/js/
├── app.tsx                               # Main app entry
├── ssr.tsx                               # SSR entry
├── types/
│   ├── index.d.ts                        # Global types
│   ├── models.ts                         # Database model types
│   └── inertia.d.ts                      # Inertia page props
├── Layouts/
│   ├── GuestLayout.tsx                   # Public pages layout
│   ├── AuthenticatedLayout.tsx           # Logged-in layout (base)
│   ├── SMBLayout.tsx                     # SMB portal layout
│   └── AdminLayout.tsx                   # Admin portal layout
├── Components/
│   ├── ui/                               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── forms/                            # Form components
│   │   ├── ArticleForm.tsx
│   │   ├── EventForm.tsx
│   │   ├── CouponForm.tsx
│   │   ├── BusinessForm.tsx
│   │   └── AiConfigForm.tsx
│   ├── dashboard/                        # Dashboard widgets
│   │   ├── StatsCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── QuickActions.tsx
│   │   └── Charts.tsx
│   ├── business/                         # Business-related components
│   │   ├── BusinessCard.tsx
│   │   ├── BusinessList.tsx
│   │   ├── BusinessTimeline.tsx
│   │   └── LeadScoreBadge.tsx
│   ├── products/                         # Product components
│   │   ├── ProductCard.tsx
│   │   ├── PricingTable.tsx
│   │   ├── InventoryBadge.tsx
│   │   └── CheckoutForm.tsx
│   └── ai/                               # AI-related components
│       ├── ChatWidget.tsx
│       ├── FaqEditor.tsx
│       ├── VoiceSelector.tsx
│       └── ConversationViewer.tsx
├── Pages/
│   ├── Public/                           # Public pages (no auth)
│   │   ├── Home.tsx
│   │   ├── Products/
│   │   │   ├── Index.tsx
│   │   │   └── Show.tsx
│   │   ├── Pricing.tsx
│   │   ├── Learn/
│   │   │   └── [presentation].tsx
│   │   └── Claim/
│   │       └── [community]/[business].tsx
│   ├── Auth/                             # Auth pages (from Breeze)
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   ├── SMB/                              # SMB portal pages
│   │   ├── Dashboard.tsx
│   │   ├── Business/
│   │   │   ├── Edit.tsx
│   │   │   ├── Hours.tsx
│   │   │   └── Photos.tsx
│   │   ├── Articles/
│   │   │   ├── Index.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   ├── Events/
│   │   │   ├── Index.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   ├── Coupons/
│   │   │   ├── Index.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   ├── Products/
│   │   │   ├── Index.tsx
│   │   │   └── Show.tsx
│   │   ├── Checkout/
│   │   │   ├── Cart.tsx
│   │   │   └── Success.tsx
│   │   ├── Subscriptions/
│   │   │   └── Index.tsx
│   │   ├── AI/
│   │   │   ├── Setup.tsx
│   │   │   ├── Faqs.tsx
│   │   │   ├── Voice.tsx
│   │   │   └── Conversations.tsx
│   │   ├── Analytics/
│   │   │   └── Index.tsx
│   │   └── Billing/
│   │       └── Index.tsx
│   └── Admin/                            # Admin portal pages
│       ├── Dashboard.tsx
│       ├── Businesses/
│       │   ├── Index.tsx
│       │   ├── Show.tsx
│       │   └── Edit.tsx
│       ├── Communities/
│       │   ├── Index.tsx
│       │   ├── Show.tsx
│       │   └── Deploy.tsx
│       ├── Campaigns/
│       │   ├── Index.tsx
│       │   ├── Sequences/
│       │   │   ├── Index.tsx
│       │   │   ├── Create.tsx
│       │   │   └── Edit.tsx
│       │   └── Templates/
│       │       ├── Index.tsx
│       │       └── Edit.tsx
│       ├── Products/
│       │   ├── Index.tsx
│       │   └── Inventory.tsx
│       ├── Orders/
│       │   ├── Index.tsx
│       │   └── Show.tsx
│       ├── Subscriptions/
│       │   └── Index.tsx
│       ├── Support/
│       │   ├── Conversations.tsx
│       │   └── Unanswered.tsx
│       └── Reports/
│           ├── Revenue.tsx
│           ├── Conversions.tsx
│           └── Communities.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
└── lib/
    ├── utils.ts                          # cn() and other utilities
    └── constants.ts
```

---

# PHASE 3: CONFIGURATION FILES

## Step 3.1: TypeScript Types

Create `resources/js/types/models.ts`:

```typescript
// Database model types

export interface User {
  id: number;
  email: string;
  name: string | null;
  type: 'admin' | 'smb';
  business_id: number | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  business?: Business;
}

export interface Community {
  id: number;
  name: string;
  slug: string;
  state: string;
  county: string | null;
  zip_codes: string[] | null;
  population: number | null;
  business_count: number;
  status: 'pending' | 'deploying' | 'active' | 'paused';
  deployed_at: string | null;
  weather_sponsor_id: number | null;
  sports_sponsor_id: number | null;
  events_sponsor_id: number | null;
  newsletter_sponsor_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  expert_slots: number;
  influencer_slots: number;
  display_order: number;
}

export interface Business {
  id: number;
  community_id: number;
  industry_id: number | null;
  name: string;
  slug: string;
  legal_name: string | null;
  description: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_lat: number | null;
  address_lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours_of_operation: Record<string, any> | null;
  google_business_id: string | null;
  facebook_url: string | null;
  instagram_handle: string | null;
  yelp_url: string | null;
  lead_status: 'prospect' | 'lead' | 'qualified' | 'trial' | 'customer' | 'churned' | 'unsubscribed';
  lead_score: number;
  health_score: number | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  community?: Community;
  industry?: Industry;
  people?: Person[];
  subscriptions?: Subscription[];
}

export interface Person {
  id: number;
  business_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  role: 'owner' | 'manager' | 'marketing' | 'operations' | 'tech' | 'staff' | 'other';
  is_primary_contact: boolean;
  is_decision_maker: boolean;
  preferred_channel: 'email' | 'sms' | 'phone';
  do_not_email: boolean;
  do_not_sms: boolean;
  do_not_call: boolean;
  total_emails_sent: number;
  total_emails_opened: number;
  total_clicks: number;
  last_engaged_at: string | null;
  sequence_step: number;
  next_send_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  type: 'package' | 'addon' | 'sponsor';
  price_monthly: number | null;
  price_annual: number | null;
  features: string[];
  icon: string | null;
  inventory_type: 'per_industry' | 'per_community' | 'unlimited' | null;
  is_active: boolean;
  display_order: number;
}

export interface Inventory {
  id: number;
  community_id: number;
  industry_id: number | null;
  product_id: string;
  total_slots: number;
  used_slots: number;
  available_slots: number; // computed
}

export interface Subscription {
  id: number;
  business_id: number;
  community_id: number;
  product_id: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  billing_cycle: 'monthly' | 'annual';
  price: number;
  sponsor_type: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  community?: Community;
}

export interface Order {
  id: number;
  business_id: number;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paid_at: string | null;
  source: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  community_id: number | null;
  quantity: number;
  unit_price: number;
  total: number;
  sponsor_type: string | null;
  product?: Product;
  community?: Community;
}

export interface Article {
  id: number;
  business_id: number;
  community_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  status: 'draft' | 'pending' | 'published' | 'archived';
  published_at: string | null;
  is_ai_generated: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  business_id: number;
  community_id: number;
  title: string;
  slug: string;
  description: string | null;
  featured_image: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  venue_name: string | null;
  venue_address: string | null;
  is_virtual: boolean;
  virtual_url: string | null;
  status: 'draft' | 'pending' | 'published' | 'archived';
  is_featured: boolean;
  is_boosted: boolean;
  view_count: number;
  rsvp_count: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  business_id: number;
  community_id: number;
  title: string;
  description: string | null;
  code: string | null;
  discount_type: 'percent' | 'fixed' | 'bogo' | 'free' | null;
  discount_value: number | null;
  start_date: string | null;
  end_date: string | null;
  max_uses: number | null;
  current_uses: number;
  status: 'active' | 'expired' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  business_id: number;
  person_id: number | null;
  type: string;
  subject: string | null;
  detail: string | null;
  metadata: Record<string, any> | null;
  campaign_id: string | null;
  source: string | null;
  occurred_at: string;
  person?: Person;
}

export interface Conversation {
  id: number;
  business_id: number;
  person_id: number | null;
  channel: 'chat' | 'voice' | 'sms';
  source: string | null;
  landing_page: string | null;
  campaign_id: string | null;
  messages: ConversationMessage[];
  summary: string | null;
  intent_detected: string | null;
  products_discussed: string[] | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface BusinessAiConfig {
  business_id: number;
  ai_name: string;
  tone: string;
  greeting_script: string | null;
  elevenlabs_voice_id: string | null;
  can_book_appointments: boolean;
  can_give_quotes: boolean;
  can_transfer_calls: boolean;
  escalation_phone: string | null;
  escalation_email: string | null;
  is_configured: boolean;
  is_active: boolean;
}

export interface BusinessFaq {
  id: number;
  business_id: number;
  question: string;
  answer: string;
  short_answer: string | null;
  category: string | null;
  keywords: string[] | null;
  audio_url: string | null;
  source: 'owner' | 'ai_learned' | 'scraped' | 'inferred';
  verified: boolean;
  times_used: number;
  is_active: boolean;
}

export interface BusinessService {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  price_type: 'fixed' | 'starting_at' | 'hourly' | 'custom' | 'free' | 'call_for_quote' | null;
  price: number | null;
  price_unit: string | null;
  duration: string | null;
  display_order: number;
  is_active: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Dashboard Stats
export interface DashboardStats {
  mrr: number;
  mrr_change: number;
  active_subscriptions: number;
  subscriptions_change: number;
  leads_this_month: number;
  leads_change: number;
  conversion_rate: number;
  conversion_change: number;
}

export interface SMBDashboardStats {
  profile_views: number;
  profile_views_change: number;
  leads_captured: number;
  leads_change: number;
  events_this_month: number;
  articles_published: number;
}
```

## Step 3.2: Inertia Page Props Types

Create `resources/js/types/index.d.ts`:

```typescript
import { User, Business, Community } from './models';

export interface PageProps {
  auth: {
    user: User | null;
  };
  flash: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  errors: Record<string, string>;
}

// SMB pages have access to the user's business
export interface SMBPageProps extends PageProps {
  auth: {
    user: User;
  };
  business: Business;
}

// Admin pages
export interface AdminPageProps extends PageProps {
  auth: {
    user: User;
  };
}

// Extend Inertia's page props
declare module '@inertiajs/react' {
  interface PageProps extends PageProps {}
}
```

## Step 3.3: Utility Functions

Create `resources/js/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

---

# PHASE 4: ROUTES

## Step 4.1: Web Routes (Inertia)

Update `routes/web.php`:

```php
<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ProductController as PublicProductController;
use App\Http\Controllers\Public\PresentationController;
use App\Http\Controllers\Public\ClaimController;
use App\Http\Controllers\SMB\DashboardController as SMBDashboardController;
use App\Http\Controllers\SMB\BusinessController as SMBBusinessController;
use App\Http\Controllers\SMB\ArticleController;
use App\Http\Controllers\SMB\EventController;
use App\Http\Controllers\SMB\CouponController;
use App\Http\Controllers\SMB\ProductController as SMBProductController;
use App\Http\Controllers\SMB\CheckoutController;
use App\Http\Controllers\SMB\SubscriptionController;
use App\Http\Controllers\SMB\AiConfigController;
use App\Http\Controllers\SMB\AnalyticsController;
use App\Http\Controllers\SMB\BillingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\BusinessController as AdminBusinessController;
use App\Http\Controllers\Admin\CommunityController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\SequenceController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\SupportController;
use App\Http\Controllers\Admin\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Auth Required)
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/pricing', [PublicProductController::class, 'pricing'])->name('pricing');
Route::get('/products', [PublicProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [PublicProductController::class, 'show'])->name('products.show');
Route::get('/learn/{presentation}', [PresentationController::class, 'show'])->name('learn.show');
Route::get('/claim/{community}/{business}', [ClaimController::class, 'show'])->name('claim.show');
Route::post('/claim/{community}/{business}', [ClaimController::class, 'claim'])->name('claim.submit');

/*
|--------------------------------------------------------------------------
| SMB Portal Routes (Authenticated Business Owners)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'smb'])->prefix('portal')->name('smb.')->group(function () {
    // Dashboard
    Route::get('/', [SMBDashboardController::class, 'index'])->name('dashboard');
    
    // Business Profile
    Route::get('/business', [SMBBusinessController::class, 'edit'])->name('business.edit');
    Route::put('/business', [SMBBusinessController::class, 'update'])->name('business.update');
    Route::get('/business/hours', [SMBBusinessController::class, 'hours'])->name('business.hours');
    Route::put('/business/hours', [SMBBusinessController::class, 'updateHours'])->name('business.hours.update');
    Route::get('/business/photos', [SMBBusinessController::class, 'photos'])->name('business.photos');
    Route::post('/business/photos', [SMBBusinessController::class, 'uploadPhoto'])->name('business.photos.upload');
    Route::delete('/business/photos/{photo}', [SMBBusinessController::class, 'deletePhoto'])->name('business.photos.delete');
    
    // Content Publishing
    Route::resource('articles', ArticleController::class);
    Route::post('/articles/{article}/publish', [ArticleController::class, 'publish'])->name('articles.publish');
    
    Route::resource('events', EventController::class);
    Route::post('/events/{event}/publish', [EventController::class, 'publish'])->name('events.publish');
    Route::post('/events/{event}/boost', [EventController::class, 'boost'])->name('events.boost');
    
    Route::resource('coupons', CouponController::class);
    
    // Products & Shopping
    Route::get('/products', [SMBProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [SMBProductController::class, 'show'])->name('products.show');
    Route::post('/cart/add', [CheckoutController::class, 'addToCart'])->name('cart.add');
    Route::get('/cart', [CheckoutController::class, 'cart'])->name('cart');
    Route::delete('/cart/{item}', [CheckoutController::class, 'removeFromCart'])->name('cart.remove');
    Route::get('/checkout', [CheckoutController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    
    // Subscriptions
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    
    // AI Configuration
    Route::get('/ai', [AiConfigController::class, 'index'])->name('ai.index');
    Route::get('/ai/setup', [AiConfigController::class, 'setup'])->name('ai.setup');
    Route::put('/ai/config', [AiConfigController::class, 'updateConfig'])->name('ai.config.update');
    Route::get('/ai/faqs', [AiConfigController::class, 'faqs'])->name('ai.faqs');
    Route::post('/ai/faqs', [AiConfigController::class, 'storeFaq'])->name('ai.faqs.store');
    Route::put('/ai/faqs/{faq}', [AiConfigController::class, 'updateFaq'])->name('ai.faqs.update');
    Route::delete('/ai/faqs/{faq}', [AiConfigController::class, 'destroyFaq'])->name('ai.faqs.destroy');
    Route::get('/ai/voice', [AiConfigController::class, 'voice'])->name('ai.voice');
    Route::get('/ai/conversations', [AiConfigController::class, 'conversations'])->name('ai.conversations');
    Route::get('/ai/conversations/{conversation}', [AiConfigController::class, 'showConversation'])->name('ai.conversations.show');
    
    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    
    // Billing
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/invoices', [BillingController::class, 'invoices'])->name('billing.invoices');
    Route::post('/billing/payment-method', [BillingController::class, 'updatePaymentMethod'])->name('billing.payment-method.update');
});

/*
|--------------------------------------------------------------------------
| Admin Portal Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // CRM - Businesses
    Route::get('/businesses', [AdminBusinessController::class, 'index'])->name('businesses.index');
    Route::get('/businesses/{business}', [AdminBusinessController::class, 'show'])->name('businesses.show');
    Route::get('/businesses/{business}/edit', [AdminBusinessController::class, 'edit'])->name('businesses.edit');
    Route::put('/businesses/{business}', [AdminBusinessController::class, 'update'])->name('businesses.update');
    Route::post('/businesses/{business}/note', [AdminBusinessController::class, 'addNote'])->name('businesses.note');
    Route::post('/businesses/{business}/task', [AdminBusinessController::class, 'addTask'])->name('businesses.task');
    
    // Communities
    Route::get('/communities', [CommunityController::class, 'index'])->name('communities.index');
    Route::get('/communities/{community}', [CommunityController::class, 'show'])->name('communities.show');
    Route::get('/communities/{community}/deploy', [CommunityController::class, 'deploy'])->name('communities.deploy');
    Route::post('/communities/{community}/deploy', [CommunityController::class, 'startDeploy'])->name('communities.deploy.start');
    Route::get('/communities/{community}/inventory', [CommunityController::class, 'inventory'])->name('communities.inventory');
    
    // Campaigns
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/stats', [CampaignController::class, 'stats'])->name('campaigns.stats');
    Route::resource('/campaigns/sequences', SequenceController::class)->names('campaigns.sequences');
    Route::resource('/campaigns/templates', TemplateController::class)->names('campaigns.templates');
    
    // Products & Inventory
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::put('/inventory/{inventory}', [InventoryController::class, 'update'])->name('inventory.update');
    
    // Orders & Subscriptions
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
    
    // Support
    Route::get('/support/conversations', [SupportController::class, 'conversations'])->name('support.conversations');
    Route::get('/support/unanswered', [SupportController::class, 'unanswered'])->name('support.unanswered');
    
    // Reports
    Route::get('/reports/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
    Route::get('/reports/conversions', [ReportController::class, 'conversions'])->name('reports.conversions');
    Route::get('/reports/communities', [ReportController::class, 'communities'])->name('reports.communities');
});

/*
|--------------------------------------------------------------------------
| Auth Routes (from Breeze)
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
```

## Step 4.2: API Routes

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhooks (External Services)
|--------------------------------------------------------------------------
*/

Route::prefix('webhooks')->group(function () {
    Route::post('/stripe', [WebhookController::class, 'stripe']);
    Route::post('/ses', [WebhookController::class, 'ses']);
    Route::post('/twilio', [WebhookController::class, 'twilio']);
    Route::post('/twilio/voice', [WebhookController::class, 'twilioVoice']);
});

/*
|--------------------------------------------------------------------------
| Tracking (Email Opens, Clicks)
|--------------------------------------------------------------------------
*/

Route::prefix('track')->group(function () {
    Route::get('/open/{person}/{step}', [TrackingController::class, 'open']);
    Route::get('/click/{person}/{step}', [TrackingController::class, 'click']);
});

/*
|--------------------------------------------------------------------------
| AI Chat
|--------------------------------------------------------------------------
*/

Route::prefix('chat')->group(function () {
    Route::post('/start', [ChatController::class, 'start']);
    Route::post('/{conversation}/message', [ChatController::class, 'message']);
});

/*
|--------------------------------------------------------------------------
| Public API (Product availability, etc.)
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {
    Route::get('/availability/{community}/{industry}', function ($community, $industry) {
        // Return inventory availability
    });
});
```

---

# PHASE 5: SAMPLE CONTROLLERS

## Step 5.1: SMB Dashboard Controller

Create `app/Http/Controllers/SMB/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers\SMB;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Article;
use App\Models\Event;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $business = $request->user()->business;
        
        // Get stats
        $stats = [
            'profile_views' => $this->getProfileViews($business),
            'profile_views_change' => $this->getProfileViewsChange($business),
            'leads_captured' => $this->getLeadsCaptured($business),
            'leads_change' => $this->getLeadsChange($business),
            'events_this_month' => $business->events()->where('start_date', '>=', now()->startOfMonth())->count(),
            'articles_published' => $business->articles()->where('status', 'published')->count(),
        ];
        
        // Recent activity
        $activities = Activity::where('business_id', $business->id)
            ->with('person')
            ->orderBy('occurred_at', 'desc')
            ->limit(10)
            ->get();
        
        // Content counts
        $content = [
            'articles' => Article::where('business_id', $business->id)->count(),
            'articles_published' => Article::where('business_id', $business->id)->where('status', 'published')->count(),
            'events' => Event::where('business_id', $business->id)->count(),
            'events_upcoming' => Event::where('business_id', $business->id)->where('start_date', '>=', now())->count(),
            'coupons' => Coupon::where('business_id', $business->id)->where('status', 'active')->count(),
        ];
        
        // Subscriptions
        $subscriptions = $business->subscriptions()
            ->with('product', 'community')
            ->where('status', 'active')
            ->get();
        
        return Inertia::render('SMB/Dashboard', [
            'business' => $business->load('community', 'industry'),
            'stats' => $stats,
            'activities' => $activities,
            'content' => $content,
            'subscriptions' => $subscriptions,
        ]);
    }
    
    private function getProfileViews($business): int
    {
        return Activity::where('business_id', $business->id)
            ->where('type', 'profile_viewed')
            ->where('occurred_at', '>=', now()->subDays(30))
            ->count();
    }
    
    private function getProfileViewsChange($business): float
    {
        $current = $this->getProfileViews($business);
        $previous = Activity::where('business_id', $business->id)
            ->where('type', 'profile_viewed')
            ->whereBetween('occurred_at', [now()->subDays(60), now()->subDays(30)])
            ->count();
        
        if ($previous === 0) return 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
    
    private function getLeadsCaptured($business): int
    {
        return Activity::where('business_id', $business->id)
            ->where('type', 'lead_captured')
            ->where('occurred_at', '>=', now()->subDays(30))
            ->count();
    }
    
    private function getLeadsChange($business): float
    {
        $current = $this->getLeadsCaptured($business);
        $previous = Activity::where('business_id', $business->id)
            ->where('type', 'lead_captured')
            ->whereBetween('occurred_at', [now()->subDays(60), now()->subDays(30)])
            ->count();
        
        if ($previous === 0) return 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
```

## Step 5.2: Admin Dashboard Controller

Create `app/Http/Controllers/Admin/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\Order;
use App\Models\Activity;
use App\Models\Community;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Key metrics
        $stats = [
            'mrr' => $this->calculateMRR(),
            'mrr_change' => $this->calculateMRRChange(),
            'active_subscriptions' => Subscription::where('status', 'active')->count(),
            'subscriptions_change' => $this->calculateSubscriptionsChange(),
            'leads_this_month' => Business::where('lead_status', 'lead')
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
            'leads_change' => $this->calculateLeadsChange(),
            'conversion_rate' => $this->calculateConversionRate(),
            'conversion_change' => 0, // TODO
        ];
        
        // Recent activity across all businesses
        $activities = Activity::with('business', 'person')
            ->orderBy('occurred_at', 'desc')
            ->limit(20)
            ->get();
        
        // Recent orders
        $recentOrders = Order::with('business')
            ->where('status', 'paid')
            ->orderBy('paid_at', 'desc')
            ->limit(10)
            ->get();
        
        // Community stats
        $communityStats = [
            'total' => Community::count(),
            'active' => Community::where('status', 'active')->count(),
            'deploying' => Community::where('status', 'deploying')->count(),
        ];
        
        // Pipeline
        $pipeline = [
            'prospects' => Business::where('lead_status', 'prospect')->count(),
            'leads' => Business::where('lead_status', 'lead')->count(),
            'qualified' => Business::where('lead_status', 'qualified')->count(),
            'trials' => Business::where('lead_status', 'trial')->count(),
            'customers' => Business::where('lead_status', 'customer')->count(),
        ];
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'activities' => $activities,
            'recentOrders' => $recentOrders,
            'communityStats' => $communityStats,
            'pipeline' => $pipeline,
        ]);
    }
    
    private function calculateMRR(): float
    {
        return Subscription::where('status', 'active')
            ->where('billing_cycle', 'monthly')
            ->sum('price')
            + (Subscription::where('status', 'active')
                ->where('billing_cycle', 'annual')
                ->sum('price') / 12);
    }
    
    private function calculateMRRChange(): float
    {
        // TODO: Compare to last month
        return 0;
    }
    
    private function calculateSubscriptionsChange(): float
    {
        $current = Subscription::where('status', 'active')->count();
        $lastMonth = Subscription::where('status', 'active')
            ->where('started_at', '<', now()->startOfMonth())
            ->count();
        
        if ($lastMonth === 0) return 0;
        return round((($current - $lastMonth) / $lastMonth) * 100, 1);
    }
    
    private function calculateLeadsChange(): float
    {
        $current = Business::where('lead_status', 'lead')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        $lastMonth = Business::where('lead_status', 'lead')
            ->whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])
            ->count();
        
        if ($lastMonth === 0) return 0;
        return round((($current - $lastMonth) / $lastMonth) * 100, 1);
    }
    
    private function calculateConversionRate(): float
    {
        $leads = Business::where('created_at', '>=', now()->subDays(30))
            ->whereIn('lead_status', ['lead', 'qualified', 'trial', 'customer'])
            ->count();
        $customers = Business::where('created_at', '>=', now()->subDays(30))
            ->where('lead_status', 'customer')
            ->count();
        
        if ($leads === 0) return 0;
        return round(($customers / $leads) * 100, 1);
    }
}
```

---

# PHASE 6: SAMPLE REACT PAGES

## Step 6.1: SMB Dashboard Page

Create `resources/js/Pages/SMB/Dashboard.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import SMBLayout from '@/Layouts/SMBLayout';
import { SMBPageProps, SMBDashboardStats, Activity, Business, Subscription } from '@/types';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import {
  DocumentTextIcon,
  CalendarIcon,
  TicketIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface Props extends SMBPageProps {
  stats: SMBDashboardStats;
  activities: Activity[];
  content: {
    articles: number;
    articles_published: number;
    events: number;
    events_upcoming: number;
    coupons: number;
  };
  subscriptions: Subscription[];
}

export default function Dashboard({ business, stats, activities, content, subscriptions }: Props) {
  return (
    <SMBLayout>
      <Head title="Dashboard" />
      
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {business.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your business.
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Profile Views"
            value={stats.profile_views.toLocaleString()}
            change={stats.profile_views_change}
            icon={ChartBarIcon}
          />
          <StatCard
            title="Leads Captured"
            value={stats.leads_captured.toLocaleString()}
            change={stats.leads_change}
            icon={SparklesIcon}
          />
          <StatCard
            title="Upcoming Events"
            value={content.events_upcoming.toLocaleString()}
            icon={CalendarIcon}
          />
          <StatCard
            title="Published Articles"
            value={content.articles_published.toLocaleString()}
            icon={DocumentTextIcon}
          />
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <QuickAction
              href={route('smb.articles.create')}
              icon={DocumentTextIcon}
              label="Post Article"
            />
            <QuickAction
              href={route('smb.events.create')}
              icon={CalendarIcon}
              label="Create Event"
            />
            <QuickAction
              href={route('smb.coupons.create')}
              icon={TicketIcon}
              label="Add Coupon"
            />
            <QuickAction
              href={route('smb.products.index')}
              icon={ArrowTrendingUpIcon}
              label="Upgrade Plan"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Subscriptions</h2>
            {subscriptions.length === 0 ? (
              <p className="text-gray-500 text-sm">No active subscriptions</p>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{sub.product?.name}</p>
                      <p className="text-sm text-gray-500">{sub.community?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(sub.price)}/mo</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.slice(0, 5).map((activity, idx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {idx !== activities.length - 1 && idx !== 4 && (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <ActivityIcon type={activity.type} />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.subject || activity.type.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {formatRelativeTime(activity.occurred_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </SMBLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change?: number; 
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change !== undefined && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                )}
                <span className="ml-1">{Math.abs(change)}%</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Icon className="h-6 w-6 text-blue-600" />
      <span className="mt-2 text-sm font-medium text-gray-900">{label}</span>
    </a>
  );
}

function ActivityIcon({ type }: { type: string }) {
  // Return appropriate icon based on activity type
  return <span className="text-white text-xs">•</span>;
}
```

## Step 6.2: SMB Layout

Create `resources/js/Layouts/SMBLayout.tsx`:

```tsx
import { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SMBPageProps } from '@/types';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  CalendarIcon,
  TicketIcon,
  SparklesIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: 'smb.dashboard', icon: HomeIcon },
  { name: 'My Business', href: 'smb.business.edit', icon: BuildingStorefrontIcon },
  { name: 'Articles', href: 'smb.articles.index', icon: DocumentTextIcon },
  { name: 'Events', href: 'smb.events.index', icon: CalendarIcon },
  { name: 'Coupons', href: 'smb.coupons.index', icon: TicketIcon },
  { name: 'AI Assistant', href: 'smb.ai.index', icon: SparklesIcon },
  { name: 'Products', href: 'smb.products.index', icon: ShoppingCartIcon },
  { name: 'Analytics', href: 'smb.analytics.index', icon: ChartBarIcon },
  { name: 'Billing', href: 'smb.billing.index', icon: CreditCardIcon },
];

export default function SMBLayout({ children }: PropsWithChildren) {
  const { auth, business, flash } = usePage<SMBPageProps>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-blue-600">Fibonacco</span>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={route(item.href)}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
          <div className="flex flex-shrink-0 items-center px-4">
            <span className="text-xl font-bold text-blue-600">Fibonacco</span>
          </div>
          <div className="mt-5 flex flex-grow flex-col">
            <nav className="flex-1 space-y-1 px-2 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={route(item.href)}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User info */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {auth.user.name?.charAt(0) || auth.user.email.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{auth.user.name || auth.user.email}</p>
                <p className="text-xs text-gray-500">{business.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Link
                href={route('smb.cart')}
                className="text-gray-400 hover:text-gray-500"
              >
                <ShoppingCartIcon className="h-6 w-6" />
              </Link>
              <Link
                href={route('profile.edit')}
                className="text-gray-400 hover:text-gray-500"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Flash messages */}
        {flash.success && (
          <div className="mx-4 mt-4 rounded-md bg-green-50 p-4 sm:mx-6 lg:mx-8">
            <p className="text-sm font-medium text-green-800">{flash.success}</p>
          </div>
        )}
        {flash.error && (
          <div className="mx-4 mt-4 rounded-md bg-red-50 p-4 sm:mx-6 lg:mx-8">
            <p className="text-sm font-medium text-red-800">{flash.error}</p>
          </div>
        )}
        
        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

# PHASE 7: RAILWAY DEPLOYMENT

## Step 7.1: Railway Configuration

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Step 7.2: Dockerfile

Create `Dockerfile`:

```dockerfile
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    supervisor \
    nginx \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
RUN npm ci && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 8080

# Start supervisor (manages nginx + php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

## Step 7.3: Nginx Config

Create `docker/nginx.conf`:

```nginx
server {
    listen 8080;
    server_name _;
    root /var/www/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Step 7.4: Supervisor Config

Create `docker/supervisord.conf`:

```ini
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:php-fpm]
command=/usr/local/sbin/php-fpm -F
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

## Step 7.5: Deploy Commands

```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit - Fibonacco Operations"
git remote add origin https://github.com/YOUR_USERNAME/fibonacco-operations.git
git push -u origin main

# Login to Railway
railway login

# Create new project
railway init
# Select: "Empty Project"
# Name: fibonacco-operations

# Add PostgreSQL
railway add --plugin postgresql

# Add Valkey (Redis)
railway add --plugin valkey

# Link and deploy
railway link
railway up

# Set environment variables
railway variables set APP_KEY=$(php artisan key:generate --show)
railway variables set APP_ENV=production
railway variables set APP_DEBUG=false

# Run migrations
railway run php artisan migrate --force
railway run php artisan db:seed --force

# Check logs
railway logs
```

## Step 7.6: Create Scheduler Service

In Railway dashboard:
1. New Service → GitHub Repo → Same repo
2. Name: `ops-scheduler`
3. Override start command: `php artisan schedule:work`

## Step 7.7: Create Horizon Service

In Railway dashboard:
1. New Service → GitHub Repo → Same repo
2. Name: `ops-horizon`
3. Override start command: `php artisan horizon`

## Step 7.8: Create Inertia SSR Service

In Railway dashboard:
1. New Service → GitHub Repo → Same repo
2. Name: `ops-inertia-ssr`
3. Override start command: `node bootstrap/ssr/ssr.mjs`

---

# SUMMARY

This build matches his stack exactly:

| Component | Technology |
|-----------|------------|
| Backend | Laravel 11 |
| Frontend | React 19 + TypeScript |
| Bridge | Inertia.js |
| Styling | Tailwind CSS |
| SSR | Inertia SSR (Node) |
| Queue | Laravel Horizon |
| Scheduler | Laravel Schedule |
| Database | PostgreSQL |
| Cache | Valkey (Redis) |
| Hosting | Railway |

**Services in Railway:**
- `ops-web` (main app)
- `ops-scheduler` (cron)
- `ops-horizon` (queue worker)
- `ops-inertia-ssr` (SSR)
- `ops-postgres` (database)
- `ops-valkey` (cache/queue)

---

*Ready for Cursor to build.*
