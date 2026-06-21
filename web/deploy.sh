#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

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

# NEXT_PUBLIC_* must be present at docker build time (inlined into the client bundle)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="$(read_env_var NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || true)"
NEXT_PUBLIC_MAPBOX_STYLE="$(read_env_var NEXT_PUBLIC_MAPBOX_STYLE || true)"
NEXT_PUBLIC_SITE_URL="$(read_env_var NEXT_PUBLIC_SITE_URL || true)"

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://jm.kartersanamo.com}"
CONTAINER_NAME="jm-rentals"
IMAGE_TAG="jm-rentals:latest"
HOST_PORT=8004

echo "Building ${IMAGE_TAG}..."
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
docker build -t "${IMAGE_TAG}" \
  --build-arg "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:-}" \
  --build-arg "NEXT_PUBLIC_MAPBOX_STYLE=${NEXT_PUBLIC_MAPBOX_STYLE:-mapbox://styles/mapbox/streets-v12}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  .

ENV_FILE_ARGS=()
if [[ -f .env ]]; then
  ENV_FILE_ARGS=(--env-file .env)
elif [[ -f .env.local ]]; then
  ENV_FILE_ARGS=(--env-file .env.local)
fi

echo "Starting container on port ${HOST_PORT} (host network — uses DATABASE_URL from .env as-is)..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --network host \
  "${ENV_FILE_ARGS[@]}" \
  -e HOSTNAME=0.0.0.0 \
  -e "PORT=${HOST_PORT}" \
  -e "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  -e "AUTH_URL=${SITE_URL}" \
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
echo "Tailing logs (Ctrl+C to stop)..."
docker logs -f --tail 100 "${CONTAINER_NAME}"
