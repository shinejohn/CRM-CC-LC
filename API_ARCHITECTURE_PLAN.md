# API Architecture Plan
## Publishing Platform + Learning Center Integration

**Date:** December 28, 2025  
**Based on:** Discovery results from both platforms + Sales/Ops requirements  
**Status:** Comprehensive Analysis Complete

---

## EXECUTIVE SUMMARY

This document provides a comprehensive API architecture plan based on:
1. **Discovery of Publishing Platform** (Day-News Multisite)
2. **Discovery of Learning Center Backend**
3. **Sales/Ops Requirements Analysis**
4. **Integration Needs Assessment**

**Key Finding:** Both platforms should use **Inertia.js integration** rather than REST APIs for optimal code reuse and simplicity. However, this plan also documents what APIs would be needed if external systems (mobile apps, Lambda bots, etc.) require API access.

---

## PHASE 1: DISCOVERY RESULTS

### 1.1 Publishing Platform Discovery

**Architecture:** Inertia.js-first application
- **Models:** 142
- **Controllers:** 102 (mostly Inertia responses)
- **API Routes:** 20 (very limited)
- **API Resources:** 0
- **Services:** 82 (well-organized)

**Key Finding:** Publishing Platform is designed for server-side rendered SPAs, not REST APIs.

**Available Systems:**
- ✅ Authentication (Laravel sessions + cross-domain auth)
- ✅ Business Management (Business model, BusinessService)
- ✅ Customer Management (Customer, SMBCrmService)
- ✅ Payment Processing (Stripe integration)
- ✅ Subscription Management
- ✅ Content Management (articles, events, venues)
- ✅ Notification System
- ✅ Multi-tenant infrastructure

**API Infrastructure:** Minimal - only 20 API routes exist for:
- User authentication (`/api/user`)
- Organizations (`/api/organizations/*`)
- Notifications (`/api/notifications/*`)
- N8n integration (`/api/n8n/*`)

### 1.2 Learning Center Backend Discovery

**Discovery Results:**
- **Models:** 35
- **Controllers:** 29 (all API controllers)
- **Migrations:** 21
- **API Routes:** 166 routes (extensive!)
- **Services:** 13
- **Jobs:** 5
- **Form Requests:** 0
- **API Resources:** 0
- **Policies:** 0

**Architecture:** Laravel backend with API routes (separate React frontend)
- **Frontend:** React with API client (not Inertia.js)
- **API Versioning:** Uses `/api/v1/` prefix

**Current State:**
- ✅ Comprehensive API infrastructure exists for Learning Center features
- ✅ Knowledge base API (`KnowledgeController`) - 8 endpoints
- ✅ Survey API (`SurveyController`) - 7 endpoints
- ✅ Presentation API (`PresentationController`) - 5 endpoints
- ✅ Campaign API (`CampaignController`, `CampaignGenerationController`) - 5 endpoints
- ✅ Customer/CRM API (`CustomerController`, `CrmDashboardController`, `CrmAnalyticsController`) - 12 endpoints
- ✅ Article API (`ArticleController`) - 5 endpoints
- ✅ Search API (`SearchController`) - 4 endpoints
- ✅ Training API (`TrainingController`) - 3 endpoints
- ✅ TTS API (`TTSController`) - 3 endpoints
- ✅ AI API (`AIController`) - 3 endpoints
- ✅ Outbound Campaigns API - 30+ endpoints (email, phone, SMS)
- ✅ Content Generation API - 8 endpoints
- ✅ Ad Generation API - 7 endpoints
- ✅ Publishing API - 4 endpoints
- ✅ Personality API - 8 endpoints
- ✅ Services/Orders API - 5 endpoints
- ❌ Not using Inertia.js (yet)
- ❌ No integration with Publishing Platform (yet)

**Key Models:**
- Knowledge, FaqCategory, IndustryCategory, IndustrySubcategory
- SurveySection, SurveyQuestion
- Article
- Customer, Conversation, ConversationMessage, CustomerFaq, PendingQuestion
- PresentationTemplate, Presenter, GeneratedPresentation
- Campaign, CampaignRecipient
- OutboundCampaign, EmailTemplate, PhoneScript, SMSTemplate
- GeneratedContent, GeneratedAd, ContentTemplate, AdTemplate
- AiPersonality, PersonalityAssignment
- Service, ServiceCategory, Order

