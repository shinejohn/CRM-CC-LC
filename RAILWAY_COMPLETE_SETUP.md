# 🚂 Complete Railway Setup Guide

**Application Server:** CRM-CC-LC  
**Workspace:** Fibonacco Sales  
**GitHub:** Already connected ✅

---

## 📋 SETUP OVERVIEW

Since the server is already attached to GitHub, we need to:

1. ✅ **Set up PostgreSQL Database**
2. ✅ **Configure Environment Variables**
3. ✅ **Run Database Migrations**
4. ✅ **Optional: Set up Redis**

---

## 🗄️ STEP 1: DATABASE SETUP

### A. Create PostgreSQL Service

**In Railway Dashboard:**

1. Go to **Fibonacco Sales** workspace
2. Select **CRM-CC-LC** project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for service to provision (2-3 minutes)
5. Railway automatically creates `DATABASE_URL` environment variable

**Service will be named:** `postgres` or auto-generated name

---

### B. Enable PostgreSQL Extensions

After PostgreSQL service is created:

**Option 1: Via Railway Dashboard**
1. Go to PostgreSQL service → "Data" tab
2. Click "Query" button
3. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Option 2: Via Railway CLI**
```bash
# Link to project (if not already)
railway link

# Connect to PostgreSQL
railway connect postgres

# Run extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

### C. Run Database Migrations

**Migration Files:**
- `infrastructure/migrations/001_initial_schema.sql`
- `infrastructure/migrations/002_add_presentation_tables.sql`

**Option 1: Automated Script (Easiest)**
```bash
# Make script executable (already done)
chmod +x scripts/setup-railway-database.sh

# Run setup script
./scripts/setup-railway-database.sh
```

**Option 2: Manual via Railway Dashboard**
1. Go to PostgreSQL service → "Data" tab
2. Open `infrastructure/migrations/001_initial_schema.sql`
3. Copy all SQL content
4. Paste into Railway SQL editor
5. Click "Run"
6. Repeat for `002_add_presentation_tables.sql`

**Option 3: Via Railway CLI**
```bash
railway link
railway run psql $DATABASE_URL < infrastructure/migrations/001_initial_schema.sql
railway run psql $DATABASE_URL < infrastructure/migrations/002_add_presentation_tables.sql
```

---

## 🔐 STEP 2: ENVIRONMENT VARIABLES

### Required Variables

Set these in Railway Dashboard → CRM-CC-LC → Variables:

#### Application Settings

| Variable | Value | Notes |
|----------|-------|-------|
| `APP_NAME` | `Fibonacco Learning Center` | |
| `APP_ENV` | `production` | |
| `APP_KEY` | `(generate)` | See below |
| `APP_URL` | `(auto-set)` | Railway provides |

**Generate APP_KEY:**
```bash
# If you have Laravel backend setup locally
php artisan key:generate --show

# Or Railway will generate on first deploy
```

#### API Keys (Provided)

| Variable | Value |
|----------|-------|
| `ELEVENLABS_API_KEY` | `63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616` |
| `OPENROUTER_API_KEY` | `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` |

#### Queue Configuration

| Variable | Value |
|----------|-------|
| `QUEUE_CONNECTION` | `database` or `redis` |

**Note:** `DATABASE_URL` is automatically set by Railway PostgreSQL service.

### Setting Variables in Railway

**Method 1: Railway Dashboard (Recommended)**
1. Go to Railway Dashboard
2. Select CRM-CC-LC service
3. Click "Variables" tab
4. Click "New Variable"
5. Add each variable
6. Click "Add"

**Method 2: Railway CLI**
```bash
railway link
railway variables set APP_NAME="Fibonacco Learning Center"
railway variables set APP_ENV="production"
railway variables set ELEVENLABS_API_KEY="63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616"
railway variables set OPENROUTER_API_KEY="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"
railway variables set QUEUE_CONNECTION="database"
```

---

## 📝 COMPLETE VARIABLE LIST

See `RAILWAY_ENV_VARIABLES.md` for complete reference with all optional variables.

---

## ✅ SETUP CHECKLIST

### Database
- [ ] PostgreSQL service created in Railway
- [ ] Extensions enabled (uuid-ossp, pg_trgm, vector)
- [ ] Migration 001_initial_schema.sql run
- [ ] Migration 002_add_presentation_tables.sql run
- [ ] Verify tables created

### Environment Variables
- [ ] APP_NAME set
- [ ] APP_ENV set
- [ ] APP_KEY set (or will generate on deploy)
- [ ] ELEVENLABS_API_KEY set
- [ ] OPENROUTER_API_KEY set
- [ ] QUEUE_CONNECTION set
- [ ] DATABASE_URL verified (auto-set)

### Verification
- [ ] Database connection works
- [ ] All tables accessible
- [ ] Environment variables loaded

---

## 🚀 QUICK SETUP SUMMARY

**Once Railway is authenticated:**

```bash
# 1. Link to project
railway link

# 2. Add PostgreSQL (via dashboard) then verify
railway variables get DATABASE_URL

# 3. Run database setup script
./scripts/setup-railway-database.sh

# 4. Set environment variables (via dashboard or CLI)
# See RAILWAY_ENV_VARIABLES.md for complete list
```

---

## 📚 ADDITIONAL RESOURCES

- `RAILWAY_DATABASE_SETUP.md` - Detailed database setup
- `RAILWAY_ENV_VARIABLES.md` - Complete environment variables reference
- `scripts/setup-railway-database.sh` - Automated database setup script

---

## 🎯 NEXT STEPS

After database and variables are set:

1. **Deploy Application**
   - Railway will auto-deploy from GitHub
   - First deployment may take a few minutes

2. **Verify Deployment**
   - Check Railway deployment logs
   - Test database connection
   - Verify environment variables

3. **Set Up Frontend**
   - Deploy frontend to Cloudflare Pages
   - Configure API endpoint
   - Test integration

---

**Ready to set up database and configure variables!** 🚂






