#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
#  Open3DCalc — Build Windows .exe from Linux
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Open3DCalc — Windows Build Helper${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""

# ── Check Wine ────────────────────────────────────────────────────
check_wine() {
  if command -v wine &>/dev/null; then
    echo -e "${GREEN}✓${NC} Wine found: $(wine --version 2>/dev/null || echo 'installed')"
    return 0
  else
    return 1
  fi
}

# ── Try to install Wine ──────────────────────────────────────────
install_wine() {
  echo -e "${YELLOW}⚠ Wine not found. Wine is required to build Windows installers on Linux.${NC}"
  echo ""
  echo "Choose an option:"
  echo "  1) Install Wine via apt (requires sudo password)"
  echo "  2) Skip Wine — build unpacked folder only (no .exe installer)"
  echo "  3) Exit"
  echo ""
  read -rp "Enter choice [1/2/3]: " choice

  case "$choice" in
    1)
      echo ""
      echo -e "${YELLOW}Installing Wine...${NC}"
      echo "You will be prompted for your sudo password."
      sudo dpkg --add-architecture i386 2>/dev/null || true
      sudo apt-get update -qq
      sudo apt-get install -y -qq wine wine64 wine32 2>/dev/null || sudo apt-get install -y -qq wine
      if check_wine; then
        echo -e "${GREEN}✓ Wine installed successfully!${NC}"
        return 0
      else
        echo -e "${RED}✗ Wine installation failed.${NC}"
        return 1
      fi
      ;;
    2)
      echo ""
      echo -e "${YELLOW}Building unpacked Windows folder (no installer)...${NC}"
      return 2
      ;;
    3)
      echo "Exiting."
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice.${NC}"
      exit 1
      ;;
  esac
}

# ── Build Functions ──────────────────────────────────────────────
build_with_installer() {
  local arch="${1:-x64}"
  echo ""
  echo -e "${GREEN}Building Windows NSIS installer (${arch})...${NC}"
  echo ""

  # Build renderer first
  npm run build:renderer

  # Build electron + Windows installer
  if [ "$arch" = "arm64" ]; then
    npm run build:win:arm64
  else
    npm run build:win
  fi

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✓ Windows build complete!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo ""
  echo "Output files:"
  ls -lh release/*.exe 2>/dev/null || echo "  (check release/ folder)"
  echo ""
}

build_unpacked_only() {
  local arch="${1:-x64}"
  echo ""
  echo -e "${YELLOW}Building unpacked Windows directory (${arch}) — no installer...${NC}"
  echo ""

  # Build renderer first
  npm run build:renderer

  # Build electron
  npm run build:electron

  # Build Windows unpacked only (no NSIS)
  npx electron-builder --win --dir --${arch}

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✓ Windows unpacked build complete!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
  echo ""
  echo "Output folder:"
  ls -d release/win-* 2>/dev/null || echo "  (check release/ folder)"
  echo ""
  echo -e "${YELLOW}Note: This is an unpacked folder, not an .exe installer.${NC}"
  echo -e "${YELLOW}Install Wine to generate the full .exe installer:${NC}"
  echo -e "${YELLOW}  sudo apt-get install wine${NC}"
  echo ""
}

# ── Main ─────────────────────────────────────────────────────────
cd "$(dirname "$0")/.." || exit 1

# Parse args
ARCH="${1:-x64}"

if [ "$ARCH" != "x64" ] && [ "$ARCH" != "arm64" ]; then
  echo -e "${RED}Usage: $0 [x64|arm64]${NC}"
  exit 1
fi

if check_wine; then
  build_with_installer "$ARCH"
else
  install_wine
  EXIT_CODE=$?
  if [ "$EXIT_CODE" -eq 0 ]; then
    build_with_installer "$ARCH"
  elif [ "$EXIT_CODE" -eq 2 ]; then
    build_unpacked_only "$ARCH"
  else
    echo -e "${RED}Cannot build without Wine. Install it manually:${NC}"
    echo "  sudo apt-get install wine"
    exit 1
  fi
fi
