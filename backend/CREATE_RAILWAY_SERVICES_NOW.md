# 🚂 Create Railway Services - Step-by-Step Guide

## Current Status

You're in Railway → "Fibonacco Sales" workspace, but the services aren't created yet.

Let's create them now!

---

## Services to Create (5 Total)

1. **PostgreSQL Database** - Railway managed database
2. **Redis/Valkey** - Railway managed cache/queue
3. **API Server** - Main Laravel application
4. **Horizon** - Queue worker service
5. **Scheduler** - Cron job service

---

## Step 1: Create PostgreSQL Database

1. In Railway Dashboard (Fibonacco Sales workspace)
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will auto-provision PostgreSQL
5. **Name it:** `learning-center-db` (or keep default)
6. **Copy the connection details:**
   - Railway will show `DATABASE_URL` automatically
   - Note the host, port, database, username, password

**Done!** ✅ PostgreSQL service created.

---

## Step 2: Create Redis Service

1. Click **"+ New"** button again
2. Select **"Database"** → **"Add Redis"** (or "Add Valkey" if available)
3. Railway will auto-provision Redis
4. **Name it:** `learning-center-redis` (or keep default)
5. **Copy the connection details:**
   - Railway will show `REDIS_URL` automatically
   - Note the host, port, password

**Done!** ✅ Redis service created.

---

## Step 3: Create API Server (Main Laravel Application)

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose repository: **`shinejohn/CRM-CC-LC`**
4. Click **"Add Service"**

5. **Configure Service:**
   - **Service name:** `CRM-CC-LC` (or `learning-center-api`)
   - **Root Directory:** `backend`
   - **Build Command:** (Railway auto-detects, but verify)
     ```
     composer install --no-dev --optimize-autoloader
     ```
   - **Start Command:**
     ```
     php artisan serve --host=0.0.0.0 --port=$PORT
     ```

6. **Link Services:**
   - Click on your new service
   - Go to **"Settings"** → **"Connected Services"**
   - Link to:
     - PostgreSQL database service
     - Redis service

7. **Set Environment Variables:**
   - Go to **"Variables"** tab
   - Add these variables:

   ```bash
   APP_NAME="Fibonacco Learning Center"
   APP_ENV=production
   APP_KEY=  # We'll generate this
   APP_DEBUG=false
   APP_URL=https://your-service.railway.app
   
   # Database (from PostgreSQL service)
   DATABASE_URL=  # Railway auto-provides when linked
   
   # Redis (from Redis service)
   REDIS_URL=  # Railway auto-provides when linked
   QUEUE_CONNECTION=redis
   
   # API Keys
   ELEVENLABS_API_KEY=your_key_here
   OPENROUTER_API_KEY=your_key_here
   ```

8. **Generate APP_KEY:**
   - In Railway, go to service → **"Deployments"** → **"Deploy Logs"**
   - Or use Railway CLI:
     ```bash
     railway run php artisan key:generate --show
     ```
   - Copy the key and add to `APP_KEY` variable

**Done!** ✅ API Server created.

---

## Step 4: Create Horizon Service (Queue Worker)

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose repository: **`shinejohn/CRM-CC-LC`**
4. Click **"Add Service"**

5. **Configure Service:**
   - **Service name:** `learning-center-horizon`
   - **Root Directory:** `backend`
   - **Build Command:**
     ```
     composer install --no-dev --optimize-autoloader
     ```
   - **Start Command:**
     ```
     php artisan horizon
     ```

6. **Link Services:**
   - Link to PostgreSQL database
   - Link to Redis service

7. **Set Environment Variables:**
   - Copy ALL variables from API Server service
   - Same `APP_KEY`, `DATABASE_URL`, `REDIS_URL`, etc.

**Done!** ✅ Horizon service created.

---

## Step 5: Create Scheduler Service (Cron Jobs)

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose repository: **`shinejohn/CRM-CC-LC`**
4. Click **"Add Service"**

5. **Configure Service:**
   - **Service name:** `learning-center-scheduler`
   - **Root Directory:** `backend`
   - **Build Command:**
     ```
     composer install --no-dev --optimize-autoloader
     ```
   - **Start Command:**
     ```
     php artisan schedule:work
     ```

6. **Link Services:**
   - Link to PostgreSQL database
   - Link to Redis service

7. **Set Environment Variables:**
   - Copy ALL variables from API Server service
   - Same `APP_KEY`, `DATABASE_URL`, `REDIS_URL`, etc.

**Done!** ✅ Scheduler service created.

---

## Step 6: Run Database Migrations

After all services are created:

1. Go to API Server service
2. Click **"Deployments"** tab
3. Click **"View Logs"** for latest deployment
4. Or use Railway CLI:

```bash
railway run php artisan migrate
```

This will create all database tables.

---

## Final Checklist

After creating all services, you should see in Railway:

- ✅ `learning-center-db` (PostgreSQL)
- ✅ `learning-center-redis` (Redis)
- ✅ `CRM-CC-LC` (API Server)
- ✅ `learning-center-horizon` (Horizon)
- ✅ `learning-center-scheduler` (Scheduler)

**Total: 5 services** ✅

---

## Quick Reference

### Service Start Commands:
- **API Server:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Horizon:** `php artisan horizon`
- **Scheduler:** `php artisan schedule:work`

### All Services Need:
- Same environment variables
- Linked to PostgreSQL
- Linked to Redis

---

**Ready to create them in Railway now!** 🚂






