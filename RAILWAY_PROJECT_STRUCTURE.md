# 🚂 Railway Project Structure

**Workspace:** Fibonacco Sales  
**Application Server:** CRM-CC-LC  
**Email:** admin@fae.city

---

## 📋 PROJECT CONFIGURATION

### Railway Setup
- **Workspace:** Fibonacco Sales
- **Application Server:** CRM-CC-LC (Laravel API service)
- **Email:** admin@fae.city
- **GitHub Repo:** shinejohn/CRM-CC-LC

### Services Architecture

```
Fibonacco Sales (Workspace)
└── CRM-CC-LC (Application Server - Laravel API)
    ├── learning-center-db (PostgreSQL Database)
    └── learning-center-redis (Redis Cache/Queue)
```

---

## 🎯 SERVICE DEFINITIONS

### 1. CRM-CC-LC (Application Server)
- **Type:** Laravel API Service
- **Purpose:** Backend API for Learning Center
- **Language:** PHP 8.3
- **Framework:** Laravel 11
- **Repository:** Connected to GitHub (auto-deploy)
- **Port:** Railway auto-assigns PORT environment variable

### 2. learning-center-db (Database)
- **Type:** PostgreSQL
- **Purpose:** Primary database
- **Features:** 
  - pgvector extension for vector search
  - Connection pooling
  - Automatic backups

### 3. learning-center-redis (Cache/Queue)
- **Type:** Redis
- **Purpose:** 
  - Cache layer
  - Queue processing (Laravel Horizon)
  - Session storage

---

## 📁 RAILWAY PROJECT SETUP

### Project Name: CRM-CC-LC

**Services:**
1. **CRM-CC-LC** - Laravel application server (main service)
2. **learning-center-db** - PostgreSQL database
3. **learning-center-redis** - Redis service

---

## 🔧 CONFIGURATION

### Application Server (CRM-CC-LC)
- **Build Command:** Configured via nixpacks.toml
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`
- **Environment Variables:**
  - `DATABASE_URL` (from PostgreSQL service)
  - `REDIS_URL` (from Redis service)
  - API keys (ElevenLabs, OpenRouter, OpenAI)
  - Cloudflare R2 credentials

### Database (learning-center-db)
- **Type:** PostgreSQL
- **Extensions:** pgvector
- **Auto-provides:** `DATABASE_URL` environment variable

### Redis (learning-center-redis)
- **Type:** Redis
- **Auto-provides:** `REDIS_URL` environment variable

---

## 🚀 DEPLOYMENT FLOW

1. **GitHub Push** → Triggers Railway build
2. **Railway Builds** → CRM-CC-LC service from GitHub
3. **Deploys** → Application server running
4. **Connects** → To PostgreSQL and Redis services
5. **Live** → API endpoints available

---

## ✅ SETUP CHECKLIST

### Railway Setup
- [ ] Authenticate Railway CLI
- [ ] Connect to "Fibonacco Sales" workspace
- [ ] Create project: CRM-CC-LC (or use existing)
- [ ] Add PostgreSQL service: learning-center-db
- [ ] Add Redis service: learning-center-redis
- [ ] Configure CRM-CC-LC service (Laravel)
- [ ] Link GitHub repository
- [ ] Set environment variables
- [ ] Enable auto-deployment

### Backend Setup
- [ ] Create Laravel backend structure
- [ ] Configure Railway deployment files
- [ ] Convert database migrations
- [ ] Set up environment configuration

---

## 📝 NOTES

- **CRM-CC-LC** = Application server name (Laravel API)
- This is the main service that will run the backend
- Database and Redis are supporting services
- All within "Fibonacco Sales" workspace

---

**Ready to set up CRM-CC-LC application server on Railway!** 🚂






