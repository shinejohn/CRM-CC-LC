#!/bin/bash

# Run Laravel Migrations

set -e

echo "🗄️  Running Laravel Migrations..."
echo ""

cd "$(dirname "$0")/.."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env && php artisan key:generate"
    exit 1
fi

# Check database connection
echo "🔍 Checking database connection..."
if php artisan db:show &> /dev/null; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo ""
    echo "Please check your .env file and ensure:"
    echo "  - DATABASE_URL is set correctly"
    echo "  - Or DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD are set"
    echo ""
    echo "For Railway:"
    echo "  - Get DATABASE_URL from Railway dashboard"
    echo "  - Or use: railway variables get DATABASE_URL"
    exit 1
fi

echo ""
echo "📊 Running migrations..."
php artisan migrate --force

echo ""
echo "✅ Migrations complete!"
echo ""
echo "Next steps:"
echo "  - Verify tables: php artisan db:show"
echo "  - Test API: php artisan serve"






