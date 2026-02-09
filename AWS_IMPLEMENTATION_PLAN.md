# FIBONACCO OPERATIONS PLATFORM
## AWS Implementation & Deployment Plan

**Version:** 1.0  
**Date:** December 2024  
**Status:** Deployment Guide

---

# TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Infrastructure Components](#infrastructure-components)
3. [Deployment Phases](#deployment-phases)
4. [Environment Configuration](#environment-configuration)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Security Configuration](#security-configuration)
7. [Scaling Strategy](#scaling-strategy)
8. [Backup & Disaster Recovery](#backup--disaster-recovery)
9. [Cost Optimization](#cost-optimization)

---

# PREREQUISITES

## Required Accounts & Tools

1. **AWS Account**
   - Active AWS account with appropriate permissions
   - IAM user with programmatic access
   - Billing alerts configured

2. **Pulumi CLI**
   ```bash
   # Install Pulumi
   curl -fsSL https://get.pulumi.com | sh
   
   # Verify installation
   pulumi version
   ```

3. **Docker**
   ```bash
   # Install Docker Desktop or Docker Engine
   # Verify installation
   docker --version
   ```

4. **AWS CLI**
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Configure credentials
   aws configure
   ```

5. **Node.js & npm**
   ```bash
   # Install Node.js (v18+)
   # Verify installation
   node --version
   npm --version
   ```

6. **Git**
   ```bash
   # Verify Git installation
   git --version
   ```

## AWS Services Overview

The platform uses the following AWS services:

| Service | Purpose | Location |
|---------|---------|----------|
| **VPC** | Network isolation | `infrastructure/pulumi/infrastructure/vpc.py` |
| **RDS Aurora PostgreSQL** | Database | `infrastructure/pulumi/infrastructure/rds.py` |
| **ElastiCache Redis** | Cache & Queues | `infrastructure/pulumi/infrastructure/redis.py` |
| **ECS Fargate** | Container hosting | `infrastructure/pulumi/infrastructure/ecs.py` |
| **Application Load Balancer** | Traffic distribution | `infrastructure/pulumi/infrastructure/alb.py` |
| **CloudFront** | CDN for frontend | `infrastructure/pulumi/infrastructure/cloudfront.py` |
| **S3** | Frontend hosting & assets | `infrastructure/pulumi/infrastructure/s3.py` |
| **Route53** | DNS management | `infrastructure/pulumi/infrastructure/route53.py` |
| **ECR** | Docker registry | `infrastructure/pulumi/infrastructure/ecr.py` |
| **Secrets Manager** | Credentials storage | `infrastructure/pulumi/infrastructure/secrets.py` |
| **CloudWatch** | Logging & monitoring | Configured in ECS |

---

# INFRASTRUCTURE COMPONENTS

## VPC (Virtual Private Cloud)

**File**: `infrastructure/pulumi/infrastructure/vpc.py`

### Configuration

- **CIDR Block**: `10.0.0.0/16`
- **Subnets**:
  - Public subnets (for ALB, NAT Gateway)
  - Private subnets (for ECS tasks)
  - Database subnets (for RDS)
- **Internet Gateway**: For public subnet access
- **NAT Gateway**: For private subnet outbound access
- **Route Tables**: Separate for public/private/database subnets

### Deployment

```bash
cd infrastructure/pulumi
pulumi stack init dev  # or production
pulumi config set aws:region us-east-1
pulumi up
```

## RDS Aurora PostgreSQL

**File**: `infrastructure/pulumi/infrastructure/rds.py`

### Configuration

- **Engine**: `aurora-postgresql`
- **Engine Version**: `15.15` (with pgvector support)
- **Instance Class**: `db.t4g.medium` (dev) / `db.r6g.large` (production)
- **Multi-AZ**: Enabled for production
- **Backup Retention**: 7 days
- **Storage Encryption**: Enabled
- **Public Access**: Disabled (VPC-only)

### Database Setup

After RDS cluster creation, enable pgvector extension:

```bash
# Connect to RDS
psql -h <rds-endpoint> -U postgres -d learning_center

# Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

# Verify
\dx
```

**Setup Script**: `infrastructure/pulumi/scripts/setup-database.sh`

## ElastiCache Redis

**File**: `infrastructure/pulumi/infrastructure/redis.py`

### Configuration

- **Engine**: Redis 7
- **Node Type**: `cache.t4g.micro` (dev) / `cache.r6g.large` (production)
- **Num Cache Clusters**: 1 (dev) / 2+ (production)
- **Multi-AZ**: Enabled for production
- **Encryption**: At-rest encryption enabled
- **Transit Encryption**: Disabled (dev) / Enabled (production)
- **VPC**: Private subnet only

### Connection

- **Endpoint**: `primary_endpoint_address` from cluster
- **Port**: `6379`
- **Connection**: VPC-only (no public access)

## ECS Fargate

**File**: `infrastructure/pulumi/infrastructure/ecs.py`

### Configuration

- **Launch Type**: Fargate
- **Task CPU**: `512` (0.5 vCPU) - configurable
- **Task Memory**: `1024` (1 GB) - configurable
- **Container Port**: `80`
- **Logging**: CloudWatch Logs
- **Networking**: VPC with private subnets

### Task Definition

- **Image**: ECR repository URL
- **Environment Variables**: Configured via Secrets Manager
- **Health Check**: `/health` endpoint
- **Logging**: CloudWatch Logs (`/ecs/{project_name}`)

## Application Load Balancer (ALB)

**File**: `infrastructure/pulumi/infrastructure/alb.py`

### Configuration

- **Type**: Application Load Balancer
- **Scheme**: Internet-facing
- **Subnets**: Public subnets
- **Security Group**: Allows HTTP (80) and HTTPS (443)
- **Target Group**: ECS tasks on port 80
- **Health Check**: `/health` endpoint

### SSL/TLS

- Use ACM certificate for HTTPS
- Configure listener on port 443
- Redirect HTTP to HTTPS

## CloudFront Distribution

**File**: `infrastructure/pulumi/infrastructure/cloudfront.py`

### Configuration

- **Origin**: S3 bucket (frontend)
- **Origin Access Control (OAC)**: Enabled
- **Default Root Object**: `index.html`
- **Custom Error Responses**: 404/403 → `/index.html` (SPA routing)
- **Caching**: Configured for static assets
- **Compression**: Enabled

## S3 Buckets

**File**: `infrastructure/pulumi/infrastructure/s3.py`

### Buckets

1. **Frontend Bucket** (`{project_name}-frontend-{environment}`)
   - Static website hosting
   - Versioning enabled
   - Public access blocked (CloudFront OAC only)

2. **Assets Bucket** (`{project_name}-assets-{environment}`)
   - User-uploaded assets
   - Versioning enabled
   - Public access blocked

## Route53

**File**: `infrastructure/pulumi/infrastructure/route53.py`

### DNS Configuration

- **API Domain**: `api.fibonacco.com` → ALB
- **Frontend Domain**: `app.fibonacco.com` → CloudFront
- **Learning Center**: `learn.fibonacco.com` → CloudFront

## ECR (Elastic Container Registry)

**File**: `infrastructure/pulumi/infrastructure/ecr.py`

### Configuration

- **Repository**: `{project_name}-backend`
- **Image Tagging**: `latest`, `{git-sha}`, `{version}`
- **Lifecycle Policy**: Retain last 10 images

## Secrets Manager

**File**: `infrastructure/pulumi/infrastructure/secrets.py`

### Secrets

1. **Database Credentials** (`{project_name}/database/credentials`)
   - Auto-generated by RDS
   - Contains: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`

2. **ElevenLabs API Key** (`{project_name}-{environment}/elevenlabs/api-key`)
   - Manually created
   - Store API key value

3. **OpenRouter API Key** (`{project_name}-{environment}/openrouter/api-key`)
   - Manually created
   - Store API key value

4. **OpenAI API Key** (`{project_name}-{environment}/openai/api-key`)
   - Manually created
   - Store API key value

---

# DEPLOYMENT PHASES

## Phase 1: Infrastructure Setup

### Step 1.1: Initialize Pulumi Stack

```bash
cd infrastructure/pulumi
pulumi stack init dev  # or production
pulumi config set aws:region us-east-1
pulumi config set project_name learning-center
pulumi config set environment dev
```

### Step 1.2: Deploy VPC and Networking

```bash
# VPC is created automatically by Pulumi
pulumi up --target infrastructure.vpc
```

**Outputs**:
- VPC ID
- Public subnet IDs
- Private subnet IDs
- Database subnet IDs

### Step 1.3: Deploy RDS PostgreSQL

```bash
pulumi up --target infrastructure.rds
```

**After Deployment**:
1. Get RDS endpoint from Pulumi outputs
2. Connect and enable pgvector:
   ```bash
   psql -h <rds-endpoint> -U postgres -d learning_center
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Step 1.4: Deploy ElastiCache Redis

```bash
pulumi up --target infrastructure.redis
```

**Outputs**:
- Redis endpoint
- Redis port

### Step 1.5: Deploy S3 Buckets

```bash
pulumi up --target infrastructure.s3
```

**Outputs**:
- Frontend bucket name
- Assets bucket name

### Step 1.6: Deploy ECR Repository

```bash
pulumi up --target infrastructure.ecr
```

**Outputs**:
- ECR repository URL

### Step 1.7: Create Secrets in Secrets Manager

```bash
# Database secret is auto-created by RDS
# Create API key secrets manually:

aws secretsmanager create-secret \
  --name learning-center-dev/elevenlabs/api-key \
  --secret-string "your-elevenlabs-api-key"

aws secretsmanager create-secret \
  --name learning-center-dev/openrouter/api-key \
  --secret-string "your-openrouter-api-key"

aws secretsmanager create-secret \
  --name learning-center-dev/openai/api-key \
  --secret-string "your-openai-api-key"
```

## Phase 2: Backend Deployment

### Step 2.1: Build Docker Image

```bash
# Build Laravel backend image
cd /path/to/Learning-Center
docker build -t learning-center-backend:latest -f infrastructure/pulumi/Dockerfile .

# Tag for ECR
ECR_REPO=$(pulumi stack output ecr_repository_url)
docker tag learning-center-backend:latest ${ECR_REPO}:latest
docker tag learning-center-backend:latest ${ECR_REPO}:$(git rev-parse --short HEAD)
```

### Step 2.2: Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_REPO}

# Push images
docker push ${ECR_REPO}:latest
docker push ${ECR_REPO}:$(git rev-parse --short HEAD)
```

### Step 2.3: Deploy ECS Cluster and Service

```bash
pulumi up --target infrastructure.ecs
```

**Outputs**:
- ECS cluster name
- ECS service name
- Task definition ARN

### Step 2.4: Deploy Application Load Balancer

```bash
pulumi up --target infrastructure.alb
```

**Outputs**:
- ALB DNS name
- Target group ARN

### Step 2.5: Run Database Migrations

```bash
# Get ECS task ID
TASK_ID=$(aws ecs list-tasks --cluster learning-center-cluster --service-name learning-center-service --query 'taskArns[0]' --output text)

# Run migrations
aws ecs execute-command \
  --cluster learning-center-cluster \
  --task $TASK_ID \
  --container laravel \
  --command "php artisan migrate --force" \
  --interactive
```

### Step 2.6: Verify Backend Health

```bash
# Check ALB health
ALB_DNS=$(pulumi stack output alb_dns_name)
curl http://${ALB_DNS}/health

# Should return: {"status":"ok"}
```

## Phase 3: Frontend Deployment

### Step 3.1: Build React Frontend

```bash
cd /path/to/Learning-Center
npm install
npm run build

# Output: dist/ directory
```

### Step 3.2: Deploy to S3

```bash
# Get bucket name
FRONTEND_BUCKET=$(pulumi stack output s3_frontend_bucket)

# Sync build to S3
aws s3 sync dist/ s3://${FRONTEND_BUCKET}/ --delete

# Set cache headers for static assets
aws s3 cp s3://${FRONTEND_BUCKET}/ s3://${FRONTEND_BUCKET}/ \
  --recursive \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable"
```

### Step 3.3: Deploy CloudFront Distribution

```bash
pulumi up --target infrastructure.cloudfront
```

**Outputs**:
- CloudFront distribution ID
- CloudFront domain name

### Step 3.4: Invalidate CloudFront Cache

```bash
# After frontend updates
DISTRIBUTION_ID=$(pulumi stack output cloudfront_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

### Step 3.5: Configure Route53 DNS

```bash
# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(pulumi stack output cloudfront_url)

# Create Route53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id <your-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.fibonacco.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'${CLOUDFRONT_DOMAIN}'"}]
      }
    }]
  }'
```

## Phase 4: Queue Workers

### Step 4.1: Create Queue Worker Task Definition

Create a separate ECS task definition for queue workers:

```python
# Add to infrastructure/pulumi/infrastructure/ecs.py
queue_worker_task = aws.ecs.TaskDefinition(
    f"{project_name}-queue-worker-task",
    family=f"{project_name}-queue-worker",
    network_mode="awsvpc",
    requires_compatibilities=["FARGATE"],
    cpu="256",
    memory="512",
    execution_role_arn=execution_role.arn,
    task_role_arn=task_role.arn,
    container_definitions=json.dumps([{
        "name": "queue-worker",
        "image": image,
        "command": ["php", "artisan", "queue:work", "redis", "--sleep=3", "--tries=3"],
        "environment": [
            {"name": "APP_ENV", "value": environment},
            {"name": "QUEUE_CONNECTION", "value": "redis"},
            # ... other env vars
        ],
        # ... secrets, logging, etc.
    }]),
)
```

### Step 4.2: Deploy Queue Worker Service

```bash
# Deploy queue worker service
pulumi up --target infrastructure.queue_worker
```

### Step 4.3: Scale Queue Workers

Configure auto-scaling based on queue depth:

```bash
# Set desired count
aws ecs update-service \
  --cluster learning-center-cluster \
  --service learning-center-queue-worker \
  --desired-count 2
```

## Phase 5: Scheduled Tasks

### Step 5.1: Create ECS Scheduled Task (EventBridge)

Create EventBridge rule to run Laravel scheduler:

```python
# Add to infrastructure/pulumi/infrastructure/ecs.py
scheduler_rule = aws.cloudwatch.EventRule(
    f"{project_name}-scheduler",
    name=f"{project_name}-scheduler",
    schedule_expression="rate(1 minute)",
    description="Run Laravel scheduler",
)

scheduler_target = aws.cloudwatch.EventTarget(
    f"{project_name}-scheduler-target",
    rule=scheduler_rule.name,
    arn=ecs_cluster.arn,
    ecs_target=aws.cloudwatch.EventTargetEcsTargetArgs(
        task_count=1,
        task_definition_arn=task_definition.arn,
        launch_type="FARGATE",
        network_configuration=aws.cloudwatch.EventTargetEcsTargetNetworkConfigurationArgs(
            subnets=private_subnets,
            security_groups=[ecs_sg.id],
        ),
    ),
)
```

### Step 5.2: Alternative: Continuous Scheduler Task

Run scheduler as a continuous ECS task:

```bash
# Create scheduler task definition
aws ecs register-task-definition \
  --family learning-center-scheduler \
  --network-mode awsvpc \
  --requires-compatibilities FARGATE \
  --cpu 256 \
  --memory 512 \
  --container-definitions '[{
    "name": "scheduler",
    "image": "'${ECR_REPO}':latest",
    "command": ["php", "artisan", "schedule:work"],
    "environment": [...]
  }]'

