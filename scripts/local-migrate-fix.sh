#!/usr/bin/env bash
set -euo pipefail

# Local, non-production migration fixer
# This script mirrors a safe fix path for local testing of prod-like migrations

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_PATH:-$ROOT_DIR/.env}"

cd "$ROOT_DIR"

echo "[LOCAL-MIGRATE] Using env file: $ENV_FILE"

STATUS_OUT=""
if command -v pnpm >/dev/null 2>&1; then
  STATUS_OUT=$(pnpm --filter @repo/database migrate status 2>&1 || true)
fi
if [[ -z "$STATUS_OUT" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    STATUS_OUT=$(dotenv -e "$ENV_FILE" -- prisma migrate status 2>&1 || true)
  else
    STATUS_OUT="No env file found; cannot determine status."
  fi
fi

echo "$STATUS_OUT"

FAILED_MIG="20251013174927_add_better_auth"

if echo "$STATUS_OUT" | grep -q "P3009"; then
  echo "[LOCAL-MIGRATE] Detected failed migrations (P3009). Checking for $FAILED_MIG..."
  if echo "$STATUS_OUT" | grep -q "$FAILED_MIG"; then
    echo "[LOCAL-MIGRATE] Rolling back $FAILED_MIG..."
    dotenv -e "$ENV_FILE" -- prisma migrate resolve --rolled-back "$FAILED_MIG" || true
  else
    echo "[LOCAL-MIGRATE] $FAILED_MIG not clearly listed as applied; continuing without rollback."
  fi
else
  echo "[LOCAL-MIGRATE] No P3009 detected; proceeding to deploy."
fi

echo "[LOCAL-MIGRATE] Deploying migrations..."
dotenv -e "$ENV_FILE" -- prisma migrate deploy

echo "[LOCAL-MIGRATE] Migration deploy completed."
