#!/bin/bash
# Deploy frontend to S3 and CloudFront

set -e

PROJECT_NAME="${PROJECT_NAME:-learning-center}"
ENVIRONMENT="${ENVIRONMENT:-production}"
PULUMI_STACK="${PULUMI_STACK:-production}"

echo "🌐 Deploying frontend..."
echo ""

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built"
echo ""

# Get S3 bucket from Pulumi
cd infrastructure/pulumi
S3_BUCKET=$(pulumi stack output s3_frontend_bucket --stack "$PULUMI_STACK")
cd ../..

if [ -z "$S3_BUCKET" ]; then
    echo "❌ Failed to get S3 bucket from stack outputs"
    exit 1
fi

echo "📤 Uploading to S3: $S3_BUCKET"

# Upload to S3
aws s3 sync dist/ "s3://$S3_BUCKET" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "service-worker.js"

# Upload HTML files with shorter cache
aws s3 sync dist/ "s3://$S3_BUCKET" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js"

# Set index.html as default
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
    --cache-control "public, max-age=0, must-revalidate"

echo "✅ Frontend uploaded to S3"
echo ""

# Invalidate CloudFront cache
CLOUDFRONT_ID=$(cd infrastructure/pulumi && pulumi stack output cloudfront_distribution_id --stack "$PULUMI_STACK" 2>/dev/null || echo "")

if [ -n "$CLOUDFRONT_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*"
    
    echo "✅ CloudFront cache invalidated"
    echo ""
fi

# Get CloudFront URL
CLOUDFRONT_URL=$(cd infrastructure/pulumi && pulumi stack output cloudfront_url --stack "$PULUMI_STACK" 2>/dev/null || echo "")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FRONTEND DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -n "$CLOUDFRONT_URL" ]; then
    echo "  Frontend URL: https://$CLOUDFRONT_URL"
else
    echo "  S3 Bucket: $S3_BUCKET"
fi
echo ""
