#!/bin/bash

# DNS and SSL Setup Script
# Interactive script to set up custom domain and SSL certificates

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 DNS and SSL/TLS Setup Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check AWS CLI
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}❌ AWS CLI not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"
echo ""

# Get user input
read -p "Enter your root domain (e.g., fibonacco.com): " ROOT_DOMAIN
read -p "Enter frontend subdomain (e.g., learning): " FRONTEND_SUBDOMAIN
read -p "Enter API subdomain (e.g., api): " API_SUBDOMAIN

FRONTEND_DOMAIN="$FRONTEND_SUBDOMAIN.$ROOT_DOMAIN"
API_DOMAIN="$API_SUBDOMAIN.$ROOT_DOMAIN"

echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Root Domain: $ROOT_DOMAIN"
echo "  Frontend: $FRONTEND_DOMAIN"
echo "  API: $API_DOMAIN"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""

# Step 1: Check/Create Hosted Zone
echo -e "${BLUE}Step 1: Setting up Route53 Hosted Zone...${NC}"

ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='$ROOT_DOMAIN.'].Id" \
  --output text 2>/dev/null | cut -d'/' -f3 || echo "")

if [ -z "$ZONE_ID" ]; then
    echo -e "${YELLOW}⚠️  Hosted zone not found. Creating...${NC}"
    
    CALLER_REF="zone-$(date +%s)"
    ZONE_OUTPUT=$(aws route53 create-hosted-zone \
      --name "$ROOT_DOMAIN" \
      --caller-reference "$CALLER_REF" \
      --output json)
    
    ZONE_ID=$(echo "$ZONE_OUTPUT" | jq -r '.HostedZone.Id' | cut -d'/' -f3)
    NAMESERVERS=$(echo "$ZONE_OUTPUT" | jq -r '.DelegationSet.NameServers[]' | tr '\n' ' ')
    
    echo -e "${GREEN}✅ Hosted zone created: $ZONE_ID${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Update your domain registrar with these nameservers:${NC}"
    for ns in $NAMESERVERS; do
        echo "  - $ns"
    done
    echo ""
    read -p "Press Enter after updating nameservers at your registrar..."
else
    echo -e "${GREEN}✅ Found existing hosted zone: $ZONE_ID${NC}"
fi

echo ""

# Step 2: Request ACM Certificates
echo -e "${BLUE}Step 2: Requesting SSL Certificates...${NC}"

# Frontend certificate
echo "Requesting certificate for $FRONTEND_DOMAIN..."
FRONTEND_CERT_ARN=$(aws acm request-certificate \
  --domain-name "$FRONTEND_DOMAIN" \
  --validation-method DNS \
  --region "$REGION" \
  --query CertificateArn \
  --output text 2>/dev/null || \
  aws acm list-certificates \
    --region "$REGION" \
    --query "CertificateSummaryList[?DomainName=='$FRONTEND_DOMAIN'].CertificateArn" \
    --output text | head -1)

if [ -n "$FRONTEND_CERT_ARN" ] && [ "$FRONTEND_CERT_ARN" != "None" ]; then
    echo -e "${GREEN}✅ Frontend certificate: $FRONTEND_CERT_ARN${NC}"
else
    echo -e "${RED}❌ Failed to request frontend certificate${NC}"
    exit 1
fi

# API certificate
echo "Requesting certificate for $API_DOMAIN..."
API_CERT_ARN=$(aws acm request-certificate \
  --domain-name "$API_DOMAIN" \
  --validation-method DNS \
  --region "$REGION" \
  --query CertificateArn \
  --output text 2>/dev/null || \
  aws acm list-certificates \
    --region "$REGION" \
    --query "CertificateSummaryList[?DomainName=='$API_DOMAIN'].CertificateArn" \
    --output text | head -1)

if [ -n "$API_CERT_ARN" ] && [ "$API_CERT_ARN" != "None" ]; then
    echo -e "${GREEN}✅ API certificate: $API_CERT_ARN${NC}"
else
    echo -e "${RED}❌ Failed to request API certificate${NC}"
    exit 1
fi

echo ""

# Step 3: Get Validation Records
echo -e "${BLUE}Step 3: Getting Certificate Validation Records...${NC}"

get_validation_record() {
    local cert_arn=$1
    aws acm describe-certificate \
      --certificate-arn "$cert_arn" \
      --region "$REGION" \
      --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
      --output json 2>/dev/null
}

