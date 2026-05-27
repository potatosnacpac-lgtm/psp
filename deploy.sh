#!/bin/bash
# ─────────────────────────────────────────
#  Snacpac — Netlify Deploy Script
#  Run this once from Terminal to go live.
# ─────────────────────────────────────────

set -e

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🚀 Snacpac → Netlify"
echo "────────────────────"

# 1. Install Netlify CLI if not present
if ! command -v netlify &> /dev/null; then
  echo "Installing Netlify CLI..."
  npm install -g netlify-cli
fi

# 2. Login (opens browser once — skipped if already logged in)
netlify login

# 3. Deploy from the snacpac folder
cd "$SITE_DIR"
netlify deploy --prod --dir . --message "Snacpac deploy $(date '+%Y-%m-%d')"

echo ""
echo "✅ Done! Your site is live."
