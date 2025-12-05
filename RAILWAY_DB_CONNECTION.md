# 🗄️ Railway PostgreSQL Connection

**Host:** trolley.proxy.rlwy.net  
**Port:** 53826

---

## 🔐 CONNECTION STRING FORMAT

Railway PostgreSQL connection strings typically look like:
```
postgresql://username:password@trolley.proxy.rlwy.net:53826/railway
```

Railway usually provides the full connection string as `DATABASE_URL` environment variable.

---

## 📋 SETUP OPTIONS

### Option 1: Railway Dashboard Connection

If you have the full `DATABASE_URL` from Railway:
1. Railway automatically sets this as environment variable
2. Connection includes username, password, and database name
3. Use this for migrations

### Option 2: Manual Connection

If you need to connect manually:
- Host: `trolley.proxy.rlwy.net`
- Port: `53826`
- You'll also need:
  - Username
  - Password
  - Database name

---

## 🚀 RUNNING MIGRATIONS

### Method 1: Via Railway CLI (Recommended)

```bash
# Link to project
railway link

# Railway automatically uses DATABASE_URL environment variable
# Run migrations
railway run psql $DATABASE_URL < infrastructure/migrations/001_initial_schema.sql
railway run psql $DATABASE_URL < infrastructure/migrations/002_add_presentation_tables.sql
```

### Method 2: Via Railway Dashboard

1. Go to PostgreSQL service in Railway dashboard
2. Click "Data" or "Query" tab
3. Copy SQL from migration files
4. Paste and execute

### Method 3: Direct Connection (if you have full credentials)

```bash
# Full connection string format:
psql "postgresql://username:password@trolley.proxy.rlwy.net:53826/railway" < infrastructure/migrations/001_initial_schema.sql
```

---

## ✅ NEXT STEPS

1. **Get Full Connection String**
   - Check Railway dashboard for `DATABASE_URL`
   - Or get from Railway service variables

2. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

3. **Run Migrations**
   - Use one of the methods above
   - Migration files: 001_initial_schema.sql and 002_add_presentation_tables.sql

---

**Ready to set up database!** 🗄️

