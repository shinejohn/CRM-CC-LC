# Laravel Storage Setup Guide

## Overview

**Question:** Do we need a Laravel storage container/service on Railway?

**Answer:** **NO** - We don't need a separate Railway storage service. Instead, we use **Cloudflare R2** for persistent file storage.

---

## Storage Architecture

### Current Setup
- ❌ **Local Storage** - Only for temporary files (ephemeral on Railway)
- ✅ **Cloudflare R2** - Persistent file storage (external service)

### What Needs Storage?
1. **Audio files** (TTS generation) - Store in R2
2. **Generated presentations** - Store in R2
3. **User uploads** - Store in R2
4. **Campaign assets** - Store in R2
5. **Cache/temp files** - Can use local or Redis

---

## Cloudflare R2 Configuration

### Step 1: Create R2 Bucket

1. Go to Cloudflare Dashboard
2. Navigate to R2
3. Create bucket: `fibonacco-assets`
4. Configure:
   - Public access (if needed for assets)
   - CORS settings
   - Custom domain (optional)

### Step 2: Get R2 Credentials

1. Create API Token:
   - Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Create token with read/write permissions
   - Save:
     - **Access Key ID**
     - **Secret Access Key**
     - **Endpoint URL** (e.g., `https://<account-id>.r2.cloudflarestorage.com`)

### Step 3: Configure Laravel Filesystem

Laravel's S3 driver is S3-compatible, so it works with Cloudflare R2!

**Update `config/filesystems.php`:**

```php
'disks' => [
    // ... existing disks ...
    
    'r2' => [
        'driver' => 's3',
        'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID'),
        'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
        'region' => 'auto', // R2 uses 'auto' region
        'bucket' => env('CLOUDFLARE_R2_BUCKET'),
        'url' => env('CLOUDFLARE_R2_PUBLIC_URL'),
        'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
        'use_path_style_endpoint' => false,
        'throw' => false,
    ],
],
```

### Step 4: Set Environment Variables

Add to `.env`:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET=fibonacco-assets
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://assets.fibonacco.com

# Set R2 as default storage
FILESYSTEM_DISK=r2
```

### Step 5: Update Railway Environment Variables

Add the same R2 variables to all Railway services:
- API Server
- Horizon
- Scheduler

---

## Using R2 Storage in Code

### Store Files:

```php
use Illuminate\Support\Facades\Storage;

// Store audio file
Storage::disk('r2')->put('audio/faq/123.mp3', $audioData);

// Store with public URL
$url = Storage::disk('r2')->url('audio/faq/123.mp3');
```

### GenerateTTS Job Example:

```php
public function handle(ElevenLabsService $elevenLabsService): void
{
    // Generate audio
    $audioData = $elevenLabsService->generateAudio($this->text, $this->voiceId);
    
    // Save to R2
    $path = "audio/{$this->type}/{$this->contentId}.mp3";
    Storage::disk('r2')->put($path, $audioData);
    
    // Get public URL
    $audioUrl = Storage::disk('r2')->url($path);
    
    // Update database
    // ...
}
```

---

## Alternative: Railway Volumes (Optional)

If you prefer Railway-managed storage:

1. **Create Volume:**
   - Railway Dashboard → Project → Volumes
   - Create volume: `laravel-storage`
   - Mount path: `/app/storage/app`

2. **Configure:**
   - Volume persists across deployments
   - Good for local file storage
   - But R2 is better for scalability and CDN

**Recommendation:** Use R2 for production, Railway volumes only if needed for temporary files.

---

## Storage Strategy

### Use R2 For:
- ✅ Audio files (TTS)
- ✅ Generated presentations
- ✅ User uploads
- ✅ Public assets
- ✅ Campaign JSON files
- ✅ Any file that needs to persist

### Use Local Storage For:
- ✅ Temporary files
- ✅ Cache (better use Redis)
- ✅ Logs (can use Railway logs)

---

## Complete Setup Checklist

- [ ] Create Cloudflare R2 bucket
- [ ] Generate R2 API credentials
- [ ] Update `config/filesystems.php` with R2 disk
- [ ] Add R2 environment variables to `.env`
- [ ] Add R2 environment variables to Railway services
- [ ] Update code to use `Storage::disk('r2')`
- [ ] Test file upload/download
- [ ] Configure public CDN endpoint (optional)

---

## Summary

**Do we need a storage container on Railway?**
- ❌ **NO** - Railway services are stateless
- ✅ **YES** - We need **Cloudflare R2** configured as external storage
- ✅ R2 acts as our persistent storage layer
- ✅ No separate Railway service needed

**Railway Services Needed:**
1. API Server (Laravel)
2. Horizon (Queue Worker)
3. Scheduler (Cron Jobs)
4. PostgreSQL (Database)
5. Redis/Valkey (Cache/Queue)

**External Services:**
- Cloudflare R2 (File Storage) ← This is what we need!

---

**Created:** December 2024






