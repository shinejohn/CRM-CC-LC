# 🚀 Laravel Backend Setup Guide

**Complete setup instructions for Learning Center Backend API**

---

## 📋 PREREQUISITES

- PHP 8.2+
- Composer
- PostgreSQL (Railway)
- Redis (Railway, optional)

---

## 🚀 STEP 1: CREATE LARAVEL PROJECT

### Option A: Create Fresh Laravel Project

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center

# Create Laravel project
composer create-project laravel/laravel backend-temp

# Move Laravel files to backend directory
mv backend-temp/* backend/
mv backend-temp/.* backend/ 2>/dev/null || true
rmdir backend-temp
```

### Option B: Use Existing Backend Directory

The backend structure is already created. You need to:

1. **Initialize Laravel in backend/ directory:**
   ```bash
   cd backend
   composer init --name="fibonacco/learning-center-backend" --description="Learning Center API"
   ```

2. **Install Laravel:**
   ```bash
   composer require laravel/framework
   ```

---

## 📦 STEP 2: INSTALL PACKAGES

```bash
cd backend

# Core packages
composer require laravel/horizon
composer require predis/predis
composer require laravel/sanctum
composer require guzzlehttp/guzzle

# Install Horizon
php artisan horizon:install

# Publish Horizon config
php artisan vendor:publish --tag=horizon-config
```

---

## 🔧 STEP 3: COPY CREATED FILES

All files have been created in `backend/` directory. After creating Laravel project:

1. **Keep our created files:**
   - Controllers (`app/Http/Controllers/Api/`)
   - Models (`app/Models/`)
   - Jobs (`app/Jobs/`)
   - Services (`app/Services/`)
   - Commands (`app/Console/Commands/`)
   - Routes (`routes/api.php`)
   - Migrations (`database/migrations/`)
   - Config (`config/horizon.php`, `config/queue.php`, `config/services.php`)

2. **Merge with Laravel's base structure**

---

## 🔐 STEP 4: CONFIGURE ENVIRONMENT

```bash
# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

**Update `.env` with Railway settings:**

```env
APP_NAME="Learning Center API"
APP_ENV=production
APP_DEBUG=false

# Database (Railway auto-provides)
DATABASE_URL=postgresql://...  # From Railway PostgreSQL service

# Redis (Railway auto-provides)
REDIS_URL=redis://...  # From Railway Redis service
QUEUE_CONNECTION=redis

# API Keys
ELEVENLABS_API_KEY=63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616
OPENROUTER_API_KEY=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
OPENAI_API_KEY=your-openai-key

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET=fibonacco-assets
CLOUDFLARE_R2_PUBLIC_URL=https://assets.fibonacco.com
```

---

## 🗄️ STEP 5: RUN MIGRATIONS

```bash
# Run migrations
php artisan migrate

# Or if running on Railway
railway run php artisan migrate
```

---

## ⏰ STEP 6: START SERVICES

### Development

```bash
# API Server
php artisan serve

# Horizon (queue worker)
php artisan horizon

# Scheduler (in separate terminal)
php artisan schedule:work
```

### Production (Railway)

Railway will automatically:
- Start API server via `php artisan serve`
- Run Horizon as separate service
- Run scheduler as separate service (or use Railway cron)

---

## ✅ VERIFICATION

1. **Test API endpoint:**
   ```bash
   curl http://localhost:8000/api/v1/knowledge
   ```

2. **Check Horizon dashboard:**
   - Visit: `http://localhost:8000/horizon`

3. **Verify database connection:**
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

---

## 🚂 RAILWAY DEPLOYMENT

### Step 1: Push to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial Laravel backend setup"
git remote add origin https://github.com/shinejohn/CRM-CC-LC.git
git push -u origin main
```

### Step 2: Configure Railway

1. Go to Railway Dashboard
2. Select CRM-CC-LC service
3. Connect to GitHub repository
4. Set environment variables (see `.env.example`)
5. Railway will auto-deploy

### Step 3: Run Migrations

```bash
railway run php artisan migrate
```

### Step 4: Start Horizon Service

Create separate Railway service:
- Name: `learning-center-horizon`
- Start command: `php artisan horizon`
- Same repo, same environment variables

### Step 5: Start Scheduler Service

Create separate Railway service:
- Name: `learning-center-scheduler`
- Start command: `php artisan schedule:work`
- Same repo, same environment variables

---

## 📚 NEXT STEPS

1. ✅ Laravel project created
2. ✅ Packages installed
3. ✅ Files copied
4. ✅ Environment configured
5. ✅ Migrations run
6. ⏳ Test all endpoints
7. ⏳ Deploy to Railway

---

**Ready for deployment!** 🚀






