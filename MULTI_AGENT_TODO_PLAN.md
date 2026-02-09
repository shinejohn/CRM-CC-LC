# Multi-Agent TODO Completion Plan
## Breaking Down Remaining TODOs for Parallel Execution

**Date:** January 2025  
**Status:** 🎯 Ready for Multi-Agent Execution  
**Total Tasks:** 8 tasks across 2 main TODOs  
**Estimated Total Effort:** 4-7 hours  
**Recommended Agents:** 2-3 agents

---

## Overview

This plan breaks down the 2 remaining TODOs into independent, parallel-executable tasks that can be assigned to different agents.

### Remaining TODOs:
1. **Guide Download** (`LandingPage.tsx:160`) - High Priority
2. **Contact Sales** (`LandingPage.tsx:184`) - High Priority

---

## Task Breakdown Strategy

### Approach:
- **Backend tasks** → Agent A (API/Service layer)
- **Frontend tasks** → Agent B (UI/Component layer)
- **Integration tasks** → Agent C (Integration/Testing)

### Dependencies:
- Backend must be done before frontend integration
- Frontend components can be built in parallel with backend
- Integration happens after both are complete

---

## TODO #1: Guide Download Implementation

### Task Breakdown

#### 🔵 Agent A: Backend/API Tasks (2-3 hours)

**Task A1: Create Guide Download API Endpoint**
- **File:** Backend API (Lambda/Express route)
- **Location:** `/learning/campaigns/{id}/guide`
- **Method:** `GET`
- **Requirements:**
  - Accept campaign ID
  - Generate or fetch guide PDF/document
  - Return download URL or file stream
  - Handle errors gracefully
- **Deliverable:** Working API endpoint
- **Dependencies:** None
- **Estimated Time:** 1-2 hours

**Task A2: Add downloadGuide Method to campaign-api.ts**
- **File:** `src/services/learning/campaign-api.ts`
- **Location:** Add new method to `campaignApi` object
- **Requirements:**
  - Method signature: `downloadGuide(campaignId: string): Promise<string>`
  - Call backend API endpoint
  - Return download URL
  - Handle errors
  - Type-safe implementation
- **Deliverable:** New API method in campaign-api.ts
- **Dependencies:** Task A1 (API endpoint must exist)
- **Estimated Time:** 30 minutes

---

#### 🟢 Agent B: Frontend/UI Tasks (1-2 hours)

**Task B1: Create Guide Download Utility Function**
- **File:** `src/utils/download-helper.ts` (new file)
- **Requirements:**
  - Function: `triggerDownload(url: string, filename: string): void`
  - Create temporary anchor element
  - Trigger browser download
  - Clean up DOM element
  - Handle errors
- **Deliverable:** Reusable download utility
- **Dependencies:** None
- **Estimated Time:** 30 minutes

**Task B2: Implement Guide Download Handler**
- **File:** `src/pages/LearningCenter/Campaign/LandingPage.tsx`
- **Location:** Replace TODO at line 160
- **Requirements:**
  - Call `campaignApi.downloadGuide()`
  - Use download utility to trigger download
  - Add loading state
  - Add error handling with user feedback
  - Track download analytics
  - Add screen reader announcement
  - Remove console.log
- **Deliverable:** Complete guide download implementation
- **Dependencies:** Task A2, Task B1
- **Estimated Time:** 1 hour

---

#### 🟡 Agent C: Integration/Testing (30 minutes)

**Task C1: Test Guide Download Flow**
- **Requirements:**
  - Test successful download
  - Test error handling
  - Test analytics tracking
  - Test accessibility (screen reader)
  - Verify file downloads correctly
- **Deliverable:** Tested and verified functionality
- **Dependencies:** Task B2
- **Estimated Time:** 30 minutes

---

## TODO #2: Contact Sales Implementation

### Task Breakdown

#### 🔵 Agent A: Backend/API Tasks (1-2 hours)

**Task A3: Create Contact Form Submission API**
- **File:** Backend API (Lambda/Express route)
- **Location:** `/learning/contact/sales` or `/contact/sales`
- **Method:** `POST`
- **Requirements:**
  - Accept form data (name, email, company, message, campaign context)
  - Validate input
  - Send email notification
  - Store in database (optional)
  - Return success/error response
- **Deliverable:** Working API endpoint
- **Dependencies:** None
- **Estimated Time:** 1-2 hours

**Task A4: Add contactSales Method to API Service**
- **File:** Create `src/services/learning/contact-api.ts` OR add to existing service
- **Requirements:**
  - Method: `contactSales(data: ContactFormData): Promise<void>`
  - Type-safe ContactFormData interface
  - Call backend API
  - Handle errors
