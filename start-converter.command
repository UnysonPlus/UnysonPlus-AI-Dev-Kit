#!/usr/bin/env bash
# ============================================================================
#  UnysonPlus Converter - START EVERYTHING (macOS / Linux)
#  Run from the AI Dev Kit root. Boots the capture service + dashboard
#  (http://localhost:4600 opens automatically) and Ollama if installed.
#  macOS: double-click this .command file (chmod +x once if needed).
# ============================================================================
cd "$(dirname "$0")" || exit 1
SVC="assembled/UnysonPlus-Capture-Service/tools/design-capture"
# Keep everything in the kit so deleting the kit leaves nothing behind.
export CAPTURE_OUT="$(pwd)/capture-out"
export OLLAMA_MODELS="$(pwd)/assembled/ollama/models"

# First-time setup: assemble the kit if it isn't populated yet (needs PowerShell 7 + git).
if [ ! -f "$SVC/serve.mjs" ]; then
  echo
  echo "  First-time setup: assembling the kit (plugin/theme/services). This happens once."
  echo
  if command -v pwsh >/dev/null 2>&1; then
    pwsh -File ./assemble.ps1 -Source github
  else
    echo "  PowerShell 7 (pwsh) is required to assemble. Install it from https://aka.ms/powershell,"
    echo "  then run this again — or run  pwsh ./assemble.ps1  manually."
  fi
fi
if [ ! -f "$SVC/serve.mjs" ]; then
  echo
  echo "  Setup did not complete. Ensure pwsh + git + Node 20+ are installed, then run this again."
  read -r -p "Press Enter to close..." _
  exit 1
fi

# --- Run log: ONE file per launch (kept: 5 newest), everything the service + dashboard print. ------
#     Lives in the kit so deleting the kit removes them too.
LOGDIR="$(pwd)/logs"
mkdir -p "$LOGDIR"
# keep only the 5 newest run-*.log
ls -1t "$LOGDIR"/run-*.log 2>/dev/null | tail -n +6 | while IFS= read -r f; do rm -f "$f"; done
export UPWK_LOG="$LOGDIR/run-$(date +%Y%m%d-%H%M%S).log"
{
  echo "UnysonPlus AI Dev Kit - run log"
  echo "started: $(date)"
  echo "capture-out: $CAPTURE_OUT"
  echo "ollama-models: $OLLAMA_MODELS"
  echo "============================================================"
} > "$UPWK_LOG"
echo "  Logging this run to: $UPWK_LOG"
echo "  (the 5 newest run logs are kept in $LOGDIR)"

cd "$SVC" || exit 1
exec bash ./start-converter.sh
