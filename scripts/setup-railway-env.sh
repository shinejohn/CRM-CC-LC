#!/bin/bash

# Railway Environment Variables Setup Script
# This script sets all environment variables for all Railway services automatically
# Usage: ./scripts/setup-railway-env.sh

set -e  # Exit on error

echo "🚀 Railway Environment Variables Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into Railway!${NC}"
    echo "Login with: railway login"
    exit 1
fi

# Check if project is linked
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  No Railway project linked!${NC}"
    echo ""
    echo "Please link to your project first:"
    echo "  1. Run: railway link"
    echo "  2. Select 'CRM-CC-LC-Project' from the list"
    echo "  3. Run this script again: ./scripts/setup-railway-env.sh"
    echo ""
    echo "Or set variables manually using Railway Dashboard:"
    echo "  See: RAILWAY_ENV_SETUP.md"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found and authenticated${NC}"
echo -e "${GREEN}✅ Railway project linked${NC}"
echo ""

# Service names (update these to match your Railway service names)
POSTGRES_SERVICE="Postgres CC CRM SMB"
REDIS_SERVICE="Redis CC"
API_SERVICE="CC API"
QUEUE_SERVICE="CRM-CC-LC Queues"
SCHEDULER_SERVICE="CC-CRM-LC Scheduler"
FRONTEND_SERVICE="CC-CRM-LC-FOA Front"

# Get PostgreSQL connection variables
echo "📦 Getting PostgreSQL connection variables..."
if command -v jq &> /dev/null; then
    POSTGRES_JSON=$(railway variables --service "$POSTGRES_SERVICE" --json 2>/dev/null || echo "[]")
    PGHOST=$(echo "$POSTGRES_JSON" | jq -r '.[] | select(.name=="PGHOST") | .value' 2>/dev/null || echo "")
    PGPORT=$(echo "$POSTGRES_JSON" | jq -r '.[] | select(.name=="PGPORT") | .value' 2>/dev/null || echo "")
    PGDATABASE=$(echo "$POSTGRES_JSON" | jq -r '.[] | select(.name=="PGDATABASE") | .value' 2>/dev/null || echo "")
    PGUSER=$(echo "$POSTGRES_JSON" | jq -r '.[] | select(.name=="PGUSER") | .value' 2>/dev/null || echo "")
    PGPASSWORD=$(echo "$POSTGRES_JSON" | jq -r '.[] | select(.name=="PGPASSWORD") | .value' 2>/dev/null || echo "")
else
    # Fallback: try to parse from KV format
    POSTGRES_VARS=$(railway variables --service "$POSTGRES_SERVICE" --kv 2>/dev/null || echo "")
    PGHOST=$(echo "$POSTGRES_VARS" | grep "^PGHOST=" | cut -d'=' -f2- || echo "")
    PGPORT=$(echo "$POSTGRES_VARS" | grep "^PGPORT=" | cut -d'=' -f2- || echo "")
    PGDATABASE=$(echo "$POSTGRES_VARS" | grep "^PGDATABASE=" | cut -d'=' -f2- || echo "")
    PGUSER=$(echo "$POSTGRES_VARS" | grep "^PGUSER=" | cut -d'=' -f2- || echo "")
    PGPASSWORD=$(echo "$POSTGRES_VARS" | grep "^PGPASSWORD=" | cut -d'=' -f2- || echo "")
fi

