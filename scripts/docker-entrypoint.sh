#!/bin/sh
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${GREEN}[INFO]${NC} Starting Viago Server entrypoint..."

# Ensure POSTGRES_URL is set (use DATABASE_URL as fallback if not set)
if [ -z "$POSTGRES_URL" ] && [ -n "$DATABASE_URL" ]; then
  export POSTGRES_URL="$DATABASE_URL"
  echo "${YELLOW}[INFO]${NC} Set POSTGRES_URL from DATABASE_URL"
fi

# Parse POSTGRES_URL to get host and port
if [ -n "$POSTGRES_URL" ]; then
  # Extract host and port from POSTGRES_URL
  # Example: postgresql://user:pass@host:port/db
  DB_HOST=$(echo "$POSTGRES_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo "$POSTGRES_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

  if [ -z "$DB_PORT" ]; then
    DB_PORT=5432
  fi

  if [ -n "$DB_HOST" ]; then
    echo "${YELLOW}[WAIT]${NC} Waiting for database at ${DB_HOST}:${DB_PORT}..."
    /app/scripts/wait-for-it.sh "${DB_HOST}:${DB_PORT}" -t 60 -- echo "${GREEN}[INFO]${NC} Database is ready!"
  fi
fi

# Wait for Redis if REDIS_URL is set
if [ -n "$REDIS_URL" ]; then
  # Extract host and port from REDIS_URL
  # Example: redis://:password@host:port
  REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
  REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\)$/\1/p')

  if [ -z "$REDIS_PORT" ]; then
    REDIS_PORT=6379
  fi

  if [ -n "$REDIS_HOST" ]; then
    echo "${YELLOW}[WAIT]${NC} Waiting for Redis at ${REDIS_HOST}:${REDIS_PORT}..."
    /app/scripts/wait-for-it.sh "${REDIS_HOST}:${REDIS_PORT}" -t 60 -- echo "${GREEN}[INFO]${NC} Redis is ready!"
  fi
fi

# Run database seeding if SEED_DATABASE is true
if [ "$SEED_DATABASE" = "true" ] || [ "$SEED_DATABASE" = "1" ]; then
  echo "${YELLOW}[SEED]${NC} Seeding database..."
  pnpm seed:production || {
    echo "${RED}[ERROR]${NC} Seeding failed, but continuing..."
  }
fi

echo "${GREEN}[INFO]${NC} Starting application..."

# Execute the main command (passed as arguments to this script)
exec "$@"