**Finding:** Learning Center backend has comprehensive API infrastructure (166 routes!) for its own features, but frontend is separate React app using API client. No integration with Publishing Platform yet.

---

## PHASE 2: REQUIREMENTS GATHERING

### 2.1 Publishing Platform Needs

**What Publishing Platform Exposes (for integration):**

**Content CRUD:**
- Articles/Posts (DayNewsPost)
- Events
- Venues
- Businesses
- Announcements
- Classifieds

**Media Management:**
- Business photos
- Event images
- File uploads (implicit via models)

**User/Author Management:**
- User model with workspace/tenant
- Author profiles
- Workspace management

**Community/Location Data:**
- Regions
- Communities
- Location services
- Geocoding

**Categories/Taxonomies:**
- Tags
- Categories
- Industry classifications

### 2.2 Sales/Marketing/Ops Needs (from sales-ops-requirements.md)

**Lead Management:**
- What is a lead? → Business model can serve as lead
- Lead sources → Track in Business model
- Pipeline stages → Needs to be added (not currently in schema)
- Lead scoring → Needs to be added

**Outreach & Campaigns:**
- Email campaigns → EmailDeliveryService exists
- Phone/SMS → SmsService exists
- Multi-step sequences → Campaign model exists but may need enhancement
- Template management → Needs to be built/enhanced

**Activity & Touchpoint Tracking:**
- SMBCrmInteraction model exists
- Can log emails, calls, meetings, proposals
- Integration with email/phone systems needed

**Workflows & Automation:**
- Workflow engine → Not found, needs to be built
- Task management → Not found, needs to be built
- Approval workflows → Not found, needs to be built

**Reporting & Metrics:**
- Basic analytics exist
- Sales-specific metrics need enhancement
- Pipeline reporting needs to be built

### 2.3 App Consumer Needs

**Mobile/Web Apps Would Need:**
- User authentication (Laravel sessions or API tokens)
- Content consumption (articles, events, businesses)
- Search/discovery
- User actions (save, share, submit)
- Notifications/preferences
- **Note:** If using Inertia.js, apps would consume server-rendered pages, not APIs

**External API Consumers Would Need:**
- RESTful API endpoints
- Authentication (API tokens/Sanctum)
- Content access
- User management
- Search capabilities

### 2.4 System Exchange Needs

**Lambda Bots/External Systems Need:**
- Event ingestion → API endpoints
- Data sync → API endpoints
- Webhook handling → Webhook endpoints
- Batch operations → Bulk API endpoints
- Status/health checks → Health endpoints

**N8n Integration:**
- Already exists in Publishing Platform (`Api/N8nIntegrationController`)
- Provides: regions, business upsert, feed management, article publishing

---

## PHASE 3: GAP ANALYSIS

### Resources Existence Matrix

| Resource | Exists in Publishing Platform? | Has API? | Needs API for Integration? | Priority | Notes |
|----------|-------------------------------|----------|----------------------------|----------|-------|
| **Authentication** | ✅ Yes | ❌ No | ✅ Yes | High | Use Inertia.js sessions OR create API |
| **Businesses** | ✅ Yes | ❌ No | ✅ Yes | High | Core integration point |
| **Customers** | ✅ Yes | ❌ No | ✅ Yes | High | For CRM integration |
| **Subscriptions** | ✅ Yes | ❌ No | ✅ Yes | High | Payment integration |
| **Orders** | ✅ Yes | ❌ No | ✅ Yes | High | Commerce integration |
| **Users** | ✅ Yes | ⚠️ Limited | ✅ Yes | High | `/api/user` exists but limited |
| **Workspaces** | ✅ Yes | ❌ No | ✅ Yes | Medium | Multi-tenant support |
| **Content (Articles)** | ✅ Yes | ❌ No | ✅ Maybe | Medium | If apps need API access |
| **Events** | ✅ Yes | ❌ No | ✅ Maybe | Medium | If apps need API access |
| **Notifications** | ✅ Yes | ✅ Yes | ✅ Yes | Medium | `/api/notifications/*` exists |
| **Campaigns** | ✅ Yes | ❌ No | ⚠️ Maybe | Medium | For sales ops |
| **Leads** | ⚠️ Partial (Business) | ❌ No | ✅ Yes | High | Business model can serve |
| **Pipeline Stages** | ❌ No | ❌ No | ✅ Yes | High | Needs to be built |
| **Tasks** | ❌ No | ❌ No | ✅ Yes | Medium | Needs to be built |
| **Workflows** | ❌ No | ❌ No | ✅ Yes | Medium | Needs to be built |
| **Reports/Analytics** | ⚠️ Basic | ❌ No | ✅ Yes | Medium | Needs enhancement |

