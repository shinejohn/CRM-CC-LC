#!/bin/bash
# Deployment script for Pulumi AWS infrastructure

set -e

echo "🚀 Deploying Learning Center Infrastructure to AWS..."

# Check prerequisites
command -v pulumi >/dev/null 2>&1 || { echo "❌ Pulumi CLI not found. Install from https://www.pulumi.com/docs/get-started/install/"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not found"; exit 1; }

# Navigate to infrastructure directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Select or create stack
STACK_NAME="${1:-production}"
echo "📋 Using stack: $STACK_NAME"

# Preview changes
echo "🔍 Previewing changes..."
pulumi preview --stack $STACK_NAME

# Confirm deployment
read -p "❓ Deploy these changes? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy
echo "🚀 Deploying infrastructure..."
pulumi up --stack $STACK_NAME --yes

# Output results
echo "✅ Deployment complete!"
echo ""
echo "📊 Stack outputs:"
pulumi stack output --stack $STACK_NAME

echo ""
echo "🎉 Infrastructure deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up database: Run migrations"
echo "2. Build and push Docker image"
echo "3. Deploy frontend to S3"
echo "4. Configure CloudFront"
