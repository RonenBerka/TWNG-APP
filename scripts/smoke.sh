#!/usr/bin/env bash
#
# Fast pulse check — no browser, no build. Verifies that a running deployment
# is being served and returns the expected app shell. Point it at anything:
#
#   ./scripts/smoke.sh                          # checks the live site
#   ./scripts/smoke.sh http://localhost:4173    # checks a local preview
#   SMOKE_URL=https://staging... ./scripts/smoke.sh
#
# Exits non-zero on the first failure so it can gate a deploy.

set -uo pipefail

URL="${1:-${SMOKE_URL:-https://shiny-muffin-21f968.netlify.app}}"
URL="${URL%/}"
fail=0

check_status() {
  local path="$1" expect="$2" code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$URL$path" 2>/dev/null) || code="000"
  if [ "$code" = "$expect" ]; then
    echo "  ok    $path -> $code"
  else
    echo "  FAIL  $path -> $code (expected $expect)"
    fail=1
  fi
}

echo "Smoke-testing $URL"

# Key routes must be served (SPA fallback returns index.html with 200).
check_status "/" 200
check_status "/explore" 200
check_status "/decoder" 200

# The served HTML must contain the app shell.
html=$(curl -s --max-time 20 "$URL/" 2>/dev/null)
for needle in '<title>TWNG' 'id="root"'; do
  if printf '%s' "$html" | grep -qF "$needle"; then
    echo "  ok    homepage contains: $needle"
  else
    echo "  FAIL  homepage missing:  $needle"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "SMOKE FAILED"
  exit 1
fi
echo "SMOKE PASSED"