**Legend:**
- ✅ = Yes/Exists
- ❌ = No/Doesn't Exist
- ⚠️ = Partial/Limited

---

## PHASE 4: API RESOURCE MAP

### 4.1 Core Resources (For Integration)

#### Authentication Resource

**If Using APIs (Alternative Approach):**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/password/reset` - Password reset
- `POST /api/auth/token/refresh` - Token refresh
- `GET /api/auth/user` - Current user (exists)

**If Using Inertia.js (Recommended):**
- Use Laravel sessions via Inertia.js
- Cross-domain auth via `CrossDomainAuthService`
- No API needed

#### Business Resource

**Source:** `Business` model, `BusinessService`

**Endpoints Needed:**
- `GET /api/businesses` - List businesses (filter, search, paginate)
- `GET /api/businesses/{id}` - Get business details
- `POST /api/businesses` - Create business
- `PUT /api/businesses/{id}` - Update business
- `DELETE /api/businesses/{id}` - Delete business
- `GET /api/businesses/{id}/subscription` - Get subscription
- `GET /api/businesses/{id}/attributes` - Get attributes
- `GET /api/businesses/{id}/interactions` - Get CRM interactions

**Consumers:** Learning Center, Mobile Apps, Lambda Bots

**Filter/Sort Options:**
- By region, category, industry
- Verified/unverified
- Claimed/unclaimed
- Search by name, location

**Relationships to Include:**
- Workspace
- Regions
- Subscription
- Attributes, Hours, Photos, Reviews

#### Customer Resource

**Source:** `Customer` model, `SMBCrmService`

**Endpoints Needed:**
- `GET /api/customers` - List customers
- `GET /api/customers/{id}` - Get customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `GET /api/customers/{id}/interactions` - Get interactions
- `POST /api/customers/{id}/interactions` - Log interaction

**Consumers:** Learning Center CRM, Sales Apps

#### Subscription Resource

**Source:** `BusinessSubscription` model

**Endpoints Needed:**
- `GET /api/subscriptions` - List subscriptions
- `GET /api/subscriptions/{id}` - Get subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/{id}` - Update subscription
- `POST /api/subscriptions/{id}/cancel` - Cancel subscription
- `POST /api/subscriptions/{id}/renew` - Renew subscription

**Consumers:** Learning Center, Payment Systems

#### Order Resource

**Source:** `Order`, `OrderItem` models, `OrderController`

**Endpoints Needed:**
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Get order
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order status
- `POST /api/orders/{id}/pay` - Process payment

**Consumers:** Learning Center, Payment Systems

### 4.2 Sales/Marketing Resources (To Be Built)

#### Lead Resource

**Source:** Extend `Business` model OR create `Lead` model

**Endpoints Needed:**
- `GET /api/leads` - List leads (with pipeline stage filter)
- `GET /api/leads/{id}` - Get lead
- `POST /api/leads` - Create lead
- `PUT /api/leads/{id}` - Update lead
- `PUT /api/leads/{id}/stage` - Update pipeline stage
- `GET /api/leads/{id}/activities` - Get activities
- `POST /api/leads/{id}/activities` - Log activity

**Consumers:** Sales Apps, Lambda Bots, Learning Center

#### Campaign Resource (Enhanced)

**Source:** `Campaign` model (exists but may need enhancement)

