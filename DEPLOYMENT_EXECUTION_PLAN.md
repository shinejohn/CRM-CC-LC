# AWS Deployment Execution Plan 🚀

**Date:** December 25, 2024  
**Status:** Ready to Execute

---

## 📋 Pre-Deployment Checklist

### Prerequisites:
- [x] All backend controllers implemented
- [x] All API endpoints configured
- [x] AWS infrastructure defined (Pulumi)
- [x] Docker configuration complete
- [x] Health check endpoint added
- [x] Deployment scripts created

### Required Tools:
- [ ] Pulumi CLI installed
- [ ] AWS CLI configured
- [ ] Docker installed
- [ ] Node.js/npm installed (for frontend)

### Required Credentials:
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] AWS Region configured
- [ ] OpenAI API Key
- [ ] ElevenLabs API Key
- [ ] OpenRouter API Key

---

## 🚀 Deployment Steps

### Step 1: Initialize Pulumi Stack

```bash
cd infrastructure/pulumi

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set Pulumi passphrase
export PULUMI_CONFIG_PASSPHRASE="your-secure-passphrase"

# Initialize stack (if not exists)
pulumi stack init production

# Configure
pulumi config set project_name learning-center
pulumi config set environment production
pulumi config set region us-east-1
```

### Step 2: Deploy Infrastructure

```bash
# Run deployment script
./deploy.sh

# OR manually:
pulumi up --yes
```

**Expected Time:** 15-30 minutes

**What it creates:**
- VPC, subnets, networking
- RDS Aurora PostgreSQL
- ElastiCache Redis
- ECS Cluster and Service
- Application Load Balancer
- S3 Buckets
- CloudFront Distribution
- ECR Repository
- Secrets Manager secrets

### Step 3: Set API Keys

```bash
# Get secret ARNs from Pulumi outputs
pulumi stack output

# Set API keys
aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openai/api-key \
  --secret-string "sk-your-openai-key"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/elevenlabs/api-key \
  --secret-string "your-elevenlabs-key"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openrouter/api-key \
  --secret-string "your-openrouter-key"
```

### Step 4: Build and Push Docker Image

```bash
# Get ECR URL
ECR_URL=$(pulumi stack output ecr_repository_url)

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build image
cd ../..
docker build -f infrastructure/pulumi/Dockerfile -t $ECR_URL:latest .

# Push image
docker push $ECR_URL:latest
```

### Step 5: Update ECS Service

```bash
CLUSTER_NAME=$(pulumi stack output ecs_cluster_name)
SERVICE_NAME=$(pulumi stack output ecs_service_name)

aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment
```

### Step 6: Setup Database

```bash
# Enable pgvector extension
./setup-database.sh

# OR manually:
RDS_ENDPOINT=$(pulumi stack output rds_endpoint)
RDS_SECRET_ARN=$(pulumi stack output rds_secret_arn)

# Get credentials
DB_CREDS=$(aws secretsmanager get-secret-value \
  --secret-id $RDS_SECRET_ARN \
  --query SecretString --output text)

# Connect and enable extensions
psql -h $RDS_ENDPOINT -U postgres -d learning_center <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
EOF
```

### Step 7: Run Migrations

```bash
# Get ECS task ID
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

### Step 8: Deploy Frontend

```bash
# Build frontend
npm run build

# Deploy to S3
./scripts/deploy-frontend.sh
```

---

## ✅ Verification Steps

### 1. Check Backend Health

```bash
ALB_DNS=$(pulumi stack output alb_dns_name)
curl http://$ALB_DNS/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-25T..."
}
```

### 2. Test API Endpoints

```bash
# Test knowledge endpoint
curl http://$ALB_DNS/api/v1/knowledge

# Test search endpoint
curl -X POST http://$ALB_DNS/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "tenant_id": "00000000-0000-0000-0000-000000000000"}'
```

### 3. Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster learning-center-cluster \
  --services learning-center-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

### 4. Check Frontend

```bash
CLOUDFRONT_URL=$(pulumi stack output cloudfront_url)
curl https://$CLOUDFRONT_URL
```

---

## 🔧 Troubleshooting

### ECS Service Not Starting

```bash
# Check service events
aws ecs describe-services \
  --cluster learning-center-cluster \
  --services learning-center-service \
  --query 'services[0].events[0:5]'

# Check task logs
aws logs tail /ecs/learning-center --follow
```

### Database Connection Issues

```bash
# Test connection
RDS_ENDPOINT=$(pulumi stack output rds_endpoint)
psql -h $RDS_ENDPOINT -U postgres -d learning_center -c "SELECT 1;"
```

### ALB Health Check Failing

```bash
# Check target group health
TG_ARN=$(aws elbv2 describe-target-groups \
  --names learning-center-tg \
  --query 'TargetGroups[0].TargetGroupArn' --output text)

aws elbv2 describe-target-health --target-group-arn $TG_ARN
```

---

## 📊 Deployment Outputs

After deployment, get all outputs:

```bash
pulumi stack output
```

**Key Outputs:**
- `alb_dns_name` - Backend API URL
- `cloudfront_url` - Frontend URL
- `rds_endpoint` - Database endpoint
- `redis_endpoint` - Redis endpoint
- `ecr_repository_url` - Docker image repository
- `s3_frontend_bucket` - Frontend S3 bucket

---

## 🎯 Quick Deploy (All-in-One)

```bash
# Run complete deployment
cd infrastructure/pulumi
./deploy.sh

# Set API keys
# (see Step 3 above)

# Setup database
./setup-database.sh

# Run migrations
# (see Step 7 above)

# Deploy frontend
cd ../..
./scripts/deploy-frontend.sh
```

---

## ✅ Post-Deployment

1. **Verify all endpoints are working**
2. **Test frontend connectivity**
3. **Monitor CloudWatch logs**
4. **Set up CloudWatch alarms** (optional)
5. **Configure custom domain** (optional)
6. **Enable HTTPS** with ACM certificate (optional)

---

## 📝 Notes

- First deployment takes 15-30 minutes
- Subsequent deployments are faster (only changed resources)
- Database migrations should be run after first deployment
- Frontend can be deployed independently
- API keys must be set before services can use AI features

---

**Ready to deploy!** 🚀
