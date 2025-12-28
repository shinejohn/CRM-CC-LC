#!/bin/bash
# Setup database after infrastructure deployment
# Enables pgvector and runs migrations

set -e

PROJECT_NAME="${PROJECT_NAME:-learning-center}"
ENVIRONMENT="${ENVIRONMENT:-production}"
PULUMI_STACK="${PULUMI_STACK:-production}"

echo "🗄️  Setting up database..."
echo ""

cd "$(dirname "$0")"

# Get RDS information
RDS_ENDPOINT=$(pulumi stack output rds_endpoint --stack "$PULUMI_STACK")
RDS_SECRET_ARN=$(pulumi stack output rds_secret_arn --stack "$PULUMI_STACK")

if [ -z "$RDS_ENDPOINT" ] || [ -z "$RDS_SECRET_ARN" ]; then
    echo "❌ Failed to get RDS information from stack outputs"
    exit 1
fi

echo "📋 RDS Endpoint: $RDS_ENDPOINT"
echo "🔐 Secret ARN: $RDS_SECRET_ARN"
echo ""

# Get database credentials
echo "🔑 Retrieving database credentials..."
DB_CREDS=$(aws secretsmanager get-secret-value --secret-id "$RDS_SECRET_ARN" --query SecretString --output text)

DB_HOST=$(echo "$DB_CREDS" | jq -r '.host // empty')
DB_NAME=$(echo "$DB_CREDS" | jq -r '.database // "learning_center"')
DB_USER=$(echo "$DB_CREDS" | jq -r '.username // "postgres"')
DB_PASS=$(echo "$DB_CREDS" | jq -r '.password // empty')

if [ -z "$DB_PASS" ]; then
    echo "⚠️  Password not found in secret"
    exit 1
fi

echo "✅ Credentials retrieved"
echo ""

# Enable extensions
echo "🔧 Enabling PostgreSQL extensions..."
export PGPASSWORD="$DB_PASS"

psql -h "$RDS_ENDPOINT" -U "$DB_USER" -d "$DB_NAME" <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
\q
EOF

echo "✅ Extensions enabled"
echo ""

# Run migrations via ECS
echo "📝 Running Laravel migrations..."
echo ""
echo "To run migrations, connect to ECS task:"
echo ""
echo "1. Get task ID:"
echo "   aws ecs list-tasks --cluster $PROJECT_NAME-cluster --service-name $PROJECT_NAME-service"
echo ""
echo "2. Run migrations:"
echo "   aws ecs execute-command \\"
echo "     --cluster $PROJECT_NAME-cluster \\"
echo "     --task <task-id> \\"
echo "     --container laravel \\"
echo "     --command 'php artisan migrate --force' \\"
echo "     --interactive"
echo ""

echo "✅ Database setup instructions provided"