**Endpoints Needed:**
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/{id}` - Get campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/{id}` - Update campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/campaigns/{id}/recipients` - Get recipients
- `GET /api/campaigns/{id}/stats` - Get campaign stats

**Consumers:** Marketing Apps, Learning Center

#### Task Resource (To Be Built)

**Endpoints Needed:**
- `GET /api/tasks` - List tasks
- `GET /api/tasks/{id}` - Get task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `PUT /api/tasks/{id}/complete` - Mark complete
- `PUT /api/tasks/{id}/assign` - Assign task

**Consumers:** Sales Apps, Learning Center

#### Activity/Touchpoint Resource

**Source:** `SMBCrmInteraction` model (exists)

**Endpoints Needed:**
- `GET /api/activities` - List activities
- `GET /api/activities/{id}` - Get activity
- `POST /api/activities` - Log activity
- `GET /api/leads/{id}/activities` - Get lead activities
- `GET /api/customers/{id}/activities` - Get customer activities

**Consumers:** Sales Apps, Lambda Bots, Learning Center

### 4.3 Operations Resources

#### Workspace Resource

**Source:** `Workspace` model

**Endpoints Needed:**
- `GET /api/workspaces` - List workspaces
- `GET /api/workspaces/{id}` - Get workspace
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/{id}` - Update workspace
- `GET /api/workspaces/{id}/members` - Get members

**Consumers:** Admin Apps, Learning Center

#### Report/Analytics Resource (To Be Enhanced)

**Endpoints Needed:**
- `GET /api/reports/pipeline` - Pipeline report
- `GET /api/reports/activities` - Activity report
- `GET /api/reports/campaigns` - Campaign performance
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/leads-by-source` - Leads by source

**Consumers:** Dashboards, Learning Center

---

## PHASE 5: IMPLEMENTATION PLAN

### 5.1 Recommended Approach: Inertia.js Integration

**Why:** Publishing Platform uses Inertia.js, Learning Center should match

**Implementation:**
1. Convert Learning Center frontend to Inertia.js
2. Use Publishing Platform controllers/services directly
3. No API layer needed for internal integration
4. Shared authentication via Laravel sessions

**Timeline:** 4 weeks (80 hours)
- Week 1: Convert to Inertia.js
- Weeks 2-4: Integrate with Publishing Platform

### 5.2 Alternative Approach: Build APIs

**If external systems (mobile apps, Lambda bots) need API access:**

#### Directory Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/              # API version 1
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── BusinessController.php
│   │   │   │   │   ├── CustomerController.php
│   │   │   │   │   ├── LeadController.php
│   │   │   │   │   ├── CampaignController.php
│   │   │   │   │   └── ...
│   │   │   │   └── BaseController.php
│   │   ├── Resources/
│   │   │   ├── Api/
│   │   │   │   └── V1/
│   │   │   │       ├── BusinessResource.php
│   │   │   │       ├── CustomerResource.php
│   │   │   │       └── ...
│   │   ├── Requests/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── StoreBusinessRequest.php
│   │   │           └── ...
│   │   └── Middleware/
│   │       └── ApiVersion.php
│   └── Models/                       # Existing models
├── routes/
│   ├── api.php                       # API routes
│   └── api/
│       └── v1.php                    # V1 API routes
└── config/
    └── api.php                       # API configuration
```

#### Base Classes

**BaseController:**
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

abstract class BaseController extends Controller
{
    protected function success($data, string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $code);
    }

    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
```

**BaseResource:**
```php
<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\JsonResource;

abstract class BaseResource extends JsonResource
{
    public function with($request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toIso8601String(),
            ],
        ];
    }
}
```

#### Route Organization

**routes/api.php:**
```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require __DIR__ . '/api/v1.php';
});
```

**routes/api/v1.php:**
```php
<?php

use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\CustomerController;
// ... other controllers

