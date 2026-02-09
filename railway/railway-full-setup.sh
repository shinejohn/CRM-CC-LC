#!/bin/bash

#===============================================================================
# Railway Complete Setup Script (Learning Center Platform)
# Sets ALL environment variables and connections via CLI
#===============================================================================

set -e

#===============================================================================
# CONFIGURATION - UPDATE THESE BEFORE RUNNING
#===============================================================================

# Project name
PROJECT_NAME="Command Center" # Updated based on screenshot

# Service names (Exact matches from screenshot)
SERVICE_POSTGRES="Postgres CC CRM SMB"
SERVICE_REDIS="Redis CC"
SERVICE_API="CC API"
SERVICE_WORKER="CRM-CC-LC Queues"
SERVICE_SCHEDULER="CC-CRM-LC Scheduler"
SERVICE_FRONTEND="CC-CRM-LC-FOA"

#===============================================================================
# Colors
#===============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_section() { 
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

#===============================================================================
# Prerequisites Check
#===============================================================================

check_prerequisites() {
    log_section "Checking Prerequisites"
    
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found"
        echo "Install with: npm install -g @railway/cli"
        exit 1
    fi
    log_success "Railway CLI installed"
    
    if ! railway whoami &> /dev/null; then
        log_error "Not logged in to Railway"
        echo "Run: railway login"
        exit 1
    fi
    log_success "Railway CLI authenticated"
    
    if ! command -v openssl &> /dev/null; then
        log_error "openssl not found (needed for APP_KEY generation)"
        exit 1
    fi
    log_success "openssl available"
}

#===============================================================================
# Link to Project
#===============================================================================

link_project() {
    log_section "Linking to Project: $PROJECT_NAME"
    
    # Try to link if not already linked involves finding the project ID
    # Since we might already be linked, we just check status
    if railway status &> /dev/null; then
        log_success "Already linked to a project"
    else
        log_info "Attempting to link to '$PROJECT_NAME'..."
        # Note: railway link by name is interactive or ID based. 
        # We assume the user has run 'railway link' manually if this fails.
        railway link || {
            log_warn "Could not auto-link. Please run 'railway link' manually first."
            exit 1
        }
    fi
}

#===============================================================================
# Generate Keys
#===============================================================================

generate_app_key() {
    echo "base64:$(openssl rand -base64 32)"
}

#===============================================================================
# Set Variables for a Service
# Usage: set_vars "ServiceName" "KEY1=value1" "KEY2=value2" ...
#===============================================================================

set_vars() {
    local service="$1"
    shift
    
    log_info "Setting variables for: $service"
    
    # Build the command using array to avoid eval/escaping issues
    local cmd=(railway variables)
    
    for var in "$@"; do
        cmd+=( --set "$var" )
    done
    
    cmd+=( --service "$service" )
    
    # Execute array
    if "${cmd[@]}" > /dev/null; then
        log_success "$service - variables set"
    else
        log_warn "$service - could not set variables"
        echo "Command failed: ${cmd[*]}"
    fi
}

#===============================================================================
# Laravel App Services Configuration
#===============================================================================

setup_laravel_services() {
    log_section "Configuring Laravel Application Services"
    
    # Generate APP_KEY only if you want to rotate it. 
    # For now, we generate one. Users can override if they want stability across runs.
    APP_KEY=$(generate_app_key)
    log_info "Generated APP_KEY: ${APP_KEY:0:20}..."
    
    # Common variables shared by all Laravel services
    # We reference the Database services by their EXACT names in the screenshot.
    COMMON_VARS=(
        "APP_NAME=CommandCenter"
        "APP_ENV=production"
        "APP_DEBUG=false"
        "APP_KEY=$APP_KEY"
        "APP_TIMEZONE=UTC"
        
        "LOG_CHANNEL=stderr"
        "LOG_LEVEL=info"
        "LOG_STACK=single"
        
        # Database Connection - Referencing "Postgres CC CRM SMB"
        "DB_CONNECTION=pgsql"
        "DB_HOST=\${{Postgres CC CRM SMB.PGHOST}}"
        "DB_PORT=\${{Postgres CC CRM SMB.PGPORT}}"
        "DB_DATABASE=\${{Postgres CC CRM SMB.PGDATABASE}}"
        "DB_USERNAME=\${{Postgres CC CRM SMB.PGUSER}}"
        "DB_PASSWORD=\${{Postgres CC CRM SMB.PGPASSWORD}}"
        
        # Redis Connection - Referencing "Redis CC"
        "REDIS_HOST=\${{Redis CC.REDISHOST}}"
        "REDIS_PORT=\${{Redis CC.REDISPORT}}"
        "REDIS_PASSWORD=\${{Redis CC.REDISPASSWORD}}"
        
        # Cache / Queue / Session
        "CACHE_DRIVER=redis"
        "SESSION_DRIVER=redis"
        "QUEUE_CONNECTION=redis"
        "FILESYSTEM_DISK=local"
        
        # AI Gateway (Placeholder)
        "AI_GATEWAY_URL=https://ai-gateway.fibonacco.com"
    )
    
    # API Backend
    log_info "Configuring $SERVICE_API..."
    set_vars "$SERVICE_API" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://\${{RAILWAY_PUBLIC_DOMAIN}}" \
        "HORIZON_PREFIX=cc_crm_"
    
    # Queue Worker
    log_info "Configuring $SERVICE_WORKER..."
    set_vars "$SERVICE_WORKER" \
        "${COMMON_VARS[@]}"
    
    # Scheduler
    log_info "Configuring $SERVICE_SCHEDULER..."
    set_vars "$SERVICE_SCHEDULER" \
        "${COMMON_VARS[@]}"
}

#===============================================================================
# Frontend Configuration
#===============================================================================

setup_frontend() {
    log_section "Configuring Frontend"
    
    log_info "Configuring $SERVICE_FRONTEND..."
    set_vars "$SERVICE_FRONTEND" \
        "VITE_API_URL=https://\${{CC API.RAILWAY_PUBLIC_DOMAIN}}/api" \
        "NODE_ENV=production"
}

#===============================================================================
# Main
#===============================================================================

main() {
    check_prerequisites
    link_project
    
    # Note: We skipped setup_databases() to avoid resetting passwords on existing DBs
    # We only configure the App Services to connect to them.
    
    setup_laravel_services
    setup_frontend
    
    log_section "SETUP COMPLETE"
    echo "Environment variables updated for App Services."
}

main "$@"
