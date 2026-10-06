#!/usr/bin/env bash
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
#
# converter-probe -- MIRROR the working copy, then run a probe against the INSTALLED converter.
#
# WHY THIS EXISTS: WordPress runs the installed plugin, never the working copy, so every edit needs a
# mirror before it can be tested. Doing that by hand loses a cycle every time it is forgotten, and the
# failure is misleading -- "method does not exist" reads as a syntax error in code that is actually fine.
# One command means a probe can never run against a stale copy.
#
#   probe.sh <php-file> [args...]      # mirror, then eval-file the probe
#   probe.sh --call '<php expr>'       # mirror, then evaluate one expression and print it
#   probe.sh --tests                   # mirror, then run every converter test suite
#   probe.sh --mirror-only             # just mirror + verify
#
# Private statics are reachable: the probe body runs inside the plugin, so use a ReflectionMethod.
set -uo pipefail

SRC="/d/Web Dev/unysonplus"
# The install to probe. Default: the localhost root install. Override per run, e.g. the Elementor
# output-target test site:  WP=/d/xampp/htdocs/elementor probe.sh --tests
WP="${WP:-/d/xampp/htdocs}"
DST="$WP/wp-content/plugins/unysonplus"
PHP="/d/xampp/php/php.exe"
CLI="/d/xampp/wp-cli.phar"
EXT="framework/extensions/site-converter"

lint_changed() {
  # A syntax error reaches the install as a fatal on EVERY page, so lint before copying, not after.
  local bad=0
  while IFS= read -r f; do
    "$PHP" -l "$f" >/dev/null 2>&1 || { echo "LINT FAIL: $f"; "$PHP" -l "$f" 2>&1 | head -3; bad=1; }
  done < <(find "$SRC/$EXT" -name '*.php' -newermt '-2 hours' 2>/dev/null)
  return $bad
}

mirror() {
  lint_changed || { echo "refusing to mirror a file that does not parse"; return 1; }
  cp -r "$SRC/$EXT/." "$DST/$EXT/" || return 1
  local d; d=$(diff -rq "$SRC/$EXT" "$DST/$EXT" 2>/dev/null | grep -v 'Only in' | head -3)
  if [ -n "$d" ]; then echo "MIRROR INCOMPLETE:"; echo "$d"; return 1; fi
  echo "mirrored $EXT -> $(basename "$WP") (verified by diff)"
}

run_file() { "$PHP" "$CLI" --path="$WP" --allow-root eval-file "$@"; }

case "${1:-}" in
  --mirror-only) mirror ;;
  --call)
    mirror || exit 1
    tmp="${TMPDIR:-/tmp}/probe-call-$$.php"
    printf '<?php\n$__v = %s;\nvar_export($__v);\necho "\n";\n' "$2" > "$tmp"
    run_file "$tmp"; rc=$?; rm -f "$tmp"; exit $rc ;;
  --tests)
    mirror || exit 1
    fail=0
    for t in "$DST/$EXT/tests"/*-test.php; do
      printf '\n===== %s\n' "$(basename "$t")"
      run_file "$t" 2>&1 | grep -E '^\s*(FAIL|[0-9]+ pass|.*PASS.*FAIL|pass=|Result)' | tail -4
      # a suite exits non-zero on any FAIL
      run_file "$t" >/dev/null 2>&1 || { echo "  ^ SUITE FAILED"; fail=1; }
    done
    exit $fail ;;
  ''|--help|-h)
    sed -n '3,18p' "$0" | sed 's|^# \{0,1\}||'; exit 0 ;;
  *)
    mirror || exit 1
    run_file "$@" ;;
esac
