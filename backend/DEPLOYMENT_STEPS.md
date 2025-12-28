# 🚂 Railway Deployment Steps

**Complete guide for deploying Laravel backend to Railway**

---

## ✅ PREREQUISITES

- ✅ Laravel backend initialized
- ✅ Packages installed (Horizon, Redis, Sanctum)
- ✅ GitHub repository: `https://github.com/shinejohn/CRM-CC-LC`
- ✅ Railway account: `shinejohn`
- ✅ Railway workspace: `Fibonacco Sales`
- ✅ PostgreSQL service: `trolley.proxy.rlwy.net:53826`

---

## 🗄️ STEP 1: Configure Database Connection

### Option A: Using Railway CLI (Recommended)

```bash
cd backend

# Link Railway project
railway link

# Get DATABASE_URL
railway variables get DATABASE_URL

# Update .env with DATABASE_URL
# Or run setup script:
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

### Option B: Manual Configuration

1. **Get DATABASE_URL from Railway Dashboard:**
   - Go to Railway Dashboard
   - Select PostgreSQL service
   - Copy `DATABASE_URL` from Variables tab

2. **Update `.env` file:**
   ```env
   DATABASE_URL=postgresql://postgres:password@trolley.proxy.rlwy.net:53826/railway
   ```

   **Or set individual variables:**
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=trolley.proxy.rlwy.net
   DB_PORT=53826
   DB_DATABASE=railway
   DB_USERNAME=postgres
   DB_PASSWORD=<from Railway>
   ```

---

## 🚀 STEP 2: Run Migrations

### Local Testing (Optional)

```bash
cd backend

# Run migrations locally to test
php artisan migrate
```

### On Railway (After Deployment)

```bash
# Via Railway CLI
railway run php artisan migrate

# Or via Railway Dashboard
# → Go to Deployments
# → Click "Run Command"
# → Enter: php artisan migrate
```

---

## 📦 STEP 3: Push to GitHub

```bash
cd backend

# Add all files
git add .

# Commit
git commit -m "Laravel backend setup complete - ready for Railway deployment"

# Push
git push origin main
```

---

## 🚂 STEP 4: Deploy to Railway

### 4.1: Connect Railway to GitHub

1. Go to Railway Dashboard: https://railway.app
2. Select workspace: **Fibonacco Sales**
3. Click **"New Project"** or select existing project **"CRM-CC-LC"**
4. Select **"Deploy from GitHub repo"**
5. Choose repository: `shinejohn/CRM-CC-LC`
6. Railway will auto-detect Laravel

### 4.2: Configure Service

1. **Set Root Directory:**
   - Settings → Root Directory → `backend`

2. **Set Start Command:**
   - Settings → Start Command → `php artisan serve --host=0.0.0.0 --port=$PORT`

3. **Configure Build:**
   - Railway will auto-detect using `nixpacks.toml`

### 4.3: Set Environment Variables

In Railway Dashboard → Variables, set:

```env
APP_NAME="Learning Center API"
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generate with: php artisan key:generate>

# Database (auto-set if PostgreSQL service is linked)
DATABASE_URL=<auto-provided by Railway>

# Redis (if using Redis service)
REDIS_URL=<auto-provided by Railway>
QUEUE_CONNECTION=redis

# API Keys
ELEVENLABS_API_KEY=63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616
OPENROUTER_API_KEY=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
OPENAI_API_KEY=<your-openai-key>

# Cloudflare R2 (if using)
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_URL=
```

**Generate APP_KEY:**
```bash
php artisan key:generate --show
# Copy the key and paste in Railway variables
```

### 4.4: Link PostgreSQL Service

1. In Railway Dashboard:
   - Go to PostgreSQL service
   - Click "Connect"
   - Select "CRM-CC-LC" service
   - Railway automatically sets `DATABASE_URL`

### 4.5: Deploy

1. Railway will auto-deploy on git push
2. Or click **"Deploy"** button in dashboard
3. Monitor deployment logs

---

## ⚙️ STEP 5: Run Migrations on Railway

### Option A: Via Railway CLI

```bash
railway link
railway run php artisan migrate
```

### Option B: Via Railway Dashboard

1. Go to Deployments
2. Click on latest deployment
3. Click "Run Command"
4. Enter: `php artisan migrate`
5. Click "Run"

---

## 🔄 STEP 6: Start Additional Services

### Horizon (Queue Worker)

Create separate Railway service:

1. **Add Service:**
   - Click "+ New" in Railway dashboard
   - Select "GitHub Repo"
   - Choose same repository
   - Set Root Directory: `backend`

2. **Configure:**
   - Start Command: `php artisan horizon`
   - Environment Variables: Same as main service
   - Link to same PostgreSQL and Redis services

### Scheduler (Cron Jobs)

Create separate Railway service:

1. **Add Service:**
   - Click "+ New"
   - Select "GitHub Repo"
   - Choose same repository
   - Set Root Directory: `backend`

2. **Configure:**
   - Start Command: `php artisan schedule:work`
   - Environment Variables: Same as main service
   - Link to same PostgreSQL and Redis services

---

## ✅ STEP 7: Verify Deployment

1. **Check API Health:**
   ```bash
   curl https://your-service.railway.app/api/v1/knowledge
   ```

2. **Check Horizon Dashboard:**
   - Visit: `https://your-service.railway.app/horizon`
   - (Configure Horizon access in production)

3. **Check Database:**
   ```bash
   railway run php artisan db:show
   ```

---

## 🔧 TROUBLESHOOTING

### Database Connection Failed

- Verify `DATABASE_URL` is set in Railway variables
- Check PostgreSQL service is running
- Verify service is linked to PostgreSQL service

### Migrations Failed

- Check database connection
- Verify extensions are enabled (uuid-ossp, pg_trgm, vector)
- Check migration files are in correct directory

### Build Failed

- Check `nixpacks.toml` configuration
- Verify PHP version compatibility
- Check composer dependencies

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Database connection configured
- [ ] Migrations run successfully
- [ ] Code pushed to GitHub
- [ ] Railway service created
- [ ] Environment variables set
- [ ] PostgreSQL service linked
- [ ] Service deployed
- [ ] API endpoints working
- [ ] Horizon service running (optional)
- [ ] Scheduler service running (optional)

---

## 🎯 QUICK DEPLOYMENT COMMANDS

```bash
# 1. Setup database
cd backend
./scripts/setup-database.sh

# 2. Run migrations (local test)
php artisan migrate

# 3. Push to GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main

# 4. Deploy on Railway
# Railway auto-deploys on push, or:
railway up

# 5. Run migrations on Railway
railway run php artisan migrate
```

---

**Ready to deploy!** 🚀






