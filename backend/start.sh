#!/usr/bin/env bash

echo "=== Starting Fibonacco Backend ==="

# Start the Laravel scheduler in the background
php artisan schedule:work &
SCHEDULER_PID=$!
echo "Scheduler started (PID $SCHEDULER_PID)"

# Start Horizon (queue worker) in the background
php artisan horizon &
HORIZON_PID=$!
echo "Horizon started (PID $HORIZON_PID)"

# Start the HTTP API server in the foreground (main process — Railway health check target)
echo "Starting HTTP server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
