# ⚡ Railway Environment Variables - Quick Setup

## 🎯 Copy-Paste Ready (5 Minutes Setup)

---

## Step 1: Set Project Variables (Once)

**Go to:** Railway Dashboard → Your Project → Settings → Variables

**Click "New Variable" for each:**

```bash
APP_NAME=LearningCenter
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=${{Postgres CC CRM SMB.PGHOST}}
DB_PORT=${{Postgres CC CRM SMB.PGPORT}}
DB_DATABASE=${{Postgres CC CRM SMB.PGDATABASE}}
DB_USERNAME=${{Postgres CC CRM SMB.PGUSER}}
DB_PASSWORD=${{Postgres CC CRM SMB.PGPASSWORD}}
REDIS_HOST=${{Redis CC.REDIS_HOST}}
REDIS_PORT=${{Redis CC.REDIS_PORT}}
REDIS_PASSWORD=${{Redis CC.REDIS_PASSWORD}}
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default
REDIS_QUEUE=default
SESSION_DRIVER=redis
CACHE_DRIVER=redis
LOG_CHANNEL=stack
LOG_LEVEL=info
HORIZON_PREFIX=horizon
```

**Note:** Adjust service names (`Postgres CC CRM SMB`, `Redis CC`) to match your actual service names!

---

## Step 2: CC API Service Variables

**Go to:** CC API → Variables

**Add these:**

```bash
APP_URL=https://cc-api.up.railway.app
APP_KEY=<GENERATE THIS - see below>
OPENROUTER_API_KEY=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
ELEVEN_LABS_API_KEY=63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616
ANTHROPIC_API_KEY=your-anthropic-key-if-needed
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-token-if-needed
AI_TOOLS_PLATFORM=fibonacco
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_LOGGING=true
AI_TOOLS_LOG_CHANNEL=stack
```

**Generate APP_KEY:**
1. Go to CC API → Shell
2. Run: `php artisan key:generate --show`
3. Copy the key
4. Set it as `APP_KEY` variable

**Update APP_URL:** After first deployment, update with your actual Railway URL!

---

## Step 3: Frontend Service Variables

**Go to:** CC-CRM-LC-FOA Front → Variables

**Add these:**

```bash
VITE_API_ENDPOINT=https://cc-api.up.railway.app/api
VITE_API_URL=https://cc-api.up.railway.app/api
NODE_ENV=production
```

**Update VITE_API_ENDPOINT:** After CC API deploys, update with actual URL!

---

## Step 4: Queue & Scheduler Services

**No additional variables needed!**

They automatically inherit from Project Variables.

Just verify Project Variables are set correctly.

---

## ✅ Done!

**Total Time:** ~5 minutes  
**Variables Set:** Once, never again!

**After first deployment:**
1. Get CC API URL from Railway
2. Update `APP_URL` in CC API
3. Update `VITE_API_ENDPOINT` in Frontend
4. Redeploy

**That's it!** 🎉
