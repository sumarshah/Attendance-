$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$env:COMPOSE_PROJECT_NAME = "attendance-final"

docker compose -f docker-compose.prod.yml --env-file .env.production down

