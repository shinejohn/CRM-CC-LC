# 🔐 Railway Environment Variables Reference

**Service:** CRM-CC-LC (Application Server)  
**Location:** Railway Dashboard → CRM-CC-LC → Variables

---

## 📋 COMPLETE ENVIRONMENT VARIABLES LIST

### Application Settings (Required)

| Variable | Value | Description |
|----------|-------|-------------|
| `APP_NAME` | `Fibonacco Learning Center` | Application name |
| `APP_ENV` | `production` | Environment (production/staging/local) |
| `APP_KEY` | `(generated)` | Laravel application key (generate with `php artisan key:generate`) |
| `APP_URL` | `https://your-app.up.railway.app` | Application URL (Railway provides) |
| `APP_DEBUG` | `false` | Debug mode (false for production) |

### Database (Auto-provided by Railway)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `(auto-set)` | PostgreSQL connection string (Railway auto-provides) |

**Note:** Railway automatically sets `DATABASE_URL` when PostgreSQL service is added. No manual setup needed.

### Redis (If using Redis service)

| Variable | Value | Description |
|----------|-------|-------------|
| `REDIS_URL` | `(auto-set)` | Redis connection string (Railway auto-provides) |
| `REDIS_HOST` | `(auto-set)` | Redis host |
| `REDIS_PASSWORD` | `(auto-set)` | Redis password |
| `REDIS_PORT` | `6379` | Redis port |

**Note:** Railway automatically sets Redis variables when Redis service is added.

### Queue Configuration

| Variable | Value | Description |
|----------|-------|-------------|
| `QUEUE_CONNECTION` | `redis` | Queue driver (redis/database/sync) |

---

## 🔑 EXTERNAL API KEYS

### ElevenLabs (Text-to-Speech)

| Variable | Value | Notes |
|----------|-------|-------|
| `ELEVENLABS_API_KEY` | `63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616` | Provided key |

### OpenRouter (AI Conversations)

| Variable | Value | Notes |
|----------|-------|-------|
| `OPENROUTER_API_KEY` | `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` | Provided key |

### OpenAI (Embeddings)

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `(your-key)` | Your OpenAI API key for embeddings |

---

## ☁️ CLOUDFLARE R2 (File Storage)

| Variable | Value | Description |
|----------|-------|-------------|
| `CLOUDFLARE_R2_ENDPOINT` | `(your-endpoint)` | R2 endpoint URL |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | `(your-key)` | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | `(your-secret)` | R2 secret key |
| `CLOUDFLARE_R2_BUCKET` | `fibonacco-assets` | R2 bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` | `https://assets.fibonacco.com` | Public CDN URL |

**Get these from:** Cloudflare Dashboard → R2 → Manage R2 API Tokens

---

## 📧 EMAIL (AWS SES - Optional)

| Variable | Value | Description |
|----------|-------|-------------|
| `MAIL_MAILER` | `ses` | Mail driver |
| `MAIL_FROM_ADDRESS` | `noreply@fibonacco.com` | From email address |
| `MAIL_FROM_NAME` | `Fibonacco Learning Center` | From name |
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | `(your-key)` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | `(your-secret)` | AWS secret key |

---

## 🔧 LARAVEL CONFIGURATION

| Variable | Value | Description |
|----------|-------|-------------|
| `LOG_CHANNEL` | `stack` | Logging channel |
| `LOG_LEVEL` | `info` | Log level (debug/info/warning/error) |
| `CACHE_DRIVER` | `redis` | Cache driver |
| `SESSION_DRIVER` | `redis` | Session driver |
| `SESSION_LIFETIME` | `120` | Session lifetime in minutes |

---

## 📝 SETTING VARIABLES IN RAILWAY

### Method 1: Railway Dashboard (Recommended)

1. Go to Railway Dashboard
2. Select "Fibonacco Sales" workspace
3. Select "CRM-CC-LC" service
4. Click "Variables" tab
5. Click "New Variable"
6. Add each variable with its value
7. Click "Add"

### Method 2: Railway CLI

```bash
# Link to project
railway link

# Set variable
railway variables set APP_NAME="Fibonacco Learning Center"

# Set multiple variables
railway variables set ELEVENLABS_API_KEY="your-key" \
                     OPENROUTER_API_KEY="your-key" \
                     OPENAI_API_KEY="your-key"
```

### Method 3: Bulk Import (Via Dashboard)

Railway dashboard allows importing variables from a file format.

---

## ✅ REQUIRED VS OPTIONAL

### Required Variables (Must Set)

- `APP_NAME`
- `APP_ENV`
- `APP_KEY` (generate first)
- `APP_URL` (Railway may auto-set)
- `DATABASE_URL` (Railway auto-sets from PostgreSQL service)
- `ELEVENLABS_API_KEY`
- `OPENROUTER_API_KEY`

### Recommended Variables

- `QUEUE_CONNECTION=redis`
- `REDIS_URL` (if using Redis)
- `OPENAI_API_KEY` (for embeddings)
- `CLOUDFLARE_R2_*` (for file storage)

### Optional Variables

- Email configuration (if sending emails)
- Additional logging configuration
- Custom cache settings

---

## 🔒 SECURITY NOTES

1. **Never commit** environment variables to Git
2. **Use Railway Variables** for all sensitive data
3. **Rotate keys** periodically
4. **Use different keys** for staging/production
5. **Limit access** to Railway dashboard

---

## 🚀 QUICK SETUP SCRIPT

After creating PostgreSQL service, set these essential variables:

```bash
# Application
APP_NAME="Fibonacco Learning Center"
APP_ENV="production"
APP_KEY="$(php artisan key:generate --show)"  # Generate first

# API Keys (provided)
ELEVENLABS_API_KEY="63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616"
OPENROUTER_API_KEY="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"

# Queue
QUEUE_CONNECTION="redis"

# DATABASE_URL is auto-set by Railway
# REDIS_URL is auto-set if Redis service added
```

---

**All variables documented and ready to configure!** 🔐