Route::middleware(['auth:sanctum'])->group(function () {
    // Business routes
    Route::apiResource('businesses', BusinessController::class);
    Route::get('businesses/{business}/subscription', [BusinessController::class, 'subscription']);
    
    // Customer routes
    Route::apiResource('customers', CustomerController::class);
    
    // Lead routes
    Route::apiResource('leads', LeadController::class);
    
    // Campaign routes
    Route::apiResource('campaigns', CampaignController::class);
    
    // ... other resources
});
```

#### Implementation Order

**Week 1: Foundation**
1. Set up API structure (routes, base classes)
2. Implement authentication API
3. Implement Business API

**Week 2: Core Resources**
1. Customer API
2. Subscription API
3. Order API

**Week 3: Sales Resources**
1. Lead API (enhance Business model or create Lead)
2. Campaign API (enhance existing)
3. Activity API

**Week 4: Operations & Enhancement**
1. Workspace API
2. Report/Analytics API
3. Task API (if needed)
4. Documentation (OpenAPI/Swagger)

### 5.3 For Each Resource (Implementation Checklist)

#### Example: Business Resource

- [ ] **Model Review**
  - ✅ Model exists (`Business`)
  - ✅ Relationships defined
  - [ ] Add any missing scopes (e.g., `scopeByPipelineStage` if using for leads)

- [ ] **Create API Controller**
  - [ ] `app/Http/Controllers/Api/V1/BusinessController.php`
  - [ ] Implement: index, show, store, update, destroy
  - [ ] Use `BusinessService` for business logic
  - [ ] Return JSON responses

- [ ] **Create API Resource**
  - [ ] `app/Http/Resources/Api/V1/BusinessResource.php`
  - [ ] Define fields to include
  - [ ] Include relationships (subscription, attributes, etc.)
  - [ ] Handle conditional fields

- [ ] **Create Form Requests**
  - [ ] `app/Http/Requests/Api/V1/StoreBusinessRequest.php`
  - [ ] `app/Http/Requests/Api/V1/UpdateBusinessRequest.php`
  - [ ] Validation rules
  - [ ] Authorization logic

- [ ] **Create Policy (if needed)**
  - [ ] `app/Policies/BusinessPolicy.php`
  - [ ] Define permissions (view, create, update, delete)

- [ ] **Add Routes**
  - [ ] Add to `routes/api/v1.php`
  - [ ] Apply middleware (auth, rate limiting)
  - [ ] Test routes

- [ ] **Test Endpoint**
  - [ ] Unit tests for controller
  - [ ] Integration tests for endpoints
  - [ ] Test authentication/authorization
  - [ ] Test validation

- [ ] **Document in OpenAPI**
  - [ ] Add endpoint documentation
  - [ ] Document request/response schemas
  - [ ] Document authentication requirements

---

## RECOMMENDED ARCHITECTURE

### Option 1: Inertia.js Integration (RECOMMENDED)

```
┌─────────────────────────────────────────────────────────┐
│         Publishing Platform (Inertia.js)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Models                  │  │
│  │  (Inertia::render() responses)                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Share Controllers/Services
                          │
┌─────────────────────────────────────────────────────────┐
│         Learning Center (Convert to Inertia.js)         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Use Publishing Platform controllers/services     │  │
│  │  Inertia.js for frontend                          │  │
│  │  Shared authentication                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Direct code reuse
- ✅ Simpler architecture
- ✅ Shared authentication
- ✅ 55% time savings

### Option 2: API Integration (If External Access Needed)

