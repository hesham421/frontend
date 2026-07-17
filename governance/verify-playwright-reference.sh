#!/usr/bin/env bash
# Read-only helper: compare this repo's P3_5/test-plan.md reference copies
# against backend's live source of truth, when backend/ happens to be
# checked out as a sibling folder. Does not write anything outside /tmp.
#
# Usage: ./verify-playwright-reference.sh <MODULE>
#   e.g. ./verify-playwright-reference.sh ORG
#
# This script never regenerates PLAYWRIGHT content — regeneration only
# happens in backend/, via governance/governance-tools/agent3_splitter.py.
# See frontend/governance/README.md "Re-verifying PLAYWRIGHT content" for
# the full manual procedure this script assists with.

set -euo pipefail

MOD="${1:-}"
if [[ -z "$MOD" ]]; then
  echo "Usage: $0 <MODULE>  (e.g. ORG, FILESVC, NOTIFICATION)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_REF="$SCRIPT_DIR/modules/$MOD/P3_5/test-plan.md"
BACKEND_SOURCE="$SCRIPT_DIR/../../backend/governance/modules/$MOD/P3_5/test-plan.md"

if [[ ! -f "$LOCAL_REF" ]]; then
  echo "No local reference copy found at: $LOCAL_REF"
  echo "This module has no P3_5 reference copy in frontend/governance/ yet."
  exit 1
fi

if [[ ! -f "$BACKEND_SOURCE" ]]; then
  echo "backend/ is not available as a sibling checkout (looked for: $BACKEND_SOURCE)."
  echo
  echo "Cannot live-diff against the source of truth right now. This is expected"
  echo "when frontend/ is checked out alone. The local reference copy exists at:"
  echo "  $LOCAL_REF"
  echo
  echo "To fully re-verify or regenerate PLAYWRIGHT content, that must happen"
  echo "against backend/ (which owns agent3_splitter.py and the live"
  echo "P3_5/test-plan.md source) — then the updated PLAYWRIGHT output should be"
  echo "re-copied here. See frontend/governance/README.md for the full procedure."
  exit 0
fi

# Strip the REFERENCE COPY marker line + following blank line before diffing,
# since that marker only exists in the frontend-local copy.
TMP_LOCAL="$(mktemp)"
tail -n +3 "$LOCAL_REF" > "$TMP_LOCAL"
trap 'rm -f "$TMP_LOCAL"' EXIT

if diff -q "$TMP_LOCAL" "$BACKEND_SOURCE" > /dev/null; then
  echo "OK: $MOD's P3_5/test-plan.md reference copy matches backend/governance/modules/$MOD/P3_5/test-plan.md exactly."
else
  echo "DRIFT DETECTED: $MOD's reference copy differs from backend's source of truth."
  echo
  diff "$TMP_LOCAL" "$BACKEND_SOURCE" || true
  echo
  echo "This reference copy is stale. To fix: re-copy the current"
  echo "backend/governance/modules/$MOD/P3_5/test-plan.md into"
  echo "frontend/governance/modules/$MOD/P3_5/test-plan.md (keeping the REFERENCE"
  echo "COPY marker line at the top), and re-run this script to confirm."
fi
