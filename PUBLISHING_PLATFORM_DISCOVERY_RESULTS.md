# Publishing Platform Discovery Results
## Laravel Codebase Analysis

**Date:** December 28, 2025  
**Project:** Publishing Platform (Day-News Multisite)  
**Discovery Script:** `/Users/johnshine/Dropbox/All-Vimeo-Videos/files-21/discover-laravel.sh`

---

## EXECUTIVE SUMMARY

Discovery script executed successfully on the Publishing Platform. This document summarizes the findings to inform the Learning Center integration project.

---

## QUICK STATS

Based on discovery report (`discovery-report/00-overview.md`):

| Metric | Count |
|--------|-------|
| Models | 142+ |
| Controllers | 141+ |
| Migrations | 288+ |
| Routes (web) | Extensive |
| Routes (api) | Limited |
| Services | 50+ |
| Jobs | 27+ |
| Form Requests | Multiple |
| API Resources | Limited/Few |
| Policies | 20+ |

**Key Finding:** This is a primarily **Inertia.js-based application** with limited API infrastructure. Most controllers return Inertia responses, not JSON APIs.

---

## ROUTES ANALYSIS

### Web Routes (`routes/web.php`)
- **Primary pattern:** Inertia.js responses
- **Authentication:** Laravel Breeze/Fortify with magic links
- **Route groups:**
  - Public routes (events, venues, businesses)
  - Auth routes (login, register, password reset)
  - Authenticated routes (dashboard, profile, workspace management)
  - Platform-specific routes (day-news, downtown-guide, event-city, alphasite, local-voices)

### API Routes (`routes/api.php`)
**Very limited API infrastructure:**
- Only a few API routes currently exist:
  - `/api/user` (Sanctum authenticated)
  - Organization routes (`/api/organizations/*`)
  - Organization relationship routes
  - Notification routes (`/api/notifications/*`)

**Finding:** Most functionality is accessed via Inertia, not REST APIs.

---

## MODELS SUMMARY

### Core Models Identified

**User & Authentication:**
- `User` - Multi-tenant with workspace support
- `Workspace`, `WorkspaceMembership`
- `Tenant`
- `CrossDomainAuthToken`

**Business & CRM:**
- `Business` - Comprehensive business model (100+ fields)
- `Customer` - Separate customer model (links to Business)
- `BusinessSubscription`
- `BusinessAttribute`, `BusinessHours`, `BusinessPhoto`, `BusinessReview`, `BusinessFaq`, `BusinessSurvey`
- `SMBCrmCustomer`, `SMBCrmInteraction`

**Content & Publishing:**
- `DayNewsPost`, `Article`, `ArticleComment`
- `Podcast`, `PodcastEpisode`
- `Classified`, `ClassifiedImage`
- `Announcement`
- `Event`, `PlannedEvent`
- `Venue`, `Performer`
- `Calendar`, `CalendarFollower`
- `SocialPost`, `SocialGroup`, `SocialMessage`

**Commerce:**
- `Order`, `OrderItem`
- `Product`
- `Cart`
- `TicketOrder`, `TicketOrderItem`, `TicketPlan`
- `Advertisement`, `Campaign`
- `PromoCode`, `Coupon`

**Community & Location:**
- `Region`, `RegionZipcode`
- `Community`, `CommunityThread`, `CommunityThreadView`, `CommentReport`
- `Hub`, `HubMember`, `HubSection`

**Organization:**
- `OrganizationRelationship`
- Various organization-related models

**Other:**
- `NotificationLog`, `NotificationSubscription`
- `Booking`, `CheckIn`
- `WriterAgent`
- `EmailSend`
- And many more...

---

## CONTROLLERS ANALYSIS

### Controller Organization

Controllers are organized by domain/feature:
- `Auth/` - Authentication controllers
- `DayNews/` - Day News specific controllers
- `DowntownGuide/` - Downtown Guide controllers
- `EventCity/` - Event City controllers
- `AlphaSite/` - AlphaSite controllers
- `Api/` - API controllers (limited)
- `Admin/` - Admin controllers
- Various feature controllers (Event, Venue, Calendar, etc.)