```
┌─────────────────────────────────────────────────────────┐
│         Publishing Platform                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Models                  │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          │ Create API Layer              │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  API Controllers → Same Services → Models         │  │
│  │  (JSON responses)                                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ REST API
                          │
┌─────────────────────────────────────────────────────────┐
│         Learning Center                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Frontend → API Client → Publishing APIs    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Use Cases:**
- Mobile apps need API access
- Lambda bots need API access
- External systems integration
- Public API access

---

## HYBRID APPROACH (Recommended for Long Term)

### Internal Integration: Inertia.js
- Learning Center ↔ Publishing Platform: Use Inertia.js
- Shared code, simpler integration

### External Access: APIs
- Mobile Apps → Publishing Platform: REST APIs
- Lambda Bots → Publishing Platform: REST APIs
- External Systems → Publishing Platform: REST APIs

**Implementation:**
1. Convert Learning Center to Inertia.js (internal integration)
2. Build APIs on Publishing Platform for external consumers
3. Both can use same services layer

---

## PRIORITY IMPLEMENTATION ORDER

### High Priority (Week 1-2)
1. **Authentication API** (if not using Inertia sessions)
2. **Business API** (core integration point)
3. **Customer API** (CRM integration)

### Medium Priority (Week 3-4)
4. **Subscription API** (payment integration)
5. **Order API** (commerce integration)
6. **Lead API** (sales ops - enhance Business model)

### Lower Priority (Week 5+)
7. **Campaign API** (enhance existing)
8. **Activity API** (use existing SMBCrmInteraction)
9. **Workspace API** (multi-tenant)
10. **Report/Analytics API** (enhance existing)

### To Be Built (Sales/Ops Needs)
11. **Task API** (new resource)
12. **Workflow API** (new resource)
13. **Pipeline Stage Management** (enhance Business/Lead model)

---

## API VERSIONING STRATEGY

### Structure
```
/api/v1/businesses
/api/v1/customers
/api/v2/businesses  (future version)
```

### Versioning Approach
- URL-based versioning (`/api/v1/`)
- Maintain backward compatibility
- Document breaking changes
- Deprecation warnings for old versions

---

## AUTHENTICATION STRATEGY

### Option 1: Laravel Sanctum (Recommended for APIs)
- API tokens for external consumers
- Session-based for web (Inertia.js)
- OAuth2 (optional, for third-party apps)

### Option 2: JWT (Alternative)
- Stateless authentication
- Better for mobile apps
- Requires additional package

**Recommendation:** Use Sanctum (already installed in Publishing Platform)

---

## DOCUMENTATION STRATEGY

### OpenAPI/Swagger
- Generate from code annotations
- Interactive API documentation
- Client SDK generation

### API Documentation Endpoints
- `GET /api/docs` - Swagger UI
- `GET /api/docs.json` - OpenAPI spec

---

## TESTING STRATEGY

### Unit Tests
- Test controllers
- Test services
- Test models

### Integration Tests
- Test API endpoints
- Test authentication
- Test authorization
- Test validation

### API Testing
- Postman collection
- Automated API tests
- Performance testing

---

## SUMMARY & RECOMMENDATIONS

### Primary Recommendation: Inertia.js Integration

**For Learning Center ↔ Publishing Platform Integration:**
- ✅ Use Inertia.js approach
- ✅ Convert Learning Center to Inertia.js
- ✅ Share Publishing Platform controllers/services
- ✅ 4 weeks, 80 hours
- ✅ Learning Center already has API infrastructure for its own features (can keep those)

**Architecture:**
```
Publishing Platform (Inertia.js)
  ↓ (share controllers/services)
Learning Center Backend (Convert to Inertia.js)
  ↓ (Inertia.js responses)
Learning Center Frontend (React + Inertia.js)
```

**Learning Center's Existing APIs:**
- Keep existing Learning Center API routes for:
  - Knowledge base features
  - Survey features
  - Presentation features
  - Training features
  - AI features
- These are Learning Center-specific and don't need Publishing Platform integration
- Use Publishing Platform services for:
  - Authentication
  - Business/Customer management
  - Payments/Subscriptions
  - Notifications

### Secondary: Build APIs for External Consumers

**For Mobile Apps, Lambda Bots, External Systems:**
- Build REST API layer on Publishing Platform
- Use same services layer
- Version APIs (`/api/v1/`)
- Use Laravel Sanctum for authentication
- 6+ weeks, 176+ hours

**When to Build:**
- Mobile apps need API access
- Lambda bots need programmatic access
- External systems need integration
- Public API access required

### Hybrid Approach (Best Long-Term)

**Both:**
1. Internal integration via Inertia.js (fast, simple)
2. APIs for external consumers (flexible, scalable)

**Architecture:**
```
Publishing Platform:
  - Inertia.js controllers (for web)
  - API controllers (for external)
  - Shared services layer

Learning Center:
  - Inertia.js (integrate with Publishing Platform)
  - Keep existing APIs (for Learning Center features)
  - Use Publishing Platform services (for shared features)
