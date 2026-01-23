# Data Dictionary - Learning Center Platform

## Overview

This data dictionary provides a comprehensive view of the database schema, migrations, and Laravel models for the Learning Center Platform. It was generated automatically from the codebase to support data planning and architecture exercises.

## File Structure

- **`DATA_DICTIONARY.json`** - Complete data dictionary in JSON format
- **`DATA_DICTIONARY_README.md`** - This documentation file

## Contents

The data dictionary includes three main sections:

### 1. Database Schema (`database.tables`)

Complete schema for all database tables including:
- Table names
- Columns with types, nullable status, defaults
- Indexes
- Foreign keys
- Related migrations

**Example:**
```json
{
  "customers": {
    "name": "customers",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "nullable": false,
        "default": null
      },
      {
        "name": "business_name",
        "type": "string",
        "nullable": false
      }
    ],
    "indexes": [...],
    "foreignKeys": [...],
    "migrations": [...]
  }
}
```

### 2. Migrations (`migrations`)

Metadata for all database migrations including:
- Migration file name
- Class name
- Table name
- Migration type (create/alter)
- Columns defined
- Indexes created
- Foreign keys added

**Example:**
```json
{
  "fileName": "2026_01_20_000002_create_campaign_timelines.php",
  "className": "CreateCampaignTimelines",
  "tableName": "campaign_timelines",
  "type": "create",
  "columns": [...],
  "indexes": [...],
  "foreignKeys": [...]
}
```

### 3. Laravel Models (`models`)

Complete model definitions including:
- Model class name
- Table name
- Fillable fields
- Type casts
- Relationships
- Timestamps configuration
- Primary key configuration

**Example:**
```json
{
  "Customer": {
    "className": "Customer",
    "tableName": "customers",
    "fillable": ["business_name", "email", ...],
    "casts": {
      "hours": "array",
      "services": "array"
    },
    "relationships": [
      {
        "name": "timelineProgress",
        "type": "hasMany",
        "relatedModel": "CustomerTimelineProgress"
      }
    ],
    "timestamps": true,
    "keyType": "string",
    "incrementing": false
  }
}
```

## Statistics

- **Total Tables:** 62
- **Total Migrations:** 72
- **Total Models:** 85
- **Total Relationships:** 131

## Key Tables

### Core CRM Tables
- `customers` - Customer records
- `campaigns` - Campaign definitions
- `campaign_sends` - Campaign send history
- `interactions` - Customer interactions

### Campaign Automation
- `campaign_timelines` - Campaign timeline definitions
- `campaign_timeline_actions` - Individual timeline actions
- `customer_timeline_progress` - Customer progress tracking

### Knowledge Base
- `knowledge_base` - Knowledge articles/FAQs
- `faq_categories` - FAQ category hierarchy
- `survey_sections` - Survey sections
- `survey_questions` - Survey questions

### Content Management
- `content` - Content items
- `content_views` - Content view tracking
- `presentation_templates` - Presentation templates
- `generated_presentations` - Generated presentations

### AI & Conversations
- `ai_personalities` - AI personality definitions
- `chat_messages` - Chat message history
- `conversations` - Conversation threads
- `dialog_trees` - Dialog tree definitions

### Subscriber Management
- `subscribers` - Subscriber records
- `subscriber_events` - Subscriber event tracking
- `community_email_lists` - Email list management
- `community_sms_lists` - SMS list management

### Newsletter System
- `newsletters` - Newsletter definitions
- `newsletter_content_items` - Newsletter content
- `sponsors` - Sponsor records
- `sponsorships` - Sponsorship relationships

### Alert System
- `alerts` - Alert definitions
- `alert_sends` - Alert send history
- `alert_categories` - Alert categories

### Emergency System
- `emergency_broadcasts` - Emergency broadcast records
- `emergency_audit_log` - Audit trail
- `municipal_admins` - Municipal admin users

### Services & Orders
- `services` - Service catalog
- `service_categories` - Service categories
- `orders` - Order records
- `order_items` - Order line items

## Relationships

The data dictionary includes a comprehensive relationship map showing:
- Model relationships (belongsTo, hasMany, etc.)
- Foreign key relationships
- Many-to-many relationships

**Example Relationship:**
```json
{
  "from": "Customer",
  "relationship": "timelineProgress",
  "type": "hasMany",
  "to": "CustomerTimelineProgress"
}
```

## Usage

### For Data Planning

1. **Schema Analysis:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.database.tables | keys'
   ```

2. **Table Details:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.database.tables.customers'
   ```

3. **Model Relationships:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.database.relationships[] | select(.from == "Customer")'
   ```

### For Architecture Planning

1. **Migration Timeline:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.migrations[] | {file: .fileName, table: .tableName, type: .type}'
   ```

2. **Model Coverage:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.models | keys'
   ```

3. **Relationship Graph:**
   ```bash
   cat DATA_DICTIONARY.json | jq '.database.relationships'
   ```

## Regenerating the Dictionary

To regenerate the data dictionary after schema changes:

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center
node scripts/generate-data-dictionary.js
```

## Data Dictionary Structure

```json
{
  "metadata": {
    "generatedAt": "ISO timestamp",
    "version": "1.0.0",
    "project": "Learning Center Platform",
    "description": "..."
  },
  "database": {
    "tables": {
      "table_name": {
        "name": "table_name",
        "columns": [...],
        "indexes": [...],
        "foreignKeys": [...],
        "migrations": [...]
      }
    },
    "relationships": [...]
  },
  "migrations": [...],
  "models": {
    "ModelName": {
      "className": "ModelName",
      "tableName": "table_name",
      "fillable": [...],
      "casts": {...},
      "relationships": [...],
      "timestamps": true,
      "keyType": "string",
      "incrementing": false
    }
  }
}
```

## Notes

- The dictionary is generated automatically from migration files and model files
- Some complex migrations may not be fully parsed (e.g., those with raw SQL)
- Relationship detection relies on standard Laravel patterns
- Column parsing may miss some edge cases in complex migrations

## Next Steps

1. **Review Schema:** Use the dictionary to understand table relationships
2. **Plan Changes:** Use for planning schema modifications
3. **Documentation:** Reference for API documentation
4. **Data Migration:** Use for planning data migrations
5. **Architecture:** Use for system architecture planning

---

**Generated:** January 2026  
**Version:** 1.0.0  
**Total Size:** ~2.5MB JSON file

