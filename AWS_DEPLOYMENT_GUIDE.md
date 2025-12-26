# 🚀 AWS Deployment Guide with Pulumi
## Complete Infrastructure Deployment for Learning Center

**Platform:** AWS  
**Infrastructure as Code:** Pulumi (Python)  
**Status:** ✅ Ready for Deployment

---

## 📋 Overview

This guide covers deploying the Fibonacco Learning Center to AWS using Pulumi Python. The infrastructure includes:

- **VPC** with public, private, and database subnets
- **RDS Aurora PostgreSQL** with pgvector extension
- **ElastiCache Redis** for caching and queues
- **ECS Fargate** for Laravel backend
- **S3 + CloudFront** for frontend hosting
- **Application Load Balancer** for backend routing
- **Secrets Manager** for API keys and credentials

---

## 🛠️ Prerequisites

### Required Tools

1. **Python 3.9+**
   ```bash
   python3 --version
   ```

2. **Pulumi CLI**
   ```bash
   curl -fsSL https://get.pulumi.com | sh
   pulumi version
   ```

3. **AWS CLI**
   ```bash
   aws --version
   aws configure
   ```

4. **Docker** (for building backend image)
   ```bash
   docker --version
   ```

### AWS Account Setup

1. **Create AWS Account** (if needed)
2. **Configure AWS CLI** with credentials
3. **Set up IAM User** with permissions:
   - EC2 (VPC, Security Groups, Instances)
   - RDS (Database clusters)
   - ElastiCache (Redis)
   - ECS (Fargate, Task Definitions)
   - S3 (Buckets)
   - CloudFront (Distributions)
   - Secrets Manager (Secrets)
   - IAM (Roles and Policies)

---

## 📦 Setup

### 1. Install Dependencies

```bash
cd infrastructure/pulumi
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Initialize Pulumi Stack

```bash
# Login to Pulumi (creates free account if needed)
pulumi login

# Create new stack
pulumi stack init production

# Or select existing stack
pulumi stack select production
```

### 3. Configure Stack

```bash
# Set AWS region
pulumi config set aws:region us-east-1

# Set project configuration
pulumi config set learning-center:project_name learning-center
pulumi config set learning-center:environment production
pulumi config set learning-center:region us-east-1
```

### 4. Set Up Secrets

Create secrets in AWS Secrets Manager:

```bash
# ElevenLabs API Key
aws secretsmanager create-secret \
  --name learning-center/elevenlabs/api-key \
  --description "ElevenLabs API key for TTS" \
  --secret-string "YOUR_ELEVENLABS_API_KEY"

# OpenRouter API Key
aws secretsmanager create-secret \
  --name learning-center/openrouter/api-key \
  --description "OpenRouter API key for AI" \
  --secret-string "YOUR_OPENROUTER_API_KEY"

# OpenAI API Key
aws secretsmanager create-secret \
  --name learning-center/openai/api-key \
  --description "OpenAI API key for embeddings" \
  --secret-string "YOUR_OPENAI_API_KEY"
```

---

## 🚀 Deployment Steps

### Step 1: Preview Infrastructure

```bash
cd infrastructure/pulumi
source venv/bin/activate
pulumi preview
```

Review the planned changes before deploying.

### Step 2: Deploy Infrastructure

```bash
# Using the deployment script
./deploy.sh production

# Or manually
pulumi up --stack production
```

**Expected Duration:** 15-20 minutes

This will create:
- ✅ VPC and networking (2-3 minutes)
- ✅ RDS Aurora cluster (10-15 minutes)
- ✅ ElastiCache Redis (5-8 minutes)
- ✅ ECS cluster (2-3 minutes)
- ✅ S3 buckets (1 minute)
- ✅ CloudFront distribution (10-15 minutes)
- ✅ Application Load Balancer (2-3 minutes)

### Step 3: Get Stack Outputs

```bash
pulumi stack output
```

Save these outputs for later use:
- `rds_endpoint`
- `rds_secret_arn`
- `redis_endpoint`
- `alb_dns_name`
- `cloudfront_url`
- `s3_frontend_bucket`

---

## 🗄️ Database Setup

### Step 1: Enable PostgreSQL Extensions

```bash
# Get database endpoint
RDS_ENDPOINT=$(pulumi stack output rds_endpoint)

# Get credentials from Secrets Manager
RDS_SECRET_ARN=$(pulumi stack output rds_secret_arn)
DB_CREDS=$(aws secretsmanager get-secret-value --secret-id $RDS_SECRET_ARN --query SecretString --output text)

# Extract connection details
DB_HOST=$(echo $DB_CREDS | jq -r '.host // empty')
DB_NAME="learning_center"
DB_USER="postgres"
DB_PASS=$(echo $DB_CREDS | jq -r '.password // empty')

# Connect and enable extensions
PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U $DB_USER -d postgres <<EOF
CREATE DATABASE learning_center;
\c learning_center
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
\q
EOF
```

### Step 2: Run Laravel Migrations

**Option A: Via ECS Exec (Recommended)**

```bash
# Get ECS cluster and service
CLUSTER_NAME=$(pulumi stack output ecs_cluster_name)
SERVICE_NAME=$(pulumi stack output ecs_service_name)

# Get running task
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --query 'taskArns[0]' --output text)

# Execute migration
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container laravel \
  --command "php artisan migrate --force" \
  --interactive
