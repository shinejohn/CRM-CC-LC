# Railway Services - Need to Be Created in Dashboard

## Current Situation

You went to Railway → "Fibonacco Sales" workspace and **don't see the services**.

**That's because they haven't been created yet!** You need to create them manually in the Railway dashboard.

---

## Services You Need to Create (5 Total)

### ✅ Already Have:
- **PostgreSQL Database** - `trolley.proxy.rlwy.net:53826` (you mentioned this exists)

### ❌ Need to Create:
1. **Redis/Valkey Service** - For cache and queues
2. **API Server Service** - Main Laravel application
3. **Horizon Service** - Queue worker
4. **Scheduler Service** - Cron jobs

---

## Quick Setup Steps (Do This Now)

### Step 1: Check What's Already There
1. Go to Railway Dashboard
2. Open "Fibonacco Sales" workspace
3. Look at what services exist
4. Note the PostgreSQL service name

### Step 2: Create Redis Service
1. Click **"+ New"** button
2. Select **"Database"** → **"Add Redis"**
3. Railway will create it automatically
4. Note the `REDIS_URL` it provides

### Step 3: Create API Server (Laravel)
1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose: `shinejohn/CRM-CC-LC`
4. Click **"Add Service"**
5. Set **Root Directory:** `backend`
6. Set **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
7. Link to PostgreSQL and Redis services
8. Add environment variables (see below)

### Step 4: Create Horizon Service
1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose: `shinejohn/CRM-CC-LC`
4. Set **Root Directory:** `backend`
5. Set **Start Command:** `php artisan horizon`
6. Link to PostgreSQL and Redis
7. Copy all environment variables from API Server

### Step 5: Create Scheduler Service
1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose: `shinejohn/CRM-CC-LC`
4. Set **Root Directory:** `backend`
5. Set **Start Command:** `php artisan schedule:work`
6. Link to PostgreSQL and Redis
7. Copy all environment variables from API Server

---

## Environment Variables Needed

For all services (API, Horizon, Scheduler), add these:

```bash
APP_NAME="Fibonacco Learning Center"
APP_ENV=production
APP_KEY=base64:... # Generate with: php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-service.railway.app

# Database (Railway auto-provides when linked)
DATABASE_URL=postgresql://...

# Redis (Railway auto-provides when linked)
REDIS_URL=redis://...
QUEUE_CONNECTION=redis

# API Keys
ELEVENLABS_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

---

## After Creating Services

1. **Run Migrations:**
   - Go to API Server → Deployments → Run Command
   - Command: `php artisan migrate`

2. **Verify Services:**
   - API Server should be running
   - Horizon should be processing queues
   - Scheduler should be running scheduled tasks

---

**The services need to be created in Railway dashboard - they're not automatically there!**

See `backend/CREATE_RAILWAY_SERVICES_NOW.md` for detailed step-by-step instructions.