# Run as ECS task
aws ecs run-task \
  --cluster learning-center-cluster \
  --task-definition learning-center-scheduler \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...]}"
```

## Phase 6: Monitoring & Logging

### Step 6.1: CloudWatch Logs

Logs are automatically configured in ECS task definitions:
- **Log Group**: `/ecs/{project_name}`
- **Retention**: 7 days (configurable)

### Step 6.2: CloudWatch Metrics

Enable Container Insights:

```bash
aws ecs update-cluster \
  --cluster learning-center-cluster \
  --settings name=containerInsights,value=enabled
```

### Step 6.3: Application Monitoring

Configure Laravel logging:

```php
// config/logging.php
'channels' => [
    'cloudwatch' => [
        'driver' => 'monolog',
        'handler' => \Monolog\Handler\CloudWatchHandler::class,
        'formatter' => \Monolog\Formatter\JsonFormatter::class,
        'with' => [
            'group_name' => '/ecs/learning-center',
            'stream_name' => 'laravel',
        ],
    ],
],
```

### Step 6.4: Set Up Alarms

Create CloudWatch alarms for:
- High CPU utilization
- High memory utilization
- Failed task count
- Queue depth
- Database connections

---

# ENVIRONMENT CONFIGURATION

## Laravel Environment Variables

Create `.env` file or configure via Secrets Manager:

```env
APP_NAME="Fibonacco Operations Platform"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.fibonacco.com