- **Deliverable:** New API service method
- **Dependencies:** Task A3
- **Estimated Time:** 30 minutes

---

#### 🟢 Agent B: Frontend/UI Tasks (2-3 hours)

**Task B3: Create Contact Form Modal Component**
- **File:** `src/components/LearningCenter/Campaign/ContactSalesModal.tsx` (new file)
- **Requirements:**
  - Modal component with form
  - Fields: Name, Email, Company, Phone (optional), Message
  - Campaign context display (read-only)
  - Form validation
  - Loading state
  - Error handling
  - Success message
  - Accessibility (ARIA labels, keyboard navigation)
  - Close button
- **Deliverable:** Reusable contact form modal
- **Dependencies:** None (can use existing modal patterns)
- **Estimated Time:** 1.5-2 hours

**Task B4: Implement Contact Sales Handler**
- **File:** `src/pages/LearningCenter/Campaign/LandingPage.tsx`
- **Location:** Replace TODO at line 184
- **Requirements:**
  - Add state for modal open/close
  - Import ContactSalesModal component
  - Open modal on CTA click
  - Pass campaign context to modal
  - Handle form submission
  - Track analytics
  - Add screen reader announcement
  - Remove console.log
- **Deliverable:** Complete contact sales implementation
- **Dependencies:** Task A4, Task B3
- **Estimated Time:** 1 hour

---

#### 🟡 Agent C: Integration/Testing (30 minutes)

**Task C2: Test Contact Sales Flow**
- **Requirements:**
  - Test modal opens/closes
  - Test form validation
  - Test form submission
  - Test error handling
  - Test success flow
  - Test analytics tracking
  - Test accessibility
- **Deliverable:** Tested and verified functionality
- **Dependencies:** Task B4
- **Estimated Time:** 30 minutes

---

## Recommended Agent Assignment

### Option 1: 2-Agent Split (Recommended)

**Agent 1: Backend Specialist**
- Task A1: Guide Download API Endpoint
- Task A2: downloadGuide API Method
- Task A3: Contact Sales API Endpoint
- Task A4: contactSales API Method
- **Total Estimated Time:** 3-5 hours
- **Can Start:** Immediately (no dependencies)

**Agent 2: Frontend Specialist**
- Task B1: Download Utility Function
- Task B2: Guide Download Handler
- Task B3: Contact Form Modal Component
- Task B4: Contact Sales Handler
- **Total Estimated Time:** 3-4 hours
- **Can Start:** After Agent 1 completes A2 and A4 (or can build components in parallel)

**Agent 3: QA/Integration (Optional)**
- Task C1: Test Guide Download
- Task C2: Test Contact Sales
- **Total Estimated Time:** 1 hour
- **Can Start:** After Agent 2 completes B2 and B4

---

### Option 2: 3-Agent Split (Faster Parallel Execution)

**Agent A: Backend API**
- Task A1: Guide Download API
- Task A3: Contact Sales API
- **Total Estimated Time:** 2-4 hours
- **Can Start:** Immediately

**Agent B: Frontend Components**
- Task B1: Download Utility
- Task B3: Contact Form Modal
- **Total Estimated Time:** 2-2.5 hours
- **Can Start:** Immediately (no dependencies)

**Agent C: Integration**
- Task A2: downloadGuide API Method (after A1)
- Task A4: contactSales API Method (after A3)
- Task B2: Guide Download Handler (after A2, B1)
- Task B4: Contact Sales Handler (after A4, B3)
- Task C1: Test Guide Download
- Task C2: Test Contact Sales
- **Total Estimated Time:** 3-4 hours
- **Can Start:** After A and B complete their initial tasks

---

## Detailed Task Specifications

### Task A1: Guide Download API Endpoint

**Backend Implementation:**
```typescript
// Example Lambda/Express handler
GET /learning/campaigns/:campaignId/guide

// Response:
{
  download_url: string,  // S3 URL or CDN URL
  filename: string,      // e.g., "seo-reality-check-guide.pdf"
  expires_at?: string    // Optional expiration
}
```

**Requirements:**
- Generate guide PDF from campaign data OR fetch from storage
- Return signed URL if using S3
- Handle campaign not found errors
- Handle guide generation failures
- Add CORS headers if needed

**Acceptance Criteria:**
- ✅ Endpoint returns valid download URL
- ✅ Handles errors gracefully
- ✅ Returns appropriate HTTP status codes
- ✅ Includes proper headers

---

### Task A2: downloadGuide API Method

**File:** `src/services/learning/campaign-api.ts`

**Implementation:**
```typescript
export const campaignApi = {
  // ... existing methods ...
  
  downloadGuide: async (campaignId: string): Promise<string> => {
    const response = await apiClient.get<{ download_url: string; filename: string }>(
      `/learning/campaigns/${campaignId}/guide`
    );
    return response.download_url;
  },
};
```

