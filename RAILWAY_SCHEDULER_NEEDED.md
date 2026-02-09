# ⏰ YES - You Need a Scheduler Service!

## 🎯 Quick Answer

**YES, you absolutely need a scheduler service** for Railway!

Your campaigns, newsletters, alerts, and other scheduled tasks **require Laravel's scheduler** to run.

---

## 📋 What You Have Scheduled

### Campaign-Related (Critical):
```php
// Process campaign timelines hourly
Schedule::job(new \App\Jobs\ProcessCampaignTimelines)->hourly();

// Advance campaign days daily at midnight
Schedule::job(new \App\Jobs\AdvanceCampaignDays)->dailyAt('00:00');
```

### Newsletter Scheduling:
```php
// Schedule daily newsletters
Schedule::job(new \App\Jobs\Newsletter\ScheduleDailyNewsletters)->dailyAt('00:05');

// Schedule weekly newsletters
Schedule::job(new \App\Jobs\Newsletter\ScheduleWeeklyNewsletters)->weeklyOn(0, '00:10');

// Process scheduled newsletters (every minute!)
Schedule::job(new \App\Jobs\Newsletter\ProcessScheduledNewsletters)->everyMinute();
```

### Alert Processing:
```php
// Process scheduled alerts (every minute!)
Schedule::job(new \App\Jobs\Alert\ProcessScheduledAlerts)->everyMinute();
```

### Other Scheduled Tasks:
- Process bounces every 15 minutes
- Update engagement scores weekly
- Clean up old data daily
- Process embeddings hourly
- etc.

---

## 🚨 The Problem

**Laravel's scheduler doesn't run automatically!**

You need to run this command **every minute**:
```bash
php artisan schedule:run
```

This checks your scheduled tasks and runs them if they're due.

---

## 🏗️ Updated Railway Architecture

### You Need **6 Services** (Not 5):

```
Railway Project: learning-center-platform
│
├── 📦 postgres-db (PostgreSQL)
├── 🔴 redis-cache (Redis)
├── 🚀 api-backend (Laravel API)
├── ⚙️ queue-worker (Laravel Queue Worker)
├── ⏰ scheduler (Laravel Scheduler) ← NEW!
└── 🎨 frontend (React)
```

---

## ⏰ Service 5: Scheduler (NEW!)

**Type:** GitHub Repo / Private Repo (same repo as API)  
**Name:** `scheduler` or `learning-center-scheduler`

### Configuration:
- **Root Directory:** `backend/`
- **Build Command:** (same as API backend - handled by nixpacks.toml)
- **Start Command:** `while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done`
- **Health Check:** Not needed (background service)

### Alternative Start Command (Better):
```bash
php artisan schedule:work
```
**Note:** `schedule:work` runs continuously and checks every minute automatically (Laravel 11+).

### Environment Variables:
```bash
# Same as API Backend:
APP_NAME=LearningCenter
APP_ENV=production
APP_KEY=<same-as-api-backend>
DB_CONNECTION=pgsql
DB_HOST=${{postgres-db.PGHOST}}
DB_PORT=${{postgres-db.PGPORT}}
DB_DATABASE=${{postgres-db.PGDATABASE}}
DB_USERNAME=${{postgres-db.PGUSER}}
DB_PASSWORD=${{postgres-db.PGPASSWORD}}
REDIS_HOST=${{redis-cache.REDIS_HOST}}
REDIS_PORT=${{redis-cache.REDIS_PORT}}
REDIS_PASSWORD=${{redis-cache.REDIS_PASSWORD}}
```

### What It Does:
- ✅ Runs `schedule:run` every minute
- ✅ Checks scheduled tasks
- ✅ Dispatches jobs to queue when due
- ✅ Runs commands when due

### Scaling:
- **Replicas:** 1 (only need one scheduler)
- **Resources:** 256MB RAM minimum
- **Why only 1?** Multiple schedulers would run tasks multiple times!

---

## 🔄 How It Works

### Scheduler Flow:
```
1. Scheduler service runs every minute
   ↓
2. Checks Kernel.php schedule
   ↓
3. Finds due tasks
   ↓
4. Dispatches jobs to Redis queue
   ↓
5. Queue worker processes jobs
```

### Example:
```
00:00 → AdvanceCampaignDays job dispatched → Queue → Worker processes
00:05 → ScheduleDailyNewsletters job dispatched → Queue → Worker processes
Every minute → ProcessScheduledNewsletters → Queue → Worker processes
```

---

## 📋 Updated Railway Setup Checklist

### Step 1-4: (Same as before)
- PostgreSQL
- Redis
- API Backend
- Queue Worker

### Step 5: Create Scheduler Service ⏰
1. Click "New" → "GitHub Repo"
2. Select same repository
3. Name: `scheduler`
4. Set root directory: `backend/`
5. **Override start command:** `php artisan schedule:work`
6. Copy environment variables from API backend
7. Deploy

**Important:** Use `schedule:work` (Laravel 11+) instead of cron loop!

---

## 🎯 Start Command Options

### Option 1: schedule:work (Recommended - Laravel 11+)
```bash
php artisan schedule:work
```
- ✅ Built into Laravel 11+
- ✅ Runs continuously
- ✅ Checks every minute automatically
- ✅ No shell loop needed