# Database (from Secrets Manager)
DB_CONNECTION=pgsql
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_DATABASE=learning_center
DB_USERNAME=postgres
DB_PASSWORD=<from-secrets-manager>

# Redis (from ElastiCache)
REDIS_HOST=<redis-endpoint>
REDIS_PASSWORD=null
REDIS_PORT=6379
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# External Services
ELEVENLABS_API_KEY=<from-secrets-manager>
OPENROUTER_API_KEY=<from-secrets-manager>
OPENAI_API_KEY=<from-secrets-manager>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
STRIPE_KEY=<your-stripe-key>
STRIPE_SECRET=<your-stripe-secret>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>

# AWS
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<assets-bucket-name>
```

## Pulumi Stack Configuration

### Development (`Pulumi.dev.yaml`)

```yaml
config:
  aws:region: us-east-1
  learning-center:project_name: learning-center
  learning-center:environment: dev
  learning-center:use_existing_vpc: false
```

### Production (`Pulumi.production.yaml`)

```yaml
config:
  aws:region: us-east-1
  learning-center:project_name: learning-center
  learning-center:environment: production
  learning-center:use_existing_vpc: true
  learning-center:existing_vpc_id: vpc-xxxxx
```

---

# CI/CD PIPELINE

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Pulumi
        uses: pulumi/actions@v1
      
      - name: Install dependencies
        run: |
          cd infrastructure/pulumi
          pip install -r requirements.txt
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy infrastructure
        run: |
          cd infrastructure/pulumi
          pulumi stack select ${{ github.ref == 'refs/heads/main' && 'production' || 'dev' }}
          pulumi up --yes

  build-backend:
    runs-on: ubuntu-latest
    needs: deploy-infrastructure
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        run: |
          ECR_REPO=$(pulumi stack output ecr_repository_url)
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO
      
      - name: Build and push Docker image
        run: |
          ECR_REPO=$(pulumi stack output ecr_repository_url)
          docker build -t $ECR_REPO:latest -f infrastructure/pulumi/Dockerfile .
          docker tag $ECR_REPO:latest $ECR_REPO:${{ github.sha }}
          docker push $ECR_REPO:latest
          docker push $ECR_REPO:${{ github.sha }}
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster learning-center-cluster \
            --service learning-center-service \
            --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build frontend
        run: npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          FRONTEND_BUCKET=$(pulumi stack output s3_frontend_bucket)
          aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete
      
      - name: Invalidate CloudFront
        run: |
          DISTRIBUTION_ID=$(pulumi stack output cloudfront_distribution_id)
          aws cloudfront create-invalidation \
            --distribution-id $DISTRIBUTION_ID \
            --paths "/*"
```

