#!/usr/bin/env bash
# Converter Training Harness — ORCHESTRATOR
# -----------------------------------------
# One command: (optionally) batch-capture a demo list, then audit every captured
# site through the real PHP converter and print a ranked list of fidelity flags.
# Designed to run in the BACKGROUND while you work on something else, then you read
# the CSV and only open the flagged sites.
#
#   bash train.sh [list]         capture (skip existing) + audit
#   bash train.sh [list] --audit-only   re-audit without re-capturing (fast; use
#                                       after a converter edit to see if flags cleared)
#
#   list = a sites/*.txt file (default: sites/openhero.txt)
#
# Env: NODE_PATH (playwright, for capture), WP_LOAD (wp-load.php, for audit),
#      PHP (php binary, default D:/xampp/php/php.exe), OUT (captures root).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
LIST="${1:-$HERE/sites/openhero.txt}"
MODE="${2:-full}"
PHP="${PHP:-/d/xampp/php/php.exe}"
: "${NODE_PATH:=/d/Web Dev/pw-screens/node_modules}"; export NODE_PATH
CS="$HERE/../../assembled/UnysonPlus-Capture-Service/tools/design-capture/capture.mjs"
OUT="${OUT:-$(dirname "$CS")/batch}"

echo "== converter-trainer =="
echo "list=$LIST  out=$OUT"

if [ "$MODE" != "--audit-only" ]; then
  echo "-- capture --"
  node "$HERE/capture.mjs" "$LIST" --out "$OUT" || { echo "capture failed"; exit 1; }
fi

echo "-- audit --"
"$PHP" "$HERE/audit.php" "$OUT" "$OUT/_audit.csv"
