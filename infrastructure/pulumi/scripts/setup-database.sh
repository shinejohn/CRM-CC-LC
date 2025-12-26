#!/bin/bash
# Setup database after infrastructure deployment
# Enables pgvector extension and runs migrations

set -e

echo "🗄️ Setting up database..."

# Get stack outputs
STACK_NAME="${1:-production}"

# Get RDS endpoint and secret ARN from Pulumi outputs
RDS_ENDPOINT=$(pulumi stack output rds_endpoint --stack $STACK_NAME)
RDS_SECRET_ARN=$(pulumi stack output rds_secret_arn --stack $STACK_NAME)

if [ -z "$RDS_ENDPOINT" ] || [ -z "$RDS_SECRET_ARN" ]; then
    echo "❌ Failed to get RDS information from stack outputs"
    exit 1
fi

echo "📋 RDS Endpoint: $RDS_ENDPOINT"
echo "🔐 Secret ARN: $RDS_SECRET_ARN"

# Get database credentials from Secrets Manager
echo "🔑 Retrieving database credentials..."
DB_CREDS=$(aws secretsmanager get-secret-value --secret-id $RDS_SECRET_ARN --query SecretString --output text)

# Extract connection details (assuming JSON format)
DB_HOST=$(echo $DB_CREDS | jq -r '.host // empty')
DB_NAME=$(echo $DB_CREDS | jq -r '.database // "learning_center"')
DB_USER=$(echo $DB_CREDS | jq -r '.username // "postgres"')
DB_PASS=$(echo $DB_CREDS | jq -r '.password // empty')

if [ -z "$DB_PASS" ]; then
    echo "⚠️ Password not found in secret. You may need to set it manually."
    echo "Run: aws secretsmanager put-secret-value --secret-id $RDS_SECRET_ARN --secret-string '{\"password\":\"YOUR_PASSWORD\"}'"
    exit 1
fi

# Enable extensions using psql (requires psql client)
echo "🔧 Enabling PostgreSQL extensions..."

PGPASSWORD=$DB_PASS psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
\q
EOF

echo "✅ Extensions enabled successfully!"

# Note: For migrations, you'll need to run Laravel migrations
echo ""
echo "📝 Next step: Run Laravel migrations"
echo "   cd backend"
echo "   php artisan migrate"
echo ""
echo "   Or via ECS exec:"
echo "   aws ecs execute-command --cluster learning-center-cluster --task <task-id> --container laravel --command 'php artisan migrate' --interactive"
