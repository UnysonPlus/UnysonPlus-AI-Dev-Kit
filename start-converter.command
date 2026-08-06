#!/usr/bin/env bash
# ============================================================================
#  UnysonPlus Converter - START EVERYTHING (macOS / Linux)
#  Run from the AI Dev Kit root. Boots the capture service + dashboard
#  (http://localhost:4600 opens automatically) and Ollama if installed.
#  macOS: double-click this .command file (chmod +x once if needed).
# ============================================================================
cd "$(dirname "$0")" || exit 1
SVC="assembled/UnysonPlus-Capture-Service/tools/design-capture"

if [ ! -f "$SVC/serve.mjs" ]; then
  echo
  echo "  The capture service isn't assembled into the kit yet."
  echo "  Run once:   pwsh ./assemble.ps1   (pulls the capture service + extension),"
  echo "  then run this again."
  echo
  read -r -p "Press Enter to close..." _
  exit 1
fi

cd "$SVC" || exit 1
exec bash ./start-converter.sh
