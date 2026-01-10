# Publishing Platform API Leverage Analysis
## How Learning Center Can Leverage DayNews API Reference v2.0

**Date:** December 28, 2025  
**Source:** DayNews_Complete_API_Reference_v2.docx  
**Platform:** Learning Center (Sales, Marketing, Operations)

---

## EXECUTIVE SUMMARY

The Publishing Platform (DayNews) has a comprehensive REST API covering **164+ database tables** organized into **28 functional categories**. This document analyzes how the Learning Center platform can leverage these APIs across all its applications, with special focus on the **Command Center**.

**Key Finding:** The Publishing Platform APIs can significantly enhance Learning Center functionality, especially for:
- Command Center (content generation, publishing, ad management)
- CRM (business data, customer management)
- Outbound Campaigns (content, audience targeting)
- Business Management (subscriptions, profiles, services)
- Action Apps (Events, Articles, Classifieds, Coupons, Tickets)

---

## PUBLISHING PLATFORM API OVERVIEW

### API Structure
- **Base URL:** `https://api.day.news/v1`
- **Authentication:** Bearer token (24-hour expiration)
- **Response Format:** `{ "success": true, "data": {...}, "meta": {...} }`
- **Total Categories:** 28 functional areas
- **Total Tables:** 164+ database tables

### 28 API Categories

1. **Authentication & Users** (6 tables)
2. **Workspaces & Multi-Tenancy** (6 tables)
3. **Publishing — Articles** (7 tables)
4. **Publishing — News Workflow** (8 tables)
5. **Publishing — Content Types** (13 tables: Announcements, Classifieds, Coupons, Legal Notices, Memorials)
6. **Publishing — Media** (8 tables: Photos, Podcasts, Creator Profiles)
7. **Events & Venues** (8 tables)
8. **Ticketing System** (8 tables)
9. **Social Features** (13 tables: Posts, Comments, Friendships, Groups)
10. **Community Forums** (7 tables: Threads, Replies, Members)
11. **Messaging** (3 tables: Conversations, Messages)
12. **Notifications** (4 tables)
13. **Business Directory** (8 tables: Businesses, Subscriptions, Templates, FAQs, Surveys)
14. **CRM System** (11 tables: SMB Businesses, Customers, Deals, Campaigns, Interactions, Tasks)
15. **E-Commerce** (6 tables: Stores, Products, Carts, Orders)
16. **Calendars** (4 tables)
17. **Hubs** (6 tables: Community Hubs, Sections, Members, Analytics)
18. **Regions & Location** (2 tables)
19. **Advertising Platform** (7 tables: Campaigns, Creatives, Placements, Analytics)
20. **Email Campaigns** (4 tables: Campaigns, Templates, Subscribers, Sends)
21. **Emergency Alerts** (4 tables)
22. **Newsletter Subscriptions** (1 table)
23. **Search** (2 tables: Search History, Suggestions)
24. **RSS Feeds** (2 tables)
25. **Reviews & Ratings** (1 table)
26. **Follows & Engagement** (1 table)
27. **Organizations** (2 tables: Hierarchies, Relationships)
28. **AlphaSite Communities** (1 table)

---

## LEARNING CENTER PLATFORM STRUCTURE

### Core Applications/Modules

1. **Command Center** - Content generation, ad creation, publishing management
2. **CRM** - Customer relationship management, analytics, campaigns
3. **Outbound Campaigns** - Email, Phone, SMS campaigns
4. **Learning Center** - Knowledge base, FAQs, Surveys, Presentations
5. **Business** - Business profiles, subscriptions, todos
6. **Marketing** - Ads, Community influencers, Sponsors
7. **Action Apps** - Articles, Events, Classifieds, Announcements, Coupons, Tickets, AI
8. **AI Personalities** - AI personality management and assignments

---

## LEVERAGE ANALYSIS BY LEARNING CENTER APPLICATION

---

## 1. COMMAND CENTER

**Current State:** Learning Center has a Command Center with:
- Content Generation API (`/api/v1/content/*`)
- Ad Generation API (`/api/v1/ads/*`)
- Publishing API (`/api/v1/publishing/*`)

### ✅ Publishing Platform APIs to Leverage:

#### 1.1 Publishing — Articles APIs

**Endpoint:** `/posts`, `/posts/{id}`, `/posts/{slug}`

**Use Cases:**
- **Content Publishing:** Publish generated content from Learning Center directly to Publishing Platform
- **Content Sync:** Sync published articles from Command Center to DayNews posts
- **Regional Distribution:** Use `/posts/{id}/regions` to distribute content across regions
- **Tagging:** Use `/tags` and `/posts/{id}/tags` to tag generated content
- **Featured/Trending:** Use `/posts/featured` and `/posts/trending` for content promotion

**Integration:**
```typescript
// After generating content in Command Center
const publishToDayNews = async (contentId: string, regions: string[]) => {
  const content = await getContent(contentId);
  
  // Create post in Publishing Platform
  const post = await publishingApi.post('/posts', {
    title: content.title,
    content: content.content,
    excerpt: content.excerpt,
    status: 'published',
    // ... other fields
  });
  
  // Add regional distribution
  await publishingApi.post(`/posts/${post.id}/regions`, { regions });
  
  // Tag content
  await publishingApi.post(`/posts/${post.id}/tags`, { tags: content.metadata.tags });
};
```

**Priority:** 🔴 **HIGH** - Core integration for Command Center publishing workflow

---

#### 1.2 News Workflow APIs

**Endpoints:** `/news-articles`, `/writer-agents`, `/workflow-runs`

**Use Cases:**
- **AI Content Generation:** Leverage Publishing Platform's writer agents for content generation
- **Workflow Automation:** Integrate with Publishing Platform's news workflow system
- **Fact Checking:** Use `/news-articles/{id}/fact-checks` for content validation
- **Draft Management:** Use `/news-articles/{id}/drafts` for version control

