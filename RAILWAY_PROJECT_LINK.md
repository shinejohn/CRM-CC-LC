# 🔗 Linking to Railway Command Center Project

## Project Information

**Project Name:** Command Center  
**Project ID:** `c7bf01db-139a-49e8-95d5-b748e17744c0`  
**Token:** `de5e4693-2ff6-41f8-abd8-6bc7d3d33c58`

---

## 🔗 Link to Project

### Option 1: Interactive Link (Recommended)

Run this in your terminal:

```bash
railway link
```

Then:
1. Select your workspace
2. Select "Command Center" project
3. Select environment (production)

### Option 2: Use Project ID

The Railway CLI doesn't support direct project ID linking. You need to use the interactive `railway link` command.

---

## ✅ After Linking

Once linked, you can:

### Check Status:
```bash
railway status
```

### List Services:
```bash
railway service
```

### Set Variables:
```bash
railway variables --set "KEY=VALUE" --service "service-name"
```

### Run Commands:
```bash
railway run --service "service-name" "command"
```

---

## 🚀 Next Steps

1. **Link the project** (run `railway link` interactively)
2. **Create services** in Railway dashboard:
   - PostgreSQL database
   - Redis cache
   - API backend
   - Queue worker
   - Scheduler
   - Frontend
3. **Set environment variables** (run `./scripts/deploy-all-railway.sh`)
4. **Run migrations** (`railway run --service "api-backend" "php artisan migrate --force"`)

---

**Run `railway link` in your terminal to connect!** 🔗
