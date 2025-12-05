# 🚀 Laravel Backend API Plan

**For:** Learning Center Frontend (Current React SPA)  
**Approach:** REST API Backend (No Inertia, No SSR)

---

## 📋 WHAT WE'RE BUILDING

### Laravel Backend API
- ✅ REST API endpoints for Learning Center
- ✅ Queue management (Horizon)
- ✅ Scheduler (cron jobs)
- ✅ PostgreSQL database connection
- ✅ Redis for queues/cache

### Frontend (No Changes)
- ✅ Keep current React frontend
- ✅ Keep React Router
- ✅ Keep API service layer
- ✅ Connect to Laravel backend via REST API

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────┐
│   React Frontend (Current)          │
│   • React Router                    │
│   • API service layer               │
└─────────────────────────────────────┘
         │
         │ HTTP REST API
         ▼
┌─────────────────────────────────────┐
│   Laravel Backend API               │
│   • REST endpoints                  │
│   • Queue workers (Horizon)         │
│   • Scheduler (cron)                │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Railway Services                  │
│   • PostgreSQL database             │
│   • Redis (queues/cache)            │
└─────────────────────────────────────┘
```

---

## 📦 BACKEND STRUCTURE

### Core Components

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── KnowledgeController.php      # FAQ/Knowledge endpoints
│   │   │   │   ├── SurveyController.php         # Survey endpoints
│   │   │   │   ├── ArticleController.php        # Article endpoints
│   │   │   │   ├── SearchController.php         # Vector search
│   │   │   │   ├── PresentationController.php   # Presentation endpoints
│   │   │   │   └── CampaignController.php       # Campaign endpoints
│   │   │   └── ...
│   │   └── Middleware/
│   ├── Models/
│   │   ├── Knowledge.php
│   │   ├── FaqCategory.php
│   │   ├── SurveySection.php
│   │   └── ...
│   ├── Jobs/
│   │   ├── GenerateEmbedding.php
│   │   ├── GenerateTTS.php
│   │   └── ...
│   ├── Services/
│   │   ├── ElevenLabsService.php
│   │   ├── OpenAIService.php
│   │   └── ...
│   └── Console/
│       └── Commands/
│           └── ScheduleWork.php
├── routes/
│   ├── api.php                      # REST API routes
│   └── console.php                  # Scheduler commands
├── database/
│   └── migrations/                  # Use existing SQL migrations
└── config/
```

---

## 🔌 API ENDPOINTS NEEDED

### Knowledge/FAQ API
```
GET    /api/v1/knowledge                    # List knowledge items
POST   /api/v1/knowledge                    # Create knowledge item
GET    /api/v1/knowledge/{id}               # Get knowledge item
PUT    /api/v1/knowledge/{id}               # Update knowledge item
DELETE /api/v1/knowledge/{id}               # Delete knowledge item
GET    /api/v1/knowledge/search             # Vector search
POST   /api/v1/knowledge/{id}/generate-embedding
GET    /api/v1/faq-categories               # List categories
POST   /api/v1/faq-categories               # Create category
```

### Survey API
```
GET    /api/v1/survey/sections              # List sections
GET    /api/v1/survey/sections/{id}/questions
POST   /api/v1/survey/questions             # Create question
PUT    /api/v1/survey/questions/{id}        # Update question
```

### Articles API
```
GET    /api/v1/articles                     # List articles
POST   /api/v1/articles                     # Create article
GET    /api/v1/articles/{id}                # Get article
PUT    /api/v1/articles/{id}                # Update article
DELETE /api/v1/articles/{id}                # Delete article
```

### Search API
```
POST   /api/v1/search                       # Semantic search
GET    /api/v1/search/status                # Embedding status
```

### Presentation API
```
GET    /api/v1/presentations/{id}           # Get presentation
GET    /api/v1/presentations/templates      # List templates
POST   /api/v1/presentations/generate       # Generate presentation
```

### Campaign API
```
GET    /api/v1/campaigns                    # List campaigns
GET    /api/v1/campaigns/{slug}             # Get campaign by slug
```

---

## 🔧 QUEUE MANAGEMENT (Horizon)

### Jobs to Create
- `GenerateEmbedding` - Generate vector embeddings for knowledge items
- `GenerateTTS` - Generate audio using ElevenLabs
- `ProcessCampaignEmail` - Send campaign emails (future)
- `SyncToContentPlatform` - Sync data (future)

### Horizon Setup
- Dashboard for queue monitoring
- Queue workers configuration
- Failed job handling

---

## ⏰ SCHEDULER

### Scheduled Tasks
- Process queue (Horizon handles this)
- Generate embeddings for pending items
- Clean up old data
- Sync operations (future)

### Setup
- Laravel Scheduler in `app/Console/Kernel.php`
- Railway cron service to run scheduler

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Laravel Project Setup
```bash
composer create-project laravel/laravel backend
cd backend
composer require laravel/horizon
php artisan horizon:install
```

### Step 2: Install Packages
```bash
composer require predis/predis              # Redis
composer require laravel/sanctum            # API auth
composer require aws/aws-sdk-php            # For R2 (S3-compatible)
composer require guzzlehttp/guzzle          # HTTP client
```

### Step 3: Configure Database
- Use existing PostgreSQL (Railway)
- Convert SQL migrations to Laravel migrations
- Set up database connection

### Step 4: Create API Controllers
- Knowledge/FAQ controllers
- Survey controllers
- Search controllers
- Presentation controllers

### Step 5: Set Up Queues
- Configure Redis connection
- Create jobs
- Set up Horizon dashboard

### Step 6: Set Up Scheduler
- Create scheduled commands
- Configure Railway cron service

---

## ✅ KEY FEATURES

### Queue Management ✅
- Laravel Horizon for queue monitoring
- Redis-backed queues
- Background job processing

### Scheduler ✅
- Laravel Scheduler
- Cron job configuration
- Scheduled tasks

### REST API ✅
- Standard REST endpoints
- JSON responses
- API authentication (Sanctum)

### No Inertia ✅
- Pure REST API
- No server-side rendering
- No Inertia.js dependency

### No SSR ✅
- No server-side React rendering
- Frontend handles all rendering

---

## 🚀 DEPLOYMENT

### Railway Services
1. **CRM-CC-LC** (Main API)
   - Laravel application
   - REST API endpoints
   - Horizon dashboard

2. **learning-center-db** (PostgreSQL)
   - Database (already set up)

3. **learning-center-redis** (Redis)
   - Queue storage
   - Cache

4. **ops-scheduler** (Optional separate service)
   - Runs Laravel scheduler
   - Or use main service with cron

---

## 📚 NEXT STEPS

1. ✅ Create Laravel backend structure
2. ✅ Set up API routes
3. ✅ Create controllers
4. ✅ Set up Horizon
5. ✅ Configure scheduler
6. ✅ Deploy to Railway

---

**Perfect approach!** Keep Learning Center frontend, build Laravel REST API backend. 🚀