**Integration:**
```typescript
// Use Publishing Platform writer agents in Command Center
const generateWithWriterAgent = async (agentId: string, topic: string) => {
  // Trigger Publishing Platform workflow
  const workflowRun = await publishingApi.post('/workflow-runs/trigger', {
    writer_agent_id: agentId,
    topic: topic,
    // ... other params
  });
  
  // Poll for completion and get generated article
  const article = await waitForWorkflowCompletion(workflowRun.id);
  return article;
};
```

**Priority:** 🟡 **MEDIUM** - Useful for AI-powered content generation

---

#### 1.3 Advertising Platform APIs

**Endpoints:** `/ad-campaigns`, `/ad-creatives`, `/ad-placements`, `/ads/{id}`

**Use Cases:**
- **Ad Distribution:** Publish generated ads from Learning Center to Publishing Platform ad system
- **Campaign Management:** Sync ad campaigns between systems
- **Analytics Integration:** Get ad performance data from Publishing Platform
- **Inventory Management:** Check ad inventory availability via `/ad-inventory`

**Integration:**
```typescript
// Publish generated ad to Publishing Platform
const publishAdToDayNews = async (adId: string) => {
  const ad = await getAd(adId);
  
  // Create ad creative in Publishing Platform
  const creative = await publishingApi.post('/ad-creatives', {
    name: ad.name,
    headline: ad.headline,
    description: ad.description,
    call_to_action: ad.call_to_action,
    media_urls: ad.media_urls,
    // ... other fields
  });
  
  // Create ad campaign
  const campaign = await publishingApi.post('/ad-campaigns', {
    name: `${ad.name} Campaign`,
    creative_id: creative.id,
    // ... targeting, budget, schedule
  });
  
  return campaign;
};
```

**Priority:** 🔴 **HIGH** - Direct integration for ad publishing

---

#### 1.4 Email Campaign APIs

**Endpoints:** `/email-campaigns`, `/email-templates`, `/email-subscribers`

**Use Cases:**
- **Email Distribution:** Send generated emails from Command Center via Publishing Platform
- **Template Reuse:** Use Publishing Platform email templates in Learning Center
- **Subscriber Management:** Sync subscriber lists between systems
- **Campaign Analytics:** Get email campaign performance from Publishing Platform

**Integration:**
```typescript
// Send email campaign through Publishing Platform
const sendEmailCampaign = async (campaignId: string) => {
  const campaign = await getCampaign(campaignId);
  
  // Create email campaign in Publishing Platform
  const emailCampaign = await publishingApi.post('/email-campaigns', {
    name: campaign.name,
    template_id: campaign.template_id,
    recipients: campaign.recipients,
    // ... other fields
  });
  
  // Send campaign
  await publishingApi.post(`/email-campaigns/${emailCampaign.id}/send`);
};
```

**Priority:** 🟡 **MEDIUM** - Useful for email distribution

---

#### 1.5 Media APIs

**Endpoints:** `/photos`, `/photo-albums`, `/podcasts`, `/podcast-episodes`

**Use Cases:**
- **Media Storage:** Store images/media from Command Center in Publishing Platform
- **Photo Albums:** Organize generated content images into albums
- **Podcast Integration:** Publish podcasts from Command Center content
- **Media Management:** Centralized media library access

**Priority:** 🟢 **LOW** - Nice to have for media management

---

### Command Center Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Publishing — Articles** | 🔴 HIGH | Publish generated content | Direct content publishing |
| **Advertising Platform** | 🔴 HIGH | Publish generated ads | Ad distribution & analytics |
| **News Workflow** | 🟡 MEDIUM | AI content generation | Workflow automation |
| **Email Campaigns** | 🟡 MEDIUM | Email distribution | Email sending infrastructure |
| **Media** | 🟢 LOW | Media storage | Centralized media library |

---

## 2. CRM APPLICATION

**Current State:** Learning Center has CRM with:
- Customer management (`/api/v1/customers/*`)
- CRM Analytics (`/api/v1/crm/analytics/*`)
- Campaign management (`/api/v1/crm/campaigns/*`)

### ✅ Publishing Platform APIs to Leverage:

#### 2.1 CRM System APIs

**Endpoints:** `/crm/businesses`, `/crm/customers`, `/crm/deals`, `/crm/interactions`, `/crm/tasks`

**Use Cases:**
- **Customer Data Sync:** Sync customers between Learning Center and Publishing Platform CRM
- **Deal Pipeline:** Use Publishing Platform deals/pipeline for sales management
- **Interaction Logging:** Log all customer interactions in Publishing Platform
- **Task Management:** Sync tasks between systems

**Integration:**
```typescript
// Sync customer from Learning Center to Publishing Platform
const syncCustomer = async (customerId: string) => {
  const customer = await learningCenterApi.get(`/customers/${customerId}`);
  
  // Create/update in Publishing Platform CRM
  const crmCustomer = await publishingApi.post('/crm/customers', {
    name: customer.business_name,
    email: customer.email,
    phone: customer.phone,
    // ... map other fields
  });
  
  return crmCustomer;
};

// Log interaction in Publishing Platform
const logInteraction = async (customerId: string, interaction: any) => {
  await publishingApi.post('/crm/interactions', {
    customer_id: customerId,
    type: interaction.type,
    notes: interaction.notes,
    // ... other fields
  });
};
```

**Priority:** 🔴 **HIGH** - Core CRM integration

---

#### 2.2 Business Directory APIs

**Endpoints:** `/businesses`, `/businesses/{id}`, `/businesses/{id}/subscription`

**Use Cases:**
- **Business Data:** Access comprehensive business data from Publishing Platform
- **Subscription Management:** Manage business subscriptions via Publishing Platform
- **Business Attributes:** Get business details (hours, photos, reviews, attributes)
- **Regional Targeting:** Use business regions for targeting

**Integration:**
```typescript
// Get business data from Publishing Platform
const getBusinessData = async (businessId: string) => {
  const business = await publishingApi.get(`/businesses/${businessId}`);
  const subscription = await publishingApi.get(`/businesses/${businessId}/subscription`);
  const attributes = await publishingApi.get(`/businesses/${businessId}/attributes`);
  
  return {
    business,
    subscription,
    attributes,
  };
};
```

