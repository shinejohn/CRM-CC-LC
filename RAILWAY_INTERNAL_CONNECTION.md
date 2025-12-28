# 🗄️ Railway Internal Database Connection

**Internal Hostname:** postgres.railway.internal  
**External Host:** trolley.proxy.rlwy.net:53826

---

## 📋 UNDERSTANDING RAILWAY CONNECTIONS

Railway provides two ways to connect to PostgreSQL:

1. **Internal Connection** (`postgres.railway.internal`)
   - Used when services are in the same Railway project
   - Faster, no network egress
   - Recommended for service-to-service communication

2. **External Connection** (`trolley.proxy.rlwy.net:53826`)
   - Used for external tools (local development, pgAdmin, etc.)
   - Publicly accessible via proxy

---

## 🔧 CONNECTION CONFIGURATION

### For Railway Services (Internal - Recommended)

When connecting from CRM-CC-LC service to PostgreSQL service within Railway:

**Connection String Format:**
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

Railway automatically provides:
- `DATABASE_URL` environment variable
- Internal networking between services

### For External Tools (External)

When connecting from your local machine or external tools:

**Connection String:**
```
postgresql://postgres:password@trolley.proxy.rlwy.net:53826/railway
```

---

## ✅ RAILWAY AUTO-CONFIGURATION

When you add PostgreSQL service to a Railway project:

1. **Railway automatically:**
   - Sets `DATABASE_URL` environment variable in connected services
   - Uses internal hostname (`postgres.railway.internal`) for service connections
   - Provides external proxy for external access

2. **No manual configuration needed** for service-to-service connections!

---

## 🚀 USING THE DATABASE

### From Railway Service (Laravel API)

Railway automatically provides `DATABASE_URL` that uses internal hostname.

**In Laravel `.env`:**
```env
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
```

**Laravel will automatically parse this** and configure:
- DB_HOST
- DB_PORT
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD

### From Local Machine (Development)

Use external connection:
```bash
# Get DATABASE_URL from Railway dashboard
railway variables get DATABASE_URL

# Or construct manually with external host
psql "postgresql://user:pass@trolley.proxy.rlwy.net:53826/railway"
```

---

## 📝 SETUP CHECKLIST

### For Railway Services
- [x] PostgreSQL service added to project
- [x] `DATABASE_URL` automatically set (uses internal hostname)
- [ ] Run database migrations
- [ ] Verify connection from CRM-CC-LC service

### For Local Development
- [ ] Get `DATABASE_URL` from Railway dashboard
- [ ] Use external hostname for local connections
- [ ] Configure local `.env` file

---

## 🔐 ENVIRONMENT VARIABLES

Railway automatically sets in CRM-CC-LC service:
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
```

**This uses the internal hostname automatically!**

---

## ✅ NEXT STEPS

1. **Verify DATABASE_URL is set:**
   ```bash
   railway variables get DATABASE_URL
   ```

2. **Run migrations:**
   - Railway service can connect automatically
   - Use `DATABASE_URL` environment variable

3. **Test connection:**
   - From Railway service: Automatic via `DATABASE_URL`
   - From local: Use external hostname

---

**Internal connection configured! Railway handles this automatically.** 🚂






