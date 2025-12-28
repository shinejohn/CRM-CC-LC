# 🗄️ Railway Database Configuration

**Connection Details Provided:**
- **Host:** `trolley.proxy.rlwy.net`
- **Port:** `53826`

---

## 📋 COMPLETE DATABASE CONNECTION

To complete the database setup, you need:

1. **Database Name** - Typically `railway` (default)
2. **Username** - Typically `postgres` (default)
3. **Password** - Get from Railway dashboard

---

## 🔐 GET FULL DATABASE URL

### Option 1: Railway Dashboard (Recommended)

1. Go to Railway Dashboard: https://railway.app
2. Select workspace: **Fibonacco Sales**
3. Select PostgreSQL service
4. Go to **Variables** tab
5. Copy `DATABASE_URL` value

It will look like:
```
postgresql://postgres:password@trolley.proxy.rlwy.net:53826/railway
```

### Option 2: Railway CLI

```bash
railway login
railway link
railway variables get DATABASE_URL
```

---

## ✅ CONFIGURE .env FILE

### Method 1: Using DATABASE_URL (Recommended)

Add to `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@trolley.proxy.rlwy.net:53826/railway
```

Laravel will automatically parse this and set:
- DB_HOST
- DB_PORT
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD

### Method 2: Individual Variables

Add to `backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=trolley.proxy.rlwy.net
DB_PORT=53826
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=<your-password-from-railway>
```

---

## 🚀 QUICK SETUP

I've created a script to help configure the connection:

```bash
cd backend
./scripts/configure-railway-db.sh
```

This will:
- ✅ Set DB_HOST to `trolley.proxy.rlwy.net`
- ✅ Set DB_PORT to `53826`
- ✅ Set DB_DATABASE to `railway`
- ✅ Set DB_USERNAME to `postgres`
- ⏳ You'll need to add DB_PASSWORD manually

---

## 🧪 TEST CONNECTION

After configuring:

```bash
cd backend
php artisan db:show
```

If connection works, you'll see database information.

---

## 📝 NEXT STEPS

1. **Get DATABASE_URL or password from Railway dashboard**
2. **Update backend/.env with credentials**
3. **Test connection:** `php artisan db:show`
4. **Run migrations:** `php artisan migrate`

---

**Database host configured! Just need password from Railway.** 🔐






