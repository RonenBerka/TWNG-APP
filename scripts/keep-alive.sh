#!/bin/bash
# Keep-alive wrapper for Vite dev server
# Restarts automatically if the process dies

PORT=5173
DIR="/sessions/gracious-dreamy-mccarthy/twng-app"
LOG="/tmp/vite.log"

while true; do
  echo "[$(date)] Starting Vite dev server..." >> "$LOG"
  cd "$DIR" && npx vite --host 0.0.0.0 --port "$PORT" >> "$LOG" 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Vite exited with code $EXIT_CODE. Restarting in 2s..." >> "$LOG"
  sleep 2
done
