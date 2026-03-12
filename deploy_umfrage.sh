#!/bin/bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/#coden/umfrage}"
REMOTE_USER_HOST="${REMOTE_USER_HOST:-lita@mondschule.de}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/mondschule.de/public_html/umfrage}"
TARGET="${REMOTE_USER_HOST}:${REMOTE_PATH}"

RSYNC_DELETE_FLAG=""
if [[ "${1:-}" == "--delete" ]]; then
  RSYNC_DELETE_FLAG="--delete"
fi

rsync -av $RSYNC_DELETE_FLAG \
  --include='src/***' \
  --include='backend/***' \
  --include='index.html' \
  --include='survey.html' \
  --include='admin.html' \
  --include='styles.css' \
  --include='requirements.txt' \
  --include='umfrage.service' \
  --include='nginx-umfrage-api.conf.example' \
  --include='.env.example' \
  --include='README.md' \
  --exclude='data/*.db' \
  --exclude='data/*.sqlite' \
  --exclude='data/*.sqlite3' \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='.venv/' \
  --exclude='*~' \
  "$PROJECT_DIR"/ "$TARGET"

echo "Deployment abgeschlossen: https://mondschule.de/umfrage/"
