# 🚀 Set Railway Variables - Quick Guide

## ✅ Project is Linked!

Your Railway project is linked: **CRM-CC-LC-Project**

---

## 📋 What You Need

To set variables, you need:

1. **PostgreSQL Connection Info** (from Railway Dashboard):
   - Go to **Postgres CC CRM SMB** → **Variables** tab
   - Copy: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

2. **Redis Connection Info** (from Railway Dashboard):
   - Go to **Redis CC** → **Variables** tab  
   - Copy: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (if set)

3. **API Keys:**
   - OpenRouter API Key
   - ElevenLabs API Key

4. **API URL:**
   - Will be: `https://cc-api.up.railway.app` (or your actual URL)

---

## 🚀 Quick Setup

### Option 1: Run Interactive Script

```bash
./scripts/set-railway-vars-direct.sh
```

This will prompt for all values and set them automatically.

### Option 2: Use Generated Script

1. **Get your connection values** from Railway Dashboard
2. **Edit** `railway-set-vars.sh` 
3. **Fill in** the empty values (PGHOST, PGDATABASE, etc.)
4. **Run:** `./railway-set-vars.sh`

### Option 3: Set Variables Manually via Railway Dashboard

Go to each service → Variables tab → Add variables one by one.

See `RAILWAY_ENV_SETUP.md` for complete variable list.

---

## 🎯 Fastest Method

**Run this in your terminal:**

```bash
./scripts/set-railway-vars-direct.sh
```

It will prompt you for:
- PostgreSQL connection (get from Railway Dashboard → Postgres service)
- Redis connection (get from Railway Dashboard → Redis service)
- API keys
- API URL

Then it sets **all variables for all services automatically**! ✅

---

**Ready to set variables?** Run the script above! 🚀
