#!/bin/bash
# Generate audio files for FAQs using Eleven Labs API
# Usage: ./scripts/generate-faq-audio.sh <faq-json-file> [voice-id]

set -e

FAQ_FILE=${1:-""}
VOICE_ID=${2:-"21m00Tcm4TlvDq8ikWAM"} # Default: Rachel
ELEVEN_LABS_API_KEY=${ELEVEN_LABS_API_KEY:-""}

if [ -z "$FAQ_FILE" ]; then
  echo "Usage: $0 <faq-json-file> [voice-id]"
  exit 1
fi

if [ ! -f "$FAQ_FILE" ]; then
  echo "Error: FAQ file not found: $FAQ_FILE"
  exit 1
fi

echo "🎙️  Generating audio files for FAQs..."

OUTPUT_DIR="audio/faqs"
mkdir -p "$OUTPUT_DIR"

# Parse FAQs from JSON array
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required. Install: brew install jq"
  exit 1
fi

FAQ_COUNT=$(cat "$FAQ_FILE" | jq 'length')
CURRENT=0

cat "$FAQ_FILE" | jq -r '.[] | "\(.id)|\(.question)|\(.answer)"' | while IFS='|' read -r faq_id question answer; do
  CURRENT=$((CURRENT + 1))
  echo "[$CURRENT/$FAQ_COUNT] Processing FAQ: $faq_id"
  
  # Combine question and answer
  TEXT="Question: ${question}. Answer: ${answer}"
  
  OUTPUT_FILE="${OUTPUT_DIR}/faq-${faq_id}.mp3"
  
  JSON_PAYLOAD=$(jq -n \
    --arg text "$TEXT" \
    '{
      text: $text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
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
    echo "✅ Generated: $OUTPUT_FILE"
  else
    echo "❌ Failed (HTTP $HTTP_CODE)"
    [ -f "$OUTPUT_FILE" ] && rm "$OUTPUT_FILE"
  fi
  
  sleep 1
done

echo "✅ FAQ audio generation complete!"

