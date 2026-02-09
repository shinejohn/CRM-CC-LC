#!/bin/bash
# Railway Environment Variables for Postgres-CC Service
# Usage: source this file or use with railway variables --set

SERVICE_NAME="Postgres-CC"

# PostgreSQL Connection Variables
railway variables --set DATABASE_PUBLIC_URL="postgresql://\${{PGUSER}}:\${{POSTGRES_PASSWORD}}@\${{RAILWAY_TCP_PROXY_DOMAIN}}:\${{RAILWAY_TCP_PROXY_PORT}}/\${{PGDATABASE}}" --service "$SERVICE_NAME"
railway variables --set DATABASE_URL="postgresql://\${{PGUSER}}:\${{POSTGRES_PASSWORD}}@\${{RAILWAY_PRIVATE_DOMAIN}}:5432/\${{PGDATABASE}}" --service "$SERVICE_NAME"
railway variables --set PGDATA="/var/lib/postgresql/data/pgdata" --service "$SERVICE_NAME"
railway variables --set PGDATABASE="\${{POSTGRES_DB}}" --service "$SERVICE_NAME"
railway variables --set PGHOST="\${{RAILWAY_PRIVATE_DOMAIN}}" --service "$SERVICE_NAME"
railway variables --set PGPASSWORD="\${{POSTGRES_PASSWORD}}" --service "$SERVICE_NAME"
railway variables --set PGPORT="5432" --service "$SERVICE_NAME"
railway variables --set PGUSER="\${{POSTGRES_USER}}" --service "$SERVICE_NAME"
railway variables --set POSTGRES_DB="railway" --service "$SERVICE_NAME"
railway variables --set POSTGRES_PASSWORD="byzYSxLWwyUxrySVkuwgVTgChvqrQRAt" --service "$SERVICE_NAME"
railway variables --set POSTGRES_USER="postgres" --service "$SERVICE_NAME"
railway variables --set RAILWAY_DEPLOYMENT_DRAINING_SECONDS="60" --service "$SERVICE_NAME"
railway variables --set SSL_CERT_DAYS="820" --service "$SERVICE_NAME"

echo "✅ Postgres-CC variables set"
