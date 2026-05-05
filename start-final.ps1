$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Ensure we always run the same stack name (prevents collisions with other compose projects).
$env:COMPOSE_PROJECT_NAME = "attendance-final"

# Auto-pick UI port: prefer 5173, but if busy, use 5174.
$preferred = 5173
$fallback = 5174
$isBusy = netstat -ano | Select-String (":$preferred\\s")
if ($isBusy) {
  Write-Host "Port $preferred is busy on this PC. Switching UI to $fallback."
  $env:APP_PORT = "$fallback"
  $env:FRONTEND_ORIGIN = "http://localhost:$fallback"
} else {
  $env:APP_PORT = "$preferred"
  $env:FRONTEND_ORIGIN = "http://localhost:$preferred"
}

Write-Host "Starting FINAL stack from: $root"
Write-Host "UI will be on: http://localhost:$($env:APP_PORT)"

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production ps

Write-Host ""
Write-Host "Open UI:"
Write-Host "  http://localhost:$($env:APP_PORT)"
Write-Host ""
Write-Host "Geofence (Free):"
Write-Host "  Projects screen uses OpenStreetMap + 'Use current location' (no API key)."
