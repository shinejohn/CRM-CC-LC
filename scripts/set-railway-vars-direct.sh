#!/bin/bash

# Direct Railway Variables Setup
# Sets variables without checking for link (assumes you're linked)
# Usage: ./scripts/set-railway-vars-direct.sh

set -e

echo "🚀 Railway Environment Variables Setup"
echo "========================================"
echo ""

# Service names
API_SERVICE="CC API"
QUEUE_SERVICE="CRM-CC-LC Queues"
SCHEDULER_SERVICE="CC-CRM-LC Scheduler"
FRONTEND_SERVICE="CC-CRM-LC-FOA Front"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to set variable
set_var() {
    local service=$1
    local name=$2
    local value=$3
    
    echo -n "  $name... "
    if railway variables --set "$name=$value" --service "$service" 2>&1 | grep -q "error\|Error\|failed\|Failed"; then
        echo -e "${RED}❌${NC}"
        return 1
    else
        echo -e "${GREEN}✅${NC}"
        return 0
    fi
}

# Get values from user
echo "📋 Enter Configuration Values"
echo "----------------------------"
echo ""
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
read -sp "Redis Password (optional, press Enter to skip): " REDIS_PASSWORD
echo ""
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY
read -p "CC API URL (e.g., https://cc-api.up.railway.app): " API_URL
read -p "Pusher App Key (optional, for real-time WebSocket - press Enter to skip): " PUSHER_APP_KEY
read -p "Pusher Cluster [us2]: " PUSHER_APP_CLUSTER
PUSHER_APP_CLUSTER=${PUSHER_APP_CLUSTER:-us2}

echo ""
echo "⚙️  Setting variables for all services..."
echo ""

# CC API Service
echo "🚀 CC API Service:"
set_var "$API_SERVICE" "APP_NAME" "LearningCenter"
set_var "$API_SERVICE" "APP_ENV" "production"
set_var "$API_SERVICE" "APP_DEBUG" "false"
set_var "$API_SERVICE" "APP_URL" "$API_URL"
set_var "$API_SERVICE" "DB_CONNECTION" "pgsql"
set_var "$API_SERVICE" "DB_HOST" "$PGHOST"
set_var "$API_SERVICE" "DB_PORT" "$PGPORT"
set_var "$API_SERVICE" "DB_DATABASE" "$PGDATABASE"
set_var "$API_SERVICE" "DB_USERNAME" "$PGUSER"
set_var "$API_SERVICE" "DB_PASSWORD" "$PGPASSWORD"
set_var "$API_SERVICE" "REDIS_HOST" "$REDIS_HOST"
set_var "$API_SERVICE" "REDIS_PORT" "$REDIS_PORT"
[ -n "$REDIS_PASSWORD" ] && set_var "$API_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD"
set_var "$API_SERVICE" "QUEUE_CONNECTION" "redis"
set_var "$API_SERVICE" "REDIS_QUEUE_CONNECTION" "default"
set_var "$API_SERVICE" "REDIS_QUEUE" "default"
set_var "$API_SERVICE" "SESSION_DRIVER" "redis"
set_var "$API_SERVICE" "CACHE_DRIVER" "redis"
set_var "$API_SERVICE" "LOG_CHANNEL" "stack"
set_var "$API_SERVICE" "LOG_LEVEL" "info"
set_var "$API_SERVICE" "HORIZON_PREFIX" "horizon"
set_var "$API_SERVICE" "OPENROUTER_API_KEY" "$OPENROUTER_KEY"
set_var "$API_SERVICE" "ELEVEN_LABS_API_KEY" "$ELEVENLABS_KEY"
set_var "$API_SERVICE" "AI_GATEWAY_URL" "https://ai-gateway.fibonacco.com"
set_var "$API_SERVICE" "AI_TOOLS_PLATFORM" "fibonacco"
set_var "$API_SERVICE" "AI_TOOLS_PROVIDER" "openrouter"
set_var "$API_SERVICE" "AI_TOOLS_LOGGING" "true"
set_var "$API_SERVICE" "AI_TOOLS_LOG_CHANNEL" "stack"

