#!/usr/bin/env bash

echo "=== Starting Fibonacco Backend ==="

# ---------------------------------------------------------------------------
# Config cache (built here at BOOT, not at build time)
# ---------------------------------------------------------------------------
# We intentionally do NOT run `config:cache` in nixpacks.toml (build phase),
# because Railway's real env vars — most importantly APP_URL — are not reliably
# present during the Nixpacks build. Caching config at build time froze
# app.url=http://localhost into the cached config, which broke every url()
# call in production (Twilio SMS/call status callbacks pointed at localhost).
#
# Boot time is the first moment the real APP_URL (and all other dashboard env
# vars) are guaranteed present, so we build the config cache now. This must run
# BEFORE horizon and the HTTP server start so both read the correct cached
# config. It is idempotent and safe to run on every service/restart.
echo "Caching config with runtime environment (APP_URL=${APP_URL:-<unset>})..."
php artisan config:cache

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

# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------
# TODO (production hardening): this uses `php artisan serve`, PHP's built-in
# dev server. It is single-request-per-worker and not intended for production
# load. We keep it because this Nixpacks image (see nixpacks.toml [phases.setup])
# only installs php + composer + pdo_pgsql + redis — there is NO nginx,
# php-fpm, frankenphp, or heroku-php-apache2 available, so switching servers
# would mean adding and wiring new system packages, which is deploy-risky and
# out of scope for this conservative pass.
#
# Mitigation available WITHOUT changing the server: `php artisan serve` honors
# PHP_CLI_SERVER_WORKERS — set it (e.g. PHP_CLI_SERVER_WORKERS=4) in the Railway
# dashboard to run multiple worker processes and avoid head-of-line blocking.
# Proper fix later: move to frankenphp or php-fpm+nginx in the Nixpacks image.
#
# Runs in the foreground as the main process — Railway's health-check target.
echo "Starting HTTP server on port ${PORT:-8000} (workers=${PHP_CLI_SERVER_WORKERS:-1})..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
