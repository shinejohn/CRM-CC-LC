#!/bin/bash

#===============================================================================
# Railway API Configuration Script (Command Center)
# Sets Docker images, volumes, and watch paths via GraphQL API
#
# Usage:
#   export RAILWAY_TOKEN="your-token"
#   ./railway-configure-api.sh [project-name]
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_NAME="${1:-Command Center}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

#===============================================================================
# Service Names (From Screenshot)
#===============================================================================
SERVICE_POSTGRES="Postgres CC CRM SMB"
SERVICE_REDIS="Redis CC"
SERVICE_API="CC API"
SERVICE_WORKER="CRM-CC-LC Queues"
SERVICE_SCHEDULER="CC-CRM-LC Scheduler"
SERVICE_FRONTEND="CC-CRM-LC-FOA" # Matches screenshot

#===============================================================================
# Preflight Checks
#===============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           RAILWAY API CONFIGURATION (COMMAND CENTER)         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check for RAILWAY_API_TOKEN first, then RAILWAY_TOKEN
TOKEN="${RAILWAY_API_TOKEN:-$RAILWAY_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERROR: RAILWAY_API_TOKEN or RAILWAY_TOKEN not set${NC}"
    echo "To fix: export RAILWAY_API_TOKEN=\"your-token\""
    exit 1
fi
RAILWAY_TOKEN="$TOKEN"

if ! command -v jq &> /dev/null; then
    echo -e "${RED}ERROR: jq not installed${NC}"
    echo "Install: brew install jq (macOS) or apt install jq (Linux)"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

#===============================================================================
# Helper: Make API Call
#===============================================================================

api_call() {
    local query="$1"
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload"
}

api_mutation() {
    local mutation="$1"
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$mutation"
}

#===============================================================================
# Step 1: Get Project Info
#===============================================================================

echo -e "${BLUE}[1/4] Finding project...${NC}"

#===============================================================================
# Step 1: Get Project Info
#===============================================================================

echo -e "${BLUE}[1/4] Finding project...${NC}"

# User provided Project ID directly
PROJECT_ID="7e7372dd-373a-4e78-a51e-15eab332b67d"
echo -e "${GREEN}✓ Using Project ID: $PROJECT_ID${NC}"

# Get Environment ID
# We need to query the project to get the environment ID.
# Since we have a Project Token, querying the specific project should work.
PROJECT_INFO=$(api_call "query { project(id: \"$PROJECT_ID\") { name environments { edges { node { id name } } } } }")

# Check for errors
if echo "$PROJECT_INFO" | jq -e '.errors' > /dev/null 2>&1; then
    echo -e "${RED}Error fetching project info:${NC}"
    echo "$PROJECT_INFO" | jq .errors
    exit 1
fi

PROJECT_NAME=$(echo "$PROJECT_INFO" | jq -r ".data.project.name")
ENV_ID=$(echo "$PROJECT_INFO" | jq -r ".data.project.environments.edges[0].node.id")

echo "  Project Name: $PROJECT_NAME"
echo "  Environment ID: $ENV_ID"
echo ""

#===============================================================================
# Step 2: Get Services
#===============================================================================

echo -e "${BLUE}[2/4] Getting services...${NC}"

SERVICES=$(api_call "query { project(id: \"$PROJECT_ID\") { services { edges { node { id name } } } } }")

echo "$SERVICES" | jq -r '.data.project.services.edges[].node | "  - \(.name) (\(.id[0:8])...)"'
echo ""

# Extract service IDs into variables
get_service_id() {
    local name="$1"
    # We use a loose match or exact match? Exact is safer.
    # Note: If name in script doesn't match railway, this returns null
    echo "$SERVICES" | jq -r ".data.project.services.edges[] | select(.node.name == \"$name\") | .node.id"
}

# Try to find services with fuzzy matching if exact fails? No, simpler to be exact.
# If these fail, we'll print a warning.
POSTGRES_ID=$(get_service_id "$SERVICE_POSTGRES")
REDIS_ID=$(get_service_id "$SERVICE_REDIS")
API_ID=$(get_service_id "$SERVICE_API")
WORKER_ID=$(get_service_id "$SERVICE_WORKER")
SCHEDULER_ID=$(get_service_id "$SERVICE_SCHEDULER")
FRONTEND_ID=$(get_service_id "$SERVICE_FRONTEND")

