#!/bin/bash
# Pusher / Real-time WebSocket Variables for Frontend
# Usage: source this file, set PUSHER_APP_KEY, then run the railway commands
# Or: ./railway-vars/Pusher.vars.sh
#
# Get your key from https://dashboard.pusher.com/

SERVICE_NAME="${FRONTEND_SERVICE:-CC-CRM-LC-FOA Front}"

if [ -z "${PUSHER_APP_KEY:-}" ]; then
  echo "Set PUSHER_APP_KEY first, e.g.:"
  echo "  export PUSHER_APP_KEY=your-pusher-app-key"
  echo "  export PUSHER_APP_CLUSTER=us2  # optional, default us2"
  echo ""
  echo "Then run:"
  echo "  railway variables --set \"VITE_PUSHER_APP_KEY=\$PUSHER_APP_KEY\" --service \"$SERVICE_NAME\""
  echo "  railway variables --set \"VITE_PUSHER_APP_CLUSTER=\${PUSHER_APP_CLUSTER:-us2}\" --service \"$SERVICE_NAME\""
  exit 1
fi

PUSHER_CLUSTER="${PUSHER_APP_CLUSTER:-us2}"

echo "Setting Pusher variables on $SERVICE_NAME..."
railway variables --set "VITE_PUSHER_APP_KEY=$PUSHER_APP_KEY" --service "$SERVICE_NAME"
railway variables --set "VITE_PUSHER_APP_CLUSTER=$PUSHER_CLUSTER" --service "$SERVICE_NAME"
echo "Done. Redeploy the Frontend service for changes to take effect."