### Key Controllers

**Authentication:**
- `Auth/AuthenticatedSessionController` - Login/logout
- `Auth/RegisteredUserController` - Registration
- `CrossDomainAuthController` - Cross-domain authentication

**Business:**
- `DayNews/BusinessController` - Business listings/details
- `EventCity/BusinessController` - Event City business views
- `DowntownGuide/BusinessController` - Downtown Guide business views
- `AlphaSite/BusinessPageController` - AlphaSite business pages

**Content:**
- `DayNews/PostController` - Article management
- `EventController` - Event management
- `VenueController` - Venue management
- Various content controllers

**Commerce:**
- `OrderController` - Order management
- `StripeWebhookController` - Payment webhooks
- `DayNews/PostPaymentController` - Post payment handling
- `TicketOrderController` - Ticket sales

**Note:** Most controllers return `Inertia::render()` responses, not JSON APIs.

---

## SERVICES ANALYSIS

### Services Directory Structure

50+ services organized by feature:

**Core Services:**
- `BusinessService` - Business CRUD and operations
- `CrossDomainAuthService` - Cross-domain authentication
- `NotificationService`, `NotificationIntegrationService`
- `EmailDeliveryService`, `EmailGeneratorService`
- `SmsService`
- `ProfileService`
- `SearchService`
- `LocationService`, `GeocodingService`

**Platform-Specific:**
- `AlphaSite/SMBCrmService` - SMB CRM functionality
- `AlphaSite/SubscriptionLifecycleService`
- `AlphaSite/CommunityService`
- `DayNews/AuthorService`
- `DayNews/SearchService`

**Commerce:**
- `StripeConnectService` - Stripe integration
- `TicketPaymentService`
- `DayNewsPaymentService`

**Content:**
- `NewsService`
- `AIContentService`, `AIService`
- Various news/content services

**Other:**
- `OrganizationService`
- `CalendarService`
- `EventService`
- `ReviewService`
- `LoyaltyService`
- `GamificationService`
- And many more...

---

## DATABASE SCHEMA

### Key Tables

**User & Auth:**
- `users` - Multi-tenant user model
- `workspaces`, `workspace_memberships`
- `tenants`
- `cross_domain_auth_tokens`

**Business & CRM:**
- `businesses` - Comprehensive (100+ columns including AlphaSite fields)
- `business_subscriptions`
- `business_attributes`, `business_hours`, `business_photos`, `business_reviews`, `business_faqs`, `business_surveys`
- `smb_businesses`, `smb_crm_customers`, `smb_crm_interactions`
- `customers` - Separate customer table

**Content:**
- `day_news_posts`
- `articles`, `article_comments`
- `podcasts`, `podcast_episodes`
- `events`, `planned_events`
- `venues`, `performers`
- Many more content tables...

**Commerce:**
- `orders`, `order_items`
- `products`
- `carts`
- `ticket_orders`, `ticket_order_items`, `ticket_plans`
- `advertisements`, `campaigns`
- Payment-related tables

**Location & Community:**
- `regions`, `region_zipcodes`
- `communities`, `community_threads`
- Various community tables

**Organization:**
- `organization_relationships`

And many more tables (288+ migrations total).

---

## INERTIA DATA FLOW

### HandleInertiaRequests Middleware

The application uses Inertia.js extensively. Controllers pass data directly to React/Vue components via Inertia props.

**Typical Pattern:**
```php
return Inertia::render('DayNews/Businesses/Index', [
    'businesses' => $businesses,
    'filters' => $request->only(['search', 'category']),
    // ... other props
]);
```

**Shared Props:** (Need to check `HandleInertiaRequests.php` middleware for shared data)

---

## AUTHENTICATION & AUTHORIZATION

### Authentication System
- **Guard:** Laravel's default `web` guard (session-based)
- **Laravel Sanctum:** Installed but limited use
- **Cross-Domain Auth:** `CrossDomainAuthService` and `CrossDomainAuthController` exist
- **Multi-tenant:** User model has `tenant_id` and `current_workspace_id`

