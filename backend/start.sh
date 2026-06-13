#!/usr/bin/env bash
set -e

# Start the Laravel scheduler in the background
php artisan schedule:work &
SCHEDULER_PID=$!

echo "Scheduler started (PID $SCHEDULER_PID)"

# Start the HTTP server (foreground — this is the main process)
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
