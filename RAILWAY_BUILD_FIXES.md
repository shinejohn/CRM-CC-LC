# 🔧 Railway Build Failures - Debugging Guide

## 🚨 Current Status

**Working:**
- ✅ Postgres CC CRM SMB (Online)
- ✅ Redis CC (Online)

**Failing:**
- ❌ CC API (Build failed 39 min ago)
- ❌ CC-CRM-LC-FOA Front (Build failed 40 min ago)
- ❌ CC-CRM-LC Scheduler (Build failed 39 min ago)
- ❌ CRM-CC-LC Queues (Build failed 10 min ago)

---

## 🔍 Common Build Failure Causes

### 1. Missing Build Configuration

**Problem:** Railway doesn't know how to build your service.

**Solution:** Check if services have proper build configuration.

---

## 🚀 Service-Specific Fixes

### CC API (Backend) - Build Failed

**Root Directory:** Should be `backend/`

**Check:**
1. **Root Directory:** Is it set to `backend/`?
2. **Build Command:** Should auto-detect `nixpacks.toml`
3. **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`

**Common Issues:**
- ❌ Root directory not set to `backend/`
- ❌ Missing `nixpacks.toml` in backend/
- ❌ PHP version mismatch
- ❌ Composer dependencies failing

**Fix:**
1. Go to CC API service → Settings
2. Verify Root Directory = `backend/`
3. Check Deploy logs for specific error
4. Ensure `nixpacks.toml` exists in `backend/`

---

### CC-CRM-LC-FOA Front (Frontend) - Build Failed

**Root Directory:** Should be `./` (root)

**Check:**
1. **Root Directory:** Is it set to root (`./`)?
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npx serve -s dist -l $PORT`
4. **Output Directory:** `dist/`

**Common Issues:**
- ❌ Root directory wrong
- ❌ Missing `package.json` in root
- ❌ Node version mismatch
- ❌ Build errors in React code
- ❌ Missing environment variables

**Fix:**
1. Go to Frontend service → Settings
2. Verify Root Directory = `./` (root)
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npx serve -s dist -l $PORT`
5. Check build logs for TypeScript/React errors

---

### CC-CRM-LC Scheduler - Build Failed

**Root Directory:** Should be `backend/`

**Check:**
1. **Root Directory:** `backend/`
2. **Build Command:** Auto-detected from `nixpacks.toml`
3. **Start Command:** `php artisan schedule:work`

**Common Issues:**
- ❌ Root directory not `backend/`
- ❌ Start command missing or wrong
- ❌ Same build issues as API

**Fix:**
1. Go to Scheduler service → Settings → Deploy
2. Verify Root Directory = `backend/`
3. **Override Start Command:** `php artisan schedule:work`
4. Copy environment variables from CC API service

---

### CRM-CC-LC Queues - Build Failed

**Root Directory:** Should be `backend/`

**Check:**
1. **Root Directory:** `backend/`
2. **Build Command:** Auto-detected from `nixpacks.toml`
3. **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3`

**Common Issues:**
- ❌ Root directory not `backend/`
- ❌ Start command missing or wrong
- ❌ Same build issues as API

**Fix:**
1. Go to Queues service → Settings → Deploy
2. Verify Root Directory = `backend/`
3. **Override Start Command:** `php artisan queue:work redis --sleep=3 --tries=3`
4. Copy environment variables from CC API service

---

## 🔍 How to Debug Build Failures

### Step 1: Check Build Logs

1. Click on the failing service
2. Go to "Deployments" tab
3. Click on the failed deployment
4. Check "Build Logs" for error messages

### Step 2: Common Error Messages

**"No build configuration found"**
- → Missing `nixpacks.toml` or wrong root directory

**"Command not found: php"**
- → Wrong root directory (not pointing to backend/)

**"Command not found: npm"**
- → Wrong root directory for frontend

**"Composer install failed"**
- → Check `composer.json` for issues
- → Check PHP version compatibility

**"npm install failed"**
- → Check `package.json` for issues
- → Check Node version compatibility

**"Migration failed"**
- → Database connection issue
- → Check environment variables

---

## ✅ Quick Fix Checklist

### For Backend Services (API, Scheduler, Queues):

