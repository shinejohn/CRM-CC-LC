# Learning Center Integration Project Plan
## Leveraging Publishing Platform Infrastructure

**Date:** December 28, 2025  
**Project:** Fibonacco Learning Center (Sales, Marketing & Operations Platform)  
**Goal:** Integrate with existing publishing platform to avoid redundancy and leverage shared systems

---

## EXECUTIVE SUMMARY

This document outlines the integration plan for the Learning Center project to leverage existing systems from the Publishing Platform (Day-News, GoEventCity, DowntownsGuide, GoLocalVoices, AlphaSite, and the CRM SAAS Platform).

**Key Principle:** Use existing systems as an integrated whole rather than creating redundancy.

**Main Objective:** Complete the Learning Center project by integrating with and leveraging the Publishing Platform's existing infrastructure.

---

## PUBLISHING PLATFORM CAPABILITIES DISCOVERED

Based on analysis of the Multisite codebase, the Publishing Platform includes:

### ✅ Available Systems (Ready to Leverage)

1. **Authentication & User Management**
   - ✅ Laravel Authentication (Breeze/Fortify)
   - ✅ User model with workspace/organization support
   - ✅ Cross-domain authentication service
   - ✅ Session management
   - ✅ User registration/login flows
   - ✅ Password reset capabilities
   - ✅ Email verification

2. **Business/Customer Management**
   - ✅ Business model (comprehensive)
   - ✅ Customer model
   - ✅ Business subscriptions
   - ✅ Business attributes
   - ✅ Business hours
   - ✅ Business reviews
   - ✅ Business FAQs
   - ✅ Business surveys
   - ✅ Business photos
   - ✅ Business templates
   - ✅ SMBCrmService (Business CRM functionality)

3. **Payment & Billing**
   - ✅ Stripe integration (StripeConnectService)
   - ✅ Order management (OrderController)
   - ✅ Payment processing
   - ✅ Webhook handling (StripeWebhookController)
   - ✅ Subscription management (business_subscriptions table)
   - ✅ Post payment handling

4. **Organization/Workspace Management**
   - ✅ Workspace model
   - ✅ Organization model
   - ✅ Organization relationships
   - ✅ Multi-tenant support
   - ✅ Workspace invitations

5. **Other Available Services**
   - ✅ Email services (EmailDeliveryService, EmailGeneratorService)
   - ✅ SMS service (SmsService)
   - ✅ Notification service (NotificationService, NotificationIntegrationService)
   - ✅ File storage/services
   - ✅ Search service (SearchService)
   - ✅ Location/Geocoding services
   - ✅ Profile service (ProfileService)

---

## LEARNING CENTER INTEGRATION REQUIREMENTS

Based on the code review, the Learning Center needs:

### Critical Missing Components

1. **Authentication System** (0% Complete - Can Use Publishing Platform)
2. **Payment Processing** (30% Complete - Can Use Publishing Platform)
3. **Business Profile System** (Partial - Can Leverage Publishing Platform)
4. **User Management** (Partial - Can Use Publishing Platform)
5. **File Upload System** (0% Complete - May Use Publishing Platform)
6. **Notification System** (0% Complete - Can Use Publishing Platform)

---

## INTEGRATION PROJECT PLAN

### Phase 1: Authentication Integration (Priority 1 - Critical)

**Objective:** Integrate Learning Center with Publishing Platform authentication

#### Task 1.1: Cross-Domain Authentication Setup
- **Status:** Publishing Platform has `CrossDomainAuthService` and `CrossDomainAuthController`
- **Action:**
  - Configure Learning Center to use Publishing Platform's cross-domain auth
  - Set up token exchange mechanism
  - Configure shared session domain (if applicable)
- **Deliverables:**
  - Authentication middleware configured in Learning Center
  - API routes protected with auth middleware
  - User context available in Learning Center API endpoints
- **Dependencies:** Publishing Platform auth endpoints available
- **Estimated Time:** 8 hours

#### Task 1.2: User Registration/Login Integration
- **Status:** Publishing Platform has `RegisteredUserController` and `AuthenticatedSessionController`
- **Action:**
  - Connect Learning Center frontend to Publishing Platform auth endpoints
  - Update LoginPage.tsx to call Publishing Platform auth API
  - Update SignUpPage.tsx to call Publishing Platform registration API
  - Handle auth token storage and refresh
- **Deliverables:**
  - LoginPage.tsx connected to real auth API
  - SignUpPage.tsx connected to real registration API
  - Auth state management in frontend
- **Dependencies:** Publishing Platform auth API endpoints
- **Estimated Time:** 12 hours

#### Task 1.3: API Token Authentication
- **Status:** Need to leverage Publishing Platform's token system
- **Action:**
  - Use Publishing Platform's API token system (Laravel Sanctum likely)
  - Configure token generation in Learning Center
  - Update api-client.ts to handle token refresh
- **Deliverables:**
  - API token generation endpoint
  - Token refresh mechanism
  - Protected API routes working
- **Dependencies:** Publishing Platform token system
- **Estimated Time:** 6 hours