**Priority:** 🔴 **HIGH** - Essential for business data access

---

#### 2.3 Deals & Pipeline APIs

**Endpoints:** `/crm/deals`, `/crm/pipeline`

**Use Cases:**
- **Sales Pipeline:** Use Publishing Platform pipeline for sales management
- **Deal Tracking:** Track deals through stages
- **Pipeline Analytics:** Get pipeline metrics and forecasts

**Integration:**
```typescript
// Create deal in Publishing Platform pipeline
const createDeal = async (customerId: string, dealData: any) => {
  const deal = await publishingApi.post('/crm/deals', {
    customer_id: customerId,
    title: dealData.title,
    value: dealData.value,
    stage: 'new',
    // ... other fields
  });
  
  return deal;
};

// Get pipeline view
const getPipeline = async () => {
  const pipeline = await publishingApi.get('/crm/pipeline');
  return pipeline; // Returns deals organized by stage
};
```

**Priority:** 🟡 **MEDIUM** - If Learning Center needs pipeline management

---

#### 2.4 Campaign APIs (CRM)

**Endpoints:** `/crm/campaigns`, `/crm/campaigns/{id}/recipients`

**Use Cases:**
- **Campaign Sync:** Sync CRM campaigns between systems
- **Recipient Management:** Manage campaign recipients via Publishing Platform
- **Campaign Analytics:** Get campaign performance data

**Priority:** 🟡 **MEDIUM** - Useful for campaign management

---

### CRM Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Business Directory** | 🔴 HIGH | Business data access | Comprehensive business info |
| **CRM System** | 🔴 HIGH | Customer & interaction sync | Unified CRM data |
| **Deals & Pipeline** | 🟡 MEDIUM | Sales pipeline management | Pipeline tracking |
| **Campaigns (CRM)** | 🟡 MEDIUM | Campaign sync | Campaign management |

---

## 3. OUTBOUND CAMPAIGNS

**Current State:** Learning Center has Outbound Campaigns for:
- Email campaigns (`/api/v1/outbound/email/*`)
- Phone campaigns (`/api/v1/outbound/phone/*`)
- SMS campaigns (`/api/v1/outbound/sms/*`)

### ✅ Publishing Platform APIs to Leverage:

#### 3.1 Email Campaign APIs

**Endpoints:** `/email-campaigns`, `/email-templates`, `/email-subscribers`, `/email-sends`

**Use Cases:**
- **Email Sending Infrastructure:** Use Publishing Platform for actual email delivery
- **Template Library:** Access Publishing Platform email templates
- **Subscriber Lists:** Use Publishing Platform subscriber lists
- **Email Analytics:** Get email send analytics from Publishing Platform

**Integration:**
```typescript
// Send email campaign via Publishing Platform
const sendEmailViaDayNews = async (campaignId: string) => {
  const campaign = await learningCenterApi.get(`/outbound/campaigns/${campaignId}`);
  
  // Create email campaign in Publishing Platform
  const emailCampaign = await publishingApi.post('/email-campaigns', {
    name: campaign.name,
    template_id: campaign.template_id,
    // ... other fields
  });
  
  // Add recipients
  const recipients = await learningCenterApi.get(`/outbound/campaigns/${campaignId}/recipients`);
  for (const recipient of recipients) {
    await publishingApi.post('/email-subscribers', {
      email: recipient.email,
      // ... other fields
    });
  }
  
  // Send campaign
  await publishingApi.post(`/email-campaigns/${emailCampaign.id}/send`);
};
```

**Priority:** 🔴 **HIGH** - Email delivery infrastructure

---

#### 3.2 Business & Customer APIs (for Targeting)

**Endpoints:** `/businesses`, `/crm/customers`

**Use Cases:**
- **Audience Targeting:** Use business/customer data for campaign targeting
- **Regional Targeting:** Use business regions for geographic targeting
- **Customer Segmentation:** Segment customers based on Publishing Platform data

**Priority:** 🔴 **HIGH** - Essential for targeting

---

### Outbound Campaigns Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Email Campaigns** | 🔴 HIGH | Email delivery | Email sending infrastructure |
| **Business Directory** | 🔴 HIGH | Audience targeting | Targeting data |
| **CRM Customers** | 🔴 HIGH | Customer segmentation | Customer data |

---

## 4. ACTION APPS

**Current State:** Learning Center has Action pages for:
- Articles (`/article`)
- Events (`/events`)
- Classifieds (`/classifieds`)
- Announcements (`/announcements`)
- Coupons (`/coupons`)
- Tickets (`/tickets`)

### ✅ Publishing Platform APIs to Leverage:

#### 4.1 Events & Venues APIs

**Endpoints:** `/events`, `/venues`, `/performers`, `/bookings`

**Use Cases:**
- **Event Data:** Display events from Publishing Platform in Learning Center
- **Venue Information:** Show venue details
- **Event RSVP:** Allow RSVP to events
- **Event Calendar:** Display calendar view of events

**Integration:**
```typescript
// Display events from Publishing Platform
const getEvents = async (regionId?: string) => {
  const params = regionId ? { region_id: regionId } : {};
  const events = await publishingApi.get('/events', { params });
  return events;
};

// RSVP to event
const rsvpToEvent = async (eventId: string, userId: string) => {
  await publishingApi.post(`/events/${eventId}/rsvp`, {
    user_id: userId,
  });
};
```

**Priority:** 🔴 **HIGH** - Direct integration for Events page

---

#### 4.2 Classifieds APIs

**Endpoints:** `/classifieds`, `/classifieds/{id}/images`, `/classifieds/{id}/pay`

**Use Cases:**
- **Classified Listings:** Display classifieds from Publishing Platform
- **Classified Payments:** Process classified payments via Publishing Platform
- **Image Management:** Manage classified images

