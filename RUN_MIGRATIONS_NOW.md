# 🚀 Run Database Migrations Now

**Database:** Railway PostgreSQL  
**Connection:** postgres.railway.internal (internal) / trolley.proxy.rlwy.net:53826 (external)

---

## ✅ QUICK MIGRATION GUIDE

### Option 1: Via Railway Dashboard (Easiest)

1. **Get DATABASE_URL from Railway:**
   - Go to Railway Dashboard
   - Select PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` value

2. **Connect to Database:**
   - Go to PostgreSQL service → "Data" tab
   - Click "Query" button

3. **Enable Extensions:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

4. **Run Migration 1:**
   - Open `infrastructure/migrations/001_initial_schema.sql`
   - Copy all SQL content
   - Paste into Railway SQL editor
   - Click "Run"

5. **Run Migration 2:**
   - Open `infrastructure/migrations/002_add_presentation_tables.sql`
   - Copy all SQL content
   - Paste into Railway SQL editor
   - Click "Run"

---

### Option 2: Via Command Line

**If you have DATABASE_URL:**

```bash
# Set DATABASE_URL (from Railway dashboard)
export DATABASE_URL="postgresql://user:password@trolley.proxy.rlwy.net:53826/railway"

# Run migrations
./scripts/run-migrations.sh
```

**Or manually:**

```bash
# Enable extensions
psql "$DATABASE_URL" <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
EOF

# Run migrations
psql "$DATABASE_URL" < infrastructure/migrations/001_initial_schema.sql
psql "$DATABASE_URL" < infrastructure/migrations/002_add_presentation_tables.sql
```

---

### Option 3: Via Railway CLI

```bash
# Link to project
railway link

# Run migrations using Railway's DATABASE_URL
railway run psql $DATABASE_URL < infrastructure/migrations/001_initial_schema.sql
railway run psql $DATABASE_URL < infrastructure/migrations/002_add_presentation_tables.sql
```

---

## 📋 WHAT THE MIGRATIONS CREATE

### Migration 1: Initial Schema
- `knowledge_base` table
- `faq_categories` table
- `industry_categories` table
- `industry_subcategories` table
- `survey_sections` table
- `survey_questions` table
- Indexes and functions

### Migration 2: Presentation Tables
- `presentation_templates` table
- `presenters` table
- `generated_presentations` table

---

## ✅ VERIFICATION

After running migrations, verify:

```sql
-- Check tables
\dt

-- Check extensions
SELECT * FROM pg_extension;

-- Check knowledge_base table
SELECT COUNT(*) FROM knowledge_base;
```

---

## 🎯 RECOMMENDED METHOD

**Use Railway Dashboard SQL Editor** - It's the easiest:
1. No command line needed
2. Visual interface
3. See results immediately
4. Copy/paste SQL directly

---

**Ready to run migrations!** 🚀