FRONTEND_VALIDATION=$(get_validation_record "$FRONTEND_CERT_ARN")
API_VALIDATION=$(get_validation_record "$API_CERT_ARN")

if [ -z "$FRONTEND_VALIDATION" ] || [ "$FRONTEND_VALIDATION" = "null" ]; then
    echo -e "${YELLOW}⚠️  Frontend validation record not ready yet. Waiting 10 seconds...${NC}"
    sleep 10
    FRONTEND_VALIDATION=$(get_validation_record "$FRONTEND_CERT_ARN")
fi

FRONTEND_VAL_NAME=$(echo "$FRONTEND_VALIDATION" | jq -r '.Name')
FRONTEND_VAL_VALUE=$(echo "$FRONTEND_VALIDATION" | jq -r '.Value')

API_VAL_NAME=$(echo "$API_VALIDATION" | jq -r '.Name')
API_VAL_VALUE=$(echo "$API_VALIDATION" | jq -r '.Value')

echo "Frontend validation record:"
echo "  Name: $FRONTEND_VAL_NAME"
echo "  Value: $FRONTEND_VAL_VALUE"
echo ""
echo "API validation record:"
echo "  Name: $API_VAL_NAME"
echo "  Value: $API_VAL_VALUE"
echo ""

# Step 4: Add Validation Records to Route53
echo -e "${BLUE}Step 4: Adding Validation Records to Route53...${NC}"

create_validation_record() {
    local name=$1
    local value=$2
    local zone_id=$3
    
    aws route53 change-resource-record-sets \
      --hosted-zone-id "$zone_id" \
      --change-batch "{
        \"Changes\": [{
          \"Action\": \"UPSERT\",
          \"ResourceRecordSet\": {
            \"Name\": \"$name\",
            \"Type\": \"CNAME\",
            \"TTL\": 300,
            \"ResourceRecords\": [{\"Value\": \"$value\"}]
          }
        }]
      }" &>/dev/null
}

create_validation_record "$FRONTEND_VAL_NAME" "$FRONTEND_VAL_VALUE" "$ZONE_ID"
echo -e "${GREEN}✅ Added frontend validation record${NC}"

create_validation_record "$API_VAL_NAME" "$API_VAL_VALUE" "$ZONE_ID"
echo -e "${GREEN}✅ Added API validation record${NC}"

echo ""
echo -e "${YELLOW}⏳ Waiting for certificate validation (this may take 5-30 minutes)...${NC}"
echo "   You can check status with:"
echo "   aws acm describe-certificate --certificate-arn $FRONTEND_CERT_ARN --region $REGION --query 'Certificate.Status'"
echo ""

read -p "Wait for validation or continue with DNS setup? (w/c): " WAIT_OR_CONTINUE

if [ "$WAIT_OR_CONTINUE" = "w" ]; then
    echo "Waiting for certificates to validate..."
    MAX_WAIT=1800  # 30 minutes
    ELAPSED=0
    
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        FRONTEND_STATUS=$(aws acm describe-certificate \
          --certificate-arn "$FRONTEND_CERT_ARN" \
          --region "$REGION" \
          --query 'Certificate.Status' \
          --output text)
        
        API_STATUS=$(aws acm describe-certificate \
          --certificate-arn "$API_CERT_ARN" \
          --region "$REGION" \
          --query 'Certificate.Status' \
          --output text)
        
        echo "  Frontend: $FRONTEND_STATUS | API: $API_STATUS"
        
        if [ "$FRONTEND_STATUS" = "ISSUED" ] && [ "$API_STATUS" = "ISSUED" ]; then
            echo -e "${GREEN}✅ Certificates validated!${NC}"
            break
        fi
        
        sleep 30
        ELAPSED=$((ELAPSED + 30))
    done
fi

echo ""

# Step 5: Get CloudFront and ALB Info
echo -e "${BLUE}Step 5: Getting CloudFront and ALB Information...${NC}"

# Get CloudFront distribution
CLOUDFRONT_DIST=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].[Id,DomainName]" \
  --output text 2>/dev/null || echo "")

