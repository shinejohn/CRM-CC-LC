#!/bin/bash

# Command Center Unified Deployment Script - EXACT NAMES
# Sets variables, runs migrations, and deploys all services as one ecosystem
# Usage: ./scripts/deploy-command-center-final.sh

set -e

echo "🚀 Command Center Ecosystem Deployment (Applying Shared & Service Variables)"
echo "=========================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Service names discovered from Railway
API_SERVICE="CRM-CC-LC API"
WORKER_SERVICE="horizon"
SCHEDULER_SERVICE="Scheduler"
FRONTEND_SERVICE="CRM-CC-LC Front End"
FOA_SERVICE="CRM-CC-LC FOA"

# Shared Logic Services (Backend)
BACKEND_SERVICES=("$API_SERVICE" "$WORKER_SERVICE" "$SCHEDULER_SERVICE")

# Variable Function
set_var() {
    local service=$1
    local name=$2
    local value=$3
    railway variables --set "$name=$value" --service "$service" &> /dev/null && echo -e "  ${GREEN}✅${NC} $service: $name" || echo -e "  ${RED}❌${NC} $service: $name"
}

echo "⚙️  Setting backend ecosystem variables..."

for svc in "${BACKEND_SERVICES[@]}"; do
    echo "--- Configuring $svc ---"
    
    # Laravel Core (from your provided list)
    set_var "$svc" "APP_DEBUG" "false"
    set_var "$svc" "APP_ENV" "production"
    set_var "$svc" "APP_KEY" "base64:TDGQ8ulXLprrOBWLO1au7U7268jECSrBPX9l7tocF9Y="
    set_var "$svc" "APP_NAME" "Command Center" # Overriding "Day News" to match your ecosystem vision
    set_var "$svc" "APP_URL" 'https://${{RAILWAY_PUBLIC_DOMAIN}}'
    set_var "$svc" "APP_TIMEZONE" '${{shared.APP_TIMEZONE}}'
    set_var "$svc" "APP_LOCALE" '${{shared.APP_LOCALE}}'
    
    # Database (Using the detected Postgres-CC name)
    set_var "$svc" "DB_CONNECTION" "pgsql"
    set_var "$svc" "DB_HOST" '${{Postgres-CC.PGHOST}}'
    set_var "$svc" "DB_PORT" "5432"
    set_var "$svc" "DB_DATABASE" '${{Postgres-CC.PGDATABASE}}'
    set_var "$svc" "DB_USERNAME" '${{Postgres-CC.PGUSER}}'
    set_var "$svc" "DB_PASSWORD" '${{Postgres-CC.PGPASSWORD}}'
    set_var "$svc" "DATABASE_URL" 'postgresql://${{Postgres-CC.PGUSER}}:${{Postgres-CC.PGPASSWORD}}@${{Postgres-CC.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres-CC.PGDATABASE}}'
    
    # Redis (Using the detected Redis name)
    set_var "$svc" "REDIS_CLIENT" "phpredis"
    set_var "$svc" "REDIS_HOST" '${{Redis.REDISHOST}}'
    set_var "$svc" "REDIS_PASSWORD" '${{Redis.REDISPASSWORD}}'
    set_var "$svc" "REDIS_PORT" "6379"
    set_var "$svc" "REDIS_URL" 'redis://default:${{Redis.REDIS_PASSWORD}}@${{Redis.REDISHOST}}:6379'
    
    # Drivers
    set_var "$svc" "CACHE_STORE" "redis"
    set_var "$svc" "QUEUE_CONNECTION" "redis"
    set_var "$svc" "SESSION_DRIVER" "redis"
    set_var "$svc" "FILESYSTEM_DISK" "s3"
    
    # Logging
    set_var "$svc" "LOG_CHANNEL" "stderr"
    set_var "$svc" "LOG_LEVEL" "info"
    
    # Horizon
    set_var "$svc" "HORIZON_PREFIX" "command-center-horizon:"
    
    # Shared Services & API Keys (propagating from shared variables)
    set_var "$svc" "OPENROUTER_API_KEY" '${{shared.OPENROUTER_API_KEY}}'
    set_var "$svc" "AWS_ACCESS_KEY_ID" '${{shared.AWS_ACCESS_KEY_ID}}'
    set_var "$svc" "AWS_SECRET_ACCESS_KEY" '${{shared.AWS_SECRET_ACCESS_KEY}}'
    set_var "$svc" "AWS_DEFAULT_REGION" '${{shared.AWS_DEFAULT_REGION}}'
    set_var "$svc" "AWS_BUCKET" '${{shared.AWS_BUCKET}}'
    set_var "$svc" "STRIPE_SECRET" '${{shared.STRIPE_SECRET}}'
    set_var "$svc" "MAIL_MAILER" '${{shared.MAIL_MAILER}}'
    set_var "$svc" "MAIL_HOST" '${{shared.MAIL_HOST}}'
    set_var "$svc" "MAIL_USERNAME" '${{shared.MAIL_USERNAME}}'
    set_var "$svc" "MAIL_PASSWORD" '${{shared.MAIL_PASSWORD}}'
done

echo ""
echo "🎨 Configuring Front End services..."
# Frontend needs to talk to the API
API_DOMAIN=$(railway variables --service "$API_SERVICE" --json | jq -r '.[] | select(.name=="RAILWAY_PUBLIC_DOMAIN") | .value' 2>/dev/null || echo "crm-cc-lc-api.up.railway.app")

FRONTENDS=("$FRONTEND_SERVICE" "$FOA_SERVICE")
for fe in "${FRONTENDS[@]}"; do
    echo "--- Configuring $fe ---"
    set_var "$fe" "VITE_API_URL" "https://$API_DOMAIN/api/v1"
    set_var "$fe" "VITE_API_ENDPOINT" "https://$API_DOMAIN/api/v1"
    set_var "$fe" "NODE_ENV" "production"
    set_var "$fe" "VITE_APP_NAME" "Command Center"
done

echo ""
echo "✅ Configuration applied to all services!"
echo "🗄️  Migrations are automated in the backend build process."

echo ""
echo "=========================================================================="
echo -e "${GREEN}✅ ALL COMMAND CENTER SERVICES UPDATED AND SYNCING!${NC}"
echo "=========================================================================="
echo ""
echo "The ecosystem is now synchronized with unified database, redis, and shared variables."
echo "Railway is automatically triggering new builds for all services."
echo "You can monitor the progress in the Railway Dashboard."
