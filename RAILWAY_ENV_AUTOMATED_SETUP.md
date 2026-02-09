# 🤖 Automated Railway Environment Variables Setup

## 🎯 One-Command Setup

This script automatically sets **all environment variables** for **all services** using Railway CLI.

**No copy-paste errors. No manual configuration. Just run the script.**

---

## 🚀 Quick Start

### Prerequisites:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   railway link
   ```

### Run the Script:

```bash
./scripts/setup-railway-env.sh
```

**That's it!** The script will:
- ✅ Auto-detect PostgreSQL connection variables
- ✅ Auto-detect Redis connection variables
- ✅ Prompt for API keys
- ✅ Set all variables for all services automatically
- ✅ Generate APP_KEY automatically

---

## 📋 What the Script Does

### 1. Auto-Detects Database & Redis Variables
- Reads from your PostgreSQL service
- Reads from your Redis service
- No manual entry needed!

### 2. Prompts for API Keys
- OpenRouter API Key
- ElevenLabs API Key
- Anthropic API Key (optional)
- AI Gateway Token (optional)

### 3. Sets Variables for Each Service

**CC API Service:**
- App configuration (APP_NAME, APP_ENV, etc.)
- Database connection (all PostgreSQL vars)
- Redis connection (all Redis vars)
- Queue configuration
- Session & cache drivers
- Logging configuration
- API keys
- AI Gateway configuration
- Generates APP_KEY automatically

**Queue Worker Service:**
- Same as API (except API keys)
- All database/Redis/queue vars

**Scheduler Service:**
- Same as API (except API keys)
- All database/Redis/queue vars

**Frontend Service:**
- VITE_API_ENDPOINT
- VITE_API_URL
- NODE_ENV

---

## 🔧 Customizing Service Names

If your Railway service names are different, edit the script:

```bash
# Edit scripts/setup-railway-env.sh
# Update these lines:

POSTGRES_SERVICE="Postgres CC CRM SMB"  # Your PostgreSQL service name
REDIS_SERVICE="Redis CC"                 # Your Redis service name
API_SERVICE="CC API"                     # Your API service name
QUEUE_SERVICE="CRM-CC-LC Queues"        # Your Queue service name
SCHEDULER_SERVICE="CC-CRM-LC Scheduler" # Your Scheduler service name
FRONTEND_SERVICE="CC-CRM-LC-FOA Front"  # Your Frontend service name
```

---

## 📊 Script Output

The script shows progress for each variable:

```
🚀 Setting CC API Service Variables...
--------------------------------------
  Setting APP_NAME for CC API... ✅
  Setting APP_ENV for CC API... ✅
  Setting DB_HOST for CC API... ✅
  ...
✅ CC API Service configured

⚙️  Setting Queue Worker Service Variables...
---------------------------------------------
  Setting APP_NAME for CRM-CC-LC Queues... ✅
  ...
✅ Queue Worker Service configured
```

---

## ⚠️ Important Notes

### 1. APP_KEY Generation
The script tries to generate `APP_KEY` automatically. If it fails:
```bash
# Run manually:
railway run --service "CC API" "php artisan key:generate --show"
railway variables set "APP_KEY=<generated-key>" --service "CC API"
```

### 2. Update URLs After Deployment
After first deployment, update these with actual Railway URLs:
- `APP_URL` in CC API service
- `VITE_API_ENDPOINT` in Frontend service
- `VITE_API_URL` in Frontend service

### 3. Verify Service Names
Make sure service names in the script match your Railway service names exactly!

---

## 🔍 Troubleshooting

### "Railway CLI not found"
```bash
npm install -g @railway/cli
```

### "Not logged into Railway"
```bash
railway login
```

### "Service not found"
- Check service names in Railway dashboard
- Update service names in script
- Service names are case-sensitive!

### "Could not auto-detect PostgreSQL variables"
- Script will prompt you to enter manually
- Or check Railway dashboard → PostgreSQL service → Variables

### "Could not generate APP_KEY"
- Run manually: `railway run --service "CC API" "php artisan key:generate --show"`
- Set manually: `railway variables set "APP_KEY=<key>" --service "CC API"`

---

## ✅ Verification

After running the script:

1. **Check Railway Dashboard:**
   - Go to each service → Variables
   - Verify all variables are set

2. **Verify Database Connection:**
   - Check CC API logs after deployment
   - Should see successful database connection

3. **Verify Redis Connection:**
   - Check CC API logs
   - Should see successful Redis connection

---

## 🎯 Benefits

✅ **No Copy-Paste Errors** - Script sets everything exactly  
✅ **No Manual Configuration** - Fully automated  
✅ **Consistent** - Same variables across all services  
✅ **Fast** - Sets all variables in seconds  
✅ **Reliable** - Uses Railway CLI directly  

---

## 📝 Example Run

```bash
$ ./scripts/setup-railway-env.sh

🚀 Railway Environment Variables Setup
======================================

✅ Railway CLI found and authenticated

📦 Getting PostgreSQL connection variables...
🔴 Getting Redis connection variables...

🔑 API Keys Configuration
-------------------------
OpenRouter API Key: sk-or-v1-...
ElevenLabs API Key: 63b120...
Anthropic API Key (optional): 
AI Gateway Token (optional): 
CC API Railway URL: https://cc-api.up.railway.app

⚙️  Setting environment variables...

🚀 Setting CC API Service Variables...
--------------------------------------
  Setting APP_NAME for CC API... ✅
  Setting APP_ENV for CC API... ✅
  ...
✅ CC API Service configured

⚙️  Setting Queue Worker Service Variables...
---------------------------------------------
  Setting APP_NAME for CRM-CC-LC Queues... ✅
  ...
✅ Queue Worker Service configured

⏰ Setting Scheduler Service Variables...
------------------------------------------
  Setting APP_NAME for CC-CRM-LC Scheduler... ✅
  ...
✅ Scheduler Service configured

🎨 Setting Frontend Service Variables...
---------------------------------------
  Setting VITE_API_ENDPOINT for CC-CRM-LC-FOA Front... ✅
  ...
✅ Frontend Service configured

========================================
✅ Environment Variables Setup Complete!
========================================
```

---

**Run the script once, and you're done!** 🎉