### Option 2: Cron Loop (If Laravel < 11)
```bash
while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done
```
- ⚠️ Requires shell loop
- ⚠️ More complex
- ✅ Works on older Laravel versions

**Your Laravel version:** 12.0 ✅  
**Use:** `php artisan schedule:work` ✅

---

## 📊 What Gets Scheduled

### Campaign Management:
- ✅ `ProcessCampaignTimelines` - Hourly
- ✅ `AdvanceCampaignDays` - Daily at midnight

### Newsletter:
- ✅ `ScheduleDailyNewsletters` - Daily at 00:05
- ✅ `ScheduleWeeklyNewsletters` - Weekly Sunday 00:10
- ✅ `ProcessScheduledNewsletters` - **Every minute**
- ✅ `UpdateNewsletterStats` - Every 5 minutes

### Alerts:
- ✅ `ProcessScheduledAlerts` - **Every minute**
- ✅ `UpdateAlertStats` - Every 5 minutes

### Maintenance:
- ✅ `CompileAllEmailLists` - Daily at 02:00
- ✅ `UpdateEngagementScores` - Weekly Monday 03:00
- ✅ `CleanupExpiredTokens` - Daily at 04:00
- ✅ `ProcessBounces` - Every 15 minutes
- ✅ `SendReengagementCampaign` - Monthly 1st at 10:00

### Data Processing:
- ✅ `embeddings:process` - Every 5 minutes
- ✅ `embeddings:generate-pending` - Hourly
- ✅ `cleanup:old-data` - Daily

---

## ⚠️ Critical Scheduled Tasks

### Must Run Every Minute:
- `ProcessScheduledNewsletters` - Sends newsletters at scheduled times
- `ProcessScheduledAlerts` - Sends alerts at scheduled times

**If scheduler stops:** Newsletters and alerts won't send!

### Must Run Daily:
- `AdvanceCampaignDays` - Advances customers through campaign timelines
- `ProcessCampaignTimelines` - Processes due campaign actions

**If scheduler stops:** Campaigns won't progress!

---

## 💰 Updated Cost Estimate

### Starter Tier:
- PostgreSQL: $5/month
- Redis: $5/month
- API Backend: $5/month
- Queue Worker: $5/month
- **Scheduler: $5/month** ← NEW
- Frontend: Cloudflare Pages (Free)
- **Total: ~$25/month**

### Pro Tier:
- PostgreSQL: $20/month
- Redis: $20/month
- API Backend: $20/month (2 replicas)
- Queue Worker: $20/month (2 replicas)
- **Scheduler: $5/month** ← NEW (only need 1)
- Frontend: Cloudflare Pages (Free)
- **Total: ~$85/month**

---

## 🔒 Scheduler Service Configuration

### Railway Service Settings:

**Name:** `scheduler`  
**Root:** `backend/`  
**Start Command:** `php artisan schedule:work`  
**Build:** (auto-detected from nixpacks.toml)

### Environment Variables:
Copy all from `api-backend` service:
- Database connection
- Redis connection
- API keys
- App configuration

### Health Check:
Not needed - scheduler is a background service.

### Restart Policy:
- **Restart on failure:** Yes
- **Max retries:** 10

---

## ✅ Verification

### Check Scheduler is Running:
```bash
# In Railway scheduler service shell
php artisan schedule:list
```

This shows all scheduled tasks and when they run next.

### Check Scheduler Logs:
```bash
# In Railway scheduler service logs
# Should see: "Running scheduled command..."
```

### Test a Scheduled Task:
```bash
# Run scheduler manually
php artisan schedule:run
```

---

## 🎯 Final Architecture

```
Railway Services:
├── 📦 postgres-db (PostgreSQL)
├── 🔴 redis-cache (Redis)
├── 🚀 api-backend (Laravel API + Horizon)
├── ⚙️ queue-worker (Processes background jobs)
├── ⏰ scheduler (Runs scheduled tasks) ← REQUIRED!
└── 🎨 frontend (React SPA)
```

---

## 📝 Summary

**Question:** Do we need a scheduler?

**Answer:** ✅ **YES, absolutely!**

**Why:**
- ✅ Campaigns need to advance daily (`AdvanceCampaignDays`)
- ✅ Campaign timelines need processing hourly (`ProcessCampaignTimelines`)
- ✅ Newsletters need scheduling (`ProcessScheduledNewsletters` - every minute!)
- ✅ Alerts need processing (`ProcessScheduledAlerts` - every minute!)
- ✅ Many other scheduled tasks

**Without scheduler:**
- ❌ Campaigns won't progress
- ❌ Newsletters won't send
- ❌ Alerts won't send
- ❌ Scheduled tasks won't run

**Solution:** Add a `scheduler` service that runs `php artisan schedule:work`

---

## 🚀 Quick Setup

1. Create new Railway service
2. Name: `scheduler`
3. Root: `backend/`
4. Start command: `php artisan schedule:work`
5. Copy env vars from API backend
6. Deploy

**That's it!** Your scheduled tasks will now run automatically. 🎉