#### Task 1.4: Password Reset Integration
- **Status:** Publishing Platform has password reset (standard Laravel)
- **Action:**
  - Connect Learning Center to Publishing Platform password reset flow
  - Update frontend to use Publishing Platform password reset endpoints
- **Deliverables:**
  - Password reset flow functional
- **Dependencies:** Publishing Platform password reset endpoints
- **Estimated Time:** 4 hours

**Phase 1 Total:** ~30 hours

---

### Phase 2: Business Profile Integration (Priority 1 - Critical)

**Objective:** Leverage Publishing Platform's comprehensive business management system

#### Task 2.1: Business Model Integration
- **Status:** Publishing Platform has comprehensive Business model
- **Action:**
  - Connect Learning Center CRM to Publishing Platform Business model
  - Map Learning Center customer data to Publishing Platform business structure
  - Use Publishing Platform's BusinessService for business operations
- **Deliverables:**
  - Business data synced between systems
  - Learning Center uses Publishing Platform business endpoints
- **Dependencies:** Publishing Platform Business API endpoints
- **Estimated Time:** 12 hours

#### Task 2.2: Business Profile API Integration
- **Status:** Publishing Platform has BusinessController and BusinessService
- **Action:**
  - Update Learning Center CustomerController to use Publishing Platform Business endpoints
  - Map Learning Center customer fields to Publishing Platform business fields
  - Handle data transformation between systems
- **Deliverables:**
  - CustomerController integrated with Publishing Platform
  - Business profile data available in Learning Center
- **Dependencies:** Publishing Platform Business API
- **Estimated Time:** 16 hours

#### Task 2.3: Business Subscriptions Integration
- **Status:** Publishing Platform has business_subscriptions table
- **Action:**
  - Connect Learning Center subscription features to Publishing Platform subscription system
  - Use Publishing Platform subscription endpoints
- **Deliverables:**
  - Subscription management functional
  - Learning Center can access subscription data
- **Dependencies:** Publishing Platform subscription API
- **Estimated Time:** 8 hours

#### Task 2.4: Business Attributes Integration
- **Status:** Publishing Platform has business_attributes table
- **Action:**
  - Use Publishing Platform business attributes for customer data
  - Map Learning Center customer profile fields to business attributes
- **Deliverables:**
  - Business attributes available in Learning Center
- **Dependencies:** Publishing Platform attributes API
- **Estimated Time:** 6 hours

**Phase 2 Total:** ~42 hours

---

### Phase 3: Payment & Billing Integration (Priority 1 - Critical)

**Objective:** Use Publishing Platform's payment infrastructure

#### Task 3.1: Stripe Integration
- **Status:** Publishing Platform has StripeConnectService and StripeWebhookController
- **Action:**
  - Use Publishing Platform's Stripe integration
  - Connect Learning Center OrderController to Publishing Platform payment endpoints
  - Handle payment processing through Publishing Platform
- **Deliverables:**
  - Payment processing functional
  - Orders can be paid through Publishing Platform
- **Dependencies:** Publishing Platform payment API
- **Estimated Time:** 16 hours

#### Task 3.2: Order Management Integration
- **Status:** Publishing Platform has OrderController
- **Action:**
  - Use Publishing Platform order management for Learning Center service orders
  - Sync order data between systems if needed
  - Use Publishing Platform order status tracking
- **Deliverables:**
  - Orders processed through Publishing Platform
  - Order status available in Learning Center
- **Dependencies:** Publishing Platform Order API
- **Estimated Time:** 12 hours

#### Task 3.3: Subscription Billing Integration
- **Status:** Publishing Platform has subscription management
- **Action:**
  - Connect Learning Center subscription billing to Publishing Platform
  - Use Publishing Platform subscription payment processing
- **Deliverables:**
  - Subscription billing functional
- **Dependencies:** Publishing Platform subscription billing API
- **Estimated Time:** 10 hours

**Phase 3 Total:** ~38 hours

---

### Phase 4: Notification System Integration (Priority 2 - High)

**Objective:** Use Publishing Platform's notification infrastructure

#### Task 4.1: Notification Service Integration
- **Status:** Publishing Platform has NotificationService and NotificationIntegrationService
- **Action:**
  - Connect Learning Center to Publishing Platform notification system
  - Use Publishing Platform notification endpoints
  - Configure notification preferences
- **Deliverables:**
  - In-app notifications functional
  - Notification preferences management
- **Dependencies:** Publishing Platform notification API
- **Estimated Time:** 10 hours

#### Task 4.2: Email Notification Integration
- **Status:** Publishing Platform has EmailDeliveryService
- **Action:**
  - Use Publishing Platform email service for Learning Center notifications
  - Configure email templates
- **Deliverables:**
  - Email notifications working
- **Dependencies:** Publishing Platform email API
- **Estimated Time:** 8 hours

#### Task 4.3: SMS Notification Integration
- **Status:** Publishing Platform has SmsService
- **Action:**
  - Use Publishing Platform SMS service for Learning Center
  - Configure SMS templates
- **Deliverables:**
  - SMS notifications working
- **Dependencies:** Publishing Platform SMS API
- **Estimated Time:** 6 hours

