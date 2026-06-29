#!/bin/bash
# ============================================================================
# 🔒 PRE-COMMIT VALIDATION — Open3DCalc
# Roda todas as verificações antes de permitir um commit.
# Se QUALQUER check falhar, o commit é bloqueado.
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ERRORS=0

check() {
  local name="$1"
  local cmd="$2"
  echo -ne "${CYAN}  ⏳ ${name}...${NC}"
  OUTPUT=$(eval "$cmd" 2>&1)
  if [ $? -eq 0 ]; then
    echo -e "\r${GREEN}  ✅ ${name}${NC}"
  else
    echo -e "\r${RED}  ❌ ${name}${NC}"
    echo "$OUTPUT" | head -30
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
}

echo ""
echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  🔒 PRE-COMMIT VALIDATION — Open3DCalc      ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. TypeScript Type Check ────────────────────────────────────────────────
echo -e "${CYAN}━━━ 1. TypeScript Type Check ━━━${NC}"
check "tsc --noEmit" "npx tsc --noEmit"

# ── 2. ESLint ───────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 2. ESLint (staged files) ━━━${NC}"
STAGED_TS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
if [ -n "$STAGED_TS" ]; then
  check "ESLint" "npx eslint --max-warnings=0 $STAGED_TS"
else
  echo -e "${GREEN}  ⏭️  Nenhum arquivo TS/TSX staged${NC}"
fi

# ── 3. Unused Imports Check ─────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 3. Unused Imports Check ━━━${NC}"
if [ -n "$STAGED_TS" ]; then
  for f in $STAGED_TS; do
    # Check for common unused import patterns
    if grep -q "import.*Font.*from '@react-pdf/renderer'" "$f" 2>/dev/null; then
      if ! grep -q "Font\." "$f" 2>/dev/null; then
        echo -e "${RED}  ❌ Unused import 'Font' in $f${NC}"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done
  echo -e "${GREEN}  ✅ No unused imports detected${NC}"
fi

# ── 4. React Hooks Rules ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 4. React Hooks Rules ━━━${NC}"
if [ -n "$STAGED_TS" ]; then
  HOOK_ERRORS=0
  for f in $STAGED_TS; do
    # Check for ref access during render (common mistake)
    if grep -q "Ref.*\.current" "$f" 2>/dev/null; then
      # Check if it's inside useMemo or render
      if grep -B2 -A2 "useMemo\|return (" "$f" 2>/dev/null | grep -q "Ref.*\.current"; then
        echo -e "${YELLOW}  ⚠️  Possible ref access during render in $f${NC}"
        HOOK_ERRORS=$((HOOK_ERRORS + 1))
      fi
    fi
    # Check for setState inside useEffect without proper deps
    if grep -q "useEffect.*\[\]" "$f" 2>/dev/null; then
      if grep -A5 "useEffect.*\[\]" "$f" 2>/dev/null | grep -q "setState\|setForm\|set[A-Z]"; then
        echo -e "${YELLOW}  ⚠️  Possible setState in useEffect with [] deps in $f${NC}"
        HOOK_ERRORS=$((HOOK_ERRORS + 1))
      fi
    fi
  done
  if [ $HOOK_ERRORS -eq 0 ]; then
    echo -e "${GREEN}  ✅ No React hooks issues detected${NC}"
  else
    ERRORS=$((ERRORS + HOOK_ERRORS))
  fi
fi

# ── 5. Prettier Format ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 5. Prettier Format ━━━${NC}"
STAGED_JSON=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(json|md|css)$' || true)
if [ -n "$STAGED_JSON" ]; then
  check "Prettier" "npx prettier --check $STAGED_JSON"
else
  echo -e "${GREEN}  ⏭️  Nenhum arquivo JSON/MD/CSS staged${NC}"
fi

# ── 6. Quick Tests (critical stores) ────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 6. Critical Store Tests ━━━${NC}"
check "Store tests" "npx vitest run --reporter=dot src/stores/__tests__/ 2>&1 | tail -5"

# ── 7. Build Validation ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━ 7. Build Validation ━━━${NC}"
check "npm run build" "npm run build 2>&1 | tail -3"

# ── RESULT ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED — commit allowed${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS CHECK(S) FAILED — commit BLOCKED${NC}"
  echo -e "${RED}   Fix the errors above and try again.${NC}"
  echo -e "${YELLOW}   Tip: Run 'npm run validate' locally to check before committing.${NC}"
  exit 1
fi
