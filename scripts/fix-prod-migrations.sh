#!/usr/bin/env bash
set -euo pipefail

# Script to fix production migrations in a minimal, safe way.
# It checks current migration state, attempts rollback of known failed migration,
# then deploys migrations to bring prod to a healthy state.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

cd "$ROOT_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: environment file '$ENV_FILE' not found. Aborting." >&2
  exit 1
fi

echo "[MIGRATE] Checking prod migration status..."
STATUS_CMD="dotenv -e $ENV_FILE -- prisma migrate status"
STATUS_OUT=$(eval "$STATUS_CMD" 2>&1 || true)
echo "$STATUS_OUT"

FAILED_MIG=${FAILED_MIG:-"20251013174927_add_better_auth"}

if echo "$STATUS_OUT" | grep -q "P3009"; then
  echo "[MIGRATE] Detected failed migrations (P3009). Attempting rollback if candidate applied..."
  if echo "$STATUS_OUT" | grep -q "$FAILED_MIG"; then
    echo "[MIGRATE] Rolling back $FAILED_MIG..."
    dotenv -e "$ENV_FILE" -- prisma migrate resolve --rolled-back "$FAILED_MIG" || true
  else
    echo "[MIGRATE] Could not confirm $FAILED_MIG applied. Skipping rollback."
  fi
else
  echo "[MIGRATE] No P3009 detected; proceeding to deploy."
fi

echo "[MIGRATE] Deploying migrations..."
dotenv -e "$ENV_FILE" -- prisma migrate deploy

echo "[MIGRATE] Migration deploy completed."
