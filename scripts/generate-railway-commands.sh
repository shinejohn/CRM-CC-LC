#!/bin/bash

# Generate Railway CLI commands for setting environment variables
# This creates a script you can run that has all the exact commands
# Usage: ./scripts/generate-railway-commands.sh

echo "🚀 Generating Railway CLI Commands"
echo "===================================="
echo ""
echo "This will create a script with all Railway CLI commands"
echo ""

# Get values from user
read -p "PostgreSQL Host: " PGHOST
read -p "PostgreSQL Port [5432]: " PGPORT
PGPORT=${PGPORT:-5432}
read -p "PostgreSQL Database: " PGDATABASE
read -p "PostgreSQL User: " PGUSER
read -sp "PostgreSQL Password: " PGPASSWORD
echo ""
read -p "Redis Host: " REDIS_HOST
read -p "Redis Port [6379]: " REDIS_PORT
REDIS_PORT=${REDIS_PORT:-6379}
read -sp "Redis Password (optional): " REDIS_PASSWORD
echo ""
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY
read -p "CC API URL (e.g., https://cc-api.up.railway.app): " API_URL

OUTPUT_FILE="railway-set-vars.sh"

cat > "$OUTPUT_FILE" << EOF
#!/bin/bash
# Railway Environment Variables Setup Commands
# Generated: $(date)
# Run this script to set all variables

set -e

echo "🚀 Setting Railway Environment Variables..."
echo ""

# CC API Service
echo "Setting CC API variables..."
railway variables --set "APP_NAME=LearningCenter" --service "CC API"
railway variables --set "APP_ENV=production" --service "CC API"
railway variables --set "APP_DEBUG=false" --service "CC API"
railway variables --set "APP_URL=$API_URL" --service "CC API"
railway variables --set "DB_CONNECTION=pgsql" --service "CC API"
railway variables --set "DB_HOST=$PGHOST" --service "CC API"
railway variables --set "DB_PORT=$PGPORT" --service "CC API"
railway variables --set "DB_DATABASE=$PGDATABASE" --service "CC API"
railway variables --set "DB_USERNAME=$PGUSER" --service "CC API"
railway variables --set "DB_PASSWORD=$PGPASSWORD" --service "CC API"
railway variables --set "REDIS_HOST=$REDIS_HOST" --service "CC API"
railway variables --set "REDIS_PORT=$REDIS_PORT" --service "CC API"
EOF

if [ -n "$REDIS_PASSWORD" ]; then
    echo "railway variables --set \"REDIS_PASSWORD=$REDIS_PASSWORD\" --service \"CC API\"" >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF
railway variables --set "QUEUE_CONNECTION=redis" --service "CC API"
railway variables --set "REDIS_QUEUE_CONNECTION=default" --service "CC API"
railway variables --set "REDIS_QUEUE=default" --service "CC API"
railway variables --set "SESSION_DRIVER=redis" --service "CC API"
railway variables --set "CACHE_DRIVER=redis" --service "CC API"
railway variables --set "LOG_CHANNEL=stack" --service "CC API"
railway variables --set "LOG_LEVEL=info" --service "CC API"
railway variables --set "HORIZON_PREFIX=horizon" --service "CC API"
railway variables --set "OPENROUTER_API_KEY=$OPENROUTER_KEY" --service "CC API"
railway variables --set "ELEVEN_LABS_API_KEY=$ELEVENLABS_KEY" --service "CC API"
railway variables --set "AI_GATEWAY_URL=https://ai-gateway.fibonacco.com" --service "CC API"
railway variables --set "AI_TOOLS_PLATFORM=fibonacco" --service "CC API"
railway variables --set "AI_TOOLS_PROVIDER=openrouter" --service "CC API"
railway variables --set "AI_TOOLS_LOGGING=true" --service "CC API"
railway variables --set "AI_TOOLS_LOG_CHANNEL=stack" --service "CC API"

