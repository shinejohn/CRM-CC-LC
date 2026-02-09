# 🚂 Railway Services Explained

## 🎯 Quick Answer

**YES!** Scheduler and Queue Worker are just **plain Railway services** - exactly like creating a frontend service.

The **only difference** is the **start command** - everything else is the same!

---

## 📊 Service Comparison

### All Services Use:
- ✅ Same repository
- ✅ Same build process (nixpacks.toml)
- ✅ Same environment variables (mostly)
- ✅ Same codebase location

### Only Difference:
- ⚙️ **Start command** (what runs when service starts)

---

## 🏗️ How to Create Each Service

### 1. API Backend Service

**Create Service:**
- Click "New" → "GitHub Repo"
- Select your repository
- Name: `api-backend`

**Configuration:**
- Root Directory: `backend/`
- Build: Auto-detected (nixpacks.toml)
- **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`

**That's it!** Railway auto-detects everything else.

---

### 2. Queue Worker Service

**Create Service:**
- Click "New" → "GitHub Repo"
- Select **same repository**
- Name: `queue-worker`

**Configuration:**
- Root Directory: `backend/` (same as API)
- Build: Auto-detected (same nixpacks.toml)
- **Start Command:** `php artisan queue:work redis --sleep=3 --tries=3`

**That's it!** Only difference is the start command.

---

### 3. Scheduler Service

**Create Service:**
- Click "New" → "GitHub Repo"
- Select **same repository**
- Name: `scheduler`

**Configuration:**
- Root Directory: `backend/` (same as API)
- Build: Auto-detected (same nixpacks.toml)
- **Start Command:** `php artisan schedule:work`

**That's it!** Only difference is the start command.

---

### 4. Frontend Service

**Create Service:**
- Click "New" → "GitHub Repo"
- Select **same repository**
- Name: `frontend`

**Configuration:**
- Root Directory: `./` (root, not backend/)
- Build Command: `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

**That's it!** Different root directory and start command.

---

## 🔍 Visual Comparison

### API Backend:
```
Repository: your-repo
├── Root: backend/
├── Build: nixpacks.toml (auto)
└── Start: php artisan serve
```

### Queue Worker:
```
Repository: your-repo (SAME!)
├── Root: backend/ (SAME!)
├── Build: nixpacks.toml (SAME!)
└── Start: php artisan queue:work ← DIFFERENT!
```

### Scheduler:
```
Repository: your-repo (SAME!)
├── Root: backend/ (SAME!)
├── Build: nixpacks.toml (SAME!)
└── Start: php artisan schedule:work ← DIFFERENT!
```

### Frontend:
```
Repository: your-repo (SAME!)
├── Root: ./ ← DIFFERENT!
├── Build: npm install && npm run build ← DIFFERENT!
└── Start: npx serve -s dist ← DIFFERENT!
```

---

## ✅ Step-by-Step: Creating Queue Worker

### In Railway Dashboard:

1. **Click "New"** button
2. **Select "GitHub Repo"**
3. **Choose your repository** (same one as API backend)
4. **Name it:** `queue-worker`
5. **Set Root Directory:** `backend/`
6. **Click "Settings"** → **"Deploy"**
7. **Override Start Command:** 
   ```
   php artisan queue:work redis --sleep=3 --tries=3
   ```
8. **Copy Environment Variables** from API backend service
9. **Deploy**

**That's it!** It's just a regular service with a different start command.

---

## ✅ Step-by-Step: Creating Scheduler

### In Railway Dashboard:

1. **Click "New"** button
2. **Select "GitHub Repo"**
3. **Choose your repository** (same one as API backend)
4. **Name it:** `scheduler`
5. **Set Root Directory:** `backend/`
6. **Click "Settings"** → **"Deploy"**
7. **Override Start Command:** 
   ```
   php artisan schedule:work
   ```
8. **Copy Environment Variables** from API backend service
9. **Deploy**

**That's it!** Same process as queue worker.

---

## 🎯 Key Insight

**All backend services (API, Queue, Scheduler) are IDENTICAL except for start command:**

| Service | Root | Build | Start Command |
|---------|------|-------|---------------|
| **API Backend** | `backend/` | nixpacks.toml | `php artisan serve` |
| **Queue Worker** | `backend/` | nixpacks.toml | `php artisan queue:work` |
| **Scheduler** | `backend/` | nixpacks.toml | `php artisan schedule:work` |

**They're all the same Laravel application** - just running different commands!

---

## 🔄 What Happens When Each Starts

### API Backend:
```
1. Railway builds backend/ (nixpacks.toml)
2. Runs: php artisan serve
3. Laravel starts HTTP server
4. Listens on $PORT
5. Serves API endpoints + Horizon dashboard
```

### Queue Worker:
```
1. Railway builds backend/ (SAME build!)
2. Runs: php artisan queue:work redis
3. Laravel connects to Redis
4. Starts processing jobs from queue
5. Runs continuously, processing jobs
```

### Scheduler:
```
1. Railway builds backend/ (SAME build!)
2. Runs: php artisan schedule:work
3. Laravel checks scheduled tasks
4. Runs every minute automatically
5. Dispatches jobs to queue when due
```

---

## 💡 Why This Works

**Laravel is designed for this!**

- ✅ Same codebase
- ✅ Same configuration
- ✅ Different commands for different purposes
- ✅ All share same database, Redis, etc.

**Railway just runs different commands** - that's the magic!

---

## 📋 Railway Service Creation Checklist

### For Each Service:

- [ ] Click "New" → "GitHub Repo"
- [ ] Select repository
- [ ] Name the service
- [ ] Set root directory
- [ ] (Optional) Override build command
- [ ] **Override start command** ← This is the key!
- [ ] Set environment variables
- [ ] Deploy

**The start command is what makes each service different!**

---

## 🎯 Summary

**Question:** Are scheduler and queue worker just plain services like frontend?

**Answer:** ✅ **YES!**

**They're all regular Railway services:**
- ✅ Same creation process
- ✅ Same repository
- ✅ Same build process (for backend services)
- ✅ **Only difference:** Start command

**Creating them is exactly like creating the frontend** - just specify a different start command!

---

## 🚀 Quick Reference

### API Backend:
```
Start: php artisan serve --host=0.0.0.0 --port=$PORT
```

### Queue Worker:
```
Start: php artisan queue:work redis --sleep=3 --tries=3
```

### Scheduler:
```
Start: php artisan schedule:work
```

### Frontend:
```
Start: npx serve -s dist -l $PORT
```

**That's literally the only difference!** 🎉
