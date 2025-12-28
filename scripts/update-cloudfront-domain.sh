#!/bin/bash

# Update CloudFront Distribution with Custom Domain and SSL Certificate

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REGION="us-east-1"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <distribution-id> <certificate-arn> <domain-name>"
    echo ""
    echo "Example:"
    echo "  $0 E1234567890ABC arn:aws:acm:us-east-1:123456789:certificate/abcd learning.fibonacco.com"
    exit 1
fi

DIST_ID="$1"
CERT_ARN="$2"
DOMAIN_NAME="$3"

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}❌ Domain name required${NC}"
    exit 1
fi

echo "🌐 Updating CloudFront Distribution..."
echo "  Distribution ID: $DIST_ID"
echo "  Certificate ARN: $CERT_ARN"
echo "  Domain: $DOMAIN_NAME"
echo ""

# Get current distribution config
echo "📥 Getting current distribution configuration..."
aws cloudfront get-distribution-config --id "$DIST_ID" > /tmp/cloudfront-config.json

ETAG=$(cat /tmp/cloudfront-config.json | jq -r '.ETag')
CONFIG=$(cat /tmp/cloudfront-config.json | jq '.DistributionConfig')

# Update configuration
echo "✏️  Updating configuration..."
UPDATED_CONFIG=$(echo "$CONFIG" | jq --arg cert "$CERT_ARN" --arg domain "$DOMAIN_NAME" '
  .Aliases.Items = [$domain] |
  .Aliases.Quantity = 1 |
  .ViewerCertificate.ACMCertificateArn = $cert |
  .ViewerCertificate.SSLSupportMethod = "sni-only" |
  .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021" |
  .ViewerCertificate.Certificate = $cert |
  .ViewerCertificate.CertificateSource = "acm"
')

# Save updated config
echo "$UPDATED_CONFIG" > /tmp/cloudfront-config-updated.json

# Update distribution
echo "📤 Updating CloudFront distribution..."
UPDATE_OUTPUT=$(aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --distribution-config file:///tmp/cloudfront-config-updated.json \
  --if-match "$ETAG" \
  --output json)

NEW_ETAG=$(echo "$UPDATE_OUTPUT" | jq -r '.ETag')
STATUS=$(echo "$UPDATE_OUTPUT" | jq -r '.Distribution.Status')

echo ""
echo -e "${GREEN}✅ CloudFront distribution updated!${NC}"
echo "  Status: $STATUS"
echo "  New ETag: $NEW_ETAG"
echo ""
echo -e "${YELLOW}⚠️  CloudFront updates take 15-30 minutes to deploy${NC}"
echo "  Check status with:"
echo "  aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status'"
echo ""

# Cleanup
rm -f /tmp/cloudfront-config.json /tmp/cloudfront-config-updated.json