# Fallback: If "CC-CRM-LC-FOA Front End" isn't found, look for *any* service starting with "CC-CRM-LC-FOA"
if [ -z "$FRONTEND_ID" ] || [ "$FRONTEND_ID" = "null" ]; then
   FRONTEND_ID=$(echo "$SERVICES" | jq -r ".data.project.services.edges[] | select(.node.name | startswith(\"CC-CRM-LC-FOA Front\")) | .node.id")
   if [ -n "$FRONTEND_ID" ] && [ "$FRONTEND_ID" != "null" ]; then
       echo "  (Found Frontend via prefix match)"
   fi
fi


#===============================================================================
# Step 3: Configure Databases (Images)
#===============================================================================

echo -e "${BLUE}[3/4] Configuring database services...${NC}"
echo ""

configure_image() {
    local service_id="$1"
    local service_name="$2"
    local image="$3"
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name ($2): Service not found, skipping${NC}"
        return
    fi
    
    echo -n "  $service_name → $image ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$ENV_ID\", input: { source: { image: \"$image\" } }) }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    elif echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message' | head -1 | sed 's/^/    /'
    else
        echo -e "${YELLOW}UNKNOWN${NC}"
    fi
}

configure_volume() {
    local service_id="$1"
    local service_name="$2"
    local mount_path="$3"
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        return
    fi
    
    echo -n "  $service_name → volume at $mount_path ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { volumeCreate(input: { projectId: \"$PROJECT_ID\", environmentId: \"$ENV_ID\", serviceId: \"$service_id\", mountPath: \"$mount_path\" }) { id } }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.volumeCreate.id' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    elif echo "$result" | grep -qi "already exists\|duplicate\|unique"; then
        echo -e "${GREEN}ALREADY EXISTS${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null | head -1 | sed 's/^/    /'
    fi
}

echo "Setting Docker images..."
configure_image "$POSTGRES_ID" "$SERVICE_POSTGRES" "postgres:16-alpine"
configure_image "$REDIS_ID" "$SERVICE_REDIS" "redis:7-alpine"

echo ""
echo "Creating volumes..."
configure_volume "$POSTGRES_ID" "$SERVICE_POSTGRES" "/var/lib/postgresql/data"
configure_volume "$REDIS_ID" "$SERVICE_REDIS" "/data"

echo ""

#===============================================================================
# Step 4: Configure App Services (Watch Paths, Commands)
#===============================================================================

echo -e "${BLUE}[4/4] Configuring app services...${NC}"
echo ""

configure_app() {
    local service_id="$1"
    local service_name="$2"
    local build_cmd="$3"
    local start_cmd="$4"
    shift 4
    local watch_paths=("$@")
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name ($2): Service not found, skipping${NC}"
        return
    fi
    
    echo "  $service_name:"
    
    # Build watch paths JSON array
    local paths_json="["
    local first=true
    for path in "${watch_paths[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            paths_json="$paths_json,"
        fi
        paths_json="$paths_json\"$path\""
    done
    paths_json="$paths_json]"
    
    # Escape commands for JSON
    build_cmd=$(echo "$build_cmd" | sed 's/"/\\"/g')
    start_cmd=$(echo "$start_cmd" | sed 's/"/\\"/g')
    
    echo -n "    Watch paths (${#watch_paths[@]}) ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$ENV_ID\", input: { watchPatterns: $paths_json, buildCommand: \"$build_cmd\", startCommand: \"$start_cmd\" }) }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null | head -1 | sed 's/^/      /'
    fi
}

#===============================================================================
# Helper: Set Environment Variables via API
#===============================================================================