if [ -n "$CLOUDFRONT_DIST" ]; then
    CLOUDFRONT_ID=$(echo "$CLOUDFRONT_DIST" | awk '{print $1}')
    CLOUDFRONT_DOMAIN=$(echo "$CLOUDFRONT_DIST" | awk '{print $2}')
    echo -e "${GREEN}✅ CloudFront: $CLOUDFRONT_DOMAIN (ID: $CLOUDFRONT_ID)${NC}"
else
    echo -e "${RED}❌ CloudFront distribution not found${NC}"
    read -p "Enter CloudFront domain manually: " CLOUDFRONT_DOMAIN
    read -p "Enter CloudFront ID manually: " CLOUDFRONT_ID
fi

# Get ALB
ALB_INFO=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName, 'learning')].[LoadBalancerArn,DNSName]" \
  --output text 2>/dev/null | head -1 || echo "")

if [ -n "$ALB_INFO" ]; then
    ALB_ARN=$(echo "$ALB_INFO" | awk '{print $1}')
    ALB_DNS=$(echo "$ALB_INFO" | awk '{print $2}')
    echo -e "${GREEN}✅ ALB: $ALB_DNS${NC}"
else
    echo -e "${RED}❌ ALB not found${NC}"
    read -p "Enter ALB DNS manually: " ALB_DNS
fi

echo ""

# Step 6: Create DNS Records
echo -e "${BLUE}Step 6: Creating DNS Records...${NC}"

# CloudFront alias (A record)
CLOUDFRONT_ZONE_ID="Z2FDTNDATAQYW2"
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$FRONTEND_DOMAIN\",
        \"Type\": \"A\",
        \"AliasTarget\": {
          \"HostedZoneId\": \"$CLOUDFRONT_ZONE_ID\",
          \"DNSName\": \"$CLOUDFRONT_DOMAIN\",
          \"EvaluateTargetHealth\": false
        }
      }
    }]
  }" &>/dev/null

echo -e "${GREEN}✅ Created CloudFront A record for $FRONTEND_DOMAIN${NC}"

# CloudFront alias (AAAA record for IPv6)
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$FRONTEND_DOMAIN\",
        \"Type\": \"AAAA\",
        \"AliasTarget\": {
          \"HostedZoneId\": \"$CLOUDFRONT_ZONE_ID\",
          \"DNSName\": \"$CLOUDFRONT_DOMAIN\",
          \"EvaluateTargetHealth\": false
        }
      }
    }]
  }" &>/dev/null

echo -e "${GREEN}✅ Created CloudFront AAAA record for $FRONTEND_DOMAIN${NC}"

# ALB alias (A record)
ALB_ZONE_ID="Z35SXDOTRQ7X7K"  # us-east-1
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$API_DOMAIN\",
        \"Type\": \"A\",
        \"AliasTarget\": {
          \"HostedZoneId\": \"$ALB_ZONE_ID\",
          \"DNSName\": \"$ALB_DNS\",
          \"EvaluateTargetHealth\": true
        }
      }
    }]
  }" &>/dev/null

echo -e "${GREEN}✅ Created ALB alias record for $API_DOMAIN${NC}"

echo ""

# Step 7: Summary and Next Steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DNS Records Created!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Manual Steps Required${NC}"
echo ""
echo "1. Update CloudFront Distribution:"
echo "   - Certificate ARN: $FRONTEND_CERT_ARN"
echo "   - Add alias: $FRONTEND_DOMAIN"
echo "   - Run: ./scripts/update-cloudfront-domain.sh $CLOUDFRONT_ID $FRONTEND_CERT_ARN $FRONTEND_DOMAIN"
echo ""
echo "2. Update ALB Listener:"
echo "   - Certificate ARN: $API_CERT_ARN"
echo "   - Create HTTPS listener (port 443)"
echo "   - Run: ./scripts/add-alb-https-listener.sh $API_CERT_ARN"
echo ""
echo "3. Wait for DNS Propagation:"
echo "   - DNS changes can take 5-60 minutes to propagate"
echo "   - Test with: dig $FRONTEND_DOMAIN"
echo ""
echo "4. Update Frontend Configuration:"
echo "   - Set VITE_API_URL=https://$API_DOMAIN/api  (origin + /api, NOT /v1)"
echo "   - Rebuild and redeploy frontend"
echo ""
echo "📝 Certificate ARNs saved for reference:"
echo "   Frontend: $FRONTEND_CERT_ARN"
echo "   API: $API_CERT_ARN"
echo ""
