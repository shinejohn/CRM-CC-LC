# 🚀 Railway Setup - Step by Step

## ⚠️ Important: Link Project First

Before running the environment setup script, you need to link your Railway project:

```bash
railway link
```

Then select your project from the list.

---

## 🔧 Run the Setup Script

After linking, run:

```bash
./scripts/setup-railway-env.sh
```

The script will:
1. ✅ Auto-detect PostgreSQL variables
2. ✅ Auto-detect Redis variables  
3. ✅ Prompt for API keys
4. ✅ Set all variables for all services

---

## 📋 Manual Setup (If Script Doesn't Work)

If you prefer to set variables manually or the script has issues:

### Step 1: Get Database Variables

Go to **Postgres CC CRM SMB** → **Variables** and note:
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

### Step 2: Get Redis Variables

Go to **Redis CC** → **Variables** and note:
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (if set)

### Step 3: Set Variables for Each Service

Use Railway CLI or Dashboard to set variables for each service.

**Railway CLI syntax:**
```bash
railway variables --set "KEY=VALUE" --service "Service Name"
```

---

## 🎯 Quick Manual Setup Commands

After linking your project, you can run these commands:

```bash
# Set CC API variables (example - replace with actual values)
railway variables --set "APP_NAME=LearningCenter" --service "CC API"
railway variables --set "APP_ENV=production" --service "CC API"
railway variables --set "DB_HOST=<your-pg-host>" --service "CC API"
# ... etc
```

See `RAILWAY_ENV_SETUP.md` for complete variable list.

---

**Next:** Link your project with `railway link`, then run the script! 🚀