```

**Implementation Order:**
1. Phase 1: Convert Learning Center to Inertia.js (internal integration with Publishing Platform)
2. Phase 2: Build APIs on Publishing Platform (external access - if needed)
3. Both use same services layer
4. Learning Center keeps its own API routes for Learning Center-specific features

---

## DETAILED INTEGRATION STRATEGY

### What to Integrate via Inertia.js

**From Publishing Platform:**
- ✅ Authentication (use Publishing Platform auth)
- ✅ Business management (use Publishing Platform BusinessService)
- ✅ Customer management (use Publishing Platform Customer/SMBCrmService)
- ✅ Payment/Subscription (use Publishing Platform Stripe/payment services)
- ✅ Notifications (use Publishing Platform notification services)
- ✅ File uploads (use Publishing Platform file services)

### What to Keep Separate (Learning Center APIs)

**Learning Center-Specific Features:**
- ✅ Knowledge base API (Learning Center specific)
- ✅ Survey API (Learning Center specific)
- ✅ Presentation API (Learning Center specific)
- ✅ Campaign API (Learning Center campaigns, different from Publishing Platform campaigns)
- ✅ Training API (Learning Center specific)
- ✅ AI API (Learning Center specific)
- ✅ Search API (Learning Center vector search)

**These don't need Publishing Platform integration - they're unique to Learning Center.**

---

## APPENDIX: COMPLETE API ENDPOINT INVENTORY

### Learning Center Existing APIs (`/api/v1/`)

#### Knowledge Base (8 endpoints)
- `GET /api/v1/knowledge` - List
- `POST /api/v1/knowledge` - Create
- `GET /api/v1/knowledge/{id}` - Show
- `PUT /api/v1/knowledge/{id}` - Update
- `DELETE /api/v1/knowledge/{id}` - Delete
- `POST /api/v1/knowledge/{id}/generate-embedding` - Generate embedding
- `POST /api/v1/knowledge/{id}/vote` - Vote
- `GET /api/v1/faq-categories` - Categories (5 endpoints)

#### Survey (7 endpoints)
- `GET /api/v1/survey/sections` - List sections
- `POST /api/v1/survey/sections` - Create section
- `GET /api/v1/survey/sections/{id}` - Show section
- `PUT /api/v1/survey/sections/{id}` - Update section
- `DELETE /api/v1/survey/sections/{id}` - Delete section
- `GET /api/v1/survey/sections/{id}/questions` - Questions
- `POST /api/v1/survey/questions` - Create question (3 endpoints)

#### Articles (5 endpoints)
- `GET /api/v1/articles` - List
- `POST /api/v1/articles` - Create
- `GET /api/v1/articles/{id}` - Show
- `PUT /api/v1/articles/{id}` - Update
- `DELETE /api/v1/articles/{id}` - Delete

#### Search (4 endpoints)
- `POST /api/v1/search` - Semantic search
- `POST /api/v1/search/fulltext` - Full-text search
- `POST /api/v1/search/hybrid` - Hybrid search
- `GET /api/v1/search/status` - Embedding status

#### Presentations (5 endpoints)
- `GET /api/v1/presentations/templates` - List templates
- `GET /api/v1/presentations/templates/{id}` - Show template
- `GET /api/v1/presentations/{id}` - Show presentation
- `POST /api/v1/presentations/generate` - Generate
- `POST /api/v1/presentations/{id}/audio` - Generate audio

#### Campaigns (5 endpoints)
- `GET /api/v1/campaigns` - List
- `GET /api/v1/campaigns/{slug}` - Show
- `POST /api/v1/campaigns/generate` - Generate
- `GET /api/v1/campaigns/templates` - Templates
- `POST /api/v1/campaigns/suggestions` - Suggestions

#### CRM - Customers (8 endpoints)
- `GET /api/v1/customers` - List
- `POST /api/v1/customers` - Create
- `GET /api/v1/customers/{id}` - Show
- `GET /api/v1/customers/slug/{slug}` - Show by slug
- `PUT /api/v1/customers/{id}` - Update
- `DELETE /api/v1/customers/{id}` - Delete
- `PUT /api/v1/customers/{id}/business-context` - Update context
- `GET /api/v1/customers/{id}/ai-context` - Get AI context

#### CRM - Conversations (7 endpoints)
- `GET /api/v1/conversations` - List
- `POST /api/v1/conversations` - Create
- `GET /api/v1/conversations/{id}` - Show
- `PUT /api/v1/conversations/{id}` - Update
- `POST /api/v1/conversations/{id}/end` - End
- `POST /api/v1/conversations/{id}/messages` - Add message
- `GET /api/v1/conversations/{id}/messages` - Get messages

#### CRM - Analytics (8 endpoints)
- `GET /api/v1/crm/dashboard/analytics` - Dashboard
- `GET /api/v1/crm/analytics/interest` - Interest analytics
- `GET /api/v1/crm/analytics/purchases` - Purchase analytics
- `GET /api/v1/crm/analytics/learning` - Learning analytics
- `GET /api/v1/crm/analytics/campaign-performance` - Campaign performance
- `GET /api/v1/crm/customers/{id}/engagement-score` - Engagement
- `GET /api/v1/crm/campaigns/{id}/roi` - ROI
- `GET /api/v1/crm/customers/{id}/predictive-score` - Predictive score

#### Outbound Campaigns (30+ endpoints)
- Outbound Campaigns: 8 endpoints (CRUD + start, recipients, analytics)
- Email Campaigns: 4 endpoints (list, create, templates)
- Phone Campaigns: 5 endpoints (list, create, scripts, call status)
- SMS Campaigns: 5 endpoints (list, create, templates, SMS status)

#### Content/Ad Generation (15 endpoints)
- Content Generation: 8 endpoints
- Ad Generation: 7 endpoints

#### Other APIs
- Training: 3 endpoints
- TTS: 3 endpoints
- AI: 3 endpoints
- Services: 3 endpoints
- Orders: 3 endpoints
- Personalities: 8 endpoints
- Publishing: 4 endpoints

**Total Learning Center API Endpoints:** 166+ routes

---

## PUBLISHING PLATFORM API ENDPOINTS (Existing - Limited)

### Current API Routes (`/api/`)

1. **User Authentication:**
   - `GET /api/user` (Sanctum authenticated)

2. **Organizations:**
   - `GET /api/organizations/search`
   - `GET /api/organizations/{id}/content`
   - `POST /api/organizations/{id}/relate`
   - `GET /api/organizations/{id}/hierarchy`

3. **Organization Relationships:**
   - `POST /api/organization-relationships`
   - `POST /api/organization-relationships/bulk`
   - `PUT /api/organization-relationships/{id}`
   - `DELETE /api/organization-relationships/{id}`

4. **Notifications:**
   - `GET /api/notifications/vapid-key`
   - `POST /api/notifications/web-push/register`
   - `POST /api/notifications/sms/request-verification`
   - `POST /api/notifications/sms/verify-and-subscribe`
   - `GET /api/notifications/subscriptions`
   - `PATCH /api/notifications/subscriptions/{id}`
   - `DELETE /api/notifications/subscriptions/{id}`

**Total Publishing Platform API Endpoints:** 20 routes

**Note:** Most functionality is accessed via Inertia.js web routes (229 routes), not APIs.

---

## WHAT APIs NEED TO BE BUILT (If External Access Required)

### On Publishing Platform

If mobile apps, Lambda bots, or external systems need API access to Publishing Platform:

1. **Business API** (8 endpoints) - High Priority
2. **Customer API** (6 endpoints) - High Priority
3. **Subscription API** (6 endpoints) - High Priority
4. **Order API** (5 endpoints) - High Priority
5. **Lead API** (7 endpoints) - High Priority (enhance Business model)
6. **Workspace API** (5 endpoints) - Medium Priority
7. **Content APIs** (if needed) - Medium Priority
8. **Event/Venue APIs** (if needed) - Low Priority

**Estimated:** 6+ weeks, 176+ hours

---

**Status:** ✅ Analysis Complete  
**Next Step:** 
1. Review discovery reports
2. Decide on Inertia.js vs API approach (Inertia.js recommended)
3. Begin implementation based on `LEARNING_CENTER_INTEGRATION_PROJECT_PLAN.md`