- [ ] Root Directory = `backend/`
- [ ] Build Command = (auto-detected from nixpacks.toml)
- [ ] Start Command = (see below)
  - API: `php artisan serve --host=0.0.0.0 --port=$PORT`
  - Scheduler: `php artisan schedule:work`
  - Queues: `php artisan queue:work redis --sleep=3 --tries=3`
- [ ] Environment variables copied from working service
- [ ] `nixpacks.toml` exists in `backend/`

### For Frontend Service:

- [ ] Root Directory = `./` (root)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npx serve -s dist -l $PORT`
- [ ] Environment variables set (VITE_API_ENDPOINT, etc.)
- [ ] `package.json` exists in root

---

## 🛠️ Step-by-Step Fix

### Fix Backend Services (API, Scheduler, Queues):

1. **Click on failing service** (e.g., CC API)
2. **Go to Settings** → **Deploy**
3. **Check Root Directory:**
   - Should be: `backend/`
   - If wrong, change it
4. **Check Start Command:**
   - API: `php artisan serve --host=0.0.0.0 --port=$PORT`
   - Scheduler: `php artisan schedule:work`
   - Queues: `php artisan queue:work redis --sleep=3 --tries=3`
5. **Copy Environment Variables:**
   - From CC API service (if it has them)
   - Or set manually (see ENV_VARIABLES_SETUP.md)
6. **Redeploy**

### Fix Frontend Service:

1. **Click on CC-CRM-LC-FOA Front**
2. **Go to Settings** → **Deploy**
3. **Check Root Directory:**
   - Should be: `./` (root) or leave empty
4. **Set Build Command:**
   ```
   npm install && npm run build
   ```
5. **Set Start Command:**
   ```
   npx serve -s dist -l $PORT
   ```
6. **Set Environment Variables:**
   - `VITE_API_ENDPOINT=https://cc-api.up.railway.app/api`
   - `VITE_API_URL=https://cc-api.up.railway.app/api`
7. **Redeploy**

---

## 🔍 Check Build Logs for Specific Errors

### To See Build Logs:

1. Click on failing service
2. Click "Deployments" tab
3. Click on latest failed deployment
4. Scroll to "Build Logs"
5. Look for error messages

### Common Errors & Fixes:

**Error: "Could not find nixpacks.toml"**
```
Fix: Ensure backend/nixpacks.toml exists
```

**Error: "PHP version not found"**
```
Fix: Check nixpacks.toml - should specify php83
```

**Error: "Composer install failed"**
```
Fix: Check composer.json for syntax errors
```

**Error: "npm install failed"**
```
Fix: Check package.json for syntax errors
```

**Error: "Migration failed"**
```
Fix: Check database connection env vars
```

---

## 📋 Service Configuration Reference

### CC API:
```
Root: backend/
Build: (auto from nixpacks.toml)
Start: php artisan serve --host=0.0.0.0 --port=$PORT
```

### CC-CRM-LC Scheduler:
```
Root: backend/
Build: (auto from nixpacks.toml)
Start: php artisan schedule:work
```

### CRM-CC-LC Queues:
```
Root: backend/
Build: (auto from nixpacks.toml)
Start: php artisan queue:work redis --sleep=3 --tries=3
```

### CC-CRM-LC-FOA Front:
```
Root: ./ (root)
Build: npm install && npm run build
Start: npx serve -s dist -l $PORT
```

---

## 🚨 Most Likely Issues

Based on your setup, most likely causes:

1. **Wrong Root Directory**
   - Backend services need `backend/`
   - Frontend needs `./` (root)

2. **Missing Start Commands**
   - Railway might not have start commands set
   - Need to override in Settings → Deploy

3. **Environment Variables Missing**
   - Backend services need DB connection vars
   - Frontend needs API endpoint vars

4. **Build Configuration Issues**
   - `nixpacks.toml` might have errors
   - `package.json` might have issues

---

## ✅ Next Steps

1. **Check build logs** for each failing service
2. **Verify root directories** are correct
3. **Set start commands** if missing
4. **Copy environment variables** from working services
5. **Redeploy** each service

**Share the build log errors** and I can help fix them specifically! 🔧
