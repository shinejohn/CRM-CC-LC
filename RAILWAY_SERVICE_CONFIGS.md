# 🚂 Command Center Service Configurations

Use these **exact settings** in the Railway dashboard for each service to ensure the unified ecosystem functions correctly.

---

## 🚀 API (Core Backend)

**Settings → Deploy:**
- **Root Directory:** `backend/`
- **Build Command:** (leave empty - handled by nixpacks.toml)
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`

**Purpose:**
- Serves the integrated API for CRM, Learning Center, and Command Center.
- Handles all business logic and AI processing.

---

## ⚙️ Worker (Queue Processor)

**Settings → Deploy:**
- **Root Directory:** `backend/`
- **Build Command:** (leave empty - handled by nixpacks.toml)
- **Start Command:** `php artisan horizon`

**Purpose:**
- Processes background tasks for all modules: campaigns, AI, alerts, and provisioning.

---

## ⏰ Scheduler (Task Runner)

**Settings → Deploy:**
- **Root Directory:** `backend/`
- **Build Command:** (leave empty - handled by nixpacks.toml)
- **Start Command:** `php artisan schedule:work`

**Purpose:**
- Essential for time-sensitive tasks like campaign sends and recurring reports.

---

## 🎨 Frontend (Unified UI)

**Settings → Deploy:**
- **Root Directory:** `./` (project root)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`
- **Output Directory:** `dist/`

**Purpose:**
- Single unified interface for all functional modules (Learning Center, CRM, CC).

---

## 🗄️ Database & Redis

**PostgreSQL:**
- **Name:** `Database`
- **Storage:** Enable automatic backups.

**Redis:**
- **Name:** `Redis`
- **Memory:** 256MB+ recommended for Horizon.

---

## ⚠️ Common Deployment Tips

1.  **Shared Variables:** The API, Worker, and Scheduler MUST share the same Database and Redis connection details.
2.  **Frontend URL:** Ensure `VITE_API_ENDPOINT` and `VITE_API_URL` point to the deployed API service.
3.  **App Key:** All backend services must share the same `APP_KEY`.
4.  **Health Checks:** Use `/` or `/api/health` for the API service health check.

---

**This configuration ensures one seamless customer experience across all modules.** 🚀
