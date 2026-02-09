# 🚂 Command Center Railway Project - Complete Setup Guide

## ✅ Project Status

**Project:** Command Center  
**Project ID:** `c7bf01db-139a-49e8-95d5-b748e17744c0`  
**Environment:** production  
**Status:** ✅ Linked successfully  
**Services:** 0 (need to create)

---

## 🎯 Required Services (6 Total)

You need to create these services in Railway dashboard:

### 1. 📦 PostgreSQL Database
**Type:** Database → PostgreSQL  
**Name:** `postgres` or `database`  
**Purpose:** Store all application data  
**Auto-generated variables:**
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

---

### 2. 🔴 Redis Cache
**Type:** Database → Redis  
**Name:** `redis` or `cache`  
**Purpose:** Queue backend, cache, sessions  
**Auto-generated variables:**
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (if set)

---

### 3. 🚀 API Backend
**Type:** GitHub Repo  
**Name:** `api-backend`  
**Repository:** Your GitHub repo  
**Root Directory:** `backend/`  
**Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`  
**Build:** Auto-detected from `backend/nixpacks.toml`

---

### 4. ⚙️ Queue Worker
**Type:** GitHub Repo  
**Name:** `queue-worker`  
**Repository:** Same as API backend  
**Root Directory:** `backend/`  
**Start Command:** `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`  
**Build:** Auto-detected from `backend/nixpacks.toml`

---

### 5. ⏰ Scheduler
**Type:** GitHub Repo  
**Name:** `scheduler`  
**Repository:** Same as API backend  
**Root Directory:** `backend/`  
**Start Command:** `php artisan schedule:work`  
**Build:** Auto-detected from `backend/nixpacks.toml`

---

### 6. 🎨 Frontend
**Type:** GitHub Repo  
**Name:** `frontend`  
**Repository:** Same as API backend  
**Root Directory:** `./` (root directory)  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npx serve -s dist -l $PORT`  
**Output Directory:** `dist/`

---

## 🚀 Quick Setup Steps

### Step 1: Create Services in Railway Dashboard

1. Go to Railway Dashboard → Command Center project
2. Click **"+ New"** button
3. Create each service (see above for exact configs)

### Step 2: Set Environment Variables

After creating services, run:

```bash
./scripts/deploy-all-railway.sh
```

This script will:
- Auto-detect PostgreSQL connection variables
- Auto-detect Redis connection variables
- Prompt for API keys
- Set all variables for all services automatically

### Step 3: Run Migrations

After variables are set:

```bash
railway run --service "api-backend" "php artisan migrate --force"
```

This creates all 94 database tables.

### Step 4: Verify Deployment

Check Railway dashboard:
- All services building successfully
- All services starting successfully
- No build failures

---

## 📋 Service Configuration Checklist

### API Backend:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] Environment variables set

### Queue Worker:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
- [ ] Environment variables set

### Scheduler:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan schedule:work`
- [ ] Environment variables set

### Frontend:
- [ ] Root Directory = `./` (root)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npx serve -s dist -l $PORT`
- [ ] Environment variables set

---

## 🔐 Environment Variables Needed

### API Backend:
- Database connection (from PostgreSQL service)
- Redis connection (from Redis service)
- APP_KEY (generated)
- API keys (OpenRouter, ElevenLabs)
- APP_URL (Railway URL)

### Queue Worker & Scheduler:
- Database connection
- Redis connection
- (No API keys needed)

### Frontend:
- VITE_API_ENDPOINT (API backend URL)
- VITE_API_URL (API backend URL)
- NODE_ENV=production

---

## ✅ Next Actions

1. **Create services** in Railway dashboard (see above)
2. **Run setup script:** `./scripts/deploy-all-railway.sh`
3. **Run migrations:** `railway run --service "api-backend" "php artisan migrate --force"`
4. **Verify** all services are working

---

**Project is ready! Create services and run the setup script!** 🚀
