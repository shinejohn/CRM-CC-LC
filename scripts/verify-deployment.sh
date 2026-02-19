#!/bin/bash
# ==============================================================================
# Deployment Verification Script
# Verifies API health, frontend reachability, and optionally monitors Railway logs
# Usage: ./scripts/verify-deployment.sh [--logs SERVICE_NAME]
# ==============================================================================

set -e

API_URL="${API_URL:-https://cc-api.up.railway.app}"
FRONTEND_URLS=(
  "https://cc-crm-lc-foa-front.up.railway.app"
  "https://crm-cc-lc-foa-front.up.railway.app"
  "https://cc-front.up.railway.app"
  "https://crm-cc-lc-front-end.up.railway.app"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Deployment Verification${NC}"
echo "================================"
echo ""

# 1. API Health
echo -e "${YELLOW}1. API Health Check${NC}"
if response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health"); then
  if [ "$response" = "200" ]; then
    body=$(curl -s "$API_URL/health")
    echo -e "${GREEN}✅ API healthy${NC} ($API_URL/health)"
    echo "   Response: $body"
  else
    echo -e "${RED}❌ API returned HTTP $response${NC}"
  fi
else
  echo -e "${RED}❌ API unreachable${NC}"
fi
echo ""

# 2. Frontend
echo -e "${YELLOW}2. Frontend Reachability${NC}"
found=0
for url in "${FRONTEND_URLS[@]}"; do
  if code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null); then
    if [ "$code" = "200" ]; then
      echo -e "${GREEN}✅ Frontend reachable: $url${NC}"
      found=1
      break
    fi
  fi
done
if [ $found -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No frontend URL responded with 200. Check Railway Dashboard for your Frontend service's public domain.${NC}"
  echo "   Tried: ${FRONTEND_URLS[*]}"
fi
echo ""

# 3. Railway logs (if service specified)
if [ "$1" = "--logs" ] && [ -n "$2" ]; then
  echo -e "${YELLOW}3. Railway Logs (service: $2)${NC}"
  if command -v railway &> /dev/null; then
    railway logs --service "$2" 2>&1 | tail -50
  else
    echo "Railway CLI not installed. Install: npm install -g @railway/cli"
  fi
else
  echo -e "${YELLOW}3. To monitor logs:${NC}"
  echo "   ./scripts/verify-deployment.sh --logs \"CC API\""
  echo "   ./scripts/verify-deployment.sh --logs \"CC-CRM-LC-FOA Front\""
  echo ""
  echo "   Or link a service first: railway service"
  echo "   Then: railway logs"
fi

echo ""
echo -e "${GREEN}✅ Verification complete${NC}"
