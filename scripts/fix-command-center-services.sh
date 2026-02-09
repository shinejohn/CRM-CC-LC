#!/bin/bash

# Fix Command Center Railway Services
# Sets all environment variables and configures services
# Usage: ./scripts/fix-command-center-services.sh

set -e

echo "🔧 Command Center Services Fix"
echo "==============================="
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

# Service names (exact from Railway dashboard)
API_SERVICE="CRM-CC-LC API"
HORIZON_SERVICE="horizon"
FRONTEND_SERVICE="CRM-CC-LC Front End"
FOA_SERVICE="CRM-CC-LC FOA"
POSTGRES_SERVICE="Postgres-CC"
REDIS_SERVICE="Redis"

echo "📋 Getting connection information..."
echo ""

# Get PostgreSQL variables
echo "📦 Getting PostgreSQL connection info..."
PG_VARS=$(railway variables --service "$POSTGRES_SERVICE" --kv 2>/dev/null || echo "")
PGHOST=$(echo "$PG_VARS" | grep "^PGHOST=" | cut -d'=' -f2- || echo "")
PGPORT=$(echo "$PG_VARS" | grep "^PGPORT=" | cut -d'=' -f2- || echo "5432")
PGDATABASE=$(echo "$PG_VARS" | grep "^PGDATABASE=" | cut -d'=' -f2- || echo "")
PGUSER=$(echo "$PG_VARS" | grep "^PGUSER=" | cut -d'=' -f2- || echo "")
PGPASSWORD=$(echo "$PG_VARS" | grep "^PGPASSWORD=" | cut -d'=' -f2- || echo "")

if [ -z "$PGHOST" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect PostgreSQL variables${NC}"
    read -p "PostgreSQL Host: " PGHOST
    read -p "PostgreSQL Port [5432]: " PGPORT
    PGPORT=${PGPORT:-5432}
    read -p "PostgreSQL Database: " PGDATABASE
    read -p "PostgreSQL User: " PGUSER
    read -sp "PostgreSQL Password: " PGPASSWORD
    echo ""
fi

# Get Redis variables
echo "🔴 Getting Redis connection info..."
REDIS_VARS=$(railway variables --service "$REDIS_SERVICE" --kv 2>/dev/null || echo "")
REDIS_HOST=$(echo "$REDIS_VARS" | grep "^REDIS_HOST=" | cut -d'=' -f2- || echo "")
REDIS_PORT=$(echo "$REDIS_VARS" | grep "^REDIS_PORT=" | cut -d'=' -f2- || echo "6379")
REDIS_PASSWORD=$(echo "$REDIS_VARS" | grep "^REDIS_PASSWORD=" | cut -d'=' -f2- || echo "")

if [ -z "$REDIS_HOST" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect Redis variables${NC}"
    read -p "Redis Host: " REDIS_HOST
    read -p "Redis Port [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
    read -sp "Redis Password (optional): " REDIS_PASSWORD
    echo ""
fi

# Get API keys
echo ""
echo "🔑 API Keys:"
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY
read -p "CRM-CC-LC API URL (update after deploy): " API_URL
API_URL=${API_URL:-"https://crm-cc-lc-api.up.railway.app"}

echo ""
echo "⚙️  Setting environment variables..."
echo ""

# Function to set variable
set_var() {
    local service=$1
    local name=$2
    local value=$3
    
    if railway variables --set "$name=$value" --service "$service" &> /dev/null; then
        echo -e "  ${GREEN}✅${NC} $name"
        return 0
    else
        echo -e "  ${RED}❌${NC} $name"
        return 1
    fi
}

# CRM-CC-LC API Variables
echo "🚀 Setting CRM-CC-LC API variables..."
set_var "$API_SERVICE" "APP_NAME" "CommandCenter"
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

# Horizon Variables
echo ""
echo "⚙️  Setting horizon variables..."
set_var "$HORIZON_SERVICE" "APP_NAME" "CommandCenter"
set_var "$HORIZON_SERVICE" "APP_ENV" "production"
set_var "$HORIZON_SERVICE" "APP_DEBUG" "false"
set_var "$HORIZON_SERVICE" "DB_CONNECTION" "pgsql"
set_var "$HORIZON_SERVICE" "DB_HOST" "$PGHOST"
set_var "$HORIZON_SERVICE" "DB_PORT" "$PGPORT"
set_var "$HORIZON_SERVICE" "DB_DATABASE" "$PGDATABASE"
set_var "$HORIZON_SERVICE" "DB_USERNAME" "$PGUSER"
set_var "$HORIZON_SERVICE" "DB_PASSWORD" "$PGPASSWORD"
set_var "$HORIZON_SERVICE" "REDIS_HOST" "$REDIS_HOST"
set_var "$HORIZON_SERVICE" "REDIS_PORT" "$REDIS_PORT"
[ -n "$REDIS_PASSWORD" ] && set_var "$HORIZON_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD"
set_var "$HORIZON_SERVICE" "QUEUE_CONNECTION" "redis"
set_var "$HORIZON_SERVICE" "REDIS_QUEUE_CONNECTION" "default"
set_var "$HORIZON_SERVICE" "REDIS_QUEUE" "default"
set_var "$HORIZON_SERVICE" "SESSION_DRIVER" "redis"
set_var "$HORIZON_SERVICE" "CACHE_DRIVER" "redis"
set_var "$HORIZON_SERVICE" "LOG_CHANNEL" "stack"
set_var "$HORIZON_SERVICE" "LOG_LEVEL" "info"

# Frontend Variables
echo ""
echo "🎨 Setting Front End variables..."
set_var "$FRONTEND_SERVICE" "VITE_API_ENDPOINT" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "VITE_API_URL" "$API_URL/api"
set_var "$FRONTEND_SERVICE" "NODE_ENV" "production"

# FOA Variables (assuming same as frontend for now)
echo ""
echo "❓ Setting CRM-CC-LC FOA variables..."
set_var "$FOA_SERVICE" "VITE_API_ENDPOINT" "$API_URL/api"
set_var "$FOA_SERVICE" "VITE_API_URL" "$API_URL/api"
set_var "$FOA_SERVICE" "NODE_ENV" "production"

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
echo "  2. Check Root Directory and Start Commands (see COMMAND_CENTER_ARCHITECTURE.md)"
echo "  3. Redeploy all services"
echo "  4. Check build logs for any errors"
echo ""