**Phase 4 Total:** ~24 hours

---

### Phase 5: File Upload & Storage Integration (Priority 2 - High)

**Objective:** Leverage Publishing Platform's file handling

#### Task 5.1: File Upload Service Integration
- **Status:** Need to verify Publishing Platform file upload capabilities
- **Action:**
  - Identify Publishing Platform file upload endpoints
  - Connect Learning Center file uploads to Publishing Platform
  - Handle file storage through Publishing Platform
- **Deliverables:**
  - File upload functional
  - Files stored and accessible
- **Dependencies:** Publishing Platform file API
- **Estimated Time:** 12 hours

#### Task 5.2: Image/Asset Management
- **Status:** Publishing Platform has image handling (BusinessPhoto, etc.)
- **Action:**
  - Use Publishing Platform image services
  - Connect Learning Center asset management
- **Deliverables:**
  - Image upload and management functional
- **Dependencies:** Publishing Platform image API
- **Estimated Time:** 8 hours

**Phase 5 Total:** ~20 hours

---

### Phase 6: Additional Service Integrations (Priority 2 - High)

#### Task 6.1: Search Service Integration
- **Status:** Publishing Platform has SearchService
- **Action:**
  - Evaluate if Publishing Platform search can enhance Learning Center search
  - Integrate if beneficial
- **Estimated Time:** 8 hours

#### Task 6.2: Location/Geocoding Integration
- **Status:** Publishing Platform has LocationService and GeocodingService
- **Action:**
  - Use Publishing Platform location services for customer locations
- **Estimated Time:** 6 hours

#### Task 6.3: Profile Service Integration
- **Status:** Publishing Platform has ProfileService
- **Action:**
  - Connect Learning Center ProfilePage to Publishing Platform profile service
- **Estimated Time:** 8 hours

**Phase 6 Total:** ~22 hours

---

## GAP ANALYSIS

### Publishing Platform Gaps (For Learning Center Integration)

These are items the Publishing Platform may need to expose/configure for Learning Center integration:

1. **API Endpoint Exposure**
   - Publish authentication API endpoints for Learning Center access
   - Expose business management API endpoints
   - Expose payment/subscription API endpoints
   - Expose notification API endpoints

2. **API Documentation**
   - Document available endpoints
   - Document request/response formats
   - Document authentication requirements

3. **API Versioning/Namespace**
   - Ensure API endpoints are versioned
   - Consider `/api/v1/publishing-platform/` namespace for shared services

4. **Cross-Origin Configuration**
   - Configure CORS for Learning Center domain
   - Ensure secure cross-domain communication

5. **Shared Database Access** (Optional)
   - Consider if Learning Center should access Publishing Platform database directly
   - Or use API-only approach (recommended)

---

## LEARNING CENTER PROJECT TASKS (Priority Order)

### Immediate (Week 1-2)

1. **Authentication Integration**
   - Set up cross-domain authentication with Publishing Platform
   - Integrate login/registration
   - Configure API token authentication
   - **Estimated:** 30 hours

2. **Business Profile Integration**
   - Connect to Publishing Platform Business API
   - Map customer data structure
   - Integrate business management endpoints
   - **Estimated:** 42 hours

### Short Term (Week 3-4)

3. **Payment Integration**
   - Integrate Stripe payment processing
   - Connect order management
   - Set up subscription billing
   - **Estimated:** 38 hours

4. **Connect Mock Data Pages**
   - Connect ProfilePage to Publishing Platform profile API
   - Connect CalendarView to Publishing Platform (if applicable)
   - Connect VideoCall data to Publishing Platform
   - Connect DataReportPanel to Publishing Platform analytics
   - **Estimated:** 20 hours

### Medium Term (Week 5-6)

5. **Notification System**
   - Integrate notification service
   - Set up email notifications
   - Set up SMS notifications
   - **Estimated:** 24 hours

6. **File Upload System**
   - Integrate file upload service
   - Connect image/asset management
   - **Estimated:** 20 hours

7. **Additional Service Integrations**
   - Search service (if needed)
   - Location services
   - Profile service
   - **Estimated:** 22 hours

---

## INTEGRATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│              PUBLISHING PLATFORM (Multisite)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth API   │  │ Business API │  │ Payment API  │    │
│  │              │  │              │  │              │    │
│  │ - Login      │  │ - CRUD       │  │ - Stripe     │    │
│  │ - Register   │  │ - Attributes │  │ - Orders     │    │
│  │ - Token      │  │ - Subscriptions│ │ - Webhooks  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │Notification  │  │  File/Asset  │  │   Profile    │    │
│  │    API       │  │     API      │  │     API      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ API Integration
                           │
