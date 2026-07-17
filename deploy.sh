#!/usr/bin/env bash
set -euo pipefail

docker compose pull
docker compose up -d

docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan optimize:clear
docker compose run --rm app php artisan optimize
