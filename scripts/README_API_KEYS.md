# API Keys Setup Guide

## API Keys Configured

### 1. Eleven Labs API Key
Configured for TTS (text-to-speech) generation.

### 2. OpenRouter API Key
Configured for AI conversations using Claude/OpenRouter.

### Storing the Keys Securely

**Railway Environment Variables (Recommended)**

```bash
# Set the API keys as environment variables in Railway
# Go to Railway dashboard → Your Service → Variables
# Add:
# - ELEVEN_LABS_API_KEY
# - OPENROUTER_API_KEY
```

**Local Development (Environment Variables)**

```bash
export ELEVEN_LABS_API_KEY="63b120775d461f5b7b1c36cd7b46834aaf59cf860520d742c0d18508b6019616"
export OPENROUTER_API_KEY="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"
```

### Using the Audio Generation Scripts

**Generate Audio for a Presentation:**

```bash
# Basic usage
./scripts/generate-presentation-audio.sh path/to/presentation.json

# With custom voice ID
./scripts/generate-presentation-audio.sh path/to/presentation.json "voice-id-here"
```

**Generate Audio for FAQs:**

```bash
./scripts/generate-faq-audio.sh path/to/faqs.json
```

### Available Voices

Default voice: `21m00Tcm4TlvDq8ikWAM` (Rachel - Professional Female)

Other popular voices:
- `pNInz6obpgDQGcFmaJgB` - Adam (Professional Male)
- `EXAVITQu4vr4xnSDxMaL` - Bella (Professional Female)
- `ErXwobaYiN019PkySvjV` - Antoni (Professional Male)

Find all voices at: https://elevenlabs.io/app/voices

### Security Notes

⚠️ **IMPORTANT:**
- Never commit the API key to git
- Store keys in Railway environment variables for production
- Rotate keys regularly
- Use environment variables, not hardcoded values

### Next Steps

1. **Store in Railway:**
   - Add environment variables in Railway dashboard
   - ELEVEN_LABS_API_KEY
   - OPENROUTER_API_KEY

2. **Generate Audio Files:**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/generate-presentation-audio.sh examples/presentation.json
   ```

3. **Upload to Cloudflare R2:**
   - Use Cloudflare R2 for audio file storage
   - Or Railway storage service

4. **Update Presentation JSON:**
   - Add audio URLs to each slide in the presentation JSON
   - URLs should point to Cloudflare R2 CDN

---

**API Key Status:** ✅ Configured and ready to use

