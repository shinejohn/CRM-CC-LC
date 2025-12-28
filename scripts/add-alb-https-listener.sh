#!/bin/bash

# Add HTTPS Listener to ALB with SSL Certificate

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REGION="${AWS_REGION:-us-east-1}"

echo "🔒 Adding HTTPS Listener to ALB..."

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName, 'learning')].LoadBalancerArn" \
  --output text | head -1)

if [ -z "$ALB_ARN" ]; then
    echo -e "${RED}❌ ALB not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found ALB: $ALB_ARN${NC}"

# Get target group
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --load-balancer-arn "$ALB_ARN" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

if [ -z "$TARGET_GROUP_ARN" ] || [ "$TARGET_GROUP_ARN" = "None" ]; then
    echo -e "${RED}❌ Target group not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found target group: $TARGET_GROUP_ARN${NC}"

# Get certificate ARN
if [ -z "$1" ]; then
    echo "Usage: $0 <certificate-arn>"
    echo ""
    echo "Example:"
    echo "  $0 arn:aws:acm:us-east-1:123456789:certificate/abcd-1234"
    exit 1
fi

CERT_ARN="$1"

# Verify certificate exists
CERT_STATUS=$(aws acm describe-certificate \
  --certificate-arn "$CERT_ARN" \
  --region "$REGION" \
  --query 'Certificate.Status' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo -e "${YELLOW}⚠️  Certificate status: $CERT_STATUS${NC}"
    echo -e "${YELLOW}⚠️  Certificate must be ISSUED to use with ALB${NC}"
    read -p "Continue anyway? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        exit 0
    fi
fi

# Check if HTTPS listener already exists
HTTPS_LISTENER=$(aws elbv2 describe-listeners \
  --load-balancer-arn "$ALB_ARN" \
  --query 'Listeners[?Port==`443`].ListenerArn' \
  --output text 2>/dev/null || echo "")

if [ -n "$HTTPS_LISTENER" ]; then
    echo -e "${YELLOW}⚠️  HTTPS listener already exists${NC}"
    read -p "Update existing listener? (y/n): " UPDATE
    if [ "$UPDATE" = "y" ]; then
        aws elbv2 modify-listener \
          --listener-arn "$HTTPS_LISTENER" \
          --certificates "CertificateArn=$CERT_ARN" \
          --default-actions "Type=forward,TargetGroupArn=$TARGET_GROUP_ARN"
        echo -e "${GREEN}✅ Updated HTTPS listener${NC}"
    fi
else
    # Create HTTPS listener
    aws elbv2 create-listener \
      --load-balancer-arn "$ALB_ARN" \
      --protocol HTTPS \
      --port 443 \
      --certificates "CertificateArn=$CERT_ARN" \
      --default-actions "Type=forward,TargetGroupArn=$TARGET_GROUP_ARN"
    
    echo -e "${GREEN}✅ Created HTTPS listener on port 443${NC}"
fi

# Optionally redirect HTTP to HTTPS
HTTP_LISTENER=$(aws elbv2 describe-listeners \
  --load-balancer-arn "$ALB_ARN" \
  --query 'Listeners[?Port==`80`].ListenerArn' \
  --output text 2>/dev/null || echo "")

if [ -n "$HTTP_LISTENER" ]; then
    echo ""
    read -p "Redirect HTTP (80) to HTTPS (443)? (y/n): " REDIRECT
    if [ "$REDIRECT" = "y" ]; then
        aws elbv2 modify-listener \
          --listener-arn "$HTTP_LISTENER" \
          --default-actions "Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
        echo -e "${GREEN}✅ Configured HTTP to HTTPS redirect${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ HTTPS listener configured!${NC}"
