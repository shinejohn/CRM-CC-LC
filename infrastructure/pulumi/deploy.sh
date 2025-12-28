#!/bin/bash
# Complete AWS Deployment Script
# Deploys infrastructure, builds Docker image, and deploys application

set -e

echo "🚀 Starting AWS Deployment..."
echo ""

# Configuration
PROJECT_NAME="${PROJECT_NAME:-learning-center}"
ENVIRONMENT="${ENVIRONMENT:-production}"
REGION="${REGION:-us-east-1}"
PULUMI_STACK="${PULUMI_STACK:-production}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v pulumi &> /dev/null; then
    echo -e "${RED}❌ Pulumi not found. Install from https://www.pulumi.com/docs/get-started/install/${NC}"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install from https://aws.amazon.com/cli/${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Install from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure'${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo ""

# Navigate to Pulumi directory
cd "$(dirname "$0")"

# Check if Pulumi stack exists
echo "📦 Checking Pulumi stack..."
if ! pulumi stack ls | grep -q "$PULUMI_STACK"; then
    echo "Creating new Pulumi stack: $PULUMI_STACK"
    pulumi stack init "$PULUMI_STACK"
fi

pulumi stack select "$PULUMI_STACK"
echo -e "${GREEN}✅ Stack selected: $PULUMI_STACK${NC}"
echo ""

# Set Pulumi configuration
echo "⚙️  Configuring Pulumi..."
pulumi config set project_name "$PROJECT_NAME" --stack "$PULUMI_STACK"
pulumi config set environment "$ENVIRONMENT" --stack "$PULUMI_STACK"
pulumi config set region "$REGION" --stack "$PULUMI_STACK"

# Check for existing VPC option
if [ -n "$EXISTING_VPC_ID" ]; then
    echo "Using existing VPC: $EXISTING_VPC_ID"
    pulumi config set use_existing_vpc true --stack "$PULUMI_STACK"
    pulumi config set existing_vpc_id "$EXISTING_VPC_ID" --stack "$PULUMI_STACK"
fi

echo -e "${GREEN}✅ Configuration set${NC}"
echo ""

# Deploy infrastructure
echo "🏗️  Deploying AWS infrastructure..."
echo "This may take 15-30 minutes..."
pulumi up --yes --stack "$PULUMI_STACK"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Infrastructure deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Infrastructure deployed${NC}"
echo ""

# Get outputs
echo "📊 Getting deployment outputs..."
ECR_URL=$(pulumi stack output ecr_repository_url --stack "$PULUMI_STACK")
RDS_ENDPOINT=$(pulumi stack output rds_endpoint --stack "$PULUMI_STACK")
RDS_SECRET_ARN=$(pulumi stack output rds_secret_arn --stack "$PULUMI_STACK")
ALB_DNS=$(pulumi stack output alb_dns_name --stack "$PULUMI_STACK")
CLOUDFRONT_URL=$(pulumi stack output cloudfront_url --stack "$PULUMI_STACK")
S3_BUCKET=$(pulumi stack output s3_frontend_bucket --stack "$PULUMI_STACK")

echo -e "${GREEN}✅ Outputs retrieved${NC}"
echo ""

# Build and push Docker image
echo "🐳 Building Docker image..."
cd ../..
docker build -f infrastructure/pulumi/Dockerfile -t "$ECR_URL:latest" .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built${NC}"
echo ""

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ECR login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged into ECR${NC}"
echo ""

# Push image
echo "📤 Pushing Docker image to ECR..."
docker push "$ECR_URL:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image pushed${NC}"
echo ""

# Update ECS service
echo "🔄 Updating ECS service..."
CLUSTER_NAME=$(pulumi stack output ecs_cluster_name --stack "$PULUMI_STACK")
SERVICE_NAME=$(pulumi stack output ecs_service_name --stack "$PULUMI_STACK")

aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$SERVICE_NAME" \
    --force-new-deployment \
    --region "$REGION" > /dev/null

echo -e "${GREEN}✅ ECS service updated${NC}"
echo ""

# Wait for service to stabilize
echo "⏳ Waiting for ECS service to stabilize..."
aws ecs wait services-stable \
    --cluster "$CLUSTER_NAME" \
    --services "$SERVICE_NAME" \
    --region "$REGION"

echo -e "${GREEN}✅ ECS service is stable${NC}"
echo ""

# Set API keys in Secrets Manager
echo "🔑 Setting API keys in Secrets Manager..."
echo -e "${YELLOW}⚠️  You need to set API keys manually:${NC}"
echo ""
echo "Run these commands (replace with your actual keys):"
echo ""
echo "aws secretsmanager put-secret-value \\"
echo "  --secret-id $PROJECT_NAME-$ENVIRONMENT/openai/api-key \\"
echo "  --secret-string 'YOUR_OPENAI_KEY'"
echo ""
echo "aws secretsmanager put-secret-value \\"
echo "  --secret-id $PROJECT_NAME-$ENVIRONMENT/elevenlabs/api-key \\"
echo "  --secret-string 'YOUR_ELEVENLABS_KEY'"
echo ""
echo "aws secretsmanager put-secret-value \\"
echo "  --secret-id $PROJECT_NAME-$ENVIRONMENT/openrouter/api-key \\"
echo "  --secret-string 'YOUR_OPENROUTER_KEY'"
echo ""

# Setup database
echo "🗄️  Database setup required:"
echo ""
echo "1. Enable pgvector extension:"
echo "   psql -h $RDS_ENDPOINT -U postgres -d learning_center"
echo "   CREATE EXTENSION IF NOT EXISTS vector;"
echo ""
echo "2. Run Laravel migrations:"
echo "   (Connect to ECS task and run: php artisan migrate)"
echo ""

# Deploy frontend
echo "🌐 Frontend deployment:"
echo ""
echo "1. Build frontend:"
echo "   npm run build"
echo ""
echo "2. Upload to S3:"
echo "   aws s3 sync dist/ s3://$S3_BUCKET --delete"
echo ""

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Deployment Summary:"
echo ""
echo "  Backend API:  http://$ALB_DNS"
echo "  CloudFront:   https://$CLOUDFRONT_URL"
echo "  RDS:          $RDS_ENDPOINT"
echo "  ECR:          $ECR_URL"
echo ""
echo "📝 Next Steps:"
echo ""
echo "  1. Set API keys in Secrets Manager (see above)"
echo "  2. Enable pgvector extension in database"
echo "  3. Run Laravel migrations"
echo "  4. Build and deploy frontend to S3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
