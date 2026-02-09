# FIBONACCO COMPLETE PLATFORM
## Multi-Agent Development Orchestration

---

## OVERVIEW

This project is a **complete local media and communications platform** with three revenue streams:
1. **B2B:** SMB subscriptions (Command Center, AI Account Manager)
2. **B2C:** Advertising revenue (newsletter/alert sponsorships)
3. **B2G:** Municipal contracts (emergency broadcast system)

The system is broken into **15 modules** that can be developed in parallel by separate Cursor agents. Each module has its own specification document with clear boundaries, interfaces, and acceptance criteria.

**Total Timeline: 10-12 weeks**

---

## MODULE MAP

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT PHASES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 1: FOUNDATION (Week 1-2) ─── Must Complete First                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  MODULE 0: CORE INFRASTRUCTURE                                          │   │
│  │  • Laravel skeleton + auth         • Redis/queue setup                  │   │
│  │  • Database migrations (all)       • Base API structure                 │   │
│  │  • Shared contracts/interfaces                                          │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  MODULE 0B: COMMUNICATION INFRASTRUCTURE                                │   │
│  │  • Message orchestrator            • Priority queue system (P0-P4)     │   │
│  │  • Channel gateways (email/sms/push) • Rate limiting/throttling        │   │
│  │  • Delivery tracking               • Suppression list                   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  MODULE 0C: EMAIL GATEWAY (POSTAL)                                      │   │
│  │  • Self-hosted Postal cluster      • IP pool management (75 IPs)       │   │
│  │  • Webhook processing              • Deliverability monitoring         │   │
│  │  • SES failover                    • START WARMING IMMEDIATELY         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                          │
│                                       ▼                                          │
│  PHASE 2: PARALLEL DEVELOPMENT (Week 3-7) ─── All Run Simultaneously            │
│                                                                                  │
│  ┌─────────────────────────── B2B: SMB PLATFORM ───────────────────────────┐   │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │   │
│  │ │   MODULE 1    │ │   MODULE 2    │ │   MODULE 3    │ │   MODULE 4    │ │   │
│  │ │   SMB CRM     │ │   CAMPAIGN    │ │   LEARNING    │ │   APPROVAL    │ │   │
│  │ │               │ │    ENGINE     │ │    CENTER     │ │    SYSTEM     │ │   │
│  │ │ • SMB CRUD    │ │ • Scheduler   │ │ • Content API │ │ • Flow pages  │ │   │
│  │ │ • Engagement  │ │ • Email send  │ │ • Tracking    │ │ • Processing  │ │   │
│  │ │ • Tiers       │ │ • RVM send    │ │ • Personalize │ │ • Provisioning│ │   │
│  │ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ │   │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                   │   │
│  │ │   MODULE 5    │ │   MODULE 6    │ │   MODULE 7    │                   │   │
│  │ │   INBOUND     │ │   COMMAND     │ │   AI ACCOUNT  │                   │   │
│  │ │   ENGINE      │ │    CENTER     │ │    MANAGER    │                   │   │
│  │ │ • Email parse │ │ • Dashboard   │ │ • Sarah AI    │                   │   │
│  │ │ • Callbacks   │ │ • All modules │ │ • Proactive   │                   │   │
│  │ │ • Chat bot    │ │ • Settings    │ │ • Responses   │                   │   │
│  │ └───────────────┘ └───────────────┘ └───────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌────────────────────────── B2C: CONSUMER PLATFORM ───────────────────────┐   │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │   │
│  │ │   MODULE 9    │ │   MODULE 10   │ │   MODULE 11   │ │   MODULE 12   │ │   │
│  │ │  NEWSLETTER   │ │    ALERT      │ │   EMERGENCY   │ │  SUBSCRIBER   │ │   │
│  │ │   ENGINE      │ │    SYSTEM     │ │   BROADCAST   │ │  MANAGEMENT   │ │   │
│  │ │ • Daily/weekly│ │ • Breaking    │ │ • P0 priority │ │ • Registration│ │   │
│  │ │ • Sponsors    │ │ • Multi-chan  │ │ • All channels│ │ • Preferences │ │   │
│  │ │ • A/B testing │ │ • Geo-target  │ │ • Auth/audit  │ │ • List compile│ │   │
│  │ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                          │
│                                       ▼                                          │
│  PHASE 3: INTEGRATION (Week 8-10)                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  MODULE 8: ANALYTICS & INTEGRATION                                       │   │
│  │  • Dashboards (B2B + B2C)          • Revenue tracking by channel        │   │
│  │  • Sponsor performance             • Cross-module integration tests     │   │
│  │  • Delivery analytics              • End-to-end workflow validation     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                          │
│                                       ▼                                          │
│  PHASE 4: LAUNCH (Week 11-12)                                                   │
│  • Pilot communities (start with 4 readers, grow organically)                   │
│  • IPs warm naturally with real traffic                                         │
│  • Bug fixes + optimization                                                     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## MODULE FILES

