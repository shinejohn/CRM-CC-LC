# 🚨 GET RAILWAY WORKING - Complete Fix

## 🎯 What's Wrong

All 4 services are failing because:
1. **Missing Start Commands** - Railway doesn't know how to start services
2. **Wrong Root Directories** - Services pointing to wrong directories
3. **Missing Environment Variables** - Database/Redis connections failing

---

## ✅ FIX IT NOW - 3 Steps

### Step 1: Fix Service Configurations (5 minutes)

**Go to Railway Dashboard** and fix each service:

#### CC API:
- Settings → Deploy
- Root Directory: `backend/`
- Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`
- Save → Redeploy

#### CRM-CC-LC Queues:
- Settings → Deploy
- Root Directory: `backend/`
- Start Command: `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
- Save → Redeploy

#### CC-CRM-LC Scheduler:
- Settings → Deploy
- Root Directory: `backend/`
- Start Command: `php artisan schedule:work`
- Save → Redeploy

#### CC-CRM-LC-FOA Front:
- Settings → Deploy
- Root Directory: `./` (or empty)
- Build Command: `npm install && npm run build`
- Start Command: `npx serve -s dist -l $PORT`
- Save → Redeploy

---

### Step 2: Set Environment Variables (5 minutes)

**Run this script:**

```bash
./scripts/deploy-all-railway.sh
```

**It will:**
- Prompt for PostgreSQL connection (get from Railway → Postgres service → Variables)
- Prompt for Redis connection (get from Railway → Redis service → Variables)
- Prompt for API keys
- Set all variables automatically

**Or set manually** - see `RAILWAY_ENV_SETUP.md` for complete list.

---

### Step 3: Run Migrations (2 minutes)

**After variables are set:**

```bash
railway run --service "CC API" "php artisan migrate --force"
```

**Or via Railway Dashboard:**
- CC API → Shell → Run: `php artisan migrate --force`

---

## ✅ That's It!

After these 3 steps:
- ✅ All services will build
- ✅ All services will start
- ✅ Database will have all tables
- ✅ Everything will work end-to-end

---

## 🔍 If Still Failing

**Check build logs:**
- Railway Dashboard → Service → Deployments → Latest → Build Logs

**Common fixes:**
- Wrong Root Directory → Fix in Settings → Deploy
- Missing Start Command → Add in Settings → Deploy
- Missing Environment Variables → Set in Variables tab
- Migration errors → Check database connection variables

---

**Follow these 3 steps and everything will work!** 🚀
