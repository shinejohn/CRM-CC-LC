# 🚀 Pulumi AWS Infrastructure
## Fibonacco Learning Center - AWS Deployment

This directory contains Pulumi Python code for deploying the Learning Center infrastructure on AWS.

---

## 📋 Prerequisites

1. **Python 3.9+** installed
2. **Pulumi CLI** installed: https://www.pulumi.com/docs/get-started/install/
3. **AWS CLI** configured with credentials
4. **AWS Account** with appropriate permissions

---

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd infrastructure/pulumi
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Pulumi

```bash
# Initialize Pulumi (if not already done)
pulumi login

# Set AWS region (optional, defaults to us-east-1)
pulumi config set aws:region us-east-1

# Set configuration values
pulumi config set project_name learning-center
pulumi config set environment production
```

### 3. Configure Secrets

Set API keys in AWS Secrets Manager (or create secret versions):

```bash
# ElevenLabs API key
aws secretsmanager create-secret \
  --name learning-center/elevenlabs/api-key \
  --secret-string "YOUR_ELEVENLABS_API_KEY"

# OpenRouter API key
aws secretsmanager create-secret \
  --name learning-center/openrouter/api-key \
  --secret-string "YOUR_OPENROUTER_API_KEY"

# OpenAI API key
aws secretsmanager create-secret \
  --name learning-center/openai/api-key \
  --secret-string "YOUR_OPENAI_API_KEY"
```

---

## 🚀 Deployment

### Preview Changes

```bash
pulumi preview
```

### Deploy Infrastructure

```bash
pulumi up
```

This will create:
- VPC with public, private, and database subnets
- RDS Aurora PostgreSQL cluster with pgvector
- ElastiCache Redis cluster
- ECS Fargate cluster with Laravel backend
- S3 buckets for frontend and assets
- CloudFront distribution
- Application Load Balancer
- Security groups and IAM roles

### View Outputs

```bash
pulumi stack output
```

Outputs include:
- `rds_endpoint` - RDS database endpoint
- `rds_secret_arn` - Secrets Manager ARN for DB credentials
- `redis_endpoint` - Redis cluster endpoint
- `alb_dns_name` - Application Load Balancer DNS
- `cloudfront_url` - CloudFront distribution URL
- `s3_frontend_bucket` - S3 bucket name for frontend

---

## 🗄️ Database Setup

After deployment, you need to:

1. **Enable pgvector extension** (run via RDS Data API or psql):

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

2. **Run Laravel migrations**:

```bash
# Get database connection from Secrets Manager
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id learning-center/database/credentials \
  --query SecretString --output text)

# Run migrations via ECS exec or local connection
cd backend
php artisan migrate
```

---

## 🐳 Docker Image

You'll need to build and push a Docker image for the Laravel backend:

```bash
# Build image
cd backend
docker build -t learning-center-backend:latest .

# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag learning-center-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/learning-center-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/learning-center-backend:latest
```

Update the task definition image URI in `infrastructure/ecs.py`.

---

## 🎨 Frontend Deployment

### Build Frontend

```bash
cd /path/to/project
npm install
npm run build
```

### Deploy to S3

```bash
# Get bucket name from Pulumi outputs
BUCKET_NAME=$(pulumi stack output s3_frontend_bucket)

# Sync build to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='CloudFront distribution for learning-center'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

## 🔧 Configuration

### Environment Variables

Set in `Pulumi.<stack-name>.yaml`:

```yaml
config:
  learning-center:project_name: learning-center
  learning-center:environment: production
  learning-center:region: us-east-1
```

### Resource Sizing

Modify resource sizes in respective files:
- **RDS**: `infrastructure/rds.py` - `instance_class`
- **Redis**: `infrastructure/redis.py` - `node_type`
- **ECS**: `infrastructure/ecs.py` - `cpu`, `memory`, `desired_count`

---

## 🧹 Cleanup

To destroy all resources:

```bash
pulumi destroy
```

**Warning:** This will delete all resources including databases. Ensure you have backups!

---

## 📚 Additional Resources

- [Pulumi AWS Documentation](https://www.pulumi.com/docs/clouds/aws/)
- [Pulumi Python Documentation](https://www.pulumi.com/docs/languages-sdks/python/)
- [AWS RDS Aurora Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [AWS ECS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)

---

**Status:** ✅ Ready for deployment
