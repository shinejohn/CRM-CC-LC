# Publishing APIs Service

## Service Identification

**Service Name:** Publishing APIs  
**Type:** Laravel Backend API (with SSR frontend)

---

## Current Status

### ✅ Build: SUCCESS
- Client bundle built successfully
- SSR bundle built successfully
- Docker image created

### ❌ Healthcheck: FAILING
- Healthcheck path: `/Health`
- Status: Service unavailable
- Issue: Service not responding to healthchecks

---

## Service Configuration Needed

### Railway Dashboard Settings:

**Root Directory:** `backend/` (or root if monorepo)

**Start Command:** 
- If Laravel API: `php artisan serve --host=0.0.0.0 --port=$PORT`
- If SSR: `node bootstrap/ssr/ssr.js` (or similar)

**Healthcheck Path:**
- Current: `/Health` (failing)
- Try: `/health` (lowercase)
- Or: `/` (root)
- Or: `/api/health` (if API endpoint exists)

---

## Environment Variables Needed

Waiting for environment variables to be provided. Likely needs:

### Database:
- `DB_CONNECTION=pgsql`
- `DB_HOST=...`
- `DB_PORT=5432`
- `DB_DATABASE=...`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### Redis:
- `REDIS_HOST=...`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD=...`

### Laravel:
- `APP_NAME=Publishing API`
- `APP_ENV=production`
- `APP_KEY=...` (generate)
- `APP_URL=...`
- `APP_DEBUG=false`

### Queue/Horizon:
- `QUEUE_CONNECTION=redis`
- `HORIZON_PREFIX=horizon`

### API Keys:
- `OPENROUTER_API_KEY=...`
- `ELEVEN_LABS_API_KEY=...`
- `ANTHROPIC_API_KEY=...`

---

## Healthcheck Fix

The healthcheck is failing because the service isn't responding. Check:

1. **Start Command** - Is it correct?
2. **Port** - Is service listening on `$PORT`?
3. **Healthcheck Path** - Try `/health` instead of `/Health`
4. **Service Logs** - Check Railway logs for startup errors

---

**Ready to receive environment variables for Publishing APIs service!** 📋
