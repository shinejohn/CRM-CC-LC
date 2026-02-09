# Environment Variables Setup Guide

## Frontend Environment Variables

Create `.env.local` in the root directory:

```bash
# Frontend Environment Variables
# API Endpoint - Backend URL (Railway)
VITE_API_ENDPOINT=https://your-railway-backend.up.railway.app/api
VITE_API_URL=https://your-railway-backend.up.railway.app/api

# Development
NODE_ENV=development
```

**For Railway Frontend Deployment:**
Set these as environment variables in Railway dashboard for your frontend service.

---

## Backend Environment Variables

Create `.env` in the `backend/` directory:

```bash
# Laravel Backend Environment Variables

APP_NAME=LearningCenter
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-railway-backend.up.railway.app

# Database Configuration (Railway PostgreSQL)
# Railway provides these via environment variables:
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis Configuration (Railway Redis - Optional)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Queue Configuration
QUEUE_CONNECTION=redis
REDIS_QUEUE_CONNECTION=default

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@fibonacco.com
MAIL_FROM_NAME="${APP_NAME}"

# API Keys
OPENROUTER_API_KEY=your-openrouter-api-key
ELEVEN_LABS_API_KEY=your-elevenlabs-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# AI Gateway Configuration
AI_GATEWAY_URL=https://ai-gateway.fibonacco.com
AI_GATEWAY_TOKEN=your-ai-gateway-token

# AI Tools Configuration
AI_TOOLS_PLATFORM=fibonacco
AI_TOOLS_PROVIDER=openrouter
AI_TOOLS_LOGGING=true
AI_TOOLS_LOG_CHANNEL=stack

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug

# Horizon (Queue Monitoring)
HORIZON_PREFIX=horizon
```

---

## Railway Environment Variables Setup

### Step 1: Create PostgreSQL Service
1. In Railway dashboard, create a PostgreSQL service
2. Railway will automatically provide connection variables:
   - `${{Postgres.PGHOST}}`
   - `${{Postgres.PGPORT}}`
   - `${{Postgres.PGDATABASE}}`
   - `${{Postgres.PGUSER}}`
   - `${{Postgres.PGPASSWORD}}`

### Step 2: Create Redis Service (Optional)
1. In Railway dashboard, create a Redis service
2. Railway will automatically provide connection variables:
   - `${{Redis.REDIS_HOST}}`
   - `${{Redis.REDIS_PORT}}`
   - `${{Redis.REDIS_PASSWORD}}`

### Step 3: Set Environment Variables in Railway
Go to your backend service → Variables tab and add:

**Required:**
- `APP_NAME` = `LearningCenter`
- `APP_ENV` = `production`
- `APP_KEY` = (generate with `php artisan key:generate`)
- `APP_DEBUG` = `false`
- `APP_URL` = (your Railway backend URL)
- `DB_CONNECTION` = `pgsql`
- `DB_HOST` = `${{Postgres.PGHOST}}`
- `DB_PORT` = `${{Postgres.PGPORT}}`
- `DB_DATABASE` = `${{Postgres.PGDATABASE}}`
- `DB_USERNAME` = `${{Postgres.PGUSER}}`
- `DB_PASSWORD` = `${{Postgres.PGPASSWORD}}`

**API Keys:**
- `OPENROUTER_API_KEY` = (your key)
- `ELEVEN_LABS_API_KEY` = (your key)
- `ANTHROPIC_API_KEY` = (your key)

**Optional:**
- `REDIS_HOST` = `${{Redis.REDIS_HOST}}`
- `REDIS_PORT` = `${{Redis.REDIS_PORT}}`
- `REDIS_PASSWORD` = `${{Redis.REDIS_PASSWORD}}`
- `QUEUE_CONNECTION` = `redis`

---

## Generating APP_KEY

Run this command locally or in Railway shell:

```bash
php artisan key:generate
```

Copy the generated key and set it as `APP_KEY` in Railway environment variables.

---

## Frontend Environment Variables in Railway

For your frontend service (if deploying separately):

- `VITE_API_ENDPOINT` = `https://your-railway-backend.up.railway.app/api`
- `VITE_API_URL` = `https://your-railway-backend.up.railway.app/api`

---

## Verification

After setting up environment variables:

1. **Backend:** Check logs to ensure database connection works
2. **Frontend:** Check browser console for API connection
3. **Migrations:** Should run automatically on deploy (configured in `nixpacks.toml`)
