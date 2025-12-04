# 🚀 Deploy & View in Browser - Quick Guide

## Step 1: Install Dependencies & Build UI

```bash
cd /Users/johnshine/Dropbox/Fibonacco/Learning-Center
npm install
npm run build
```

## Step 2: Deploy Infrastructure (if not already done)

```bash
cd infrastructure
npm install
npm run build
npx cdk deploy LearningCenterUIHosting --require-approval never
```

## Step 3: Deploy UI to S3

```bash
cd ..
# Get bucket name
UI_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name LearningCenterUIHosting \
  --query "Stacks[0].Outputs[?OutputKey=='UIBucketName'].OutputValue" \
  --output text)

DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name LearningCenterUIHosting \
  --query "Stacks[0].Outputs[?OutputKey=='UIDistributionId'].OutputValue" \
  --output text)

# Deploy
aws s3 sync dist/ s3://$UI_BUCKET --delete

# Invalidate cache
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## Step 4: Get CloudFront URL

```bash
aws cloudformation describe-stacks \
  --stack-name LearningCenterUIHosting \
  --query "Stacks[0].Outputs[?OutputKey=='UIDistributionDomainName'].OutputValue" \
  --output text
```

**Open that URL in your browser!** 🎉

---

## For Route53 Custom Domain (Optional)

1. You need a domain registered
2. Create/use existing hosted zone
3. Certificate will be created automatically
4. DNS records will point to CloudFront

**For now, CloudFront URL works perfectly for testing!**