# Queue Worker Service
echo "Setting Queue Worker variables..."
railway variables --set "APP_NAME=LearningCenter" --service "CRM-CC-LC Queues"
railway variables --set "APP_ENV=production" --service "CRM-CC-LC Queues"
railway variables --set "APP_DEBUG=false" --service "CRM-CC-LC Queues"
railway variables --set "DB_CONNECTION=pgsql" --service "CRM-CC-LC Queues"
railway variables --set "DB_HOST=$PGHOST" --service "CRM-CC-LC Queues"
railway variables --set "DB_PORT=$PGPORT" --service "CRM-CC-LC Queues"
railway variables --set "DB_DATABASE=$PGDATABASE" --service "CRM-CC-LC Queues"
railway variables --set "DB_USERNAME=$PGUSER" --service "CRM-CC-LC Queues"
railway variables --set "DB_PASSWORD=$PGPASSWORD" --service "CRM-CC-LC Queues"
railway variables --set "REDIS_HOST=$REDIS_HOST" --service "CRM-CC-LC Queues"
railway variables --set "REDIS_PORT=$REDIS_PORT" --service "CRM-CC-LC Queues"
EOF

if [ -n "$REDIS_PASSWORD" ]; then
    echo "railway variables --set \"REDIS_PASSWORD=$REDIS_PASSWORD\" --service \"CRM-CC-LC Queues\"" >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF
railway variables --set "QUEUE_CONNECTION=redis" --service "CRM-CC-LC Queues"
railway variables --set "REDIS_QUEUE_CONNECTION=default" --service "CRM-CC-LC Queues"
railway variables --set "REDIS_QUEUE=default" --service "CRM-CC-LC Queues"
railway variables --set "SESSION_DRIVER=redis" --service "CRM-CC-LC Queues"
railway variables --set "CACHE_DRIVER=redis" --service "CRM-CC-LC Queues"
railway variables --set "LOG_CHANNEL=stack" --service "CRM-CC-LC Queues"
railway variables --set "LOG_LEVEL=info" --service "CRM-CC-LC Queues"

# Scheduler Service
echo "Setting Scheduler variables..."
railway variables --set "APP_NAME=LearningCenter" --service "CC-CRM-LC Scheduler"
railway variables --set "APP_ENV=production" --service "CC-CRM-LC Scheduler"
railway variables --set "APP_DEBUG=false" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_CONNECTION=pgsql" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_HOST=$PGHOST" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_PORT=$PGPORT" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_DATABASE=$PGDATABASE" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_USERNAME=$PGUSER" --service "CC-CRM-LC Scheduler"
railway variables --set "DB_PASSWORD=$PGPASSWORD" --service "CC-CRM-LC Scheduler"
railway variables --set "REDIS_HOST=$REDIS_HOST" --service "CC-CRM-LC Scheduler"
railway variables --set "REDIS_PORT=$REDIS_PORT" --service "CC-CRM-LC Scheduler"
EOF

if [ -n "$REDIS_PASSWORD" ]; then
    echo "railway variables --set \"REDIS_PASSWORD=$REDIS_PASSWORD\" --service \"CC-CRM-LC Scheduler\"" >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF
railway variables --set "QUEUE_CONNECTION=redis" --service "CC-CRM-LC Scheduler"
railway variables --set "REDIS_QUEUE_CONNECTION=default" --service "CC-CRM-LC Scheduler"
railway variables --set "REDIS_QUEUE=default" --service "CC-CRM-LC Scheduler"
railway variables --set "SESSION_DRIVER=redis" --service "CC-CRM-LC Scheduler"
railway variables --set "CACHE_DRIVER=redis" --service "CC-CRM-LC Scheduler"
railway variables --set "LOG_CHANNEL=stack" --service "CC-CRM-LC Scheduler"
railway variables --set "LOG_LEVEL=info" --service "CC-CRM-LC Scheduler"

# Frontend Service
echo "Setting Frontend variables..."
railway variables --set "VITE_API_ENDPOINT=$API_URL/api" --service "CC-CRM-LC-FOA Front"
railway variables --set "VITE_API_URL=$API_URL/api" --service "CC-CRM-LC-FOA Front"
railway variables --set "NODE_ENV=production" --service "CC-CRM-LC-FOA Front"

echo ""
echo "✅ All variables set!"
echo ""
echo "⚠️  Don't forget to generate APP_KEY:"
echo "   railway run --service 'CC API' 'php artisan key:generate --show'"
echo "   Then set it: railway variables --set 'APP_KEY=<key>' --service 'CC API'"
EOF

chmod +x "$OUTPUT_FILE"

echo ""
echo "✅ Generated: $OUTPUT_FILE"
echo ""
echo "To set all variables, run:"
echo "  ./$OUTPUT_FILE"
echo ""