## Manual Deployment Steps

### Backend Deployment

```bash
# 1. Build and push Docker image
ECR_REPO=$(pulumi stack output ecr_repository_url)
docker build -t $ECR_REPO:latest -f infrastructure/pulumi/Dockerfile .
docker tag $ECR_REPO:latest $ECR_REPO:$(git rev-parse --short HEAD)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO
docker push $ECR_REPO:latest
docker push $ECR_REPO:$(git rev-parse --short HEAD)

# 2. Update ECS service
aws ecs update-service \
  --cluster learning-center-cluster \
  --service learning-center-service \
  --force-new-deployment

# 3. Run migrations (if needed)
# Use ECS exec or create a one-time task
```

### Frontend Deployment

```bash
# 1. Build frontend
npm run build

# 2. Deploy to S3
FRONTEND_BUCKET=$(pulumi stack output s3_frontend_bucket)
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete

# 3. Invalidate CloudFront
DISTRIBUTION_ID=$(pulumi stack output cloudfront_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

# SECURITY CONFIGURATION

## IAM Roles and Policies

### ECS Task Role

- **Purpose**: Permissions for application code
- **Policies**:
  - Secrets Manager read access
  - S3 read/write access (for assets)
  - SES send email
  - CloudWatch Logs write

### ECS Execution Role

- **Purpose**: Permissions for ECS agent
- **Policies**:
  - ECR image pull
  - CloudWatch Logs write
  - Secrets Manager read

## Security Groups

### ALB Security Group

- **Ingress**: HTTP (80), HTTPS (443) from internet
- **Egress**: All traffic

### ECS Security Group

- **Ingress**: HTTP (80) from ALB security group only
- **Egress**: All traffic (for external API calls)

### RDS Security Group

- **Ingress**: PostgreSQL (5432) from ECS security group only
- **Egress**: None

### Redis Security Group

- **Ingress**: Redis (6379) from ECS security group only
- **Egress**: None

## Secrets Management

- All sensitive data stored in AWS Secrets Manager
- Secrets referenced in ECS task definitions
- No secrets in environment variables or code
- Rotate secrets regularly

## SSL/TLS Certificates

- Use ACM certificates for HTTPS
- Configure ALB listener on port 443
- Redirect HTTP to HTTPS
- CloudFront uses default certificate (or custom ACM certificate)

## Network Security

- All resources in private subnets (except ALB)
- No direct internet access for ECS tasks
- NAT Gateway for outbound internet access
- VPC endpoints for AWS services (optional, for cost savings)

---

# SCALING STRATEGY

## ECS Auto-Scaling

### Application Service Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/learning-center-cluster/learning-center-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/learning-center-cluster/learning-center-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

### Queue Worker Scaling

Scale based on queue depth (requires custom metric):

```bash
# Create CloudWatch metric for queue depth
# Then create scaling policy based on metric
```

## RDS Scaling

### Vertical Scaling

```bash
# Modify instance class
aws rds modify-db-instance \
  --db-instance-identifier learning-center-db \
  --db-instance-class db.r6g.large \
  --apply-immediately
