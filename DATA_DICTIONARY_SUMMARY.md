# Data Dictionary Summary

## Quick Stats

- **Tables:** 62
- **Migrations:** 72
- **Models:** 85
- **Relationships:** 131
- **File Size:** ~624KB JSON

## Key Database Tables

### Core CRM (8 tables)
- `customers` - Main customer records
- `campaigns` - Campaign definitions
- `campaign_sends` - Send history
- `campaign_landing_pages` - Landing page configs
- `campaign_emails` - Email templates
- `interactions` - Customer interactions
- `conversations` - Conversation threads
- `conversation_messages` - Message history

### Campaign Automation (3 tables)
- `campaign_timelines` - Timeline definitions
- `campaign_timeline_actions` - Timeline actions
- `customer_timeline_progress` - Customer progress

### Knowledge Base (4 tables)
- `knowledge_base` - Knowledge articles
- `faq_categories` - FAQ categories
- `survey_sections` - Survey sections
- `survey_questions` - Survey questions

### Content Management (6 tables)
- `content` - Content items
- `content_views` - View tracking
- `content_templates` - Templates
- `content_versions` - Version history
- `presentation_templates` - Presentation templates
- `generated_presentations` - Generated content

### AI & Dialog (5 tables)
- `ai_personalities` - AI personalities
- `chat_messages` - Chat messages
- `dialog_trees` - Dialog trees
- `dialog_nodes` - Dialog nodes
- `objection_handlers` - Objection handling

### Subscriber Management (8 tables)
- `subscribers` - Subscriber records
- `subscriber_communities` - Community memberships
- `subscriber_events` - Event tracking
- `subscriber_alert_preferences` - Alert preferences
- `community_email_lists` - Email lists
- `community_sms_lists` - SMS lists
- `email_verifications` - Email verification
- `unsubscribe_tokens` - Unsubscribe tokens

### Newsletter System (6 tables)
- `newsletters` - Newsletter records
- `newsletter_content_items` - Content items
- `newsletter_templates` - Templates
- `newsletter_schedules` - Schedules
- `sponsors` - Sponsor records
- `sponsorships` - Sponsorship relationships

### Alert System (3 tables)
- `alerts` - Alert definitions
- `alert_sends` - Send history
- `alert_categories` - Categories

### Emergency System (4 tables)
- `emergency_broadcasts` - Broadcast records
- `emergency_audit_log` - Audit trail
- `emergency_categories` - Categories
- `municipal_admins` - Admin users

### Services & Orders (4 tables)
- `services` - Service catalog
- `service_categories` - Categories
- `service_subscriptions` - Subscriptions
- `orders` - Order records
- `order_items` - Order items

### Analytics & Tracking (4 tables)
- `analytics_events` - Event tracking
- `email_events` - Email events
- `email_conversations` - Email threads
- `content_views` - Content views

### Other (7 tables)
- `users` - User accounts
- `communities` - Community records
- `smbs` - SMB records
- `approvals` - Approval records
- `approval_upsells` - Upsell approvals
- `provisioning_tasks` - Provisioning tasks
- `callbacks` - Callback records

## Key Models

### Core Models
- `Customer` - Main customer model (121 fillable fields)
- `Campaign` - Campaign model
- `CampaignTimeline` - Timeline model
- `CampaignTimelineAction` - Action model
- `CustomerTimelineProgress` - Progress tracking

### Knowledge Models
- `Knowledge` - Knowledge base articles
- `FaqCategory` - FAQ categories
- `SurveySection` - Survey sections
- `SurveyQuestion` - Survey questions

### Content Models
- `Content` - Content items
- `ContentTemplate` - Templates
- `PresentationTemplate` - Presentation templates
- `GeneratedPresentation` - Generated content

### AI Models
- `AiPersonality` - AI personalities
- `ChatMessage` - Chat messages
- `DialogTree` - Dialog trees
- `ObjectionHandler` - Objection handlers

## Key Relationships

### Customer Relationships
- `hasMany` conversations
- `hasMany` interactions
- `hasMany` pendingQuestions
- `hasMany` faqs
- `hasMany` timelineProgress
- `belongsTo` community

### Campaign Relationships
- `hasMany` timelineActions
- `hasMany` customerProgress
- `belongsTo` campaign (for actions)

### Timeline Relationships
- `hasMany` actions
- `hasMany` customerProgress
- `belongsTo` customer (for progress)

## Usage Examples

### View All Tables
```bash
cat DATA_DICTIONARY.json | jq '.database.tables | keys'
```

### View Table Schema
```bash
cat DATA_DICTIONARY.json | jq '.database.tables.customers'
```

### View Model Definition
```bash
cat DATA_DICTIONARY.json | jq '.models.Customer'
```

### View Relationships
```bash
cat DATA_DICTIONARY.json | jq '.database.relationships[] | select(.from == "Customer")'
```

### View Migrations for Table
```bash
cat DATA_DICTIONARY.json | jq '.database.tables.customers.migrations'
```

## Regeneration

To regenerate the dictionary:
```bash
npm run data-dictionary
```

Or directly:
```bash
node scripts/generate-data-dictionary.js
```

---

**Generated:** January 2026  
**File:** `DATA_DICTIONARY.json`  
**Documentation:** `DATA_DICTIONARY_README.md`

