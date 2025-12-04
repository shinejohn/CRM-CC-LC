# 🚂 Railway Migration Plan
## Converting Learning Center from AWS to Railway

**Date:** December 2024  
**Status:** Migration Planning

---

## 📋 CURRENT SITUATION

### What Exists (AWS - TO BE REPLACED)
- ❌ AWS Lambda functions (7 functions)
- ❌ AWS API Gateway
- ❌ AWS CloudFront (for UI - can keep or move to Cloudflare Pages)
- ❌ AWS S3 (for UI hosting - can move to Cloudflare Pages)
- ❌ AWS CDK infrastructure code

**Note:** Database should be Railway PostgreSQL (not AWS RDS/Aurora)

### What Should Be (Railway - TARGET)
- ✅ Railway service for API (Laravel or Node.js backend)
- ✅ Railway PostgreSQL database
- ✅ Railway Redis (cache/queue)
- ✅ Cloudflare Pages for UI hosting (static frontend)
- ✅ Cloudflare R2 for file storage (audio, assets)

---

## 🎯 MIGRATION STRATEGY

### Option 1: Full Railway Migration (Recommended)

**Backend API:**
- Convert Lambda functions → Laravel API service on Railway
- Single Railway service handling all API endpoints
- Uses Railway PostgreSQL database
- Uses Railway Redis for queues/cache

**Frontend:**
- Keep React/Vite app (no change)
- Deploy to Cloudflare Pages (instead of S3/CloudFront)
- Static hosting, fast CDN

**Database:**
- Use Railway PostgreSQL (not AWS RDS/Aurora)
- Create new Railway PostgreSQL database
- Migrate schema to Railway PostgreSQL

**Storage:**
- Migrate from AWS S3 → Cloudflare R2
- For audio files, assets, etc.

---

## 📦 WHAT NEEDS TO CHANGE

### 1. Backend API (Lambda → Railway Service)

**Current (AWS Lambda):**
```
infrastructure/lambda/functions/
├── knowledge/index.js      ❌ Remove
├── search/index.js         ❌ Remove
├── survey/index.js         ❌ Remove
├── training/index.js       ❌ Remove
├── presentation/index.js   ❌ Remove
└── ai/index.js            ❌ Remove

infrastructure/lambda/workers/
├── tts/index.js           ❌ Remove
└── embedding/index.js     ❌ Remove
```

**New (Railway Laravel API):**
```
backend/ (new directory)
├── app/
│   ├── Http/Controllers/
│   │   ├── KnowledgeController.php      ✅ New
│   │   ├── SearchController.php         ✅ New
│   │   ├── SurveyController.php         ✅ New
│   │   ├── TrainingController.php       ✅ New
│   │   ├── PresentationController.php   ✅ New
│   │   └── AiController.php            ✅ New
│   ├── Jobs/
│   │   ├── ProcessTTS.php              ✅ New
│   │   └── ProcessEmbedding.php        ✅ New
│   └── Services/
│       ├── ElevenLabsService.php       ✅ New
│       └── OpenAIService.php           ✅ New
├── routes/api.php                       ✅ New
└── ...
```

### 2. Infrastructure (AWS CDK → Railway)

**Current (AWS CDK):**
```
infrastructure/
├── lib/
│   ├── api-stack.ts          ❌ Remove (Lambda + API Gateway)
│   ├── database-stack.ts     ❌ Remove (Aurora)
│   ├── storage-stack.ts      ❌ Remove (S3)
│   └── ui-hosting-stack.ts   ❌ Remove (S3 + CloudFront)
└── bin/infrastructure.ts     ❌ Remove (CDK app)
```

**New (Railway Config):**
```
backend/
├── railway.json              ✅ New (Railway config)
├── nixpacks.toml            ✅ New (build config)
└── Dockerfile               ✅ New (optional)

frontend/
└── wrangler.toml            ✅ New (Cloudflare Pages)
```

### 3. Database (Aurora → Railway PostgreSQL)

**Current:**
- AWS Aurora Serverless
- Migrations in `infrastructure/migrations/`

**New:**
- Railway PostgreSQL
- Same migrations, run via Laravel migrations
- `backend/database/migrations/`

### 4. Frontend Deployment (CloudFront → Cloudflare Pages)

**Current:**
- AWS S3 bucket
- CloudFront distribution
- CDK deployment

**New:**
- Cloudflare Pages
- Direct deployment from Git
- Or via `wrangler pages deploy`

---

## 🗑️ FILES TO REMOVE (AWS Infrastructure)

```
infrastructure/
├── lib/
│   ├── api-stack.ts          ❌ DELETE
│   ├── database-stack.ts     ❌ DELETE
│   ├── storage-stack.ts      ❌ DELETE
│   ├── ui-hosting-stack.ts   ❌ DELETE
│   ├── learning-center-stack.ts ❌ DELETE
│   └── route53-stack.ts      ❌ DELETE
├── lambda/                    ❌ DELETE (entire directory)
├── migrations/                ⚠️ MOVE to backend/database/migrations/
├── bin/infrastructure.ts      ❌ DELETE
├── cdk.json                   ❌ DELETE
├── package.json               ❌ DELETE (CDK dependencies)
└── tsconfig.json              ❌ DELETE
```

