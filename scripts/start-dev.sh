#!/bin/bash
# TWNG Dev Server Launcher
# Kills any existing Vite process and starts fresh on port 5173
# Access at: http://192.168.64.11:5173

lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1
cd "$(dirname "$0")"
echo "Starting TWNG dev server..."
nohup npx vite --host 0.0.0.0 --port 5173 > /tmp/vite.log 2>&1 &
sleep 3
if curl -s -o /dev/null -w "" http://localhost:5173; then
  echo "✓ TWNG is live at: http://192.168.64.11:5173"
else
  echo "✗ Server failed to start. Check /tmp/vite.log"
  cat /tmp/vite.log
fi
