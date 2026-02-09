# 🏗️ Command Center Architecture Analysis & Fix

## 📊 Current Architecture Status

### ✅ Working Services:
- **Postgres-CC** - Online ✅
- **Redis** - Online ✅

### ❌ Failing Services (Build Failed 6 hours ago):
- **horizon** - Build failed ❌
- **CRM-CC-LC FOA** - Build failed ❌
- **CRM-CC-LC Front End** - Build failed ❌
- **CRM-CC-LC API** - Build failed ❌

---

## 🎯 Architecture Overview

### Current Setup:
```
Command Center Project
├── Postgres-CC (Database) ✅ Online
├── Redis (Cache/Queue) ✅ Online
├── horizon (Queue Worker) ❌ Build Failed
├── CRM-CC-LC FOA ❌ Build Failed
├── CRM-CC-LC Front End ❌ Build Failed
└── CRM-CC-LC API ❌ Build Failed
```

### Expected Architecture:
```
Command Center Project
├── Postgres-CC (Database) ✅
├── Redis (Cache/Queue) ✅
├── CRM-CC-LC API (Backend) ❌ → Fix
├── horizon (Queue Worker) ❌ → Fix
├── CRM-CC-LC Front End (Frontend) ❌ → Fix
└── CRM-CC-LC FOA (Unknown) ❌ → Fix
```

---

## 🔧 Fix Plan

### Step 1: Fix Service Configurations

Each failing service needs proper configuration:

#### CRM-CC-LC API:
- **Root Directory:** `backend/`
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Build:** Auto-detected from `backend/nixpacks.toml`

#### horizon:
- **Root Directory:** `backend/`
- **Start Command:** `php artisan horizon`
- **Build:** Auto-detected from `backend/nixpacks.toml`

#### CRM-CC-LC Front End:
- **Root Directory:** `./` (root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

#### CRM-CC-LC FOA:
- **Need to identify:** What is FOA?
- **Likely:** Another backend service or worker
- **Check:** Root directory and start command

---

### Step 2: Set Environment Variables

All services need:
- Database connection (from Postgres-CC)
- Redis connection (from Redis)
- API keys (for API service)
- APP_KEY (for Laravel services)

---

### Step 3: Run Migrations

After API service is fixed:
```bash
railway run --service "CRM-CC-LC API" "php artisan migrate --force"
```

---

## 🔍 Service-by-Service Fix

### CRM-CC-LC API

**Railway Dashboard → CRM-CC-LC API → Settings → Deploy:**

1. **Root Directory:** `backend/`
2. **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
3. **Build Command:** (leave empty - auto-detected)

**Variables Needed:**
- Database connection (from Postgres-CC)
- Redis connection (from Redis)
- APP_KEY (generate)
- API keys

---

### horizon

**Railway Dashboard → horizon → Settings → Deploy:**

1. **Root Directory:** `backend/`
2. **Start Command:** `php artisan horizon`
3. **Build Command:** (leave empty)

**Variables Needed:**
- Database connection
- Redis connection
- (Same as API, except no APP_KEY or API keys)

---

### CRM-CC-LC Front End

**Railway Dashboard → CRM-CC-LC Front End → Settings → Deploy:**

1. **Root Directory:** `./` (root directory)
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npx serve -s dist -l $PORT`
4. **Output Directory:** `dist/`

**Variables Needed:**
- `VITE_API_ENDPOINT=https://crm-cc-lc-api.up.railway.app/api`
- `VITE_API_URL=https://crm-cc-lc-api.up.railway.app/api`
- `NODE_ENV=production`

---

### CRM-CC-LC FOA

**Need to identify what FOA is:**
- Could be: Front Office Application, First Order Application, etc.
- Check service configuration in Railway dashboard
- Likely needs same fix as other backend services

---

## 🚀 Quick Fix Steps

1. **Go to Railway Dashboard**
2. **For each failing service:**
   - Click on service
   - Settings → Deploy
   - Fix Root Directory
   - Fix Start Command
   - Save → Redeploy
3. **Set environment variables** (run script)
4. **Run migrations**
5. **Verify** all services working

---

## 📋 Complete Checklist

### Service Configurations:
- [ ] CRM-CC-LC API: Root = `backend/`, Start = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] horizon: Root = `backend/`, Start = `php artisan horizon`
- [ ] CRM-CC-LC Front End: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`
- [ ] CRM-CC-LC FOA: Identify and fix

### Environment Variables:
- [ ] All services have database connection
- [ ] All services have Redis connection
- [ ] API has APP_KEY
- [ ] API has API keys
- [ ] Frontend has VITE_API_ENDPOINT

### Database:
- [ ] Migrations run successfully
- [ ] All tables created

---

**Fix service configurations first - that's likely the main issue!** 🔧
