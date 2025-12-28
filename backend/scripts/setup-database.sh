#!/bin/bash

# Setup Railway Database Connection for Laravel Backend

set -e

echo "🚂 Setting up Railway Database Connection..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from .env.example..."
    cp .env.example .env
    php artisan key:generate --no-interaction
fi

# Get DATABASE_URL from Railway (if linked)
if command -v railway &> /dev/null; then
    echo "📋 Checking Railway project connection..."
    
    # Check if linked
    if railway status &> /dev/null; then
        echo "✅ Railway project linked!"
        
        # Get DATABASE_URL
        echo "🔍 Getting DATABASE_URL from Railway..."
        DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
        
        if [ -n "$DATABASE_URL" ]; then
            echo "✅ Found DATABASE_URL from Railway"
            
            # Update .env with DATABASE_URL
            if grep -q "DATABASE_URL=" .env; then
                sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
            else
                echo "DATABASE_URL=$DATABASE_URL" >> .env
            fi
            
            echo "✅ DATABASE_URL configured in .env"
        else
            echo "⚠️  DATABASE_URL not found in Railway variables"
            echo "   Please set it manually in Railway dashboard"
        fi
    else
        echo "⚠️  Railway project not linked"
        echo "   Run: railway link"
    fi
else
    echo "⚠️  Railway CLI not found"
fi

echo ""
echo "📝 Manual Configuration:"
echo ""
echo "If Railway auto-config didn't work, update .env manually:"
echo ""
echo "External connection (for local dev):"
echo "  DB_HOST=trolley.proxy.rlwy.net"
echo "  DB_PORT=53826"
echo "  DB_DATABASE=railway"
echo "  DB_USERNAME=postgres"
echo "  DB_PASSWORD=<from Railway dashboard>"
echo ""
echo "Or use DATABASE_URL:"
echo "  DATABASE_URL=postgresql://postgres:password@trolley.proxy.rlwy.net:53826/railway"
echo ""
echo "✅ Database setup script complete!"
echo ""
echo "Next steps:"
echo "  1. Verify .env has correct database connection"
echo "  2. Run: php artisan migrate"






