# 🎯 What is Laravel Horizon?

## Quick Answer

**Horizon is NOT a separate service.** It's a **web dashboard** that runs **INSIDE** your Laravel API backend service.

---

## 📊 What Horizon Actually Is

### Horizon = Queue Monitoring Dashboard

**Laravel Horizon** is a package that provides:
- 📈 **Web UI** to monitor your queues
- 📊 **Real-time metrics** (jobs processed, failed, etc.)
- 🔍 **Job inspection** (see what's in queues)
- ⚠️ **Failed job management**
- 📉 **Performance metrics**

### It's Part of Your API Backend

```
api-backend Service (Laravel)
├── /api/* → Your API endpoints
├── /horizon → Horizon dashboard (web UI)
└── Queue workers → Process jobs (separate service)
```

---

## 🏗️ How It Works

### 1. Horizon Dashboard (Web UI)
- **Runs in:** `api-backend` service
- **Accessible at:** `https://api-backend.up.railway.app/horizon`
- **Purpose:** Monitor queues visually
- **Uses:** Redis to store metrics

### 2. Queue Workers (Background Processing)
- **Runs in:** `queue-worker` service (separate)
- **Purpose:** Actually process jobs
- **Command:** `php artisan queue:work redis`

### 3. Redis (Data Storage)
- **Stores:** Queue jobs, Horizon metrics, cache
- **Used by:** Both API backend AND queue worker

---

## 🚀 Railway Architecture (Corrected)

```
Railway Project: learning-center-platform
│
├── 📦 postgres-db (PostgreSQL)
│
├── 🔴 redis-cache (Redis)
│
├── 🚀 api-backend (Laravel)
│   ├── Handles: HTTP API requests
│   ├── Serves: Horizon dashboard at /horizon
│   └── Uses: Redis for cache/sessions
│
├── ⚙️ queue-worker (Laravel)
│   ├── Processes: Background jobs
│   ├── Uses: Redis for queue
│   └── Reports: Metrics to Horizon (via Redis)
│
└── 🎨 frontend (React)
```

---

## 🔍 How to Access Horizon

### In Production:
```
https://your-api-backend.up.railway.app/horizon
```

### Local Development:
```
http://localhost:8000/horizon
```

### Authentication:
Horizon has a gate (`viewHorizon`) that controls access. Check `app/Providers/HorizonServiceProvider.php`:

```php
Gate::define('viewHorizon', function ($user = null) {
    // Define who can access Horizon
    // Usually: admins only
});
```

---

## 📋 What You See in Horizon Dashboard

1. **Overview:**
   - Jobs processed per minute
   - Throughput
   - Wait times
   - Recent jobs

2. **Queues:**
   - `default` - General jobs
   - `emails` - Email sending
   - `sms` - SMS sending
   - `calls` - Phone calls
   - `ai` - AI processing
   - etc.

3. **Jobs:**
   - Pending jobs
   - Processing jobs
   - Completed jobs
   - Failed jobs

4. **Workers:**
   - Active workers
   - Worker status
   - Job processing stats

---

## ⚙️ Configuration

### Horizon Config: `backend/config/horizon.php`

```php
'path' => 'horizon',  // URL path: /horizon
'domain' => null,     // Subdomain (null = same domain)
```

### Access Control: `backend/app/Providers/HorizonServiceProvider.php`

```php
Gate::define('viewHorizon', function ($user = null) {
    // Add your access control logic here
    return $user && $user->isAdmin();
});
```

---

## 🎯 Summary

| Component | What It Is | Where It Runs |
|-----------|-----------|---------------|
| **Horizon** | Web dashboard | `api-backend` service |
| **Queue Workers** | Job processors | `queue-worker` service |
| **Redis** | Queue storage | `redis-cache` service |
| **API** | HTTP endpoints | `api-backend` service |

---

## ✅ Correct Railway Setup

### Service 1: api-backend
- **Root:** `backend/`
- **Start:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Provides:**
  - ✅ API endpoints (`/api/*`)
  - ✅ Horizon dashboard (`/horizon`)
  - ✅ Health check (`/health`)

### Service 2: queue-worker
- **Root:** `backend/`
- **Start:** `php artisan queue:work redis --sleep=3 --tries=3`
- **Provides:**
  - ✅ Processes background jobs
  - ✅ Reports metrics to Horizon (via Redis)

### Service 3: redis-cache
- **Provides:**
  - ✅ Queue storage
  - ✅ Horizon metrics storage
  - ✅ Cache storage
  - ✅ Session storage

---

## 🔒 Security Note

**Horizon should be protected!**

Currently configured in `HorizonServiceProvider.php`. Make sure to:
1. Restrict access to admins only
2. Use authentication middleware
3. Consider IP whitelisting for production
4. Use HTTPS (Railway provides automatically)

---

## 📊 Monitoring Flow

```
1. Queue Worker processes job
   ↓
2. Updates Redis with metrics
   ↓
3. Horizon reads from Redis
   ↓
4. Dashboard displays metrics
```

**All communication happens via Redis** - no direct connection between Horizon dashboard and queue workers.

---

## 🎯 Bottom Line

**Horizon = Dashboard UI** (runs in API backend)  
**Queue Workers = Job Processors** (separate service)  
**Redis = Data Storage** (shared by both)

**You need 3 services:**
1. ✅ `api-backend` (includes Horizon dashboard)
2. ✅ `queue-worker` (processes jobs)
3. ✅ `redis-cache` (stores everything)

**NOT 4 services** - Horizon is NOT separate!
