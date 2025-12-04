# 🚀 Quick Deploy & View in Browser

## Option 1: Use CloudFront URL (Fastest - No Domain Needed!)

The CloudFront URL works perfectly for testing. No Route53 needed!

### Steps:

1. **Build UI:**
```bash
npm run build
```

2. **Deploy Infrastructure (if not done):**
```bash
cd infrastructure
npm install && npm run build
npx cdk deploy LearningCenterUIHosting --require-approval never
cd ..
```

3. **Deploy UI & Get URL:**
```bash
# Get outputs
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

# Get URL
aws cloudformation describe-stacks \
  --stack-name LearningCenterUIHosting \
  --query "Stacks[0].Outputs[?OutputKey=='UIDistributionDomainName'].OutputValue" \
  --output text
```

**Open that URL in your browser!** 🎉

---

## Option 2: Route53 Custom Domain (Optional)

If you want a custom domain (e.g., `learning.fibonacco.com`):

1. **You need:**
   - A registered domain
   - Access to domain DNS settings

2. **Update infrastructure/bin/infrastructure.ts:**
```typescript
// Add Route53 stack
const route53Stack = new Route53Stack(app, 'LearningCenterRoute53', {
  env: { ...env, region: 'us-east-1' }, // Certificate must be in us-east-1
  uiDistribution: uiHostingStack.uiDistribution,
  domainName: 'learning.fibonacco.com', // Your domain
  hostedZoneId: 'Z1234567890', // Optional: existing hosted zone
  hostedZoneName: 'fibonacco.com', // Optional: existing zone name
});
```

3. **Deploy:**
```bash
npx cdk deploy LearningCenterRoute53
```

4. **Update DNS nameservers** at your domain registrar (if new hosted zone created)

---

## 🎯 Recommendation

**Start with CloudFront URL** - it's instant and works perfectly for testing!

Then add Route53 custom domain later if needed.


