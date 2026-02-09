#!/bin/bash

# ==============================================================================
# 4Healthcare Unified Railway Deployer (The "One Tool")
# ==============================================================================
# This tool is the EXCLUSIVE way to deploy to Railway. It handles validation,
# staging, committing, and execution in one atomic operation.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Railway Unified Deployer starting...${NC}\n"

# 1. PRE-FLIGHT VALIDATION
echo -e "${YELLOW}Phase 1: Guardian Validation${NC}"
if [ ! -f "./scripts/guardian.sh" ]; then
    echo -e "${RED}ERROR: scripts/guardian.sh not found!${NC}"
    exit 1
fi

./scripts/guardian.sh

# 2. GIT STATUS CHECK
echo -e "\n${YELLOW}Phase 2: Repository State${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}Repo is clean. Proceeding to push current HEAD.${NC}"
else
    echo -e "${YELLOW}You have uncommitted changes:${NC}"
    git status -s
    echo -e "\n${BLUE}Enter a commit message (or press Ctrl+C to abort):${NC}"
    read -r commit_message
    
    if [ -z "$commit_message" ]; then
        echo -e "${RED}Commit message cannot be empty.${NC}"
        exit 1
    fi
    
    git add .
    git commit -m "deploy: $commit_message (guardian-validated)"
fi

# 3. ATOMIC DEPLOY
echo -e "\n${YELLOW}Phase 3: Railway Execution${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo -e "Pushing ${BLUE}$CURRENT_BRANCH${NC} to origin..."
git push origin "$CURRENT_BRANCH"

# 4. MONITORING
if command -v railway &> /dev/null; then
    echo -e "\n${GREEN}Push successful! Connecting to Railway for status...${NC}"
    railway status
    echo -e "\n${BLUE}Build started. Follow logs with: ${NC}railway logs"
else
    echo -e "\n${GREEN}Push successful! Monitor build at: ${NC}https://railway.app/dashboard"
fi

echo -e "\n${GREEN}✅ Deployment Flow Complete.${NC}"
