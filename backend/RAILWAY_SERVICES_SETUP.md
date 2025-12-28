# Railway Services Setup Guide

## Overview

The Laravel backend requires **5 Railway services + 1 external storage**:

**Railway Services:**
1. **API Server** - Main Laravel application
2. **Horizon** - Queue worker for background jobs
3. **Scheduler** - Cron job runner for scheduled tasks
4. **PostgreSQL** - Database (Railway managed)
5. **Redis/Valkey** - Cache and queue backend (Railway managed)

**External Storage (NOT a Railway service):**
- **Cloudflare R2** - Persistent file storage (audio files, uploads, assets)

---

## Service Architecture

```
┌─────────────────────────────────────────────────┐
│         Railway Project: CRM-CC-LC              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐    ┌──────────────┐          │
│  │ API Server   │    │  PostgreSQL  │          │
│  │ (Laravel)    │───▶│  Database    │          │
│  └──────────────┘    └──────────────┘          │
│         │                                        │
│         ├────────────────────┐                  │
│         │                    │                  │
│  ┌──────▼──────┐    ┌───────▼───────┐          │
│  │   Horizon   │    │   Scheduler   │          │
│  │ (Queue)     │    │   (Cron)      │          │
│  └─────────────┘    └───────────────┘          │
│         │                    │                  │
│         └─────────┬──────────┘                  │
│                   │                             │
│            ┌──────▼──────┐                      │
│            │  Redis/     │                      │
│            │  Valkey     │                      │
│            └─────────────┘                      │
│                                                  │
│            ┌─────────────┐                      │
│            │ Cloudflare  │                      │
│            │    R2       │                      │
│            │ (External)  │                      │
│            └─────────────┘                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Service 1: API Server (Main Application)

**Status:** ✅ Already configured

**Configuration:**
- **Repository:** GitHub - `shinejohn/CRM-CC-LC`
- **Root Directory:** `backend`
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Build Command:** `composer install --no-dev --optimize-autoloader`
- **Environment Variables:**
  - `APP_ENV=production`
  - `APP_KEY` (generate with `php artisan key:generate`)
  - `DATABASE_URL` (from PostgreSQL service)
  - `REDIS_URL` (from Redis service)
  - `QUEUE_CONNECTION=redis`
  - `ELEVENLABS_API_KEY`
  - `OPENROUTER_API_KEY`

**Linked Services:**
- PostgreSQL database
- Redis/Valkey

---

## Service 2: Horizon (Queue Worker)

**Status:** ⏳ **NEEDS TO BE CREATED**

### Setup Instructions:

1. **In Railway Dashboard:**
   - Click "+ New" button
   - Select "GitHub Repo"
   - Choose repository: `shinejohn/CRM-CC-LC`
   - Click "Add Service"

2. **Configure Service:**
   - **Name:** `crm-cc-lc-horizon`
   - **Root Directory:** `backend`
   - **Start Command:** `php artisan horizon`
   - **Build Command:** `composer install --no-dev --optimize-autoloader`

3. **Environment Variables:**
   Copy ALL environment variables from API Server service:
   - `APP_ENV=production`
   - `APP_KEY` (same as API server)
   - `DATABASE_URL` (same as API server)
   - `REDIS_URL` (same as API server)
   - `QUEUE_CONNECTION=redis`
   - `ELEVENLABS_API_KEY`
   - `OPENROUTER_API_KEY`

4. **Link Services:**
   - Link to PostgreSQL service
   - Link to Redis/Valkey service

5. **Deploy:**
   - Railway will auto-deploy when you connect to GitHub
   - Monitor logs to ensure Horizon starts correctly

---

## Service 3: Scheduler (Cron Jobs)

**Status:** ⏳ **NEEDS TO BE CREATED**

### Setup Instructions:

1. **In Railway Dashboard:**
   - Click "+ New" button
   - Select "GitHub Repo"
   - Choose repository: `shinejohn/CRM-CC-LC`
   - Click "Add Service"

2. **Configure Service:**
   - **Name:** `crm-cc-lc-scheduler`
   - **Root Directory:** `backend`
   - **Start Command:** `php artisan schedule:work`
   - **Build Command:** `composer install --no-dev --optimize-autoloader`

3. **Environment Variables:**
   Copy ALL environment variables from API Server service:
   - `APP_ENV=production`
   - `APP_KEY` (same as API server)
   - `DATABASE_URL` (same as API server)
   - `REDIS_URL` (same as API server)
   - `QUEUE_CONNECTION=redis`
   - `ELEVENLABS_API_KEY`
   - `OPENROUTER_API_KEY`

4. **Link Services:**
   - Link to PostgreSQL service
   - Link to Redis/Valkey service

5. **Deploy:**
   - Railway will auto-deploy when you connect to GitHub
   - Monitor logs to ensure scheduler starts correctly

**Note:** `schedule:work` runs in the foreground and continuously executes scheduled tasks. This is the recommended approach for Railway.

---

## Service 4: Redis/Valkey (Cache & Queue Backend)

**Status:** ⏳ **NEEDS TO BE CREATED**

### Setup Instructions:

1. **In Railway Dashboard:**
   - Click "+ New" button
   - Select "Database" → "Add Redis" (or "Add Valkey" if available)
   - Railway will auto-provision the service

2. **Configuration:**
   - Railway automatically provides:
     - `REDIS_URL` environment variable
     - Connection credentials
     - Port and host information

3. **Link to Other Services:**
   - Link Redis service to:
     - API Server service
     - Horizon service
     - Scheduler service

4. **Environment Variables:**
   Railway auto-provides `REDIS_URL`. You can also use:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
   - `REDIS_DB`

### Using Valkey (Redis Alternative):

If Railway supports Valkey (Redis fork), use it instead:
- Same configuration as Redis
- Better performance and compatibility
- Drop-in replacement

---

## Environment Variables Summary

All services need these shared variables:

```bash
# Application
APP_NAME="Fibonacco Operations Platform"
APP_ENV=production
APP_KEY=base64:... # Generate with php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-api.railway.app