### Policies
- 20+ policies exist for authorization
- Policies likely control access to resources by workspace/tenant

---

## API INFRASTRUCTURE STATUS

### Current State: **MINIMAL**

**What Exists:**
- Laravel Sanctum installed
- Few API routes (`/api/user`, `/api/organizations/*`, `/api/notifications/*`)
- Limited API resources (if any)

**What's Missing:**
- Comprehensive REST API for most resources
- API versioning structure
- API documentation
- API resources for most models
- Form requests for API validation
- API authentication flows

**Key Finding:** The application is **Inertia-first**, not API-first. To expose APIs for Learning Center integration, we would need to either:
1. Create API controllers that wrap existing services
2. Convert Inertia controllers to support both Inertia and API responses
3. Create parallel API routes that use the same services

---

## INTEGRATION IMPLICATIONS

### For Learning Center Integration:

**Option 1: Use Inertia.js (Recommended)**
- ✅ Match Publishing Platform's architecture
- ✅ Can use existing controllers directly
- ✅ No API layer needed
- ✅ Simpler integration
- ✅ Shared authentication (Laravel sessions)

**Option 2: Create APIs**
- ⚠️ Would need to build API layer on top of existing Inertia controllers
- ⚠️ More work (176 hours vs 80 hours with Inertia)
- ⚠️ Maintain API contracts
- ✅ Clear separation of concerns

**Recommendation:** Use Inertia.js integration approach (already documented in `LEARNING_CENTER_INTEGRATION_PROJECT_PLAN.md`).

---

## KEY FINDINGS FOR SALES/OPS SYSTEM

Based on the discovery, the Publishing Platform already has:

### ✅ Available for Sales/Ops Use:
1. **Business Management** - Comprehensive Business model and service
2. **Customer Management** - Customer model and SMBCrmService
3. **Subscription Management** - BusinessSubscription model
4. **Payment Processing** - Stripe integration exists
5. **Organization Management** - Organization relationships
6. **Contact Management** - Business contacts, attributes
7. **Activity Tracking** - SMBCrmInteraction model
8. **Workspace/Tenant** - Multi-tenant infrastructure

### ⚠️ Needs to be Built:
1. **Lead Management** - No dedicated lead model (Business could serve as lead)
2. **Campaign Management** - Campaign model exists but may need enhancement
3. **Pipeline Stages** - Not in current schema
4. **Task Management** - Not found in discovery
5. **Workflow Engine** - Not found in discovery
6. **Reporting/Analytics** - Basic analytics exist but may need enhancement

---

## NEXT STEPS

1. **Review Discovery Report Files:**
   - `discovery-report/00-overview.md` - Start here
   - `discovery-report/routes-compiled.txt` - All routes
   - `discovery-report/models-summary.md` - Model relationships
   - `discovery-report/controllers-index.md` - Controller methods
   - `discovery-report/database-summary.md` - Table structures

2. **Use Discovery to Inform:**
   - Learning Center integration approach (Inertia.js recommended)
   - Sales/Ops system design (leverage existing Business/Customer models)
   - API creation (if needed, build on top of existing services)

3. **Review Sales/Ops Requirements:**
   - Compare `sales-ops-requirements.md` with what exists
   - Identify gaps
   - Design API/resources for missing pieces

---

## DISCOVERY REPORT LOCATION

Full discovery report available at:
`/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/discovery-report/`

Key files:
- `00-overview.md` - Project overview and stats
- `routes-compiled.txt` - All routes listed
- `models-summary.md` - Model relationships
- `controllers-index.md` - Controller methods
- `database-summary.md` - Database schema
- `models/` - All model files
- `controllers/` - All controller files
- `services/` - All service files
- And more...

---

**Status:** ✅ Discovery Complete  
**Recommendation:** Proceed with Inertia.js integration approach as documented in `LEARNING_CENTER_INTEGRATION_PROJECT_PLAN.md`

