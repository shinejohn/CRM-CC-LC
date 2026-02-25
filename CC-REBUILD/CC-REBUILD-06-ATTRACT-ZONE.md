# CC-REBUILD-06: ATTRACT Zone
## Agent F — Phase 2 (Depends on: CC-REBUILD-01 Layout, CC-REBUILD-02 AM-AI, CC-REBUILD-03 Theme)

---

## Mission
Build the ATTRACT zone — "Get Found by Customers." Campaign builder, article creator, event manager, and content calendar. This is the HIGHEST PRIORITY revenue-driving zone.

## Magic Patterns Reference Files
- `MarketingCampaignWizard.tsx` → PRIMARY: Multi-step campaign wizard (challenge → goal → package match → customize → launch)
- `ArticleCreator.tsx` → Article creation interface
- `EventCreator.tsx` → Event creation interface
- `ContentCreationFlow.tsx` → Content creation workflow
- `ContentLibrary.tsx` → Content management dashboard
- `ContentScheduling.tsx` → Scheduling calendar
- `CampaignBuilderPage.tsx` → Campaign builder page
- `ContentManagerDashboard.tsx` → Content overview
- `ContentTypeSelection.tsx` → Content type picker

## What to Build

### 1. `resources/js/pages/alphasite/crm/attract/index.tsx` — ATTRACT Hub

Pink/rose-themed zone page:
- **ZoneHeader**: "Attract Customers" with pink gradient, Target icon
- **Quick Create Buttons** (top row): "✨ AI Article" / "📅 Create Event" / "📢 New Campaign" / "📱 Social Post"
- **Performance Metrics Row**: Articles published, events created, campaign sends, social reach
- **Active Campaigns Card**: List of running campaigns with status, open rate, click rate
- **Recent Content Card**: Latest articles/events with publication status
- **Content Calendar Mini**: Week view showing scheduled content
- **AI Suggestion Card**: "Sarah suggests: Based on your industry, create a Valentine's Day promotion" — contextual, seasonal

### 2. `resources/js/pages/alphasite/crm/attract/campaigns.tsx` — Campaign Builder

Follow `MarketingCampaignWizard.tsx` step-by-step flow:

**Step 1: Biggest Challenge** — Single selection: "Not enough people know about us" / "People don't trust us yet" / "We blend in with competitors" / "Don't have time for marketing"

**Step 2: Your Goal** — Grid selection (3 columns): Build Awareness / Establish Authority / Drive Traffic / Increase Sales / Build Loyalty / Promote Events

**Step 3: Package Match** — AI-recommended package based on selections with "Why We Recommend" insight card. Show Community Influencer / Expert / Sponsor options with pricing, features, scarcity ("Only X spots left!")

**Step 4: Customize** — Select channels (Email, SMS, Social, Print), frequency, target audience

**Step 5: Review & Launch** — Summary with estimated reach, cost, timeline. Launch button.

Also include:
- Campaign list view (table with status filters)
- Campaign detail view (performance metrics, send history)
- Campaign templates library

### 3. `resources/js/pages/alphasite/crm/attract/articles.tsx` — Article Creator

- Article list with status badges (Draft, In Review, Published, Scheduled)
- "Create Article" button opens wizard:
  - Topic selection (AI suggestions or custom)
  - AI generates draft from business profile context
  - Rich text editor for editing
  - Publication selector (Day.News, Downtown Guide)
  - Schedule or publish immediately
  - Preview before publishing
- Article analytics (views, engagement, leads generated)

### 4. `resources/js/pages/alphasite/crm/attract/events.tsx` — Event Manager

- Event list with calendar and list views
- "Create Event" wizard:
  - Event details (title, description, date, time, location)
  - Ticket options (free, paid, RSVP)
  - Publication to GoEventCity
  - Promotion options (newsletter feature, social media)
- Event analytics (RSVPs, attendance, revenue)

## Data from Backend
```typescript
interface AttractProps {
  business: Business;
  subscription: Subscription | null;
  campaigns: PaginatedList<Campaign>;
  articles: PaginatedList<Article>;
  events: PaginatedList<Event>;
  metrics: {
    articles_published: number;
    events_created: number;
    campaign_sends: number;
    total_reach: number;
  };
  aiSuggestions: string[];
}
```

## Acceptance Criteria
- [ ] ATTRACT hub shows quick-create buttons and performance metrics
- [ ] Campaign wizard walks through 5 steps with smart recommendations
- [ ] Article creator supports AI-generated drafts
- [ ] Event manager has both calendar and list views
- [ ] All creation flows include AI assistance
- [ ] Pink zone theming throughout
- [ ] Account Manager AI accessible on every page

## Files to Create
1. `resources/js/pages/alphasite/crm/attract/index.tsx`
2. `resources/js/pages/alphasite/crm/attract/campaigns.tsx`
3. `resources/js/pages/alphasite/crm/attract/articles.tsx`
4. `resources/js/pages/alphasite/crm/attract/events.tsx`
