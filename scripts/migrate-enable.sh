#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

CMD=("pnpm" "--filter" "@repo/database" "migrate")
if [[ "${1-"}" == "--prod" ]]; then
  CMD=("pnpm" "--filter" "@repo/database" "migrate:prod")
fi

echo "Running migrations: ${CMD[*]}"
"${CMD[@]}"

echo "Migrations completed."
