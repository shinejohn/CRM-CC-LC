# AWS Deployment - Ready to Execute 🚀

**Date:** December 25, 2024  
**Status:** Infrastructure code complete, ready for deployment

---

## ✅ What's Complete

### Backend (100%)
- ✅ All 8 controllers implemented
- ✅ 50+ API endpoints configured  
- ✅ Health check endpoint (`/health`)
- ✅ All services integrated (OpenAI, ElevenLabs, OpenRouter)

### Infrastructure (100%)
- ✅ Pulumi infrastructure code complete
- ✅ All AWS resources defined:
  - VPC, Subnets, Networking
  - RDS Aurora PostgreSQL
  - ElastiCache Redis
  - ECS Fargate Cluster
  - Application Load Balancer
  - S3 Buckets
  - CloudFront Distribution
  - ECR Repository
  - Secrets Manager
- ✅ Docker configuration (Nginx + PHP-FPM)
- ✅ Deployment scripts created

### Prerequisites (100%)
- ✅ Pulumi CLI installed
- ✅ AWS CLI configured
- ✅ AWS credentials verified
- ✅ Python dependencies installed
- ✅ Pulumi stack initialized

---

## 🚀 Deployment Steps

### Step 1: Deploy Infrastructure

```bash
cd infrastructure/pulumi
source venv/bin/activate
pulumi up --yes
```

**Time:** 15-30 minutes

### Step 2: Set API Keys

```bash
aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openai/api-key \
  --secret-string "YOUR_OPENAI_KEY"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/elevenlabs/api-key \
  --secret-string "YOUR_ELEVENLABS_KEY"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openrouter/api-key \
  --secret-string "YOUR_OPENROUTER_KEY"
```

### Step 3: Build & Push Docker Image

```bash
# Get ECR URL
ECR_URL=$(pulumi stack output ecr_repository_url)

# Login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build
cd ../..
docker build -f infrastructure/pulumi/Dockerfile -t $ECR_URL:latest .

# Push
docker push $ECR_URL:latest
```

### Step 4: Update ECS Service

```bash
cd infrastructure/pulumi
CLUSTER=$(pulumi stack output ecs_cluster_name)
SERVICE=$(pulumi stack output ecs_service_name)

aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --force-new-deployment
```

### Step 5: Setup Database

```bash
# Enable pgvector
RDS_ENDPOINT=$(pulumi stack output rds_endpoint)
RDS_SECRET=$(pulumi stack output rds_secret_arn)

# Get password
DB_PASS=$(aws secretsmanager get-secret-value \
  --secret-id $RDS_SECRET \
  --query SecretString --output text | jq -r '.password')

# Connect and enable extensions
PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U postgres -d learning_center <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
EOF
```

### Step 6: Run Migrations

```bash
# Get task ID
TASK_ID=$(aws ecs list-tasks \
  --cluster learning-center-cluster \
  --service-name learning-center-service \
  --query 'taskArns[0]' --output text | cut -d'/' -f3)

# Run migrations
aws ecs execute-command \
  --cluster learning-center-cluster \
  --task $TASK_ID \
  --container laravel \
  --command "php artisan migrate --force" \
  --interactive
```

### Step 7: Deploy Frontend

```bash
# Build
npm run build

# Deploy
./scripts/deploy-frontend.sh
```

---

## 📊 Get Deployment URLs

```bash
cd infrastructure/pulumi
pulumi stack output
```

**Backend API:** `http://$(pulumi stack output alb_dns_name)`  
**Frontend:** `https://$(pulumi stack output cloudfront_url)`

---

## ✅ Verification

### Test Backend Health

```bash
ALB_DNS=$(cd infrastructure/pulumi && pulumi stack output alb_dns_name)
curl http://$ALB_DNS/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-25T..."
}
```

### Test API Endpoint

```bash
curl http://$ALB_DNS/api/v1/knowledge
```

---

## 📝 Notes

- First deployment takes 15-30 minutes
- API keys must be set before AI features work
- Database migrations required after first deployment
- Frontend can be deployed independently
- All infrastructure is production-ready

---

## 🎯 Quick Deploy (All-in-One)

Use the deployment script:

```bash
cd infrastructure/pulumi
./deploy.sh
```

This will:
1. Deploy infrastructure
2. Build Docker image
3. Push to ECR
4. Update ECS service
5. Provide next steps

---

**Status:** ✅ **READY TO DEPLOY**

All code is complete. All infrastructure is defined. Execute `pulumi up` to deploy!
