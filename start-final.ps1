$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Ensure we always run the same stack name (prevents collisions with other compose projects).
$env:COMPOSE_PROJECT_NAME = "attendance-final"

function Get-EnvValueFromFile([string]$path, [string]$key) {
  if (!(Test-Path -LiteralPath $path)) { return $null }
  $line = Get-Content -LiteralPath $path | Where-Object { $_ -match ("^" + [regex]::Escape($key) + "=") } | Select-Object -Last 1
  if (!$line) { return $null }
  return ($line -split "=", 2)[1].Trim()
}

function Assert-NotPlaceholder([string]$name, [string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Error "$name is missing in .env.production. Set it before starting containers."
    exit 1
  }

  $v = $value.Trim()
  $isPlaceholder =
    $v -match "^__REQUIRED_" -or
    $v -match "^__SET_" -or
    $v -eq "change-this-in-production" -or
    $v -eq "dev-secret-change-me"

  if ($isPlaceholder) {
    Write-Error "$name is still a placeholder in .env.production. Set a strong real value before starting containers."
    exit 1
  }
}

# Safety checks (prevents starting with placeholder secrets).
$envFile = Join-Path $root ".env.production"
$jwt = Get-EnvValueFromFile $envFile "JWT_SECRET"
$adminPass = Get-EnvValueFromFile $envFile "ADMIN_PASSWORD"
Assert-NotPlaceholder "JWT_SECRET" $jwt
Assert-NotPlaceholder "ADMIN_PASSWORD" $adminPass

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