```

**Option B: Via Local Connection**

Update `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=<rds_endpoint>
DB_PORT=5432
DB_DATABASE=learning_center
DB_USERNAME=postgres
DB_PASSWORD=<password_from_secrets_manager>
```

Then run:

```bash
cd backend
php artisan migrate
```

---

## 🐳 Build and Deploy Backend

### Step 1: Create ECR Repository

```bash
aws ecr create-repository --repository-name learning-center-backend --region us-east-1
```

### Step 2: Build Docker Image

```bash
cd infrastructure/pulumi
docker build -t learning-center-backend:latest -f Dockerfile ../..
```

### Step 3: Push to ECR

```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(pulumi config get aws:region)

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag image
docker tag learning-center-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/learning-center-backend:latest

# Push image
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/learning-center-backend:latest
```

### Step 4: Update ECS Task Definition

Update `infrastructure/pulumi/infrastructure/ecs.py` with the ECR image URI:

```python
image = f"{AWS_ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/learning-center-backend:latest"
```

Then update the stack:

```bash
pulumi up
```

---

## 🎨 Frontend Deployment

### Step 1: Build Frontend

```bash
cd /path/to/project
npm install
npm run build
```

### Step 2: Deploy to S3

```bash
# Get bucket name
BUCKET_NAME=$(pulumi stack output s3_frontend_bucket --stack production)

# Sync build to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set proper MIME types for SPA
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive --exclude "*" --include "*.html" --content-type "text/html" --metadata-directive REPLACE
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive --exclude "*" --include "*.js" --content-type "application/javascript" --metadata-directive REPLACE
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive --exclude "*" --include "*.css" --content-type "text/css" --metadata-directive REPLACE
```

### Step 3: Invalidate CloudFront Cache

```bash
# Get CloudFront distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='CloudFront distribution for learning-center'].Id" \
  --output text)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

---

## 🔧 Configuration

### Environment Variables

Set in `backend/.env` (for ECS, use Secrets Manager):

```env
APP_NAME="Learning Center"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-cloudfront-url.cloudfront.net

DB_CONNECTION=pgsql
DB_HOST=<rds_endpoint>
DB_PORT=5432
DB_DATABASE=learning_center
DB_USERNAME=postgres
DB_PASSWORD=<from_secrets_manager>

REDIS_HOST=<redis_endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=null

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

ELEVENLABS_API_KEY=<from_secrets_manager>
OPENAI_API_KEY=<from_secrets_manager>
OPENROUTER_API_KEY=<from_secrets_manager>
```

### Update Frontend API Endpoint

Create `.env.production`:

```env
VITE_API_ENDPOINT=https://your-alb-dns-name.elb.amazonaws.com/api/v1
```

Rebuild frontend:

```bash
npm run build
```

---

## ✅ Verification

### Check Backend Health

```bash
ALB_DNS=$(pulumi stack output alb_dns_name)
curl http://$ALB_DNS/health
```

### Check Frontend

Visit CloudFront URL:

```bash
CF_URL=$(pulumi stack output cloudfront_url)
echo "Frontend URL: https://$CF_URL"
```

### Check Database Connection

```bash
# Via psql
PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U $DB_USER -d learning_center -c "SELECT version();"
```

### Check Redis Connection

```bash
REDIS_ENDPOINT=$(pulumi stack output redis_endpoint)
redis-cli -h $REDIS_ENDPOINT ping
```

---

## 🔍 Monitoring

### CloudWatch Logs

```bash
# View ECS logs
aws logs tail /ecs/learning-center --follow
```

### ECS Service Status

```bash
CLUSTER_NAME=$(pulumi stack output ecs_cluster_name)
aws ecs describe-services --cluster $CLUSTER_NAME --services learning-center-service
```

### RDS Status

```bash
aws rds describe-db-clusters --db-cluster-identifier learning-center-db-cluster
```

---

## 🧹 Cleanup

To destroy all resources:

```bash
pulumi destroy --stack production
```

**⚠️ Warning:** This will delete:
- All databases (ensure backups!)
- All data in S3 buckets
- All infrastructure resources

---

## 📊 Cost Estimation

Approximate monthly costs (us-east-1):

- **RDS Aurora (db.t4g.medium)**: ~$50-80/month
- **ElastiCache Redis (cache.t4g.micro)**: ~$15-20/month
- **ECS Fargate (1 vCPU, 1GB RAM)**: ~$30-40/month
- **Application Load Balancer**: ~$20-25/month
- **S3 Storage (10GB)**: ~$0.25/month
- **CloudFront (100GB transfer)**: ~$10-15/month
- **Data Transfer**: ~$10-20/month

**Total Estimated**: ~$135-210/month

---

## 🆘 Troubleshooting

### Database Connection Issues

- Check security group allows connections from ECS tasks
- Verify RDS is in database subnets
- Check Secrets Manager has correct credentials

### ECS Tasks Not Starting

- Check CloudWatch logs for errors
- Verify task definition has correct image URI
- Check IAM roles have correct permissions
- Verify security groups allow traffic

### CloudFront Not Serving Content

- Verify S3 bucket policy allows CloudFront OAC
- Check CloudFront origin configuration
- Invalidate cache after S3 updates
- Verify MIME types are set correctly

---

## 📚 Next Steps

1. **Set up custom domain** with Route53 and ACM certificate
2. **Enable HTTPS** on ALB with ACM certificate
3. **Configure auto-scaling** for ECS service
4. **Set up RDS backups** and automated snapshots
5. **Enable CloudWatch alarms** for monitoring
6. **Set up CI/CD pipeline** for automated deployments

---

**Status:** ✅ Infrastructure code ready for deployment  
**Last Updated:** December 2024
