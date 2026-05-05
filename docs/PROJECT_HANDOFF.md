# RCC Attendance (Bus-To-Site) – Project Handoff

Last updated: 2026-05-04

## What This Is
Web app + API for bus-to-site employee attendance with:
- Employee, Project (geofence), Bus, Device registry, Allocation
- Attendance punch capture with:
  - Allocation required
  - Duplicate punch protection
  - Geofence validation (when project has geofence configured)

## Where The Project Lives (Final)
`D:\Time Attandnace project\attendance-system`

Main folders:
- `backend/` (NestJS + Prisma + PostgreSQL)
- `ui-shell/` (React UI)
- `docs/` (documentation)

## How To Run (Local, Docker)
From PowerShell:
```powershell
cd "D:\Time Attandnace project\attendance-system"
.\start-final.ps1
```

Stop:
```powershell
cd "D:\Time Attandnace project\attendance-system"
.\stop-final.ps1
```

Open UI:
- `http://localhost:5173`

Notes:
- UI calls API via nginx proxy under `/api/*`.
- `ui-shell/nginx.conf` is configured to prevent `index.html` caching (so UI changes show up reliably).

## Default Admin Login
Seeded from backend env (see `.env.production`):
- Email: `admin@rcc.local`
- Password: `admin123`

## Core Modules (API)
Base URL from browser: `http://localhost:5173/api`

Working endpoints:
- `GET /employees`, `POST /employees`
- `GET /projects`, `POST /projects`
- `GET /buses`, `POST /buses`
- `GET /devices`, `POST /devices`
- `GET /allocations`, `POST /allocations`
- `GET /attendance`, `POST /attendance`
- `GET /exceptions` (filters supported)
- `POST /device-attendance/punch` (device/reader style punching)
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/register` (currently public, for quick setup; should be restricted in production)

## Attendance Rules Implemented (Backend)
On punch create:
- Employee must be ACTIVE
- Project must exist
- Employee must have active allocation to Project (and Bus if provided)
- Duplicate IN/OUT blocked for the same day + same project
- OUT is blocked if no IN exists for same day + same project
- Geofence enforced if project has `latitude`, `longitude`, `geofenceRadius`

## UI Highlights (ui-shell)
- Login:
  - Enter key submits login
  - “Remember me” keeps you logged in (token persisted; password is not stored)
  - Reset password info page at `/reset-password`
- Sidebar:
  - RCC logo is clickable to Dashboard
  - Accordion sections (only one open at a time)
- Dashboard:
  - “Today” donuts + monitoring layout
  - Real-Time Monitoring list (live punches)
  - Attendance Exception chart (last 14 days, derived from `/exceptions`)
- Projects:
  - Geofence picker uses OpenStreetMap/Leaflet (no Google key needed)
- Settings:
  - User Management screen (simple UI; permissions stored in localStorage; user creation calls `/auth/register`)

## Known Gaps / Remaining Work
- `GET /corrections?status=PENDING` returns 404 (corrections module not implemented in backend). Either:
  - implement corrections endpoints, or
  - remove calls from UI if not needed.
- User Management permissions are UI-only (stored in browser localStorage). Next step is to:
  - add a real DB table for permissions
  - enforce permissions in backend (JWT roles/claims + guards) and UI routing
- Production hardening:
  - Restrict `/auth/register` to ADMIN only
  - Add password reset flow (email/OTP) if required
  - Add audit logs (who changed what)
  - Device security: enforce `x-device-key` and rotate keys

## Deployment (VPS)
Recommended approach:
- Use Docker on the VPS
- Copy the full folder `attendance-system/` to the VPS
- Set `.env.production` values (DB password, JWT secret, admin creds, allowed origins)
- Run `docker compose -f docker-compose.prod.yml up -d --build`

## Quick Troubleshooting
- UI not changing:
  - hard refresh `Ctrl+F5`
  - confirm containers running: `docker ps`
- Port busy:
  - stop old containers: `.\stop-final.ps1`
- API errors in UI:
  - ensure requests go to `/api/*` and containers are healthy

