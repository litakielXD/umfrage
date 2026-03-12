#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-178.254.6.104}"
REMOTE_USER="${REMOTE_USER:-lita}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_BASE="${REMOTE_BASE:-/var/www/mondschule.de/public_html}"
REMOTE_PATH="${REMOTE_PATH:-umfrage}"

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BASE}/${REMOTE_PATH}/"

echo "Deploying ${SRC_DIR} -> ${TARGET}"

rsync -avz --delete \
  --exclude ".git/" \
  --exclude ".venv/" \
  --exclude "venv/" \
  --exclude "__pycache__/" \
  --exclude ".DS_Store" \
  --exclude "*.code-workspace" \
  --exclude ".env" \
  --exclude ".env.local" \
  -e "ssh -p ${REMOTE_PORT}" \
  "${SRC_DIR}/" "${TARGET}"

echo "Done."
