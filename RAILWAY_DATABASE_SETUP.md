# 🗄️ Railway Database Setup Guide

**Application Server:** CRM-CC-LC  
**Workspace:** Fibonacco Sales

---

## 📋 DATABASE SETUP STEPS

### Step 1: Create PostgreSQL Database Service

In Railway dashboard for CRM-CC-LC project:

1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Service will be created automatically
3. Railway will provide connection URL as `DATABASE_URL` environment variable

**Service Name:** `learning-center-db` (or auto-generated)

---

### Step 2: Enable pgvector Extension

Once PostgreSQL service is created, connect and enable extensions:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Run this via Railway CLI or database dashboard:**
```bash
# Connect to database
railway connect postgres

# Then run SQL commands above
```

---

### Step 3: Run Database Migrations

Two migration files need to be run:

1. `infrastructure/migrations/001_initial_schema.sql`
   - Core tables (knowledge_base, faq_categories, etc.)
   - Industry categories
   - Survey tables
   - Vector search setup

2. `infrastructure/migrations/002_add_presentation_tables.sql`
   - Presentation templates
   - Generated presentations
   - Presenters table

**Migration Methods:**

**Option A: Via Railway CLI (Recommended)**
```bash
# Link to CRM-CC-LC project
railway link

# Connect to PostgreSQL
railway connect postgres

# Run migrations
railway run psql $DATABASE_URL < infrastructure/migrations/001_initial_schema.sql
railway run psql $DATABASE_URL < infrastructure/migrations/002_add_presentation_tables.sql
```

**Option B: Via Railway Database Dashboard**
- Go to PostgreSQL service → "Data" tab
- Copy SQL from migration files
- Paste and execute in SQL editor

**Option C: Via Laravel Migrations (Future)**
- After Laravel backend is set up
- Migrations will be converted to Laravel format
- Run: `php artisan migrate`

---

## 🔧 ENVIRONMENT VARIABLES SETUP

### Database Connection (Auto-provided by Railway)

Railway automatically provides:
- `DATABASE_URL` - PostgreSQL connection string

**No action needed** - Railway sets this automatically when PostgreSQL service is added.

---

### Application Environment Variables

Set these in Railway dashboard → CRM-CC-LC service → Variables:

#### Required Variables

```bash
# Application
APP_NAME="Fibonacco Learning Center"
APP_ENV=production
APP_KEY=                  # Generate with: php artisan key:generate
APP_URL=https://your-railway-app.up.railway.app

# Database (auto-provided, but verify)
DATABASE_URL=             # Auto-set by Railway PostgreSQL service

# Redis (if using Redis service)
REDIS_URL=                # Auto-set by Railway Redis service
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis    # or database
```

#### External API Keys

```bash
# ElevenLabs (TTS)
ELEVENLABS_API_KEY=63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616

# OpenRouter (AI Conversations)
OPENROUTER_API_KEY=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

# OpenAI (Embeddings)
OPENAI_API_KEY=           # Your OpenAI API key

# Cloudflare R2 (File Storage)
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=fibonacco-assets
CLOUDFLARE_R2_PUBLIC_URL=https://assets.fibonacco.com
```

#### Optional Variables

```bash
# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis

# Mail (if using AWS SES)
MAIL_MAILER=ses
MAIL_FROM_ADDRESS=noreply@fibonacco.com
MAIL_FROM_NAME="Fibonacco Learning Center"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 📝 COMPLETE ENVIRONMENT VARIABLES LIST

See `RAILWAY_ENV_VARIABLES.md` for complete reference.

---

## ✅ SETUP CHECKLIST

### Database Setup
- [ ] PostgreSQL service created in Railway
- [ ] pgvector extension enabled
- [ ] Migration 001_initial_schema.sql run
- [ ] Migration 002_add_presentation_tables.sql run
- [ ] Verify tables created successfully

### Environment Variables
- [ ] APP_KEY generated and set
- [ ] DATABASE_URL verified (auto-set)
- [ ] ELEVENLABS_API_KEY set
- [ ] OPENROUTER_API_KEY set
- [ ] OPENAI_API_KEY set (if using)
- [ ] Cloudflare R2 credentials set (if using)
- [ ] Redis variables set (if using Redis service)

### Verification
- [ ] Database connection tested
- [ ] Tables accessible
- [ ] Extensions enabled
- [ ] Environment variables loaded correctly

---

## 🚀 QUICK SETUP COMMANDS

Once Railway is authenticated:

```bash
# 1. Link to project
railway link

# 2. Add PostgreSQL service (via dashboard or CLI)
railway add postgresql

# 3. Enable extensions
railway connect postgres
# Then run SQL extensions

# 4. Run migrations
railway run psql $DATABASE_URL < infrastructure/migrations/001_initial_schema.sql
railway run psql $DATABASE_URL < infrastructure/migrations/002_add_presentation_tables.sql

# 5. Set environment variables (see RAILWAY_ENV_VARIABLES.md)
```

---

**Ready to set up database and environment variables!** 🗄️






