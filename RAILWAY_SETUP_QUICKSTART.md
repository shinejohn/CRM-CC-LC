# 🚀 Railway Setup Quick Start

**Application Server:** CRM-CC-LC (already connected to GitHub ✅)  
**Workspace:** Fibonacco Sales

---

## ⚡ QUICK SETUP (3 Steps)

### Step 1: Create PostgreSQL Database (5 minutes)

**In Railway Dashboard:**
1. Go to **Fibonacco Sales** workspace
2. Select **CRM-CC-LC** project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for provisioning (2-3 minutes)
5. ✅ Railway automatically sets `DATABASE_URL`

---

### Step 2: Run Database Setup (5 minutes)

**Option A: Automated Script (Easiest)**
```bash
./scripts/setup-railway-database.sh
```

**Option B: Manual via Dashboard**
1. Go to PostgreSQL service → "Data" tab
2. Run SQL from `infrastructure/migrations/001_initial_schema.sql`
3. Run SQL from `infrastructure/migrations/002_add_presentation_tables.sql`

**See:** `RAILWAY_DATABASE_SETUP.md` for detailed instructions

---

### Step 3: Set Environment Variables (5 minutes)

**In Railway Dashboard:**
1. Go to **CRM-CC-LC** service
2. Click **"Variables"** tab
3. Add these variables:

| Variable | Value |
|----------|-------|
| `APP_NAME` | `Fibonacco Learning Center` |
| `APP_ENV` | `production` |
| `ELEVENLABS_API_KEY` | `63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616` |
| `OPENROUTER_API_KEY` | `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` |
| `QUEUE_CONNECTION` | `database` |

**Note:** `DATABASE_URL` is automatically set by Railway PostgreSQL service.

**See:** `RAILWAY_ENV_VARIABLES.md` for complete list

---

## ✅ DONE!

After these 3 steps:
- ✅ Database is set up with all tables
- ✅ Environment variables configured
- ✅ Application ready to deploy/run

---

## 📚 DETAILED GUIDES

- **`RAILWAY_COMPLETE_SETUP.md`** - Complete step-by-step guide
- **`RAILWAY_DATABASE_SETUP.md`** - Database setup details
- **`RAILWAY_ENV_VARIABLES.md`** - All environment variables reference
- **`scripts/setup-railway-database.sh`** - Automated database setup script

---

## 🎯 WHAT'S NEXT?

After database and variables are set:
1. Application will deploy automatically from GitHub
2. Test database connection
3. Verify all services are running
4. Set up frontend (Cloudflare Pages)

---

**Ready to set up!** 🚂