if [ -z "$PGHOST" ] || [ "$PGHOST" = "null" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect PostgreSQL variables${NC}"
    echo "Please enter them manually:"
    read -p "PostgreSQL Host: " PGHOST
    read -p "PostgreSQL Port [5432]: " PGPORT
    PGPORT=${PGPORT:-5432}
    read -p "PostgreSQL Database: " PGDATABASE
    read -p "PostgreSQL User: " PGUSER
    read -sp "PostgreSQL Password: " PGPASSWORD
    echo ""
fi

# Get Redis connection variables
echo "🔴 Getting Redis connection variables..."
if command -v jq &> /dev/null; then
    REDIS_JSON=$(railway variables --service "$REDIS_SERVICE" --json 2>/dev/null || echo "[]")
    REDIS_HOST=$(echo "$REDIS_JSON" | jq -r '.[] | select(.name=="REDIS_HOST") | .value' 2>/dev/null || echo "")
    REDIS_PORT=$(echo "$REDIS_JSON" | jq -r '.[] | select(.name=="REDIS_PORT") | .value' 2>/dev/null || echo "")
    REDIS_PASSWORD=$(echo "$REDIS_JSON" | jq -r '.[] | select(.name=="REDIS_PASSWORD") | .value' 2>/dev/null || echo "")
else
    # Fallback: try to parse from KV format
    REDIS_VARS=$(railway variables --service "$REDIS_SERVICE" --kv 2>/dev/null || echo "")
    REDIS_HOST=$(echo "$REDIS_VARS" | grep "^REDIS_HOST=" | cut -d'=' -f2- || echo "")
    REDIS_PORT=$(echo "$REDIS_VARS" | grep "^REDIS_PORT=" | cut -d'=' -f2- || echo "")
    REDIS_PASSWORD=$(echo "$REDIS_VARS" | grep "^REDIS_PASSWORD=" | cut -d'=' -f2- || echo "")
fi

if [ -z "$REDIS_HOST" ] || [ "$REDIS_HOST" = "null" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect Redis variables${NC}"
    read -p "Redis Host: " REDIS_HOST
    read -p "Redis Port [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
    read -sp "Redis Password (optional, press Enter to skip): " REDIS_PASSWORD
    echo ""
fi

# Get API keys (prompt if not set)
echo ""
echo "🔑 API Keys Configuration"
echo "-------------------------"
read -p "OpenRouter API Key: " OPENROUTER_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY
read -p "Anthropic API Key (optional, press Enter to skip): " ANTHROPIC_KEY
read -p "AI Gateway Token (optional, press Enter to skip): " AI_GATEWAY_TOKEN

# Get API URL (will be updated after deployment)
read -p "CC API Railway URL (e.g., https://cc-api.up.railway.app) or press Enter to set later: " API_URL
if [ -z "$API_URL" ]; then
    API_URL="https://cc-api.up.railway.app"
    echo -e "${YELLOW}⚠️  Using placeholder URL. Update after deployment!${NC}"
fi

echo ""
echo "⚙️  Setting environment variables..."
echo ""

# Function to set variable
set_var() {
    local service=$1
    local name=$2
    local value=$3
    local description=$4
    
    # Escape special characters in value
    local escaped_value=$(echo "$value" | sed "s/'/'\\\\''/g")
    
    echo -n "  Setting $name for $service... "
    if railway variables --set "$name=$escaped_value" --service "$service" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "    Run manually: railway variables --set \"$name=$escaped_value\" --service \"$service\""
        return 1
    fi
}

# ============================================
# CC API Service Variables
# ============================================
echo "🚀 Setting CC API Service Variables..."
echo "--------------------------------------"

# App Configuration
set_var "$API_SERVICE" "APP_NAME" "LearningCenter" "Application name"
set_var "$API_SERVICE" "APP_ENV" "production" "Environment"
set_var "$API_SERVICE" "APP_DEBUG" "false" "Debug mode"
set_var "$API_SERVICE" "APP_URL" "$API_URL" "Application URL"

# Database Configuration
set_var "$API_SERVICE" "DB_CONNECTION" "pgsql" "Database driver"
set_var "$API_SERVICE" "DB_HOST" "$PGHOST" "Database host"
set_var "$API_SERVICE" "DB_PORT" "$PGPORT" "Database port"
set_var "$API_SERVICE" "DB_DATABASE" "$PGDATABASE" "Database name"
set_var "$API_SERVICE" "DB_USERNAME" "$PGUSER" "Database user"
set_var "$API_SERVICE" "DB_PASSWORD" "$PGPASSWORD" "Database password"

# Redis Configuration
set_var "$API_SERVICE" "REDIS_HOST" "$REDIS_HOST" "Redis host"
set_var "$API_SERVICE" "REDIS_PORT" "$REDIS_PORT" "Redis port"
if [ -n "$REDIS_PASSWORD" ]; then
    set_var "$API_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD" "Redis password"
fi

# Queue Configuration
set_var "$API_SERVICE" "QUEUE_CONNECTION" "redis" "Queue driver"
set_var "$API_SERVICE" "REDIS_QUEUE_CONNECTION" "default" "Redis queue connection"
set_var "$API_SERVICE" "REDIS_QUEUE" "default" "Redis queue name"

# Session & Cache
set_var "$API_SERVICE" "SESSION_DRIVER" "redis" "Session driver"
set_var "$API_SERVICE" "CACHE_DRIVER" "redis" "Cache driver"

# Logging
set_var "$API_SERVICE" "LOG_CHANNEL" "stack" "Log channel"
set_var "$API_SERVICE" "LOG_LEVEL" "info" "Log level"

# Horizon
set_var "$API_SERVICE" "HORIZON_PREFIX" "horizon" "Horizon prefix"

# API Keys
set_var "$API_SERVICE" "OPENROUTER_API_KEY" "$OPENROUTER_KEY" "OpenRouter API key"
set_var "$API_SERVICE" "ELEVEN_LABS_API_KEY" "$ELEVENLABS_KEY" "ElevenLabs API key"
if [ -n "$ANTHROPIC_KEY" ]; then
    set_var "$API_SERVICE" "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY" "Anthropic API key"
fi

# AI Gateway
set_var "$API_SERVICE" "AI_GATEWAY_URL" "https://ai-gateway.fibonacco.com" "AI Gateway URL"
if [ -n "$AI_GATEWAY_TOKEN" ]; then
    set_var "$API_SERVICE" "AI_GATEWAY_TOKEN" "$AI_GATEWAY_TOKEN" "AI Gateway token"
fi

# AI Tools
set_var "$API_SERVICE" "AI_TOOLS_PLATFORM" "fibonacco" "AI Tools platform"
set_var "$API_SERVICE" "AI_TOOLS_PROVIDER" "openrouter" "AI Tools provider"
set_var "$API_SERVICE" "AI_TOOLS_LOGGING" "true" "AI Tools logging"
set_var "$API_SERVICE" "AI_TOOLS_LOG_CHANNEL" "stack" "AI Tools log channel"

# Generate APP_KEY
echo ""
echo -n "  Generating APP_KEY... "
APP_KEY=$(railway run --service "$API_SERVICE" "php artisan key:generate --show" 2>/dev/null | grep -oP 'base64:[A-Za-z0-9+/=]+' || echo "")
if [ -z "$APP_KEY" ]; then
    echo -e "${YELLOW}⚠️  Could not generate automatically${NC}"
    echo "    Run manually: railway run --service \"$API_SERVICE\" \"php artisan key:generate --show\""
    echo "    Then set: railway variables set \"APP_KEY=<generated-key>\" --service \"$API_SERVICE\""
else
    set_var "$API_SERVICE" "APP_KEY" "$APP_KEY" "Application encryption key"
fi

echo ""
echo -e "${GREEN}✅ CC API Service configured${NC}"
echo ""

# ============================================
# Queue Worker Service Variables
# ============================================
echo "⚙️  Setting Queue Worker Service Variables..."
echo "---------------------------------------------"

# Copy all variables from API service
set_var "$QUEUE_SERVICE" "APP_NAME" "LearningCenter" "Application name"
set_var "$QUEUE_SERVICE" "APP_ENV" "production" "Environment"
set_var "$QUEUE_SERVICE" "APP_DEBUG" "false" "Debug mode"

# Database Configuration
set_var "$QUEUE_SERVICE" "DB_CONNECTION" "pgsql" "Database driver"
set_var "$QUEUE_SERVICE" "DB_HOST" "$PGHOST" "Database host"
set_var "$QUEUE_SERVICE" "DB_PORT" "$PGPORT" "Database port"
set_var "$QUEUE_SERVICE" "DB_DATABASE" "$PGDATABASE" "Database name"
set_var "$QUEUE_SERVICE" "DB_USERNAME" "$PGUSER" "Database user"
set_var "$QUEUE_SERVICE" "DB_PASSWORD" "$PGPASSWORD" "Database password"

# Redis Configuration
set_var "$QUEUE_SERVICE" "REDIS_HOST" "$REDIS_HOST" "Redis host"
set_var "$QUEUE_SERVICE" "REDIS_PORT" "$REDIS_PORT" "Redis port"
if [ -n "$REDIS_PASSWORD" ]; then
    set_var "$QUEUE_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD" "Redis password"
fi

# Queue Configuration
set_var "$QUEUE_SERVICE" "QUEUE_CONNECTION" "redis" "Queue driver"
set_var "$QUEUE_SERVICE" "REDIS_QUEUE_CONNECTION" "default" "Redis queue connection"
set_var "$QUEUE_SERVICE" "REDIS_QUEUE" "default" "Redis queue name"

# Session & Cache
set_var "$QUEUE_SERVICE" "SESSION_DRIVER" "redis" "Session driver"
set_var "$QUEUE_SERVICE" "CACHE_DRIVER" "redis" "Cache driver"

# Logging
set_var "$QUEUE_SERVICE" "LOG_CHANNEL" "stack" "Log channel"
set_var "$QUEUE_SERVICE" "LOG_LEVEL" "info" "Log level"

echo ""
echo -e "${GREEN}✅ Queue Worker Service configured${NC}"
echo ""

# ============================================
# Scheduler Service Variables
# ============================================
echo "⏰ Setting Scheduler Service Variables..."
echo "------------------------------------------"

# Copy all variables from API service
set_var "$SCHEDULER_SERVICE" "APP_NAME" "LearningCenter" "Application name"
set_var "$SCHEDULER_SERVICE" "APP_ENV" "production" "Environment"
set_var "$SCHEDULER_SERVICE" "APP_DEBUG" "false" "Debug mode"

# Database Configuration
set_var "$SCHEDULER_SERVICE" "DB_CONNECTION" "pgsql" "Database driver"
set_var "$SCHEDULER_SERVICE" "DB_HOST" "$PGHOST" "Database host"
set_var "$SCHEDULER_SERVICE" "DB_PORT" "$PGPORT" "Database port"
set_var "$SCHEDULER_SERVICE" "DB_DATABASE" "$PGDATABASE" "Database name"
set_var "$SCHEDULER_SERVICE" "DB_USERNAME" "$PGUSER" "Database user"
set_var "$SCHEDULER_SERVICE" "DB_PASSWORD" "$PGPASSWORD" "Database password"

# Redis Configuration
set_var "$SCHEDULER_SERVICE" "REDIS_HOST" "$REDIS_HOST" "Redis host"
set_var "$SCHEDULER_SERVICE" "REDIS_PORT" "$REDIS_PORT" "Redis port"
if [ -n "$REDIS_PASSWORD" ]; then
    set_var "$SCHEDULER_SERVICE" "REDIS_PASSWORD" "$REDIS_PASSWORD" "Redis password"
fi

# Queue Configuration
set_var "$SCHEDULER_SERVICE" "QUEUE_CONNECTION" "redis" "Queue driver"
set_var "$SCHEDULER_SERVICE" "REDIS_QUEUE_CONNECTION" "default" "Redis queue connection"
set_var "$SCHEDULER_SERVICE" "REDIS_QUEUE" "default" "Redis queue name"

# Session & Cache
set_var "$SCHEDULER_SERVICE" "SESSION_DRIVER" "redis" "Session driver"
set_var "$SCHEDULER_SERVICE" "CACHE_DRIVER" "redis" "Cache driver"

# Logging
set_var "$SCHEDULER_SERVICE" "LOG_CHANNEL" "stack" "Log channel"
set_var "$SCHEDULER_SERVICE" "LOG_LEVEL" "info" "Log level"

echo ""
echo -e "${GREEN}✅ Scheduler Service configured${NC}"
echo ""

# ============================================
# Frontend Service Variables
# ============================================
echo "🎨 Setting Frontend Service Variables..."
echo "-----------------------------------------"

set_var "$FRONTEND_SERVICE" "VITE_API_ENDPOINT" "$API_URL/api" "API endpoint"
set_var "$FRONTEND_SERVICE" "VITE_API_URL" "$API_URL/api" "API URL"
set_var "$FRONTEND_SERVICE" "NODE_ENV" "production" "Node environment"

echo ""
echo -e "${GREEN}✅ Frontend Service configured${NC}"
echo ""

# ============================================
# Summary
# ============================================
echo "========================================"
echo -e "${GREEN}✅ Environment Variables Setup Complete!${NC}"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "  ✅ CC API Service: All variables set"
echo "  ✅ Queue Worker Service: All variables set"
echo "  ✅ Scheduler Service: All variables set"
echo "  ✅ Frontend Service: All variables set"
echo ""
echo "⚠️  Important Notes:"
echo "  1. APP_KEY may need to be generated manually if auto-generation failed"
echo "  2. Update APP_URL and VITE_API_ENDPOINT after first deployment with actual Railway URLs"
echo "  3. Verify all services can access PostgreSQL and Redis"
echo ""
echo "🚀 Next Steps:"
echo "  1. Redeploy all services"
echo "  2. Check build logs for any errors"
echo "  3. Update URLs with actual Railway URLs after deployment"
echo ""