echo ""
echo "⚙️  Queue Worker Service:"
set_var "$QUEUE_SERVICE" "APP_NAME" "LearningCenter"
set_var "$QUEUE_SERVICE" "APP_ENV" "production"
set_var "$QUEUE_SERVICE" "APP_DEBUG" "false"
set_var "$QUEUE_SERVICE" "DB_CONNECTION" "pgsql"
set_var "$QUEUE_SERVICE" "DB_HOST" "$PGHOST"
set_var "$QUEUE_SERVICE" "DB_PORT" "$PGPORT"
set_var "$QUEUE_SERVICE" "DB_DATABASE" "$PGDATABASE"
set_var "$QUEUE_SERVICE" "DB_USERNAME" "$PGUSER"
set_var "$QUEUE_SERVICE" "DB_PASSWORD" "$PGPASSWORD"
set_var "$QUEUE_SERVICE" "REDIS_HOST" "$REDIS_HOST"
set_var "$QUEUE_SERVICE" "REDIS_PORT" "$REDIS_PORT"
[ -n "$REDIS_PASSWORD" ] && set_var "$QUEUE_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD"
set_var "$QUEUE_SERVICE" "QUEUE_CONNECTION" "redis"
set_var "$QUEUE_SERVICE" "REDIS_QUEUE_CONNECTION" "default"
set_var "$QUEUE_SERVICE" "REDIS_QUEUE" "default"
set_var "$QUEUE_SERVICE" "SESSION_DRIVER" "redis"
set_var "$QUEUE_SERVICE" "CACHE_DRIVER" "redis"
set_var "$QUEUE_SERVICE" "LOG_CHANNEL" "stack"
set_var "$QUEUE_SERVICE" "LOG_LEVEL" "info"

echo ""
echo "⏰ Scheduler Service:"
set_var "$SCHEDULER_SERVICE" "APP_NAME" "LearningCenter"
set_var "$SCHEDULER_SERVICE" "APP_ENV" "production"
set_var "$SCHEDULER_SERVICE" "APP_DEBUG" "false"
set_var "$SCHEDULER_SERVICE" "DB_CONNECTION" "pgsql"
set_var "$SCHEDULER_SERVICE" "DB_HOST" "$PGHOST"
set_var "$SCHEDULER_SERVICE" "DB_PORT" "$PGPORT"
set_var "$SCHEDULER_SERVICE" "DB_DATABASE" "$PGDATABASE"
set_var "$SCHEDULER_SERVICE" "DB_USERNAME" "$PGUSER"
set_var "$SCHEDULER_SERVICE" "DB_PASSWORD" "$PGPASSWORD"
set_var "$SCHEDULER_SERVICE" "REDIS_HOST" "$REDIS_HOST"
set_var "$SCHEDULER_SERVICE" "REDIS_PORT" "$REDIS_PORT"
[ -n "$REDIS_PASSWORD" ] && set_var "$SCHEDULER_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD"
set_var "$SCHEDULER_SERVICE" "QUEUE_CONNECTION" "redis"
set_var "$SCHEDULER_SERVICE" "REDIS_QUEUE_CONNECTION" "default"
set_var "$SCHEDULER_SERVICE" "REDIS_QUEUE" "default"
set_var "$SCHEDULER_SERVICE" "SESSION_DRIVER" "redis"
set_var "$SCHEDULER_SERVICE" "CACHE_DRIVER" "redis"
set_var "$SCHEDULER_SERVICE" "LOG_CHANNEL" "stack"
set_var "$SCHEDULER_SERVICE" "LOG_LEVEL" "info"

echo ""
echo "🎨 Frontend Service:"
set_var "$FRONTEND_SERVICE" "VITE_API_ENDPOINT" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "VITE_API_URL" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "NODE_ENV" "production"
[ -n "$PUSHER_APP_KEY" ] && set_var "$FRONTEND_SERVICE" "VITE_PUSHER_APP_KEY" "$PUSHER_APP_KEY"
[ -n "$PUSHER_APP_KEY" ] && set_var "$FRONTEND_SERVICE" "VITE_PUSHER_APP_CLUSTER" "$PUSHER_APP_CLUSTER"

echo ""
echo "========================================"
echo -e "${GREEN}✅ Variables set!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Generate APP_KEY:"
echo "     railway run --service 'CC API' 'php artisan key:generate --show'"
echo ""
echo "  2. Set APP_KEY:"
echo "     railway variables --set 'APP_KEY=<generated-key>' --service 'CC API'"
echo ""
echo "  3. Update APP_URL and VITE_API_ENDPOINT after deployment with actual Railway URLs"
echo ""
