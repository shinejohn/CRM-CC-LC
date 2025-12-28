# Storage Architecture - Railway Services

## Answer: Do We Need a Storage Container?

**Short Answer:** **NO** - We don't need a separate Railway storage service/container.

**Long Answer:** We need persistent file storage, but we use **Cloudflare R2** (external service) instead of Railway volumes.

---

## Current Railway Services Setup

### ✅ Required Railway Services:

1. **API Server** - Main Laravel application
   - Command: `php artisan serve`
   - Needs: PostgreSQL, Redis

2. **Horizon** - Queue worker
   - Command: `php artisan horizon`
   - Needs: PostgreSQL, Redis

3. **Scheduler** - Cron jobs
   - Command: `php artisan schedule:work`
   - Needs: PostgreSQL, Redis

4. **PostgreSQL** - Database
   - Railway managed service

5. **Redis/Valkey** - Cache & Queue backend
   - Railway managed service

### ❌ NOT Needed:
- **Storage Container** - Use Cloudflare R2 instead
- **Volume Service** - Not required (use R2)

---

## Storage Solution: Cloudflare R2

### Why R2 Instead of Railway Volumes?

**Railway Volumes:**
- ❌ Tied to specific service instance
- ❌ Limited scalability
- ❌ No CDN integration
- ❌ Harder to share across services

**Cloudflare R2:**
- ✅ S3-compatible (works with Laravel)
- ✅ Global CDN access
- ✅ Scales automatically
- ✅ Shared across all services
- ✅ No egress fees
- ✅ Perfect for public assets

---

## What Needs Storage?

1. **Audio Files** (TTS generation)
   - Location: `r2://audio/faq/*.mp3`
   - Size: ~500KB per file

2. **Generated Presentations**
   - Location: `r2://presentations/*.json`
   - Size: ~50KB per file

3. **User Uploads**
   - Location: `r2://uploads/*`
   - Size: Variable

4. **Campaign Assets**
   - Location: `r2://campaigns/*.json`
   - Size: ~100KB per file

**Total Estimated:** ~1-10GB (depends on usage)

---

## Configuration Summary

### Railway Services (5 total):
1. ✅ API Server (Laravel)
2. ✅ Horizon (Queue Worker)
3. ✅ Scheduler (Cron Jobs)
4. ✅ PostgreSQL (Database)
5. ✅ Redis/Valkey (Cache/Queue)

### External Services:
- ✅ **Cloudflare R2** (File Storage) ← This replaces storage container

---

## Next Steps

1. **Create Cloudflare R2 bucket**
2. **Configure Laravel filesystem** to use R2
3. **Update environment variables** in all Railway services
4. **Test file upload/download**

See `STORAGE_SETUP.md` for detailed configuration instructions.

---

**Summary:** No Railway storage container needed - use Cloudflare R2 for persistent file storage!






