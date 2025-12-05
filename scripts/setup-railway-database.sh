#!/bin/bash
# Railway Database Setup Script
# Sets up PostgreSQL database with migrations

set -e

echo "🗄️  Railway Database Setup"
echo "=========================="
echo ""

# Check if Railway CLI is authenticated
if ! railway whoami &>/dev/null; then
    echo "❌ Error: Railway CLI not authenticated"
    echo "   Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI authenticated"
echo ""

# Check if linked to project
if ! railway status &>/dev/null; then
    echo "⚠️  Not linked to a Railway project"
    echo "   Linking to CRM-CC-LC project..."
    echo "   (You may need to select the project)"
    railway link
fi

echo "✅ Linked to Railway project"
echo ""

# Check if PostgreSQL service exists
echo "📋 Checking for PostgreSQL service..."
if railway variables get DATABASE_URL &>/dev/null; then
    echo "✅ PostgreSQL service found (DATABASE_URL exists)"
else
    echo "❌ PostgreSQL service not found"
    echo ""
    echo "Please add PostgreSQL service in Railway dashboard:"
    echo "  1. Go to Railway dashboard"
    echo "  2. Select CRM-CC-LC project"
    echo "  3. Click '+ New' → 'Database' → 'Add PostgreSQL'"
    echo "  4. Wait for service to provision"
    echo ""
    read -p "Press Enter after PostgreSQL service is created..."
fi

echo ""
echo "📦 Setting up database extensions..."

# Enable extensions
railway run psql "$DATABASE_URL" <<EOF
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
EOF

echo "✅ Extensions enabled"
echo ""

# Run migrations
echo "🔄 Running migrations..."
echo ""

echo "Running migration: 001_initial_schema.sql"
railway run psql "$DATABASE_URL" < infrastructure/migrations/001_initial_schema.sql

echo ""
echo "Running migration: 002_add_presentation_tables.sql"
railway run psql "$DATABASE_URL" < infrastructure/migrations/002_add_presentation_tables.sql

echo ""
echo "✅ Migrations completed successfully!"
echo ""

# Verify tables
echo "📊 Verifying database tables..."
railway run psql "$DATABASE_URL" -c "\dt" | head -20

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set up environment variables (see RAILWAY_ENV_VARIABLES.md)"
echo "  2. Configure application settings"
echo "  3. Deploy application"

