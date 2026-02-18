# Learning Center – Comprehensive Gap Analysis

**Date:** February 18, 2026  
**Scope:** Learning content, Command Center, Marketing/Action pages, Backend TODOs, Integration  
**Purpose:** Thorough inventory of unimplemented or incomplete items

---

## EXECUTIVE SUMMARY

| Category | Items | Status |
|----------|-------|--------|
| Learning content placeholders | 35 routes | Placeholder only |
| Marketing & Action pages | 13 pages | ComingSoon only |
| Command Center modules | 8+ pages | "Coming soon" text |
| Command Center widgets | 5 components | Missing |
| Dashboard mock data | 4 card types | Hardcoded, no API |
| Service wizard steps | 6 steps | Placeholder |
| Campaign action TODOs | 3 actions | Log only, no dispatch |
| Backend TODOs | 20+ items | Various |
| Integration (Publishing Platform) | 6 phases | ~176 hours estimated |
| Inbound email processing | 6 components | Missing |
| Documentation | 7 docs | Not started |

---

## 1. LEARNING CONTENT (35 Placeholder Routes)

All routes below use `PlaceholderPage` with category/title only—no real content.

### Video Tutorials (5 routes)
- `/learn/video-basics`
- `/learn/presentation-tips`
- `/learn/ai-features`
- `/learn/advanced-workflows` / `/learn/workflows`

### Documentation (5 routes)
- `/learn/user-manual` / `/learn/manual`
- `/learn/api-docs` / `/learn/api`
- `/learn/best-practices`
- `/learn/troubleshooting`

### Webinars & Events (5 routes)
- `/learn/webinars`
- `/learn/past-recordings` / `/learn/recordings`
- `/learn/live-training`
- `/learn/community-events` / `/learn/events`

### Community (6 routes)
- `/learn/forums`
- `/learn/user-stories` / `/learn/stories`
- `/learn/expert-network` / `/learn/experts`
- `/learn/guidelines`

### Certifications (4 routes)
- `/learn/certifications`
- `/learn/assessments`
- `/learn/paths`
- `/learn/badges`

### Advanced Topics (4 routes)
- `/learn/ai-integration`
- `/learn/analytics`
- `/learn/custom-workflows`
- `/learn/enterprise`

### Resources (4 routes)
- `/learn/templates`
- `/learn/case-studies`
- `/learn/reports`
- `/learn/blog`

**Effort:** 18–24 hours to replace with real content (depends on content strategy).

---

## 2. MARKETING & ACTION PAGES (13 ComingSoon Pages)

All use `<ComingSoon>` component with title/description only.

### Marketing (4 pages)
- `/community-influencer` – CommunityInfluencerPage
- `/community-expert` – CommunityExpertPage
- `/sponsors` – SponsorsPage
- `/ads` – AdsPage

### Action (8 pages)
- `/article` – ArticlePage
- `/events` – EventsPage
- `/classifieds` – ClassifiedsPage
- `/announcements` – AnnouncementsPage
- `/coupons` – CouponsPage
- `/incentives` – IncentivesPage
- `/tickets` – TicketsPage
- `/ai` – AIPage

### Business (4 pages)
- `/survey` – SurveyPage
- `/dashboard` – DashboardPage (Business)
- `/todos` – TodosPage
- `/subscriptions` – SubscriptionsPage

**Effort:** 4–8 hours per page depending on complexity; ~40–80 hours total.

---

## 3. COMMAND CENTER MODULES (8+ "Coming Soon" Pages)

These pages render only "X module - Coming soon" text.

| Page | File | Route |
|------|------|-------|
| Content | ContentPage.tsx | /command-center/content |
| Settings | SettingsPage.tsx | /command-center/settings |
| Campaign Detail | CampaignDetailPage.tsx | /command-center/campaigns/:id |
| Customer Detail | CustomerDetailPage.tsx | /command-center/customers/:id |
| Campaigns | CampaignsPage.tsx | /command-center/campaigns |
| AI Hub | AIHubPage.tsx | /command-center/ai-hub |
| Services | ServicesPage.tsx | /command-center/services |
| Activities | ActivitiesPage.tsx | /command-center/activities |
| Customers | CustomersPage.tsx | /command-center/customers |

