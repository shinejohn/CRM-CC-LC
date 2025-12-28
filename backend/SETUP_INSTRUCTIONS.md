# 🚀 Backend Setup Instructions

**Laravel 11 REST API Backend for Learning Center**

---

## 📋 SETUP STEPS

### Step 1: Create Laravel Project

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center
composer create-project laravel/laravel backend --prefer-dist
cd backend
```

### Step 2: Install Packages

```bash
# Queue management
composer require laravel/horizon
php artisan horizon:install

# Redis client
composer require predis/predis

# API authentication
composer require laravel/sanctum

# Additional packages (if needed)
composer require aws/aws-sdk-php
composer require guzzlehttp/guzzle
```

### Step 3: Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env`:
```env
APP_NAME="Learning Center API"
APP_ENV=production
APP_DEBUG=false

# Database (Railway)
DATABASE_URL=postgresql://...  # From Railway

# Redis (Railway)
REDIS_URL=redis://...  # From Railway
QUEUE_CONNECTION=redis

# API Keys
ELEVENLABS_API_KEY=...
OPENAI_API_KEY=...
OPENROUTER_API_KEY=...
```

### Step 4: Copy Created Files

The backend structure has been created in `backend/` directory:
- Controllers
- Routes
- Jobs
- Services
- Commands
- Railway config

Copy these into your Laravel project after creation.

### Step 5: Run Migrations

```bash
# Convert SQL migrations to Laravel migrations first
# Then run:
php artisan migrate
```

### Step 6: Start Services

```bash
# Development server
php artisan serve

# Horizon (queue worker)
php artisan horizon

# Scheduler (in separate terminal)
php artisan schedule:work
```

---

## 🚂 RAILWAY DEPLOYMENT

### Services Needed:
1. **CRM-CC-LC** - Main API service
2. **learning-center-db** - PostgreSQL (already created)
3. **learning-center-redis** - Redis (create if needed)

### Deployment Steps:
1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables
4. Railway will auto-deploy

---

## ✅ VERIFICATION

After setup:
1. ✅ API endpoints respond at `/api/v1/...`
2. ✅ Horizon dashboard accessible (if configured)
3. ✅ Scheduler running
4. ✅ Database connected
5. ✅ Redis connected

---

**Ready to deploy!** 🚀






