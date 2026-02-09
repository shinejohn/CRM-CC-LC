#!/bin/bash

#===============================================================================
# Railway Complete Automation (Command Center)
# Master script that runs all setup steps in order
#===============================================================================

set -e

# Configuration
PROJECT_NAME="Command Center" 
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Input Token
API_TOKEN="${1:-$RAILWAY_TOKEN}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           RAILWAY AUTOMATION: COMMAND CENTER                         ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_all_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    local MISSING=0
    
    # Check CLI (should be logged in via 'railway login', NOT env var)
    # We deliberately unset RAILWAY_TOKEN to ensure we check the PERSISTENT login
    unset RAILWAY_TOKEN
    
    if command -v railway &> /dev/null; then
        echo -e "${GREEN}✓${NC} Railway CLI installed"
    else
        echo -e "${RED}✗${NC} Railway CLI not installed"
        MISSING=$((MISSING+1))
    fi
    
    if railway whoami &> /dev/null; then
        echo -e "${GREEN}✓${NC} Railway CLI authenticated (User Session)"
    else
        echo -e "${RED}✗${NC} Railway CLI not logged in (railway login)"
        MISSING=$((MISSING+1))
    fi
    
    # Check API Token availability
    if [ -n "$API_TOKEN" ]; then
        echo -e "${GREEN}✓${NC} API Token provided (for API config)"
    else
        echo -e "${YELLOW}⚠${NC} API Token missing (Full API config will be skipped)"
        echo "   Usage: ./railway-master-setup.sh [token]"
    fi
    
    if [ $MISSING -gt 0 ]; then
        echo -e "${RED}Missing prerequisites. Please fix and retry.${NC}"
        exit 1
    fi
}

run_step() {
    local step_num="$1"
    local step_name="$2"
    local script="$3"
    shift 3
    local args="$@"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  STEP $step_num: $step_name${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/$script" ]; then
        chmod +x "$SCRIPT_DIR/$script"
        "$SCRIPT_DIR/$script" $args
    else
        echo -e "${RED}Script not found: $script${NC}"
        exit 1
    fi
}

#===============================================================================
# Main
#===============================================================================

main() {
    print_banner
    check_all_prerequisites
    
    # Step 1: API Configuration (images, volumes, watch paths)
    if [ -n "$API_TOKEN" ]; then
        # We pass the token via env var specifically for this script
        export RAILWAY_API_TOKEN="$API_TOKEN"
        run_step "1" "Configure via API (images, volumes, watch paths)" "railway-configure-api.sh" "$PROJECT_NAME"
        unset RAILWAY_API_TOKEN
    else
        echo -e "${YELLOW}Skipping API Configuration (Step 1) - No Token Provided${NC}"
    fi
    
    # Step 2: Environment Variables (connections)
    # Ensure RAILWAY_TOKEN is unset so CLI uses the user session
    unset RAILWAY_TOKEN
    run_step "2" "Set Environment Variables (connections)" "railway-full-setup.sh" "$PROJECT_NAME"
    
    # Final summary
    echo ""
    echo -e "${GREEN}Setup Automation Complete!${NC}"
    echo "Next: Connect GitHub repo in Dashboard if not done."
}

main "$@"