┌─────────────────────────────────────────────────────────────┐
│              LEARNING CENTER (This Project)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend (React + TypeScript)           │  │
│  │  - LoginPage → Publishing Platform Auth API          │  │
│  │  - ProfilePage → Publishing Platform Profile API    │  │
│  │  - Customer Management → Publishing Platform Biz API │  │
│  │  - Order/Checkout → Publishing Platform Payment API │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Backend API (Laravel - Thin Layer)          │  │
│  │  - Proxies/transforms requests to Publishing Platform│  │
│  │  - Handles Learning Center-specific logic            │  │
│  │  - Manages Learning Center database                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Learning Center Database (PostgreSQL)           │  │
│  │  - Knowledge Base, FAQs, Articles                    │  │
│  │  - Presentations, Campaigns                          │  │
│  │  - Learning Center specific data                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION APPROACH

### Option 1: Inertia.js Integration (RECOMMENDED - Best Approach)

**Approach:** Convert Learning Center to use Inertia.js, matching Publishing Platform architecture

**Current State:**
- Publishing Platform: Uses Inertia.js (Laravel + Inertia + React)
- Learning Center: Uses React + React Router + API client (separate frontend/backend)

**Why This Is Better:**
- ✅ **No API layer needed** - Data passed directly from controllers to React components
- ✅ **Shared code** - Can share controllers, services, and middleware between applications
- ✅ **Shared authentication** - Laravel's session-based auth works seamlessly
- ✅ **Simpler integration** - Use Inertia's `visit()` method for cross-domain navigation
- ✅ **Better DX** - Type-safe props, simpler data flow
- ✅ **Code reuse** - Share Publishing Platform controllers/services directly
- ✅ **Single codebase pattern** - Both apps follow same architecture

**Implementation Steps:**
1. Install Inertia.js in Learning Center backend
2. Convert React Router routes to Laravel web routes
3. Replace API client calls with Inertia form submissions/visits
4. Share Publishing Platform controllers/services via composer packages or direct inclusion
5. Use Inertia's shared props for authentication state
6. Use Inertia's `router.visit()` for cross-domain navigation between systems

**Migration Effort:** Medium (2-3 weeks) but results in much cleaner architecture

### Option 2: API Integration (Alternative)

**Approach:** Learning Center calls Publishing Platform APIs

**Pros:**
- Clear separation of concerns
- Independent deployment
- Versioning control
- Easier to scale independently
- No migration needed (keep current architecture)

**Cons:**
- Network latency
- Need to maintain API contracts
- Potential duplication of logic
- More complex error handling
- Token management overhead

### Option 3: Shared Database (Not Recommended)

**Approach:** Learning Center accesses Publishing Platform database directly

**Pros:**
- Direct data access
- No API overhead

**Cons:**
- Tight coupling
- Database schema dependencies
- Deployment coordination needed
- Security concerns

**Recommendation:** Use **Option 1 (Inertia.js Integration)** - This provides the cleanest architecture, eliminates API overhead, enables code sharing, and matches the Publishing Platform's proven pattern.

---

## INERTIA.JS MIGRATION PLAN (If Using Recommended Approach)

If we adopt Inertia.js integration (Option 1), the migration involves:

### Migration Phase 0: Setup Inertia.js (20 hours)

#### Task 0.1: Install and Configure Inertia (4 hours)
- [ ] Install Inertia Laravel package
- [ ] Install Inertia React package
- [ ] Configure Inertia middleware
- [ ] Set up root Inertia component
- [ ] Configure Vite for Inertia SSR (optional)

#### Task 0.2: Convert First Route (4 hours)
- [ ] Convert one simple route (e.g., dashboard) to Inertia
- [ ] Remove API call, pass data from controller
- [ ] Test Inertia navigation
- [ ] Verify props are passed correctly

#### Task 0.3: Convert Authentication Routes (4 hours)
- [ ] Convert login page to Inertia
- [ ] Convert registration page to Inertia
- [ ] Use Inertia form helper for submissions
- [ ] Handle form errors with Inertia

#### Task 0.4: Set Up Shared Data (4 hours)
- [ ] Configure HandleInertiaRequests middleware
- [ ] Share auth user globally
- [ ] Share workspace/tenant data
- [ ] Add flash messages support

#### Task 0.5: Convert Core Routes (4 hours)
- [ ] Convert Learning Center routes
- [ ] Convert CRM routes  
- [ ] Update navigation to use Inertia Link
- [ ] Remove React Router

**Migration Phase 0 Total:** ~20 hours

After migration, integration tasks become much simpler because:
- No API layer needed
- Can use Publishing Platform controllers/services directly
- Authentication works automatically
- Data flow is simpler

---

## DETAILED TASK BREAKDOWN

### Phase 1: Authentication Integration

**If Using Inertia.js (Recommended):**
**Time:** 8 hours (much simpler!)

#### 1.1 Shared Authentication (4 hours)
- [ ] Use Laravel's session-based auth (already works with Inertia)
- [ ] Share auth user via Inertia shared props
- [ ] Use Publishing Platform's auth middleware/guards
- [ ] Test authentication flow

#### 1.2 Cross-Domain Auth (4 hours)
- [ ] Use Publishing Platform's CrossDomainAuthService
- [ ] Configure cross-domain token exchange
- [ ] Test login/logout across domains

**If Using API Integration (Alternative):**
**Time:** 30 hours

