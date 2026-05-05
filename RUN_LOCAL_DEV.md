# Run Locally (Permanent Dev Setup)

This project runs from **D drive** without fighting other apps (iVMS, other Docker stacks).

## One Command
Open PowerShell and run:
```powershell
cd "D:\Time Attandnace project\attendance-system"
.\start-dev.ps1
```

## What It Starts
- Postgres (Docker): `localhost:5433`
- Backend API (Docker): `http://localhost:3001`
- Frontend UI (Vite): `http://localhost:5173` (or `5174` if 5173 is busy)

The UI calls the API using `/api` (Vite proxy).

## Stop
Close the Vite window, then stop Docker services:
```powershell
cd "D:\Time Attandnace project\attendance-system"
docker compose -f docker-compose.dev.yml down
```