---

## ✅ FILES TO CREATE (Railway Backend)

```
backend/ (new root directory)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── KnowledgeController.php
│   │   │   │   ├── SearchController.php
│   │   │   │   ├── SurveyController.php
│   │   │   │   ├── TrainingController.php
│   │   │   │   ├── PresentationController.php
│   │   │   │   └── AiController.php
│   │   │   └── ...
│   │   └── Requests/
│   ├── Jobs/
│   │   ├── ProcessTTS.php
│   │   └── ProcessEmbedding.php
│   ├── Services/
│   │   ├── ElevenLabsService.php
│   │   ├── OpenAIService.php
│   │   └── CloudflareR2Service.php
│   └── Models/
│       ├── Knowledge.php
│       ├── Faq.php
│       └── ...
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.php (converted from SQL)
│   │   └── 002_add_presentation_tables.php
│   └── seeders/
├── routes/
│   └── api.php
├── config/
│   ├── database.php
│   ├── services.php
│   └── cloudflare.php
├── railway.json
├── nixpacks.toml
├── composer.json
└── ...
```

---

## 🔄 MIGRATION STEPS

### Step 1: Set Up Railway Backend
- [ ] Create new `backend/` directory
- [ ] Initialize Laravel 11 project
- [ ] Configure Railway PostgreSQL connection
- [ ] Configure Railway Redis connection
- [ ] Set up environment variables in Railway

### Step 2: Convert Lambda Functions to Laravel Controllers
- [ ] Convert `knowledge/index.js` → `KnowledgeController.php`
- [ ] Convert `search/index.js` → `SearchController.php`
- [ ] Convert `survey/index.js` → `SurveyController.php`
- [ ] Convert `training/index.js` → `TrainingController.php`
- [ ] Convert `presentation/index.js` → `PresentationController.php`
- [ ] Convert `ai/index.js` → `AiController.php`

### Step 3: Convert Workers to Laravel Jobs
- [ ] Convert `tts/index.js` → `ProcessTTS.php` Job
- [ ] Convert `embedding/index.js` → `ProcessEmbedding.php` Job

### Step 4: Migrate Database
- [ ] Convert SQL migrations to Laravel migrations
- [ ] Test migrations locally
- [ ] Run migrations on Railway PostgreSQL

### Step 5: Update Frontend API Client
- [ ] Update API base URL to Railway service
- [ ] Test all API calls
- [ ] Update environment variables

### Step 6: Deploy to Cloudflare Pages
- [ ] Set up Cloudflare Pages project
- [ ] Configure build settings
- [ ] Deploy frontend
- [ ] Test deployment

### Step 7: Clean Up AWS Resources
- [ ] Remove AWS Lambda functions
- [ ] Remove API Gateway
- [ ] Remove Aurora database (after migration)
- [ ] Remove S3 buckets (after migration)
- [ ] Remove CloudFront distribution
- [ ] Delete AWS CDK infrastructure code

---

## 📝 ARCHITECTURE COMPARISON

### Before (AWS):
```
React Frontend → CloudFront → S3
                    ↓
              API Gateway
                    ↓
            Lambda Functions (7)
                    ↓
          (No database deployed yet)
```

### After (Railway + Cloudflare):
```
React Frontend → Cloudflare Pages
                    ↓
              Railway API (Laravel)
                    ↓
          Railway PostgreSQL
          Railway Redis (queue/cache)
```

---

## 🔧 CONFIGURATION FILES

### railway.json (Backend)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### nixpacks.toml (Backend)
```toml
[phases.setup]
nixPkgs = ["php83", "php83Extensions.pdo_pgsql", "php83Extensions.redis", "composer"]

[phases.install]
cmds = ["composer install --no-dev --optimize-autoloader"]

[phases.build]
cmds = [
  "php artisan config:cache",
  "php artisan route:cache"
]

[start]
cmd = "php artisan serve --host=0.0.0.0 --port=$PORT"
```

### wrangler.toml (Frontend - Cloudflare Pages)
```toml
name = "learning-center"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

---

## ✅ NEXT ACTIONS

1. **Confirm Migration Approach**
   - ✅ Railway for backend API (Laravel)
   - ✅ Railway PostgreSQL for database
   - ✅ Railway Redis for cache/queue
   - ✅ Cloudflare Pages for frontend
   - ✅ Cloudflare R2 for file storage

2. **Create Backend Structure**
   - Initialize Laravel project
   - Set up Railway configuration
   - Convert Lambda functions to controllers

3. **Remove AWS Infrastructure Code**
   - Delete Lambda function code
   - Delete AWS CDK infrastructure
   - Clean up AWS resources (CloudFront, S3)

4. **Database Setup**
   - Create Railway PostgreSQL database
   - Run migrations on Railway PostgreSQL (not RDS)
   - Configure connections

---

**Ready to proceed with Railway migration?** 🚂

