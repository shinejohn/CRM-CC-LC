# 🚂 Railway Setup Plan

**Workspace:** Fibonacco Sales  
**Email:** admin@fae.city  
**GitHub Repo:** https://github.com/shinejohn/CRM-CC-LC

---

## 📋 SETUP INFORMATION

### Railway Details
- **Workspace:** Fibonacco Sales
- **Email:** admin@fae.city
- **Application Server:** `CRM-CC-LC` (Laravel API service - main application server)

### Project Details
- **GitHub Repository:** CRM-CC-LC
- **Frontend:** React + TypeScript (ready)
- **Backend:** Laravel (to be created)
- **Database:** PostgreSQL with pgvector
- **Cache/Queue:** Redis

---

## 🎯 SETUP STEPS (After Authentication)

### Step 1: Authenticate Railway CLI
```bash
railway login
```
- Browser opens for OAuth login
- Use: admin@fae.city

### Step 2: Connect to Workspace
- Access "Fibonacco Sales" workspace
- Verify workspace access

### Step 3: Create/Configure Application Server
- Project/Service name: `CRM-CC-LC`
- This is the Laravel application server (main backend service)
- Or link to existing CRM-CC-LC service in workspace

### Step 4: Set Up Services
- **PostgreSQL Database**
  - Service name: `learning-center-db`
  - Enable pgvector extension
  - Configure connection pooling

- **Redis Service**
  - Service name: `learning-center-redis`
  - For cache and queues

- **CRM-CC-LC Application Server**
  - Service name: `CRM-CC-LC`
  - Type: Laravel API service
  - Connect to GitHub repository
  - Auto-deploy from main branch
  - This is the main application server

### Step 5: Configure Environment Variables
- Database connection URL (auto-provided)
- Redis connection URL (auto-provided)
- API keys (ElevenLabs, OpenRouter, OpenAI)
- Cloudflare R2 credentials
- Application settings

### Step 6: Link GitHub Repository
- Connect GitHub repo: `shinejohn/CRM-CC-LC`
- Enable auto-deployment
- Configure build settings

---

## 📁 PROJECT STRUCTURE IN WORKSPACE

```
Fibonacco Sales (Workspace)
└── CRM-CC-LC (Application Server - Laravel API)
    ├── learning-center-db (PostgreSQL Database)
    └── learning-center-redis (Redis Cache/Queue)
```

---

## ✅ CURRENT STATUS

- ✅ Workspace identified: Fibonacco Sales
- ✅ Email confirmed: admin@fae.city
- ✅ GitHub repo connected
- ⏳ Waiting for Railway authentication
- ⏳ Backend structure (can start now)

---

## 🚀 READY TO PROCEED

**Once authenticated:**
1. Connect to "Fibonacco Sales" workspace
2. Create project
3. Set up all services
4. Configure deployment

**Can start now (no auth needed):**
- Create Laravel backend structure
- Create Railway config files
- Convert database migrations

---

**Ready when you authenticate!** Run `railway login` when ready. 🚂