#### 1.1 Cross-Domain Authentication (8 hours)
- [ ] Review Publishing Platform `CrossDomainAuthService`
- [ ] Configure Learning Center to use Publishing Platform auth endpoints
- [ ] Set up token exchange mechanism
- [ ] Test cross-domain authentication flow
- [ ] Document authentication flow

#### 1.2 User Registration/Login (12 hours)
- [ ] Update `LoginPage.tsx` to call Publishing Platform `/api/login`
- [ ] Update `SignUpPage.tsx` to call Publishing Platform `/api/register`
- [ ] Update `api-client.ts` to handle auth tokens
- [ ] Add token refresh logic
- [ ] Update auth state management (context/store)
- [ ] Test login/logout flows
- [ ] Handle error states

#### 1.3 API Token Authentication (6 hours)
- [ ] Configure Laravel Sanctum or Publishing Platform token system
- [ ] Create token generation endpoint in Learning Center (if needed)
- [ ] Update `api-client.ts` to send tokens
- [ ] Add auth middleware to Learning Center API routes
- [ ] Test protected routes

#### 1.4 Password Reset (4 hours)
- [ ] Connect to Publishing Platform password reset endpoints
- [ ] Create password reset UI (if needed)
- [ ] Test password reset flow

---

### Phase 2: Business Profile Integration

**If Using Inertia.js (Recommended):**
**Time:** 12 hours (use Publishing Platform controllers directly!)

#### 2.1 Use Publishing Platform Business Controller (4 hours)
- [ ] Use Publishing Platform's BusinessController directly
- [ ] Map routes to Publishing Platform controllers
- [ ] Pass business data via Inertia props
- [ ] Test business listing and detail pages

#### 2.2 Integrate Business Service (4 hours)
- [ ] Use Publishing Platform's BusinessService in Learning Center controllers
- [ ] Extend for Learning Center specific logic if needed
- [ ] Update React components to use Inertia props (no API calls)
- [ ] Test CRUD operations

#### 2.3 Business Subscriptions (2 hours)
- [ ] Use Publishing Platform subscription endpoints/controllers
- [ ] Display subscription data via Inertia
- [ ] Test subscription operations

#### 2.4 Business Attributes (2 hours)
- [ ] Use Publishing Platform business attributes
- [ ] Display in Learning Center components
- [ ] Test attribute management

**If Using API Integration (Alternative):**
**Time:** 42 hours

#### 2.1 Business Model Integration (12 hours)
- [ ] Review Publishing Platform `Business` model structure
- [ ] Map Learning Center `Customer` model to Publishing Platform `Business`
- [ ] Create data transformation layer
- [ ] Update Learning Center to use Publishing Platform business endpoints
- [ ] Handle field mapping/differences
- [ ] Test business data sync

#### 2.2 Business Profile API Integration (16 hours)
- [ ] Review Publishing Platform `BusinessController` endpoints
- [ ] Review Publishing Platform `BusinessService` methods
- [ ] Update Learning Center `CustomerController` to proxy/use Publishing Platform
- [ ] Create API client methods for business operations
- [ ] Update frontend to use new endpoints
- [ ] Test CRUD operations
- [ ] Handle errors and edge cases

#### 2.3 Business Subscriptions Integration (8 hours)
- [ ] Review Publishing Platform subscription system
- [ ] Connect Learning Center subscription features
- [ ] Update subscription management UI
- [ ] Test subscription operations

#### 2.4 Business Attributes Integration (6 hours)
- [ ] Review Publishing Platform business attributes structure
- [ ] Map Learning Center customer profile fields
- [ ] Integrate attributes API
- [ ] Update profile management UI

---

### Phase 3: Payment & Billing Integration

**If Using Inertia.js (Recommended):**
**Time:** 12 hours

#### 3.1 Use Publishing Platform Payment Controllers (4 hours)
- [ ] Use Publishing Platform's OrderController
- [ ] Use Publishing Platform's StripeWebhookController  
- [ ] Handle payments via Inertia form submissions
- [ ] Test payment flow

#### 3.2 Order Management (4 hours)
- [ ] Use Publishing Platform order controllers
- [ ] Display orders via Inertia props
- [ ] Test order creation/management

#### 3.3 Subscription Billing (4 hours)
- [ ] Use Publishing Platform subscription billing
- [ ] Integrate subscription management
- [ ] Test billing cycles

**If Using API Integration (Alternative):**
**Time:** 38 hours

#### 3.1 Stripe Integration (16 hours)
- [ ] Review Publishing Platform `StripeConnectService`
- [ ] Review Publishing Platform `StripeWebhookController`
- [ ] Integrate Learning Center payment processing
- [ ] Update `OrderController` to use Publishing Platform payment endpoints
- [ ] Configure webhook handling
- [ ] Test payment flows
- [ ] Handle payment errors

#### 3.2 Order Management Integration (12 hours)
- [ ] Review Publishing Platform `OrderController`
- [ ] Integrate order management
- [ ] Update Learning Center order processing
- [ ] Sync order status
- [ ] Test order flows

#### 3.3 Subscription Billing Integration (10 hours)
- [ ] Review Publishing Platform subscription billing
- [ ] Integrate subscription payment processing
- [ ] Update subscription management
- [ ] Test billing cycles

