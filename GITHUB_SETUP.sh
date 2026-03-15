#!/bin/bash
# ============================================================
#  KnightOwl GST — GitHub Setup Script
#  Run this ONCE to push the code to your GitHub account
# ============================================================

echo ""
echo "  KnightOwl GST — GitHub Push Setup"
echo "  ==================================="
echo ""

# Check git is installed
if ! command -v git &> /dev/null; then
  echo "  [ERROR] Git not installed. Download from https://git-scm.com/"
  exit 1
fi

# Get GitHub details from user
read -p "  Enter your GitHub username: " GH_USER
read -p "  Enter the new repo name (e.g. knightowl-gst): " REPO_NAME
read -p "  Is this a private repo? (y/n): " IS_PRIVATE

echo ""
echo "  [INFO] Initialising git repository..."
git init
git add .
git commit -m "feat: initial commit — KnightOwl GST v2.0 CA Edition

- Full reconciliation engine (GSTR-2B vs Purchase Register)
- O→0 normalization, fuzzy matching (Levenshtein), split-rate aggregation
- Smart flags: RCM, ITC Blocked, Transport, Prior Period
- 5-tab Excel export with ITC Summary
- Multi-tenant SaaS with Supabase auth
- Knight Owl landing page with 3 pricing tiers
- CA firm modules: Clients, Team, Supplier Health, Notices, Due Dates
- GSTR-3B draft pre-fill
- Docker + Railway + Vercel deployment ready

Tested on: Lucichem May 2025 real data
Results: 36 exact, 1 fuzzy, 18 flagged (ITC leakage ₹24,194)"

echo ""
echo "  [INFO] Now create the repo on GitHub:"
echo "  1. Go to https://github.com/new"
echo "  2. Name it: $REPO_NAME"
if [ "$IS_PRIVATE" == "y" ]; then
  echo "  3. Set as PRIVATE"
else
  echo "  3. Set as PUBLIC"
fi
echo "  4. DO NOT add README, .gitignore or license (we have them)"
echo "  5. Click 'Create repository'"
echo ""
read -p "  Press Enter when you have created the repo on GitHub..."

echo ""
echo "  [INFO] Connecting to GitHub..."
git remote add origin https://github.com/$GH_USER/$REPO_NAME.git
git branch -M main
git push -u origin main

echo ""
echo "  ✅ Done! Your code is now on GitHub."
echo "  🔗 https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "  Next steps:"
echo "  1. Deploy backend to Railway:  https://railway.app"
echo "  2. Deploy frontend to Vercel:  https://vercel.com"
echo "  3. Setup Supabase auth:         https://supabase.com"
echo "  4. Read DEPLOY.md for full instructions"
echo ""
