#!/bin/bash
# Run Database Migrations on Railway PostgreSQL
# Uses DATABASE_URL environment variable from Railway

set -e

echo "🗄️  Running Database Migrations"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    echo ""
    echo "Options:"
    echo "  1. Set DATABASE_URL manually:"
    echo "     export DATABASE_URL='postgresql://...'"
    echo ""
    echo "  2. Use Railway CLI:"
    echo "     railway link"
    echo "     railway run ./scripts/run-migrations.sh"
    echo ""
    echo "  3. Get DATABASE_URL from Railway dashboard:"
    echo "     Go to PostgreSQL service → Variables → DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Extract connection info for display (hide password)
CONN_INFO=$(echo "$DATABASE_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@|postgresql://user:***@|')
echo "📋 Connection: $CONN_INFO"
echo ""

# Enable extensions
echo "📦 Enabling PostgreSQL extensions..."
psql "$DATABASE_URL" <<EOF
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
EOF

echo "✅ Extensions enabled"
echo ""

# Check if migrations already run
echo "🔍 Checking existing tables..."
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLES" -gt 0 ]; then
    echo "⚠️  Warning: Database already has $TABLES table(s)"
    echo ""
    read -p "Continue with migrations? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Migrations cancelled"
        exit 1
    fi
fi

# Run migrations
echo ""
echo "🔄 Running migrations..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Migration 1: Initial Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" < infrastructure/migrations/001_initial_schema.sql

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Migration 2: Presentation Tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" < infrastructure/migrations/002_add_presentation_tables.sql

echo ""
echo "✅ Migrations completed successfully!"
echo ""

# Verify tables
echo "📊 Verifying database structure..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
echo "✅ Found $TABLE_COUNT tables"
echo ""

# List tables
echo "📋 Tables created:"
psql "$DATABASE_URL" -c "\dt" | grep -E "^\s+public" | awk '{print "  • " $3}'

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Verify all tables are created"
echo "  2. Check environment variables are set"
echo "  3. Test application connection"






