# Production Runbook (VPS)

This runbook makes your system live using Docker.

## What You Upload To VPS
Upload the entire `attendance-handoff/` folder to your VPS.

## Start Services
From the VPS folder that contains `docker-compose.yml`:
```bash
docker compose up -d --build
docker ps
```

## URLs
- Frontend UI: `http://<VPS-IP>:8080`
- Backend API: `http://<VPS-IP>:3000`

## Secure It
1. Put Nginx in front with HTTPS (recommended).
2. Change:
   - Postgres password
   - `JWT_SECRET`
3. Firewall:
   - Allow 80/443
   - Restrict 5432 (or don't expose it at all)

## Database Migrations
Backend container runs `prisma migrate deploy` automatically at startup.

## Google Maps Geofence (Frontend)
The Projects screen can use Google Maps to pick the geofence location.

For Docker builds, the Google key must be provided at build time:
- In VPS shell, export it before build:
  - `export VITE_GOOGLE_MAPS_API_KEY="YOUR_KEY"`
- Or create a `.env` file in the same folder as `docker-compose.yml`:
  - `VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY`

Then rebuild:
```bash
docker compose up -d --build
```

## Device Punch Security (Enabled)
By default in compose we enable:
- `DEVICE_REQUIRE_NONCE=true`
- `DEVICE_TIME_WINDOW_SECONDS=300`
- `MAX_GPS_ACCURACY_METERS=60`

The bus tablet/reader must send `nonce` + `sentAt` for each punch.

## Frontend API URL (Important)
The frontend reads the backend URL from `VITE_API_URL` at build time.

For local Docker we use the default `http://localhost:3000`.
For a VPS you will typically keep:
- frontend on port 80/443 (domain)
- backend behind the same domain under `/api` (recommended)

If you later want `/api`, we will update the frontend to use `/api` and configure Nginx reverse proxy.

## CORS (8080 vs 5173)
The backend allows both by default:
- `http://localhost:5173` (dev)
- `http://localhost:8080` (final docker UI)

You can override with `FRONTEND_ORIGINS` in `docker-compose.yml`.

