#!/bin/bash
# Railway Environment Variables for Redis Service
# Usage: source this file or use with railway variables --set

SERVICE_NAME="Redis"

# Redis Connection Variables
railway variables --set REDIS_PASSWORD="dASEMARUgvkpzXcUuQVRzRTbKANnehqp" --service "$SERVICE_NAME"
railway variables --set REDIS_PUBLIC_URL="redis://default:\${{REDIS_PASSWORD}}@\${{RAILWAY_TCP_PROXY_DOMAIN}}:\${{RAILWAY_TCP_PROXY_PORT}}" --service "$SERVICE_NAME"
railway variables --set REDIS_URL="redis://\${{REDISUSER}}:\${{REDIS_PASSWORD}}@\${{REDISHOST}}:\${{REDISPORT}}" --service "$SERVICE_NAME"
railway variables --set REDISHOST="\${{RAILWAY_PRIVATE_DOMAIN}}" --service "$SERVICE_NAME"
railway variables --set REDISPASSWORD="\${{REDIS_PASSWORD}}" --service "$SERVICE_NAME"
railway variables --set REDISPORT="6379" --service "$SERVICE_NAME"
railway variables --set REDISUSER="default" --service "$SERVICE_NAME"

echo "✅ Redis variables set"