---

### Phase 4: Notification System Integration (24 hours)

#### 4.1 Notification Service Integration (10 hours)
- [ ] Review Publishing Platform `NotificationService`
- [ ] Integrate notification endpoints
- [ ] Create notification UI components
- [ ] Set up notification preferences
- [ ] Test notifications

#### 4.2 Email Notification Integration (8 hours)
- [ ] Review Publishing Platform `EmailDeliveryService`
- [ ] Integrate email sending
- [ ] Configure email templates
- [ ] Test email delivery

#### 4.3 SMS Notification Integration (6 hours)
- [ ] Review Publishing Platform `SmsService`
- [ ] Integrate SMS sending
- [ ] Configure SMS templates
- [ ] Test SMS delivery

---

### Phase 5: File Upload & Storage Integration (20 hours)

#### 5.1 File Upload Service Integration (12 hours)
- [ ] Identify Publishing Platform file upload endpoints
- [ ] Integrate file upload
- [ ] Update file management UI
- [ ] Test file uploads
- [ ] Handle file storage

#### 5.2 Image/Asset Management (8 hours)
- [ ] Review Publishing Platform image handling
- [ ] Integrate image services
- [ ] Update asset management
- [ ] Test image operations

---

### Phase 6: Additional Service Integrations (22 hours)

#### 6.1 Search Service Integration (8 hours)
- [ ] Evaluate Publishing Platform `SearchService`
- [ ] Integrate if beneficial for Learning Center
- [ ] Enhance search capabilities

#### 6.2 Location/Geocoding Integration (6 hours)
- [ ] Review Publishing Platform `LocationService` and `GeocodingService`
- [ ] Integrate location services
- [ ] Use for customer locations

#### 6.3 Profile Service Integration (8 hours)
- [ ] Review Publishing Platform `ProfileService`
- [ ] Connect `ProfilePage.tsx` to Publishing Platform
- [ ] Update profile management
- [ ] Test profile operations

---

## PUBLISHING PLATFORM API REQUIREMENTS

To enable Learning Center integration, the Publishing Platform should expose/configure:

### Authentication APIs
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/password/reset`
- `POST /api/auth/token/refresh`
- `GET /api/auth/user`

### Business APIs
- `GET /api/businesses`
- `GET /api/businesses/{id}`
- `POST /api/businesses`
- `PUT /api/businesses/{id}`
- `DELETE /api/businesses/{id}`
- `GET /api/businesses/{id}/subscriptions`
- `GET /api/businesses/{id}/attributes`

### Payment APIs
- `POST /api/payments/process`
- `GET /api/orders/{id}`
- `POST /api/subscriptions/{id}/billing`

### Notification APIs
- `GET /api/notifications`
- `POST /api/notifications/send`
- `PUT /api/notifications/preferences`

### File APIs
- `POST /api/files/upload`
- `GET /api/files/{id}`
- `DELETE /api/files/{id}`

**Note:** These endpoints may already exist in Publishing Platform - need to verify and document actual endpoints.

---

## TECHNICAL INTEGRATION DETAILS

### Approach 1: Inertia.js Integration (Recommended)

#### Step 1: Install Inertia.js in Learning Center

```bash
cd backend
composer require inertiajs/inertia-laravel
composer require tightenco/ziggy --dev
npm install @inertiajs/react @inertiajs/inertia
npm install @types/react @types/react-dom
```

#### Step 2: Configure Inertia Middleware

Update `backend/app/Http/Kernel.php` or `bootstrap/app.php`:

```php
// Add Inertia middleware
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \Inertia\Middleware\HandleInertiaRequests::class,
    ]);
})
```

#### Step 3: Create Inertia Root Component

Create `src/app.tsx`:

```tsx
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import '../css/app.css';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
    return pages[`./pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
```

#### Step 4: Convert Routes to Inertia

**Before (React Router + API):**
```tsx
// src/AppRouter.tsx
<Route path="/customers/:id" element={<CustomerDetailPage />} />

// src/pages/CustomerDetailPage.tsx
useEffect(() => {
  apiClient.get(`/api/customers/${id}`).then(setCustomer);
}, [id]);
```

**After (Inertia):**
```php
// backend/routes/web.php
Route::get('/customers/{customer}', [CustomerController::class, 'show'])
    ->name('customers.show');
```

```php
// backend/app/Http/Controllers/CustomerController.php
use App\Services\BusinessService; // From Publishing Platform
use Inertia\Inertia;

public function show(Request $request, string $id): Response
{
    // Use Publishing Platform's BusinessService directly!
    $businessService = app(BusinessService::class);
    $business = $businessService->find($id);
    
    return Inertia::render('Customers/Show', [
        'customer' => $business, // Pass data directly to React
    ]);
}
```

```tsx
// src/pages/Customers/Show.tsx
import { PageProps } from '@inertiajs/react';

interface Props extends PageProps {
  customer: Business;
}

export default function Show({ customer }: Props) {
  // Data is already available, no API call needed!
  return <div>{customer.name}</div>;
}
```

#### Step 5: Share Publishing Platform Code

**Option A: Composer Package** (Recommended for clean separation)

Create a shared package or use Publishing Platform as a dependency:

```json
// backend/composer.json
{
  "repositories": [
    {
      "type": "path",
      "url": "../../Day-News/Multisite"
    }
  ],
  "require": {
    "fibonacco/publishing-platform": "*"
  }
}
```

Then use services directly:

```php
use PublishingPlatform\Services\BusinessService;
use PublishingPlatform\Models\Business;

// Use Publishing Platform services/models directly
$business = Business::find($id);
$businessService = app(BusinessService::class);
```

**Option B: Shared Services** (For tight integration)

Copy/use Publishing Platform services directly in Learning Center:

```php
// backend/app/Services/BusinessService.php
// Use Publishing Platform's BusinessService
// Or extend it for Learning Center specific logic
```

#### Step 6: Authentication Integration

With Inertia, authentication is much simpler:

```php
// backend/app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        'auth' => [
            'user' => $request->user(), // Laravel auth works automatically
        ],
        // Share from Publishing Platform if needed
        'currentWorkspace' => $request->user()?->currentWorkspace,
    ];
}
```

```tsx
// Use in React components
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
  const { auth } = usePage().props;
  return <div>Welcome, {auth.user.name}</div>;
}
```

#### Step 7: Cross-Domain Navigation

Use Inertia's router for navigation between systems:

```tsx
import { router } from '@inertiajs/react';

// Navigate to Publishing Platform
router.visit('https://publishing-platform.com/businesses/123', {
  // Pass data if needed
  data: { source: 'learning-center' },
});
```

Or use Inertia's Link component:

```tsx
import { Link } from '@inertiajs/react';

<Link href="https://publishing-platform.com/businesses/123">
  View in Publishing Platform
</Link>
```

### Approach 2: API Integration (Alternative - if not using Inertia)

#### API Client Configuration

Update `src/services/learning/api-client.ts`:

```typescript
// Add Publishing Platform base URL
const PUBLISHING_PLATFORM_API = import.meta.env.VITE_PUBLISHING_PLATFORM_API_URL || 'https://api.publishing-platform.com';

// Add methods to call Publishing Platform APIs
export const publishingPlatformApi = {
  // Auth
  login: (email: string, password: string) => { /* ... */ },
  register: (data: RegisterData) => { /* ... */ },
  
  // Business
  getBusiness: (id: string) => { /* ... */ },
  updateBusiness: (id: string, data: BusinessData) => { /* ... */ },
  
  // Payment
  processPayment: (orderId: string, paymentData: PaymentData) => { /* ... */ },
  
  // ... other methods
};
```

#### Backend API Proxying

Update Learning Center controllers to proxy to Publishing Platform:

```php
// Example: CustomerController.php
public function show(Request $request, string $id): JsonResponse
{
    // Proxy to Publishing Platform
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $request->bearerToken(),
    ])->get("{$publishingPlatformUrl}/api/businesses/{$id}");
    
    // Transform Publishing Platform response to Learning Center format
    return response()->json(['data' => $this->transformBusinessData($response->json())]);
}
```

---

## DATABASE INTEGRATION CONSIDERATIONS

### Option A: Separate Databases (Recommended)
- Learning Center has its own database
- Publishes to Publishing Platform via API
- Pros: Isolation, independent deployment
- Cons: Data sync complexity

### Option B: Shared Database Access
- Learning Center can read from Publishing Platform tables
- Direct database queries for shared data
- Pros: Direct access, no API overhead
- Cons: Tight coupling, deployment coordination

**Recommendation:** Use **Option A (API-based)** initially, consider Option B for read-heavy operations if performance requires it.

---

## CONFIGURATION REQUIREMENTS

### Environment Variables Needed

```env
# Publishing Platform Integration
PUBLISHING_PLATFORM_API_URL=https://api.publishing-platform.com
PUBLISHING_PLATFORM_API_KEY=...
PUBLISHING_PLATFORM_AUTH_ENDPOINT=/api/auth
PUBLISHING_PLATFORM_BUSINESS_ENDPOINT=/api/businesses
PUBLISHING_PLATFORM_PAYMENT_ENDPOINT=/api/payments

# Cross-domain settings
CROSS_DOMAIN_AUTH_ENABLED=true
SHARED_SESSION_DOMAIN=.fibonacco.com  # If using shared session
```

---

## TESTING REQUIREMENTS

### Integration Tests Needed

1. **Authentication Tests**
   - Test login flow with Publishing Platform
   - Test registration flow
   - Test token refresh
   - Test protected route access

2. **Business Integration Tests**
   - Test business data retrieval
   - Test business data updates
   - Test data transformation

3. **Payment Integration Tests**
   - Test payment processing
   - Test webhook handling
   - Test order creation

4. **Notification Tests**
   - Test notification sending
   - Test notification preferences

---

## RISKS & MITIGATION

### Risks

1. **API Changes in Publishing Platform**
   - **Mitigation:** Version APIs, maintain API contracts, document changes

2. **Performance/Network Latency**
   - **Mitigation:** Implement caching, consider shared database for reads if needed

3. **Data Schema Differences**
   - **Mitigation:** Create transformation layer, map fields clearly

4. **Deployment Coordination**
   - **Mitigation:** Independent deployments with API versioning

---

## SUCCESS CRITERIA

### Phase 1 Complete When:
- ✅ Users can log in through Publishing Platform
- ✅ Users can register through Publishing Platform
- ✅ All Learning Center API routes are protected
- ✅ Auth tokens work correctly

### Phase 2 Complete When:
- ✅ Business profiles accessible in Learning Center
- ✅ Customer data synced/available
- ✅ Business attributes available
- ✅ Subscriptions accessible

### Phase 3 Complete When:
- ✅ Payments process through Publishing Platform
- ✅ Orders can be created and paid
- ✅ Subscription billing works
- ✅ Webhooks handled correctly

### Phase 4 Complete When:
- ✅ Notifications sent through Publishing Platform
- ✅ Email notifications work
- ✅ SMS notifications work (if applicable)

### Phase 5 Complete When:
- ✅ File uploads work
- ✅ Files accessible
- ✅ Image management functional

---

## TIMELINE ESTIMATE

### Option 1: Inertia.js Integration (Recommended)

| Phase | Tasks | Estimated Hours | Timeline |
|-------|-------|----------------|----------|
| Migration: Inertia Setup | 5 tasks | 20 hours | Week 1 |
| Phase 1: Auth | 4 tasks | 8 hours | Week 1-2 |
| Phase 2: Business | 4 tasks | 12 hours | Week 2 |
| Phase 3: Payment | 3 tasks | 12 hours | Week 2-3 |
| Phase 4: Notifications | 3 tasks | 10 hours | Week 3 |
| Phase 5: File Upload | 2 tasks | 8 hours | Week 3 |
| Phase 6: Additional | 3 tasks | 10 hours | Week 3-4 |
| **TOTAL** | **24 tasks** | **80 hours** | **4 weeks** |

**Benefits:**
- ✅ 96 hours saved (55% reduction)
- ✅ Simpler architecture
- ✅ Code reuse
- ✅ Better developer experience

### Option 2: API Integration (Alternative)

| Phase | Tasks | Estimated Hours | Timeline |
|-------|-------|----------------|----------|
| Phase 1: Auth | 4 tasks | 30 hours | Week 1-2 |
| Phase 2: Business | 4 tasks | 42 hours | Week 2-3 |
| Phase 3: Payment | 3 tasks | 38 hours | Week 3-4 |
| Phase 4: Notifications | 3 tasks | 24 hours | Week 4-5 |
| Phase 5: File Upload | 2 tasks | 20 hours | Week 5 |
| Phase 6: Additional | 3 tasks | 22 hours | Week 5-6 |
| **TOTAL** | **19 tasks** | **176 hours** | **6 weeks** |

---

## NEXT IMMEDIATE STEPS

### If Using Inertia.js (Recommended):

1. **Decision: Adopt Inertia.js Integration**
   - Review this approach with team
   - Confirm alignment with architecture goals

2. **Migration Phase 0: Setup Inertia**
   - Install Inertia.js packages (Laravel + React)
   - Configure Inertia middleware
   - Convert first route to test setup

3. **Begin Integration**
   - Start using Publishing Platform controllers/services
   - Convert routes incrementally
   - Share code between systems

### If Using API Integration (Alternative):

1. **Verify Publishing Platform APIs**
   - Document actual available endpoints
   - Test API accessibility
   - Verify authentication methods

2. **Set Up API Access**
   - Configure API credentials
   - Set up CORS if needed
   - Test connectivity

3. **Begin Phase 1 (Authentication)**
   - Start with cross-domain auth setup
   - Implement login/registration integration

---

## NOTES

- This plan focuses on **Learning Center project needs**, not Publishing Platform changes
- Publishing Platform should not be modified (as per requirements)
- Integration should be via APIs where possible
- Data transformation layer needed to handle schema differences
- Consider caching to reduce API calls
- Monitor API performance and optimize as needed

---

**Status:** Ready to begin implementation

**Recommended Next Step:** Decide on Inertia.js vs API integration approach, then proceed accordingly.

---

## RECOMMENDATION SUMMARY

**Strongly Recommend: Inertia.js Integration (Option 1)**

**Why:**
1. **55% time savings** - 80 hours vs 176 hours
2. **Code reuse** - Share controllers, services, models directly
3. **Simpler architecture** - No API layer, direct data passing
4. **Better DX** - Type-safe props, easier debugging
5. **Matches Publishing Platform** - Same architecture pattern
6. **Easier maintenance** - Single pattern, less code to maintain
7. **Authentication simplicity** - Laravel sessions work automatically

**Trade-offs:**
- Initial migration effort (~20 hours) to convert to Inertia
- Tighter coupling between frontend and backend (but this is actually beneficial for this use case)
- Both apps need to deploy together (but this is manageable with proper CI/CD)

**Verdict:** The benefits far outweigh the costs. Inertia.js integration is the clear winner for this project.

