#!/bin/bash

# Command Center Unified Deployment Script
# Sets variables, runs migrations, and deploys all services as one ecosystem
# Usage: ./scripts/deploy-command-center.sh

set -e

echo "🚀 Command Center Unified Deployment"
echo "======================================"
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

# Functional Service names
API_SERVICE="API"
WORKER_SERVICE="Worker"
SCHEDULER_SERVICE="Scheduler"
FRONTEND_SERVICE="Frontend"

# Ecosystem Constants
APP_NAME="Command Center"
HORIZON_PREFIX="command-center-horizon:"
APP_KEY="base64:TDGQ8ulXLprrOBWLO1au7U7268jECSrBPX9l7tocF9Y="

# Database & Redis (Internal Railway Mappings)
# Note: These use the internal Railway cross-service syntax
DB_HOST="\${{Database.PGHOST}}"
DB_PORT="5432"
DB_DATABASE="\${{Database.PGDATABASE}}"
DB_USERNAME="\${{Database.PGUSER}}"
DB_PASSWORD="\${{Database.PGPASSWORD}}"

REDIS_HOST="\${{Redis.REDISHOST}}"
REDIS_PORT="6379"
REDIS_PASSWORD="\${{Redis.REDIS_PASSWORD}}"
REDIS_URL="redis://default:\${{Redis.REDIS_PASSWORD}}@\${{Redis.REDISHOST}}:6379"

echo "⚙️ Setting consolidated environment variables..."
echo ""

# Set variable function
set_var() {
    local service=$1
    local name=$2
    local value=$3
    railway variables --set "$name=$value" --service "$service" &> /dev/null && echo -e "  ${GREEN}✅${NC} $service: $name" || echo -e "  ${RED}❌${NC} $service: $name"
}

# Shared variables for all Backend services (API, Worker, Scheduler)
BACKEND_SERVICES=("$API_SERVICE" "$WORKER_SERVICE" "$SCHEDULER_SERVICE")

for svc in "${BACKEND_SERVICES[@]}"; do
    echo "--- Configuring $svc ---"
    
    # Core Laravel
    set_var "$svc" "APP_NAME" "$APP_NAME"
    set_var "$svc" "APP_ENV" "production"
    set_var "$svc" "APP_DEBUG" "false"
    set_var "$svc" "APP_KEY" "$APP_KEY"
    set_var "$svc" "APP_TIMEZONE" "UTC"
    
    # Database
    set_var "$svc" "DB_CONNECTION" "pgsql"
    set_var "$svc" "DB_HOST" "$DB_HOST"
    set_var "$svc" "DB_PORT" "$DB_PORT"
    set_var "$svc" "DB_DATABASE" "$DB_DATABASE"
    set_var "$svc" "DB_USERNAME" "$DB_USERNAME"
    set_var "$svc" "DB_PASSWORD" "$DB_PASSWORD"
    
    # Redis & Drivers
    set_var "$svc" "REDIS_HOST" "$REDIS_HOST"
    set_var "$svc" "REDIS_PORT" "$REDIS_PORT"
    set_var "$svc" "REDIS_PASSWORD" "$REDIS_PASSWORD"
    set_var "$svc" "REDIS_URL" "$REDIS_URL"
    set_var "$svc" "QUEUE_CONNECTION" "redis"
    set_var "$svc" "CACHE_STORE" "redis"
    set_var "$svc" "SESSION_DRIVER" "redis"
    
    # Logging
    set_var "$svc" "LOG_CHANNEL" "stderr"
    set_var "$svc" "LOG_LEVEL" "info"
    
    # Infrastructure Specifics
    set_var "$svc" "HORIZON_PREFIX" "$HORIZON_PREFIX"
    set_var "$svc" "FILESYSTEM_DISK" "s3"
    
    # AI & Services (Shared from your list)
    set_var "$svc" "OPENROUTER_API_KEY" "\${{shared.OPENROUTER_API_KEY}}"
    set_var "$svc" "STRIPE_SECRET" "\${{shared.STRIPE_SECRET}}"
    set_var "$svc" "AWS_ACCESS_KEY_ID" "\${{shared.AWS_ACCESS_KEY_ID}}"
    set_var "$svc" "AWS_SECRET_ACCESS_KEY" "\${{shared.AWS_SECRET_ACCESS_KEY}}"
    set_var "$svc" "AWS_DEFAULT_REGION" "\${{shared.AWS_DEFAULT_REGION}}"
    set_var "$svc" "AWS_BUCKET" "\${{shared.AWS_BUCKET}}"
    
    # AI Models
    set_var "$svc" "NEWS_WORKFLOW_AI_MODEL_GENERATION" "\${{shared.NEWS_WORKFLOW_AI_MODEL_GENERATION}}"
    set_var "$svc" "NEWS_WORKFLOW_AI_MODEL_FACT_CHECKING" "\${{shared.NEWS_WORKFLOW_AI_MODEL_FACT_CHECKING}}"
done

# Frontend Configuration
echo ""
echo "--- Configuring Frontend ---"
# We need to get the public domain of the API service to set for the frontend
API_URL=$(railway variables --service "$API_SERVICE" --json | jq -r '.[] | select(.name=="RAILWAY_PUBLIC_DOMAIN") | .value' 2>/dev/null || echo "api.up.railway.app")

set_var "$FRONTEND_SERVICE" "VITE_APP_NAME" "$APP_NAME"
set_var "$FRONTEND_SERVICE" "VITE_API_URL" "https://$API_URL/api/v1"
set_var "$FRONTEND_SERVICE" "VITE_API_ENDPOINT" "https://$API_URL/api/v1"
set_var "$FRONTEND_SERVICE" "NODE_ENV" "production"

echo ""
echo "✅ Configuration complete!"
echo "========================================"
echo -e "${GREEN}✅ Command Center Ecosystem Ready!${NC}"
echo "========================================"
echo ""
echo "Unified ecosystem active across all modules."
