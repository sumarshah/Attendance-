$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Starting Attendance System (Dev) from: $root"

# 1) Start Docker services (Postgres + Backend) on conflict-free ports.
Write-Host "Starting Docker services (postgres + backend) ..."
docker compose -f docker-compose.dev.yml up -d --build

# 2) Pick a frontend port (prefer 5173, fallback to 5174)
$port = 5173
$busy = netstat -ano | Select-String ":$port\\s"
if ($busy) { $port = 5174 }

Write-Host "Starting Frontend (Vite) on port $port ..."
Push-Location "$root\\frontend"

if (!(Test-Path ".\\node_modules")) {
  Write-Host "Installing frontend dependencies (first run) ..."
  npm install
}

$env:VITE_DEV_SERVER_PORT = "$port"
npm run dev -- --port $port

Pop-Location