**Integration:**
```typescript
// Display classifieds
const getClassifieds = async (filters: any) => {
  const classifieds = await publishingApi.get('/classifieds', { params: filters });
  return classifieds;
};

// Create classified listing
const createClassified = async (listingData: any) => {
  const classified = await publishingApi.post('/classifieds', listingData);
  return classified;
};
```

**Priority:** 🔴 **HIGH** - Direct integration for Classifieds page

---

#### 4.3 Coupons APIs

**Endpoints:** `/coupons`, `/coupons/{id}/claim`, `/coupons/{id}/redeem`

**Use Cases:**
- **Coupon Display:** Show available coupons from Publishing Platform
- **Coupon Claiming:** Allow users to claim coupons
- **Coupon Redemption:** Process coupon redemptions
- **Coupon Analytics:** Track coupon usage

**Integration:**
```typescript
// Get active coupons
const getCoupons = async (businessId?: string) => {
  const params = businessId ? { business_id: businessId } : {};
  const coupons = await publishingApi.get('/coupons', { params });
  return coupons;
};

// Claim coupon
const claimCoupon = async (couponId: string, userId: string) => {
  await publishingApi.post(`/coupons/${couponId}/claim`, {
    user_id: userId,
  });
};
```

**Priority:** 🔴 **HIGH** - Direct integration for Coupons page

---

#### 4.4 Tickets APIs

**Endpoints:** `/ticket-orders`, `/events/{id}/ticket-plans`, `/ticket-listings`

**Use Cases:**
- **Ticket Sales:** Sell event tickets via Publishing Platform
- **Ticket Marketplace:** Show ticket resale listings
- **Ticket Transfers:** Handle ticket transfers
- **Ticket Gifts:** Process ticket gifts

**Integration:**
```typescript
// Get ticket plans for event
const getTicketPlans = async (eventId: string) => {
  const plans = await publishingApi.get(`/events/${eventId}/ticket-plans`);
  return plans;
};

// Create ticket order
const createTicketOrder = async (eventId: string, orderData: any) => {
  const order = await publishingApi.post('/ticket-orders', {
    event_id: eventId,
    ...orderData,
  });
  return order;
};
```

**Priority:** 🔴 **HIGH** - Direct integration for Tickets page

---

#### 4.5 Announcements APIs

**Endpoints:** `/announcements`

**Use Cases:**
- **Announcement Display:** Show community announcements
- **Announcement Creation:** Create new announcements
- **Regional Announcements:** Filter by region

**Priority:** 🔴 **HIGH** - Direct integration for Announcements page

---

#### 4.6 Articles APIs

**Endpoints:** `/posts`, `/posts/{slug}`, `/posts/featured`, `/posts/trending`

**Use Cases:**
- **Article Display:** Show articles from Publishing Platform
- **Article Publishing:** Publish articles from Learning Center
- **Featured Articles:** Display featured/trending articles

**Priority:** 🔴 **HIGH** - Direct integration for Articles page

---

### Action Apps Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Events & Venues** | 🔴 HIGH | Events page | Event data & RSVP |
| **Classifieds** | 🔴 HIGH | Classifieds page | Listings & payments |
| **Coupons** | 🔴 HIGH | Coupons page | Coupon data & redemption |
| **Tickets** | 🔴 HIGH | Tickets page | Ticket sales |
| **Announcements** | 🔴 HIGH | Announcements page | Announcement data |
| **Publishing — Articles** | 🔴 HIGH | Articles page | Article content |

---

## 5. BUSINESS APPLICATION

**Current State:** Learning Center has Business features:
- Business Dashboard
- Subscriptions (`/api/v1/subscriptions`)
- Surveys (`/api/v1/survey/*`)
- Todos

### ✅ Publishing Platform APIs to Leverage:

#### 5.1 Business Directory APIs

**Endpoints:** `/businesses`, `/businesses/{id}/subscription`, `/businesses/{id}/attributes`

**Use Cases:**
- **Business Profiles:** Access comprehensive business data
- **Subscription Management:** Manage business subscriptions
- **Business Attributes:** Get business details (hours, photos, reviews)
- **Regional Data:** Get business service regions

**Priority:** 🔴 **HIGH** - Essential for business data

---

#### 5.2 Business Surveys APIs

**Endpoints:** `/businesses/{id}/surveys`, `/surveys/{id}/responses`

**Use Cases:**
- **Survey Data:** Sync survey responses with Publishing Platform
- **Survey Analytics:** Get survey analytics from Publishing Platform

**Priority:** 🟡 **MEDIUM** - If survey sync is needed

---

#### 5.3 Tasks APIs (CRM)

**Endpoints:** `/crm/tasks`

**Use Cases:**
- **Task Management:** Sync todos/tasks with Publishing Platform
- **Task Assignment:** Assign tasks via Publishing Platform
- **Task Tracking:** Track task completion

**Priority:** 🟡 **MEDIUM** - If task sync is needed

---

### Business Application Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Business Directory** | 🔴 HIGH | Business data | Comprehensive business info |
| **Business Surveys** | 🟡 MEDIUM | Survey sync | Survey data integration |
| **CRM Tasks** | 🟡 MEDIUM | Task sync | Task management |

---

## 6. MARKETING APPLICATION

**Current State:** Learning Center has Marketing pages:
- Ads (`/ads`)
- Community Influencer (`/community-influencer`)
- Community Expert (`/community-expert`)
- Sponsors (`/sponsors`)

### ✅ Publishing Platform APIs to Leverage:

#### 6.1 Advertising Platform APIs

**Endpoints:** `/ads`, `/ad-campaigns`, `/ad-creatives`, `/ad-placements`

**Use Cases:**
- **Ad Management:** Manage ads via Publishing Platform
- **Ad Campaigns:** Create and manage ad campaigns
- **Ad Analytics:** Get ad performance metrics
- **Ad Inventory:** Check ad placement availability

**Priority:** 🔴 **HIGH** - Direct integration for Ads page

---

#### 6.2 Social Features APIs

**Endpoints:** `/social/groups`, `/social/posts`, `/social/user-profiles`

