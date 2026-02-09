# 🔧 Complete Railway Deployment Fix

## 🚨 Current Status

**Working:**
- ✅ Postgres CC CRM SMB (Online)
- ✅ Redis CC (Online)

**Failing:**
- ❌ CC API (Build failed)
- ❌ CC-CRM-LC-FOA Front (Build failed)
- ❌ CC-CRM-LC Scheduler (Build failed)
- ❌ CRM-CC-LC Queues (Build failed)

---

## 🎯 Root Causes

### 1. Missing Start Commands
Railway services need explicit start commands set.

### 2. Wrong Root Directories
Services may not be pointing to correct directories.

### 3. Missing Environment Variables
Services need database/Redis connection variables.

### 4. Build Configuration Issues
nixpacks.toml may need adjustments.

---

## 🔧 Complete Fix Plan

### Step 1: Fix Service Configurations

#### CC API Service:
- **Root Directory:** `backend/`
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Build:** Auto-detected from `backend/nixpacks.toml`

#### CRM-CC-LC Queues Service:
- **Root Directory:** `backend/`
- **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
- **Build:** Auto-detected from `backend/nixpacks.toml`

#### CC-CRM-LC Scheduler Service:
- **Root Directory:** `backend/`
- **Start Command:** `php artisan schedule:work`
- **Build:** Auto-detected from `backend/nixpacks.toml`

#### CC-CRM-LC-FOA Front Service:
- **Root Directory:** `./` (root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

---

### Step 2: Set Environment Variables

Run the automated script:
```bash
./scripts/fix-railway-deployment.sh
```

This will:
- ✅ Set all variables for all services
- ✅ Generate APP_KEY
- ✅ Run migrations
- ✅ Configure everything automatically

---

### Step 3: Verify Build Configuration

**Backend (nixpacks.toml):**
```toml
[phases.setup]
nixPkgs = ["php83", "php83Extensions.pdo_pgsql", "php83Extensions.redis", "composer"]

[phases.install]
cmds = ["composer install --no-dev --optimize-autoloader"]

[phases.build]
cmds = [
  "composer install --no-dev --optimize-autoloader",
  "php artisan config:cache",
  "php artisan route:cache",
  "php artisan migrate --force"
]

[start]
cmd = "php artisan serve --host=0.0.0.0 --port=$PORT"
```

**Frontend:**
- Uses Vite build system
- Builds to `dist/` directory
- Serves static files

---

### Step 4: Run Migrations

Migrations run automatically during build (configured in nixpacks.toml).

To run manually:
```bash
railway run --service "CC API" "php artisan migrate --force"
```

---

## 🚀 Quick Fix Commands

### Fix All Services at Once:

```bash
# 1. Run the fix script
./scripts/fix-railway-deployment.sh

# 2. Verify service configurations in Railway dashboard
# 3. Redeploy all services
```

---

## 📋 Service-by-Service Fix Checklist

### CC API Service:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan serve --host=0.0.0.0 --port=$PORT`
- [ ] Environment variables set (run script)
- [ ] APP_KEY generated
- [ ] Redeploy

### CRM-CC-LC Queues Service:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan queue:work redis --sleep=3 --tries=3`
- [ ] Environment variables set (run script)
- [ ] Redeploy

### CC-CRM-LC Scheduler Service:
- [ ] Root Directory = `backend/`
- [ ] Start Command = `php artisan schedule:work`
- [ ] Environment variables set (run script)
- [ ] Redeploy

### CC-CRM-LC-FOA Front Service:
- [ ] Root Directory = `./` (root)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npx serve -s dist -l $PORT`
- [ ] Environment variables set (run script)
- [ ] Redeploy

---

## ✅ Verification Steps

After fixing:

1. **Check Build Logs:**
   - Go to each service → Deployments → Latest
   - Check build logs for errors

2. **Verify Services Start:**
   - Check service logs after deployment
   - Should see "Server started" or similar

3. **Test API:**
   - Visit API URL: `https://cc-api.up.railway.app`
   - Should return JSON response

4. **Test Frontend:**
   - Visit frontend URL
   - Should load React app

5. **Check Queue Worker:**
   - Check logs for "Processing jobs" messages

6. **Check Scheduler:**
   - Check logs for "Running scheduled command" messages

---

## 🎯 Expected Results

After fixes:
- ✅ All services build successfully
- ✅ All services start correctly
- ✅ Database migrations run
- ✅ API responds to requests
- ✅ Frontend loads
- ✅ Queue worker processes jobs
- ✅ Scheduler runs tasks

---

**Run the fix script now to get everything working!** 🚀
