#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
#  sync-upstream.sh — Sync source from open3dcalc (web) to desktop
#
#  Usage:
#    npm run sync                    # sync from ../web
#    bash scripts/sync-upstream.sh   # same
#    bash scripts/sync-upstream.sh /custom/path/../web
#
#  This script copies everything from the upstream src/ directory
#  into the desktop fork's src/ directory while preserving the
#  `overrides/` subdirectory (which contains desktop-specific code).
# ──────────────────────────────────────────────────────────────────

set -euo pipefail

UPSTREAM="${1:-../web}"

# ── Pre-flight checks ─────────────────────────────────────────────

if [ ! -d "$UPSTREAM" ]; then
  echo "❌ Upstream directory not found: $UPSTREAM"
  echo "   Usage: $0 [path/../web]"
  exit 1
fi

if [ ! -d "$UPSTREAM/src" ]; then
  echo "❌ Upstream src/ directory not found in: $UPSTREAM"
  exit 1
fi

# ── Sync ──────────────────────────────────────────────────────────

echo "🔄 Syncing from $UPSTREAM/src/ → src/ ..."

rsync -av --delete \
  --exclude='overrides/' \
  --exclude='types/electron.d.ts' \
  --exclude='vite-env.d.ts' \
  "$UPSTREAM/src/" "src/"

echo "✅ Synced with $UPSTREAM"
echo ""
echo "   Remember to check if any new files need desktop-specific overrides."
echo "   Run tests: npm test"
