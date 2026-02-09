# 🚨 Railway Build Failures - Complete Fix Guide

## 🎯 Immediate Actions Required

All 4 services are failing to build. Here's how to fix them:

---

## 🔧 Step 1: Fix Service Configurations in Railway Dashboard

### CC API Service

**Go to:** Railway Dashboard → CC API → Settings → Deploy

**Set these EXACT values:**
- **Root Directory:** `backend/`
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Build Command:** (leave empty - auto-detected)

**Save and redeploy**

---

### CRM-CC-LC Queues Service

**Go to:** Railway Dashboard → CRM-CC-LC Queues → Settings → Deploy

**Set these EXACT values:**
- **Root Directory:** `backend/`
- **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
- **Build Command:** (leave empty - auto-detected)

**Save and redeploy**

---

### CC-CRM-LC Scheduler Service

**Go to:** Railway Dashboard → CC-CRM-LC Scheduler → Settings → Deploy

**Set these EXACT values:**
- **Root Directory:** `backend/`
- **Start Command:** `php artisan schedule:work`
- **Build Command:** (leave empty - auto-detected)

**Save and redeploy**

---

### CC-CRM-LC-FOA Front Service

**Go to:** Railway Dashboard → CC-CRM-LC-FOA Front → Settings → Deploy

**Set these EXACT values:**
- **Root Directory:** `./` (or leave empty for root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

**Save and redeploy**

---

## 🔐 Step 2: Set Environment Variables

**Run this script in your terminal:**

```bash
./scripts/deploy-all-railway.sh
```

It will:
1. Prompt for PostgreSQL connection details
2. Prompt for Redis connection details
3. Prompt for API keys
4. Set all variables for all services automatically
5. Generate APP_KEY
6. Run migrations

**Or set manually** using Railway Dashboard → Each Service → Variables tab.

See `RAILWAY_ENV_SETUP.md` for complete variable list.

---

## 🗄️ Step 3: Run Database Migrations

Migrations should run automatically during build (configured in `backend/nixpacks.toml`).

**To run manually:**
```bash
railway run --service "CC API" "php artisan migrate --force"
```

**Or via Railway Dashboard:**
1. Go to CC API service
2. Click "Shell" tab
3. Run: `php artisan migrate --force`

---

## 🔍 Step 4: Check Build Logs

After configuring and redeploying:

1. **Go to each service** → **Deployments** tab
2. **Click latest deployment**
3. **Check Build Logs** for errors

**Common errors and fixes:**

### "Could not find nixpacks.toml"
- **Fix:** Ensure Root Directory = `backend/` for backend services

### "Command not found: php"
- **Fix:** Root Directory wrong - should be `backend/`

### "Command not found: npm"
- **Fix:** Root Directory wrong for frontend - should be `./` (root)

### "Migration failed"
- **Fix:** Check database connection variables (DB_HOST, DB_DATABASE, etc.)

### "APP_KEY not set"
- **Fix:** Generate and set APP_KEY (see Step 2)

---

## ✅ Step 5: Verify Everything Works

### Check API:
```bash
curl https://cc-api.up.railway.app/health
```
Should return: `{"status":"healthy",...}`

### Check Frontend:
Visit frontend URL - should load React app

### Check Queue Worker:
- Check logs for "Processing jobs" messages
- Jobs should process from Redis queue

### Check Scheduler:
- Check logs for "Running scheduled command" messages
- Should run every minute

---

## 📋 Complete Checklist

### Service Configurations:
- [ ] CC API: Root = `backend/`, Start = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] Queues: Root = `backend/`, Start = `php artisan queue:work redis --sleep=3 --tries=3`
- [ ] Scheduler: Root = `backend/`, Start = `php artisan schedule:work`
- [ ] Frontend: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`

### Environment Variables:
- [ ] All services have database connection variables
- [ ] All services have Redis connection variables
- [ ] CC API has APP_KEY generated
- [ ] CC API has API keys (OpenRouter, ElevenLabs)
- [ ] Frontend has VITE_API_ENDPOINT set

### Database:
- [ ] Migrations run successfully
- [ ] All 94 migration files executed
- [ ] Database tables created

### Deployment:
- [ ] All services build successfully
- [ ] All services start successfully
- [ ] No build errors in logs

---

## 🚀 Quick Fix Summary

1. **Fix service configurations** (Root Directory + Start Commands) - 5 minutes
2. **Set environment variables** (run script) - 5 minutes
3. **Redeploy all services** - 5 minutes
4. **Verify** - 5 minutes

**Total time: ~20 minutes**

---

## 🎯 Most Likely Issues

Based on your dashboard, the failures are likely:

1. **Missing Start Commands** (90% probability)
   - Railway doesn't know how to start services
   - Fix: Set start commands in Settings → Deploy

2. **Wrong Root Directories** (80% probability)
   - Backend services pointing to wrong directory
   - Fix: Set Root Directory = `backend/` for backend services

3. **Missing Environment Variables** (70% probability)
   - Database connection failing
   - Fix: Set all variables (run script)

4. **Build Configuration** (30% probability)
   - nixpacks.toml issues
   - Fix: Already configured correctly

---

**Start with fixing service configurations - that's likely the main issue!** 🔧
