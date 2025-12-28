#!/bin/bash

# Configure Railway Database Connection

set -e

echo "🚂 Configuring Railway Database Connection..."
echo ""

cd "$(dirname "$0")/.."

# Railway connection details
DB_HOST="trolley.proxy.rlwy.net"
DB_PORT="53826"
DB_DATABASE="railway"  # Default Railway database name
DB_USERNAME="postgres"  # Default Railway username

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from .env.example..."
    cp .env.example .env
    php artisan key:generate --no-interaction
fi

echo "📝 Updating .env with Railway database connection..."
echo ""
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_DATABASE"
echo "Username: $DB_USERNAME"
echo ""
echo "⚠️  You'll need to add the password manually or use DATABASE_URL"
echo ""

# Update database configuration in .env
sed -i '' "s/DB_CONNECTION=.*/DB_CONNECTION=pgsql/" .env 2>/dev/null || \
sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=pgsql/" .env

sed -i '' "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env 2>/dev/null || \
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env

sed -i '' "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env 2>/dev/null || \
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env

sed -i '' "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env 2>/dev/null || \
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE/" .env

sed -i '' "s/DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env 2>/dev/null || \
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME/" .env

# Check if password is set
if ! grep -q "DB_PASSWORD=" .env || grep -q "DB_PASSWORD=$" .env; then
    echo ""
    echo "⚠️  DB_PASSWORD not set in .env"
    echo ""
    echo "You need to:"
    echo "  1. Get password from Railway dashboard"
    echo "  2. Or use DATABASE_URL from Railway"
    echo ""
    echo "To set password manually, add to .env:"
    echo "  DB_PASSWORD=your_password_here"
    echo ""
    echo "Or use DATABASE_URL format:"
    echo "  DATABASE_URL=postgresql://postgres:password@$DB_HOST:$DB_PORT/$DB_DATABASE"
    echo ""
fi

echo "✅ Database configuration updated in .env"
echo ""
echo "📋 Next steps:"
echo "  1. Add DB_PASSWORD to .env (get from Railway dashboard)"
echo "  2. Test connection: php artisan db:show"
echo "  3. Run migrations: php artisan migrate"






