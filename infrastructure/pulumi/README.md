# Learning Center Infrastructure - Pulumi

This directory contains the Pulumi infrastructure code for deploying the Fibonacco Learning Center to AWS.

## Project Status

✅ **Project Name:** `learning-center`  
✅ **Organization:** `shinejohn-org`  
✅ **Runtime:** Python  
✅ **Backend:** Pulumi Cloud  

**View Project:** https://app.pulumi.com/shinejohn-org/learning-center

## Prerequisites

- Python 3.12+
- Pulumi CLI installed
- AWS CLI configured with credentials
- Pulumi Cloud account (logged in)

## Setup

1. **Install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Select or create a stack:**
   ```bash
   # Use existing dev stack
   pulumi stack select dev
   
   # Or create a new stack
   pulumi stack init <stack-name>
   ```

3. **Configure stack:**
   ```bash
   pulumi config set aws:region us-east-1
   pulumi config set project_name learning-center
   pulumi config set environment dev
   ```

## Deployment

1. **Preview changes:**
   ```bash
   pulumi preview
   ```

2. **Deploy infrastructure:**
   ```bash
   pulumi up
   ```

3. **View outputs:**
   ```bash
   pulumi stack output
   ```

## Infrastructure Components

- **VPC & Networking:** Custom VPC with public/private/database subnets
- **Compute:** ECS Fargate cluster with Application Load Balancer
- **Database:** RDS PostgreSQL with pgvector extension
- **Cache:** ElastiCache Redis
- **Storage:** S3 buckets (frontend, assets) with CloudFront CDN
- **Container Registry:** ECR repository
- **Secrets:** AWS Secrets Manager integration
- **DNS:** Route53 integration

## Configuration

Key configuration values:

- `aws:region` - AWS region (default: us-east-1)
- `project_name` - Project name (default: learning-center)
- `environment` - Environment name (dev, staging, production)
- `use_existing_vpc` - Use existing VPC (default: false)
- `existing_vpc_id` - Existing VPC ID (if using existing VPC)

Set secrets:
```bash
pulumi config set --secret openai_api_key <key>
pulumi config set --secret elevenlabs_api_key <key>
pulumi config set --secret openrouter_api_key <key>
```

## Stacks

- **dev:** Development environment
- **production:** Production environment

## Useful Commands

```bash
# View stack status
pulumi stack

# View configuration
pulumi config

# View outputs
pulumi stack output

# Destroy stack
pulumi destroy

# Refresh state
pulumi refresh
```

## Project Structure

```
.
├── __main__.py              # Main entry point
├── Pulumi.yaml              # Project configuration
├── Pulumi.dev.yaml          # Dev stack configuration
├── requirements.txt         # Python dependencies
└── infrastructure/          # Infrastructure modules
    ├── vpc.py
    ├── ecs.py
    ├── alb.py
    ├── rds.py
    ├── redis.py
    ├── s3.py
    ├── cloudfront.py
    ├── route53.py
    ├── secrets.py
    └── ecr.py
```

## Documentation

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [AWS Provider](https://www.pulumi.com/registry/packages/aws/)
- [Project Dashboard](https://app.pulumi.com/shinejohn-org/learning-center)
