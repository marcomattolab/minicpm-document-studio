#!/usr/bin/env bash
#
# Start the Angular frontend (dev server on http://127.0.0.1:4200).
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$REPO_ROOT/frontend/node_modules" ]; then
  echo "Frontend dependencies not installed. Run: ./scripts/setup.sh frontend" >&2
  exit 1
fi

cd "$REPO_ROOT/frontend"
exec npm start
