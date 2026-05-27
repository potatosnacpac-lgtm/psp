#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Snacpac — Push to GitHub
#  Double-click this file in Finder to run.
#  It will open Terminal and do everything automatically.
# ─────────────────────────────────────────────────────────

cd "$(dirname "$0")"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Snacpac → GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Clear any stale git lock ──────────────────────────
rm -f .git/index.lock

# ── 2. Install GitHub CLI if missing ────────────────────
if ! command -v gh &>/dev/null; then
  echo "Installing GitHub CLI via Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install gh
fi

# ── 3. Log in to GitHub (opens browser once) ────────────
echo "Logging in to GitHub..."
gh auth login --hostname github.com --git-protocol https --web

# ── 4. Stage + commit ────────────────────────────────────
echo ""
echo "Staging files (videos may take a minute)..."
git add .
git commit -m "Initial commit — Snacpac website" 2>/dev/null || echo "Nothing new to commit."

# ── 5. Create repo + push ────────────────────────────────
echo ""
echo "Creating GitHub repo and pushing..."
gh repo create snacpac \
  --public \
  --description "Snacpac — Design & Motion Studio" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Done! Visit: https://github.com/$(gh api user --jq .login)/snacpac"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Next: connect this repo to Netlify for auto-deploys."
echo "  netlify.com → Add new site → Import from Git"
echo ""
read -p "Press Enter to close..."
