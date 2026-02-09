# MODULE 1: KEY DECISIONS & INCONSISTENCY RESOLUTIONS

**Date:** December 2024  
**Purpose:** Document decisions made to resolve inconsistencies

---

# NAMING CONVENTION DECISION

## Issue
- MODULE-1 spec uses "SMB" terminology
- Existing codebase uses "Customer" model name
- Inconsistency between spec and implementation

## Decision: **Keep "Customer" Model Name**

**Rationale:**
1. "Customer" model already exists and is in use
2. Changing model name would break existing code
3. "Customer" is more generic and flexible
4. Can add SMB-specific fields/methods without renaming

**Implementation:**
- Keep `Customer` model name
- Add SMB-specific fields to Customer model
- Add SMB-specific methods (e.g., `isSMB()`, `getSMBTier()`)
- Use "SMB" terminology in API documentation and user-facing content
- Internal code uses "Customer" for consistency

**Example:**
```php
// Model name stays as Customer
class Customer extends Model { ... }

// But can add SMB-specific methods
public function isSMB(): bool
{
    return $this->service_model === 'smb';
}

public function getSMBTier(): int
{
    return $this->engagement_tier;
}
```

---

# DATABASE SCHEMA DECISIONS

## Issue
- Spec mentions `smbs` table
- Existing codebase has `customers` table
- Fields don't match exactly

## Decision: **Extend Existing `customers` Table**

**Rationale:**
1. Avoid data migration complexity
2. Maintain backward compatibility
3. Add new fields via migration (non-breaking)

**Implementation:**
- Use existing `customers` table
- Add SMB-specific fields via migration
- All new fields nullable or have defaults
- No breaking changes to existing data

---

# API ENDPOINT NAMING DECISION

## Issue
- Spec uses `/api/v1/smbs/*`
- Existing code uses `/api/v1/customers/*`

## Decision: **Support Both Endpoints**

**Rationale:**
1. Maintain backward compatibility
2. Allow gradual migration
3. Support both naming conventions

**Implementation:**
```php
// Support both endpoints
Route::prefix('customers')->group(function () {
    // Existing routes
});

Route::prefix('smbs')->group(function () {
    // Alias routes that point to same controllers
    Route::get('/', [CustomerController::class, 'index']);
    Route::post('/', [CustomerController::class, 'store']);
    // ... etc
});
```

**Alternative:** Use route aliasing or middleware to map `/smbs/*` to `/customers/*`

---

# ENGAGEMENT SCORE ALGORITHM DECISION

## Issue
- Spec defines specific algorithm (email opens, clicks, content views, approvals)
- Existing implementation uses different algorithm (conversations, duration, questions)

## Decision: **Implement Spec Algorithm, Keep Existing as Fallback**

**Rationale:**
1. Spec algorithm is more comprehensive
2. Better aligns with engagement tracking goals
3. Can use existing as fallback if data unavailable

**Implementation:**
```php
public function calculateScore(Customer $customer): int
{
    // Try spec algorithm first
    $score = $this->calculateSpecScore($customer);
    
    // Fallback to existing if no engagement data
    if ($score === 0 && $this->hasConversations($customer)) {
        $score = $this->calculateLegacyScore($customer);
    }
    
    return $score;
}
```

---

# EVENT SYSTEM DECISION

## Issue
- Spec defines events that don't exist
- Need to coordinate with other modules

## Decision: **Create Event Definitions, Coordinate with Modules**

**Rationale:**
1. Event-driven architecture is better for scalability
2. Allows loose coupling between modules
3. Can implement listeners even if events don't exist yet

**Implementation:**
- Create all event classes (even if not emitted yet)
- Create listeners that will work when events are emitted
- Document which modules emit which events
- Use feature flags to enable/disable listeners

---

# TIER MANAGEMENT DECISION

## Issue
- Spec defines 4 tiers (1=Premium, 4=Passive)
- No existing tier system

## Decision: **Implement Full Tier System**

**Rationale:**
1. Core feature of MODULE-1
2. Required for engagement-based workflows
3. Enables personalized communication

**Implementation:**
- Add `engagement_tier` field (integer 1-4)
- Default to tier 4 (Passive) for new customers
- Implement tier transition logic
- Add tier-specific actions (upgrade/downgrade)

---

# CAMPAIGN STATUS DECISION

## Issue
- Spec defines Manifest Destiny campaign tracking
- No existing campaign status system

## Decision: **Implement Campaign Status System**

**Rationale:**
1. Required for 90-day campaign automation
2. Enables campaign lifecycle management
3. Core feature of MODULE-1

**Implementation:**
- Add `campaign_status` enum field
- Add `manifest_destiny_day` (1-90)
- Add `manifest_destiny_start_date`
- Add `next_scheduled_send` timestamp
- Implement campaign management service

---

# BULK OPERATIONS DECISION

## Issue
- Spec requires CSV/JSON import
- No existing bulk import for customers

## Decision: **Implement Full Bulk Operations**

**Rationale:**
1. Required for initial data loading
2. Enables efficient data management
3. Common requirement for CRM systems

**Implementation:**
- Create ImportSMBs job
- Support CSV and JSON formats
- Queue-based processing for large imports
- Status tracking via job batches
- Bulk update endpoint for mass changes

---

# TESTING STRATEGY DECISION

## Issue
- Spec requires 80% test coverage
- Current coverage is low

## Decision: **Implement Comprehensive Testing**

**Rationale:**
1. Required by spec
2. Ensures code quality
3. Prevents regressions

**Implementation:**
- Feature tests for all API endpoints
- Unit tests for all services
- Integration tests for tier transitions
- Test factories for all models
- Aim for 80%+ coverage

---

# MIGRATION STRATEGY DECISION

## Issue
- Need to add many fields without breaking existing data

## Decision: **Use Non-Breaking Migrations**

**Rationale:**
1. Maintain backward compatibility
2. Allow gradual rollout
3. Minimize risk

**Implementation:**
- All new fields nullable or have defaults
- No required fields added
- Foreign keys use `onDelete('set null')`
- Can rollback safely

---

# SUMMARY OF DECISIONS

| Decision | Choice | Reason |
|----------|--------|--------|
| Model Name | Keep "Customer" | Backward compatibility |
| Table Name | Extend "customers" | Avoid migration complexity |
| API Endpoints | Support both `/customers/*` and `/smbs/*` | Gradual migration |
| Engagement Algorithm | Implement spec algorithm | Better alignment |
| Event System | Create all events/listeners | Future-proof |
| Tier System | Full implementation | Core feature |
| Campaign Status | Full implementation | Core feature |
| Bulk Operations | Full implementation | Required feature |
| Testing | Comprehensive (80%+) | Quality assurance |
| Migration Strategy | Non-breaking | Risk mitigation |

---

# RESOLVED INCONSISTENCIES

1. ✅ **Customer vs SMB naming** - Keep Customer, add SMB methods
2. ✅ **Table naming** - Use customers table, add SMB fields
3. ✅ **API endpoints** - Support both naming conventions
4. ✅ **Engagement algorithm** - Implement spec algorithm
5. ✅ **Missing fields** - Add via migration
6. ✅ **Missing models** - Create Community model
7. ✅ **Missing services** - Create all required services
8. ✅ **Missing events** - Create event system
9. ✅ **Missing jobs** - Create scheduled jobs
10. ✅ **Missing tests** - Implement comprehensive testing

---

# NEXT STEPS

1. Review implementation plan
2. Start with Phase 1 (Database & Models)
3. Follow plan sequentially
4. Test as you build
5. Document as you go



