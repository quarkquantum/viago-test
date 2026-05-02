#!/usr/bin/env bash

set -euo pipefail

# Colors
_NC="\033[0m"; _RED="\033[0;31m"; _GRN="\033[0;32m"; _YLW="\033[0;33m"

# Helper functions
info() { echo -e "${_GRN}[INFO]${_NC} $*"; }
warn() { echo -e "${_YLW}[WARN]${_NC} $*"; }
err()  { echo -e "${_RED}[ERROR]${_NC} $*" 1>&2; }

# Default values
USE_WEBSERVER="true" # legacy flag, kept for compatibility
BACKEND_PORT="3001"
CLIENT_PORT="3002"
PROJECT_NAME="viago"
ENVIRONMENT="production"
COMPOSE_FILE=""
ENV_FILE=""

show_help() {
  echo "Usage: $0 <domain_name> [environment] [options]"
  echo "Environments: dev, staging, production (default: staging)"
  echo "Options:"
  echo "  --project-name <name>           Compose project name (default: viago)"
  echo "  --compose-file <file>           Compose file path (default: docker-compose.yml or docker-compose.<env>.yml)"
  echo "  --env-file <file>               Env file to use (default: autodetect .env or .env.<env>)"
  echo "  --backend-port <port>           Host port for backend when exposing ports"
  echo "  --client-port <port>            Host port for client when exposing ports"
  echo "  --no-webserver                  Deprecated; implies exposing backend/client ports"
  echo "  -h, --help                      Show this help"
}

DOMAIN_NAME=""
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --project-name)
      PROJECT_NAME="${2:-}"; shift 2;;
    --compose-file)
      COMPOSE_FILE="${2:-}"; shift 2;;
    --env-file)
      ENV_FILE="${2:-}"; shift 2;;
    --backend-port)
      BACKEND_PORT="${2:-}"; shift 2;;
    --client-port)
      CLIENT_PORT="${2:-}"; shift 2;;
    --no-webserver)
      USE_WEBSERVER="false"; shift;;
    -h|--help)
      show_help; exit 0;;
    --*)
      err "Unknown option $1"; show_help; exit 1;;
    *)
      if [[ -z "$DOMAIN_NAME" ]]; then
        DOMAIN_NAME="$1"
      elif [[ -z "$ENVIRONMENT" || "$ENVIRONMENT" == "production" ]]; then
        ENVIRONMENT="$1"
      else
        err "Too many arguments. Expected: <domain_name> [environment]"; show_help; exit 1
      fi
      shift;;
  esac
done

if [[ -z "${DOMAIN_NAME}" ]]; then err "Domain name is required"; show_help; exit 1; fi

# Set compose file default
if [[ -z "$COMPOSE_FILE" ]]; then
  if [[ -f "docker-compose.yml" ]]; then
    COMPOSE_FILE="docker-compose.yml"
  else
    COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
  fi
fi

# Check requirements
command -v docker >/dev/null 2>&1 || { err "Missing command: docker"; exit 1; }
command -v awk >/dev/null 2>&1 || { err "Missing command: awk"; exit 1; }

# Detect compose command
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  err "docker compose not found"; exit 1
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  err "Compose file not found: ${COMPOSE_FILE}"; exit 1
fi

# Auto-detect env file
if [[ -z "${ENV_FILE}" ]]; then
  if [[ -f ".env.${ENVIRONMENT}" ]]; then
    ENV_FILE=".env.${ENVIRONMENT}"
  elif [[ -f .env ]]; then
    ENV_FILE=".env"
  elif [[ -f .env.staging ]]; then
    ENV_FILE=".env.staging"
  else
    ENV_FILE=".env"
  fi
fi

info "Using env file: ${ENV_FILE}"
info "Orchestrator: compose"

# Ensure .env base exists with required keys
if [[ ! -f "${ENV_FILE}" ]]; then
  info "Creating ${ENV_FILE}..."
  BASE_URL="https://${DOMAIN_NAME}"
  cat >"${ENV_FILE}" <<EOL
DOMAIN_NAME=${DOMAIN_NAME}
BASE_URL=${BASE_URL}
DISABLE_SIGNUP=false
EOL
fi

# Ensure critical secrets exist
if ! grep -E "^BETTER_AUTH_SECRET=" "${ENV_FILE}" >/dev/null 2>&1; then
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -hex 32)
  else
    SECRET=$(date +%s | sha256sum 2>/dev/null | awk '{print $1}' || echo "$(date +%s)$$")
  fi
  echo "BETTER_AUTH_SECRET=${SECRET}" >>"${ENV_FILE}"
  info "Added BETTER_AUTH_SECRET to ${ENV_FILE}"
fi

# Ensure basic auth users exist
if ! grep -E "^BASIC_AUTH_USERS=" "${ENV_FILE}" >/dev/null 2>&1; then
  info "Generating BASIC_AUTH_USERS..."
  # Use a known working bcrypt hash for admin:admin
  # Generated with: htpasswd -nbB admin admin
  HASH='$2y$05$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  echo "BASIC_AUTH_USERS=admin:$HASH" >>"${ENV_FILE}"
  info "Added BASIC_AUTH_USERS to ${ENV_FILE} (username: admin, password: admin)"
fi

# When not using a web reverse proxy, expose ports
if [[ "${USE_WEBSERVER}" == "false" ]]; then
  # Append or update port mappings
  grep -q '^HOST_BACKEND_PORT=' "${ENV_FILE}" && sed -i.bak "s/^HOST_BACKEND_PORT=.*/HOST_BACKEND_PORT=\"${BACKEND_PORT}:3001\"/" "${ENV_FILE}" || echo "HOST_BACKEND_PORT=\"${BACKEND_PORT}:3001\"" >>"${ENV_FILE}"
  grep -q '^HOST_CLIENT_PORT='  "${ENV_FILE}" && sed -i.bak "s/^HOST_CLIENT_PORT=.*/HOST_CLIENT_PORT=\"${CLIENT_PORT}:3002\"/"  "${ENV_FILE}" || echo "HOST_CLIENT_PORT=\"${CLIENT_PORT}:3002\""  >>"${ENV_FILE}"
  grep -q '^USE_WEBSERVER=' "${ENV_FILE}" && sed -i.bak "s/^USE_WEBSERVER=.*/USE_WEBSERVER=false/" "${ENV_FILE}" || echo "USE_WEBSERVER=false" >>"${ENV_FILE}"
fi

# Export env for this session
if [[ -n "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

# Persist deployment config for other scripts
mkdir -p .deploy
cat > .deploy/config <<EOF
CFG_PROJECT_NAME=${PROJECT_NAME}
CFG_COMPOSE_FILE=${COMPOSE_FILE}
CFG_ENV_FILE=${ENV_FILE}
EOF

# Deploy
info "Starting with ${COMPOSE_CMD}"
${COMPOSE_CMD} --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" up -d
info "Setup complete via Docker Compose."

info "You can view logs with: ${COMPOSE_CMD} logs -f"
