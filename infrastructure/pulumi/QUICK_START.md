# ⚡ Quick Start Guide
## Deploy Learning Center to AWS in 30 Minutes

---

## 🚀 Fast Track Deployment

### 1. Prerequisites Check (2 minutes)

```bash
# Check Python
python3 --version  # Need 3.9+

# Install Pulumi
curl -fsSL https://get.pulumi.com | sh

# Verify AWS CLI
aws --version
aws configure list  # Should show credentials
```

### 2. Setup Project (3 minutes)

```bash
cd infrastructure/pulumi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Login to Pulumi
pulumi login

# Create stack
pulumi stack init production
pulumi config set aws:region us-east-1
```

### 3. Deploy Infrastructure (20 minutes)

```bash
# Preview
pulumi preview

# Deploy (takes 15-20 minutes)
pulumi up --yes
```

### 4. Database Setup (5 minutes)

```bash
# Enable extensions
./scripts/setup-database.sh production

# Get connection details
pulumi stack output rds_endpoint
pulumi stack output rds_secret_arn
```

### 5. Build & Push Docker Image (5 minutes)

```bash
# Get ECR repo URL
ECR_URL=$(pulumi stack output ecr_repository_url)

# Build image
docker build -t learning-center-backend:latest -f Dockerfile ../..

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL

# Tag and push
docker tag learning-center-backend:latest $ECR_URL:latest
docker push $ECR_URL:latest
```

### 6. Deploy Frontend (3 minutes)

```bash
# Build frontend
cd ../../  # Back to project root
npm install
npm run build

# Get bucket name
BUCKET=$(pulumi stack output s3_frontend_bucket --stack production)

# Deploy to S3
aws s3 sync dist/ s3://$BUCKET --delete

# Invalidate CloudFront
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='CloudFront distribution for learning-center'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

## ✅ Done!

Your application is now live at:
- **Frontend**: `https://$(pulumi stack output cloudfront_url)`
- **Backend API**: `http://$(pulumi stack output alb_dns_name)/api/v1`

---

## 📝 Next Steps

1. Update ECS task definition with ECR image
2. Run Laravel migrations
3. Configure custom domain (optional)
4. Set up CI/CD pipeline (optional)

---

**Total Time:** ~30-40 minutes
