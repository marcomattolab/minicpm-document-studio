#!/usr/bin/env bash
#
# Avvia tutti e tre i servizi (OCR, backend, frontend) insieme.
# Premi Ctrl+C per fermarli tutti.
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGDIR="${LOGDIR:-/tmp/minicpm-ds}"
mkdir -p "$LOGDIR"

PIDS=()

killtree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    killtree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Arresto dei servizi..."
  for pid in "${PIDS[@]:-}"; do
    killtree "$pid"
  done
  echo "Fatto."
}

trap cleanup INT TERM EXIT

start() {
  local name="$1" script="$2"
  echo "Avvio: $name"
  "$script" > "$LOGDIR/$name.log" 2>&1 &
  PIDS+=("$!")
}

if [ ! -x "$REPO_ROOT/scripts/start_ocr.sh" ] ||
   [ ! -x "$REPO_ROOT/scripts/start_backend.sh" ] ||
   [ ! -x "$REPO_ROOT/scripts/start_frontend.sh" ]; then
  echo "Script di avvio mancanti. Esegui prima: ./scripts/setup.sh all" >&2
  exit 1
fi

start ocr      "$REPO_ROOT/scripts/start_ocr.sh"
start backend  "$REPO_ROOT/scripts/start_backend.sh"
start frontend "$REPO_ROOT/scripts/start_frontend.sh"

echo ""
echo "Tutti i servizi sono stati avviati (log in $LOGDIR):"
echo "  Frontend: http://127.0.0.1:4200"
echo "  Backend:  http://127.0.0.1:8000/api/health"
echo "  OCR:      http://127.0.0.1:18499/health"
echo ""
echo "Premi Ctrl+C per fermare tutto."

# Rimani in esecuzione finché un servizio non termina (o Ctrl+C).
wait
