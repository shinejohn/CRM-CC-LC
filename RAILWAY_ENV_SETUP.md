# 🔐 Railway Environment Variables - Complete Setup

## 🎯 Copy-Paste Ready Configuration

This document provides **exact environment variables** to set in Railway for each service.

---

## 📋 Service-by-Service Configuration

### 🔴 Step 1: Set Shared Variables (Do This First!)

These variables are used by **ALL backend services** (API, Queue, Scheduler).

**In Railway Dashboard:**
1. Go to your **Project Settings** → **Variables**
2. Add these **Project Variables** (shared across all services):

```bash
# ============================================
# SHARED PROJECT VARIABLES
# Set these ONCE at project level
# ============================================

# App Configuration
APP_NAME=LearningCenter
APP_ENV=production
APP_DEBUG=false

# Database Connection (Railway auto-generates these)
# Use Railway's variable references:
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis Connection (Railway auto-generates these)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Queue Configuration
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default
REDIS_QUEUE=default

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info

# Horizon
HORIZON_PREFIX=horizon
```

**Note:** Replace `Postgres` and `Redis` with your actual service names if different!

---

### 🚀 Step 2: CC API Service Variables

**Service:** CC API  
**Go to:** CC API → Variables

**Add these SERVICE-SPECIFIC variables:**

```bash
# ============================================
# CC API SERVICE VARIABLES
# ============================================

# App URL (Get this AFTER deploying - Railway provides it)
APP_URL=https://cc-api.up.railway.app

# App Key (Generate this - see instructions below)
APP_KEY=

# API Keys (Set your actual keys)
OPENROUTER_API_KEY=your-openrouter-key-here
ELEVEN_LABS_API_KEY=your-elevenlabs-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# AI Gateway
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-ai-gateway-token

# AI Tools
AI_TOOLS_PLATFORM=fibonacco
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_LOGGING=true
AI_TOOLS_LOG_CHANNEL=stack
```

**After setting APP_URL, update it with your actual Railway URL!**

---

### ⚙️ Step 3: CRM-CC-LC Queues Service Variables

**Service:** CRM-CC-LC Queues  
**Go to:** CRM-CC-LC Queues → Variables

**These inherit from Project Variables, but add:**

```bash
# ============================================
# QUEUE WORKER SERVICE VARIABLES
# ============================================

# No additional variables needed!
# Inherits all from Project Variables
```

**Just verify Project Variables are set!**

---

### ⏰ Step 4: CC-CRM-LC Scheduler Service Variables

**Service:** CC-CRM-LC Scheduler  
**Go to:** CC-CRM-LC Scheduler → Variables

**These inherit from Project Variables, but add:**

```bash
# ============================================
# SCHEDULER SERVICE VARIABLES
# ============================================

# No additional variables needed!
# Inherits all from Project Variables
```

**Just verify Project Variables are set!**

---

### 🎨 Step 5: CC-CRM-LC-FOA Front Service Variables

**Service:** CC-CRM-LC-FOA Front  
**Go to:** CC-CRM-LC-FOA Front → Variables

**Add these FRONTEND variables:**

```bash
# ============================================
# FRONTEND SERVICE VARIABLES
# ============================================

# API Endpoint (Update with your CC API URL after deployment)
VITE_API_ENDPOINT=https://cc-api.up.railway.app/api
VITE_API_URL=https://cc-api.up.railway.app/api

# Node Environment
NODE_ENV=production
```

**Important:** Update `VITE_API_ENDPOINT` with your actual CC API Railway URL!

---

## 🔑 Step 6: Generate APP_KEY

**You need to generate `APP_KEY` for CC API service:**

### Option A: Generate Locally
```bash
cd backend
php artisan key:generate --show
```
Copy the generated key and set it as `APP_KEY` in Railway.

### Option B: Generate in Railway
1. Go to CC API service
2. Click "Shell" tab
3. Run: `php artisan key:generate --show`
4. Copy the key
5. Go to Variables tab
6. Set `APP_KEY` = (the generated key)

---

## 📋 Complete Variable Reference

### Project Variables (Set Once):

```bash
APP_NAME=LearningCenter
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default
REDIS_QUEUE=default
SESSION_DRIVER=redis
CACHE_DRIVER=redis
LOG_CHANNEL=stack
LOG_LEVEL=info
HORIZON_PREFIX=horizon
```

### CC API Service Variables:

```bash
APP_URL=https://cc-api.up.railway.app
APP_KEY=<generate-this>
OPENROUTER_API_KEY=<your-key>
ELEVEN_LABS_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=<your-token>
AI_TOOLS_PLATFORM=fibonacco
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_LOGGING=true
AI_TOOLS_LOG_CHANNEL=stack
```

### Frontend Service Variables:

```bash
VITE_API_ENDPOINT=https://cc-api.up.railway.app/api
VITE_API_URL=https://cc-api.up.railway.app/api
NODE_ENV=production
```

---

## 🚀 Quick Setup Script

### Step-by-Step:

1. **Set Project Variables** (once):
   - Go to Project Settings → Variables
   - Copy all "Project Variables" from above
   - Paste and save

2. **Set CC API Variables**:
   - Go to CC API → Variables
   - Copy "CC API Service Variables" from above
   - Replace `<your-key>` placeholders
   - Generate `APP_KEY` (see Step 6)
   - Update `APP_URL` after first deployment

3. **Set Frontend Variables**:
   - Go to CC-CRM-LC-FOA Front → Variables
   - Copy "Frontend Service Variables" from above
   - Update `VITE_API_ENDPOINT` with your CC API URL

4. **Queue & Scheduler**:
   - No additional variables needed!
   - They inherit from Project Variables

---

## ✅ Verification Checklist

After setting variables:

- [ ] Project Variables set (shared)
- [ ] CC API `APP_KEY` generated and set
- [ ] CC API `APP_URL` set (update after deploy)
- [ ] CC API API keys set (OPENROUTER, ELEVEN_LABS, etc.)
- [ ] Frontend `VITE_API_ENDPOINT` set (update after deploy)
- [ ] Database variables reference correct service (`${{Postgres.*}}`)
- [ ] Redis variables reference correct service (`${{Redis.*}}`)

---

## 🔍 Finding Your Service Names

If your PostgreSQL/Redis services have different names:

1. Go to PostgreSQL service
2. Check the service name (e.g., "Postgres CC CRM SMB")
3. Use that name in variables: `${{Postgres CC CRM SMB.PGHOST}}`

**Railway Variable Reference Format:**
```
${{ServiceName.VariableName}}
```

**Examples:**
- `${{Postgres CC CRM SMB.PGHOST}}`
- `${{Redis CC.REDIS_HOST}}`

---

## 📝 Notes

1. **Project Variables** are shared across all services - set once!
2. **Service Variables** override project variables
3. **Railway Variables** (`${{Service.*}}`) are auto-generated
4. **APP_KEY** must be generated (don't use a placeholder)
5. **APP_URL** and **VITE_API_ENDPOINT** need your actual Railway URLs

---

## 🎯 After First Deployment

1. Get your CC API URL from Railway
2. Update `APP_URL` in CC API service
3. Update `VITE_API_ENDPOINT` in Frontend service
4. Redeploy services

**That's it!** All variables properly configured! 🎉