**Acceptance Criteria:**
- ✅ Method added to campaignApi
- ✅ Type-safe implementation
- ✅ Proper error handling
- ✅ Returns download URL string

---

### Task B1: Download Utility Function

**File:** `src/utils/download-helper.ts` (new file)

**Implementation:**
```typescript
export const triggerDownload = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(link);
      resolve();
    }, 100);
    
    // Handle errors
    link.onerror = () => {
      document.body.removeChild(link);
      reject(new Error('Download failed'));
    };
  });
};
```

**Acceptance Criteria:**
- ✅ Function triggers browser download
- ✅ Cleans up DOM elements
- ✅ Handles errors
- ✅ Returns Promise for async handling

---

### Task B2: Guide Download Handler

**File:** `src/pages/LearningCenter/Campaign/LandingPage.tsx`

**Replace:**
```typescript
case 'download_guide':
  // TODO: Trigger guide download
  console.log('Download guide');
  break;
```

**With:**
```typescript
case 'download_guide':
  try {
    setLoading(true);
    const downloadUrl = await campaignApi.downloadGuide(landing_page.campaign_id);
    const filename = `${campaignData.campaign.title.replace(/\s+/g, '-').toLowerCase()}-guide.pdf`;
    await triggerDownload(downloadUrl, filename);
    
    // Track download
    trackLandingPageView(slug!, undefined, undefined, undefined, {
      goal: 'guide_download',
      campaign: landing_page.campaign_id,
    }).catch((err) => console.error('Failed to track download:', err));
    
    announceToScreenReader('Guide download started');
  } catch (error) {
    console.error('Failed to download guide:', error);
    announceToScreenReader('Failed to download guide. Please try again.', 'assertive');
    // TODO: Show user-friendly error message
  } finally {
    setLoading(false);
  }
  break;
```

**Acceptance Criteria:**
- ✅ Replaces TODO with working implementation
- ✅ Removes console.log
- ✅ Adds error handling
- ✅ Adds analytics tracking
- ✅ Adds accessibility announcements
- ✅ Adds loading state

---

### Task A3: Contact Sales API Endpoint

**Backend Implementation:**
```typescript
POST /learning/contact/sales

// Request body:
{
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  campaign_id?: string;
  campaign_title?: string;
  source: 'campaign_landing';
}

// Response:
{
  success: boolean;
  message_id?: string;
}
```

**Requirements:**
- Validate required fields
- Send email notification to sales team
- Store in database (optional)
- Return success/error response

**Acceptance Criteria:**
- ✅ Endpoint accepts form data
- ✅ Validates input
- ✅ Sends email notification
- ✅ Returns appropriate response
- ✅ Handles errors gracefully

---

### Task A4: contactSales API Method

**File:** Create `src/services/learning/contact-api.ts` OR add to existing service

**Implementation:**
```typescript
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  campaign_id?: string;
  campaign_title?: string;
  source?: string;
}

export const contactApi = {
  contactSales: async (data: ContactFormData): Promise<void> => {
    await apiClient.post('/learning/contact/sales', data);
  },
};
```

**Acceptance Criteria:**
- ✅ Type-safe ContactFormData interface
- ✅ Method calls API endpoint
- ✅ Proper error handling
- ✅ Returns Promise<void>

---

### Task B3: Contact Form Modal Component

**File:** `src/components/LearningCenter/Campaign/ContactSalesModal.tsx` (new file)

**Component Structure:**
```typescript
interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignTitle?: string;
}

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}) => {
  // Form state, validation, submission logic
  // Modal UI with form fields
  // Loading and error states
  // Success message
};
```

**Requirements:**
- Modal overlay with form
- Form fields with validation
- Campaign context display
- Submit button with loading state
- Error message display
- Success message
- Close button
- Accessibility (ARIA labels, focus management)

**Acceptance Criteria:**
- ✅ Modal opens/closes properly
- ✅ Form validation works
- ✅ Form submission works
- ✅ Error handling works
- ✅ Success message displays
- ✅ Accessible (keyboard navigation, screen readers)
- ✅ Responsive design

---

### Task B4: Contact Sales Handler

**File:** `src/pages/LearningCenter/Campaign/LandingPage.tsx`

**Add imports:**
```typescript
import { ContactSalesModal } from '@/components/LearningCenter/Campaign/ContactSalesModal';
```

**Add state:**
```typescript
const [contactModalOpen, setContactModalOpen] = useState(false);
```

**Replace:**
```typescript
case 'contact_sales':
  // TODO: Open contact form or redirect
  console.log('Contact sales');
  break;
```

