#!/bin/bash
# ============================================================
# TWNG — One-Click Deployment Script
# ============================================================
# This script handles:
#   1. Installing Supabase CLI (if needed)
#   2. Linking your Supabase project
#   3. Running the storage migration
#   4. Setting API key secrets
#   5. Deploying all 3 Edge Functions
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_REF="iqrmwetprpwjgzynrjay"
SUPABASE_URL="https://iqrmwetprpwjgzynrjay.supabase.co"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🎸  TWNG Deployment Script  🎸      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ---- Step 0: Check we're in the right directory ----
if [ ! -f "package.json" ] || [ ! -d "supabase/functions" ]; then
  echo -e "${RED}ERROR: Run this script from the twng-app directory.${NC}"
  echo "  cd twng-app && bash deploy.sh"
  exit 1
fi

# ---- Step 1: Install Supabase CLI ----
echo -e "${YELLOW}[1/6] Checking Supabase CLI...${NC}"

if command -v supabase &> /dev/null; then
  echo -e "  ${GREEN}✓ Supabase CLI already installed${NC}"
  SUPABASE_CMD="supabase"
elif command -v npx &> /dev/null; then
  echo "  Installing via npx (no global install needed)..."
  SUPABASE_CMD="npx supabase@latest"
  # Pre-download the CLI
  npx supabase@latest --version > /dev/null 2>&1 || true
  echo -e "  ${GREEN}✓ Using npx supabase${NC}"
elif command -v brew &> /dev/null; then
  echo "  Installing via Homebrew..."
  brew install supabase/tap/supabase
  SUPABASE_CMD="supabase"
  echo -e "  ${GREEN}✓ Installed via Homebrew${NC}"
else
  echo -e "${RED}ERROR: Need either npx or brew to install Supabase CLI.${NC}"
  echo "  Install Node.js: https://nodejs.org/"
  echo "  Or Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi

# ---- Step 2: Login to Supabase ----
echo ""
echo -e "${YELLOW}[2/6] Logging into Supabase...${NC}"
echo "  A browser window will open. Log in and copy the token."
echo ""
$SUPABASE_CMD login
echo -e "  ${GREEN}✓ Logged in${NC}"

# ---- Step 3: Link project ----
echo ""
echo -e "${YELLOW}[3/6] Linking to TWNG project (${PROJECT_REF})...${NC}"
$SUPABASE_CMD link --project-ref "$PROJECT_REF" 2>/dev/null || true
echo -e "  ${GREEN}✓ Project linked${NC}"

# ---- Step 4: Set API secrets ----
echo ""
echo -e "${YELLOW}[4/6] Setting API key secrets...${NC}"
echo ""

# Anthropic API Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo -e "  Enter your ${BLUE}Anthropic API key${NC} (for Claude Vision guitar analysis):"
  echo "  Get one at: https://console.anthropic.com/settings/keys"
  read -rsp "  ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY
  echo ""
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
  $SUPABASE_CMD secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
  echo -e "  ${GREEN}✓ ANTHROPIC_API_KEY set${NC}"
else
  echo -e "  ${YELLOW}⚠ Skipped ANTHROPIC_API_KEY (Magic Add AI will use demo mode)${NC}"
fi

# OpenAI API Key
if [ -z "$OPENAI_API_KEY" ]; then
  echo ""
  echo -e "  Enter your ${BLUE}OpenAI API key${NC} (for Whisper voice transcription):"
  echo "  Get one at: https://platform.openai.com/api-keys"
  read -rsp "  OPENAI_API_KEY: " OPENAI_API_KEY
  echo ""
fi

if [ -n "$OPENAI_API_KEY" ]; then
  $SUPABASE_CMD secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
  echo -e "  ${GREEN}✓ OPENAI_API_KEY set${NC}"
else
  echo -e "  ${YELLOW}⚠ Skipped OPENAI_API_KEY (voice recording will use demo mode)${NC}"
fi

# ---- Step 5: Deploy Edge Functions ----
echo ""
echo -e "${YELLOW}[5/6] Deploying Edge Functions...${NC}"
echo ""

FUNCTIONS=("analyze-guitar" "transcribe-audio" "verify-guitar")
DEPLOYED=0

for func in "${FUNCTIONS[@]}"; do
  echo -e "  Deploying ${BLUE}${func}${NC}..."
  if $SUPABASE_CMD functions deploy "$func" --no-verify-jwt 2>&1; then
    echo -e "  ${GREEN}✓ ${func} deployed${NC}"
    ((DEPLOYED++))
  else
    echo -e "  ${RED}✗ ${func} failed${NC}"
  fi
  echo ""
done

# ---- Step 6: Run storage migration ----
echo -e "${YELLOW}[6/6] Storage bucket setup...${NC}"
echo ""
echo -e "  ${YELLOW}⚠ MANUAL STEP: Run the storage migration in Supabase SQL Editor${NC}"
echo ""
echo "  1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo "  2. Paste the contents of: supabase/migrations/004_storage_bucket.sql"
echo "  3. Click 'Run'"
echo ""
echo "  (This creates the guitar-images storage bucket with proper RLS policies)"
echo ""

# ---- Summary ----
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Deployment Summary             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Edge Functions deployed: ${GREEN}${DEPLOYED}/3${NC}"
echo -e "  Project: ${PROJECT_REF}"
echo ""
if [ $DEPLOYED -eq 3 ]; then
  echo -e "  ${GREEN}🎉 All functions deployed successfully!${NC}"
else
  echo -e "  ${YELLOW}⚠ Some functions failed. Check the output above.${NC}"
fi
echo ""
echo -e "  ${YELLOW}Don't forget to run the storage migration (Step 6 above)!${NC}"
echo ""
echo -e "  Dashboard: https://supabase.com/dashboard/project/${PROJECT_REF}"
echo -e "  Functions: https://supabase.com/dashboard/project/${PROJECT_REF}/functions"
echo ""
echo -e "  ${GREEN}Your app is ready at: http://localhost:5173${NC}"
echo ""
