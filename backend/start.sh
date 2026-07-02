#!/usr/bin/env bash

echo "=== Starting Fibonacco Backend ==="

# ---------------------------------------------------------------------------
# Scheduler guard (RUN_SCHEDULER)
# ---------------------------------------------------------------------------
# start.sh runs on EVERY Railway service that boots the backend (the "CC API"
# service AND the "horizon" service). If each one ran `schedule:work`, every
# scheduled task would fire on all of them simultaneously — duplicate Manifest
# Destiny runs, duplicate newsletters, duplicate PP syncs, etc.
#
# So the scheduler is OFF by default and only turns on when RUN_SCHEDULER is a
# truthy value ("1", "true", "yes"). Set RUN_SCHEDULER=1 in the Railway
# dashboard for EXACTLY ONE service (recommended: the "horizon" service) and
# leave it unset everywhere else.
#
# Belt-and-suspenders: the heavy scheduled tasks in routes/console.php also use
# ->onOneServer(), so even a misconfiguration won't double-run them.
# ---------------------------------------------------------------------------
case "${RUN_SCHEDULER:-}" in
    1|true|TRUE|yes|YES|on|ON)
        php artisan schedule:work &
        SCHEDULER_PID=$!
        echo "Scheduler ENABLED (RUN_SCHEDULER=${RUN_SCHEDULER}) — PID $SCHEDULER_PID"
        ;;
    *)
        echo "Scheduler DISABLED on this service (set RUN_SCHEDULER=1 on exactly one service to enable)"
        ;;
esac

# Start Horizon (queue worker) in the background
php artisan horizon &
HORIZON_PID=$!
echo "Horizon started (PID $HORIZON_PID)"

# Start the HTTP API server in the foreground (main process — Railway health check target)
echo "Starting HTTP server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
