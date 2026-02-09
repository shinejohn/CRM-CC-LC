# 🚨 Fix Command Center Services NOW

## Current Status

✅ **Working:**
- Postgres-CC (Database)
- Redis (Cache)

❌ **Failing (Build Failed 6 hours ago):**
- CRM-CC-LC API
- horizon
- CRM-CC-LC Front End
- CRM-CC-LC FOA

---

## 🔧 Quick Fix (5 Minutes)

### Step 1: Fix Service Configurations

Go to **Railway Dashboard** → **Command Center** → Each service → **Settings** → **Deploy**

#### 1. CRM-CC-LC API

**Settings → Deploy:**
- **Root Directory:** `backend/`
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Build Command:** (leave empty - auto-detected)

**Save** → **Redeploy**

---

#### 2. horizon

**Settings → Deploy:**
- **Root Directory:** `backend/`
- **Start Command:** `php artisan horizon`
- **Build Command:** (leave empty)

**Save** → **Redeploy**

---

#### 3. CRM-CC-LC Front End

**Settings → Deploy:**
- **Root Directory:** `./` (or leave empty for root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

**Save** → **Redeploy**

---

#### 4. CRM-CC-LC FOA

**Settings → Deploy:**
- **Root Directory:** `./` (or leave empty for root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

**Save** → **Redeploy**

---

### Step 2: Set Environment Variables

Run this script to set all variables automatically:

```bash
./scripts/fix-command-center-services.sh
```

Or set manually in Railway dashboard:

#### CRM-CC-LC API Variables:

```
APP_NAME=CommandCenter
APP_ENV=production
APP_DEBUG=false
APP_URL=https://crm-cc-lc-api.up.railway.app
DB_CONNECTION=pgsql
DB_HOST=postgres-rwye.railway.internal
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=byzYSxLWwyUxrySVkuwgVTgChvqrQRAt
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
CACHE_DRIVER=redis
LOG_CHANNEL=stack
LOG_LEVEL=info
HORIZON_PREFIX=horizon
```

**Plus:** Generate APP_KEY:
```bash
railway run --service "CRM-CC-LC API" "php artisan key:generate --show"
```
Copy the output and set as `APP_KEY` variable.

**Plus:** Add API keys:
- `OPENROUTER_API_KEY=your_key`
- `ELEVEN_LABS_API_KEY=your_key`

---

#### horizon Variables:

Same as API, but **NO** APP_KEY or API keys needed.

---

#### Front End Variables:

```
VITE_API_ENDPOINT=https://crm-cc-lc-api.up.railway.app/api
VITE_API_URL=https://crm-cc-lc-api.up.railway.app/api
NODE_ENV=production
```

---

#### CRM-CC-LC FOA Variables:

Same as Front End.

---

### Step 3: Run Migrations

After API service builds successfully:

```bash
railway run --service "CRM-CC-LC API" "php artisan migrate --force"
```

---

## 📋 Checklist

- [ ] CRM-CC-LC API: Root = `backend/`, Start = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] horizon: Root = `backend/`, Start = `php artisan horizon`
- [ ] CRM-CC-LC Front End: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`
- [ ] CRM-CC-LC FOA: Root = `./`, Build = `npm install && npm run build`, Start = `npx serve -s dist -l $PORT`
- [ ] All environment variables set
- [ ] APP_KEY generated and set
- [ ] Migrations run successfully
- [ ] All services building successfully

---

## 🎯 Root Cause

**Build failures are caused by:**
1. ❌ Missing or incorrect **Root Directory**
2. ❌ Missing or incorrect **Start Command**
3. ❌ Missing **Environment Variables**

**Fix these 3 things → Everything works!** ✅

---

## 🚀 After Fix

Once all services are building:
1. Check build logs for any errors
2. Verify API is accessible
3. Verify frontend loads
4. Test end-to-end functionality

---

**Start with Step 1 (Service Configurations) - that's the main issue!** 🔧
