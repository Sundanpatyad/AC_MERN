#!/usr/bin/env bash
# Manual deploy on the Oracle VM (same steps as GitHub Actions).
# Usage (on the VM):
#   bash scripts/deploy-api.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pull backend/cicd"
git fetch origin backend/cicd
git checkout backend/cicd
git pull --ff-only origin backend/cicd

echo "==> Install + restart"
cd api
npm ci --omit=dev
pm2 restart ac-api --update-env || pm2 start server.js --name ac-api
pm2 save

echo "==> Health"
sleep 2
curl -fsS http://127.0.0.1:8000/ | head -c 200
echo
echo "==> Done"
