#!/bin/bash

# ==============================================================================
# 4Healthcare Guardian - Pre-Flight Deployment Validator
# ==============================================================================
# This script ensures that the codebase is in a deployable state before pushing
# to Railway. It targets configuration, dependencies, and environment variables.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛡️  4Healthcare Guardian starting validation...${NC}\n"

# 1. Check for Nixpacks CLI
if ! command -v nixpacks &> /dev/null
then
    echo -e "${YELLOW}⚠️  nixpacks CLI not found. Skipping build plan validation.${NC}"
    echo -e "   Recommended: ${NC}curl -sSL https://nixpacks.com/install.sh | bash\n"
    HAS_NIXPACKS=false
else
    HAS_NIXPACKS=true
fi

# 2. Validate Backend (Laravel)
echo -e "📂 Validating Backend..."
cd backend

# 2a. Check PHP Syntax
echo -n "  - Linting PHP files... "
if find . -name "*.php" ! -path "./vendor/*" -exec php -l {} \; | grep "No syntax errors detected" > /dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    exit 1
fi

# 2b. Check nixpacks.toml syntax
echo -n "  - Checking nixpacks.toml... "
if [ -f "nixpacks.toml" ]; then
    # Simple check for the "composer" error we just had
    if grep -q "\"composer\"" nixpacks.toml; then
        echo -e "${RED}ERROR: 'composer' found in nixPkgs. Nixpacks handles composer automatically.${NC}"
        exit 1
    fi
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}MISSING (Standard Nixpacks build will be used)${NC}"
fi

# 2c. Check Env Varsity Sync
echo -n "  - Checking .env.example symmetry... "
MISSING_VARS=$(comm -23 <(grep -v '^#' .env.example | cut -d= -f1 | sort | uniq) <(grep -v '^#' .env | cut -d= -f1 | sort | uniq))
if [ -z "$MISSING_VARS" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING: Vars in .env.example missing from .env:${NC}"
    echo "$MISSING_VARS"
fi

# 2d. Nixpacks Plan Validation
if [ "$HAS_NIXPACKS" = true ]; then
    echo -n "  - Simulating Nixpacks build plan... "
    if nixpacks plan . > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC} (Check nixpacks plan . manually)"
        exit 1
    fi
fi

cd ..

# 3. Validate Frontend (if applicable)
if [ -d "src" ]; then
    echo -e "\n📂 Validating Frontend..."
    # Check if package.json has errors
    if [ -f "package.json" ]; then
        echo -n "  - Checking package.json... "
        if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED (Invalid JSON)${NC}"
            exit 1
        fi
    fi
fi

echo -e "\n${GREEN}✅ Guardian: All systems ready for deployment.${NC}"