**Use Cases:**
- **Community Management:** Manage community groups
- **Social Posts:** Display social content
- **User Profiles:** Show user profiles for influencers/experts

**Priority:** 🟡 **MEDIUM** - For community features

---

#### 6.3 Communities APIs

**Endpoints:** `/communities`, `/communities/{id}/members`

**Use Cases:**
- **Community Data:** Access community information
- **Member Management:** Manage community members
- **Community Threads:** Show community discussions

**Priority:** 🟡 **MEDIUM** - For community features

---

### Marketing Application Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Advertising Platform** | 🔴 HIGH | Ads management | Ad campaigns & analytics |
| **Social Features** | 🟡 MEDIUM | Community features | Social content |
| **Communities** | 🟡 MEDIUM | Community data | Community information |

---

## 7. LEARNING CENTER MODULE

**Current State:** Learning Center has its own features:
- Knowledge Base (`/api/v1/knowledge/*`)
- FAQs (`/api/v1/faq-categories/*`)
- Surveys (`/api/v1/survey/*`)
- Presentations (`/api/v1/presentations/*`)

### ✅ Publishing Platform APIs to Leverage:

#### 7.1 Business FAQs APIs

**Endpoints:** `/businesses/{id}/faqs`

**Use Cases:**
- **FAQ Sync:** Sync FAQs between Learning Center and Publishing Platform
- **Business-Specific FAQs:** Get business-specific FAQs from Publishing Platform

**Priority:** 🟡 **MEDIUM** - If FAQ sync is needed

---

#### 7.2 Articles APIs (for Content)

**Endpoints:** `/posts`, `/posts/{slug}`

**Use Cases:**
- **Content Sources:** Use Publishing Platform articles as content sources
- **Content Display:** Display articles in Learning Center

**Priority:** 🟢 **LOW** - Learning Center has its own content

---

### Learning Center Module Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Business FAQs** | 🟡 MEDIUM | FAQ sync | FAQ data integration |
| **Articles** | 🟢 LOW | Content sources | Content display |

**Note:** Learning Center module is largely self-contained. Integration with Publishing Platform is optional.

---

## 8. AI PERSONALITIES

**Current State:** Learning Center has AI Personalities for:
- Personality management
- Personality assignments
- Contact management

### ✅ Publishing Platform APIs to Leverage:

#### 8.1 Writer Agents APIs

**Endpoints:** `/writer-agents`, `/writer-agents/{id}/articles`

**Use Cases:**
- **AI Agent Integration:** Use Publishing Platform writer agents as AI personalities
- **Content Generation:** Generate content using writer agents
- **Agent Configuration:** Configure AI personalities via Publishing Platform

**Priority:** 🟡 **MEDIUM** - If AI agent integration is desired

---

#### 8.2 Customer/Contact APIs

**Endpoints:** `/crm/customers`, `/crm/interactions`

**Use Cases:**
- **Contact Management:** Sync contacts with Publishing Platform
- **Interaction Logging:** Log AI interactions in Publishing Platform

**Priority:** 🟡 **MEDIUM** - For contact sync

---

### AI Personalities Integration Summary

| Publishing API Category | Priority | Use Case | Benefit |
|------------------------|----------|----------|---------|
| **Writer Agents** | 🟡 MEDIUM | AI agent integration | AI-powered content generation |
| **CRM Customers** | 🟡 MEDIUM | Contact sync | Contact management |

---

## PRIORITY INTEGRATION MATRIX

### 🔴 HIGH PRIORITY (Implement First)

1. **Command Center:**
   - Publishing — Articles APIs (`/posts/*`)
   - Advertising Platform APIs (`/ad-campaigns/*`, `/ads/*`)

2. **CRM:**
   - Business Directory APIs (`/businesses/*`)
   - CRM System APIs (`/crm/customers/*`, `/crm/interactions/*`)

3. **Outbound Campaigns:**
   - Email Campaign APIs (`/email-campaigns/*`)
   - Business/Customer APIs for targeting

4. **Action Apps:**
   - Events & Venues APIs (`/events/*`)
   - Classifieds APIs (`/classifieds/*`)
   - Coupons APIs (`/coupons/*`)
   - Tickets APIs (`/ticket-orders/*`)
   - Announcements APIs (`/announcements/*`)
   - Articles APIs (`/posts/*`)

5. **Marketing:**
   - Advertising Platform APIs (`/ads/*`)

6. **Business:**
   - Business Directory APIs (`/businesses/*`)

---

### 🟡 MEDIUM PRIORITY (Implement Second)

1. **Command Center:**
   - News Workflow APIs (`/news-articles/*`, `/writer-agents/*`)
   - Email Campaign APIs (`/email-campaigns/*`)

2. **CRM:**
   - Deals & Pipeline APIs (`/crm/deals/*`, `/crm/pipeline`)
   - Campaign APIs (`/crm/campaigns/*`)

3. **Business:**
   - Business Surveys APIs (`/businesses/{id}/surveys`)
   - CRM Tasks APIs (`/crm/tasks/*`)

4. **Marketing:**
   - Social Features APIs (`/social/*`)
   - Communities APIs (`/communities/*`)

5. **Learning Center:**
   - Business FAQs APIs (`/businesses/{id}/faqs`)

6. **AI Personalities:**
   - Writer Agents APIs (`/writer-agents/*`)
   - CRM Customers APIs (`/crm/customers/*`)

---

### 🟢 LOW PRIORITY (Nice to Have)

1. **Command Center:**
   - Media APIs (`/photos/*`, `/podcasts/*`)

2. **Learning Center:**
   - Articles APIs (`/posts/*`)

---

## IMPLEMENTATION RECOMMENDATIONS

### Phase 1: Core Integrations (Weeks 1-4)

**Priority:** 🔴 HIGH

1. **Command Center Publishing Integration**
   - Integrate `/posts/*` APIs for content publishing
   - Integrate `/ad-campaigns/*` APIs for ad publishing
   - Update `publishing-api.ts` service