**With:**
```typescript
case 'contact_sales':
  setContactModalOpen(true);
  announceToScreenReader('Opening contact form');
  break;
```

**Add modal component:**
```typescript
{contactModalOpen && (
  <ContactSalesModal
    isOpen={contactModalOpen}
    onClose={() => setContactModalOpen(false)}
    campaignId={campaignData.landing_page.campaign_id}
    campaignTitle={campaignData.campaign.title}
  />
)}
```

**Acceptance Criteria:**
- ✅ Replaces TODO with working implementation
- ✅ Removes console.log
- ✅ Adds modal state management
- ✅ Passes campaign context to modal
- ✅ Adds accessibility announcements

---

## Execution Timeline

### Phase 1: Parallel Backend & Frontend Development (2-4 hours)

**Agent A (Backend):**
- ✅ Task A1: Guide Download API (1-2 hours)
- ✅ Task A3: Contact Sales API (1-2 hours)

**Agent B (Frontend Components):**
- ✅ Task B1: Download Utility (30 min)
- ✅ Task B3: Contact Form Modal (1.5-2 hours)

**Status:** Both agents work in parallel, no dependencies

---

### Phase 2: API Integration (1-2 hours)

**Agent A (Backend):**
- ✅ Task A2: downloadGuide API Method (30 min) - After A1
- ✅ Task A4: contactSales API Method (30 min) - After A3

**Agent B (Frontend):**
- ✅ Task B2: Guide Download Handler (1 hour) - After A2, B1
- ✅ Task B4: Contact Sales Handler (1 hour) - After A4, B3

**Status:** Sequential dependencies, but can be done by same agent or different agent

---

### Phase 3: Testing & Integration (1 hour)

**Agent C (QA/Integration):**
- ✅ Task C1: Test Guide Download (30 min)
- ✅ Task C2: Test Contact Sales (30 min)

**Status:** Final verification after all implementation complete

---

## Success Criteria

### Guide Download TODO
- ✅ User clicks "Download Guide" button
- ✅ Guide PDF downloads successfully
- ✅ Download is tracked in analytics
- ✅ Error handling works if download fails
- ✅ Screen reader announces download status
- ✅ No console.log statements remain

### Contact Sales TODO
- ✅ User clicks "Contact Sales" button
- ✅ Contact form modal opens
- ✅ Form validates input
- ✅ Form submits successfully
- ✅ Success message displays
- ✅ Email notification sent to sales team
- ✅ Analytics tracking works
- ✅ Screen reader announces form status
- ✅ No console.log statements remain

---

## File Changes Summary

### New Files to Create:
1. `src/utils/download-helper.ts` - Download utility
2. `src/components/LearningCenter/Campaign/ContactSalesModal.tsx` - Contact form modal
3. `src/services/learning/contact-api.ts` - Contact API service (if new file)

### Files to Modify:
1. `src/pages/LearningCenter/Campaign/LandingPage.tsx` - Replace 2 TODOs
2. `src/services/learning/campaign-api.ts` - Add downloadGuide method

### Backend Files (if applicable):
1. API endpoint: `/learning/campaigns/{id}/guide` (GET)
2. API endpoint: `/learning/contact/sales` (POST)

---

## Risk Mitigation

### Potential Issues:

1. **Backend API Not Ready**
   - **Mitigation:** Frontend can use mock/stub for development
   - **Fallback:** Use static file URLs temporarily

2. **Guide Generation Complexity**
   - **Mitigation:** Start with static PDF files, add generation later
   - **Fallback:** Return placeholder message

3. **Contact Form Email Service**
   - **Mitigation:** Use existing email service if available
   - **Fallback:** Store in database, send email async

4. **Integration Conflicts**
   - **Mitigation:** Clear task boundaries, use feature branches
   - **Fallback:** Sequential integration if needed

---

## Communication Plan

### Between Agents:

1. **Daily Standup:** Share progress on tasks
2. **API Contract:** Define API interfaces before implementation
3. **Integration Point:** Coordinate when backend is ready
4. **Testing:** Share test results before final integration

### Deliverables:

1. **Agent A:** API endpoints + API client methods
2. **Agent B:** UI components + integration code
3. **Agent C:** Test results + integration verification

---

## Next Steps

1. **Assign Agents:** Choose agents based on skills
2. **Create Feature Branches:** One per agent/task
3. **Define API Contracts:** Agree on interfaces
4. **Start Phase 1:** Begin parallel development
5. **Coordinate Integration:** Merge and test
6. **Verify Completion:** Ensure all TODOs resolved

---

**Plan Created:** January 2025  
**Status:** Ready for Execution  
**Estimated Completion:** 4-7 hours total (with parallel execution)