# Database (from PostgreSQL service)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Redis (from Redis/Valkey service)
REDIS_URL=redis://user:pass@host:port

# Queue
QUEUE_CONNECTION=redis

# API Keys
ELEVENLABS_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here

# Horizon (for Horizon service)
HORIZON_BALANCE=simple
HORIZON_MAX_PROCESSES=10
```

---

## Verification Steps

### 1. Check API Server:
```bash
curl https://your-api.railway.app/api/v1/knowledge
```

### 2. Check Horizon Dashboard:
```
Visit: https://your-api.railway.app/horizon
```

### 3. Check Horizon Service Logs:
- Go to Railway Dashboard
- Select Horizon service
- View logs - should see "Horizon started successfully"

### 4. Check Scheduler Service Logs:
- Go to Railway Dashboard
- Select Scheduler service
- View logs - should see scheduled tasks executing

### 5. Test Queue:
```php
// In tinker or via API
dispatch(new \App\Jobs\GenerateEmbedding($knowledgeItem));

// Check Horizon dashboard to see job processing
```

---

## Current Status

- ✅ **API Server:** Configured and ready
- ⏳ **Horizon:** Needs to be created as separate service
- ⏳ **Scheduler:** Needs to be created as separate service
- ⏳ **Redis/Valkey:** Needs to be created as separate service

---

## Next Steps

1. Create Redis/Valkey service in Railway
2. Create Horizon service in Railway
3. Create Scheduler service in Railway
4. Link all services together
5. Verify all services are running
6. Test queue processing and scheduled tasks

---

## Troubleshooting

### Horizon Not Starting:
- Check Redis connection
- Verify `QUEUE_CONNECTION=redis`
- Check Horizon service logs
- Ensure APP_KEY is set

### Scheduler Not Running:
- Check database connection
- Verify scheduled tasks are defined in `app/Console/Kernel.php`
- Check scheduler service logs
- Ensure APP_KEY is set

### Redis Connection Failed:
- Verify Redis service is running
- Check REDIS_URL environment variable
- Verify services are linked
- Test connection from API server

---

**Created:** December 2024  
**Last Updated:** December 2024

