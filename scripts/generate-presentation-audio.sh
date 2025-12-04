#!/bin/bash
# Generate audio files for a presentation using Eleven Labs API
# Usage: ./scripts/generate-presentation-audio.sh <presentation-json-file> [voice-id]

set -e

PRESENTATION_FILE=${1:-""}
VOICE_ID=${2:-"21m00Tcm4TlvDq8ikWAM"} # Default: Rachel (professional female)
ELEVEN_LABS_API_KEY=${ELEVEN_LABS_API_KEY:-""}

if [ -z "$PRESENTATION_FILE" ]; then
  echo "Usage: $0 <presentation-json-file> [voice-id]"
  exit 1
fi

if [ ! -f "$PRESENTATION_FILE" ]; then
  echo "Error: Presentation file not found: $PRESENTATION_FILE"
  exit 1
fi

if [ -z "$ELEVEN_LABS_API_KEY" ]; then
  echo "Error: ELEVEN_LABS_API_KEY environment variable not set"
  exit 1
fi

echo "🎙️  Generating audio files for presentation..."

# Extract presentation ID from filename or JSON
PRESENTATION_ID=$(basename "$PRESENTATION_FILE" .json | sed 's/presentation//')

# Create output directory
OUTPUT_DIR="audio/${PRESENTATION_ID}"
mkdir -p "$OUTPUT_DIR"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Install it: brew install jq"
  exit 1
fi

# Parse JSON and extract slides with narration
SLIDES=$(cat "$PRESENTATION_FILE" | jq -r '.slides[]? | "\(.id)|\(.narration // "")"' | grep -v "^|$" || echo "")

if [ -z "$SLIDES" ]; then
  echo "Error: No slides with narration found in presentation file"
  exit 1
fi

SLIDE_COUNT=$(echo "$SLIDES" | wc -l | tr -d ' ')
CURRENT=0

echo "Found $SLIDE_COUNT slides with narration"

while IFS='|' read -r slide_id narration; do
  if [ -z "$narration" ] || [ "$narration" = "null" ]; then
    echo "⚠️  Skipping slide $slide_id (no narration)"
    continue
  fi
  
  CURRENT=$((CURRENT + 1))
  echo "[$CURRENT/$SLIDE_COUNT] Generating audio for slide $slide_id..."
  
  # Clean narration text (remove quotes, normalize)
  CLEAN_TEXT=$(echo "$narration" | sed "s/^\"//;s/\"$//" | tr -d '\n\r' | sed 's/"/\\"/g')
  
  if [ -z "$CLEAN_TEXT" ]; then
    echo "⚠️  Skipping slide $slide_id (empty narration after cleaning)"
    continue
  fi
  
  # Generate audio using Eleven Labs API
  OUTPUT_FILE="${OUTPUT_DIR}/slide-${slide_id}.mp3"
  
  # Create JSON payload
  JSON_PAYLOAD=$(jq -n \
    --arg text "$CLEAN_TEXT" \
    --arg model "eleven_multilingual_v2" \
    '{
      text: $text,
      model_id: $model,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }')
  
  HTTP_CODE=$(curl -s -w "%{http_code}" -o "$OUTPUT_FILE" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
    -H "Accept: audio/mpeg" \
    -H "Content-Type: application/json" \
    -H "xi-api-key: ${ELEVEN_LABS_API_KEY}" \
    -d "$JSON_PAYLOAD")
  
  if [ "$HTTP_CODE" = "200" ] && [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Generated: $OUTPUT_FILE ($FILE_SIZE)"
  else
    echo "❌ Failed to generate audio for slide $slide_id (HTTP $HTTP_CODE)"
    if [ -f "$OUTPUT_FILE" ]; then
      rm "$OUTPUT_FILE"
    fi
  fi
  
  # Rate limiting: wait 1 second between requests
  sleep 1
  
done <<< "$SLIDES"

echo ""
echo "✅ Audio generation complete!"
echo "📁 Files saved to: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Upload to Cloudflare R2 or Railway storage"
echo "2. Update presentation JSON with audio URLs from CDN"