| Module | File | Owner | Dependencies |
|--------|------|-------|--------------|
| **Foundation** ||||
| 0 | `MODULE-0-CORE-INFRASTRUCTURE.md` | Lead Agent | None |
| 0B | `MODULE-0B-COMMUNICATION-INFRASTRUCTURE.md` | Lead Agent | Module 0 |
| 0C | `MODULE-0C-EMAIL-GATEWAY.md` | DevOps Agent | None (start day 1) |
| **B2B Platform** ||||
| 1 | `MODULE-1-SMB-CRM.md` | Agent 1 | Module 0 |
| 2 | `MODULE-2-CAMPAIGN-ENGINE.md` | Agent 2 | Modules 0, 0B |
| 3 | `MODULE-3-LEARNING-CENTER.md` | Agent 3 | Module 0 |
| 4 | `MODULE-4-APPROVAL-SYSTEM.md` | Agent 4 | Module 0 |
| 5 | `MODULE-5-INBOUND-ENGINE.md` | Agent 5 | Modules 0, 0B |
| 6 | `MODULE-6-COMMAND-CENTER.md` | Agent 6 | Modules 0, 1, 4 |
| 7 | `MODULE-7-AI-ACCOUNT-MANAGER.md` | Agent 7 | Modules 0, 1 |
| **B2C Platform** ||||
| 9 | `MODULE-9-NEWSLETTER-ENGINE.md` | Agent 9 | Modules 0, 0B, 12 |
| 10 | `MODULE-10-ALERT-SYSTEM.md` | Agent 10 | Modules 0, 0B, 12 |
| 11 | `MODULE-11-EMERGENCY-BROADCAST.md` | Agent 11 | Modules 0, 0B, 12 |
| 12 | `MODULE-12-SUBSCRIBER-MANAGEMENT.md` | Agent 12 | Module 0 |
| **Integration** ||||
| 8 | `MODULE-8-ANALYTICS-INTEGRATION.md` | Lead Agent | All modules |

---

## SHARED CONTRACTS

All modules must implement these shared interfaces (defined in Module 0):

### Events (Laravel Events)

```php
// All modules emit events that others can listen to
namespace App\Events;

// ═══════════════════════════════════════════════════════════════════════
// FOUNDATION EVENTS
// ═══════════════════════════════════════════════════════════════════════

// Module 0B: Communication Infrastructure
MessageQueued::class
MessageSent::class
MessageDelivered::class
MessageOpened::class
MessageClicked::class
MessageBounced::class
MessageComplained::class
MessageFailed::class

// ═══════════════════════════════════════════════════════════════════════
// B2B PLATFORM EVENTS
// ═══════════════════════════════════════════════════════════════════════

// Module 1: SMB CRM
SMBCreated::class
SMBUpdated::class
SMBEngagementChanged::class
SMBTierChanged::class

// Module 2: Campaign Engine
CampaignSendQueued::class
CampaignSendCompleted::class
EmailOpened::class
EmailClicked::class
RVMDropped::class
RVMDelivered::class

// Module 3: Learning Center
ContentViewed::class
ContentCompleted::class

// Module 4: Approval System
ApprovalSubmitted::class
ApprovalProvisioned::class
UpsellAccepted::class

// Module 5: Inbound Engine
InboundEmailReceived::class
CallbackReceived::class
ChatMessageReceived::class

// Module 6: Command Center
CommandCenterAction::class

// Module 7: AI Account Manager
AIResponseGenerated::class
AITaskCompleted::class

// ═══════════════════════════════════════════════════════════════════════
// B2C PLATFORM EVENTS
// ═══════════════════════════════════════════════════════════════════════

// Module 9: Newsletter Engine
NewsletterCreated::class
NewsletterBuilt::class
NewsletterScheduled::class
NewsletterSendCompleted::class
NewsletterOpened::class
NewsletterClicked::class

// Module 10: Alert System
AlertCreated::class
AlertApproved::class
AlertSendCompleted::class

// Module 11: Emergency Broadcast
EmergencyBroadcastCreated::class
EmergencyBroadcastAuthorized::class
EmergencyBroadcastSendCompleted::class

// Module 12: Subscriber Management
SubscriberRegistered::class
SubscriberVerified::class
SubscriberUnsubscribed::class
CommunitySubscribed::class
```

