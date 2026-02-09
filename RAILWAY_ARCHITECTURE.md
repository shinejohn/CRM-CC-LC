# 🚂 Railway Deployment Architecture

**Recommended Service Structure for Learning Center Platform**

---

## 📊 Service Overview

### Recommended Architecture: **6 Services**

```
Railway Project: learning-center-platform
├── 📦 postgres-db (PostgreSQL Database)
├── 🔴 redis-cache (Redis Cache & Queue)
├── 🚀 api-backend (Laravel API Server)
├── ⚙️ queue-worker (Laravel Queue Worker)
├── ⏰ scheduler (Laravel Scheduler) ← REQUIRED for campaigns!
└── 🎨 frontend (React SPA) [Optional - can use Cloudflare Pages]
```

---

## 🗄️ Service 1: PostgreSQL Database

**Type:** PostgreSQL Template  
**Name:** `postgres-db` or `learning-center-db`

### Configuration:
- **Template:** PostgreSQL
- **Version:** Latest (14+)
- **Storage:** Start with 10GB, scale as needed
- **Backups:** Enable automatic backups

### Environment Variables (Auto-generated):
- `PGHOST` → `${{Postgres.PGHOST}}`
- `PGPORT` → `${{Postgres.PGPORT}}`
- `PGDATABASE` → `${{Postgres.PGDATABASE}}`
- `PGUSER` → `${{Postgres.PGUSER}}`
- `PGPASSWORD` → `${{Postgres.PGPASSWORD}}`

### Purpose:
- Store all application data
- Run migrations automatically
- Support pgvector for semantic search

---

## 🔴 Service 2: Redis Cache & Queue

**Type:** Redis Template  
**Name:** `redis-cache` or `learning-center-redis`

### Configuration:
- **Template:** Redis
- **Version:** Latest (7+)
- **Memory:** Start with 256MB, scale as needed
- **Persistence:** Enable if needed

### Environment Variables (Auto-generated):
- `REDIS_HOST` → `${{Redis.REDIS_HOST}}`
- `REDIS_PORT` → `${{Redis.REDIS_PORT}}`
- `REDIS_PASSWORD` → `${{Redis.REDIS_PASSWORD}}`

### Purpose:
- Laravel cache storage
- Queue system backend
- Session storage
- Horizon dashboard data

---

## 🚀 Service 3: API Backend (Laravel)

**Type:** GitHub Repo / Private Repo  
**Name:** `api-backend` or `learning-center-api`

### Configuration:
- **Root Directory:** `backend/`
- **Build Command:** (handled by nixpacks.toml)
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Health Check:** `/api/health` or `/`

### What This Service Provides:
- ✅ **API Endpoints:** `/api/*` - All your REST API routes
- ✅ **Horizon Dashboard:** `/horizon` - Queue monitoring UI (built-in)
- ✅ **Health Check:** `/health` - Service health endpoint

**Note:** Horizon is NOT a separate service - it's a web dashboard that runs inside this Laravel API backend service.

### Environment Variables:
```bash
# App Configuration
APP_NAME=LearningCenter
APP_ENV=production
APP_KEY=<generate-with-php-artisan-key-generate>
APP_DEBUG=false
APP_URL=https://api-backend.up.railway.app

# Database (from postgres-db service)
DB_CONNECTION=pgsql
DB_HOST=${{postgres-db.PGHOST}}
DB_PORT=${{postgres-db.PGPORT}}
DB_DATABASE=${{postgres-db.PGDATABASE}}
DB_USERNAME=${{postgres-db.PGUSER}}
DB_PASSWORD=${{postgres-db.PGPASSWORD}}

# Redis (from redis-cache service)
REDIS_HOST=${{redis-cache.REDIS_HOST}}
REDIS_PORT=${{redis-cache.REDIS_PORT}}
REDIS_PASSWORD=${{redis-cache.REDIS_PASSWORD}}

# Queue
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis

# API Keys
OPENROUTER_API_KEY=<your-key>
ELEVEN_LABS_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>

# AI Gateway
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=<your-token>

# Horizon
HORIZON_PREFIX=horizon
```

### Build Process (nixpacks.toml):
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

### Scaling:
- **Replicas:** Start with 1, scale to 2-3 for production
- **Resources:** 512MB RAM minimum, 1GB recommended

### Purpose:
- Handle HTTP API requests
- Serve Laravel Horizon dashboard
- Process synchronous operations

---

