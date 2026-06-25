#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="kartersanamo-site"
IMAGE_NAME="kartersanamo-site"
HOST_PORT=8001
MESSAGES_DIR="$SCRIPT_DIR/messages"

cd "$SCRIPT_DIR"

echo "==> Updating Karter Sanamo site"
echo "    Directory: $SCRIPT_DIR"
echo ""

echo "==> Stopping legacy contact handler (if running)..."
"$SCRIPT_DIR/stop-contact-server.sh" 2>/dev/null || true

echo "==> Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Removing old image..."
docker rmi -f "$IMAGE_NAME" 2>/dev/null || true

echo "==> Building image..."
docker build -t "$IMAGE_NAME" .

mkdir -p "$MESSAGES_DIR"

echo "==> Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${HOST_PORT}:80" \
  -v "${MESSAGES_DIR}:/var/lib/contact-messages" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Starting contact handler..."
"$SCRIPT_DIR/start-contact-server.sh"

echo ""
echo "Site updated successfully."
echo "  URL:      http://localhost:${HOST_PORT}"
echo "  Messages: ${MESSAGES_DIR}"
