#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://jm.kartersanamo.com}"
CONTAINER_NAME="jm-rentals"
IMAGE_TAG="jm-rentals:latest"
HOST_PORT=8004

echo "Building ${IMAGE_TAG}..."
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
docker build -t "${IMAGE_TAG}" .

ENV_FILE_ARGS=()
if [[ -f .env.local ]]; then
  ENV_FILE_ARGS=(--env-file .env.local)
fi

echo "Starting container on port ${HOST_PORT}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:3000" \
  "${ENV_FILE_ARGS[@]}" \
  -e HOSTNAME=0.0.0.0 \
  -e PORT=3000 \
  -e "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  "${IMAGE_TAG}"

echo "Done. Container listening on http://localhost:${HOST_PORT}"
echo ""
echo "If this is a new hostname, restart the Cloudflare tunnel to load ingress rules:"
echo "  sudo systemctl restart cloudflared"
echo ""
echo "Public URL: ${SITE_URL}"
