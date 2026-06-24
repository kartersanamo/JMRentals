#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export DOCKER_BUILDKIT=1

# Read a single KEY=VALUE from .env / .env.local without sourcing (values may contain &, spaces, etc.)
read_env_var() {
  local key="$1"
  local file
  for file in .env .env.local; do
    [[ -f "$file" ]] || continue
    local line
    line="$(grep -E "^${key}=" "$file" 2>/dev/null | head -1)" || continue
    printf '%s' "${line#*=}"
    return 0
  done
  return 1
}

FOLLOW_LOGS=false
for arg in "$@"; do
  case "$arg" in
    --logs|-l) FOLLOW_LOGS=true ;;
    --help|-h)
      echo "Usage: ./deploy.sh [--logs]"
      echo "  --logs  Follow container logs after deploy (default: print last 30 lines and exit)"
      exit 0
      ;;
  esac
done

# NEXT_PUBLIC_* must be present at docker build time (inlined into the client bundle)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="$(read_env_var NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || true)"
NEXT_PUBLIC_MAPBOX_STYLE="$(read_env_var NEXT_PUBLIC_MAPBOX_STYLE || true)"
NEXT_PUBLIC_SITE_URL="$(read_env_var NEXT_PUBLIC_SITE_URL || true)"

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://jm.kartersanamo.com}"
CONTAINER_NAME="jm-rentals"
IMAGE_TAG="jm-rentals:latest"
HOST_PORT=8004
UPLOAD_DIR_HOST="${UPLOAD_DIR_HOST:-/var/lib/jm-rentals/uploads}"
UPLOAD_DIR_CONTAINER="/app/data/uploads"

ENV_FILE_ARGS=()
if [[ -f .env ]]; then
  ENV_FILE_ARGS=(--env-file .env)
elif [[ -f .env.local ]]; then
  ENV_FILE_ARGS=(--env-file .env.local)
fi

CACHE_FROM_ARGS=()
if docker image inspect "${IMAGE_TAG}" >/dev/null 2>&1; then
  CACHE_FROM_ARGS=(--cache-from "${IMAGE_TAG}")
fi

echo "Building ${IMAGE_TAG} (BuildKit cache enabled)..."
docker build -t "${IMAGE_TAG}" \
  --build-arg "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:-}" \
  --build-arg "NEXT_PUBLIC_MAPBOX_STYLE=${NEXT_PUBLIC_MAPBOX_STYLE:-mapbox://styles/mapbox/streets-v12}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  "${CACHE_FROM_ARGS[@]}" \
  .

if [[ -f .env ]] || [[ -f .env.local ]]; then
  echo "Checking database migrations on host..."
  if npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
    echo "Database schema is up to date."
  else
    echo "Applying pending database migrations on host..."
    npm run db:deploy
  fi
fi

mkdir -p "${UPLOAD_DIR_HOST}"

echo "Replacing container..."
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true

echo "Starting container on port ${HOST_PORT} (host network — uses DATABASE_URL from .env as-is)..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --network host \
  -v "${UPLOAD_DIR_HOST}:${UPLOAD_DIR_CONTAINER}" \
  "${ENV_FILE_ARGS[@]}" \
  -e HOSTNAME=0.0.0.0 \
  -e "PORT=${HOST_PORT}" \
  -e "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  -e "AUTH_URL=${SITE_URL}" \
  -e "UPLOAD_DIR=${UPLOAD_DIR_CONTAINER}" \
  "${IMAGE_TAG}"

echo "Done. Container listening on http://localhost:${HOST_PORT}"
echo ""
echo "If this is a new hostname, restart the Cloudflare tunnel to load ingress rules:"
echo "  sudo systemctl restart cloudflared"
echo ""
echo "Public URL: ${SITE_URL}"
echo ""
echo "First-time portal setup (on host, with MySQL configured in .env):"
echo "  npm run db:deploy && npm run db:seed"
echo ""

docker logs --tail 30 "${CONTAINER_NAME}"

if [[ "${FOLLOW_LOGS}" == true ]]; then
  echo ""
  echo "Tailing logs (Ctrl+C to stop)..."
  docker logs -f "${CONTAINER_NAME}"
else
  echo ""
  echo "Follow logs: docker logs -f ${CONTAINER_NAME}"
fi
