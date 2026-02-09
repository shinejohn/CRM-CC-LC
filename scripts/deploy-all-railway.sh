#!/bin/bash

# Complete Railway Deployment Script
# Sets variables, runs migrations, and deploys all services
# Usage: ./scripts/deploy-all-railway.sh

set -e

echo "🚀 Complete Railway Deployment"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    exit 1
fi

if ! railway status &> /dev/null; then
    echo -e "${RED}❌ Not linked to Railway project!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI ready${NC}"
echo ""

# Service names
API_SERVICE="CC API"
QUEUE_SERVICE="CRM-CC-LC Queues"
SCHEDULER_SERVICE="CC-CRM-LC Scheduler"
FRONTEND_SERVICE="CC-CRM-LC-FOA Front"
POSTGRES_SERVICE="Postgres CC CRM SMB"
REDIS_SERVICE="Redis CC"

# Get connection info
echo "📋 Getting connection information..."
echo ""

# Try to get PostgreSQL vars
PG_VARS=$(railway variables --service "$POSTGRES_SERVICE" --json 2>/dev/null || echo "[]")
if command -v jq &> /dev/null && [ "$PG_VARS" != "[]" ]; then
    PGHOST=$(echo "$PG_VARS" | jq -r '.[] | select(.name=="PGHOST") | .value' 2>/dev/null || echo "")
    PGPORT=$(echo "$PG_VARS" | jq -r '.[] | select(.name=="PGPORT") | .value' 2>/dev/null || echo "5432")
    PGDATABASE=$(echo "$PG_VARS" | jq -r '.[] | select(.name=="PGDATABASE") | .value' 2>/dev/null || echo "")
    PGUSER=$(echo "$PG_VARS" | jq -r '.[] | select(.name=="PGUSER") | .value' 2>/dev/null || echo "")
    PGPASSWORD=$(echo "$PG_VARS" | jq -r '.[] | select(.name=="PGPASSWORD") | .value' 2>/dev/null || echo "")
fi

if [ -z "$PGHOST" ] || [ "$PGHOST" = "null" ]; then
    echo "Enter PostgreSQL connection details:"
    read -p "Host: " PGHOST
    read -p "Port [5432]: " PGPORT
    PGPORT=${PGPORT:-5432}
    read -p "Database: " PGDATABASE
    read -p "User: " PGUSER
    read -sp "Password: " PGPASSWORD
    echo ""
fi

# Get Redis vars
REDIS_VARS=$(railway variables --service "$REDIS_SERVICE" --json 2>/dev/null || echo "[]")
if command -v jq &> /dev/null && [ "$REDIS_VARS" != "[]" ]; then
    REDIS_HOST=$(echo "$REDIS_VARS" | jq -r '.[] | select(.name=="REDIS_HOST") | .value' 2>/dev/null || echo "")
    REDIS_PORT=$(echo "$REDIS_VARS" | jq -r '.[] | select(.name=="REDIS_PORT") | .value' 2>/dev/null || echo "6379")
    REDIS_PASSWORD=$(echo "$REDIS_VARS" | jq -r '.[] | select(.name=="REDIS_PASSWORD") | .value' 2>/dev/null || echo "")
fi

if [ -z "$REDIS_HOST" ] || [ "$REDIS_HOST" = "null" ]; then
    echo "Enter Redis connection details:"
    read -p "Host: " REDIS_HOST
    read -p "Port [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
    read -sp "Password (optional): " REDIS_PASSWORD
    echo ""
fi

# Get API keys
echo ""
echo "🔑 API Keys:"
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY
read -p "CC API URL (update after deploy): " API_URL
API_URL=${API_URL:-"https://cc-api.up.railway.app"}

echo ""
echo "⚙️  Setting environment variables..."
echo ""

# Set variable function
set_var() {
    local service=$1
    local name=$2
    local value=$3
    railway variables --set "$name=$value" --service "$service" &> /dev/null && echo -e "  ${GREEN}✅${NC} $name" || echo -e "  ${RED}❌${NC} $name"
}

# CC API Variables
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

# Generate APP_KEY
echo ""
echo "🔑 Generating APP_KEY..."
APP_KEY=$(railway run --service "$API_SERVICE" "php artisan key:generate --show" 2>&1 | grep -oP 'base64:[A-Za-z0-9+/=]+' || echo "")
if [ -n "$APP_KEY" ]; then
    set_var "$API_SERVICE" "APP_KEY" "$APP_KEY"
    echo -e "${GREEN}✅ APP_KEY generated${NC}"
else
    echo -e "${YELLOW}⚠️  Generate manually: railway run --service '$API_SERVICE' 'php artisan key:generate --show'${NC}"
fi

# Queue Worker Variables
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

# Scheduler Variables
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

# Frontend Variables
echo ""
echo "🎨 Frontend Service:"
set_var "$FRONTEND_SERVICE" "VITE_API_ENDPOINT" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "VITE_API_URL" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "NODE_ENV" "production"

echo ""
echo "✅ Environment variables set!"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
if railway run --service "$API_SERVICE" "php artisan migrate --force" 2>&1; then
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Check migration logs${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify service configurations in Railway dashboard"
echo "  2. Check Root Directory and Start Commands (see RAILWAY_SERVICE_CONFIGS.md)"
echo "  3. Redeploy all services"
echo "  4. Check build logs for any errors"
echo ""
