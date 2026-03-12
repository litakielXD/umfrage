#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/var/www/mondschule.de/public_html/umfrage}"
OWNER_USER="${OWNER_USER:-lita}"
SHARED_GROUP="${SHARED_GROUP:-www-data}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Bitte mit sudo ausfuehren: sudo $0 [PROJECT_DIR]"
  exit 1
fi

if [[ ! -d "${PROJECT_DIR}" ]]; then
  echo "Projektordner nicht gefunden: ${PROJECT_DIR}"
  exit 1
fi

echo "Setze Besitzer auf ${OWNER_USER}:${SHARED_GROUP}..."
chown -R "${OWNER_USER}:${SHARED_GROUP}" "${PROJECT_DIR}"

echo "Setze sichere Standardrechte (Dirs 2775, Files 664)..."
find "${PROJECT_DIR}" -type d -exec chmod 2775 {} +
find "${PROJECT_DIR}" -type f -exec chmod 664 {} +

echo "Mache relevante Skripte wieder ausfuehrbar..."
find "${PROJECT_DIR}" -maxdepth 1 -type f -name "*.sh" -exec chmod 775 {} +
if [[ -d "${PROJECT_DIR}/.venv" ]]; then
  find "${PROJECT_DIR}/.venv/bin" -type f -exec chmod 775 {} + || true
fi

echo "Spezialrechte fuer Laufzeitordner..."
mkdir -p "${PROJECT_DIR}/data"
chown -R "${OWNER_USER}:${SHARED_GROUP}" "${PROJECT_DIR}/data"
chmod -R 2775 "${PROJECT_DIR}/data"

if command -v setfacl >/dev/null 2>&1; then
  echo "Setze ACLs fuer ${OWNER_USER} und www-data..."
  setfacl -R -m "u:${OWNER_USER}:rwX" -m "u:www-data:rwX" "${PROJECT_DIR}"
  setfacl -R -d -m "u:${OWNER_USER}:rwX" -m "u:www-data:rwX" "${PROJECT_DIR}"
else
  echo "Hinweis: setfacl nicht installiert; ACL-Schritt uebersprungen."
fi

if id "${OWNER_USER}" >/dev/null 2>&1; then
  if id -nG "${OWNER_USER}" | tr ' ' '\n' | grep -qx "${SHARED_GROUP}"; then
    echo "${OWNER_USER} ist bereits in Gruppe ${SHARED_GROUP}."
  else
    echo "Empfehlung: ${OWNER_USER} zur Gruppe ${SHARED_GROUP} hinzufuegen:"
    echo "  sudo usermod -aG ${SHARED_GROUP} ${OWNER_USER}"
  fi
fi

echo "Fertig. Aktuelle Rechte fuer data/:"
ls -ld "${PROJECT_DIR}/data"
