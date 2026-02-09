# 🚀 Complete Railway Deployment Fix - Step by Step

## 🎯 Goal: Get All Services Working

**Current Status:**
- ✅ Postgres CC CRM SMB (Online)
- ✅ Redis CC (Online)
- ❌ CC API (Build failed)
- ❌ CC-CRM-LC-FOA Front (Build failed)
- ❌ CC-CRM-LC Scheduler (Build failed)
- ❌ CRM-CC-LC Queues (Build failed)

---

## 📋 Step-by-Step Fix

### Step 1: Fix Service Configurations (CRITICAL)

Go to Railway Dashboard and fix each service:

#### 🔧 CC API Service

**Railway Dashboard → CC API → Settings → Deploy:**

1. **Root Directory:** `backend/`
2. **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
3. **Build Command:** (leave empty - uses nixpacks.toml)

**Click "Save"**

---

#### 🔧 CRM-CC-LC Queues Service

**Railway Dashboard → CRM-CC-LC Queues → Settings → Deploy:**

1. **Root Directory:** `backend/`
2. **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
3. **Build Command:** (leave empty)

**Click "Save"**

---

#### 🔧 CC-CRM-LC Scheduler Service

**Railway Dashboard → CC-CRM-LC Scheduler → Settings → Deploy:**

1. **Root Directory:** `backend/`
2. **Start Command:** `php artisan schedule:work`
3. **Build Command:** (leave empty)

**Click "Save"**

---

#### 🔧 CC-CRM-LC-FOA Front Service

**Railway Dashboard → CC-CRM-LC-FOA Front → Settings → Deploy:**

1. **Root Directory:** `./` (or leave empty for root)
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npx serve -s dist -l $PORT`
4. **Output Directory:** `dist/`

**Click "Save"**

---

### Step 2: Set Environment Variables

**Run this in your terminal:**

```bash
./scripts/deploy-all-railway.sh
```

**Or set manually** in Railway Dashboard → Each Service → Variables:

#### CC API Service Variables:

```bash
APP_NAME=LearningCenter
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cc-api.up.railway.app
DB_CONNECTION=pgsql
DB_HOST=<from Postgres service>
DB_PORT=<from Postgres service>
DB_DATABASE=<from Postgres service>
DB_USERNAME=<from Postgres service>
DB_PASSWORD=<from Postgres service>
REDIS_HOST=<from Redis service>
REDIS_PORT=<from Redis service>
REDIS_PASSWORD=<from Redis service if set>
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default
REDIS_QUEUE=default
SESSION_DRIVER=redis
CACHE_DRIVER=redis
LOG_CHANNEL=stack
LOG_LEVEL=info
HORIZON_PREFIX=horizon
OPENROUTER_API_KEY=<your-key>
ELEVEN_LABS_API_KEY=<your-key>
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_TOOLS_PLATFORM=fibonacco
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_LOGGING=true
AI_TOOLS_LOG_CHANNEL=stack
```

**Generate APP_KEY:**
```bash
railway run --service "CC API" "php artisan key:generate --show"
```
Then set it as `APP_KEY` variable.

#### Queue Worker & Scheduler Variables:

Same as CC API, but **exclude:**
- APP_KEY
- APP_URL
- API keys (OPENROUTER_API_KEY, ELEVEN_LABS_API_KEY)

#### Frontend Variables:

```bash
VITE_API_ENDPOINT=https://cc-api.up.railway.app/api
VITE_API_URL=https://cc-api.up.railway.app/api
NODE_ENV=production
```

---

### Step 3: Run Database Migrations

**After setting environment variables, run migrations:**

```bash
railway run --service "CC API" "php artisan migrate --force"
```

**Or via Railway Dashboard:**
1. Go to CC API service
2. Click "Shell" tab
3. Run: `php artisan migrate --force`

**This will create all 94 database tables.**

---

### Step 4: Redeploy All Services

**In Railway Dashboard:**

1. Go to each service
2. Click "Redeploy" button
3. Wait for build to complete
4. Check logs for errors

---

### Step 5: Verify Everything Works

#### Check API Health:
```bash
curl https://cc-api.up.railway.app/health
```

Should return:
```json
{"status":"healthy","timestamp":"..."}
```

#### Check Frontend:
- Visit frontend URL
- Should load React app
- No console errors

#### Check Queue Worker:
- Check logs for "Processing jobs" messages
- Should connect to Redis

#### Check Scheduler:
- Check logs for "Running scheduled command" messages
- Should run every minute

---

## 🔍 Troubleshooting Build Failures

### Error: "Could not find nixpacks.toml"
**Fix:** Root Directory must be `backend/` for backend services

### Error: "Command not found: php"
**Fix:** Root Directory wrong - set to `backend/`

### Error: "Command not found: npm"
**Fix:** Frontend Root Directory wrong - set to `./` (root)

### Error: "Migration failed"
**Fix:** 
1. Check database connection variables
2. Ensure PostgreSQL service is online
3. Run migrations manually via Shell

### Error: "APP_KEY not set"
**Fix:** Generate and set APP_KEY (see Step 2)

### Error: "Database connection failed"
**Fix:**
1. Check DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
2. Verify PostgreSQL service is online
3. Check service can access PostgreSQL (same project)

---

## ✅ Complete Checklist

### Service Configurations:
- [ ] CC API: Root = `backend/`, Start = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] Queues: Root = `backend/`, Start = `php artisan queue:work redis --sleep=3 --tries=3`
- [ ] Scheduler: Root = `backend/`, Start = `php artisan schedule:work`
- [ ] Frontend: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`

### Environment Variables:
- [ ] CC API: All variables set (DB, Redis, API keys, APP_KEY)
- [ ] Queues: Database and Redis variables set
- [ ] Scheduler: Database and Redis variables set
- [ ] Frontend: VITE_API_ENDPOINT set

### Database:
- [ ] Migrations run successfully
- [ ] All tables created

### Deployment:
- [ ] All services build successfully
- [ ] All services start successfully
- [ ] No errors in logs

---

## 🎯 Expected Timeline

- **Fix configurations:** 5 minutes
- **Set variables:** 5 minutes (with script)
- **Run migrations:** 2 minutes
- **Redeploy:** 10 minutes (build time)
- **Verify:** 5 minutes

**Total: ~30 minutes**

---

## 🚀 Quick Start

1. **Fix service configurations** (see Step 1)
2. **Run:** `./scripts/deploy-all-railway.sh`
3. **Run migrations:** `railway run --service "CC API" "php artisan migrate --force"`
4. **Redeploy all services** in Railway dashboard
5. **Verify** everything works

---

**Follow these steps exactly and everything will work!** ✅