### Service Interfaces

```php
// Each module exposes a service interface
namespace App\Contracts;

// ═══════════════════════════════════════════════════════════════════════
// FOUNDATION INTERFACES
// ═══════════════════════════════════════════════════════════════════════

interface MessageServiceInterface {
    public function send(MessageRequest $request): MessageResult;
    public function sendBulk(BulkMessageRequest $request): BulkMessageResult;
    public function getStatus(string $uuid): MessageStatus;
}

// ═══════════════════════════════════════════════════════════════════════
// B2B INTERFACES
// ═══════════════════════════════════════════════════════════════════════

interface SMBServiceInterface {
    public function find(int $id): ?SMB;
    public function findByEmail(string $email): ?SMB;
    public function updateEngagement(int $smbId, array $data): void;
    public function upgradeTier(int $smbId, int $newTier): void;
}

interface CampaignServiceInterface {
    public function getNextCampaign(SMB $smb): ?Campaign;
    public function queueSend(int $smbId, string $campaignId): void;
    public function triggerRVM(int $campaignSendId): void;
}

interface LearningCenterServiceInterface {
    public function getContent(string $slug): ?Content;
    public function trackView(int $smbId, string $slug, array $data): void;
    public function personalize(Content $content, SMB $smb): array;
}

interface ApprovalServiceInterface {
    public function create(array $data): Approval;
    public function process(int $approvalId): void;
    public function provision(int $approvalId): void;
}

interface InboundServiceInterface {
    public function parseEmail(array $rawEmail): ParsedEmail;
    public function handleCallback(array $callData): void;
    public function respondToChat(int $smbId, string $message): string;
}

interface AIAccountManagerInterface {
    public function generateResponse(string $context, string $input): string;
    public function suggestNextAction(SMB $smb): ?Action;
    public function executeTask(int $smbId, string $taskType): void;
}

// ═══════════════════════════════════════════════════════════════════════
// B2C INTERFACES
// ═══════════════════════════════════════════════════════════════════════

interface NewsletterServiceInterface {
    public function create(CreateNewsletterRequest $request): Newsletter;
    public function build(int $newsletterId): Newsletter;
    public function schedule(int $newsletterId, Carbon $sendAt): Newsletter;
    public function send(int $newsletterId): SendResult;
}

interface AlertServiceInterface {
    public function create(CreateAlertRequest $request): Alert;
    public function approve(int $alertId, int $approvedBy): Alert;
    public function send(int $alertId): SendResult;
}

interface EmergencyBroadcastServiceInterface {
    public function create(CreateEmergencyRequest $request, string $pin): EmergencyBroadcast;
    public function send(int $broadcastId): SendResult;
    public function getDeliveryStatus(int $broadcastId): DeliveryStatus;
}

interface SubscriberServiceInterface {
    public function register(RegisterRequest $request): Subscriber;
    public function verifyEmail(string $token): Subscriber;
    public function updatePreferences(int $id, PreferencesRequest $request): Subscriber;
    public function unsubscribe(string $token): UnsubscribeResult;
}

interface ListServiceInterface {
    public function getNewsletterRecipients(int $communityId, string $freq): array;
    public function getAlertRecipients(int $communityId, string $category): array;
    public function getEmergencyRecipients(array $communityIds): array;
}
```

---

## DATABASE OWNERSHIP

Each module owns specific tables and is responsible for their migrations:

| Module | Tables Owned | Can Read From |
|--------|--------------|---------------|
| **Foundation** |||
| 0 | users, sessions, jobs, failed_jobs | - |
| 0B | message_queue (partitioned P0-P4), delivery_events, channel_health, rate_limits, suppression_list, message_templates | - |
| 0C | (Postal is external - no app tables) | message_queue |
| **B2B Platform** |||
| 1 | smbs, communities, contacts | - |
| 2 | campaigns, campaign_sends, rvm_drops | smbs |
| 3 | content, content_views | smbs |
| 4 | approvals, approval_upsells, provisioning_tasks | smbs, campaigns |
| 5 | callbacks, email_conversations, chat_messages | smbs |
| 6 | (uses other modules' tables via services) | all |
| 7 | ai_tasks, ai_responses | smbs |
| **B2C Platform** |||
| 9 | newsletters, newsletter_content_items, newsletter_templates, newsletter_schedules, sponsors, sponsorships | subscribers, communities |
| 10 | alerts, alert_categories, subscriber_alert_preferences, alert_sends | subscribers, communities |
| 11 | emergency_broadcasts, municipal_admins, emergency_categories, emergency_audit_log | subscribers, communities |
| 12 | subscribers, subscriber_communities, community_email_lists, community_sms_lists, subscriber_events, unsubscribe_tokens | communities |
| **Integration** |||
| 8 | analytics_events, reports | all (read-only) |

---

## API NAMESPACING

Each module owns a namespace in the API:

```
/api/v1/
├── messages/             # Module 0B (internal)
├── webhooks/             # Module 0B, 0C (external callbacks)
│
├── smbs/                 # Module 1
├── campaigns/            # Module 2
├── content/              # Module 3
├── approvals/            # Module 4
├── inbound/              # Module 5
├── command-center/       # Module 6
├── ai/                   # Module 7
│
├── newsletters/          # Module 9
├── sponsors/             # Module 9
├── alerts/               # Module 10
├── emergency/            # Module 11
├── subscribe/            # Module 12 (public)
├── subscriber/           # Module 12 (authenticated)
│
└── analytics/            # Module 8
```

---

## AGENT INSTRUCTIONS

### For Each Agent:

1. **Read your module spec file completely** before starting
2. **Implement the shared interfaces** defined in Module 0
3. **Emit events** for all significant actions
4. **Write tests** for your module's functionality
5. **Document your APIs** in the module's README
6. **Do not modify tables owned by other modules** - use their service interfaces
7. **Use feature flags** for incomplete integrations

### Communication Protocol:

1. Each agent creates a `MODULE-X-STATUS.md` file tracking:
   - Completed features
   - Blocked items (waiting on other modules)
   - API changes that affect other modules

2. Integration points use **Laravel Events** so modules are loosely coupled

3. If you need something from another module:
   - First, check if the interface is defined
   - If not, add it to `INTERFACE-REQUESTS.md`
   - Continue with a stub/mock

---

## TESTING STRATEGY

### Unit Tests (Per Module)
Each module is responsible for its own unit tests:
- 80% code coverage minimum
- Mock external dependencies
- Mock other module services

### Integration Tests (Module 8)
Module 8 handles cross-module integration tests:
- Full workflow tests (email → approval → provisioning)
- End-to-end API tests
- Performance tests

### Test Database
All modules use the same test database schema:
- Module 0 creates all migrations
- Other modules run migrations in tests
- Use `RefreshDatabase` trait

---

## DEPLOYMENT ORDER

```
PHASE 1: Foundation (Week 1-2)
─────────────────────────────────────────────────────────────
Module 0C: Email Gateway (Postal)
   └── Start IMMEDIATELY - IPs need to warm
   └── Deploy infrastructure, configure DNS
   └── 75 IPs begin warming with real traffic

Module 0: Core Infrastructure
   └── Deploy base Laravel app
   └── ALL migrations run (every table created upfront)
   └── Shared contracts available

Module 0B: Communication Infrastructure
   └── Message orchestrator operational
   └── Priority queues configured
   └── Webhook endpoints ready

PHASE 2: Parallel Development (Week 3-7)
─────────────────────────────────────────────────────────────
B2B Platform:
├── Modules 1-5: Can deploy in any order
│   └── Each adds its routes and jobs
├── Modules 6-7: After Module 1 is stable
│   └── Depend on SMB CRM data

B2C Platform:
├── Module 12: Subscriber Management (early)
│   └── Other B2C modules depend on this
├── Modules 9-11: After Module 12 is stable
│   └── Newsletter, Alerts, Emergency

PHASE 3: Integration (Week 8-10)
─────────────────────────────────────────────────────────────
Module 8: Analytics & Integration
   └── Needs all others running
   └── Cross-module integration tests
   └── Dashboard aggregation

PHASE 4: Launch (Week 11-12)
─────────────────────────────────────────────────────────────
Pilot communities (start with 4 readers)
   └── IPs warm naturally with real traffic
   └── Bug fixes + optimization
   └── Monitor deliverability
```

---

## GIT STRATEGY

```
main
├── develop
│   ├── feature/module-0-core
│   ├── feature/module-0b-communication
│   ├── feature/module-0c-email-gateway
│   ├── feature/module-1-crm
│   ├── feature/module-2-campaign
│   ├── feature/module-3-learning
│   ├── feature/module-4-approval
│   ├── feature/module-5-inbound
│   ├── feature/module-6-command
│   ├── feature/module-7-ai
│   ├── feature/module-8-analytics
│   ├── feature/module-9-newsletter
│   ├── feature/module-10-alerts
│   ├── feature/module-11-emergency
│   └── feature/module-12-subscribers
```

**Merge Order:**
1. Module 0, 0B, 0C merge first (foundation)
2. Module 12 merges (B2C subscriber base)
3. Modules 1-7 can merge in any order (B2B)
4. Modules 9-11 merge after 12 (B2C)
5. Module 8 merges last (integration)

---

## QUICK START FOR AGENTS

```bash
# Clone repo
git clone [repo-url]
cd fibonacco

# Create your feature branch
git checkout -b feature/module-X-[name]

# Read your spec
cat docs/MODULE-X-[NAME].md

# Start development
php artisan make:model [YourModel] -mfc
# ... implement spec ...

# Run tests
php artisan test --filter=ModuleX

# Update status
echo "## Status Update $(date)" >> docs/MODULE-X-STATUS.md

# Push for review
git push origin feature/module-X-[name]
```

---

## MODULE SPEC FILES

All module specification files (COMPLETE):

### Foundation
1. `MODULE-0-CORE-INFRASTRUCTURE.md` - Laravel skeleton, all migrations, shared contracts
2. `MODULE-0B-COMMUNICATION-INFRASTRUCTURE.md` - Message orchestrator, priority queues, channel gateways
3. `MODULE-0C-EMAIL-GATEWAY.md` - Postal deployment, IP pools, deliverability

### B2B Platform (SMB-facing)
4. `MODULE-1-SMB-CRM.md` - SMB database, engagement tracking
5. `MODULE-2-CAMPAIGN-ENGINE.md` - Email + RVM outbound campaigns
6. `MODULE-3-LEARNING-CENTER.md` - Educational content delivery
7. `MODULE-4-APPROVAL-SYSTEM.md` - Micro-commitment conversion flow
8. `MODULE-5-INBOUND-ENGINE.md` - Email replies, callbacks, chat
9. `MODULE-6-COMMAND-CENTER.md` - DIY SMB dashboard
10. `MODULE-7-AI-ACCOUNT-MANAGER.md` - Sarah AI for managed SMBs

### B2C Platform (Consumer-facing)
11. `MODULE-9-NEWSLETTER-ENGINE.md` - Daily/weekly newsletters, sponsorships
12. `MODULE-10-ALERT-SYSTEM.md` - Breaking news alerts, multi-channel
13. `MODULE-11-EMERGENCY-BROADCAST.md` - P0 life-safety broadcasts
14. `MODULE-12-SUBSCRIBER-MANAGEMENT.md` - B2C subscribers, preferences

### Integration
15. `MODULE-8-ANALYTICS-INTEGRATION.md` - Dashboards, revenue tracking, cross-module glue

---

## PRIORITY QUEUE SUMMARY

```
P0: EMERGENCY (Module 11)
    └── Life safety broadcasts, override everything
    └── <5 minute delivery target
    
P1: ALERTS (Module 10)
    └── Breaking news alerts
    └── <15 minute delivery target
    
P2: NEWSLETTERS (Module 9)
    └── Scheduled daily/weekly newsletters
    └── Within scheduled window
    
P3: CAMPAIGNS (Module 2)
    └── SMB marketing emails, RVM drops
    └── Within 24h of schedule
    
P4: TRANSACTIONAL (Module 0B)
    └── Password resets, confirmations
    └── Immediate but low volume
```

Each file is self-contained and can be given to a Cursor agent independently.