2. **Business Data Integration**
   - Integrate `/businesses/*` APIs
   - Integrate `/businesses/{id}/subscription` APIs
   - Update CRM services to use Publishing Platform data

3. **Action Apps Integration**
   - Integrate Events APIs (`/events/*`)
   - Integrate Classifieds APIs (`/classifieds/*`)
   - Integrate Coupons APIs (`/coupons/*`)
   - Integrate Tickets APIs (`/ticket-orders/*`)
   - Integrate Announcements APIs (`/announcements/*`)
   - Update Action page services

**Timeline:** 4 weeks  
**Effort:** ~80 hours

---

### Phase 2: Enhanced Integrations (Weeks 5-8)

**Priority:** 🟡 MEDIUM

1. **CRM Enhancements**
   - Integrate `/crm/customers/*` APIs
   - Integrate `/crm/interactions/*` APIs
   - Integrate `/crm/deals/*` and `/crm/pipeline` APIs

2. **Outbound Campaigns**
   - Integrate `/email-campaigns/*` APIs
   - Integrate email sending via Publishing Platform

3. **Command Center Enhancements**
   - Integrate News Workflow APIs
   - Integrate Writer Agents APIs

**Timeline:** 4 weeks  
**Effort:** ~80 hours

---

### Phase 3: Optional Integrations (Weeks 9+)

**Priority:** 🟢 LOW

1. Media APIs
2. Social Features APIs
3. Communities APIs
4. Other optional integrations

**Timeline:** As needed  
**Effort:** Variable

---

## INTEGRATION ARCHITECTURE

### Recommended Approach: API Gateway Pattern

```
Learning Center Frontend
  ↓
Learning Center Backend API Client
  ↓
Publishing Platform API (via HTTP)
  ↓
Publishing Platform Backend
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Learning Center can evolve independently
- ✅ Publishing Platform APIs remain stable
- ✅ Easy to add caching/proxying layer
- ✅ Can use Inertia.js for some features (future)

---

### API Client Service Structure

**File:** `src/services/publishing-platform/api-client.ts`

```typescript
import axios from 'axios';

const PUBLISHING_PLATFORM_API = process.env.VITE_PUBLISHING_PLATFORM_API_URL || 'https://api.day.news/v1';