## ⚙️ Service 4: Queue Worker

**Type:** GitHub Repo / Private Repo (same repo as API)  
**Name:** `queue-worker` or `learning-center-worker`

### Configuration:
- **Root Directory:** `backend/`
- **Build Command:** (same as API backend)
- **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
- **Health Check:** Not needed (background service)

### Environment Variables:
```bash
# Same as API Backend, but:
# - No APP_URL needed
# - No HTTP_PORT needed
# - Same database/redis connections
```

### Build Process:
Same `nixpacks.toml` as API backend (migrations already run)

### Scaling:
- **Replicas:** Start with 1, scale to 2-4 for production
- **Resources:** 512MB RAM minimum
- **Concurrency:** Handle multiple jobs simultaneously

### Purpose:
- Process background jobs (47+ job types)
- Email campaigns
- SMS sending
- AI processing
- Data calculations
- Provisioning tasks

### Queue Types:
- `default` - General jobs
- `emails` - Email sending
- `sms` - SMS sending
- `calls` - Phone calls
- `ai` - AI processing
- `provisioning` - Service provisioning

---

## 🎨 Service 5: Frontend (React SPA)

**Type:** GitHub Repo / Private Repo  
**Name:** `frontend` or `learning-center-frontend`

### Option A: Railway Static Service
**Configuration:**
- **Root Directory:** `./` (root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

### Option B: Cloudflare Pages (Recommended)
**Why:** Better CDN, faster global delivery, free tier

**Configuration:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist/`
- **Framework Preset:** Vite

### Environment Variables:
```bash
VITE_API_ENDPOINT=https://api-backend.up.railway.app/api
VITE_API_URL=https://api-backend.up.railway.app/api
NODE_ENV=production
```

### Purpose:
- Serve React SPA
- Static asset delivery
- Client-side routing

---

## 🏗️ Alternative Architecture: Monorepo Approach

If deploying from a single repository:

### Single Railway Project Structure:
```
learning-center-platform/
├── Services:
│   ├── postgres-db (PostgreSQL)
│   ├── redis-cache (Redis)
│   ├── api-backend (backend/)
│   ├── queue-worker (backend/)
│   └── frontend (./)
```

### Service Configuration:

**API Backend:**
- Root: `backend/`
- Build: nixpacks.toml
- Start: `php artisan serve --host=0.0.0.0 --port=$PORT`

**Queue Worker:**
- Root: `backend/`
- Build: nixpacks.toml (same)
- Start: `php artisan queue:work redis --sleep=3 --tries=3`

**Frontend:**
- Root: `./` (root)
- Build: `npm install && npm run build`
- Start: `npx serve -s dist -l $PORT`

---

## 📋 Railway Setup Checklist

### Step 1: Create Project
1. Go to Railway dashboard
2. Create new project: `learning-center-platform`
3. Connect GitHub repository

### Step 2: Create Database Service
1. Click "New" → "Database" → "Add PostgreSQL"
2. Name: `postgres-db`
3. Wait for provisioning
4. Note the connection variables

### Step 3: Create Redis Service
1. Click "New" → "Database" → "Add Redis"
2. Name: `redis-cache`
3. Wait for provisioning
4. Note the connection variables

### Step 4: Create API Backend Service
1. Click "New" → "GitHub Repo"
2. Select your repository
3. Name: `api-backend`
4. Set root directory: `backend/`
5. Railway will auto-detect nixpacks.toml
6. Add environment variables (see above)
7. Generate `APP_KEY`: Run `php artisan key:generate` in service shell
8. Deploy

### Step 5: Create Queue Worker Service
1. Click "New" → "GitHub Repo"
2. Select same repository
3. Name: `queue-worker`
4. Set root directory: `backend/`
5. Override start command: `php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600`
6. Copy environment variables from API backend
7. Deploy

### Step 6: Create Scheduler Service ⏰
1. Click "New" → "GitHub Repo"
2. Select same repository
3. Name: `scheduler`
4. Set root directory: `backend/`
5. **Override start command:** `php artisan schedule:work`
6. Copy environment variables from API backend
7. Deploy

**Important:** This service runs scheduled tasks (campaigns, newsletters, alerts) that need to run every minute!

### Step 7: Create Frontend Service (or use Cloudflare)
**Option A - Railway:**
1. Click "New" → "GitHub Repo"
2. Select same repository
3. Name: `frontend`
4. Set root directory: `./` (root)
5. Override build command: `npm install && npm run build`
6. Override start command: `npx serve -s dist -l $PORT`
7. Add environment variables
8. Deploy

**Option B - Cloudflare Pages (Recommended):**
1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist/`
4. Framework preset: Vite
5. Add environment variables
6. Deploy

---

## 🔗 Service Dependencies

```
api-backend
  ├── Depends on: postgres-db
  └── Depends on: redis-cache

queue-worker
  ├── Depends on: postgres-db
  └── Depends on: redis-cache

frontend
  └── Depends on: api-backend (via API calls)
```

Railway automatically handles service dependencies and waits for services to be ready.

---

## 💰 Cost Estimation

### Railway Pricing (Approximate):

**PostgreSQL:**
- Starter: $5/month (1GB storage)
- Pro: $20/month (10GB storage)

**Redis:**
- Starter: $5/month (256MB)
- Pro: $20/month (1GB)

**API Backend:**
- Starter: $5/month (512MB RAM)
- Pro: $20/month (2GB RAM)

**Queue Worker:**
- Starter: $5/month (512MB RAM)
- Pro: $20/month (2GB RAM)

**Frontend (if Railway):**
- Starter: $5/month
- Pro: $20/month

**Total (Starter):** ~$25-30/month  
**Total (Pro):** ~$100/month

**Alternative:** Use Cloudflare Pages for frontend (free) → Save $5-20/month

---

## 🚀 Recommended Production Setup

### Minimum (Starter Tier):
- ✅ PostgreSQL: Starter ($5)
- ✅ Redis: Starter ($5)
- ✅ API Backend: Starter ($5)
- ✅ Queue Worker: Starter ($5)
- ✅ Frontend: Cloudflare Pages (Free)
- **Total: ~$20/month**

### Recommended (Pro Tier):
- ✅ PostgreSQL: Pro ($20)
- ✅ Redis: Pro ($20)
- ✅ API Backend: Pro ($20) - 2 replicas
- ✅ Queue Worker: Pro ($20) - 2 replicas
- ✅ Frontend: Cloudflare Pages (Free)
- **Total: ~$80/month**

---

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use Railway's environment variable system
   - Rotate API keys regularly

2. **Database:**
   - Use Railway's private networking
   - Enable SSL connections
   - Regular backups

3. **API:**
   - Use HTTPS (Railway provides automatically)
   - Implement rate limiting
   - Use Laravel Sanctum for API auth

4. **Frontend:**
   - Use HTTPS (Cloudflare provides)
   - Set proper CORS headers
   - Use environment variables for API URLs

---

## 📊 Monitoring & Logs

### Railway Built-in:
- ✅ Service logs
- ✅ Deployment history
- ✅ Resource usage
- ✅ Health checks

### Additional Monitoring:
- **Laravel Horizon:** Queue monitoring dashboard
- **Laravel Telescope:** Debug and monitoring (dev only)
- **Sentry:** Error tracking (optional)
- **New Relic/DataDog:** APM (optional)

---

## 🎯 Quick Start Commands

### Generate APP_KEY:
```bash
# In Railway service shell or locally
cd backend
php artisan key:generate
# Copy the key to Railway environment variables
```

### Run Migrations (if needed manually):
```bash
# In Railway service shell
cd backend
php artisan migrate --force
```

### Clear Cache:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Check Queue Status:
```bash
php artisan horizon:status
```

---

## ✅ Final Architecture Recommendation

**For Production:**
```
✅ PostgreSQL (Pro) - $20/month
✅ Redis (Pro) - $20/month
✅ API Backend (Pro, 2 replicas) - $20/month
✅ Queue Worker (Pro, 2 replicas) - $20/month
✅ Frontend (Cloudflare Pages) - FREE
─────────────────────────────────────
Total: ~$80/month
```

**For Development/Staging:**
```
✅ PostgreSQL (Starter) - $5/month
✅ Redis (Starter) - $5/month
✅ API Backend (Starter) - $5/month
✅ Queue Worker (Starter) - $5/month
✅ Frontend (Cloudflare Pages) - FREE
─────────────────────────────────────
Total: ~$20/month
```

---

**This architecture provides:**
- ✅ Scalability (can scale each service independently)
- ✅ Reliability (services can restart independently)
- ✅ Cost efficiency (pay for what you need)
- ✅ Separation of concerns (API vs Workers)
- ✅ Easy monitoring (each service has its own logs)

**Ready to deploy!** 🚀
