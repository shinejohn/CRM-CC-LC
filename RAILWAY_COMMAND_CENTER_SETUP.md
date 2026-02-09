# 🚂 Command Center Railway Deployment Guide

This guide covers the deployment of the integrated **Command Center** ecosystem to Railway. This ecosystem provides a unified experience for:
- 🎓 Learning Center
- 🤝 CRM
- 🕹️ Command Center (Main Dashboard)
- 📣 Inbound/Outbound Campaigns
- 💬 Customer Interactions

---

## 📊 Recommended Service Architecture

Everything is deployed under the **Command Center** project as one integrated ecosystem.

1.  **Database** (PostgreSQL) - Persistent storage for the entire ecosystem.
2.  **Redis** (Redis) - Cache and queue backend for all functions.
3.  **API** (Laravel) - The core backend service handling all logic and business rules.
4.  **Worker** (Laravel Horizon) - Background job processor for campaigns, AI, and notifications.
5.  **Scheduler** (Laravel Scheduler) - Time-based task runner (CRITICAL for campaigns).
6.  **Frontend** (React) - The unified web interface for all functions.

---

## 🚀 Setup Steps

### Step 1: Link Project
Ensure you are logged in and linked to the correct project:
```bash
railway login
railway link c7bf01db-139a-49e8-95d5-b748e17744c0
```

### Step 2: Create Services
You'll need to create these services in the Railway dashboard if they don't exist:

| Service | Type | Root Directory | Start/Build Command |
| :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL | N/A | N/A |
| **Redis** | Redis | N/A | N/A |
| **API** | GitHub Repo | `backend/` | `php artisan serve --host=0.0.0.0 --port=$PORT` |
| **Worker** | GitHub Repo | `backend/` | `php artisan horizon` |
| **Scheduler** | GitHub Repo | `backend/` | `php artisan schedule:work` |
| **Frontend** | GitHub Repo | `./` | Build: `npm install && npm run build`<br>Start: `npx serve -s dist -l $PORT` |

### Step 3: Configure Environment
Run the unified deployment script to set all variables:
```bash
./scripts/deploy-command-center.sh
```

This script will:
- Auto-detect Database and Redis connection details.
- Prompt for necessary API keys (OpenRouter, ElevenLabs, etc.).
- Set appropriate environment variables for all services.
- Ensure the API URL is correctly propagated to the Frontend.

### Step 4: Run Migrations
After setting the variables:
```bash
railway run --service "API" "php artisan migrate --force"
```

---

## ✅ Post-Deployment Verification
1.  **Check API Health:** `https://your-api-url.up.railway.app/api/v1/search/status`
2.  **Monitor Workers:** Access Laravel Horizon dashboard at `https://your-api-url.up.railway.app/horizon`
3.  **Verify Frontend:** Ensure all routes (CRM, Learning, Campaigns) are accessible through the unified frontend.

---

**Everything is one ecosystem. No separate brands, just functional modules within one premium experience.** 🚀