**Note:** Some of these may have underlying modules (e.g. `CampaignsPage` vs `modules/campaigns/CampaignsPage`). The top-level page wrappers show "Coming soon" while nested modules may have partial implementations.

**Effort:** 6–12 hours per module; ~54–108 hours total.

---

## 4. COMMAND CENTER DASHBOARD WIDGETS (5 Missing)

Per GAP_CLOSURE_PROJECT_PLAN and GAP_CLOSURE_CODE_REVIEW:

| Widget | Status | Purpose |
|--------|--------|---------|
| TrialCountdown | ❌ Not found | Trial expiration countdown |
| ValueTracker | ❌ Not found | Value delivered tracking |
| PlatformStatus | ❌ Not found | Platform health/status |
| RecentContent | ❌ Not found | Recent content activity |
| QuickActions | ❌ Not found | Quick action buttons |

**Current:** `DashboardGrid.tsx` uses default cards (tasks, email, messages, calendar, files, articles) with mock data only.

**Effort:** 8–10 hours total.

---

## 5. DASHBOARD MOCK DATA (DashboardGrid)

`DashboardCardContent` in `DashboardGrid.tsx` uses hardcoded mock data:

```ts
const mockData = {
  tasks: [{ id: '1', title: 'Review marketing copy', status: 'In Progress' }, ...],
  email: [{ id: '1', from: 'Acme Corp', subject: 'New proposal' }, ...],
  messages: [{ id: '1', from: 'Sarah', message: 'Can we reschedule?' }, ...],
  calendar: [{ id: '1', event: 'Team Meeting', time: '2:00 PM' }, ...],
};
```

- No API integration
- No backend endpoints for dashboard cards
- `files` and `articles` cards have no mock data (empty arrays)

**Effort:** 4–6 hours to add API + wire up.

---

## 6. SERVICE WIZARD PLACEHOLDERS

`RemainingSteps.tsx` has 5 placeholder steps:

1. Add-ons (Placeholder)
2. AI Suggestions (Placeholder)
3. Quote Summary (Placeholder)
4. Payment Form (Placeholder)
5. Order Confirmed (Placeholder)

`ServiceConfiguratorStep.tsx`:

- "Configure your selected services here. (Placeholder implementation)"

**Effort:** 10–15 hours for full implementation.

---

## 7. CAMPAIGN ACTION TODOS (CampaignActionExecutor)

Three actions only log and return `dispatched: false`:

| Action | Method | Status |
|--------|--------|--------|
| send_email | sendEmail() | TODO: Adapt to Customer model, implement actual send |
| send_sms | sendSMS() | TODO: Implement actual SMS sending |
| make_call | makeCall() | TODO: Implement actual phone call |

**Effort:** 5–7 hours total.

---

## 8. BACKEND TODOS (Partial List)

### CampaignActionExecutor
- send_email, send_sms, make_call (see above)

### CustomerController
- Engagement counts: `campaign_sends`, `content_views`, `approvals` use placeholder counts
- `engagement_score_history` query not implemented

### NewsletterController
- Test send functionality
- Unsubscribe logic with token validation

### CampaignController
- Send email notification to sales team (contact sales)
- Store in database (optional)

### KnowledgeController
- `tenant_id` from auth instead of default UUID

### Twilio Webhooks
- Update interaction records with status (SMS, Voicemail)

### Emergency Jobs
- `SendEmergencyVoice`: Integrate with Twilio Voice API
- `SendEmergencyPush`: Integrate with FCM/APNs

### AlertService
- Push notification sending

### EngagementService
- Query email opens from `campaign_sends`
- Query email clicks from `campaign_sends`

### GenerateTTS
- R2 storage implementation
- Update model with `audio_url`

### Newsletter / Other Jobs
- `CheckSponsorshipInventory`: Send alert to admin/sponsor
- `SendPremiumWelcome`: Send premium welcome email
- `QueueNextCampaign`: Queue actual campaign send job