export const publishingApiClient = axios.create({
  baseURL: PUBLISHING_PLATFORM_API,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth interceptor
publishingApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('publishing_platform_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default publishingApiClient;
```

---

### Service Modules

**Structure:**
```
src/services/publishing-platform/
├── api-client.ts          # Base API client
├── posts-api.ts           # Articles/Posts APIs
├── events-api.ts          # Events APIs
├── businesses-api.ts      # Business Directory APIs
├── crm-api.ts             # CRM APIs
├── advertising-api.ts     # Advertising Platform APIs
├── email-campaigns-api.ts # Email Campaign APIs
├── classifieds-api.ts     # Classifieds APIs
├── coupons-api.ts         # Coupons APIs
└── tickets-api.ts         # Tickets APIs
```

---

## AUTHENTICATION STRATEGY

### Option 1: Bearer Token (Current API Design)

**How it works:**
1. Learning Center backend authenticates with Publishing Platform
2. Gets bearer token
3. Passes token to frontend (secure)
4. Frontend includes token in API requests

**Implementation:**
```typescript
// Backend: Get token from Publishing Platform
const token = await publishingPlatformAuth.authenticate(user);

// Frontend: Use token
localStorage.setItem('publishing_platform_token', token);
```

---

### Option 2: Backend Proxy (More Secure)

**How it works:**
1. Frontend calls Learning Center backend APIs
2. Learning Center backend proxies requests to Publishing Platform
3. Backend handles authentication

**Implementation:**
```php
// Learning Center Backend: Proxy to Publishing Platform
public function getBusinesses(Request $request)
{
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $this->getPublishingPlatformToken(),
    ])->get('https://api.day.news/v1/businesses', $request->all());
    
    return response()->json($response->json());
}
```

**Recommendation:** Use **Backend Proxy** approach for security and to hide Publishing Platform API details from frontend.

---

## DATA OWNERSHIP & SYNC

### Data Ownership Model

| Data Type | Owned By | Learning Center Action |
|-----------|----------|------------------------|
| **Businesses** | Publishing Platform | Read-only access |
| **Customers** | Publishing Platform (primary) | Sync to Learning Center |
| **Posts/Articles** | Publishing Platform | Publish from Learning Center |
| **Events** | Publishing Platform | Read-only display |
| **Classifieds** | Publishing Platform | Create/read |
| **Coupons** | Publishing Platform | Read-only display |
| **Tickets** | Publishing Platform | Create orders |
| **Ads** | Publishing Platform | Create campaigns |
| **Generated Content** | Learning Center | Publish to Publishing Platform |
| **Generated Ads** | Learning Center | Publish to Publishing Platform |
| **Knowledge/FAQs** | Learning Center | Keep separate |

---

## SYNC STRATEGIES

### Real-Time Sync (Recommended)

- **When:** Critical data (customers, businesses)
- **How:** API calls on-demand
- **Benefit:** Always up-to-date
- **Cost:** More API calls

### Batch Sync (Alternative)

- **When:** Less critical data
- **How:** Periodic background jobs
- **Benefit:** Fewer API calls
- **Cost:** Data may be slightly stale

### One-Way Publish (Recommended for Content)

- **When:** Generated content/ads
- **How:** Publish from Learning Center to Publishing Platform
- **Benefit:** Learning Center is source of truth for generated content
- **Note:** No sync needed, just publish

---

## BENEFITS SUMMARY

### For Command Center

✅ **Content Publishing:** Direct integration with Publishing Platform article system  
✅ **Ad Distribution:** Publish ads to Publishing Platform ad network  
✅ **Workflow Automation:** Leverage Publishing Platform workflows  
✅ **Media Management:** Centralized media library

### For CRM

✅ **Business Data:** Access comprehensive business information  
✅ **Customer Sync:** Unified customer data across systems  
✅ **Interaction Logging:** Centralized interaction history  
✅ **Pipeline Management:** Sales pipeline tracking

### For Outbound Campaigns

✅ **Email Infrastructure:** Use Publishing Platform email sending  
✅ **Audience Targeting:** Access business/customer data for targeting  
✅ **Campaign Analytics:** Get campaign performance metrics

### For Action Apps

✅ **Rich Content:** Display events, classifieds, coupons, tickets from Publishing Platform  
✅ **User Actions:** Enable RSVP, claiming, purchasing  
✅ **Real-Time Data:** Always current information

### For Business Application

✅ **Business Profiles:** Access comprehensive business data  
✅ **Subscription Management:** Manage subscriptions via Publishing Platform  
✅ **Business Attributes:** Get hours, photos, reviews, etc.

### For Marketing Application

✅ **Ad Management:** Full ad campaign management  
✅ **Ad Analytics:** Performance metrics and reporting  
✅ **Community Features:** Social and community integration

---

## RISKS & CONSIDERATIONS

### ⚠️ Risks

1. **API Rate Limits:** Publishing Platform may have rate limits
   - **Mitigation:** Implement caching and batch operations

2. **API Changes:** Publishing Platform APIs may change
   - **Mitigation:** Version APIs, abstract API client

3. **Authentication:** Token management complexity
   - **Mitigation:** Backend proxy approach, token refresh logic

4. **Data Consistency:** Sync delays between systems
   - **Mitigation:** Real-time sync for critical data, clear data ownership

5. **Performance:** Additional API calls may slow down app
   - **Mitigation:** Caching, batch requests, async operations

---

## SUCCESS METRICS

### Integration Success Indicators

1. **Command Center:**
   - % of content published via Publishing Platform APIs
   - % of ads distributed via Publishing Platform
   - Time to publish content/ads

2. **CRM:**
   - % of businesses accessed from Publishing Platform
   - % of customer data synced
   - Interaction logging coverage

3. **Action Apps:**
   - % of events/classifieds/coupons from Publishing Platform
   - User engagement (RSVPs, claims, purchases)

4. **Overall:**
   - API call success rate
   - Average API response time
   - Error rate

---

## NEXT STEPS

### Immediate Actions

1. **Review API Documentation:**
   - Complete review of DayNews_Complete_API_Reference_v2.docx
   - Identify all relevant endpoints for each Learning Center app

2. **Create API Client Services:**
   - Set up base API client for Publishing Platform
   - Create service modules for each API category

3. **Start with High-Priority Integrations:**
   - Command Center publishing integration
   - Business data integration
   - Action Apps integration

4. **Implement Authentication:**
   - Set up backend proxy or token management
   - Test authentication flow

5. **Create Integration Tests:**
   - Test API integrations
   - Handle error cases
   - Test data sync

---

## CONCLUSION

The Publishing Platform (DayNews) APIs provide comprehensive functionality that can significantly enhance the Learning Center platform across all applications. The **Command Center** stands to benefit most, with direct integrations for content publishing, ad distribution, and workflow automation.

**Recommendation:** Proceed with **Phase 1 (High Priority)** integrations first, focusing on Command Center publishing, Business data access, and Action Apps integration. These will provide immediate value and establish the integration pattern for future enhancements.

---

## DETAILED API ENDPOINT MAPPING

### Command Center Specific Endpoints

#### Content Publishing Integration

**Learning Center:** `POST /api/v1/publishing/content/{id}/publish`  
**Publishing Platform:** `POST /posts` (create), `PATCH /posts/{id}/publish` (publish)

**Integration Flow:**
1. Generate content in Learning Center Command Center
2. Call Publishing Platform `/posts` to create post
3. Add regions via `/posts/{id}/regions`
4. Add tags via `/posts/{id}/tags`
5. Publish via `PATCH /posts/{id}/publish`

#### Ad Publishing Integration

**Learning Center:** `POST /api/v1/ads/generate-from-campaign`  
**Publishing Platform:** `POST /ad-campaigns`, `POST /ad-creatives`

**Integration Flow:**
1. Generate ad in Learning Center
2. Create ad creative via `/ad-creatives`
3. Create ad campaign via `/ad-campaigns`
4. Link creative to campaign
5. Activate campaign

---

### CRM Specific Endpoints

#### Business Data Access

**Learning Center Needs:** Business information for CRM  
**Publishing Platform Provides:** `/businesses`, `/businesses/{id}`, `/businesses/{id}/attributes`

**Integration:**
- Fetch business data from Publishing Platform
- Display in Learning Center CRM
- Sync business updates back to Publishing Platform

#### Customer Sync

**Learning Center:** `/api/v1/customers/*`  
**Publishing Platform:** `/crm/customers/*`

**Integration Flow:**
1. Create/update customer in Learning Center
2. Sync to Publishing Platform via `/crm/customers`
3. Log interactions via `/crm/interactions`

---

### Action Apps Specific Endpoints

#### Events Integration

**Learning Center:** `/events` page  
**Publishing Platform:** `/events`, `/events/{id}`, `/events/{id}/rsvp`

**Integration:**
- Display events from Publishing Platform
- Allow RSVP via Publishing Platform API
- Show venue information via `/venues`

#### Classifieds Integration

**Learning Center:** `/classifieds` page  
**Publishing Platform:** `/classifieds`, `/classifieds/{id}/pay`

**Integration:**
- List classifieds from Publishing Platform
- Create new listings via Publishing Platform
- Process payments via `/classifieds/{id}/pay`

#### Coupons Integration

**Learning Center:** `/coupons` page  
**Publishing Platform:** `/coupons`, `/coupons/{id}/claim`, `/coupons/{id}/redeem`

**Integration:**
- Display active coupons
- Handle coupon claiming
- Process redemptions

#### Tickets Integration

**Learning Center:** `/tickets` page  
**Publishing Platform:** `/ticket-orders`, `/events/{id}/ticket-plans`

**Integration:**
- Show ticket plans for events
- Create ticket orders
- Handle payments via `/ticket-orders/{id}/pay`

---

## EXAMPLE INTEGRATION CODE

### Command Center: Publish Content to Publishing Platform

```typescript
// src/services/publishing-platform/posts-api.ts
import publishingApiClient from './api-client';

export interface DayNewsPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  status: 'draft' | 'published' | 'scheduled';
  // ... other fields
}

export async function createPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  author_id?: string;
  category?: string;
}): Promise<DayNewsPost> {
  const response = await publishingApiClient.post<{ data: DayNewsPost }>('/posts', data);
  return response.data.data;
}

export async function publishPost(postId: string): Promise<DayNewsPost> {
  const response = await publishingApiClient.patch<{ data: DayNewsPost }>(
    `/posts/${postId}/publish`
  );
  return response.data.data;
}

export async function addRegionsToPost(postId: string, regionIds: string[]): Promise<void> {
  await publishingApiClient.post(`/posts/${postId}/regions`, { regions: regionIds });
}

export async function addTagsToPost(postId: string, tagIds: string[]): Promise<void> {
  await publishingApiClient.post(`/posts/${postId}/tags`, { tags: tagIds });
}
```

```typescript
// Usage in Command Center
import { createPost, publishPost, addRegionsToPost, addTagsToPost } from '@/services/publishing-platform/posts-api';

const publishContentToDayNews = async (contentId: string) => {
  const content = await getContent(contentId);
  
  // Create post
  const post = await createPost({
    title: content.title,
    content: content.content,
    excerpt: content.excerpt,
    category: content.metadata.category,
  });
  
  // Add regions if specified
  if (content.metadata.regions?.length) {
    await addRegionsToPost(post.id, content.metadata.regions);
  }
  
  // Add tags if specified
  if (content.metadata.tags?.length) {
    await addTagsToPost(post.id, content.metadata.tags);
  }
  
  // Publish
  await publishPost(post.id);
  
  return post;
};
```

---

### CRM: Sync Business Data

```typescript
// src/services/publishing-platform/businesses-api.ts
import publishingApiClient from './api-client';

export interface Business {
  id: string;
  name: string;
  // ... comprehensive business fields (100+ fields)
}

export async function getBusiness(businessId: string): Promise<Business> {
  const response = await publishingApiClient.get<{ data: Business }>(`/businesses/${businessId}`);
  return response.data.data;
}

export async function getBusinessSubscription(businessId: string): Promise<any> {
  const response = await publishingApiClient.get<{ data: any }>(
    `/businesses/${businessId}/subscription`
  );
  return response.data.data;
}

export async function getBusinessAttributes(businessId: string): Promise<any> {
  const response = await publishingApiClient.get<{ data: any }>(
    `/businesses/${businessId}/attributes`
  );
  return response.data.data;
}
```

```typescript
// Usage in CRM
import { getBusiness, getBusinessSubscription, getBusinessAttributes } from '@/services/publishing-platform/businesses-api';

const loadBusinessData = async (businessId: string) => {
  const [business, subscription, attributes] = await Promise.all([
    getBusiness(businessId),
    getBusinessSubscription(businessId),
    getBusinessAttributes(businessId),
  ]);
  
  return {
    business,
    subscription,
    attributes,
  };
};
```

---

### Action Apps: Events Integration

```typescript
// src/services/publishing-platform/events-api.ts
import publishingApiClient from './api-client';

export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_id?: string;
  // ... other fields
}

export async function getEvents(params?: {
  region_id?: string;
  venue_id?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Event[]> {
  const response = await publishingApiClient.get<{ data: Event[] }>('/events', { params });
  return response.data.data;
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await publishingApiClient.get<{ data: Event }>(`/events/${eventId}`);
  return response.data.data;
}

export async function rsvpToEvent(eventId: string, userId: string): Promise<void> {
  await publishingApiClient.post(`/events/${eventId}/rsvp`, { user_id: userId });
}
```

---

## COMPLETE API CATEGORY LIST (28 Categories)

For reference, here are all 28 API categories from Publishing Platform:

1. **Authentication & Users** - User management, sessions, social login
2. **Workspaces & Multi-Tenancy** - Workspaces, tenants, roles
3. **Publishing — Articles** - DayNews posts, tags, comments
4. **Publishing — News Workflow** - News articles, writer agents, workflows
5. **Publishing — Content Types** - Announcements, Classifieds, Coupons, Legal Notices, Memorials
6. **Publishing — Media** - Photos, Albums, Podcasts, Creator Profiles
7. **Events & Venues** - Events, Venues, Performers, Bookings
8. **Ticketing System** - Ticket Plans, Orders, Listings, Transfers, Gifts, Promo Codes
9. **Social Features** - Posts, Comments, Likes, Friendships, Groups
10. **Community Forums** - Communities, Threads, Replies
11. **Messaging** - Conversations, Messages
12. **Notifications** - Push notifications, subscriptions
13. **Business Directory** - Businesses, Subscriptions, Templates, FAQs, Surveys
14. **CRM System** - SMB Businesses, Customers, Deals, Campaigns, Interactions, Tasks
15. **E-Commerce** - Stores, Products, Carts, Orders
16. **Calendars** - Calendars, Calendar Events, Followers
17. **Hubs** - Community Hubs, Sections, Members, Analytics
18. **Regions & Location** - Regions, ZIP codes
19. **Advertising Platform** - Ad Campaigns, Creatives, Placements, Analytics
20. **Email Marketing** - Email Campaigns, Templates, Subscribers, Sends
21. **Emergency Alerts** - Emergency alerts, subscriptions, deliveries
22. **Newsletter Subscriptions** - Newsletter management
23. **Search** - Search history, suggestions
24. **RSS Feeds** - RSS feed management
25. **Reviews & Ratings** - Review and rating system
26. **Follows & Engagement** - Follow system, comment reports
27. **Organizations** - Organization hierarchies, relationships
28. **AlphaSite Communities** - AlphaSite-specific communities

---

**Status:** ✅ Analysis Complete  
**Next Step:** Begin Phase 1 implementation (High Priority integrations)