set_variables() {
    local service_id="$1"
    local service_name="$2"
    shift 2
    # remaining args are VAR=VAL
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name: Service not found, skipping variables${NC}"
        return
    fi
    
    echo "  Setting variables for $service_name..."
    
    # Construct JSON object for variables
    # We need to build: { "KEY": "VAL", "KEY2": "VAL2" }
    local json_vars="{"
    local first=true
    
    for pair in "$@"; do
        if [ "$first" = true ]; then
            first=false
        else
            json_vars="$json_vars,"
        fi
        
        local key="${pair%%=*}"
        local val="${pair#*=}"
        # Escape backslashes and quotes
        val=$(echo "$val" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
        
        json_vars="$json_vars \"$key\": \"$val\""
    done
    json_vars="$json_vars }"
    
    # Mutation for variableCollectionUpsert
    local mutation="mutation { variableCollectionUpsert(input: { projectId: \"$PROJECT_ID\", environmentId: \"$ENV_ID\", serviceId: \"$service_id\", variables: $json_vars }) }"
    
    # We use a custom formatted payload to handle the JSON nesting correctly
    local json_payload=$(jq -n \
                  --arg q "$mutation" \
                  '{query: $q}')

    # Execute manually to handle complex quoting
    local result=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
        
    if echo "$result" | jq -e '.data.variableCollectionUpsert == true' > /dev/null 2>&1; then
        echo -e "${GREEN}    OK${NC}"
    else
        echo -e "${RED}    FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null | head -1 | sed 's/^/      /'
    fi
}

#===============================================================================
# Step 5: Configure Environment Variables
#===============================================================================

echo -e "${BLUE}[5/5] Configuring environment variables...${NC}"
echo ""

# Generate APP_KEY if needed (static for now to avoid rotation issues in this script run)
APP_KEY="base64:$(openssl rand -base64 32)"

# Common Laravel Vars
# Note: We use the EXACT service names for reference variables ${{...}}
COMMON_VARS=(
    "APP_NAME=CommandCenter"
    "APP_ENV=production"
    "APP_DEBUG=false"
    "APP_KEY=$APP_KEY"
    "APP_TIMEZONE=UTC"
    "LOG_CHANNEL=stderr"
    "LOG_LEVEL=info"
    "DB_CONNECTION=pgsql"
    "DB_HOST=\${{Postgres CC CRM SMB.PGHOST}}"
    "DB_PORT=\${{Postgres CC CRM SMB.PGPORT}}"
    "DB_DATABASE=\${{Postgres CC CRM SMB.PGDATABASE}}"
    "DB_USERNAME=\${{Postgres CC CRM SMB.PGUSER}}"
    "DB_PASSWORD=\${{Postgres CC CRM SMB.PGPASSWORD}}"
    "REDIS_HOST=\${{Redis CC.REDISHOST}}"
    "REDIS_PORT=\${{Redis CC.REDISPORT}}"
    "REDIS_PASSWORD=\${{Redis CC.REDISPASSWORD}}"
    "CACHE_DRIVER=redis"
    "SESSION_DRIVER=redis"
    "QUEUE_CONNECTION=redis"
    "FILESYSTEM_DISK=local"
    "AI_GATEWAY_URL=https://ai-gateway.fibonacco.com"
)

# API Backend
configure_app "$API_ID" "$SERVICE_API" \
    "composer install --no-dev --optimize-autoloader" \
    "php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "backend/**" \
    "composer.json" \
    "composer.lock"

set_variables "$API_ID" "$SERVICE_API" \
    "${COMMON_VARS[@]}" \
    "APP_URL=https://\${{RAILWAY_PUBLIC_DOMAIN}}" \
    "HORIZON_PREFIX=cc_crm_"

# Queue Worker
configure_app "$WORKER_ID" "$SERVICE_WORKER" \
    "composer install --no-dev --optimize-autoloader" \
    "php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600" \
    "backend/**" \
    "composer.json" \
    "composer.lock"

set_variables "$WORKER_ID" "$SERVICE_WORKER" \
    "${COMMON_VARS[@]}"

# Scheduler
configure_app "$SCHEDULER_ID" "$SERVICE_SCHEDULER" \
    "composer install --no-dev --optimize-autoloader" \
    "php artisan schedule:work" \
    "backend/**" \
    "composer.json" \
    "composer.lock"

set_variables "$SCHEDULER_ID" "$SERVICE_SCHEDULER" \
    "${COMMON_VARS[@]}"

# Frontend
configure_app "$FRONTEND_ID" "$SERVICE_FRONTEND" \
    "npm ci && npm run build" \
    "npx serve -s dist -l \$PORT" \
    "src/**" \
    "public/**" \
    "index.html" \
    "vite.config.ts" \
    "package.json"

set_variables "$FRONTEND_ID" "$SERVICE_FRONTEND" \
    "VITE_API_URL=https://\${{CC API.RAILWAY_PUBLIC_DOMAIN}}/api" \
    "NODE_ENV=production"

echo ""

#===============================================================================
# Summary
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}API Configuration & Variables Complete!${NC}"
echo ""
