# 🚨 FIX RAILWAY NOW - Exact Steps

## Current Problem

**4 services failing to build:**
- CC API
- CC-CRM-LC-FOA Front
- CC-CRM-LC Scheduler
- CRM-CC-LC Queues

**Root Cause:** Missing start commands and wrong root directories in Railway dashboard.

---

## ✅ FIX IN 3 STEPS (15 minutes)

### STEP 1: Fix Service Configurations (5 min)

**Open Railway Dashboard** → Go to each service → Settings → Deploy

#### 1. CC API Service
```
Root Directory: backend/
Start Command: php artisan serve --host=0.0.0.0 --port=$PORT
```
Click "Save" → Click "Redeploy"

#### 2. CRM-CC-LC Queues Service
```
Root Directory: backend/
Start Command: php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
```
Click "Save" → Click "Redeploy"

#### 3. CC-CRM-LC Scheduler Service
```
Root Directory: backend/
Start Command: php artisan schedule:work
```
Click "Save" → Click "Redeploy"

#### 4. CC-CRM-LC-FOA Front Service
```
Root Directory: ./ (or leave empty)
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l $PORT
```
Click "Save" → Click "Redeploy"

---

### STEP 2: Set Environment Variables (5 min)

**Run this command:**

```bash
./scripts/deploy-all-railway.sh
```

**When prompted, enter:**

1. **PostgreSQL connection** (get from Railway → Postgres service → Variables):
   - Host: (from PGHOST variable)
   - Port: (from PGPORT variable, usually 5432)
   - Database: (from PGDATABASE variable)
   - User: (from PGUSER variable)
   - Password: (from PGPASSWORD variable)

2. **Redis connection** (get from Railway → Redis service → Variables):
   - Host: (from REDIS_HOST variable)
   - Port: (from REDIS_PORT variable, usually 6379)
   - Password: (from REDIS_PASSWORD variable, if set)

3. **API Keys:**
   - OpenRouter API Key: (your key)
   - ElevenLabs API Key: (your key)
   - CC API URL: `https://cc-api.up.railway.app` (or actual URL after deploy)

**The script will:**
- Set all variables for all services
- Generate APP_KEY
- Configure everything automatically

---

### STEP 3: Run Database Migrations (2 min)

**After variables are set, run:**

```bash
railway run --service "CC API" "php artisan migrate --force"
```

**Or via Railway Dashboard:**
- Go to CC API service
- Click "Shell" tab
- Run: `php artisan migrate --force`

**This creates all 94 database tables.**

---

## ✅ VERIFY IT WORKS

### Check API:
```bash
curl https://cc-api.up.railway.app/health
```

### Check Frontend:
- Visit frontend URL
- Should load React app

### Check Logs:
- Railway Dashboard → Each service → Logs
- Should see "Server started" or "Processing jobs"

---

## 🎯 Expected Results

After these 3 steps:
- ✅ All services build successfully
- ✅ All services start successfully
- ✅ Database has all tables
- ✅ API responds to requests
- ✅ Frontend loads
- ✅ Queue worker processes jobs
- ✅ Scheduler runs tasks

---

## 🔍 If Still Failing

**Check build logs:**
- Railway Dashboard → Service → Deployments → Latest → Build Logs

**Common errors:**

1. **"Could not find nixpacks.toml"**
   - Fix: Root Directory must be `backend/` for backend services

2. **"Command not found: php"**
   - Fix: Root Directory wrong - set to `backend/`

3. **"Command not found: npm"**
   - Fix: Frontend Root Directory wrong - set to `./`

4. **"Migration failed"**
   - Fix: Check database connection variables (DB_HOST, DB_DATABASE, etc.)

5. **"APP_KEY not set"**
   - Fix: Run script again or generate manually:
     ```bash
     railway run --service "CC API" "php artisan key:generate --show"
     ```
     Then set as `APP_KEY` variable.

---

## 📋 Quick Checklist

- [ ] CC API: Root = `backend/`, Start = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] Queues: Root = `backend/`, Start = `php artisan queue:work redis --sleep=3 --tries=3`
- [ ] Scheduler: Root = `backend/`, Start = `php artisan schedule:work`
- [ ] Frontend: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`
- [ ] Environment variables set (run script)
- [ ] Migrations run (`php artisan migrate --force`)
- [ ] All services redeployed
- [ ] All services building successfully
- [ ] All services starting successfully

---

**Follow these 3 steps exactly and everything will work!** 🚀