### Console Commands
- `ProcessEmbeddings` / `GeneratePendingEmbeddings`: Query pending items, dispatch jobs
- `CleanupOldData`: Delete logs, archive activities, clean temp files

**Effort:** 15–25 hours depending on scope.

---

## 9. INBOUND EMAIL PROCESSING (Agent E – Gap Closure)

Per GAP_CLOSURE_CODE_REVIEW, missing components:

| Component | Status |
|-----------|--------|
| InboundEmailService | ❌ Not found |
| EmailIntentClassifier | ❌ Not found |
| EmailSentimentAnalyzer | ❌ Not found |
| HandleInboundEmailReceived listener | ❌ Not found |
| InboundEmailWebhookController | ❌ Not found |
| InboundEmailRoutingService | ❌ Not found |

**Effort:** 4–6 hours (per GAP doc).

---

## 10. PUBLISHING PLATFORM INTEGRATION

Per LEARNING_CENTER_INTEGRATION_PROJECT_PLAN:

| Phase | Scope | Hours |
|-------|-------|-------|
| 1. Authentication | Cross-domain auth, login, token, password reset | ~30 |
| 2. Business Profile | Business model, profile API, subscriptions, attributes | ~42 |
| 3. Payment & Billing | Stripe, orders, subscription billing | ~38 |
| 4. Notification | Notification, email, SMS | ~24 |
| 5. File Upload | File upload, image/asset management | ~20 |
| 6. Additional Services | Search, location, profile | ~22 |
| **Total** | | **~176** |

Plus: Connect mock data pages (ProfilePage, CalendarView, VideoCall, DataReportPanel) ~20 hours.

---

## 11. DOCUMENTATION GAPS

Per GAP_CLOSURE_CODE_REVIEW, missing docs:

- `docs/campaign-automation.md`
- `docs/sms-handling.md`
- `docs/email-followup.md`
- `docs/voicemail-transcription.md`
- `docs/pipeline-stages.md`
- `docs/inbound-email-processing.md`
- `docs/command-center.md`

**Effort:** 8–10 hours.

---

## 12. OTHER GAPS

### Pipeline Listeners (Verification)
- `AdvanceStageOnEngagementThreshold` – may be integrated elsewhere
- `AdvanceStageOnTrialAcceptance` – may be integrated elsewhere

### Code Quality (from prior review)
- ~70+ files with `console.log`
- 10 linter errors
- 434 raw SQL usages to review

### Testing
- Limited backend PHPUnit coverage
- Many frontend tests; backend integration tests incomplete

---

## REVISED EFFORT SUMMARY

| Category | Low | High |
|----------|-----|------|
| Learning content placeholders | 18 | 24 |
| Marketing & Action pages | 40 | 80 |
| Command Center modules | 54 | 108 |
| Command Center widgets | 8 | 10 |
| Dashboard API integration | 4 | 6 |
| Service wizard | 10 | 15 |
| Campaign action TODOs | 5 | 7 |
| Backend TODOs | 15 | 25 |
| Inbound email processing | 4 | 6 |
| Integration (Publishing Platform) | 176 | 196 |
| Documentation | 8 | 10 |
| Pipeline listener verification | 2 | 3 |
| **Total (excluding integration)** | **178** | **284** |
| **Total (including integration)** | **354** | **480** |

---

## RECOMMENDED PRIORITY ORDER

1. **P0 – Critical:** Campaign action TODOs (send_email, send_sms, make_call)
2. **P0 – Critical:** Dashboard mock data → API integration
3. **P1 – High:** Command Center widgets (TrialCountdown, ValueTracker, etc.)
4. **P1 – High:** Inbound email processing
5. **P1 – High:** Command Center "Coming soon" modules (Content, Settings, Campaign Detail, etc.)
6. **P2 – Medium:** Learning content placeholders (prioritize high-traffic routes)
7. **P2 – Medium:** Marketing & Action ComingSoon pages
8. **P2 – Medium:** Service wizard placeholders
9. **P3 – Lower:** Backend TODOs, documentation, integration phases

---

**Status:** ✅ Analysis complete  
**Last Updated:** February 18, 2026