```

### Horizontal Scaling (Read Replicas)

```bash
# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier learning-center-db-replica \
  --source-db-instance-identifier learning-center-db
```

## Redis Scaling

### Vertical Scaling

```bash
# Modify node type
aws elasticache modify-replication-group \
  --replication-group-id learning-center-redis \
  --cache-node-type cache.r6g.large \
  --apply-immediately
```

### Horizontal Scaling (Cluster Mode)

Enable cluster mode for horizontal scaling (requires Redis 7+).

## ALB Target Group Configuration

- **Health Check**: `/health` endpoint
- **Deregistration Delay**: 30 seconds
- **Connection Draining**: Enabled
- **Sticky Sessions**: Disabled (stateless API)

---

# BACKUP & DISASTER RECOVERY

## RDS Backups

- **Automated Backups**: Enabled (7-day retention)
- **Backup Window**: 03:00-04:00 UTC
- **Snapshot Retention**: 7 days
- **Point-in-Time Recovery**: Enabled

### Manual Snapshots

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier learning-center-db \
  --db-snapshot-identifier learning-center-manual-$(date +%Y%m%d)
```

### Restore from Snapshot

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier learning-center-db-restored \
  --db-snapshot-identifier learning-center-manual-20241201
```

## S3 Versioning

- **Frontend Bucket**: Versioning enabled
- **Assets Bucket**: Versioning enabled
- **Lifecycle Policies**: Move old versions to Glacier after 90 days

## Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour (RDS PITR)

### Recovery Steps

1. Restore RDS from latest snapshot or PITR
2. Restore S3 buckets from version history
3. Redeploy ECS services
4. Update DNS if needed
5. Verify application health

---

# COST OPTIMIZATION

## Resource Sizing Recommendations

### Development Environment

| Resource | Size | Estimated Cost |
|----------|------|----------------|
| RDS | db.t4g.medium | ~$50/month |
| Redis | cache.t4g.micro | ~$15/month |
| ECS Tasks | 0.5 vCPU, 1 GB | ~$20/month |
| ALB | Standard | ~$20/month |
| CloudFront | Pay-per-use | ~$5/month |
| S3 | Pay-per-use | ~$5/month |
| **Total** | | **~$115/month** |

### Production Environment

| Resource | Size | Estimated Cost |
|----------|------|----------------|
| RDS | db.r6g.large (Multi-AZ) | ~$400/month |
| Redis | cache.r6g.large (Multi-AZ) | ~$200/month |
| ECS Tasks | 2 vCPU, 4 GB (auto-scaling) | ~$150/month |
| ALB | Standard | ~$20/month |
| CloudFront | Pay-per-use | ~$50/month |
| S3 | Pay-per-use | ~$20/month |
| **Total** | | **~$840/month** |

## Cost Optimization Strategies

1. **Reserved Instances**: Use RDS Reserved Instances for 1-3 year commitments (30-50% savings)
2. **Spot Instances**: Use Spot for non-critical workloads (not applicable to Fargate)
3. **S3 Lifecycle Policies**: Move old data to Glacier
4. **CloudFront Caching**: Maximize cache hit ratio
5. **Auto-Scaling**: Scale down during low-traffic periods
6. **VPC Endpoints**: Use VPC endpoints for AWS services (reduce NAT Gateway costs)
7. **CloudWatch Logs Retention**: Reduce retention period for non-critical logs

## Monitoring Costs

- Set up AWS Cost Explorer
- Configure billing alerts
- Review monthly cost reports
- Optimize based on usage patterns

---

# CONCLUSION

This implementation plan provides step-by-step instructions for deploying the Fibonacco Operations Platform on AWS. Follow the phases sequentially, and refer to the architecture document (`OPERATIONS_PLATFORM_ARCHITECTURE.md`) for system design details.

For questions or issues, refer to:
- AWS Documentation: https://docs.aws.amazon.com/
- Pulumi Documentation: https://www.pulumi.com/docs/
- Laravel Documentation: https://laravel.com/docs/



