#!/usr/bin/env bash
set -e

# Start the Laravel scheduler in the background
php artisan schedule:work &
SCHEDULER_PID=$!
echo "Scheduler started (PID $SCHEDULER_PID)"

# Start Horizon (queue worker) in the background
php artisan horizon &
HORIZON_PID=$!
echo "Horizon started (PID $HORIZON_PID)"

# Trap SIGTERM/SIGINT to gracefully shut down background processes
trap "echo 'Shutting down...'; kill $SCHEDULER_PID $HORIZON_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Start the HTTP API server in the foreground (main process)
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
