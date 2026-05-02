#!/usr/bin/env bash

set -euo pipefail

# Colors
_NC="\033[0m"; _RED="\033[0;31m"; _GRN="\033[0;32m"; _YLW="\033[0;33m"

# Helper functions
info() { echo -e "${_GRN}[INFO]${_NC} $*"; }
warn() { echo -e "${_YLW}[WARN]${_NC} $*"; }
err()  { echo -e "${_RED}[ERROR]${_NC} $*" 1>&2; }

# Load config if present
ENVIRONMENT="${1:-production}"
[[ -f .deploy/config ]] && source .deploy/config || true

# Set defaults
PROJECT_NAME="${PROJECT_NAME:-${CFG_PROJECT_NAME:-viago}}"
if [[ -z "${COMPOSE_FILE:-}" ]]; then
  if [[ -f "docker-compose.yml" ]]; then
    COMPOSE_FILE="docker-compose.yml"
  else
    COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
  fi
fi
COMPOSE_FILE="${COMPOSE_FILE:-${CFG_COMPOSE_FILE:-$COMPOSE_FILE}}"

# Auto-detect env file
if [[ -n "${ENV_FILE:-}" && -f "${ENV_FILE}" ]]; then
  ENV_FILE="${ENV_FILE}"
elif [[ -f ".env.${ENVIRONMENT}" ]]; then
  ENV_FILE=".env.${ENVIRONMENT}"
elif [[ -f .env ]]; then
  ENV_FILE=".env"
elif [[ -f .env.staging ]]; then
  ENV_FILE=".env.staging"
else
  ENV_FILE=""
fi
ENV_FILE="${ENV_FILE:-${CFG_ENV_FILE:-$ENV_FILE}}"

[[ -z "${ENV_FILE}" ]] && { err "Env file not found. Run setup.sh"; exit 1; }

# Export env file
if [[ -n "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

# Detect compose command
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  err "docker compose not found"; exit 1
fi

# Stop services
${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" stop || true

info "Services stopped."
